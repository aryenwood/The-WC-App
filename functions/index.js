const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

// Send push notification to a specific user by uid
exports.sendPushNotification = functions.https.onCall(async (data, context) => {
  // Auth check
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be signed in');
  }

  const { targetUid, title, body, data: notifData } = data;

  if (!targetUid || !title || !body) {
    throw new functions.https.HttpsError('invalid-argument', 'Missing required fields');
  }

  // Get target user's FCM token
  const userDoc = await admin.firestore().collection('users').doc(targetUid).get();
  if (!userDoc.exists) {
    throw new functions.https.HttpsError('not-found', 'Target user not found');
  }

  const fcmToken = userDoc.data().fcmToken;
  if (!fcmToken) {
    console.log(`[FCM] No token for user ${targetUid}`);
    return { success: false, reason: 'no_token' };
  }

  // Send the notification
  const message = {
    token: fcmToken,
    notification: {
      title,
      body,
    },
    data: notifData || {},
    webpush: {
      fcmOptions: {
        link: 'https://cptlenergy.netlify.app'
      }
    }
  };

  try {
    const response = await admin.messaging().send(message);
    console.log(`[FCM] Notification sent to ${targetUid}:`, response);
    return { success: true, messageId: response };
  } catch (err) {
    console.error(`[FCM] Send failed:`, err);
    throw new functions.https.HttpsError('internal', err.message);
  }
});

// Triggered when a rep redeems an invite -- notifies the manager
exports.onInviteRedeemed = functions.firestore
  .document('invites/{code}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();

    // Only fire when invite goes from unused to used
    if (before.used === false && after.used === true) {
      const orgId = after.orgId;
      const usedByUid = after.usedBy;

      // Get rep name
      const repDoc = await admin.firestore().collection('users').doc(usedByUid).get();
      const repName = repDoc.exists ? repDoc.data().name : 'A new rep';
      const role = after.role || 'canvasser';

      // Get manager FCM token
      const managerDoc = await admin.firestore().collection('users').doc(orgId).get();
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
          fcmOptions: {
            link: 'https://cptlenergy.netlify.app'
          }
        }
      };

      return admin.messaging().send(message);
    }
    return null;
  });
