# API Documentation

## Core Classes

### NewTabApp

Main application class that initializes and coordinates all modules.

#### Constructor
```javascript
const app = new NewTabApp();
```

#### Methods

##### `async init()`
Initializes the entire application, sets up all modules and event listeners.

```javascript
await app.init();
```

##### `async createTask(text)`
Creates a new task with the given text at the optimal position.

**Parameters:**
- `text` (string): The task title

**Returns:** Promise<void>

```javascript
await app.createTask('New task title');
```

##### `generateNewTaskPosition()`
Generates a position string for new tasks using Google Tasks style positioning.

**Returns:** string - Position string

##### `async updateTaskPositions(fromIndex, toIndex)`
Updates task positions after reordering and syncs to Google Tasks.

**Parameters:**
- `fromIndex` (number): Original task index
- `toIndex` (number): New task index

**Returns:** Promise<void>

```javascript
await app.updateTaskPositions(0, 3);
```

##### `async loadTasks()`
Loads tasks from Chrome storage.

**Returns:** Promise<void>

##### `async saveTasks()`
Saves current tasks to Chrome storage and triggers background sync if authenticated.

**Returns:** Promise<void>

##### `updateSyncUI()`
Updates the authentication UI state based on current Google authentication status.

**Returns:** void

---

### ChromeStorage

Wrapper for Chrome Storage API with Promise-based methods.

#### Constructor
```javascript
const storage = new ChromeStorage();
```

#### Methods

##### `async saveTasks(tasks)`
Saves tasks array to Chrome storage.

**Parameters:**
- `tasks` (Array): Array of task objects

**Returns:** Promise<boolean> - Success status

```javascript
const success = await storage.saveTasks([
    { id: '1', text: 'Task 1', done: false }
]);
```

##### `async loadTasks()`
Loads tasks from Chrome storage and ensures backward compatibility by adding position fields.

**Returns:** Promise<Array> - Array of task objects

```javascript
const tasks = await storage.loadTasks();
```

##### `async saveSelectedTaskList(taskListId)`
Saves the selected Google Task List ID.

**Parameters:**
- `taskListId` (string): Google Task List ID

**Returns:** Promise<boolean> - Success status

##### `async loadSelectedTaskList()`
Loads the selected Google Task List ID.

**Returns:** Promise<string|null> - Task List ID or null

```javascript
const taskListId = await storage.loadSelectedTaskList();
```

##### `async saveAuthStatus(isAuthenticated)`
Saves Google authentication status.

**Parameters:**
- `isAuthenticated` (boolean): Authentication status

**Returns:** Promise<boolean> - Success status

##### `async loadAuthStatus()`
Loads authentication status and timestamp.

**Returns:** Promise<Object> - Auth status object

```javascript
const { isAuthenticated, authTime } = await storage.loadAuthStatus();
```

##### `async saveCachedNews(news)`
Saves news articles to storage.

**Parameters:**
- `news` (Array): Array of news objects

**Returns:** Promise<boolean> - Success status

##### `async loadCachedNews()`
Loads cached news articles.

**Returns:** Promise<Object> - News data with lastUpdate timestamp

```javascript
const { news, lastUpdate } = await storage.loadCachedNews();
```

##### `async clearAll()`
Clears all data from Chrome storage.

**Returns:** Promise<boolean> - Success status

##### `async getStorageInfo()`
Gets storage usage information.

**Returns:** Promise<number> - Bytes used

---

### GoogleTasksAPI

Google Tasks API integration with OAuth authentication.

#### Constructor
```javascript
const api = new GoogleTasksAPI();
```

#### Properties
- `isAuthenticated` (boolean): Current authentication status
- `accessToken` (string): Current OAuth access token
- `taskListId` (string): ID of the currently selected task list
- `availableTaskLists` (Array): Array of available task lists

#### Methods

##### `async getAllTaskLists()`
Fetches all available Google Task Lists for the authenticated user.

**Returns:** Promise<Array> - Array of task list objects

```javascript
const taskLists = await api.getAllTaskLists();
// Returns: [{ id: 'list-id', title: 'My Tasks' }, ...]
```

##### `setTaskList(taskListId)`
Sets the active task list for all operations.

**Parameters:**
- `taskListId` (string): Google Task List ID

**Returns:** void

```javascript
api.setTaskList('new-task-list-id');
```

##### `async authenticate()`
Initiates OAuth flow and authenticates with Google Tasks.

