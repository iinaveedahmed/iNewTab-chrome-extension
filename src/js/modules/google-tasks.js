// Google Tasks API Integration Module

class GoogleTasksAPI {
    constructor() {
        this.isAuthenticated = false;
        this.accessToken = null;
        this.taskListId = null; // Default task list ID
        this.availableTaskLists = [];
    }

    // Authenticate with Google Tasks API
    async authenticate() {
        try {
            const token = await new Promise((resolve, reject) => {
                chrome.identity.getAuthToken({ interactive: true }, (token) => {
                    if (chrome.runtime.lastError) {
                        reject(chrome.runtime.lastError);
                    } else {
                        resolve(token);
                    }
                });
            });

            this.accessToken = token;
            this.isAuthenticated = true;

            // Get all task lists and set default
            await this.getAllTaskLists();
            if (this.availableTaskLists.length > 0) {
                this.taskListId = this.availableTaskLists[0].id;
            }

            return true;
        } catch (error) {
            console.error('Authentication failed:', error);
            return false;
        }
    }

    // Sign out and revoke token
    async signOut() {
        if (this.accessToken) {
            await new Promise((resolve) => {
                chrome.identity.removeCachedAuthToken({ token: this.accessToken }, resolve);
            });
        }
        this.isAuthenticated = false;
        this.accessToken = null;
        this.taskListId = null;
    }

