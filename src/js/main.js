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

        // Application state
        this.tasks = [];
        this.isInitialized = false;
        this.newsModule = null;

        // Bind methods
        this.handleSearch = this.handleSearch.bind(this);
        this.handleTaskInput = this.handleTaskInput.bind(this);
        this.handleGoogleSignIn = this.handleGoogleSignIn.bind(this);
        this.handleManualSync = this.handleManualSync.bind(this);
    }

    /**
     * Initialize the application
     */
    async init() {
        try {
            // Start clock
            this.initClock();

            // Initialize task management
            await this.initTasks();

            // Initialize authentication
            await this.initAuth();

            // Initialize weather and news
            this.initWeather();
            await this.initNews();

            // Initialize settings
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
        const weatherModule = new WeatherModule();
        weatherModule.init();
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
        // Search form
        const searchForm = document.getElementById('searchForm');
        if (searchForm) {
            searchForm.addEventListener('submit', this.handleSearch);
        }

        // Task input
        const taskInput = document.getElementById('taskInput');
        if (taskInput) {
            taskInput.addEventListener('keypress', this.handleTaskInput);
        }

        // Note: Google sign in and manual sync now handled through settings popup
    }

    /**
     * Handle search form submission
     */
    handleSearch(e) {
        e.preventDefault();
        Utils.safe(() => {
            const searchBox = document.getElementById('searchBox');
            const query = searchBox?.value.trim();

            if (!query) return;

            const searchUrl = query.startsWith('g:')
                ? `https://www.google.com/search?q=${encodeURIComponent(query.slice(2).trim())}`
                : `https://www.perplexity.ai/search?q=${encodeURIComponent(query)}`;

            window.location.href = searchUrl;
        });
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
            createdAt: new Date().toISOString()
        };

        this.tasks.push(newTask);

        // If authenticated, push to Google as well
        if (this.googleAPI.isAuthenticated) {
            await this.syncManager.pushTaskToGoogle(newTask);
        }

        await this.saveTasks();
        this.renderTasks();
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