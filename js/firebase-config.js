/**
 * Firebase config: Auth + Firestore.
 * Replace the placeholder values with your project's config from Firebase Console.
 *
 * SETUP:
 * 1. Firebase Console → Project settings (gear) → Your apps → Add app / Web (</>) → Copy firebaseConfig.
 * 2. Authentication: Build → Authentication → Get started → Sign-in method → Enable "Email/Password".
 *    (App uses SA ID as email, e.g. 9001015001087@farm.local)
 * 3. Firestore: Build → Firestore Database → Create database → Start in test mode (then lock with rules).
 * 4. For GitHub deploy: Run `npx firebase login:ci` locally, add the token as GitHub secret FIREBASE_TOKEN.
 */
(function (global) {
  'use strict';

  var firebaseConfig = {
    apiKey: 'AIzaSyDRdYJndZne4jN_Z7TyfK3C-dvm6SFpfEg',
    authDomain: 'farm-management-35799.firebaseapp.com',
    projectId: 'farm-management-35799',
    storageBucket: 'farm-management-35799.firebasestorage.app',
    messagingSenderId: '506719021863',
    appId: '1:506719021863:web:c9c317215a7e79b999d702',
    measurementId: 'G-R77GMZ40DK'
  };

  var isConfigured = true;

  if (typeof firebase !== 'undefined' && isConfigured) {
    try {
      firebase.initializeApp(firebaseConfig);
      global.firebaseAuth = firebase.auth();

      // Firestore: only available if you include firebase-firestore-compat.js before this file
      if (typeof firebase.firestore === 'function') {
        global.firebaseDb = firebase.firestore();
      } else {
        global.firebaseDb = null;
      }
    } catch (e) {
      console.warn('Firebase init failed', e);
      global.firebaseAuth = null;
      global.firebaseDb = null;
    }
  } else {
    global.firebaseAuth = null;
    global.firebaseDb = null;
  }
})(typeof window !== 'undefined' ? window : this);
