/**
 * GitHub API Client with error handling and request management
 */

import axios, { AxiosInstance, AxiosError } from 'axios';
import { GitHubRepository, GitHubUser, SearchRepositoriesResponse, APIError } from './types';

export class GitHubAPIClient {
  private axiosInstance: AxiosInstance;
  private readonly baseURL = 'https://api.github.com';
  private readonly timeout = 10000; // 10 seconds

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: this.baseURL,
      timeout: this.timeout,
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'GlobalTrend-API-Assignment'
      }
    });

    // Add response interceptor for error handling
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => this.handleError(error)
    );
  }

  /**
   * Handle API errors with descriptive messages
   */
  private handleError(error: AxiosError): never {
    const apiError: APIError = new Error();

    if (error.code === 'ECONNABORTED') {
      apiError.message = `Request timeout: The request took longer than ${this.timeout}ms`;
      throw apiError;
    }

    if (error.code === 'ENOTFOUND' || error.code === 'EAI_AGAIN') {
      apiError.message = 'Network error: Unable to connect to GitHub API. Please check your internet connection.';
      throw apiError;
    }

    if (!error.response) {
      apiError.message = `Network error: ${error.message}`;
      throw apiError;
    }

    const statusCode = error.response.status;
    apiError.statusCode = statusCode;
    apiError.response = error.response.data;

    switch (statusCode) {
      case 400:
        apiError.message = 'Bad Request: Invalid parameters provided';
        break;
      case 401:
        apiError.message = 'Unauthorized: Invalid or missing authentication token';
        break;
      case 403:
        apiError.message = 'Rate limit exceeded: GitHub API rate limit reached. Please try again later.';
        break;
      case 404:
        apiError.message = 'Not Found: The requested resource does not exist';
        break;
      case 422:
        apiError.message = 'Validation Failed: The request contains invalid fields';
        break;
      case 500:
      case 502:
      case 503:
        apiError.message = 'Server Error: GitHub API is currently unavailable';
        break;
      default:
        apiError.message = `HTTP Error ${statusCode}: ${error.message}`;
    }

    throw apiError;
  }

  /**
   * Validate response data structure
   */
  private validateResponse<T>(data: any, requiredFields: string[]): T {
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid response: Expected object but received invalid data');
    }

    for (const field of requiredFields) {
      if (!(field in data)) {
        throw new Error(`Invalid response: Missing required field '${field}'`);
      }
    }

    return data as T;
  }

  /**
   * Search repositories by query
   * Endpoint: GET /search/repositories
   */
  async searchRepositories(
    query: string,
    sort: 'stars' | 'forks' | 'updated' = 'stars',
    perPage: number = 30
  ): Promise<GitHubRepository[]> {
    try {
      const response = await this.axiosInstance.get<SearchRepositoriesResponse>('/search/repositories', {
        params: {
          q: query,
          sort: sort,
          order: 'desc',
          per_page: perPage
        }
      });

      // Validate response structure
      const validatedData = this.validateResponse<SearchRepositoriesResponse>(
        response.data,
        ['items', 'total_count']
      );

      if (!Array.isArray(validatedData.items)) {
        throw new Error('Invalid response: items field is not an array');
      }

      return validatedData.items;
    } catch (error) {
      if (error instanceof Error && error.message.includes('Invalid response')) {
        throw error;
      }
      throw error;
    }
  }

  /**
   * Get detailed information about a specific repository
   * Endpoint: GET /repos/{owner}/{repo}
   */
  async getRepository(owner: string, repo: string): Promise<GitHubRepository> {
    try {
      const response = await this.axiosInstance.get<GitHubRepository>(`/repos/${owner}/${repo}`);

      // Validate response structure
      const validatedData = this.validateResponse<GitHubRepository>(
        response.data,
        ['id', 'name', 'full_name', 'owner']
      );

      return validatedData;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get user information by username
   * Endpoint: GET /users/{username}
   */
  async getUser(username: string): Promise<GitHubUser> {
    try {
      const response = await this.axiosInstance.get<GitHubUser>(`/users/${username}`);

      // Validate response structure
      const validatedData = this.validateResponse<GitHubUser>(
        response.data,
        ['login', 'id', 'html_url']
      );

      return validatedData;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get repositories for a specific user
   * Endpoint: GET /users/{username}/repos
   */
  async getUserRepositories(
    username: string,
    sort: 'created' | 'updated' | 'pushed' | 'full_name' = 'updated',
    perPage: number = 30
  ): Promise<GitHubRepository[]> {
    try {
      const response = await this.axiosInstance.get<GitHubRepository[]>(`/users/${username}/repos`, {
        params: {
          sort: sort,
          per_page: perPage
        }
      });

      if (!Array.isArray(response.data)) {
        throw new Error('Invalid response: Expected array of repositories');
      }

      return response.data;
    } catch (error) {
      throw error;
    }
  }
}