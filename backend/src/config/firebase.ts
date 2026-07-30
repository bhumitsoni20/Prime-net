import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getMessaging } from 'firebase-admin/messaging';
import { env } from './env';

if (!getApps().length) {
  // Robust private key formatting for production deployment platforms (Vercel, Render, Heroku etc)
  const formattedPrivateKey = env.FIREBASE_PRIVATE_KEY
    ? env.FIREBASE_PRIVATE_KEY
        .replace(/\\n/g, '\n') // Handle escaped newlines
        .replace(/"/g, '')     // Remove any wrapping or internal quotes
        .trim()
    : '';

  initializeApp({
    credential: cert({
      projectId: env.FIREBASE_PROJECT_ID,
      clientEmail: env.FIREBASE_CLIENT_EMAIL,
      privateKey: formattedPrivateKey,
    }),
  });
}

export const firebaseAuth = getAuth();
export const firebaseMessaging = getMessaging();