    // Get all available task lists
    async getAllTaskLists() {
        try {
            const response = await fetch('https://www.googleapis.com/tasks/v1/users/@me/lists', {
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`
                }
            });

            const data = await response.json();
            if (data.items && data.items.length > 0) {
                this.availableTaskLists = data.items.map(list => ({
                    id: list.id,
                    title: list.title
                }));
                return this.availableTaskLists;
            }
        } catch (error) {
            console.error('Failed to get task lists:', error);
        }
        return [];
    }

    // Get default task list
    async getDefaultTaskList() {
        try {
            const response = await fetch('https://www.googleapis.com/tasks/v1/users/@me/lists', {
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`
                }
            });

            const data = await response.json();
            if (data.items && data.items.length > 0) {
                this.availableTaskLists = data.items.map(list => ({
                    id: list.id,
                    title: list.title
                }));
                this.taskListId = data.items[0].id; // Use the first (default) task list
                return this.taskListId;
            }
        } catch (error) {
            console.error('Failed to get task lists:', error);
        }
        return null;
    }

    // Set active task list
    setTaskList(taskListId) {
        this.taskListId = taskListId;
    }

    // Get all tasks from Google Tasks
    async getTasks() {
        if (!this.isAuthenticated || !this.taskListId) {
            throw new Error('Not authenticated or no task list');
        }

        try {
            const response = await fetch(
                `https://www.googleapis.com/tasks/v1/lists/${this.taskListId}/tasks?showCompleted=true&showDeleted=false`,
                {
                    headers: {
                        'Authorization': `Bearer ${this.accessToken}`
                    }
                }
            );

            const data = await response.json();
            return this.convertGoogleTasksToLocal(data.items || []);
        } catch (error) {
            console.error('Failed to fetch tasks:', error);
            return [];
        }
    }

    // Create a new task in Google Tasks
    async createTask(taskData) {
        if (!this.isAuthenticated || !this.taskListId) {
            throw new Error('Not authenticated or no task list');
        }

        try {
            const googleTask = {
                title: taskData.text,
                status: taskData.done ? 'completed' : 'needsAction',
                notes: taskData.description || ''
            };

            // Add due date if present
            if (taskData.dueDate) {
                googleTask.due = new Date(taskData.dueDate).toISOString();
            }

            const response = await fetch(
                `https://www.googleapis.com/tasks/v1/lists/${this.taskListId}/tasks`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${this.accessToken}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(googleTask)
                }
            );

            const createdTask = await response.json();

            // Handle subtasks
            if (taskData.subs && taskData.subs.length > 0) {
                for (const sub of taskData.subs) {
                    await this.createSubTask(createdTask.id, sub);
                }
            }

            return createdTask;
        } catch (error) {
            console.error('Failed to create task:', error);
            throw error;
        }
    }

    // Create a subtask (child task)
    async createSubTask(parentId, subTaskData) {
        try {
            const googleSubTask = {
                title: subTaskData.text,
                status: subTaskData.done ? 'completed' : 'needsAction',
                parent: parentId
            };

            const response = await fetch(
                `https://www.googleapis.com/tasks/v1/lists/${this.taskListId}/tasks`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${this.accessToken}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(googleSubTask)
                }
            );

            return await response.json();
        } catch (error) {
            console.error('Failed to create subtask:', error);
            throw error;
        }
    }

    // Update an existing task
    async updateTask(taskId, taskData) {
        if (!this.isAuthenticated || !this.taskListId) {
            throw new Error('Not authenticated or no task list');
        }

        try {
            const googleTask = {
                id: taskId,
                title: taskData.text,
                status: taskData.done ? 'completed' : 'needsAction',
                notes: taskData.description || ''
            };

            // Add due date if present
            if (taskData.dueDate) {
                googleTask.due = new Date(taskData.dueDate).toISOString();
            }

            const response = await fetch(
                `https://www.googleapis.com/tasks/v1/lists/${this.taskListId}/tasks/${taskId}`,
                {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${this.accessToken}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(googleTask)
                }
            );

            return await response.json();
        } catch (error) {
            console.error('Failed to update task:', error);
            throw error;
        }
    }

    // Move a task to a new position in Google Tasks
    async moveTask(taskId, parent = null, previous = null) {
        if (!this.isAuthenticated || !this.taskListId) {
            throw new Error('Not authenticated or no task list');
        }

        try {
            let url = `https://www.googleapis.com/tasks/v1/lists/${this.taskListId}/tasks/${taskId}/move`;
            const params = new URLSearchParams();
            
            if (parent) {
                params.append('parent', parent);
            }
            if (previous) {
                params.append('previous', previous);
            }
            
            if (params.toString()) {
                url += '?' + params.toString();
            }

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`
                }
            });

            if (!response.ok) {
                throw new Error(`Move task failed: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Failed to move task:', error);
            throw error;
        }
    }

    // Delete a task
    async deleteTask(taskId) {
        if (!this.isAuthenticated || !this.taskListId) {
            throw new Error('Not authenticated or no task list');
        }

        try {
            await fetch(
                `https://www.googleapis.com/tasks/v1/lists/${this.taskListId}/tasks/${taskId}`,
                {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${this.accessToken}`
                    }
                }
            );
            return true;
        } catch (error) {
            console.error('Failed to delete task:', error);
            return false;
        }
    }

    // Convert Google Tasks format to local format
    convertGoogleTasksToLocal(googleTasks) {
        const taskMap = new Map();
        const parentTasks = [];

        // First pass: create all tasks with position preserved
        googleTasks.forEach(gTask => {
            const localTask = {
                id: gTask.id,
                text: gTask.title || '',
                done: gTask.status === 'completed',
                subs: [],
                googleId: gTask.id,
                parent: gTask.parent || null,
                description: gTask.notes || '',
                dueDate: gTask.due ? new Date(gTask.due).toISOString().split('T')[0] : null,
                position: gTask.position || '0', // Preserve Google's position
                createdAt: gTask.updated || new Date().toISOString() // Use Google's updated time
            };
            taskMap.set(gTask.id, localTask);

            if (!gTask.parent) {
                parentTasks.push(localTask);
            }
        });

        // Second pass: organize subtasks
        googleTasks.forEach(gTask => {
            if (gTask.parent && taskMap.has(gTask.parent)) {
                const parentTask = taskMap.get(gTask.parent);
                const childTask = taskMap.get(gTask.id);

                // Convert child to subtask format
                parentTask.subs.push({
                    text: childTask.text,
                    done: childTask.done,
                    googleId: childTask.googleId
                });
            }
        });

        return parentTasks;
    }

    // Convert local format to Google Tasks format
    convertLocalToGoogleTasks(localTasks) {
        const googleTasks = [];

        localTasks.forEach(task => {
            // Add main task
            const googleTask = {
                title: task.text,
                status: task.done ? 'completed' : 'needsAction',
                id: task.googleId || undefined,
                notes: task.description || ''
            };

            // Add due date if present
            if (task.dueDate) {
                googleTask.due = new Date(task.dueDate).toISOString();
            }

            googleTasks.push(googleTask);

            // Add subtasks
            if (task.subs && task.subs.length > 0) {
                task.subs.forEach(sub => {
                    googleTasks.push({
                        title: sub.text,
                        status: sub.done ? 'completed' : 'needsAction',
                        parent: task.googleId,
                        id: sub.googleId || undefined
                    });
                });
            }
        });

        return googleTasks;
    }

    // Check if user is authenticated
    async checkAuthStatus() {
        try {
            const token = await new Promise((resolve, reject) => {
                chrome.identity.getAuthToken({ interactive: false }, (token) => {
                    if (chrome.runtime.lastError) {
                        resolve(null);
                    } else {
                        resolve(token);
                    }
                });
            });

            if (token) {
                this.accessToken = token;
                this.isAuthenticated = true;
                await this.getAllTaskLists();
                if (this.availableTaskLists.length > 0) {
                    this.taskListId = this.availableTaskLists[0].id;
                }
                return true;
            }
            return false;
        } catch (error) {
            return false;
        }
    }
}

// Export for use in other modules
window.GoogleTasksAPI = GoogleTasksAPI;