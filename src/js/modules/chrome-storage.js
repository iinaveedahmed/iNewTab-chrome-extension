// Chrome Storage API Wrapper

class ChromeStorage {
    constructor() {
        this.storage = chrome.storage.local;
    }

    // Save tasks to Chrome storage
    async saveTasks(tasks) {
        try {
            await new Promise((resolve, reject) => {
                this.storage.set({
                    'tasks': tasks,
                    'lastUpdated': new Date().toISOString()
                }, () => {
                    if (chrome.runtime.lastError) {
                        reject(chrome.runtime.lastError);
                    } else {
                        resolve();
                    }
                });
            });
            return true;
        } catch (error) {
            console.error('Failed to save tasks:', error);
            return false;
        }
    }

    // Load tasks from Chrome storage
    async loadTasks() {
        try {
            const result = await new Promise((resolve, reject) => {
                this.storage.get(['tasks'], (result) => {
                    if (chrome.runtime.lastError) {
                        reject(chrome.runtime.lastError);
                    } else {
                        resolve(result);
                    }
                });
            });
            
            const tasks = result.tasks || [];
            
            // Ensure all tasks have position field (for backward compatibility)
            tasks.forEach((task, index) => {
                if (!task.position) {
                    // Generate position based on current order
                    task.position = index.toString().padStart(23, '0');
                }
            });
            
            return tasks;
        } catch (error) {
            console.error('Failed to load tasks:', error);
            return [];
        }
    }

    // Save sync status
    async saveSyncStatus(status) {
        try {
            await new Promise((resolve, reject) => {
                this.storage.set({
                    'syncStatus': status,
                    'lastSyncTime': new Date().toISOString()
                }, () => {
                    if (chrome.runtime.lastError) {
                        reject(chrome.runtime.lastError);
                    } else {
                        resolve();
                    }
                });
            });
            return true;
        } catch (error) {
            console.error('Failed to save sync status:', error);
            return false;
        }
    }

    // Load sync status
    async loadSyncStatus() {
        try {
            const result = await new Promise((resolve, reject) => {
                this.storage.get(['syncStatus', 'lastSyncTime'], (result) => {
                    if (chrome.runtime.lastError) {
                        reject(chrome.runtime.lastError);
                    } else {
                        resolve(result);
                    }
                });
            });
            return {
                status: result.syncStatus || 'never',
                lastSyncTime: result.lastSyncTime || null
            };
        } catch (error) {
            console.error('Failed to load sync status:', error);
            return { status: 'never', lastSyncTime: null };
        }
    }

    // Save authentication status
    async saveAuthStatus(isAuthenticated) {
        try {
            await new Promise((resolve, reject) => {
                this.storage.set({
                    'isAuthenticated': isAuthenticated,
                    'authTime': new Date().toISOString()
                }, () => {
                    if (chrome.runtime.lastError) {
                        reject(chrome.runtime.lastError);
                    } else {
                        resolve();
                    }
                });
            });
            return true;
        } catch (error) {
            console.error('Failed to save auth status:', error);
            return false;
        }
    }

    // Load authentication status
    async loadAuthStatus() {
        try {
            const result = await new Promise((resolve, reject) => {
                this.storage.get(['isAuthenticated', 'authTime'], (result) => {
                    if (chrome.runtime.lastError) {
                        reject(chrome.runtime.lastError);
                    } else {
                        resolve(result);
                    }
                });
            });
            return {
                isAuthenticated: result.isAuthenticated || false,
                authTime: result.authTime || null
            };
        } catch (error) {
            console.error('Failed to load auth status:', error);
            return { isAuthenticated: false, authTime: null };
        }
    }

    // Save cached news (keeping existing functionality)
    async saveCachedNews(news) {
        try {
            await new Promise((resolve, reject) => {
                this.storage.set({
                    'cachedNews': news,
                    'lastNewsUpdate': new Date().toISOString()
                }, () => {
                    if (chrome.runtime.lastError) {
                        reject(chrome.runtime.lastError);
                    } else {
                        resolve();
                    }
                });
            });
            return true;
        } catch (error) {
            console.error('Failed to save cached news:', error);
            return false;
        }
    }

