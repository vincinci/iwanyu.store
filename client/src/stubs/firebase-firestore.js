'use client';

// Firebase Firestore Stub
export function getFirestore() {
  return {
    collection: () => ({
      doc: () => ({
        get: () => Promise.resolve({
          exists: true,
          data: () => ({}),
          id: 'stub-doc-id'
        }),
        set: () => Promise.resolve(),
        update: () => Promise.resolve()
      }),
      add: () => Promise.resolve({ id: 'stub-doc-id' }),
      where: () => ({
        get: () => Promise.resolve({
          empty: false,
          docs: [
            {
              exists: true,
              data: () => ({}),
              id: 'stub-doc-id'
            }
          ]
        })
      })
    })
  };
}

export function doc() {
  return {
    get: () => Promise.resolve({
      exists: true,
      data: () => ({}),
      id: 'stub-doc-id'
    })
  };
}

export function getDoc() {
  return Promise.resolve({
    exists: () => true,
    data: () => ({}),
    id: 'stub-doc-id'
  });
}

export function setDoc() {
  return Promise.resolve();
}

export function updateDoc() {
  return Promise.resolve();
}

export function collection() {
  return {
    doc: () => ({
      get: () => Promise.resolve({
        exists: true,
        data: () => ({}),
        id: 'stub-doc-id'
      })
    })
  };
}

export default {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection
};
