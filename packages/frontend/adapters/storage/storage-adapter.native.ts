import type { StorageAdapter } from './storage-adapter.interface';

const inMemoryStorage = new Map<string, string>();

class NativeStorageAdapter implements StorageAdapter {
  private readyPromise: Promise<void> | null = null;

  async ensureReady(): Promise<void> {
    if (!this.readyPromise) {
      this.readyPromise = Promise.resolve();
    }
    return this.readyPromise;
  }

  async getItem<T>(key: string): Promise<T | null> {
    try {
      const raw = inMemoryStorage.get(key);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
  }

  async setItem<T>(key: string, value: T): Promise<void> {
    try {
      inMemoryStorage.set(key, JSON.stringify(value));
    } catch {
      // best-effort
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      inMemoryStorage.delete(key);
    } catch {
      // best-effort
    }
  }

  async clear(): Promise<void> {
    try {
      inMemoryStorage.clear();
    } catch {
      // best-effort
    }
  }
}

export const storageAdapter: StorageAdapter = new NativeStorageAdapter();
