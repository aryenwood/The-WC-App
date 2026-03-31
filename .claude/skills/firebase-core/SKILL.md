---
name: firebase-core
description: "Firebase Firestore and Auth patterns for the WC App multi-tenant architecture. Use this skill for ALL Firebase work: Firestore queries, real-time listeners, multi-tenant org data separation, role-based access (super admin / org admin / rep), user invite flows, security rules, and offline persistence."
---

# Firebase Core Skill

## Project Structure

```
The-WC-App/
  index.html          ← Single-page PWA (all client code)
  firebase.json       ← Functions config
  .firebaserc          ← Project alias: wc-app-alpha
  functions/
    index.js           ← Cloud Functions (v2)
    package.json
```

- Firebase project: **wc-app-alpha**
- Hosting: Netlify (cptlenergy.netlify.app) — NOT Firebase Hosting
- Functions: Firebase Cloud Functions (Gen 2 / Cloud Run)

## SDK Initialization with Offline Persistence

```js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getFirestore, enableIndexedDbPersistence } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";

const app = initializeApp({
  apiKey: "...",
  authDomain: "wc-app-alpha.firebaseapp.com",
  projectId: "wc-app-alpha",
  storageBucket: "wc-app-alpha.appspot.com",
  messagingSenderId: "...",
  appId: "..."
});

const db = getFirestore(app);
const auth = getAuth(app);

// Enable offline persistence — MUST be called before any Firestore reads
enableIndexedDbPersistence(db).catch(err => {
  if (err.code === 'failed-precondition') {
    console.warn('Persistence failed: multiple tabs open');
  } else if (err.code === 'unimplemented') {
    console.warn('Persistence not supported in this browser');
  }
});
```

## Firestore Data Model

### Collections

```
users/{uid}
  - name: string
  - email: string
  - role: "super_admin" | "org_admin" | "canvasser" | "closer"
  - orgId: string (uid of org admin who owns this org)
  - fcmToken: string (for push notifications)
  - createdAt: timestamp

orgs/{orgId}
  - name: string
  - ownerId: string (uid)
  - createdAt: timestamp

orgs/{orgId}/doors/{doorId}
  - address: string
  - lat: number
  - lng: number
  - status: "not_home" | "pitched" | "scheduled" | "closed" | "not_interested"
  - repId: string (uid of rep who knocked)
  - repName: string
  - notes: string
  - createdAt: timestamp
  - updatedAt: timestamp

orgs/{orgId}/appointments/{apptId}
  - doorId: string
  - repId: string
  - scheduledAt: timestamp
  - status: "pending" | "confirmed" | "completed" | "cancelled"

invites/{code}
  - orgId: string
  - role: "canvasser" | "closer"
  - used: boolean
  - usedBy: string | null
  - createdAt: timestamp

notifications/{notifId}
  - targetUid: string
  - title: string
  - body: string
  - notifData: map
```

## Org Data Pattern — Multi-Tenant Isolation

All org-scoped data lives under `orgs/{orgId}/...`. The orgId is the UID of the org admin who created the organization.

```js
// Get current user's org
async function getUserOrg(uid) {
  const userDoc = await getDoc(doc(db, "users", uid));
  const data = userDoc.data();
  // org_admin's orgId IS their own uid
  // rep's orgId is the admin who invited them
  return data.role === "org_admin" ? uid : data.orgId;
}

// Query doors for an org
async function getOrgDoors(orgId) {
  const q = query(
    collection(db, "orgs", orgId, "doors"),
    orderBy("createdAt", "desc"),
    limit(100)
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}
```

## Role System

| Role | Description | Access |
|------|-------------|--------|
| `super_admin` | Platform owner (Aryen) | All orgs, all data, admin panel |
| `org_admin` | Organization manager | Own org data, invite reps, view all rep activity |
| `canvasser` | Door-to-door rep | Log doors, view own activity within assigned org |
| `closer` | Senior rep / closer | Log doors + close deals, view team stats |

```js
function checkRole(userData, requiredRole) {
  const hierarchy = { super_admin: 4, org_admin: 3, closer: 2, canvasser: 1 };
  return hierarchy[userData.role] >= hierarchy[requiredRole];
}
```

## Door Records with Real-Time Listeners

