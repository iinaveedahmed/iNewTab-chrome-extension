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
Creates a new task with the given text.

**Parameters:**
- `text` (string): The task title

**Returns:** Promise<void>

```javascript
await app.createTask('New task title');
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
Loads tasks from Chrome storage.

**Returns:** Promise<Array> - Array of task objects

```javascript
const tasks = await storage.loadTasks();
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
- `taskListId` (string): ID of the default task list

#### Methods

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

##### `convertGoogleTasksToLocal(googleTasks)`
Converts Google Tasks format to local task format.

**Parameters:**
- `googleTasks` (Array): Tasks from Google Tasks API

**Returns:** Array - Tasks in local format

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

Handles rendering and UI interactions for tasks.

#### Constructor
```javascript
const renderer = new TaskRenderer(tasks, app);
```

#### Methods

##### `render()`
Renders all tasks in the task list with event listeners.

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
    createdAt: string    // ISO timestamp
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
- **Background Sync**: Synchronization happens in background threads
- **Event Delegation**: Uses event delegation for dynamic content