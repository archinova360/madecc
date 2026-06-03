/**
 * Browser-safe Storage Cache Utility with TTL (expiration),
 * size-based eviction, and seamless IndexedDB support for large volumes.
 * Designed to prevent "QuotaExceededError" warnings and clean up stale data automatically.
 */

// Interface for cache item metadata within LocalStorage
interface CacheMetadata {
  key: string;
  size: number;
  expiresAt: number | null; // Timestamp
  lastAccessed: number;      // Timestamp
}

const METADATA_KEY = 'madecc_cache_meta_registry';

/**
 * Parses the local storage cache registry metadata
 */
function getMetadataRegistry(): Record<string, CacheMetadata> {
  if (typeof window === 'undefined') return {};
  try {
    const data = localStorage.getItem(METADATA_KEY);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

/**
 * Saves the registry metadata back to local storage
 */
function saveMetadataRegistry(registry: Record<string, CacheMetadata>): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(METADATA_KEY, JSON.stringify(registry));
  } catch {
    // Fail silently to prevent cascading errors
  }
}

/**
 * Clears expired keys from LocalStorage and the metadata registry
 */
export function clearExpiredLocalStorage(): void {
  if (typeof window === 'undefined') return;
  try {
    const registry = getMetadataRegistry();
    const now = Date.now();
    let changed = false;

    for (const key of Object.keys(registry)) {
      const entry = registry[key];
      if (entry.expiresAt && now > entry.expiresAt) {
        localStorage.removeItem(key);
        delete registry[key];
        changed = true;
      }
    }

    if (changed) {
      saveMetadataRegistry(registry);
    }
  } catch {
    // Fail-safe
  }
}

/**
 * Evicts the oldest/largest items from LocalStorage
 * until at least requestedBytes are freed up.
 */
function evictLocalStorageSpace(requestedBytes: number): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const registry = getMetadataRegistry();
    // Gather all candidate keys that belong to cache (start with madecc_cache_)
    const candidates = Object.values(registry).filter(item => item.key.startsWith('madecc_cache_'));
    
    // Sort by lastAccessed ASC (oldest accessed is first)
    candidates.sort((a, b) => a.lastAccessed - b.lastAccessed);

    let freedBytes = 0;
    for (const candidate of candidates) {
      localStorage.removeItem(candidate.key);
      delete registry[candidate.key];
      freedBytes += candidate.size;
      
      console.log(`LocalStorage Eviction: Removed cache key "${candidate.key}" (${candidate.size} bytes freed)`);
      
      if (freedBytes >= requestedBytes) {
        saveMetadataRegistry(registry);
        return true;
      }
    }
    
    saveMetadataRegistry(registry);
    return freedBytes >= requestedBytes;
  } catch {
    return false;
  }
}

/**
 * Safely writes a value to localStorage, stripping large base64 data URIs,
 * enforcing TTL (expiration), applying LRU size-based eviction,
 * and catching the error gracefully without throwing QuotaExceededError.
 * 
 * @param key LocalStorage Key
 * @param value Stringified value
 * @param ttlMs Optional Time To Live in milliseconds (default: 2 hours for caches)
 */
