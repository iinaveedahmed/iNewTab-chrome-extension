/**
 * Main application entry point for the Custom New Tab Extension
 * Handles initialization and coordination of all modules
 */

class NewTabApp {
    constructor() {
        // Initialize core services
        this.storage = new ChromeStorage();
        this.googleAPI = new GoogleTasksAPI();
        this.syncManager = new SyncManager(this.googleAPI, this.storage);
        this.settingsModule = new SettingsModule(this);
        this.searchModule = new SearchModule();

        // Application state
        this.tasks = [];
        this.isInitialized = false;

        // Optional modules (initialized based on visibility)
        this.greetingModule = null;
        this.newsModule = null;
        this.weatherModule = null;

        // Bind methods
        this.handleTaskInput = this.handleTaskInput.bind(this);
        this.handleGoogleSignIn = this.handleGoogleSignIn.bind(this);
        this.handleManualSync = this.handleManualSync.bind(this);
    }

    /**
     * Initialize the application
     */
    async init() {
        try {
            // Load settings first to check visibility preferences
            await this.settingsModule.loadSettings();
            const visibility = this.settingsModule.visibility;

            // Apply visibility settings to DOM before initializing modules
            this.settingsModule.applyVisibilitySettings();

            // Initialize clock and date (always needed for basic functionality)
            if (visibility.clockDate) {
                this.initClock();
            }

            // Initialize greeting and quote only if visible
            if (visibility.greeting || visibility.quote) {
                this.greetingModule = new GreetingModule(this.storage);
                await this.greetingModule.init();
            }

            // Initialize search module only if visible
            if (visibility.search) {
                this.searchModule.init();
            }

            // Initialize task management only if visible
            if (visibility.tasks) {
                await this.initTasks();
            }

            // Initialize authentication (needed for sync regardless of task visibility)
            await this.initAuth();

            // Initialize weather only if visible
            if (visibility.weather) {
                this.initWeather();
            }

            // Initialize news only if visible
            if (visibility.news) {
                await this.initNews();
            }

            // Initialize settings UI
            await this.settingsModule.init();

            // Set up event listeners
            this.setupEventListeners();

            this.isInitialized = true;
            console.log('New Tab App initialized successfully');
        } catch (error) {
            console.error('Failed to initialize app:', error);
        }
    }

