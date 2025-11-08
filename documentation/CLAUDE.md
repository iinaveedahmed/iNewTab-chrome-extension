# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

iNewTab is a Chrome Extension (Manifest v3) that replaces the new tab page with a productivity dashboard featuring:
- Smart greetings system with 240 casual, time-aware messages (10 per hour, weekend-specific)
- Inspirational quotes from DummyJSON API with batch fetching and caching
- Multi-engine search with 8 search engines and keyboard shortcuts (p, g, c, d, b, y, gh, so + Tab)
- Google Tasks integration with multi-list support, native ordering, and bidirectional sync
- Local task management with drag-drop reordering
- Weather widget using geolocation
- Customizable RSS news feed ticker
- Full widget visibility controls with resource optimization
- Settings hover reveal (appears on top-right corner hover)
- Real-time clock and Material Design UI with dark/light themes

## Development Commands

### Build & Test
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Run tests and linting (pre-build check)
npm run build
```

### Distribution
```bash
# Build minified distribution
npm run build:dist

# Build and create ZIP package
npm run build:zip

# Development build
npm run dev
```

### Chrome Extension Development
```bash
# Load extension in Chrome
# 1. Navigate to chrome://extensions/
# 2. Enable "Developer mode" (top right toggle)
# 3. Click "Load unpacked" and select project root directory
# 4. Open new tab to test changes

