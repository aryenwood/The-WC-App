---
name: firebase-functions
description: "Firebase Cloud Functions and Cloud Run patterns - API routing, CORS, webhooks, and secure third-party API proxying. Use this skill for ALL server-side Firebase work."
---

# Firebase Functions Skill

## Project Structure

```
The-WC-App/
  functions/
    index.js           ← All Cloud Functions (Gen 2)
    package.json       ← Dependencies: firebase-functions, firebase-admin, @anthropic-ai/sdk, cors
    .gitignore
  firebase.json        ← Functions source config
  .firebaserc          ← Project: wc-app-alpha
```

## SDK Init (Admin Side)

```js
process.env.GOOGLE_CLOUD_PROJECT = 'wc-app-alpha';

const { onDocumentUpdated, onDocumentCreated } = require('firebase-functions/v2/firestore');
const { onCall, onRequest } = require('firebase-functions/v2/https');
const { defineSecret } = require('firebase-functions/params');
const { initializeApp, applicationDefault } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { getMessaging } = require('firebase-admin/messaging');

initializeApp({
  credential: applicationDefault(),
  projectId: 'wc-app-alpha'
});
```

## CORS Setup

For callable functions (`onCall`), CORS is handled by the SDK — just pass allowed origins:

```js
exports.myCallable = onCall({
  cors: [
    'https://cptlenergy.netlify.app',
    'https://testcptlapp.netlify.app',
    'https://tritonenergy.netlify.app',
    'http://localhost'
  ],
  invoker: 'public'
}, async (request) => {
  // request.auth is automatically populated if user is signed in
  // request.data contains the payload
});
```

For HTTP functions (`onRequest`), use the `cors` npm package:

```js
const cors = require('cors')({
  origin: [
    'https://cptlenergy.netlify.app',
    'https://testcptlapp.netlify.app',
    'http://localhost'
  ]
});

exports.myEndpoint = onRequest((req, res) => {
  cors(req, res, async () => {
    // Handle request
    res.json({ ok: true });
  });
});
```

## Anthropic Claude API Proxy

The WC App proxies Claude API calls through Firebase Functions to keep the API key server-side:

```js
const Anthropic = require('@anthropic-ai/sdk');
const anthropicKey = defineSecret('ANTHROPIC_API_KEY');

exports.wcAiChat = onCall({
  secrets: [anthropicKey],
  cors: [
    'https://cptlenergy.netlify.app',
    'https://testcptlapp.netlify.app',
    'https://tritonenergy.netlify.app',
    'http://localhost'
  ],
  invoker: 'public'
}, async (request) => {
  const { messages, system } = request.data;

  if (!Array.isArray(messages) || messages.length === 0) {
    throw new Error('messages array required');
  }

  const client = new Anthropic({ apiKey: anthropicKey.value() });

  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    system: system || '',
    messages: messages
  });

  const reply = response.content[0]?.text || '';
  return { reply };
});
```

### Client-Side Call

```js
import { getFunctions, httpsCallable } from "firebase/functions";

const functions = getFunctions();
const aiChat = httpsCallable(functions, 'wcAiChat');

const result = await aiChat({
  system: "You are a helpful D2D sales coach.",
  messages: [{ role: "user", content: "How do I handle a 'not interested' objection?" }]
});
console.log(result.data.reply);
```

## Auth Verification Helper

For `onRequest` functions that need auth:

```js
const { getAuth } = require('firebase-admin/auth');

async function verifyAuth(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Unauthorized');
  }
  const token = authHeader.split('Bearer ')[1];
  return getAuth().verifyIdToken(token);
}

exports.secureEndpoint = onRequest(async (req, res) => {
  cors(req, res, async () => {
    try {
      const decoded = await verifyAuth(req);
      const uid = decoded.uid;
      // Now you have the authenticated user's UID
      res.json({ uid, status: 'ok' });
    } catch (err) {
      res.status(401).json({ error: 'Unauthorized' });
    }
  });
});
```

## GHL Webhook Handler

For receiving webhooks from GoHighLevel (GHL) CRM:

```js
exports.ghlWebhook = onRequest(async (req, res) => {
  // GHL sends POST with JSON body
  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  const payload = req.body;
  const { contact_id, event, location_id } = payload;

  const db = getFirestore();

  // Map GHL event to door status update
  if (event === 'appointment.scheduled') {
    // Find door by GHL contact_id, update status
    const doorsQuery = await db.collectionGroup('doors')
      .where('ghlContactId', '==', contact_id)
      .limit(1)
      .get();

    if (!doorsQuery.empty) {
      await doorsQuery.docs[0].ref.update({
        status: 'scheduled',
        ghlEvent: event,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }
  }

  res.status(200).json({ received: true });
});
```

