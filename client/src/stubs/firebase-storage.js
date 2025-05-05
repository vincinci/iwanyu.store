'use client';

// Firebase Storage Stub
export function getStorage() {
  return {
    ref: () => ({
      put: () => Promise.resolve({
        ref: {
          getDownloadURL: () => Promise.resolve('https://example.com/stub-image.jpg')
        }
      }),
      delete: () => Promise.resolve()
    })
  };
}

export function ref() {
  return {
    put: () => Promise.resolve({
      ref: {
        getDownloadURL: () => Promise.resolve('https://example.com/stub-image.jpg')
      }
    }),
    delete: () => Promise.resolve()
  };
}

export function uploadBytesResumable() {
  return {
    on: (event, callback) => {
      if (event === 'state_changed') {
        callback({ bytesTransferred: 100, totalBytes: 100 });
      }
      return { then: (callback) => callback() };
    }
  };
}

export function getDownloadURL() {
  return Promise.resolve('https://example.com/stub-image.jpg');
}

export default {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL
};