    /**
     * Initialize and start the clock
     */
    initClock() {
        const updateClock = () => {
            Utils.safe(() => {
                const now = new Date();
                const clockEl = document.getElementById('clock');
                const dateEl = document.getElementById('date');

                if (clockEl) {
                    clockEl.textContent = now.toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                        second: '2-digit',
                        hour12: true
                    });
                }

                if (dateEl) {
                    dateEl.textContent = now.toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    });
                }
            });
        };

        updateClock();
        setInterval(updateClock, Constants.UI_CONFIG.CLOCK_UPDATE_INTERVAL);
    }

    /**
     * Initialize task management
     */
    async initTasks() {
        await this.loadTasks();
        this.renderTasks();
    }

    /**
     * Initialize authentication
     */
    async initAuth() {
        const authStatus = await this.storage.loadAuthStatus();
        if (authStatus.isAuthenticated) {
            const isStillAuth = await this.googleAPI.checkAuthStatus();
            if (isStillAuth) {
                // Load saved task list selection
                const selectedTaskListId = await this.storage.loadSelectedTaskList();
                if (selectedTaskListId && this.googleAPI.availableTaskLists.find(list => list.id === selectedTaskListId)) {
                    this.googleAPI.setTaskList(selectedTaskListId);
                }
                
                // Load last sync time
                const syncStatus = await this.storage.loadSyncStatus();
                if (syncStatus.lastSyncTime) {
                    this.syncManager.lastSyncTime = new Date(syncStatus.lastSyncTime);
                }
                
                // Perform initial sync to load tasks from the selected task list
                try {
                    const mergedTasks = await this.syncManager.syncTasks();
                    if (mergedTasks) {
                        this.tasks = mergedTasks;
                        this.renderTasks();
                    }
                } catch (error) {
                    console.error('Initial sync failed:', error);
                }
                
                this.updateSyncUI();
                this.syncManager.startAutoSync();
            } else {
                await this.storage.saveAuthStatus(false);
            }
        }
        this.updateSyncUI();
    }

    /**
     * Initialize weather widget
     */
    initWeather() {
        this.weatherModule = new WeatherModule();
        this.weatherModule.init();
    }

    /**
     * Initialize news ticker
     */
    async initNews() {
        this.newsModule = new NewsModule(this.storage);

        // Load RSS feeds from settings
        const settings = await this.storage.loadSettings();
        if (settings && settings.rssFeeds) {
            this.newsModule.updateFeeds(settings.rssFeeds);
        }

        await this.newsModule.init();
    }

    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Task input
        const taskInput = document.getElementById('taskInput');
        if (taskInput) {
            taskInput.addEventListener('keypress', this.handleTaskInput);
        }

        // Note: Search is now handled by SearchModule
        // Note: Google sign in and manual sync now handled through settings popup
    }

    /**
     * Handle task input
     */
    async handleTaskInput(e) {
        if (e.key === 'Enter') {
            const text = e.target.value.trim();
            if (text) {
                await this.createTask(text);
                e.target.value = '';
            }
        }
    }

    /**
     * Handle Google sign in/out
     */
    async handleGoogleSignIn() {
        const btn = document.getElementById('googleSignIn');
        const status = document.getElementById('syncStatus');

        if (this.googleAPI.isAuthenticated) {
            // Sign out
            await this.googleAPI.signOut();
            await this.storage.saveAuthStatus(false);
            this.syncManager.stopAutoSync();
            this.updateSyncUI();
            if (status) {
                status.textContent = 'Signed out';
                status.className = 'sync-status';
            }
        } else {
            // Sign in
            if (btn) btn.classList.add('syncing');
            if (status) {
                status.textContent = 'Signing in...';
                status.className = 'sync-status';
            }

            const success = await this.googleAPI.authenticate();
            if (btn) btn.classList.remove('syncing');

            if (success) {
                await this.storage.saveAuthStatus(true);
                this.updateSyncUI();
                this.syncManager.startAutoSync();

                const mergedTasks = await this.syncManager.syncTasks();
                if (mergedTasks) {
                    this.tasks = mergedTasks;
                    this.renderTasks();
                }

                this.updateSyncUI();

                if (status) {
                    status.textContent = 'Sync complete';
                    status.className = 'sync-status success';
                }
            } else {
                if (status) {
                    status.textContent = 'Sign in failed';
                    status.className = 'sync-status error';
                }
            }
        }
    }

    /**
     * Handle manual sync
     */
    async handleManualSync() {
        const btn = document.getElementById('syncNow');
        const status = document.getElementById('syncStatus');

        if (btn) btn.classList.add('syncing');
        if (status) {
            status.textContent = 'Syncing...';
            status.className = 'sync-status';
        }

        const mergedTasks = await this.syncManager.syncTasks();
        if (btn) btn.classList.remove('syncing');

        if (mergedTasks) {
            this.tasks = mergedTasks;
            this.renderTasks();
            this.updateSyncUI();
            if (status) {
                status.textContent = 'Sync complete';
                status.className = 'sync-status success';
            }
        } else {
            if (status) {
                status.textContent = 'Sync failed';
                status.className = 'sync-status error';
            }
        }
    }

    /**
     * Create a new task
     */
    async createTask(text) {
        const newTask = {
            id: Utils.generateId(),
            text,
            done: false,
            subs: [],
            description: '',
            dueDate: null,
            createdAt: new Date().toISOString(),
            position: this.generateNewTaskPosition()
        };

        // Add task at the beginning of the array (Google Tasks behavior)
        this.tasks.unshift(newTask);

        // If authenticated, push to Google as well
        if (this.googleAPI.isAuthenticated) {
            await this.syncManager.pushTaskToGoogle(newTask);
        }

        await this.saveTasks();
        this.renderTasks();
    }

    /**
     * Generate position for new task (Google Tasks style)
     * New tasks get position that puts them at the top
     */
    generateNewTaskPosition() {
        // Find the smallest position among existing incomplete tasks
        const incompleteTasks = this.tasks.filter(task => !task.done);
        if (incompleteTasks.length === 0) {
            return '00000000000000000000000'; // Default position for first task
        }
        
        const minPosition = incompleteTasks.reduce((min, task) => {
            const pos = task.position || '99999999999999999999999';
            return pos < min ? pos : min;
        }, '99999999999999999999999');
        
        // Generate a position that's smaller (comes before) the current minimum
        const newPos = (parseInt(minPosition.substring(0, 10), 36) - 1).toString(36).padStart(10, '0');
        return newPos + '0000000000000';
    }

    /**
     * Update task positions after reordering and sync to Google Tasks
     */
    async updateTaskPositions(fromIndex, toIndex) {
        if (fromIndex === toIndex) return;

        // Get the active (incomplete) tasks that are visible and can be reordered
        const activeTasks = this.tasks.filter(task => !task.done);
        
        // Find the task that was moved
        const movedTask = activeTasks[fromIndex];
        if (!movedTask) return;

        // Calculate new position based on surrounding tasks
        let newPosition;
        if (toIndex === 0) {
            // Moving to the top
            const nextTask = activeTasks[1];
            if (nextTask && nextTask.position) {
                const nextPos = nextTask.position;
                const newPos = (parseInt(nextPos.substring(0, 10), 36) - 1).toString(36).padStart(10, '0');
                newPosition = newPos + '0000000000000';
            } else {
                newPosition = '00000000000000000000000';
            }
        } else if (toIndex >= activeTasks.length - 1) {
            // Moving to the bottom
            const prevTask = activeTasks[activeTasks.length - 1];
            if (prevTask && prevTask.position) {
                const prevPos = prevTask.position;
                const newPos = (parseInt(prevPos.substring(0, 10), 36) + 1).toString(36).padStart(10, '0');
                newPosition = newPos + '0000000000000';
            } else {
                newPosition = '99999999999999999999999';
            }
        } else {
            // Moving between tasks
            const prevTask = activeTasks[toIndex - 1];
            const nextTask = activeTasks[toIndex + 1];
            
            if (prevTask && nextTask && prevTask.position && nextTask.position) {
                // Generate position between prev and next
                const prevPos = parseInt(prevTask.position.substring(0, 10), 36);
                const nextPos = parseInt(nextTask.position.substring(0, 10), 36);
                const midPos = Math.floor((prevPos + nextPos) / 2);
                newPosition = midPos.toString(36).padStart(10, '0') + '0000000000000';
            } else {
                newPosition = Date.now().toString(36).padStart(23, '0');
            }
        }

        // Update the task's position
        movedTask.position = newPosition;

        // If authenticated with Google, sync the new position
        if (this.googleAPI.isAuthenticated && movedTask.googleId) {
            try {
                // Find the previous task for Google Tasks move API
                const previousTaskId = toIndex > 0 && activeTasks[toIndex - 1] 
                    ? activeTasks[toIndex - 1].googleId 
                    : null;
                
                await this.googleAPI.moveTask(movedTask.googleId, null, previousTaskId);
                console.log('Task position synced to Google Tasks');
            } catch (error) {
                console.error('Failed to sync task position to Google:', error);
            }
        }

        // Save the updated tasks
        await this.saveTasks();
    }

    /**
     * Load tasks from storage
     */
    async loadTasks() {
        try {
            this.tasks = await this.storage.loadTasks();
        } catch (error) {
            console.error('Failed to load tasks:', error);
            this.tasks = [];
        }
    }

    /**
     * Save tasks to storage
     */
    async saveTasks() {
        try {
            await this.storage.saveTasks(this.tasks);

            // If authenticated with Google, sync in background
            if (this.googleAPI.isAuthenticated && !this.syncManager.syncInProgress) {
                this.syncManager.syncTasks().catch(err =>
                    console.error('Background sync failed:', err)
                );
            }
        } catch (error) {
            console.error('Failed to save tasks:', error);
        }
    }

    /**
     * Render tasks in the UI
     */
    renderTasks() {
        const taskRenderer = new TaskRenderer(this.tasks, this);
        taskRenderer.render();
    }

    /**
     * Update sync UI state
     */
    updateSyncUI() {
        const syncStatusMinimal = document.getElementById('syncStatusMinimal');

        if (this.googleAPI.isAuthenticated) {
            if (syncStatusMinimal) {
                const lastSync = this.syncManager.lastSyncTime;
                if (lastSync) {
                    const timeAgo = Utils.getTimeAgo(lastSync);
                    syncStatusMinimal.textContent = `Synced ${timeAgo}`;
                } else {
                    syncStatusMinimal.textContent = 'Connected, not synced yet';
                }
            }
        } else {
            if (syncStatusMinimal) {
                syncStatusMinimal.textContent = 'Not synced';
            }
        }
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const app = new NewTabApp();
    app.init();

    // Make app and settings globally available
    window.NewTabApp = app;
    window.settingsModule = app.settingsModule;
});

// Initialize immediately if DOM is already loaded
if (document.readyState === 'loading') {
    // DOM is still loading
} else {
    // DOM has already loaded
    const app = new NewTabApp();
    app.init();
    window.NewTabApp = app;
    window.settingsModule = app.settingsModule;
}