    // Load cached news
    async loadCachedNews() {
        try {
            const result = await new Promise((resolve, reject) => {
                this.storage.get(['cachedNews', 'lastNewsUpdate'], (result) => {
                    if (chrome.runtime.lastError) {
                        reject(chrome.runtime.lastError);
                    } else {
                        resolve(result);
                    }
                });
            });
            return {
                news: result.cachedNews || [],
                lastUpdate: result.lastNewsUpdate ? new Date(result.lastNewsUpdate) : null
            };
        } catch (error) {
            console.error('Failed to load cached news:', error);
            return { news: [], lastUpdate: null };
        }
    }

    // Save quote batch
    async saveQuoteBatch(batchData) {
        try {
            await new Promise((resolve, reject) => {
                this.storage.set({
                    'quoteBatch': batchData
                }, () => {
                    if (chrome.runtime.lastError) {
                        reject(chrome.runtime.lastError);
                    } else {
                        resolve();
                    }
                });
            });
            return true;
        } catch (error) {
            console.error('Failed to save quote batch:', error);
            return false;
        }
    }

    // Load quote batch
    async loadQuoteBatch() {
        try {
            const result = await new Promise((resolve, reject) => {
                this.storage.get(['quoteBatch'], (result) => {
                    if (chrome.runtime.lastError) {
                        reject(chrome.runtime.lastError);
                    } else {
                        resolve(result);
                    }
                });
            });
            return result.quoteBatch || null;
        } catch (error) {
            console.error('Failed to load quote batch:', error);
            return null;
        }
    }

    // Clear all stored data
    async clearAll() {
        try {
            await new Promise((resolve, reject) => {
                this.storage.clear(() => {
                    if (chrome.runtime.lastError) {
                        reject(chrome.runtime.lastError);
                    } else {
                        resolve();
                    }
                });
            });
            return true;
        } catch (error) {
            console.error('Failed to clear storage:', error);
            return false;
        }
    }

    // Get storage usage info
    async getStorageInfo() {
        try {
            const result = await new Promise((resolve, reject) => {
                this.storage.getBytesInUse(null, (bytesInUse) => {
                    if (chrome.runtime.lastError) {
                        reject(chrome.runtime.lastError);
                    } else {
                        resolve(bytesInUse);
                    }
                });
            });
            return result;
        } catch (error) {
            console.error('Failed to get storage info:', error);
            return 0;
        }
    }

    // Save user settings
    async saveSettings(settings) {
        try {
            await new Promise((resolve, reject) => {
                this.storage.set({
                    'userSettings': settings,
                    'settingsUpdated': new Date().toISOString()
                }, () => {
                    if (chrome.runtime.lastError) {
                        reject(chrome.runtime.lastError);
                    } else {
                        resolve();
                    }
                });
            });
            return true;
        } catch (error) {
            console.error('Failed to save settings:', error);
            return false;
        }
    }

    // Load user settings
    async loadSettings() {
        try {
            const result = await new Promise((resolve, reject) => {
                this.storage.get(['userSettings'], (result) => {
                    if (chrome.runtime.lastError) {
                        reject(chrome.runtime.lastError);
                    } else {
                        resolve(result);
                    }
                });
            });
            return result.userSettings || null;
        } catch (error) {
            console.error('Failed to load settings:', error);
            return null;
        }
    }

    // Save selected Google task list
    async saveSelectedTaskList(taskListId) {
        try {
            await new Promise((resolve, reject) => {
                this.storage.set({
                    'selectedTaskListId': taskListId
                }, () => {
                    if (chrome.runtime.lastError) {
                        reject(chrome.runtime.lastError);
                    } else {
                        resolve();
                    }
                });
            });
            return true;
        } catch (error) {
            console.error('Failed to save selected task list:', error);
            return false;
        }
    }

    // Load selected Google task list
    async loadSelectedTaskList() {
        try {
            const result = await new Promise((resolve, reject) => {
                this.storage.get(['selectedTaskListId'], (result) => {
                    if (chrome.runtime.lastError) {
                        reject(chrome.runtime.lastError);
                    } else {
                        resolve(result);
                    }
                });
            });
            return result.selectedTaskListId || null;
        } catch (error) {
            console.error('Failed to load selected task list:', error);
            return null;
        }
    }
}

// Export for use in other modules
window.ChromeStorage = ChromeStorage;