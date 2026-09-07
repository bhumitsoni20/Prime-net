import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signInWithPhoneNumber,
  RecaptchaVerifier,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';
import { auth } from './config';

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Email Authentication
export const signUpWithEmail = async (email, password, displayName) => {
  if (!auth) throw new Error('Firebase not configured');
  const result = await createUserWithEmailAndPassword(auth, email, password);
  if (displayName) {
    await updateProfile(result.user, { displayName });
  }
  return result.user;
};

export const signInWithEmail = async (email, password) => {
  if (!auth) throw new Error('Firebase not configured');
  const result = await signInWithEmailAndPassword(auth, email, password);
  return result.user;
};

// Google Authentication
export const signInWithGoogle = async () => {
  if (!auth) throw new Error('Firebase not configured');
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    if (
      error.code === 'auth/popup-closed-by-user' ||
      error.code === 'auth/cancelled-popup-request' ||
      error.code === 'auth/user-cancelled'
    ) {
      return null;
    }
    throw error;
  }
};

// Phone OTP Authentication
export const setupRecaptcha = (containerId) => {
  if (!auth) throw new Error('Firebase not configured');
  const verifier = new RecaptchaVerifier(auth, containerId, {
    size: 'invisible',
  });
  return verifier;
};

export const sendOTP = async (phoneNumber, recaptchaVerifier) => {
  if (!auth) throw new Error('Firebase not configured');
  const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
  return confirmationResult;
};

export const verifyOTP = async (confirmationResult, otp) => {
  const result = await confirmationResult.confirm(otp);
  return result.user;
};

// Sign Out
export const signOut = async () => {
  if (!auth) return;
  await firebaseSignOut(auth);
};

// Auth State Observer
export const onAuthChange = (callback) => {
  if (!auth) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
};

// Get ID Token
export const getIdToken = async () => {
  if (!auth) return null;
  const user = auth.currentUser;
  if (user) {
    return await user.getIdToken();
  }
  return null;
};