# After code changes, click reload icon on chrome://extensions/
# or use Ctrl+R in the new tab page
```

## Architecture

### Module Structure

The codebase follows a **modular class-based architecture** with clear separation of concerns:

**Core Application** (`src/js/main.js`):
- `NewTabApp`: Main orchestrator class that coordinates all modules
- Initializes and manages: ChromeStorage, GoogleTasksAPI, SyncManager, SettingsModule
- Handles application lifecycle and event coordination

**Storage Layer** (`src/js/modules/chrome-storage.js`):
- `ChromeStorage`: Wrapper around Chrome Storage API with async/await support
- Manages persistence for tasks, auth status, sync status, settings, and cached data

**Google Integration** (`src/js/modules/google-tasks.js`):
- `GoogleTasksAPI`: Google Tasks API client with OAuth 2.0 authentication
- Supports multi-list selection, task CRUD operations, and position-based ordering
- Uses Chrome Identity API for token management

**Sync Logic** (`src/js/modules/sync-manager.js`):
- `SyncManager`: Handles bidirectional sync between local tasks and Google Tasks
- Auto-sync every 5 minutes when authenticated
- Conflict resolution with timestamp-based merging

**UI Rendering** (`src/js/modules/task-renderer.js`):
- `TaskRenderer`: Renders task lists with drag-drop, subtasks, and completed sections
- Event delegation pattern for dynamic task actions
- Handles task UI state including hover actions, tooltips, and urgency indicators

**Settings** (`src/js/modules/settings-module.js`):
- `SettingsModule`: Manages tabbed settings interface (General, Google, News)
- Handles theme switching, task list selection, and RSS feed configuration

**Search** (`src/js/modules/search-module.js`):
- `SearchModule`: Multi-engine search with keyboard shortcuts and visual tags
- Supports 8 search engines with quick selection via shortcut + Tab
- Handles tag rendering, search submission, and keyboard navigation

**Widgets**:
- `GreetingModule` (`greeting-module.js`): Time-aware greetings and inspirational quotes
  - 240 casual greetings (10 per hour, cycling every ~6 minutes)
  - Weekend-specific greeting variants
  - Quote batch fetching from DummyJSON API (20 quotes per batch)
  - Auto-refetch when 5 or fewer quotes remain
  - Fallback quotes for offline scenarios
- `WeatherModule` (`weather-module.js`): Location-based weather with Open-Meteo API
- `NewsModule` (`news-module.js`): RSS feed ticker with caching and customizable sources

**Utilities**:
- `utils/constants.js`: All app constants (API URLs, intervals, storage keys, search engines)
- `utils/helpers.js`: Shared utilities (formatDueDate, debounce, safe error handling)

### Data Flow

1. **Initialization**:
   - `NewTabApp.init()` loads settings first
   - `SettingsModule.applyVisibilitySettings()` applies visibility classes to DOM elements
   - Modules initialized conditionally based on visibility settings (resource optimization)
   - Sequence: storage → visibility → greetings/quotes → search → tasks → auth → weather → news → settings UI
2. **Greeting System**:
   - `GreetingModule.updateGreeting()` calculates greeting based on hour (0-23) and minute
   - Greeting cycles every ~6 minutes: `greetingIndex = Math.floor(minutes / 6) % 10`
   - Weekend detection: `isWeekend = dayOfWeek === 0 || dayOfWeek === 6`
3. **Quote System**:
   - Initial load: `loadQuoteBatch()` checks cache → falls back to API fetch
   - Each page refresh: `showNextQuote()` displays next quote from batch
   - Auto-refetch: When remaining quotes < 5, fetch 20 more in background
   - Storage: Cached in Chrome storage with `saveQuoteBatch()` and `loadQuoteBatch()`
4. **Task Creation**: User input → NewTabApp.createTask() → local storage → Google sync (if authenticated)
5. **Task Sync**: SyncManager.syncTasks() → merge local + Google → resolve conflicts → save both ways
6. **Position Updates**: Drag-drop → TaskRenderer → NewTabApp.updateTaskPositions() → Google moveTask API
7. **Settings Changes**: SettingsModule → storage → trigger relevant module updates (startModule/stopModule)
8. **Visibility Toggle**: Settings checkbox → `handleVisibilityToggle()` → add/remove .visible class → start/stop module

### Google Tasks Position System

The extension uses **Google Tasks native position-based ordering**:
- Each task has a `position` field (23-character base-36 string)
- New tasks are inserted at the top with position < min(existing positions)
- Drag-drop generates positions between adjacent tasks: `(prevPos + nextPos) / 2`
- Synced to Google using `moveTask(taskId, parent, previous)` API call
- Position calculation in `main.js:330-418`

### Authentication & OAuth

- OAuth 2.0 flow via Chrome Identity API (`chrome.identity.getAuthToken`)
- Client ID configured in `manifest.json` (must match Google Cloud Console)
- Token stored in `this.accessToken`, revoked on sign-out
- Auth status persisted to Chrome storage for auto-login
- See `documentation/SETUP.md` for Google Cloud configuration steps

## Testing

### Test Structure
```
tests/
├── unit/              # Unit tests for individual modules
│   ├── chrome-storage.test.js
│   ├── task-renderer.test.js
│   └── utils.test.js
├── integration/       # Integration tests (end-to-end workflows)
└── setup.js          # Jest setup with Chrome API mocks
```

### Writing Tests
- Chrome APIs are mocked in `tests/setup.js`
- Use Jest with jsdom environment for DOM testing
- Test utilities are in `src/js/utils/helpers.js` (use `Utils.safe()` for error handling)
- Mock Google Tasks API responses in integration tests

### Running Individual Tests
```bash
# Run specific test file
npm test -- chrome-storage.test.js

# Run tests matching pattern
npm test -- --testNamePattern="should save tasks"

# Run with coverage for specific file
npm test -- --coverage --collectCoverageFrom=src/js/modules/chrome-storage.js
```

## Code Conventions

### ESLint Configuration
- **Indentation**: 4 spaces (enforced)
- **Quotes**: Single quotes (enforced)
- **Semicolons**: Required (enforced)
- **Globals**: Utils, Constants, and module classes available globally

### Naming Patterns
- **Classes**: PascalCase (`GoogleTasksAPI`, `SyncManager`)
- **Functions/Methods**: camelCase (`createTask`, `updateSyncUI`)
- **Constants**: UPPER_SNAKE_CASE (in `constants.js`)
- **DOM IDs**: kebab-case in HTML, accessed via getElementById in JS

### Module Pattern
All modules follow this structure:
```javascript
class ModuleName {
    constructor(dependencies) {
        this.dependency = dependencies;
        this.state = initialState;
    }

