/**
 * Task rendering and UI management module
 */

class TaskRenderer {
    constructor(tasks, app) {
        this.tasks = tasks;
        this.app = app;
    }

    /**
     * Render all tasks in the task list
     */
    render() {
        Utils.safe(() => {
            const list = document.getElementById('taskList');
            const completedList = document.getElementById('completedTaskList');
            const completedSection = document.getElementById('completedTasksSection');
            const completedCount = document.getElementById('completedTasksCount');
            
            if (!list) return;

            list.innerHTML = '';
            if (completedList) completedList.innerHTML = '';

            // Separate active and completed tasks
            const activeTasks = this.tasks.filter(task => !task.done);
            const completedTasks = this.tasks.filter(task => task.done);

            // Sort active tasks using Google Tasks native order (by position)
            const sortedActiveTasks = activeTasks
                .map((task, originalIndex) => ({ task, originalIndex: this.tasks.indexOf(task) }))
                .sort((a, b) => {
                    // Google Tasks uses lexicographic position sorting
                    const aPos = a.task.position || '99999999999999999999999';
                    const bPos = b.task.position || '99999999999999999999999';
                    
                    // Compare positions (smaller position = higher in list)
                    if (aPos !== bPos) {
                        return aPos.localeCompare(bPos);
                    }
                    
                    // If positions are the same, fall back to creation time (newer first)
                    const aCreated = new Date(a.task.createdAt || 0);
                    const bCreated = new Date(b.task.createdAt || 0);
                    return bCreated - aCreated;
                });

            // Render active tasks
            sortedActiveTasks.forEach(({ task, originalIndex }) => {
                if (!task) return;
                const li = this.createTaskElement(task, originalIndex);
                list.appendChild(li);
            });

            // Handle completed tasks section
            if (completedTasks.length > 0 && completedSection && completedList && completedCount) {
                completedSection.style.display = 'block';
                completedCount.textContent = `(${completedTasks.length})`;
                
                // Sort completed tasks by completion date (most recent first)
                const sortedCompletedTasks = completedTasks
                    .map((task, originalIndex) => ({ task, originalIndex: this.tasks.indexOf(task) }))
                    .sort((a, b) => {
                        const aCompleted = new Date(a.task.completedAt || a.task.createdAt || 0);
                        const bCompleted = new Date(b.task.completedAt || b.task.createdAt || 0);
                        return bCompleted - aCompleted;
                    });
                
                sortedCompletedTasks.forEach(({ task, originalIndex }) => {
                    if (!task) return;
                    const li = this.createTaskElement(task, originalIndex);
                    completedList.appendChild(li);
                });
            } else if (completedSection) {
                completedSection.style.display = 'none';
            }

            // Set up event listeners after rendering
            this.setupTaskEventListeners();
            this.setupCompletedTasksToggle();
        });
    }

    /**
     * Create a task element
     */
    createTaskElement(task, index) {
        // Ensure task has all required properties
        const normalizedTask = this.normalizeTask(task);

        const li = document.createElement('li');
        li.className = 'task-item';
        li.draggable = true;
        li.dataset.index = index;

        li.innerHTML = this.getTaskHTML(normalizedTask, index);
        this.setupTaskDragAndDrop(li);

        return li;
    }

    /**
     * Normalize task object to ensure all properties exist
     */
    normalizeTask(task) {
        return {
            id: task.id || Utils.generateId(),
            text: task.text || '',
            done: task.done || false,
            subs: task.subs || [],
            description: task.description || '',
            dueDate: task.dueDate || null,
            googleId: task.googleId || null,
            createdAt: task.createdAt || new Date().toISOString(),
            ...task
        };
    }

    /**
     * Generate HTML for a task
     */
    getTaskHTML(task, index) {
        const subtasksHtml = this.getSubtasksHTML(task, index);
        const taskDetailsHtml = this.getTaskDetailsHTML(task);
        const dueDateHtml = this.getDueDateHTML(task);
        const urgencyClass = this.getUrgencyClass(task);
        const tooltipData = this.getTooltipData(task);

        return `
            <div class="task-main ${urgencyClass}" ${tooltipData}>
                <span class="drag-handle">⋮⋮</span>
                <input type="checkbox" class="checkbox" ${task.done ? 'checked' : ''} data-index="${index}">
                <div class="task-content">
                    <div class="task-title-row">
                        <span class="task-text ${task.done ? 'completed' : ''}">${this.escapeHtml(task.text)}</span>
                        <div class="task-right-area">
                            ${dueDateHtml}
                            <div class="task-actions">
                                <button class="btn edit-btn" data-index="${index}" title="Edit task">
                                    <i class="material-icons">edit</i>
                                </button>
                                <button class="btn expand-btn" data-index="${index}" title="Toggle subtasks">
                                    <i class="material-icons">${task.subs && task.subs.length ? 'expand_less' : 'add'}</i>
                                </button>
                                <button class="btn delete-btn task-delete" data-index="${index}" title="Delete task">
                                    <i class="material-icons">delete</i>
                                </button>
                            </div>
                        </div>
                    </div>
                    ${taskDetailsHtml}
                </div>
            </div>
            ${this.getEditFormHTML(task, index)}
            <div class="subtasks" id="sub-${index}">
                <input type="text" class="subtask-input" id="subin-${index}" placeholder="New subtask..." data-index="${index}">
                ${subtasksHtml}
            </div>
        `;
    }