**Returns:** Promise<boolean> - Success status

```javascript
const success = await api.authenticate();
```

##### `async signOut()`
Signs out and revokes the authentication token.

**Returns:** Promise<void>

##### `async getTasks()`
Retrieves all tasks from Google Tasks.

**Returns:** Promise<Array> - Array of tasks in local format

```javascript
const tasks = await api.getTasks();
```

##### `async createTask(taskData)`
Creates a new task in Google Tasks.

**Parameters:**
- `taskData` (Object): Task object with text, done, description, dueDate, etc.

**Returns:** Promise<Object> - Created task from Google API

```javascript
const createdTask = await api.createTask({
    text: 'New task',
    done: false,
    description: 'Task description',
    dueDate: '2023-10-15'
});
```

##### `async updateTask(taskId, taskData)`
Updates an existing task in Google Tasks.

**Parameters:**
- `taskId` (string): Google Tasks ID
- `taskData` (Object): Updated task data

**Returns:** Promise<Object> - Updated task from Google API

##### `async deleteTask(taskId)`
Deletes a task from Google Tasks.

**Parameters:**
- `taskId` (string): Google Tasks ID

**Returns:** Promise<boolean> - Success status

##### `async moveTask(taskId, parent, previous)`
Moves a task to a new position in Google Tasks using the native move API.

**Parameters:**
- `taskId` (string): Google Tasks ID of the task to move
- `parent` (string|null): Parent task ID for subtasks, null for root tasks
- `previous` (string|null): ID of the task that should come before this task

**Returns:** Promise<Object> - Updated task from Google API

```javascript
// Move task to be after another task
await api.moveTask('task-id', null, 'previous-task-id');

// Move task to top of list
await api.moveTask('task-id', null, null);
```

##### `convertGoogleTasksToLocal(googleTasks)`
Converts Google Tasks format to local task format, preserving position information.

**Parameters:**
- `googleTasks` (Array): Tasks from Google Tasks API

**Returns:** Array - Tasks in local format with position fields

```javascript
const localTasks = api.convertGoogleTasksToLocal(googleApiTasks);
```

##### `async checkAuthStatus()`
Checks if the current authentication is still valid.

**Returns:** Promise<boolean> - Authentication status

---

### SyncManager

Handles bidirectional synchronization between local storage and Google Tasks.

#### Constructor
```javascript
const syncManager = new SyncManager(googleTasksAPI, chromeStorage);
```

#### Properties
- `syncInProgress` (boolean): Whether sync is currently running
- `lastSyncTime` (Date): Timestamp of last successful sync

#### Methods

##### `startAutoSync()`
Starts automatic synchronization at regular intervals.

**Returns:** void

##### `stopAutoSync()`
Stops automatic synchronization.

**Returns:** void

##### `async syncTasks()`
Performs bidirectional sync between local and Google Tasks.

**Returns:** Promise<Array|false> - Merged tasks or false on failure

```javascript
const mergedTasks = await syncManager.syncTasks();
```

##### `async pushTaskToGoogle(task)`
Pushes a single new task to Google Tasks.

**Parameters:**
- `task` (Object): Task object

**Returns:** Promise<boolean> - Success status

##### `async updateTaskInGoogle(task)`
Updates a single task in Google Tasks.

**Parameters:**
- `task` (Object): Task object with googleId

**Returns:** Promise<boolean> - Success status

##### `async deleteTaskFromGoogle(task)`
Deletes a task from Google Tasks.

**Parameters:**
- `task` (Object): Task object with googleId

**Returns:** Promise<boolean> - Success status

##### `async forceDownloadFromGoogle()`
Downloads all tasks from Google Tasks, overwriting local data.

**Returns:** Promise<Array> - Downloaded tasks

##### `async forceUploadToGoogle()`
Uploads all local tasks to Google Tasks.

**Returns:** Promise<Array> - Uploaded tasks

##### `async getSyncStatus()`
Gets current sync status and statistics.

**Returns:** Promise<Object> - Sync status object

---

### TaskRenderer

Handles rendering and UI interactions for tasks, including completed tasks management and drag-drop positioning.

#### Constructor
```javascript
const renderer = new TaskRenderer(tasks, app);
```

#### Methods

##### `render()`
Renders all tasks separated into active and completed sections with event listeners.

**Returns:** void

##### `async handleTaskDrop(e, li)`
Handles task reordering via drag and drop, updates positions, and syncs to Google Tasks.