```js
// Real-time listener on org doors
function listenToOrgDoors(orgId, callback) {
  const q = query(
    collection(db, "orgs", orgId, "doors"),
    orderBy("updatedAt", "desc"),
    limit(200)
  );
  return onSnapshot(q, (snapshot) => {
    const doors = [];
    snapshot.forEach(doc => doors.push({ id: doc.id, ...doc.data() }));
    callback(doors);
  }, (error) => {
    console.error("Door listener error:", error);
  });
}

// Add a door
async function addDoor(orgId, doorData) {
  const ref = collection(db, "orgs", orgId, "doors");
  return addDoc(ref, {
    ...doorData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
}

// Update door status
async function updateDoor(orgId, doorId, updates) {
  const ref = doc(db, "orgs", orgId, "doors", doorId);
  return updateDoc(ref, {
    ...updates,
    updatedAt: serverTimestamp()
  });
}
```

## Rep Invite Flow

1. Org admin generates an invite code (random 6-char alphanumeric)
2. Code is written to `invites/{code}` with `used: false`
3. Rep opens app, enters code on signup screen
4. Client validates code exists and is unused
5. Client creates auth account, writes to `users/{uid}` with orgId from invite
6. Client sets `invites/{code}.used = true` and `usedBy = uid`
7. Cloud Function `wcInviteRedeemed` fires, sends push notification to org admin

```js
// Generate invite (org admin side)
async function createInvite(orgId, role = "canvasser") {
  const code = Math.random().toString(36).substring(2, 8).toUpperCase();
  await setDoc(doc(db, "invites", code), {
    orgId,
    role,
    used: false,
    usedBy: null,
    createdAt: serverTimestamp()
  });
  return code;
}

// Redeem invite (rep side)
async function redeemInvite(code, uid) {
  const inviteRef = doc(db, "invites", code);
  const inviteSnap = await getDoc(inviteRef);
  if (!inviteSnap.exists() || inviteSnap.data().used) {
    throw new Error("Invalid or used invite code");
  }
  const { orgId, role } = inviteSnap.data();

  // Write user record
  await setDoc(doc(db, "users", uid), {
    orgId,
    role,
    createdAt: serverTimestamp()
  }, { merge: true });

  // Mark invite as used
  await updateDoc(inviteRef, { used: true, usedBy: uid });

  return { orgId, role };
}
```

## Security Rules Pattern

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Users can read/write their own profile
    match /users/{uid} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
      allow read: if request.auth != null &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'super_admin';
    }

    // Org data — only org members can access
    match /orgs/{orgId}/{document=**} {
      allow read, write: if request.auth != null && (
        request.auth.uid == orgId ||
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.orgId == orgId ||
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'super_admin'
      );
    }

    // Invites — anyone authenticated can read (to validate), only org admins create
    match /invites/{code} {
      allow read: if request.auth != null;
      allow create: if request.auth != null &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['org_admin', 'super_admin'];
      allow update: if request.auth != null && resource.data.used == false;
    }

    // Notifications — write-only trigger docs
    match /notifications/{notifId} {
      allow create: if request.auth != null;
      allow read, delete: if false; // Only Cloud Functions read/delete
    }
  }
}
```

## Auth Patterns

```js
// Google sign-in
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";

async function signInWithGoogle() {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  return result.user;
}

// Auth state observer
onAuthStateChanged(auth, (user) => {
  if (user) {
    // User signed in — load their org data
    initApp(user.uid);
  } else {
    // User signed out — show login screen
    showLoginScreen();
  }
});

// Get current user's ID token for Cloud Function calls
async function getIdToken() {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");
  return user.getIdToken();
}
```

## Common Gotchas

1. **Persistence must be enabled before first read** — call `enableIndexedDbPersistence()` immediately after `getFirestore()`.

2. **serverTimestamp() returns null in onSnapshot** — the local cache hasn't received the server value yet. Use `{ serverTimestamps: 'estimate' }` in snapshot options or handle null gracefully.

3. **orgId for org_admin IS their uid** — do not create a separate orgId for admins. Their user UID doubles as the org identifier.

4. **Firestore reads in security rules are expensive** — each `get()` in a rule counts as a read. Cache user role on the client and only rely on rules as a safety net.

5. **onSnapshot listeners must be unsubscribed** — store the unsubscribe function and call it when switching tabs/views or on logout.

6. **Composite indexes** — queries with multiple `where` + `orderBy` require composite indexes. Firestore will log an error with a direct link to create the index in the console.

7. **Offline writes queue silently** — writes made offline will queue and sync when connectivity returns. Do NOT show error toasts for offline writes; show a subtle "offline" indicator instead.