    /**
     * Generate HTML for task details (description only)
     */
    getTaskDetailsHTML(task) {
        let detailsHtml = '';

        if (task.description && task.description.trim()) {
            detailsHtml += `<div class="task-description">${this.escapeHtml(task.description)}</div>`;
        }

        return detailsHtml ? `<div class="task-details">${detailsHtml}</div>` : '';
    }

    /**
     * Generate HTML for subtasks
     */
    getSubtasksHTML(task, taskIndex) {
        if (!task.subs || !task.subs.length) return '';

        return task.subs
            .filter(sub => sub)
            .map((sub, subIndex) => `
                <div class="subtask-item" draggable="true" data-ti="${taskIndex}" data-si="${subIndex}">
                    <span class="subtask-handle">⋮</span>
                    <input type="checkbox" class="subtask-checkbox" ${sub.done ? 'checked' : ''} data-ti="${taskIndex}" data-si="${subIndex}">
                    <span class="subtask-text ${sub.done ? 'completed' : ''}">${this.escapeHtml(sub.text || '')}</span>
                    <button class="btn delete-btn" data-ti="${taskIndex}" data-si="${subIndex}">×</button>
                </div>
            `)
            .join('');
    }

    /**
     * Generate HTML for edit form
     */
    getEditFormHTML(task, index) {
        return `
            <div class="task-edit-form" id="edit-${index}">
                <input type="text" class="task-edit-input" placeholder="Task title" value="${this.escapeHtml(task.text)}" data-field="text">
                <textarea class="task-edit-textarea" placeholder="Add description..." data-field="description">${this.escapeHtml(task.description || '')}</textarea>
                <input type="date" class="task-edit-date" data-field="dueDate" value="${task.dueDate || ''}">
                <div class="task-edit-actions">
                    <button class="task-edit-btn cancel-edit" data-index="${index}">Cancel</button>
                    <button class="task-edit-btn primary save-edit" data-index="${index}">Save</button>
                </div>
            </div>
        `;
    }

    /**
     * Set up drag and drop for a task element
     */
    setupTaskDragAndDrop(li) {
        li.ondragstart = (e) => {
            li.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
        };

        li.ondragend = () => {
            li.classList.remove('dragging');
            document.querySelectorAll('.drop-anchor').forEach(anchor => anchor.remove());
        };

        li.ondragover = (e) => {
            e.preventDefault();
            const dragItem = document.querySelector('.task-item.dragging');
            if (dragItem && dragItem !== li) {
                this.showDropAnchor(li, e);
            }
        };

        li.ondrop = (e) => {
            e.preventDefault();
            this.handleTaskDrop(e, li);
        };
    }

    /**
     * Show drop anchor for drag and drop
     */
    showDropAnchor(li, e) {
        // Remove existing anchors
        document.querySelectorAll('.drop-anchor').forEach(anchor => anchor.remove());

        // Create drop anchor
        const anchor = document.createElement('div');
        anchor.className = 'drop-anchor';
        anchor.innerHTML = '<div class="anchor-line"></div>';

        // Determine position
        const rect = li.getBoundingClientRect();
        const midpoint = rect.top + rect.height / 2;

        if (e.clientY < midpoint) {
            li.parentNode.insertBefore(anchor, li);
        } else {
            li.parentNode.insertBefore(anchor, li.nextSibling);
        }
    }

    /**
     * Handle task drop for reordering
     */
    async handleTaskDrop(e, li) {
        const drag = document.querySelector('.task-item.dragging');
        if (drag && drag !== li) {
            const fromIndex = parseInt(drag.dataset.index);
            const toIndex = parseInt(li.dataset.index);
            
            // Move the task in the array
            const [item] = this.app.tasks.splice(fromIndex, 1);
            this.app.tasks.splice(toIndex, 0, item);
            
            // Update positions and sync to Google Tasks
            await this.app.updateTaskPositions(fromIndex, toIndex);
            
            // Re-render the tasks
            this.render();
        }
        document.querySelectorAll('.drop-anchor').forEach(anchor => anchor.remove());
    }