## Firestore-Triggered Functions

```js
// Triggered when a new notification doc is created — sends FCM push then deletes the doc
exports.wcProcessNotification = onDocumentCreated('notifications/{notifId}', async (event) => {
  const data = event.data.data();
  const { targetUid, title, body, notifData } = data;

  const db = getFirestore();
  const userDoc = await db.collection('users').doc(targetUid).get();
  if (!userDoc.exists) return null;

  const fcmToken = userDoc.data().fcmToken;
  if (!fcmToken) return null;

  const message = {
    token: fcmToken,
    notification: { title, body },
    data: notifData || {},
    webpush: {
      fcmOptions: { link: 'https://cptlenergy.netlify.app' }
    }
  };

  await getMessaging().send(message);
  await event.data.ref.delete();
  return null;
});

// Triggered when invite is redeemed — notify the org admin
exports.wcInviteRedeemed = onDocumentUpdated('invites/{code}', async (event) => {
  const before = event.data.before.data();
  const after = event.data.after.data();

  if (before.used === false && after.used === true) {
    const db = getFirestore();
    const orgId = after.orgId;
    const usedByUid = after.usedBy;

    const repDoc = await db.collection('users').doc(usedByUid).get();
    const repName = repDoc.exists ? repDoc.data().name : 'A new rep';
    const role = after.role || 'canvasser';

    const managerDoc = await db.collection('users').doc(orgId).get();
    if (!managerDoc.exists) return null;

    const fcmToken = managerDoc.data().fcmToken;
    if (!fcmToken) return null;

    const message = {
      token: fcmToken,
      notification: {
        title: 'New Rep Joined',
        body: `${repName} just joined your team as ${role}`,
      },
      webpush: {
        fcmOptions: { link: 'https://cptlenergy.netlify.app' }
      }
    };

    return getMessaging().send(message);
  }
  return null;
});
```

## Secrets Management

```bash
# Set a secret
firebase functions:secrets:set ANTHROPIC_API_KEY

# List secrets
firebase functions:secrets:list

# Access in code
const anthropicKey = defineSecret('ANTHROPIC_API_KEY');

# Must declare in function options
exports.fn = onCall({ secrets: [anthropicKey] }, async (req) => {
  const value = anthropicKey.value();
});
```

## Deploy Commands

```bash
# Deploy all functions
firebase deploy --only functions

# Deploy a specific function
firebase deploy --only functions:wcAiChat

# View logs
firebase functions:log

# View logs for specific function
firebase functions:log --only wcAiChat

# Emulate locally
firebase emulators:start --only functions
```

## Cloud Run IAM Fix

Gen 2 functions run on Cloud Run. If you get 403 errors from callable functions, the invoker must be set to `allUsers`:

```bash
# Fix: allow unauthenticated invocation (CORS + Firebase Auth handle real auth)
gcloud run services add-iam-policy-binding wcaichat \
  --region=us-central1 \
  --member="allUsers" \
  --role="roles/run.invoker" \
  --project=wc-app-alpha
```

Or set `invoker: 'public'` in the function options (preferred):

```js
exports.wcAiChat = onCall({
  invoker: 'public',  // This sets allUsers on Cloud Run
  // ...
}, handler);
```

## Environment Variables

```bash
# Set env vars (non-secret config)
firebase functions:config:set ghl.api_key="xxx" ghl.location_id="yyy"

# Access in code (Gen 2 — use process.env or defineString)
const { defineString } = require('firebase-functions/params');
const ghlLocationId = defineString('GHL_LOCATION_ID');
```

## Common Gotchas

1. **Gen 2 functions use Cloud Run** — cold starts are ~2-5s. Keep functions warm for critical paths or accept the latency.

2. **`invoker: 'public'`** is required for callable functions accessed from browsers — otherwise Cloud Run returns 403 before Firebase Auth can validate the token.

3. **Secrets must be declared in function options** — you cannot access `anthropicKey.value()` outside of a function that declares it in `secrets: [anthropicKey]`.

4. **`onCall` auto-parses auth** — `request.auth` is populated automatically if the client sends an auth token. No need for manual token verification.

5. **Deploy single functions** to avoid redeploying everything: `firebase deploy --only functions:functionName`.

6. **`process.env.GOOGLE_CLOUD_PROJECT`** must be set at the top of index.js for the Admin SDK to find the project in production.