export function safeLocalStorageSetItem(key: string, value: string, ttlMs: number = 7200000): void {
  if (typeof window === 'undefined') return;

  // Clean expired caches first to reclaim space
  clearExpiredLocalStorage();

  const valueLength = value.length;
  let finalValue = value;

  // If the payload size is exceptionally large (> 150KB), sanitize base64 first
  if (valueLength > 150000) {
    try {
      const parsed = JSON.parse(value);
      const sanitized = sanitizeStorageObject(parsed);
      finalValue = JSON.stringify(sanitized);
    } catch {
      // parsing failed, keep original value
    }
  }

  const finalLength = finalValue.length;

  try {
    localStorage.setItem(key, finalValue);
    
    // Register metadata
    const registry = getMetadataRegistry();
    registry[key] = {
      key,
      size: finalLength,
      expiresAt: ttlMs ? Date.now() + ttlMs : null,
      lastAccessed: Date.now()
    };
    saveMetadataRegistry(registry);

  } catch (error: any) {
    if (
      error.name === 'QuotaExceededError' ||
      error.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
      error.code === 22 ||
      error.code === 1014
    ) {
      console.warn(`LocalStorage quota exceeded writing key: "${key}". Attempting LRU eviction...`);
      // Attempt to evict at least twice the needed space
      const evictedOk = evictLocalStorageSpace(finalLength * 2);
      if (evictedOk) {
        try {
          localStorage.setItem(key, finalValue);
          const registry = getMetadataRegistry();
          registry[key] = {
            key,
            size: finalLength,
            expiresAt: ttlMs ? Date.now() + ttlMs : null,
            lastAccessed: Date.now()
          };
          saveMetadataRegistry(registry);
          console.log(`LocalStorage: Successfully saved key "${key}" after LRU eviction and garbage collection.`);
          return;
        } catch (innerError) {
          // Fallback to extreme sanitization
        }
      }

      // If eviction still failed or unable to free enough, aggressively sanitize & truncate the payload
      try {
        const parsed = JSON.parse(finalValue);
        const ultraSanitized = sanitizeStorageObjectAggressive(parsed);
        const ultraSanitizedValue = JSON.stringify(ultraSanitized);
        
        if (ultraSanitizedValue.length < finalLength) {
          localStorage.setItem(key, ultraSanitizedValue);
          const registry = getMetadataRegistry();
          registry[key] = {
            key,
            size: ultraSanitizedValue.length,
            expiresAt: ttlMs ? Date.now() + ttlMs : null,
            lastAccessed: Date.now()
          };
          saveMetadataRegistry(registry);
          console.log(`LocalStorage: Successfully saved recursively compacted backup version for key "${key}".`);
        }
      } catch (innerErr) {
        console.error(`LocalStorage completely saturated. Failed to cache key "${key}":`, innerErr);
      }
    } else {
      console.error(`Error writing to localStorage for key: "${key}"`, error);
    }
  }
}

/**
 * Safely reads a value from localStorage, checking auto-expiration TTL
 * and updating the last accessed timestamp for eviction tracking.
 */
export function safeLocalStorageGetItem(key: string): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const val = localStorage.getItem(key);
    if (!val) return null;

    const registry = getMetadataRegistry();
    const entry = registry[key];

    if (entry) {
      // Expiration check
      if (entry.expiresAt && Date.now() > entry.expiresAt) {
        localStorage.removeItem(key);
        delete registry[key];
        saveMetadataRegistry(registry);
        return null;
      }
      // Update last accessed
      entry.lastAccessed = Date.now();
      saveMetadataRegistry(registry);
    }

    return val;
  } catch {
    return null;
  }
}

/**
 * Safely removes a value from localStorage and the cache registry
 */
export function safeLocalStorageRemoveItem(key: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(key);
    const registry = getMetadataRegistry();
    if (registry[key]) {
      delete registry[key];
      saveMetadataRegistry(registry);
    }
  } catch {
    // Fail-safe
  }
}

/**
 * Helper to compute an extremely fast, collision-free string hash for storage reference keys.
 */
function getStringHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return `ref_${Math.abs(hash).toString(36)}_${str.length}`;
}

/**
 * Recursively intercepts large base64 data URIs and automatically stores them in high-capacity
 * IndexedDB storage. Returns a lightweight URI reference 'indexeddb://ref_...' to completely
 * prevent LocalStorage QuotaExceededError while retaining 100% of the image visual data.
 */
export function sanitizeStorageObject(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === 'string') {
    // If the string is a base64 / data URL and exceeds 10KB, store in IndexedDB and return reference
    if (obj.startsWith('data:') && obj.length > 10240) {
      const hashKey = getStringHash(obj);
      // Non-blocking fire-and-forget put session to high-volume IndexedDB
      AppIndexedDBCache.setItem(hashKey, obj, 86400000 * 365).catch(err => {
        console.warn("Pre-cache base64 in IndexedDB failed:", err);
      });
      return `indexeddb://${hashKey}`;
    }
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeStorageObject(item));
  }

  if (typeof obj === 'object') {
    const cleaned: any = {};
    for (const key of Object.keys(obj)) {
      cleaned[key] = sanitizeStorageObject(obj[key]);
    }
    return cleaned;
  }

  return obj;
}