    /**
     * Set up completed tasks toggle functionality
     */
    setupCompletedTasksToggle() {
        const toggleBtn = document.getElementById('completedTasksToggle');
        const completedList = document.getElementById('completedTaskList');
        const header = document.getElementById('completedTasksHeader');
        
        if (toggleBtn && completedList && header) {
            // Remove existing listeners
            const newToggleBtn = toggleBtn.cloneNode(true);
            toggleBtn.parentNode.replaceChild(newToggleBtn, toggleBtn);
            
            const newHeader = header.cloneNode(true);
            header.parentNode.replaceChild(newHeader, header);
            
            // Add click listeners
            [newToggleBtn, newHeader].forEach(element => {
                element.addEventListener('click', () => {
                    const isExpanded = completedList.style.display === 'block';
                    completedList.style.display = isExpanded ? 'none' : 'block';
                    newToggleBtn.classList.toggle('expanded', !isExpanded);
                });
            });
        }
    }

    /**
     * Set up event listeners for task interactions
     */
    setupTaskEventListeners() {
        this.setupCheckboxListeners();
        this.setupEditListeners();
        this.setupDeleteListeners();
        this.setupExpandListeners();
        this.setupSubtaskListeners();
    }

    /**
     * Set up checkbox event listeners
     */
    setupCheckboxListeners() {
        document.querySelectorAll('.task-item .checkbox').forEach(cb => {
            cb.addEventListener('change', async () => {
                const i = parseInt(cb.dataset.index);
                if (this.app.tasks[i]) {
                    const taskItem = cb.closest('.task-item');
                    const wasCompleted = this.app.tasks[i].done;

                    this.app.tasks[i].done = !this.app.tasks[i].done;
                    
                    // Track completion timestamp
                    if (this.app.tasks[i].done && !wasCompleted) {
                        this.app.tasks[i].completedAt = new Date().toISOString();
                    } else if (!this.app.tasks[i].done && wasCompleted) {
                        delete this.app.tasks[i].completedAt;
                    }
                    
                    await this.app.saveTasks();

                    // Animate completion
                    if (!wasCompleted && this.app.tasks[i].done) {
                        taskItem.classList.add('completing');
                        setTimeout(() => this.render(), Constants.UI_CONFIG.ANIMATION_DURATION);
                    } else {
                        this.render();
                    }
                }
            });
        });
    }

