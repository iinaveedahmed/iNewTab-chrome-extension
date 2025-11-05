# iNewTab Chrome Extension - AI Coding Guidelines

## Project Overview
A modular Chrome extension that replaces the default new tab page with a productivity dashboard featuring Google Tasks sync with multi-list support, smart search, weather, news, and customizable settings. Built with vanilla JavaScript using class-based modules and Chrome Extension Manifest v3.

**Key Features:**
- **Google Tasks Integration**: Full bidirectional sync with multiple task list support
- **Smart Task Management**: Position-based ordering matching Google Tasks native behavior
- **Completed Tasks Management**: Collapsible completed tasks section
- **Real-time Sync**: Order changes sync back to Google Tasks instantly
- **Task List Selection**: Choose which Google Task List to display and sync
- **Last Sync Display**: Shows accurate last sync timestamps

## Architecture & Key Components

### Modular Structure
```
src/
├── html/newtab.html          # Main HTML with external CSS
├── css/styles.css            # Centralized styling with CSS variables
├── js/
│   ├── main.js              # NewTabApp coordination class
│   ├── modules/             # Feature modules (class-based)
│   │   ├── chrome-storage.js    # Chrome storage wrapper
│   │   ├── google-tasks.js      # Google Tasks API client
│   │   ├── sync-manager.js      # Bidirectional sync logic
│   │   ├── task-renderer.js     # Task UI rendering
│   │   ├── settings-module.js   # Tabbed settings interface
│   │   ├── weather-module.js    # Weather widget
│   │   └── news-module.js       # RSS news ticker
│   └── utils/
│       ├── constants.js         # Centralized config
│       └── helpers.js          # Utility functions
```

### Core Classes & Responsibilities
- **`NewTabApp`** - Main coordinator in `main.js`, initializes all modules
- **`ChromeStorage`** - Promise-based Chrome storage wrapper with typed methods
- **`GoogleTasksAPI`** - OAuth authentication + Google Tasks API client with multi-list support
- **`SyncManager`** - Bidirectional sync between local/Google tasks with conflict resolution
- **`TaskRenderer`** - DOM manipulation for task UI with event delegation and completed tasks management
- **`SettingsModule`** - Modal settings with tabbed interface (General/Google/News) and task list selection

### New API Methods
- **`GoogleTasksAPI.getAllTaskLists()`** - Fetches all available Google Task Lists
- **`GoogleTasksAPI.setTaskList(id)`** - Sets active task list for operations
- **`GoogleTasksAPI.moveTask(taskId, parent, previous)`** - Moves task position in Google Tasks
- **`ChromeStorage.saveSelectedTaskList(id)`** - Persists selected task list
- **`NewTabApp.updateTaskPositions(from, to)`** - Updates task positions and syncs to Google

## Critical Patterns

### Module Communication
All modules communicate through the main `NewTabApp` instance:
```javascript
// In main.js
class NewTabApp {
    constructor() {
        this.storage = new ChromeStorage();
        this.googleAPI = new GoogleTasksAPI();
        this.syncManager = new SyncManager(this.googleAPI, this.storage);
        // ...
    }
}
```

### Error Handling
Use `Utils.safe()` wrapper from `helpers.js` for all operations:
```javascript
Utils.safe(() => {
    // Any operation that might throw
});
```

### Data Persistence
- **Chrome Storage API** (not localStorage) via `ChromeStorage` class
- Tasks include Google sync metadata: `{ id, text, done, subs, googleId, createdAt, dueDate, position }`
- Settings stored separately with RSS feeds, selected task list, and user preferences
- **Task List Selection**: Saved per user, persists across sessions
- **Position Management**: Uses Google Tasks native position strings for ordering

### Task Management Patterns
- **Completed Tasks**: Separated into collapsible section, hidden by default
- **Task Ordering**: Uses Google Tasks native position-based sorting
- **New Task Placement**: Added at top using position calculation (Google Tasks behavior)
- **Drag & Drop**: Updates positions locally and syncs to Google Tasks via move API
- **Task List Switching**: Clears local tasks, force downloads from selected Google Task List

### Async Patterns
All Chrome API operations use Promise wrappers:
```javascript
// ChromeStorage methods return promises
await this.storage.saveTasks(tasks);
const tasks = await this.storage.loadTasks();
```

