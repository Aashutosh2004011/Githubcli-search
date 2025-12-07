/**
 * CLI Interface using Commander.js
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { DataService } from './dataService';
import { GitHubRepository, GitHubUser, FilterOptions } from './types';

export class CLI {
  private program: Command;
  private dataService: DataService;

  constructor() {
    this.program = new Command();
    this.dataService = new DataService();
    this.setupCommands();
  }

  private setupCommands(): void {
    this.program
      .name('github-cli')
      .description('GitHub API Integration CLI - Fetch and display repository and user data')
      .version('1.0.0');

    // Search repositories command
    this.program
      .command('search-repos')
      .description('Search GitHub repositories')
      .argument('<query>', 'Search query')
      .option('-s, --sort <type>', 'Sort by: stars, forks, updated', 'stars')
      .option('-l, --language <lang>', 'Filter by programming language')
      .option('--min-stars <number>', 'Minimum stars')
      .option('--max-stars <number>', 'Maximum stars')
      .option('-n, --limit <number>', 'Number of results', '30')
      .action(async (query, options) => {
        await this.handleSearchRepos(query, options);
      });

    // Get repository details command
    this.program
      .command('get-repo')
      .description('Get detailed information about a specific repository')
      .argument('<owner>', 'Repository owner')
      .argument('<repo>', 'Repository name')
      .action(async (owner, repo) => {
        await this.handleGetRepo(owner, repo);
      });

    // Get user command
    this.program
      .command('get-user')
      .description('Get user information')
      .argument('<username>', 'GitHub username')
      .action(async (username) => {
        await this.handleGetUser(username);
      });

    // Get user repositories command
    this.program
      .command('user-repos')
      .description('Get repositories for a specific user')
      .argument('<username>', 'GitHub username')
      .option('-s, --sort <type>', 'Sort by: created, updated, pushed, full_name', 'updated')
      .option('-l, --language <lang>', 'Filter by programming language')
      .option('--min-stars <number>', 'Minimum stars')
      .option('-n, --limit <number>', 'Number of results', '30')
      .action(async (username, options) => {
        await this.handleUserRepos(username, options);
      });

    // Get repository by ID
    this.program
      .command('repo-by-id')
      .description('Get repository details by ID from search results')
      .argument('<query>', 'Search query to find repositories')
      .argument('<id>', 'Repository ID')
      .action(async (query, id) => {
        await this.handleRepoById(query, parseInt(id));
      });

    // Cache management commands
    this.program
      .command('cache-stats')
      .description('Show cache statistics')
      .action(() => {
        this.handleCacheStats();
      });

    this.program
      .command('clear-cache')
      .description('Clear all cached data')
      .action(() => {
        this.handleClearCache();
      });
  }

  private async handleSearchRepos(query: string, options: any): Promise<void> {
    try {
      console.log(chalk.blue(`\n🔍 Searching repositories for: "${query}"\n`));

      const repos = await this.dataService.searchRepositories(
        query,
        options.sort,
        parseInt(options.limit)
      );

      // Apply filters
      const filters: FilterOptions = {
        language: options.language,
        minStars: options.minStars ? parseInt(options.minStars) : undefined,
        maxStars: options.maxStars ? parseInt(options.maxStars) : undefined
      };

      const filtered = this.dataService.filterRepositories(repos, filters);

      if (filtered.length === 0) {
        console.log(chalk.yellow('No repositories found matching the criteria.'));
        return;
      }

      console.log(chalk.green(`Found ${filtered.length} repositories:\n`));
      this.displayRepositoryList(filtered);

    } catch (error) {
      this.handleError(error);
    }
  }

  private async handleGetRepo(owner: string, repo: string): Promise<void> {
    try {
      console.log(chalk.blue(`\n📦 Fetching repository: ${owner}/${repo}\n`));

      const repository = await this.dataService.getRepository(owner, repo);
      this.displayRepositoryDetails(repository);

    } catch (error) {
      this.handleError(error);
    }
  }

  private async handleGetUser(username: string): Promise<void> {
    try {
      console.log(chalk.blue(`\n👤 Fetching user: ${username}\n`));

      const user = await this.dataService.getUser(username);
      this.displayUserDetails(user);

    } catch (error) {
      this.handleError(error);
    }
  }

  private async handleUserRepos(username: string, options: any): Promise<void> {
    try {
      console.log(chalk.blue(`\n📚 Fetching repositories for user: ${username}\n`));

      const repos = await this.dataService.getUserRepositories(
        username,
        options.sort,
        parseInt(options.limit)
      );

      // Apply filters
      const filters: FilterOptions = {
        language: options.language,
        minStars: options.minStars ? parseInt(options.minStars) : undefined
      };

      const filtered = this.dataService.filterRepositories(repos, filters);

      if (filtered.length === 0) {
        console.log(chalk.yellow('No repositories found matching the criteria.'));
        return;
      }

      console.log(chalk.green(`Found ${filtered.length} repositories:\n`));
      this.displayRepositoryList(filtered);

    } catch (error) {
      this.handleError(error);
    }
  }

  private async handleRepoById(query: string, id: number): Promise<void> {
    try {
      console.log(chalk.blue(`\n🔍 Searching for repository with ID: ${id}\n`));

      const repos = await this.dataService.searchRepositories(query);
      const repo = this.dataService.getRepositoryById(repos, id);

      if (!repo) {
        console.log(chalk.yellow(`Repository with ID ${id} not found in search results.`));
        return;
      }

      this.displayRepositoryDetails(repo);

    } catch (error) {
      this.handleError(error);
    }
  }

  private handleCacheStats(): void {
    const stats = this.dataService.getCacheStats();
    console.log(chalk.blue('\n📊 Cache Statistics:\n'));
    console.log(`Total Entries: ${stats.totalEntries}`);
    console.log(`Valid Entries: ${chalk.green(stats.validEntries.toString())}`);
    console.log(`Expired Entries: ${chalk.red(stats.expiredEntries.toString())}\n`);
  }

  private handleClearCache(): void {
    this.dataService.clearCache();
    console.log(chalk.green('\n✅ Cache cleared successfully!\n'));
  }

  private displayRepositoryList(repos: GitHubRepository[]): void {
    repos.forEach((repo, index) => {
      console.log(chalk.bold(`${index + 1}. ${repo.full_name}`));
      console.log(`   ID: ${repo.id}`);
      console.log(`   ⭐ Stars: ${repo.stargazers_count} | 🍴 Forks: ${repo.forks_count} | Language: ${repo.language || 'N/A'}`);
      console.log(`   📝 ${repo.description || 'No description'}`);
      console.log(`   🔗 ${repo.html_url}\n`);
    });
  }

  private displayRepositoryDetails(repo: GitHubRepository): void {
    console.log(chalk.bold.green('Repository Details:'));
    console.log(chalk.bold('━'.repeat(60)));
    console.log(`${chalk.bold('Name:')} ${repo.full_name}`);
    console.log(`${chalk.bold('ID:')} ${repo.id}`);
    console.log(`${chalk.bold('Owner:')} ${repo.owner.login}`);
    console.log(`${chalk.bold('Description:')} ${repo.description || 'N/A'}`);
    console.log(`${chalk.bold('Language:')} ${repo.language || 'N/A'}`);
    console.log(`${chalk.bold('Stars:')} ⭐ ${repo.stargazers_count}`);
    console.log(`${chalk.bold('Forks:')} 🍴 ${repo.forks_count}`);
    console.log(`${chalk.bold('Watchers:')} 👁 ${repo.watchers_count}`);
    console.log(`${chalk.bold('Open Issues:')} ${repo.open_issues_count}`);
    console.log(`${chalk.bold('Default Branch:')} ${repo.default_branch}`);
    console.log(`${chalk.bold('Created:')} ${new Date(repo.created_at).toLocaleDateString()}`);
    console.log(`${chalk.bold('Updated:')} ${new Date(repo.updated_at).toLocaleDateString()}`);
    console.log(`${chalk.bold('License:')} ${repo.license?.name || 'N/A'}`);
    console.log(`${chalk.bold('URL:')} ${repo.html_url}`);
    console.log(chalk.bold('━'.repeat(60)) + '\n');
  }

  private displayUserDetails(user: GitHubUser): void {
    console.log(chalk.bold.green('User Details:'));
    console.log(chalk.bold('━'.repeat(60)));
    console.log(`${chalk.bold('Username:')} ${user.login}`);
    console.log(`${chalk.bold('ID:')} ${user.id}`);
    console.log(`${chalk.bold('Name:')} ${user.name || 'N/A'}`);
    console.log(`${chalk.bold('Bio:')} ${user.bio || 'N/A'}`);
    console.log(`${chalk.bold('Company:')} ${user.company || 'N/A'}`);
    console.log(`${chalk.bold('Location:')} ${user.location || 'N/A'}`);
    console.log(`${chalk.bold('Email:')} ${user.email || 'N/A'}`);
    console.log(`${chalk.bold('Blog:')} ${user.blog || 'N/A'}`);
    console.log(`${chalk.bold('Twitter:')} ${user.twitter_username || 'N/A'}`);
    console.log(`${chalk.bold('Public Repos:')} ${user.public_repos}`);
    console.log(`${chalk.bold('Followers:')} ${user.followers}`);
    console.log(`${chalk.bold('Following:')} ${user.following}`);
    console.log(`${chalk.bold('Created:')} ${new Date(user.created_at).toLocaleDateString()}`);
    console.log(`${chalk.bold('Profile:')} ${user.html_url}`);
    console.log(chalk.bold('━'.repeat(60)) + '\n');
  }

  private handleError(error: unknown): void {
    console.error(chalk.red('\n❌ Error:'));
    if (error instanceof Error) {
      console.error(chalk.red(error.message));
    } else {
      console.error(chalk.red('An unknown error occurred'));
    }
    console.error('');
    process.exit(1);
  }

  public run(): void {
    this.program.parse(process.argv);
  }
}