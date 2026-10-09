import { StateStorage } from "zustand/middleware";

const DB_NAME = "safihub_offline_db";
const STORE_NAME = "keyval";
const DB_VERSION = 1;

function openIDB(): Promise<IDBDatabase | null> {
  if (typeof window === "undefined" || !window.indexedDB) {
    return Promise.resolve(null);
  }

  return new Promise((resolve) => {
    try {
      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        resolve(null);
      };
    } catch {
      resolve(null);
    }
  });
}

/**
 * IndexedDB-backed StateStorage for Zustand persistence.
 * Falls back to in-memory storage during SSR or environments lacking IndexedDB.
 */
export const idbStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    if (typeof window === "undefined") return null;

    try {
      const db = await openIDB();
      if (!db) {
        return window.localStorage?.getItem(name) ?? null;
      }

      return new Promise((resolve) => {
        try {
          const transaction = db.transaction(STORE_NAME, "readonly");
          const store = transaction.objectStore(STORE_NAME);
          const request = store.get(name);

          request.onsuccess = () => {
            resolve((request.result as string) ?? null);
          };

          request.onerror = () => {
            resolve(window.localStorage?.getItem(name) ?? null);
          };
        } catch {
          resolve(window.localStorage?.getItem(name) ?? null);
        }
      });
    } catch {
      return null;
    }
  },

  setItem: async (name: string, value: string): Promise<void> => {
    if (typeof window === "undefined") return;

    try {
      const db = await openIDB();
      if (!db) {
        window.localStorage?.setItem(name, value);
        return;
      }

      return new Promise((resolve) => {
        try {
          const transaction = db.transaction(STORE_NAME, "readwrite");
          const store = transaction.objectStore(STORE_NAME);
          const request = store.put(value, name);

          request.onsuccess = () => resolve();
          request.onerror = () => {
            window.localStorage?.setItem(name, value);
            resolve();
          };
        } catch {
          window.localStorage?.setItem(name, value);
          resolve();
        }
      });
    } catch {
      // Ignore write errors gracefully
    }
  },

  removeItem: async (name: string): Promise<void> => {
    if (typeof window === "undefined") return;

    try {
      const db = await openIDB();
      if (!db) {
        window.localStorage?.removeItem(name);
        return;
      }

      return new Promise((resolve) => {
        try {
          const transaction = db.transaction(STORE_NAME, "readwrite");
          const store = transaction.objectStore(STORE_NAME);
          const request = store.delete(name);

          request.onsuccess = () => resolve();
          request.onerror = () => {
            window.localStorage?.removeItem(name);
            resolve();
          };
        } catch {
          window.localStorage?.removeItem(name);
          resolve();
        }
      });
    } catch {
      // Ignore errors
    }
  },
};
