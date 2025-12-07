# GitHub API Integration CLI

A TypeScript Node.js command-line application that fetches and displays data from the GitHub REST API with caching, filtering, and comprehensive error handling.

## Assignment Details

This project is built for the **GLOBAL TREND API Integration Internship Assignment**. It demonstrates API handling, TypeScript development, caching strategies, and clean code architecture.

## Features

- **Two API Endpoints**: Uses GitHub's `/search/repositories` and `/users/{username}/repos` endpoints
- **Data Caching**: Implements JSON file-based caching with 5-minute TTL (Time To Live)
- **CLI Interface**: Professional command-line interface with multiple commands
- **Filtering Options**: Filter by language, stars, and other criteria
- **Detail View**: Get detailed information for specific repositories by ID
- **Error Handling**: Comprehensive error handling for:
  - Network failures
  - Timeouts (10-second limit)
  - Invalid responses
  - Missing/malformed fields
  - Rate limiting
  - HTTP errors (400, 403, 404, 500, etc.)

## Technology Stack

- **Language**: TypeScript 5.3
- **Runtime**: Node.js
- **HTTP Client**: Axios
- **CLI Framework**: Commander.js
- **Styling**: Chalk (for colored output)
- **Caching**: JSON file storage

## Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- npm (v7 or higher)

### Installation

1. Clone or download this repository:
```bash
cd GlobalTrend
```

2. Install dependencies:
```bash
npm install
```

3. Build the TypeScript code:
```bash
npm run build
```

## Usage

### Available Commands

#### 1. Search Repositories
Search GitHub repositories with optional filtering:

```bash
npm start search-repos <query> [options]
```

**Options:**
- `-s, --sort <type>`: Sort by stars, forks, or updated (default: stars)
- `-l, --language <lang>`: Filter by programming language
- `--min-stars <number>`: Minimum stars
- `--max-stars <number>`: Maximum stars
- `-n, --limit <number>`: Number of results (default: 30)

**Examples:**
```bash
# Search for TypeScript repositories
npm start search-repos "typescript"

# Search and filter by language and stars
npm start search-repos "machine learning" -l python --min-stars 1000

# Search and sort by forks
npm start search-repos "react" -s forks -n 10
```

#### 2. Get Repository Details
Get detailed information about a specific repository:

```bash
npm start get-repo <owner> <repo>
```

**Example:**
```bash
npm start get-repo microsoft typescript
```

#### 3. Get User Information
Fetch user profile information:

```bash
npm start get-user <username>
```

**Example:**
```bash
npm start get-user torvalds
```

#### 4. Get User Repositories
List all repositories for a specific user:

```bash
npm start user-repos <username> [options]
```

**Options:**
- `-s, --sort <type>`: Sort by created, updated, pushed, full_name (default: updated)
- `-l, --language <lang>`: Filter by programming language
- `--min-stars <number>`: Minimum stars
- `-n, --limit <number>`: Number of results (default: 30)

**Example:**
```bash
npm start user-repos octocat -s updated -n 20
```

#### 5. Get Repository by ID
Find and display a repository by its ID from search results:

```bash
npm start repo-by-id <query> <id>
```

**Example:**
```bash
npm start repo-by-id "nodejs" 27193779
```

#### 6. Cache Statistics
View cache statistics:

```bash
npm start cache-stats
```

#### 7. Clear Cache
Clear all cached data:

```bash
npm start clear-cache
```

### Help
View all available commands:

```bash
npm start -- --help
```

## API Endpoints Used

### 1. Search Repositories
- **Endpoint**: `GET /search/repositories`
- **Purpose**: Search for repositories based on query
- **Parameters**: query, sort, order, per_page
- **Documentation**: https://docs.github.com/en/rest/search#search-repositories

### 2. Get User Repositories
- **Endpoint**: `GET /users/{username}/repos`
- **Purpose**: List repositories for a specific user
- **Parameters**: username, sort, per_page
- **Documentation**: https://docs.github.com/en/rest/repos/repos#list-repositories-for-a-user

### Additional Endpoints (Bonus):
- `GET /repos/{owner}/{repo}` - Get repository details
- `GET /users/{username}` - Get user information

