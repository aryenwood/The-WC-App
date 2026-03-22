importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyAmteFppQ6c5f4DWcTk0S0ZWopQ3d5oqMs",
  authDomain: "wc-app-alpha.firebaseapp.com",
  projectId: "wc-app-alpha",
  storageBucket: "wc-app-alpha.firebasestorage.app",
  messagingSenderId: "932560435629",
  appId: "1:932560435629:web:30bebca383c94811638924"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  console.log('[FCM] Background message received:', payload);
  const notificationTitle = payload.notification?.title || 'WC App';
  const notificationOptions = {
    body: payload.notification?.body || '',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-96.png',
    data: payload.data || {}
  };
  self.registration.showNotification(notificationTitle, notificationOptions);
});