    async init() {
        // Initialization logic
    }

    // Public methods
    async publicMethod() { }

    // Private-style methods (no actual privacy, convention only)
    _privateHelper() { }
}
```

### Error Handling
- Use `Utils.safe(fn)` wrapper for non-critical operations (defined in `helpers.js`)
- Use try-catch for critical paths (sync, auth, storage)
- Log errors to console (no silent failures)
- Display user-friendly messages in UI for failures

## Important Implementation Details

### Task Data Structure
```javascript
{
    id: 'local-uuid',           // Local unique ID
    googleId: 'google-id',      // Google Tasks ID (if synced)
    text: 'Task title',
    description: '',
    done: false,
    dueDate: '2025-11-09T00:00:00Z', // ISO string or null
    position: '00000abc...',    // 23-char base-36 string
    subs: [],                   // Subtask array (not synced to Google)
    createdAt: '2025-11-09...',
    updatedAt: '2025-11-09...'
}
```

### Storage Keys (from constants.js)
- `tasks`: Main task array
- `syncStatus`: Last sync timestamp and status
- `isAuthenticated`: Boolean auth state
- `cachedNews`: News articles cache
- `quoteBatch`: Quote batch cache (quotes, currentIndex, timestamp)
- `userPreferences`: Settings (theme, RSS feeds, selected task list, visibility settings)

### Sync Conflict Resolution
- Timestamp-based: Most recent `updatedAt` wins
- New local tasks pushed to Google
- New Google tasks added to local
- Deleted tasks: Removed from both sides if marked deleted
- Implementation in `SyncManager.mergeTasks()`

### Material UI Standards
- 8px spacing grid system
- Consistent button heights (40px)
- Dark/light theme support via CSS variables
- Hidden actions appear on task hover
- Tooltips for all interactive elements

## Common Development Tasks

### Adding a New Module
1. Create class in `src/js/modules/new-module.js`
2. Add to HTML script loading order in `src/html/newtab.html`
3. Initialize in `NewTabApp.init()` in correct sequence
4. Export globally if needed: `window.ModuleName = ModuleName`
5. Add tests in `tests/unit/new-module.test.js`

### Modifying Sync Logic
- Core logic in `SyncManager.syncTasks()` and `mergeTasks()`
- Position sync in `NewTabApp.updateTaskPositions()`
- Always test with Google Tasks web interface to verify behavior
- Check conflict scenarios: local-only changes, Google-only changes, simultaneous edits

### Adding/Modifying Search Engines
- Search engines defined in `src/js/utils/constants.js` (SEARCH_ENGINES object)
- Each engine has: name, shortcut, URL, color, and optional isDefault flag
- To add a new engine: Add entry to SEARCH_ENGINES with unique shortcut
- SearchModule builds shortcut map dynamically from constants
- Implementation in `src/js/modules/search-module.js`

### Modifying Greetings
- Greetings defined in `GreetingModule.getHourlyGreeting()` and `getWeekendGreeting()`
- Structure: Object with 24 hours (0-23), each containing array of 10 greetings
- Greeting selection: `greetingIndex = Math.floor(minutes / 6) % 10` (cycles every ~6 minutes)
- Weekend detection: `isWeekend = dayOfWeek === 0 || dayOfWeek === 6`
- To add/modify greetings: Edit greeting arrays in `src/js/modules/greeting-module.js`
- Ensure each hour has exactly 10 greetings for proper cycling

### Changing Quote API
- Current API: DummyJSON (`https://dummyjson.com/quotes/random`)
- Batch size: 20 quotes fetched in parallel
- Fetch threshold: Auto-refetch when 5 or fewer quotes remain
- Response format expected: `{quote: "text", author: "name"}`
- To change API:
  1. Update `fetchQuoteBatch()` in `src/js/modules/greeting-module.js`
  2. Add host permission to `manifest.json` if needed
  3. Update response parsing for new API format
  4. Adjust batch size and fetch threshold as needed
- Fallback quotes in `loadQuoteBatch()` for offline scenarios

