/**
 * Data Service - Integrates API client with cache manager
 */

import { GitHubAPIClient } from './apiClient';
import { CacheManager } from './cacheManager';
import { GitHubRepository, GitHubUser, FilterOptions } from './types';

export class DataService {
  private apiClient: GitHubAPIClient;
  private cacheManager: CacheManager;

  constructor() {
    this.apiClient = new GitHubAPIClient();
    this.cacheManager = new CacheManager();
  }

  /**
   * Search repositories with caching
   */
  async searchRepositories(
    query: string,
    sort: 'stars' | 'forks' | 'updated' = 'stars',
    perPage: number = 30
  ): Promise<GitHubRepository[]> {
    const cacheKey = 'search/repositories';
    const params = { q: query, sort, per_page: perPage };

    // Try cache first
    const cached = this.cacheManager.get<GitHubRepository[]>(cacheKey, params);
    if (cached) {
      return cached;
    }

    // Fetch from API
    const data = await this.apiClient.searchRepositories(query, sort, perPage);

    // Save to cache
    this.cacheManager.set(cacheKey, data, params);

    return data;
  }

  /**
   * Get repository details with caching
   */
  async getRepository(owner: string, repo: string): Promise<GitHubRepository> {
    const cacheKey = `repos/${owner}/${repo}`;

    // Try cache first
    const cached = this.cacheManager.get<GitHubRepository>(cacheKey);
    if (cached) {
      return cached;
    }

    // Fetch from API
    const data = await this.apiClient.getRepository(owner, repo);

    // Save to cache
    this.cacheManager.set(cacheKey, data);

    return data;
  }

  /**
   * Get user with caching
   */
  async getUser(username: string): Promise<GitHubUser> {
    const cacheKey = `users/${username}`;

    // Try cache first
    const cached = this.cacheManager.get<GitHubUser>(cacheKey);
    if (cached) {
      return cached;
    }

    // Fetch from API
    const data = await this.apiClient.getUser(username);

    // Save to cache
    this.cacheManager.set(cacheKey, data);

    return data;
  }

  /**
   * Get user repositories with caching
   */
  async getUserRepositories(
    username: string,
    sort: 'created' | 'updated' | 'pushed' | 'full_name' = 'updated',
    perPage: number = 30
  ): Promise<GitHubRepository[]> {
    const cacheKey = `users/${username}/repos`;
    const params = { sort, per_page: perPage };

    // Try cache first
    const cached = this.cacheManager.get<GitHubRepository[]>(cacheKey, params);
    if (cached) {
      return cached;
    }

    // Fetch from API
    const data = await this.apiClient.getUserRepositories(username, sort, perPage);

    // Save to cache
    this.cacheManager.set(cacheKey, data, params);

    return data;
  }

  /**
   * Filter repositories based on criteria
   */
  filterRepositories(repositories: GitHubRepository[], filters: FilterOptions): GitHubRepository[] {
    let filtered = repositories;

    if (filters.language) {
      filtered = filtered.filter(repo =>
        repo.language?.toLowerCase() === filters.language?.toLowerCase()
      );
    }

    if (filters.minStars !== undefined) {
      filtered = filtered.filter(repo => repo.stargazers_count >= filters.minStars!);
    }

    if (filters.maxStars !== undefined) {
      filtered = filtered.filter(repo => repo.stargazers_count <= filters.maxStars!);
    }

    if (filters.archived !== undefined) {
      filtered = filtered.filter(repo => repo.archived === filters.archived);
    }

    return filtered;
  }

  /**
   * Get repository by ID from a list
   */
  getRepositoryById(repositories: GitHubRepository[], id: number): GitHubRepository | undefined {
    return repositories.find(repo => repo.id === id);
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cacheManager.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { totalEntries: number; validEntries: number; expiredEntries: number } {
    return this.cacheManager.getStats();
  }
}