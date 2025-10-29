/**
 * Unit tests for TaskRenderer module
 */

// Load required modules
require('../../src/js/utils/constants.js');
require('../../src/js/utils/helpers.js');
require('../../src/js/modules/task-renderer.js');

describe('TaskRenderer', () => {
    let renderer;
    let mockApp;
    let mockTasks;

    beforeEach(() => {
        mockTasks = [
            createMockTask({ text: 'Test task 1', done: false }),
            createMockTask({ text: 'Test task 2', done: true })
        ];

        mockApp = {
            tasks: mockTasks,
            saveTasks: jest.fn().mockResolvedValue(true),
            googleAPI: { isAuthenticated: false },
            syncManager: {
                deleteTaskFromGoogle: jest.fn().mockResolvedValue(true)
            }
        };

        renderer = new TaskRenderer(mockTasks, mockApp);
    });

    describe('render', () => {
        it('should render tasks in the task list', () => {
            const taskList = document.getElementById('taskList');
            renderer.render();

            expect(taskList.children).toHaveLength(2);
            expect(taskList.innerHTML).toContain('Test task 1');
            expect(taskList.innerHTML).toContain('Test task 2');
        });

        it('should sort completed tasks to bottom', () => {
            const taskList = document.getElementById('taskList');
            renderer.render();

            const firstTask = taskList.children[0];
            const secondTask = taskList.children[1];

            expect(firstTask.querySelector('.task-text').textContent).toBe('Test task 1');
            expect(secondTask.querySelector('.task-text').textContent).toBe('Test task 2');
            expect(secondTask.querySelector('.checkbox').checked).toBe(true);
        });

        it('should handle empty task list', () => {
            renderer.tasks = [];
            const taskList = document.getElementById('taskList');
            renderer.render();

            expect(taskList.children).toHaveLength(0);
        });
    });

    describe('normalizeTask', () => {
        it('should add missing properties to task', () => {
            const incompleteTask = { text: 'Incomplete task' };
            const normalized = renderer.normalizeTask(incompleteTask);

            expect(normalized).toHaveProperty('id');
            expect(normalized).toHaveProperty('done', false);
            expect(normalized).toHaveProperty('subs', []);
            expect(normalized).toHaveProperty('description', '');
            expect(normalized).toHaveProperty('dueDate', null);
        });

        it('should preserve existing properties', () => {
            const completeTask = createMockTask({
                text: 'Complete task',
                done: true,
                description: 'Test description'
            });
            const normalized = renderer.normalizeTask(completeTask);

            expect(normalized.text).toBe('Complete task');
            expect(normalized.done).toBe(true);
            expect(normalized.description).toBe('Test description');
        });
    });

    describe('getTaskDetailsHTML', () => {
        it('should generate HTML for task with description only', () => {
            const task = createMockTask({
                description: 'Test description',
                dueDate: '2023-10-15'
            });

            const html = renderer.getTaskDetailsHTML(task);

            expect(html).toContain('Test description');
            expect(html).toContain('task-details');
            expect(html).not.toContain('schedule'); // Due date no longer in details
        });

        it('should return empty string for task without details', () => {
            const task = createMockTask({
                description: '',
                dueDate: null
            });

            const html = renderer.getTaskDetailsHTML(task);

            expect(html).toBe('');
        });

        it('should handle task with only description', () => {
            const task = createMockTask({
                description: 'Only description',
                dueDate: null
            });

            const html = renderer.getTaskDetailsHTML(task);

            expect(html).toContain('Only description');
            expect(html).not.toContain('schedule');
        });

        it('should return empty string for task with only due date', () => {
            const task = createMockTask({
                description: '',
                dueDate: '2023-10-15'
            });

            const html = renderer.getTaskDetailsHTML(task);

            expect(html).toBe(''); // No details shown for due date only
            expect(html).not.toContain('task-description');
            expect(html).not.toContain('schedule');
        });
    });

    describe('getSubtasksHTML', () => {
        it('should generate HTML for subtasks', () => {
            const task = createMockTask({
                subs: [
                    { text: 'Subtask 1', done: false },
                    { text: 'Subtask 2', done: true }
                ]
            });

            const html = renderer.getSubtasksHTML(task, 0);

            expect(html).toContain('Subtask 1');
            expect(html).toContain('Subtask 2');
            expect(html).toContain('subtask-item');
        });

        it('should return empty string for task without subtasks', () => {
            const task = createMockTask({ subs: [] });
            const html = renderer.getSubtasksHTML(task, 0);

            expect(html).toBe('');
        });

        it('should filter out null/undefined subtasks', () => {
            const task = createMockTask({
                subs: [
                    { text: 'Valid subtask', done: false },
                    null,
                    undefined,
                    { text: 'Another valid', done: true }
                ]
            });

            const html = renderer.getSubtasksHTML(task, 0);

            expect(html).toContain('Valid subtask');
            expect(html).toContain('Another valid');
            expect((html.match(/subtask-item/g) || []).length).toBe(2);
        });
    });

    describe('escapeHtml', () => {
        it('should escape HTML characters', () => {
            const dangerous = '<script>alert("xss")</script>';
            const escaped = renderer.escapeHtml(dangerous);

            expect(escaped).toBe('&lt;script&gt;alert("xss")&lt;/script&gt;');
        });

        it('should handle special characters', () => {
            const special = 'Text with & < > " \' characters';
            const escaped = renderer.escapeHtml(special);

            expect(escaped).toContain('&amp;');
            expect(escaped).toContain('&lt;');
            expect(escaped).toContain('&gt;');
        });

        it('should handle empty string', () => {
            const escaped = renderer.escapeHtml('');
            expect(escaped).toBe('');
        });
    });

    describe('createTaskElement', () => {
        it('should create a task element with correct structure', () => {
            const task = createMockTask({ text: 'Test task' });
            const element = renderer.createTaskElement(task, 0);

            expect(element.tagName).toBe('LI');
            expect(element.classList.contains('task-item')).toBe(true);
            expect(element.dataset.index).toBe('0');
            expect(element.innerHTML).toContain('Test task');
        });

        it('should set draggable attribute', () => {
            const task = createMockTask();
            const element = renderer.createTaskElement(task, 0);

            expect(element.draggable).toBe(true);
        });
    });

    describe('saveTaskEdit', () => {
        it('should save task edits successfully', async () => {
            // Set up edit form in DOM
            const editForm = document.createElement('div');
            editForm.id = 'edit-0';
            editForm.innerHTML = `
                <input data-field="text" value="Updated task">
                <textarea data-field="description">Updated description</textarea>
                <input data-field="dueDate" value="2023-10-20">
            `;
            document.body.appendChild(editForm);

            await renderer.saveTaskEdit(0);

            expect(mockApp.tasks[0].text).toBe('Updated task');
            expect(mockApp.tasks[0].description).toBe('Updated description');
            expect(mockApp.tasks[0].dueDate).toBe('2023-10-20');
            expect(mockApp.saveTasks).toHaveBeenCalled();

            // Clean up
            document.body.removeChild(editForm);
        });

        it('should handle missing edit form gracefully', async () => {
            await renderer.saveTaskEdit(999);
            expect(mockApp.saveTasks).not.toHaveBeenCalled();
        });
    });
});