## Development Workflows

### Building & Testing
```bash
npm test                # Jest tests with Chrome API mocks
npm run build          # Lint + test
npm run build:dist     # Minified production build
npm run dev            # Development build
```

### Chrome Extension Testing
1. `npm run dev` to build
2. Chrome → Extensions → Load unpacked → point to project root
3. Check console in DevTools for module loading errors
4. Test Google OAuth in incognito for clean auth state

### Key Configuration
- **Constants** in `src/js/utils/constants.js` - API URLs, intervals, error messages
- **RSS feeds** configurable through settings UI, stored in Chrome storage
- **OAuth client ID** in `manifest.json` for Google Tasks integration

## Code Conventions

### Class Structure
```javascript
class ModuleName {
    constructor(dependencies) {
        this.dependency = dependencies;
        this.state = {};
    }
    
    async init() {
        // Initialization logic
    }
    
    // Public methods
    // Private methods with underscore prefix
}
```

### Naming & Organization
- **Classes**: PascalCase (`SyncManager`, `TaskRenderer`)
- **Methods**: camelCase (`updateSyncUI`, `renderTasks`)
- **Constants**: UPPER_SNAKE_CASE in `constants.js`
- **Module exports**: Attach to `window` object (`window.ChromeStorage = ChromeStorage`)

### Task Data Structure
```javascript
{
    id: string,           // Local UUID
    text: string,         // Task title
    done: boolean,        // Completion status
    subs: Array,          // Subtasks array
    googleId: string,     // Google Tasks ID for sync
    dueDate: string,      // ISO date string
    createdAt: string,    // ISO timestamp
    description: string,  // Task notes
    position: string      // Google Tasks position for ordering
}
```

## Extension-Specific Notes

### Chrome APIs Used
- `chrome.storage.local` - Persistent data storage
- `chrome.identity` - OAuth 2.0 authentication with Google
- **Permissions**: `storage`, `identity`, host permissions for Google APIs

### Security & OAuth
- OAuth client ID in `manifest.json` must match Google Cloud Console
- Scopes: `https://www.googleapis.com/auth/tasks`
- Token management handled by `GoogleTasksAPI` class

### Performance Considerations
- Auto-sync every 5 minutes when authenticated (configurable in `constants.js`)
- News updates hourly with caching
- Weather updates every 10 minutes
- Debounced user input to prevent API spam

## Testing Patterns

### Jest Configuration
- **Setup**: `tests/setup.js` mocks Chrome APIs, creates DOM structure
- **Mocks**: Chrome storage, identity APIs, fetch, geolocation
- **Helpers**: `createMockTask()`, `createMockResponse()` for consistent test data

### Common Test Patterns
```javascript
// Test Chrome storage operations
await storage.saveTasks([mockTask]);
expect(chrome.storage.local.set).toHaveBeenCalled();

// Test async module initialization  
await module.init();
expect(module.isInitialized).toBe(true);
```

## Common Debugging

### Chrome Extension Issues
- **Console errors**: Check all modules load correctly in DevTools
- **Storage state**: Application tab → Storage → Local storage
- **OAuth failures**: Clear tokens in Chrome → Settings → Privacy → Clear browsing data
- **Sync conflicts**: Check `SyncManager.syncInProgress` state

### API Integration
- **Google Tasks**: Verify OAuth scopes and client ID match
- **Multiple Task Lists**: Check task list selection is saved and loaded correctly
- **Position Syncing**: Verify moveTask API calls and position updates
- **Completed Tasks**: Ensure proper separation and toggle functionality
- **Weather/News**: Network tab to check API responses and CORS
- **Rate limiting**: Configured intervals in `constants.js`

### New Feature Debugging
- **Task List Selection**: Check dropdown population and saved selection in storage
- **Position Syncing**: Monitor console for moveTask API calls and position updates
- **Completed Tasks**: Verify toggle functionality and proper task separation
- **Last Sync Time**: Check sync timestamp display and storage
- **Force Download**: Ensure task list switching clears old tasks properly

### Build Issues
- **Missing modules**: Ensure all classes export to `window` object
- **Manifest errors**: Validate JSON and check file paths
- **Distribution**: Use `npm run build:dist` for production builds with minification