**Parameters:**
- `e` (Event): Drop event
- `li` (HTMLElement): Target list item element

**Returns:** Promise<void>

##### `setupCompletedTasksToggle()`
Sets up the collapsible completed tasks section functionality.

**Returns:** void

##### `createTaskElement(task, index)`
Creates a DOM element for a single task.

**Parameters:**
- `task` (Object): Task object
- `index` (number): Task index in array

**Returns:** HTMLElement - Task list item element

##### `normalizeTask(task)`
Ensures task object has all required properties with defaults.

**Parameters:**
- `task` (Object): Potentially incomplete task object

**Returns:** Object - Normalized task object

##### `getTaskDetailsHTML(task)`
Generates HTML for task details (description and due date).

**Parameters:**
- `task` (Object): Task object

**Returns:** string - HTML string

##### `escapeHtml(text)`
Escapes HTML characters to prevent XSS attacks.

**Parameters:**
- `text` (string): Text to escape

**Returns:** string - Escaped text

---

### WeatherModule

Manages weather widget functionality.

#### Constructor
```javascript
const weather = new WeatherModule();
```

#### Methods

##### `init()`
Initializes weather module and starts updates.

**Returns:** void

##### `async loadWeather()`
Loads current weather data based on user location.

**Returns:** Promise<void>

##### `scheduleUpdates()`
Sets up periodic weather updates.

**Returns:** void

##### `destroy()`
Cleans up timers and resources.

**Returns:** void

---

### NewsModule

Manages news ticker functionality.

#### Constructor
```javascript
const news = new NewsModule(storage);
```

#### Methods

##### `async init()`
Initializes news module and loads cached data.

**Returns:** Promise<void>

##### `async loadNews()`
Fetches fresh news from RSS feeds.

**Returns:** Promise<void>

##### `renderNews()`
Renders news ticker with current articles.

**Returns:** void

##### `async refresh()`
Forces a refresh of news data.

**Returns:** Promise<void>

##### `getStats()`
Gets news module statistics.

**Returns:** Object - Statistics object

##### `destroy()`
Cleans up timers and resources.

**Returns:** void

### GreetingModule

Manages time-aware greetings and inspirational quotes.

#### Constructor
```javascript
const greeting = new GreetingModule(storage);
```

**Parameters:**
- `storage` (ChromeStorage): Storage instance

#### Methods

##### `async init()`
Initializes greeting module, loads quote batch, and displays first quote.

**Returns:** Promise<void>

##### `updateGreeting()`
Updates greeting based on current time, day of week, and minute.

**Returns:** void

```javascript
greetingModule.updateGreeting();
```

##### `getHourlyGreeting(hour, index)`
Gets a casual greeting for weekdays.

**Parameters:**
- `hour` (number): Hour of day (0-23)
- `index` (number): Greeting index (0-9)

**Returns:** string - Greeting message

##### `getWeekendGreeting(hour, index)`
Gets a weekend-specific greeting.

**Parameters:**
- `hour` (number): Hour of day (0-23)
- `index` (number): Greeting index (0-9)

**Returns:** string - Weekend greeting message

##### `async loadQuoteBatch()`
Loads quote batch from cache or API.

**Returns:** Promise<void>

##### `async fetchQuoteBatch()`
Fetches 20 quotes from DummyJSON API in parallel.

**Returns:** Promise<void>

##### `showNextQuote()`
Displays next quote from batch and triggers auto-refetch if needed.

**Returns:** void

##### `displayQuote(text, author)`
Displays a quote on the page.

**Parameters:**
- `text` (string): Quote text
- `author` (string): Quote author

**Returns:** void

##### `async cacheBatch()`
Saves current quote batch to Chrome storage.

**Returns:** Promise<void>

##### `async loadCachedBatch()`
Loads cached quote batch from storage.

**Returns:** Promise<Object|null> - Cached batch data or null

##### `refreshQuote()`
Manually shows next quote in batch.

**Returns:** void

##### `destroy()`
Cleans up timers and resources.

**Returns:** void

### SearchModule

Manages multi-engine search with keyboard shortcuts.

#### Constructor
```javascript
const search = new SearchModule();
```

#### Methods

##### `init()`
Initializes search module and event listeners.

**Returns:** void

##### `selectEngine(engine)`
Selects a search engine and displays tag.

**Parameters:**
- `engine` (Object): Engine object from SEARCH_ENGINES

