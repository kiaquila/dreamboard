const DB_NAME = "dreamboard";
const DB_VERSION = 1;
const STORE_NAME = "drafts";
const RECORD_KEY = "current";
const FALLBACK_KEY = "dreamboard:draft:current";

let dbPromise = null;

function supportsIndexedDb() {
  return typeof indexedDB !== "undefined";
}

function openDatabase() {
  if (!supportsIndexedDb()) {
    return Promise.resolve(null);
  }

  if (dbPromise) {
    return dbPromise;
  }

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

  return dbPromise;
}

async function withStore(mode, operation) {
  const database = await openDatabase();
  if (!database) {
    return null;
  }

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, mode);
    const store = transaction.objectStore(STORE_NAME);
    const request = operation(store);

    transaction.oncomplete = () => resolve(request?.result ?? null);
    transaction.onerror = () => reject(transaction.error || request?.error);
    transaction.onabort = () => reject(transaction.error || request?.error);
  });
}

export async function readDraftSnapshot() {
  try {
    const snapshot = await withStore("readonly", (store) =>
      store.get(RECORD_KEY),
    );
    if (snapshot) {
      return snapshot;
    }
  } catch (error) {
    console.warn(
      "IndexedDB draft read failed, trying fallback storage.",
      error,
    );
  }

  try {
    const raw = window.localStorage.getItem(FALLBACK_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.warn("Fallback draft read failed.", error);
    return null;
  }
}

export async function writeDraftSnapshot(snapshot) {
  try {
    await withStore("readwrite", (store) => store.put(snapshot, RECORD_KEY));
    window.localStorage.setItem(
      FALLBACK_KEY,
      JSON.stringify({
        ...snapshot,
        storage: "fallback-copy",
      }),
    );
    return;
  } catch (error) {
    console.warn(
      "IndexedDB draft write failed, trying fallback storage.",
      error,
    );
  }

  window.localStorage.setItem(FALLBACK_KEY, JSON.stringify(snapshot));
}

export async function clearDraftSnapshot() {
  try {
    await withStore("readwrite", (store) => store.delete(RECORD_KEY));
  } catch (error) {
    console.warn("IndexedDB draft delete failed.", error);
  }

  window.localStorage.removeItem(FALLBACK_KEY);
}
