import fs from 'fs';
import path from 'path';
import { packageDirectorySync } from 'pkg-dir';

class ApiCache {
  private CACHE_DIR = path.resolve(packageDirectorySync() || __dirname, '.next/cache/notion.json');
  private cache: Map<string, any> = new Map();

  constructor() {
    try {
      const json = JSON.parse(fs.readFileSync(this.CACHE_DIR).toString());
      this.cache = new Map(Object.entries(json));
    } catch {}
  }

  has(key: string) {
    return this.cache.has(key);
  }

  get(key: string) {
    return this.cache.get(key);
  }

  set(key: string, value: any) {
    this.cache.set(key, value);
    fs.writeFileSync(this.CACHE_DIR, JSON.stringify(Object.fromEntries(this.cache)));
  }

  clear() {
    this.cache.clear();
  }
}

export const apiCache = new ApiCache();