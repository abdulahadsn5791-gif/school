import type { StorageAdapter } from './storage-adapter.interface';

const STORAGE_PROBE_KEY = '__storage_probe__';

class WebStorageAdapter implements StorageAdapter {
  private readyPromise: Promise<void> | null = null;

  private available(): boolean {
    return typeof window !== 'undefined' && !!window.localStorage;
  }

  /**
   * One-time check that localStorage is actually usable and not disabled by browser policy.
   */
  async ensureReady(): Promise<void> {
    if (!this.readyPromise) {
      this.readyPromise = (async () => {
        if (!this.available()) {
          throw new Error('localStorage is not available in this environment');
        }
        try {
          window.localStorage.setItem(STORAGE_PROBE_KEY, '1');
          window.localStorage.removeItem(STORAGE_PROBE_KEY);
        } catch {
          throw new Error('localStorage is present but not usable (storage may be disabled)');
        }
      })().catch((err) => {
        this.readyPromise = null;
        throw err;
      });
    }
    return this.readyPromise;
  }

  async getItem<T>(key: string): Promise<T | null> {
    await this.ensureReady().catch(() => {});
    if (!this.available()) return null;
    try {
      const raw = window.localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
  }

  async setItem<T>(key: string, value: T): Promise<void> {
    await this.ensureReady().catch(() => {});
    if (!this.available()) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // best-effort
    }
  }

  async removeItem(key: string): Promise<void> {
    await this.ensureReady().catch(() => {});
    if (!this.available()) return;
    try {
      window.localStorage.removeItem(key);
    } catch {
      // best-effort
    }
  }

  async clear(): Promise<void> {
    await this.ensureReady().catch(() => {});
    if (!this.available()) return;
    try {
      window.localStorage.clear();
    } catch {
      // best-effort
    }
  }
}

export const storageAdapter: StorageAdapter = new WebStorageAdapter();