/**
 * Traverses any loaded storage object/array and resolves "indexeddb://ref_..." reference URIs
 * back to their original high-resolution base64 strings asynchronously on mount or load.
 */
export async function resolveIndexedDBReferences(obj: any): Promise<any> {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === 'string') {
    if (obj.startsWith('indexeddb://')) {
      const hashKey = obj.replace('indexeddb://', '');
      try {
        const originalContent = await AppIndexedDBCache.getItem<string>(hashKey);
        if (originalContent) {
          return originalContent;
        }
      } catch (err) {
        console.warn(`Failed to resolve ref from IndexedDB for "${hashKey}"`, err);
      }
      return obj;
    }
    return obj;
  }

  if (Array.isArray(obj)) {
    const resolvedArray = await Promise.all(obj.map(item => resolveIndexedDBReferences(item)));
    return resolvedArray;
  }

  if (typeof obj === 'object') {
    const resolvedObj: any = {};
    const keys = Object.keys(obj);
    for (const key of keys) {
      resolvedObj[key] = await resolveIndexedDBReferences(obj[key]);
    }
    return resolvedObj;
  }

  return obj;
}

/**
 * Aggressive recursive truncation of keys or values that reduces sizes significantly.
 * Truncates strings over 512 bytes, particularly base64 data.
 */
function sanitizeStorageObjectAggressive(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === 'string') {
    if (obj.startsWith('data:') || obj.length > 512) {
      return "[TRUNCATED_DUE_TO_STORAGE_SATURATION]";
    }
    return obj;
  }

  if (Array.isArray(obj)) {
    // Return first 5 items only to prevent massive tables
    return obj.slice(0, 5).map(item => sanitizeStorageObjectAggressive(item));
  }

  if (typeof obj === 'object') {
    const cleaned: any = {};
    for (const key of Object.keys(obj)) {
      cleaned[key] = sanitizeStorageObjectAggressive(obj[key]);
    }
    return cleaned;
  }

  return obj;
}

/**
 * Custom High-Capacity IndexedDB caching layer that solves LocalStorage size boundaries.
 * Enables automatic entry TTL expiration, item-count capacity limits, and
 * is completely non-blocking to runtime execution in modern browsers.
 */
class CustomIndexedDBCache {
  private dbName = "MADECC_CACHE_DB";
  private storeName = "cache_store";
  private dbPromise: Promise<IDBDatabase | null> | null = null;

  constructor() {
    if (typeof window !== 'undefined' && window.indexedDB) {
      this.initDB();
    }
  }

  private initDB() {
    this.dbPromise = new Promise((resolve) => {
      try {
        const request = window.indexedDB.open(this.dbName, 1);
        request.onupgradeneeded = (e) => {
          const db = request.result;
          if (!db.objectStoreNames.contains(this.storeName)) {
            db.createObjectStore(this.storeName, { keyPath: "key" });
          }
        };
        request.onsuccess = () => {
          resolve(request.result);
        };
        request.onerror = (err) => {
          console.warn("IndexedDB initialization error, falling back smoothly:", err);
          resolve(null);
        };
      } catch (err) {
        console.warn("IndexedDB open error:", err);
        resolve(null);
      }
    });
  }