**Returns:** void

```javascript
searchModule.selectEngine(Constants.SEARCH_ENGINES.google);
```

##### `clearSelection()`
Clears currently selected search engine.

**Returns:** void

##### `renderTag(engine)`
Renders visual tag for selected engine.

**Parameters:**
- `engine` (Object): Engine object

**Returns:** void

##### `handleKeyDown(e)`
Handles keyboard shortcuts (Tab, Escape).

**Parameters:**
- `e` (KeyboardEvent): Keyboard event

**Returns:** void

##### `handleSubmit(e)`
Handles search form submission.

**Parameters:**
- `e` (Event): Submit event

**Returns:** void

##### `toggleHelpModal()`
Shows or hides the help modal.

**Returns:** void

##### `populateShortcuts()`
Populates help modal with search engine shortcuts.

**Returns:** void

---

## Utility Functions

### Utils.safe(fn)
Safely executes a function and catches errors.

**Parameters:**
- `fn` (Function): Function to execute

**Returns:** any - Function result or null on error

### Utils.formatDueDate(date)
Formats a due date with smart labels.

**Parameters:**
- `date` (string): ISO date string

**Returns:** Object - { text: string, class: string }

### Utils.getTimeAgo(date)
Gets human-readable time difference.

**Parameters:**
- `date` (Date): Date to compare

**Returns:** string - Time ago string

### Utils.debounce(func, wait)
Creates a debounced function.

**Parameters:**
- `func` (Function): Function to debounce
- `wait` (number): Delay in milliseconds

**Returns:** Function - Debounced function

### Utils.generateId()
Generates a unique ID string.

**Returns:** string - Unique identifier

### Utils.deepClone(obj)
Creates a deep copy of an object.

**Parameters:**
- `obj` (any): Object to clone

**Returns:** any - Cloned object

---

## Data Structures

### Task Object
```javascript
{
    id: string,           // Unique local ID
    text: string,         // Task title
    done: boolean,        // Completion status
    subs: Array,         // Subtasks array
    description: string,  // Task description/notes
    dueDate: string,     // ISO date string or null
    googleId: string,    // Google Tasks ID or null
    createdAt: string,   // ISO timestamp
    position: string     // Google Tasks position string for ordering
}
```

### Subtask Object
```javascript
{
    text: string,     // Subtask title
    done: boolean,    // Completion status
    googleId: string  // Google Tasks ID or null
}
```

### News Item Object
```javascript
{
    title: string,        // Article title
    link: string,         // Article URL
    publishedAt: string   // ISO timestamp
}
```

### Quote Batch Object
```javascript
{
    quotes: Array,        // Array of quote objects
    currentIndex: number, // Current position in batch
    timestamp: number     // Last fetch timestamp
}
```

### Quote Object
```javascript
{
    text: string,    // Quote text
    author: string   // Quote author
}
```

### Search Engine Object
```javascript
{
    name: string,       // Engine display name (e.g., "Google")
    shortcut: string,   // Keyboard shortcut (e.g., "g")
    url: string,        // Search URL template
    color: string,      // Tag color (hex)
    isDefault: boolean  // Whether this is the default engine (optional)
}
```

## Events

The application uses standard DOM events for user interactions:

- `click` - Button clicks, task interactions
- `change` - Checkbox state changes
- `keypress` - Keyboard input (Enter key)
- `submit` - Form submissions
- `dragstart`, `dragover`, `drop` - Drag and drop operations

## Error Handling

All async operations include try-catch blocks and appropriate error logging. The application gracefully degrades when:

- Network requests fail
- Chrome APIs are unavailable
- Authentication expires
- Storage operations fail

## Performance Considerations

- **Debouncing**: User input is debounced to prevent excessive operations
- **Lazy Loading**: Heavy operations are deferred until needed
- **Caching**: Data is cached locally to reduce API calls
  - Quote batches cached in Chrome storage (20 quotes per batch)
  - News articles cached for 1 hour
  - Weather data cached for 10 minutes
- **Background Sync**: Synchronization happens in background threads
- **Event Delegation**: Uses event delegation for dynamic content
- **Conditional Module Loading**: Modules only initialize if their widgets are visible
- **Resource Optimization**: Hidden widgets don't load or consume resources
- **No Animations**: Removed fade-in animations for instant display
- **Batch API Requests**: Quotes fetched in parallel (20 simultaneous requests)