### Adding/Removing Widgets
- All widgets controlled via visibility settings
- To add visibility control for new widget:
  1. Add CSS: `#widgetId { display: none; }` and `#widgetId.visible { display: block; }`
  2. Add to `elementMap` in `SettingsModule.applyVisibilitySettings()`
  3. Add checkbox in Settings → General tab (newtab.html)
  4. Add to `visibility` defaults in SettingsModule constructor
  5. Conditionally initialize in `NewTabApp.init()` based on visibility setting
  6. Implement `startModule()` and `stopModule()` in SettingsModule for dynamic control

### Adding RSS Feeds
- Default feed: `https://news.google.com/rss` (defined in `src/js/utils/constants.js`)
- User-customizable via Settings → News tab
- Users can add/remove feeds; default persists unless explicitly removed
- Uses rss2json.com API (no auth required)
- Cached for 1 hour (UI_CONFIG.NEWS_UPDATE_INTERVAL)

### Updating Weather Integration
- Weather API: Open-Meteo (no API key)
- Location: BigDataCloud reverse geocoding
- Update interval: 10 minutes (UI_CONFIG.WEATHER_UPDATE_INTERVAL)
- Implementation: `src/js/modules/weather-module.js`

## Packaging for Distribution

### Build Process (`scripts/build.js`)
1. Clean `dist/` directory
2. Minify JavaScript with Terser
3. Minify CSS with CleanCSS
4. Copy HTML and assets
5. Copy manifest.json

### Creating ZIP (`scripts/package.js`)
- Creates `packages/` directory
- Archives entire project (excluding node_modules, .git, dist)
- Suitable for Chrome Web Store upload

### Pre-submission Checklist
1. Update version in `package.json` and `manifest.json`
2. Run `npm run build` (tests + lint)
3. Run `npm run build:zip`
4. Test packaged extension in Chrome
5. Verify OAuth client ID is production-ready
6. Check all permissions in manifest are justified

## Configuration Files

### manifest.json
- **oauth2.client_id**: Must be set to your Google Cloud OAuth client ID
- **permissions**: `storage`, `identity` (required for Chrome APIs)
- **host_permissions**:
  - `https://www.googleapis.com/*` (Google Tasks API)
  - `https://dummyjson.com/*` (Quotes API)

### constants.js
- **SYNC_CONFIG.AUTO_SYNC_INTERVAL**: Adjust sync frequency (default: 5 min)
- **UI_CONFIG**: News/weather update intervals, animation durations
- **RSS_FEEDS**: Default RSS feed URLs

## Debugging

### Common Issues

**Tasks not syncing**:
- Check `chrome.identity` token in DevTools → Application → Chrome Storage
- Verify OAuth client ID matches Google Cloud Console
- Check Network tab for failed API calls to `googleapis.com`
- Ensure task list is selected in Settings → Google tab

**Position sync errors**:
- Google Tasks API requires `previous` param for moveTask
- Positions must be recalculated when tasks are reordered
- Check `NewTabApp.updateTaskPositions()` logic

**Storage quota exceeded**:
- Chrome storage has limits (sync: 100KB, local: 5MB)
- Extension uses local storage (5MB limit)
- Clear old cached news if needed

### Debug Mode
Enable verbose logging:
```javascript
// In browser console
window.DEBUG = true;
```

Check Chrome storage state:
```javascript
// In browser console
chrome.storage.local.get(null, console.log);
```

## External Dependencies

### APIs (No Auth Required)
- **Open-Meteo**: Weather data (free, no key)
- **BigDataCloud**: Reverse geocoding (free, no key)
- **rss2json.com**: RSS to JSON conversion (free tier)

### APIs (Auth Required)
- **Google Tasks API**: OAuth 2.0 via Chrome Identity API

### Runtime Dependencies
- Chrome Extension APIs (Manifest v3)
- Chrome Storage API
- Chrome Identity API

### Dev Dependencies
- Jest (testing)
- ESLint (linting)
- Terser (JS minification)
- CleanCSS (CSS minification)
- fs-extra, archiver (build scripts)
