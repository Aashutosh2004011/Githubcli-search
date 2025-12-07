/**
 * Cache Manager for storing and retrieving API responses
 * Uses JSON file for persistent storage
 */

import * as fs from 'fs';
import * as path from 'path';
import { Cache, CacheEntry } from './types';

export class CacheManager {
  private cache: Cache;
  private readonly cacheFile: string;
  private readonly cacheDuration: number; // milliseconds

  constructor(cacheFile: string = 'cache.json', cacheDuration: number = 300000) {
    this.cacheFile = path.resolve(cacheFile);
    this.cacheDuration = cacheDuration; // Default 5 minutes
    this.cache = this.loadCache();
  }

  /**
   * Load cache from JSON file
   */
  private loadCache(): Cache {
    try {
      if (fs.existsSync(this.cacheFile)) {
        const data = fs.readFileSync(this.cacheFile, 'utf-8');
        return JSON.parse(data);
      }
    } catch (error) {
      console.warn('Failed to load cache, starting with empty cache');
    }
    return {};
  }

  /**
   * Save cache to JSON file
   */
  private saveCache(): void {
    try {
      const data = JSON.stringify(this.cache, null, 2);
      fs.writeFileSync(this.cacheFile, data, 'utf-8');
    } catch (error) {
      console.error('Failed to save cache:', error);
    }
  }

  /**
   * Generate cache key from endpoint and parameters
   */
  private generateKey(endpoint: string, params?: Record<string, any>): string {
    const paramsString = params ? JSON.stringify(params) : '';
    return `${endpoint}:${paramsString}`;
  }

  /**
   * Check if cache entry is still valid
   */
  private isValid(entry: CacheEntry<any>): boolean {
    const now = Date.now();
    return (now - entry.timestamp) < this.cacheDuration;
  }

  /**
   * Get data from cache if valid
   */
  get<T>(endpoint: string, params?: Record<string, any>): T | null {
    const key = this.generateKey(endpoint, params);
    const entry = this.cache[key];

    if (entry && this.isValid(entry)) {
      console.log(`[CACHE HIT] Using cached data for ${endpoint}`);
      return entry.data as T;
    }

    return null;
  }

  /**
   * Set data in cache
   */
  set<T>(endpoint: string, data: T, params?: Record<string, any>): void {
    const key = this.generateKey(endpoint, params);
    this.cache[key] = {
      data,
      timestamp: Date.now()
    };
    this.saveCache();
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache = {};
    this.saveCache();
    console.log('Cache cleared successfully');
  }

  /**
   * Remove expired entries from cache
   */
  cleanup(): void {
    const keys = Object.keys(this.cache);
    let removedCount = 0;

    keys.forEach(key => {
      if (!this.isValid(this.cache[key])) {
        delete this.cache[key];
        removedCount++;
      }
    });

    if (removedCount > 0) {
      this.saveCache();
      console.log(`Removed ${removedCount} expired cache entries`);
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): { totalEntries: number; validEntries: number; expiredEntries: number } {
    const keys = Object.keys(this.cache);
    const validEntries = keys.filter(key => this.isValid(this.cache[key])).length;

    return {
      totalEntries: keys.length,
      validEntries,
      expiredEntries: keys.length - validEntries
    };
  }
}