    /**
     * Set up edit button listeners
     */
    setupEditListeners() {
        // Edit buttons
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const i = parseInt(btn.dataset.index);
                const editForm = document.getElementById(`edit-${i}`);
                if (editForm) {
                    editForm.classList.add('visible');
                    const titleInput = editForm.querySelector('.task-edit-input');
                    if (titleInput) titleInput.focus();
                }
            });
        });

        // Save edit buttons
        document.querySelectorAll('.save-edit').forEach(btn => {
            btn.addEventListener('click', async () => {
                const i = parseInt(btn.dataset.index);
                await this.saveTaskEdit(i);
            });
        });

        // Cancel edit buttons
        document.querySelectorAll('.cancel-edit').forEach(btn => {
            btn.addEventListener('click', () => {
                const i = parseInt(btn.dataset.index);
                const editForm = document.getElementById(`edit-${i}`);
                if (editForm) {
                    editForm.classList.remove('visible');
                }
            });
        });
    }

    /**
     * Save task edit
     */
    async saveTaskEdit(index) {
        const editForm = document.getElementById(`edit-${index}`);
        if (editForm && this.app.tasks[index]) {
            const titleInput = editForm.querySelector('[data-field="text"]');
            const descInput = editForm.querySelector('[data-field="description"]');
            const dateInput = editForm.querySelector('[data-field="dueDate"]');

            this.app.tasks[index].text = titleInput.value.trim();
            this.app.tasks[index].description = descInput.value.trim();
            this.app.tasks[index].dueDate = dateInput.value || null;

            await this.app.saveTasks();
            this.render();
        }
    }

    /**
     * Set up delete button listeners
     */
    setupDeleteListeners() {
        document.querySelectorAll('.task-delete').forEach(btn => {
            btn.addEventListener('click', async () => {
                const i = parseInt(btn.dataset.index);
                if (this.app.tasks[i]) {
                    // If task has Google ID, delete from Google as well
                    if (this.app.tasks[i].googleId && this.app.googleAPI.isAuthenticated) {
                        await this.app.syncManager.deleteTaskFromGoogle(this.app.tasks[i]);
                    }

                    this.app.tasks.splice(i, 1);
                    await this.app.saveTasks();
                    this.render();
                }
            });
        });
    }

    /**
     * Set up expand button listeners
     */
    setupExpandListeners() {
        document.querySelectorAll('.expand-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const i = parseInt(btn.dataset.index);
                const el = document.getElementById(`sub-${i}`);
                if (el) {
                    el.classList.toggle('expanded');
                    if (el.classList.contains('expanded')) {
                        setTimeout(() => {
                            const input = document.getElementById(`subin-${i}`);
                            if (input) input.focus();
                        }, 100);
                    }
                }
            });
        });
    }

    /**
     * Set up subtask listeners
     */
    setupSubtaskListeners() {
        // Subtask input
        document.querySelectorAll('.subtask-input').forEach(input => {
            input.addEventListener('keypress', async (e) => {
                if (e.key === 'Enter') {
                    const i = parseInt(input.dataset.index);
                    const text = input.value.trim();
                    if (text && this.app.tasks[i]) {
                        if (!this.app.tasks[i].subs) this.app.tasks[i].subs = [];
                        this.app.tasks[i].subs.push({ text, done: false });
                        await this.app.saveTasks();

                        const wasExpanded = document.getElementById(`sub-${i}`)?.classList.contains('expanded');
                        this.render();
                        if (wasExpanded) {
                            document.getElementById(`sub-${i}`)?.classList.add('expanded');
                            document.getElementById(`subin-${i}`)?.focus();
                        }
                    }
                }
            });
        });

        // Subtask checkboxes
        document.querySelectorAll('.subtask-checkbox').forEach(cb => {
            cb.addEventListener('change', async () => {
                const i = parseInt(cb.dataset.ti);
                const si = parseInt(cb.dataset.si);
                if (this.app.tasks[i]?.subs?.[si]) {
                    this.app.tasks[i].subs[si].done = !this.app.tasks[i].subs[si].done;
                    await this.app.saveTasks();

                    const wasExpanded = document.getElementById(`sub-${i}`)?.classList.contains('expanded');
                    this.render();
                    if (wasExpanded) document.getElementById(`sub-${i}`)?.classList.add('expanded');
                }
            });
        });

        // Subtask delete buttons
        document.querySelectorAll('.subtask-item .delete-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const i = parseInt(btn.dataset.ti);
                const si = parseInt(btn.dataset.si);
                if (this.app.tasks[i]?.subs) {
                    this.app.tasks[i].subs.splice(si, 1);
                    await this.app.saveTasks();

                    const wasExpanded = document.getElementById(`sub-${i}`)?.classList.contains('expanded');
                    this.render();
                    if (wasExpanded) document.getElementById(`sub-${i}`)?.classList.add('expanded');
                }
            });
        });
    }

    /**
     * Get due date HTML for display
     */
    getDueDateHTML(task) {
        if (!task.dueDate) return '';

        const dueDate = new Date(task.dueDate);
        const today = new Date();
        const diffTime = dueDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        let dateText = '';
        let dateClass = 'task-due-date';

        if (diffDays < 0) {
            dateText = `${Math.abs(diffDays)} days overdue`;
            dateClass += ' overdue';
        } else if (diffDays === 0) {
            dateText = 'Due today';
            dateClass += ' due-today';
        } else if (diffDays <= 3) {
            dateText = `Due in ${diffDays} day${diffDays > 1 ? 's' : ''}`;
            dateClass += ' due-soon';
        } else {
            dateText = dueDate.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: dueDate.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
            });
        }

        return `<span class="${dateClass}">${dateText}</span>`;
    }

    /**
     * Get urgency class for styling
     */
    getUrgencyClass(task) {
        if (!task.dueDate || task.done) return '';

        const dueDate = new Date(task.dueDate);
        const today = new Date();
        const diffTime = dueDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays <= 3) {
            return 'task-urgent';
        }

        return '';
    }

    /**
     * Get tooltip data for task details
     */
    getTooltipData(task) {
        const details = [];

        if (task.description) {
            details.push(`Description: ${task.description}`);
        }

        if (task.dueDate) {
            const dueDate = new Date(task.dueDate);
            details.push(`Due: ${dueDate.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            })}`);
        }

        if (task.subs && task.subs.length > 0) {
            details.push(`Subtasks: ${task.subs.length} item${task.subs.length > 1 ? 's' : ''}`);
        }

        if (task.createdAt) {
            const created = new Date(task.createdAt);
            details.push(`Created: ${created.toLocaleDateString('en-US')}`);
        }

        if (details.length === 0) return '';

        return `title="${this.escapeHtml(details.join('\n'))}"`;
    }

    /**
     * Escape HTML to prevent XSS
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Export for use in other modules
window.TaskRenderer = TaskRenderer;