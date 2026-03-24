process.env.GOOGLE_CLOUD_PROJECT = 'wc-app-alpha';

const { onDocumentUpdated, onDocumentCreated } = require('firebase-functions/v2/firestore');
const { onCall } = require('firebase-functions/v2/https');
const { defineSecret } = require('firebase-functions/params');
const { initializeApp, applicationDefault } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { getMessaging } = require('firebase-admin/messaging');
const Anthropic = require('@anthropic-ai/sdk');

const anthropicKey = defineSecret('ANTHROPIC_API_KEY');

initializeApp({
  credential: applicationDefault(),
  projectId: 'wc-app-alpha'
});

// Triggered by client writing to notifications/{notifId} — sends push then deletes the doc.
// No direct HTTP call from client = no CORS issues.
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

  // Delete the notification request after sending
  await event.data.ref.delete();

  return null;
});

// Triggered when a rep redeems an invite — notifies the manager directly via FCM
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
        title: '🎉 New Rep Joined',
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

// AI Brain trainer — callable from client, proxies to Claude API
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
