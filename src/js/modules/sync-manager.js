// Sync Manager for Google Tasks Integration

class SyncManager {
    constructor(googleTasksAPI, chromeStorage) {
        this.googleAPI = googleTasksAPI;
        this.storage = chromeStorage;
        this.syncInProgress = false;
        this.lastSyncTime = null;
        this.syncInterval = 5 * 60 * 1000; // 5 minutes
        this.autoSyncTimer = null;
    }

    // Start automatic synchronization
    startAutoSync() {
        if (this.autoSyncTimer) {
            clearInterval(this.autoSyncTimer);
        }

        this.autoSyncTimer = setInterval(async () => {
            if (this.googleAPI.isAuthenticated && !this.syncInProgress) {
                await this.syncTasks();
            }
        }, this.syncInterval);
    }

    // Stop automatic synchronization
    stopAutoSync() {
        if (this.autoSyncTimer) {
            clearInterval(this.autoSyncTimer);
            this.autoSyncTimer = null;
        }
    }

    // Main sync function
    async syncTasks() {
        if (this.syncInProgress) {
            console.log('Sync already in progress');
            return false;
        }

        this.syncInProgress = true;
        console.log('Starting task synchronization...');

        try {
            // Load local tasks
            const localTasks = await this.storage.loadTasks();

            // Load Google Tasks
            const googleTasks = await this.googleAPI.getTasks();

            // Perform bidirectional sync
            const mergedTasks = await this.mergeTasks(localTasks, googleTasks);

            // Save merged tasks locally
            await this.storage.saveTasks(mergedTasks);

            // Update sync status
            await this.storage.saveSyncStatus('success');
            this.lastSyncTime = new Date();

            console.log('Sync completed successfully');
            return mergedTasks;

        } catch (error) {
            console.error('Sync failed:', error);
            await this.storage.saveSyncStatus('failed');
            return false;
        } finally {
            this.syncInProgress = false;
        }
    }

    // Merge local and Google tasks
    async mergeTasks(localTasks, googleTasks) {
        const mergedTasks = [];
        const googleTasksMap = new Map();

        // Create map of Google tasks by ID
        googleTasks.forEach(task => {
            if (task.googleId) {
                googleTasksMap.set(task.googleId, task);
            }
        });

        // Process local tasks
        for (const localTask of localTasks) {
            if (localTask.googleId && googleTasksMap.has(localTask.googleId)) {
                // Task exists in both - merge changes
                const googleTask = googleTasksMap.get(localTask.googleId);
                const mergedTask = await this.mergeTaskData(localTask, googleTask);
                mergedTasks.push(mergedTask);
                googleTasksMap.delete(localTask.googleId);
            } else if (localTask.googleId) {
                // Local task has Google ID but not found in Google - might be deleted
                // Keep local copy for now (could implement conflict resolution)
                mergedTasks.push(localTask);
            } else {
                // New local task - push to Google
                try {
                    const createdTask = await this.googleAPI.createTask(localTask);
                    localTask.googleId = createdTask.id;
                    mergedTasks.push(localTask);
                } catch (error) {
                    console.error('Failed to create task in Google:', error);
                    // Keep local task even if Google sync failed
                    mergedTasks.push(localTask);
                }
            }
        }

        // Add remaining Google tasks that weren't in local storage
        for (const [id, googleTask] of googleTasksMap) {
            mergedTasks.push(googleTask);
        }

        return mergedTasks;
    }

    // Merge individual task data
    async mergeTaskData(localTask, googleTask) {
        // Simple last-write-wins strategy for now
        // In a more sophisticated version, you might compare timestamps

        // If local task was modified more recently, update Google
        if (this.needsGoogleUpdate(localTask, googleTask)) {
            try {
                await this.googleAPI.updateTask(googleTask.googleId, localTask);
                return { ...localTask, googleId: googleTask.googleId };
            } catch (error) {
                console.error('Failed to update Google task:', error);
                return googleTask; // Fall back to Google version
            }
        }

        // Otherwise, use Google version
        return googleTask;
    }

    // Check if local task needs to be pushed to Google
    needsGoogleUpdate(localTask, googleTask) {
        // Simple comparison - in practice you might want timestamps
        return (
            localTask.text !== googleTask.text ||
            localTask.done !== googleTask.done ||
            (localTask.description || '') !== (googleTask.description || '') ||
            (localTask.dueDate || '') !== (googleTask.dueDate || '') ||
            !this.arraysEqual(localTask.subs, googleTask.subs)
        );
    }

    // Helper function to compare arrays
    arraysEqual(a, b) {
        if (!a || !b) return a === b;
        if (a.length !== b.length) return false;

        for (let i = 0; i < a.length; i++) {
            if (a[i].text !== b[i].text || a[i].done !== b[i].done) {
                return false;
            }
        }
        return true;
    }

    // Push a single new task to Google
    async pushTaskToGoogle(task) {
        if (!this.googleAPI.isAuthenticated) {
            return false;
        }

        try {
            const createdTask = await this.googleAPI.createTask(task);
            task.googleId = createdTask.id;
            return true;
        } catch (error) {
            console.error('Failed to push task to Google:', error);
            return false;
        }
    }

    // Update a single task in Google
    async updateTaskInGoogle(task) {
        if (!this.googleAPI.isAuthenticated || !task.googleId) {
            return false;
        }

        try {
            await this.googleAPI.updateTask(task.googleId, task);
            return true;
        } catch (error) {
            console.error('Failed to update task in Google:', error);
            return false;
        }
    }

    // Delete a task from Google
    async deleteTaskFromGoogle(task) {
        if (!this.googleAPI.isAuthenticated || !task.googleId) {
            return false;
        }

        try {
            await this.googleAPI.deleteTask(task.googleId);
            return true;
        } catch (error) {
            console.error('Failed to delete task from Google:', error);
            return false;
        }
    }

    // Force full sync (download all from Google and overwrite local)
    async forceDownloadFromGoogle() {
        if (!this.googleAPI.isAuthenticated) {
            throw new Error('Not authenticated with Google');
        }

        this.syncInProgress = true;
        try {
            const googleTasks = await this.googleAPI.getTasks();
            await this.storage.saveTasks(googleTasks);
            await this.storage.saveSyncStatus('force_download');
            console.log('Force download completed');
            return googleTasks;
        } catch (error) {
            console.error('Force download failed:', error);
            throw error;
        } finally {
            this.syncInProgress = false;
        }
    }

    // Force full upload (push all local tasks to Google)
    async forceUploadToGoogle() {
        if (!this.googleAPI.isAuthenticated) {
            throw new Error('Not authenticated with Google');
        }

        this.syncInProgress = true;
        try {
            const localTasks = await this.storage.loadTasks();

            // Clear Google tasks first (optional - be careful!)
            // For safety, we'll just upload and let Google handle duplicates

            for (const task of localTasks) {
                if (!task.googleId) {
                    await this.pushTaskToGoogle(task);
                }
            }

            await this.storage.saveTasks(localTasks);
            await this.storage.saveSyncStatus('force_upload');
            console.log('Force upload completed');
            return localTasks;
        } catch (error) {
            console.error('Force upload failed:', error);
            throw error;
        } finally {
            this.syncInProgress = false;
        }
    }

    // Get sync status
    async getSyncStatus() {
        const status = await this.storage.loadSyncStatus();
        return {
            ...status,
            syncInProgress: this.syncInProgress,
            lastSyncTime: this.lastSyncTime,
            autoSyncEnabled: this.autoSyncTimer !== null
        };
    }
}

// Export for use in other modules
window.SyncManager = SyncManager;