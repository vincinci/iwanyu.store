'use client';

// Firebase Analytics Stub
export function getAnalytics() {
  console.log('Firebase Analytics stub initialized');
  return {};
}

export function isSupported() {
  return Promise.resolve(false);
}

export function logEvent() {
  console.log('Firebase Analytics stub: logEvent called');
}

export default {
  getAnalytics,
  isSupported,
  logEvent
};
