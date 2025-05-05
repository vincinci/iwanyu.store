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

export default {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  getIdToken
};
