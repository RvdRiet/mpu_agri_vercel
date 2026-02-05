# Firebase setup and GitHub deploy

## 1. Firebase config (Auth + Firestore)

1. [Firebase Console](https://console.firebase.google.com/) → your project (or create one).
2. **Project settings** (gear) → **Your apps** → **Add app** → **Web** → copy the `firebaseConfig` object.
3. In **js/firebase-config.js**, replace the placeholder values with your config:
   - `apiKey`, `authDomain`, `projectId`, `storageBucket`, `messagingSenderId`, `appId`
4. **Authentication**: Build → Authentication → Get started → **Sign-in method** → enable **Email/Password**.
5. **Firestore**: Build → Firestore Database → **Create database** → choose location → **Start in test mode** (then deploy `firestore.rules` to lock it down).

## 2. Hosting project

1. In **.firebaserc**, set `"default"` to your Firebase **project ID** (same as in `firebaseConfig.projectId`).
2. Deploy once from your machine:
   ```bash
   npx firebase login
   npx firebase deploy
   ```
   Your site will be at `https://YOUR_PROJECT_ID.web.app` (and `https://YOUR_PROJECT_ID.firebaseapp.com`).

## 3. Deploy on push to GitHub

1. Generate a CI token (one-time):
   ```bash
   npx firebase login:ci
   ```
   Copy the long token it prints.

2. In your **GitHub repo**: **Settings** → **Secrets and variables** → **Actions** → **New repository secret**:
   - Name: `FIREBASE_TOKEN`
   - Value: paste the token from step 1.

3. Push to the `main` (or `master`) branch. The workflow in **.github/workflows/firebase-deploy.yml** will run and deploy **Hosting** and **Firestore rules** to Firebase.

## Security

- Do **not** commit real API keys if the repo is public. Use placeholders and set real values in Firebase Console / env or a private repo.
- After creating Firestore, deploy the included **firestore.rules** so only authenticated users can read/write their own data.
