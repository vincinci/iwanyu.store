'use client';

// Firebase Auth Stub
export function getAuth() {
  return {
    currentUser: null,
    onAuthStateChanged: (callback) => {
      callback(null);
      return () => {};
    },
    signOut: () => Promise.resolve()
  };
}

export function signInWithEmailAndPassword() {
  return Promise.resolve({
    user: {
      uid: 'stub-user-id',
      email: 'stub@example.com',
      getIdToken: () => Promise.resolve('stub-token')
    }
  });
}

export function createUserWithEmailAndPassword() {
  return Promise.resolve({
    user: {
      uid: 'stub-user-id',
      email: 'stub@example.com',
      getIdToken: () => Promise.resolve('stub-token')
    }
  });
}

export function getIdToken() {
  return Promise.resolve('stub-token');
}

export function onAuthStateChanged(auth, callback) {
  callback(null);
  return () => {};
}

export function signInWithCustomToken() {
  return Promise.resolve({
    user: {
      uid: 'stub-user-id',
      email: 'stub@example.com',
      getIdToken: () => Promise.resolve('stub-token')
    }
  });
}

export function signOut() {
  return Promise.resolve();
}

// Alias for signOut to match import in AuthContext
export const firebaseSignOut = signOut;

export default {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  getIdToken,
  onAuthStateChanged,
  signInWithCustomToken,
  signOut,
  firebaseSignOut
};