## Filters Implemented

The application supports the following filters:

1. **Language Filter**: Filter repositories by programming language
   - Example: `--language javascript`

2. **Star Range Filter**: Filter by minimum and maximum stars
   - Example: `--min-stars 100 --max-stars 5000`

3. **Sort Options**: Sort results by different criteria
   - For repositories: stars, forks, updated
   - For user repos: created, updated, pushed, full_name

4. **Result Limit**: Control number of results returned
   - Example: `-n 20`

## Project Structure

```
GlobalTrend/
├── src/
│   ├── types.ts           # TypeScript type definitions
│   ├── apiClient.ts       # GitHub API client with error handling
│   ├── cacheManager.ts    # Cache management with JSON storage
│   ├── dataService.ts     # Service layer integrating API and cache
│   ├── cli.ts             # CLI interface with Commander.js
│   └── index.ts           # Entry point
├── dist/                  # Compiled JavaScript (generated)
├── cache.json            # Cache storage file (generated)
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
└── README.md            # This file
```

## Error Handling

The application implements comprehensive error handling for:

### Network Errors
- Connection failures (ECONNABORTED, ENOTFOUND)
- DNS resolution issues
- Network timeout (10 seconds)

### HTTP Errors
- **400 Bad Request**: Invalid parameters
- **401 Unauthorized**: Authentication issues
- **403 Forbidden**: Rate limit exceeded
- **404 Not Found**: Resource doesn't exist
- **422 Validation Failed**: Invalid fields
- **500/502/503**: Server errors

### Data Validation
- Missing required fields in responses
- Invalid JSON structure
- Malformed data types
- Empty or null responses

All errors display user-friendly messages with actionable information.

## Caching Strategy

- **Storage**: JSON file (`cache.json`)
- **TTL**: 5 minutes (300 seconds)
- **Key Generation**: Based on endpoint + parameters
- **Benefits**:
  - Reduces API calls
  - Faster response times
  - Helps avoid rate limiting
  - Persistent across application restarts

## Assumptions and Notes

1. **No Authentication**: The application uses GitHub's public API without authentication. Rate limit: 60 requests/hour per IP.

2. **Cache Duration**: Set to 5 minutes for optimal balance between fresh data and performance.

3. **Timeout**: API requests timeout after 10 seconds to prevent hanging.

4. **Data Validation**: All API responses are validated for required fields before processing.

5. **TypeScript Strict Mode**: Project uses strict TypeScript configuration for type safety.

6. **Error Recovery**: Failed requests are not retried automatically to avoid excessive API calls.

## Development

### Run in Development Mode
```bash
npm run dev
```

### Build
```bash
npm run build
```

### Clean Build and Cache
```bash
npm run clean
```

## Sample Output

### Search Repositories
```
🔍 Searching repositories for: "typescript"

[CACHE HIT] Using cached data for search/repositories
Found 30 repositories:

1. microsoft/TypeScript
   ID: 2107175
   ⭐ Stars: 98456 | 🍴 Forks: 12876 | Language: TypeScript
   📝 TypeScript is a superset of JavaScript that compiles to clean JavaScript output.
   🔗 https://github.com/microsoft/TypeScript
```

### Repository Details
```
📦 Fetching repository: microsoft/typescript

Repository Details:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Name: microsoft/TypeScript
ID: 2107175
Owner: microsoft
Description: TypeScript is a superset of JavaScript...
Language: TypeScript
Stars: ⭐ 98456
Forks: 🍴 12876
Watchers: 👁 98456
Open Issues: 5234
Default Branch: main
Created: 06/17/2014
Updated: 12/07/2025
License: Apache License 2.0
URL: https://github.com/microsoft/TypeScript
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## License

MIT

## Author

Aashutosh Singh

## Submission

This project fulfills all requirements of the Global Trend API Integration Internship Assignment:
- ✅ Uses public REST API (GitHub)
- ✅ Fetches from multiple endpoints
- ✅ Implements caching (JSON file)
- ✅ Provides CLI with filtering
- ✅ Shows detailed view by ID
- ✅ Comprehensive error handling
- ✅ Complete documentation