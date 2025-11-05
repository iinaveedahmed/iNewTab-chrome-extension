/**
 * Settings module for managing user preferences and configurations
 */

class SettingsModule {
    constructor(app) {
        this.app = app;
        this.isOpen = false;
        this.currentTheme = 'dark';
        this.rssFeeds = Constants.RSS_FEEDS.slice(); // Copy default feeds

        // DOM elements
        this.settingsBtn = null;
        this.settingsPopup = null;
        this.settingsClose = null;

        // Bind methods
        this.toggleSettings = this.toggleSettings.bind(this);
        this.closeSettings = this.closeSettings.bind(this);
        this.handleClickOutside = this.handleClickOutside.bind(this);
    }

    /**
     * Initialize the settings module
     */
    async init() {
        this.setupEventListeners();
        await this.loadSettings();
        this.updateUI();
    }

    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Settings toggle
        this.settingsBtn = document.getElementById('settingsBtn');
        this.settingsPopup = document.getElementById('settingsPopup');
        this.settingsClose = document.getElementById('settingsClose');

        if (this.settingsBtn) {
            this.settingsBtn.addEventListener('click', this.toggleSettings);
        }

        if (this.settingsClose) {
            this.settingsClose.addEventListener('click', this.closeSettings);
        }

        // Click outside to close
        document.addEventListener('click', this.handleClickOutside);

        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tabName = e.target.closest('.tab-btn').dataset.tab;
                this.switchTab(tabName);
            });
        });

        // Theme toggle
        document.querySelectorAll('.theme-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const theme = e.target.closest('.theme-btn').dataset.theme;
                this.setTheme(theme);
            });
        });

        // Google Auth
        const authBtn = document.getElementById('settingsGoogleAuth');
        if (authBtn) {
            authBtn.addEventListener('click', () => this.handleGoogleAuth());
        }

        // Force resync
        const resyncBtn = document.getElementById('settingsResync');
        if (resyncBtn) {
            resyncBtn.addEventListener('click', () => this.handleForceResync());
        }

        // RSS management
        const addRssBtn = document.getElementById('addRssBtn');
        if (addRssBtn) {
            addRssBtn.addEventListener('click', () => this.addRssFeed());
        }

        const rssInput = document.getElementById('newRssUrl');
        if (rssInput) {
            rssInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.addRssFeed();
                }
            });
        }

        // Clear storage
        const clearBtn = document.getElementById('clearStorageBtn');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.handleClearStorage());
        }

        // Task list selection
        const taskListSelect = document.getElementById('taskListSelect');
        if (taskListSelect) {
            taskListSelect.addEventListener('change', (e) => this.handleTaskListChange(e.target.value));
        }
    }

    /**
     * Switch between settings tabs
     */
    switchTab(tabName) {
        // Remove active class from all tabs and content
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

        // Add active class to selected tab and content
        const tabBtn = document.querySelector(`[data-tab="${tabName}"]`);
        const tabContent = document.getElementById(`${tabName}Tab`);

        if (tabBtn) tabBtn.classList.add('active');
        if (tabContent) tabContent.classList.add('active');
    }

    /**
     * Toggle settings popup
     */
    toggleSettings() {
        if (this.isOpen) {
            this.closeSettings();
        } else {
            this.openSettings();
        }
    }

    /**
     * Open settings popup
     */
    openSettings() {
        if (this.settingsPopup) {
            this.settingsPopup.classList.add('visible');
            this.isOpen = true;
            this.updateSyncStatus();
            this.updateStorageInfo();
            this.renderRssFeeds();
        }
    }

    /**
     * Close settings popup
     */
    closeSettings() {
        if (this.settingsPopup) {
            this.settingsPopup.classList.remove('visible');
            this.isOpen = false;
        }
    }

    /**
     * Handle click outside settings popup
     */
    handleClickOutside(e) {
        if (this.isOpen && this.settingsPopup && !this.settingsPopup.contains(e.target) && !this.settingsBtn.contains(e.target)) {
            this.closeSettings();
        }
    }

    /**
     * Set application theme
     */
    async setTheme(theme) {
        this.currentTheme = theme;
        document.body.className = theme === 'light' ? 'light-theme' : '';

        // Update theme buttons
        document.querySelectorAll('.theme-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.theme === theme);
        });

        // Save to storage
        await this.saveSettings();
    }

    /**
     * Handle Google authentication
     */
    async handleGoogleAuth() {
        const authBtn = document.getElementById('settingsGoogleAuth');
        const authText = document.getElementById('authButtonText');

        if (this.app.googleAPI.isAuthenticated) {
            // Sign out
            authText.textContent = 'Disconnecting...';
            await this.app.handleGoogleSignIn(); // Reuse existing handler
        } else {
            // Sign in
            authText.textContent = 'Connecting...';
            await this.app.handleGoogleSignIn(); // Reuse existing handler
        }

        this.updateSyncStatus();
    }

    /**
     * Handle force resync
     */
    async handleForceResync() {
        const resyncBtn = document.getElementById('settingsResync');
        if (resyncBtn) {
            resyncBtn.disabled = true;
            resyncBtn.innerHTML = '<i class="material-icons">sync</i>Syncing...';

            try {
                const mergedTasks = await this.app.syncManager.syncTasks();
                if (mergedTasks) {
                    this.app.tasks = mergedTasks;
                    this.app.renderTasks();
                    this.showSyncStatus('Sync completed successfully', 'success');
                } else {
                    this.showSyncStatus('Sync failed', 'error');
                }
            } catch (error) {
                console.error('Force resync failed:', error);
                this.showSyncStatus('Sync failed', 'error');
            } finally {
                resyncBtn.disabled = false;
                resyncBtn.innerHTML = '<i class="material-icons">sync</i>Force Resync';
            }
        }
    }

    /**
     * Add RSS feed
     */
    async addRssFeed() {
        const input = document.getElementById('newRssUrl');
        const url = input.value.trim();

        if (!url) return;

        try {
            new URL(url); // Validate URL
        } catch (error) {
            alert('Please enter a valid URL');
            return;
        }

        if (this.rssFeeds.includes(url)) {
            alert('This RSS feed is already added');
            return;
        }

        this.rssFeeds.push(url);
        await this.saveSettings();
        this.renderRssFeeds();
        input.value = '';

        // Update news module with new feeds
        if (this.app.newsModule) {
            this.app.newsModule.updateFeeds(this.rssFeeds);
        }
    }

    /**
     * Remove RSS feed
     */
    async removeRssFeed(url) {
        const index = this.rssFeeds.indexOf(url);
        if (index > -1) {
            this.rssFeeds.splice(index, 1);
            await this.saveSettings();
            this.renderRssFeeds();

            // Update news module
            if (this.app.newsModule) {
                this.app.newsModule.updateFeeds(this.rssFeeds);
            }
        }
    }

    /**
     * Render RSS feeds list
     */
    renderRssFeeds() {
        const rssList = document.getElementById('rssList');
        if (!rssList) return;

        if (this.rssFeeds.length === 0) {
            rssList.innerHTML = '<p style="color: #666; font-size: 12px; text-align: center; padding: 16px;">No RSS feeds configured</p>';
            return;
        }

        rssList.innerHTML = this.rssFeeds.map(url => {
            const displayUrl = url.length > 40 ? url.substring(0, 40) + '...' : url;
            return `
                <div class="rss-item">
                    <span class="rss-url" title="${this.escapeHtml(url)}">${this.escapeHtml(displayUrl)}</span>
                    <button class="rss-remove" onclick="window.settingsModule.removeRssFeed('${this.escapeHtml(url)}')" title="Remove feed">
                        <i class="material-icons" style="font-size: 16px;">delete</i>
                    </button>
                </div>
            `;
        }).join('');
    }

    /**
     * Handle clear storage
     */
    async handleClearStorage() {
        if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
            try {
                await this.app.storage.clearAll();
                this.showSyncStatus('All data cleared', 'success');

                // Reset application state
                this.app.tasks = [];
                this.app.renderTasks();

                // Sign out if authenticated
                if (this.app.googleAPI.isAuthenticated) {
                    await this.app.googleAPI.signOut();
                }

                this.updateSyncStatus();
                this.updateStorageInfo();
            } catch (error) {
                console.error('Failed to clear storage:', error);
                this.showSyncStatus('Failed to clear data', 'error');
            }
        }
    }

    /**
     * Update sync status display
     */
    updateSyncStatus() {
        const authBtn = document.getElementById('settingsGoogleAuth');
        const authText = document.getElementById('authButtonText');
        const resyncBtn = document.getElementById('settingsResync');
        const statusText = document.getElementById('settingsSyncStatus');
        const taskListRow = document.getElementById('taskListSelectionRow');

        if (this.app.googleAPI.isAuthenticated) {
            if (authText) authText.textContent = 'Disconnect Google';
            if (resyncBtn) resyncBtn.disabled = false;
            if (taskListRow) taskListRow.style.display = 'block';
            
            // Show last sync time if available
            const lastSync = this.app.syncManager.lastSyncTime;
            let statusMessage = 'Connected to Google Tasks';
            if (lastSync) {
                const timeAgo = Utils.getTimeAgo(lastSync);
                statusMessage += ` • Last synced ${timeAgo}`;
            }
            
            if (statusText) {
                statusText.textContent = statusMessage;
                statusText.className = 'sync-status-text success';
            }
            
            // Update task list dropdown
            this.updateTaskListDropdown();
        } else {
            if (authText) authText.textContent = 'Connect Google';
            if (resyncBtn) resyncBtn.disabled = true;
            if (taskListRow) taskListRow.style.display = 'none';
            if (statusText) {
                statusText.textContent = 'Not connected';
                statusText.className = 'sync-status-text';
            }
        }
    }

    /**
     * Update task list dropdown
     */
    async updateTaskListDropdown() {
        const taskListSelect = document.getElementById('taskListSelect');
        if (!taskListSelect || !this.app.googleAPI.isAuthenticated) return;

        // Clear existing options
        taskListSelect.innerHTML = '<option value="">Loading...</option>';

        try {
            const taskLists = await this.app.googleAPI.getAllTaskLists();
            taskListSelect.innerHTML = '';

            if (taskLists.length === 0) {
                taskListSelect.innerHTML = '<option value="">No task lists found</option>';
                return;
            }

            // Add options for each task list
            taskLists.forEach(list => {
                const option = document.createElement('option');
                option.value = list.id;
                option.textContent = list.title;
                taskListSelect.appendChild(option);
            });

            // Set selected value from storage
            const selectedTaskListId = await this.app.storage.loadSelectedTaskList();
            if (selectedTaskListId) {
                taskListSelect.value = selectedTaskListId;
                this.app.googleAPI.setTaskList(selectedTaskListId);
            } else if (taskLists.length > 0) {
                // Default to first task list
                taskListSelect.value = taskLists[0].id;
                this.app.googleAPI.setTaskList(taskLists[0].id);
                await this.app.storage.saveSelectedTaskList(taskLists[0].id);
            }
        } catch (error) {
            console.error('Failed to load task lists:', error);
            taskListSelect.innerHTML = '<option value="">Error loading task lists</option>';
        }
    }

    /**
     * Handle task list selection change
     */
    async handleTaskListChange(taskListId) {
        if (!taskListId) return;

        try {
            // Save selection to storage
            await this.app.storage.saveSelectedTaskList(taskListId);
            
            // Update Google API
            this.app.googleAPI.setTaskList(taskListId);
            
            // Show loading state
            this.showSyncStatus('Switching task list...', '');
            
            // Clear all local tasks first to ensure clean switch
            this.app.tasks = [];
            this.app.renderTasks();
            await this.app.saveTasks();
            
            // Force download tasks from the new task list only
            const newTasks = await this.app.syncManager.forceDownloadFromGoogle();
            if (newTasks) {
                this.app.tasks = newTasks;
                this.app.renderTasks();
                this.showSyncStatus('Task list switched successfully', 'success');
            } else {
                this.showSyncStatus('Failed to load tasks from new list', 'error');
            }
            
            // Update main sync UI
            this.app.updateSyncUI();
            
        } catch (error) {
            console.error('Failed to update task list:', error);
            this.showSyncStatus('Failed to update task list', 'error');
        }
    }

    /**
     * Show sync status message
     */
    showSyncStatus(message, type = '') {
        const statusText = document.getElementById('settingsSyncStatus');
        if (statusText) {
            statusText.textContent = message;
            statusText.className = `sync-status-text ${type}`;

            // Reset to normal status after 3 seconds
            if (type) {
                setTimeout(() => {
                    this.updateSyncStatus();
                }, 3000);
            }
        }
    }

    /**
     * Update storage information
     */
    async updateStorageInfo() {
        try {
            const bytesUsed = await this.app.storage.getStorageInfo();
            const usageKB = (bytesUsed / 1024).toFixed(1);
            const maxStorage = 10240; // 10MB Chrome storage quota
            const usagePercent = Math.min((bytesUsed / (maxStorage * 1024)) * 100, 100);

            const storageBar = document.getElementById('storageBar');
            const storageText = document.getElementById('storageText');

            if (storageBar) {
                storageBar.style.width = `${usagePercent}%`;
            }

            if (storageText) {
                storageText.textContent = `${usageKB} KB used`;
            }
        } catch (error) {
            console.error('Failed to get storage info:', error);
            const storageText = document.getElementById('storageText');
            if (storageText) {
                storageText.textContent = 'Storage info unavailable';
            }
        }
    }

    /**
     * Load settings from storage
     */
    async loadSettings() {
        try {
            const settings = await this.app.storage.loadSettings();
            if (settings) {
                this.currentTheme = settings.theme || 'dark';
                this.rssFeeds = settings.rssFeeds || Constants.RSS_FEEDS.slice();
            }
        } catch (error) {
            console.error('Failed to load settings:', error);
        }
    }

    /**
     * Save settings to storage
     */
    async saveSettings() {
        try {
            const settings = {
                theme: this.currentTheme,
                rssFeeds: this.rssFeeds,
                lastUpdated: new Date().toISOString()
            };

            await this.app.storage.saveSettings(settings);
        } catch (error) {
            console.error('Failed to save settings:', error);
        }
    }

    /**
     * Update UI based on current settings
     */
    updateUI() {
        // Apply theme
        document.body.className = this.currentTheme === 'light' ? 'light-theme' : '';

        // Update theme buttons
        document.querySelectorAll('.theme-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.theme === this.currentTheme);
        });
    }

    /**
     * Get current RSS feeds
     */
    getRssFeeds() {
        return this.rssFeeds.slice(); // Return copy
    }

    /**
     * Escape HTML to prevent XSS
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Clean up the module
     */
    destroy() {
        document.removeEventListener('click', this.handleClickOutside);

        if (this.settingsBtn) {
            this.settingsBtn.removeEventListener('click', this.toggleSettings);
        }

        if (this.settingsClose) {
            this.settingsClose.removeEventListener('click', this.closeSettings);
        }
    }
}

// Export for use in other modules
window.SettingsModule = SettingsModule;