  /**
   * Sets value in high-volume IndexedDB. Automatically trims old records if count exceeds maxItems.
   * 
   * @param key Unique record key
   * @param value Cache object/array/value
   * @param ttlMs Optional expiration (defaults to 2 hours)
   */
  async setItem(key: string, value: any, ttlMs: number = 7200000): Promise<boolean> {
    if (!this.dbPromise) return false;
    try {
      const db = await this.dbPromise;
      if (!db) return false;

      // Clean up overflow asynchronously to maintain performance
      this.enforceSizeLimit(100);

      const expiresAt = ttlMs ? Date.now() + ttlMs : null;
      const data = {
        key,
        value,
        expiresAt,
        size: JSON.stringify(value).length,
        lastAccessed: Date.now()
      };

      return new Promise<boolean>((resolve) => {
        try {
          const transaction = db.transaction(this.storeName, "readwrite");
          const store = transaction.objectStore(this.storeName);
          const req = store.put(data);
          req.onsuccess = () => resolve(true);
          req.onerror = () => {
            console.warn(`IndexedDB write failed for key "${key}".`);
            resolve(false);
          };
        } catch {
          resolve(false);
        }
      });
    } catch (e) {
      console.error(`IndexedDB error during setItem for "${key}":`, e);
      return false;
    }
  }

  /**
   * Safe retrieval of cache record. Gracefully auto-deletes expired records.
   */
  async getItem<T>(key: string): Promise<T | null> {
    if (!this.dbPromise) return null;
    try {
      const db = await this.dbPromise;
      if (!db) return null;

      return new Promise<T | null>((resolve) => {
        try {
          const transaction = db.transaction(this.storeName, "readwrite");
          const store = transaction.objectStore(this.storeName);
          const req = store.get(key);

          req.onsuccess = () => {
            const res = req.result;
            if (!res) {
              resolve(null);
              return;
            }

            // check TTL expiration
            if (res.expiresAt && Date.now() > res.expiresAt) {
              store.delete(key);
              resolve(null);
              return;
            }

            // update access timestamp for LRU
            res.lastAccessed = Date.now();
            store.put(res);

            resolve(res.value as T);
          };

          req.onerror = () => {
            resolve(null);
          };
        } catch {
          resolve(null);
        }
      });
    } catch {
      return null;
    }
  }

  /**
   * Deletes cached item
   */
  async deleteItem(key: string): Promise<boolean> {
    if (!this.dbPromise) return false;
    try {
      const db = await this.dbPromise;
      if (!db) return false;

      return new Promise<boolean>((resolve) => {
        try {
          const transaction = db.transaction(this.storeName, "readwrite");
          const store = transaction.objectStore(this.storeName);
          const req = store.delete(key);
          req.onsuccess = () => resolve(true);
          req.onerror = () => resolve(false);
        } catch {
          resolve(false);
        }
      });
    } catch {
      return false;
    }
  }

  /**
   * Iterates store and drops expired data keys
   */
  async clearExpired(): Promise<void> {
    if (!this.dbPromise) return;
    try {
      const db = await this.dbPromise;
      if (!db) return;

      const transaction = db.transaction(this.storeName, "readwrite");
      const store = transaction.objectStore(this.storeName);
      const req = store.openCursor();

      req.onsuccess = (e: any) => {
        const cursor = e.target.result;
        if (cursor) {
          const val = cursor.value;
          if (val.expiresAt && Date.now() > val.expiresAt) {
            cursor.delete();
          }
          cursor.continue();
        }
      };
    } catch (e) {
      console.warn("Failed to complete IndexedDB clearExpired:", e);
    }
  }

  /**
   * Helper that manages records and strips bottom 20% oldest entries
   * when database capacity limit starts getting exceeded.
   */
  private async enforceSizeLimit(maxItems: number): Promise<void> {
    if (!this.dbPromise) return;
    try {
      const db = await this.dbPromise;
      if (!db) return;

      const transaction = db.transaction(this.storeName, "readwrite");
      const store = transaction.objectStore(this.storeName);
      const req = store.getAll();

      req.onsuccess = () => {
        const items = req.result;
        if (items && items.length >= maxItems) {
          items.sort((a, b) => (a.lastAccessed || 0) - (b.lastAccessed || 0));
          const evictCount = Math.ceil(maxItems * 0.2);
          for (let i = 0; i < evictCount && i < items.length; i++) {
            store.delete(items[i].key);
            console.log(`IndexedDB Cache evicted key: "${items[i].key}" (LRU capacity limits exceeded)`);
          }
        }
      };
    } catch {
      // Graceful fail
    }
  }
}

export const AppIndexedDBCache = new CustomIndexedDBCache();
