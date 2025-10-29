// Safe wrapper for all operations
function safe(fn) {
    try {
        return fn();
    } catch (e) {
        console.error(e);
        return null;
    }
}

// Initialize storage and sync services
const storage = new ChromeStorage();
const googleAPI = new GoogleTasksAPI();
const syncManager = new SyncManager(googleAPI, storage);

// Clock
function updateClock() {
    safe(() => {
        const now = new Date();
        document.getElementById('clock').textContent =
            now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true });
        document.getElementById('date').textContent =
            now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    });
}
updateClock();
setInterval(updateClock, 1000);

// Search
document.getElementById('searchForm').addEventListener('submit', (e) => {
    e.preventDefault();
    safe(() => {
        const q = document.getElementById('searchBox').value.trim();
        if (!q) return;

        if (q.startsWith('g:')) {
            window.location.href = `https://www.google.com/search?q=${encodeURIComponent(q.slice(2).trim())}`;
        } else {
            window.location.href = `https://www.perplexity.ai/search?q=${encodeURIComponent(q)}`;
        }
    });
});

// Tasks
let tasks = [];

// Load tasks from Chrome storage
async function loadTasks() {
    try {
        tasks = await storage.loadTasks();
        render();
    } catch (error) {
        console.error('Failed to load tasks:', error);
        tasks = [];
        render();
    }
}

// Save tasks to Chrome storage
async function saveTasks() {
    try {
        await storage.saveTasks(tasks);

        // If authenticated with Google, sync in background
        if (googleAPI.isAuthenticated && !syncManager.syncInProgress) {
            syncManager.syncTasks().catch(err => console.error('Background sync failed:', err));
        }
    } catch (error) {
        console.error('Failed to save tasks:', error);
    }
}

// Google Tasks Authentication UI
function updateSyncUI() {
    const signInBtn = document.getElementById('googleSignIn');
    const syncBtn = document.getElementById('syncNow');
    const syncStatus = document.getElementById('syncStatus');

    if (googleAPI.isAuthenticated) {
        signInBtn.classList.add('authenticated');
        signInBtn.title = 'Signed in to Google Tasks';
        syncBtn.style.display = 'block';
        syncStatus.textContent = 'Connected';
        syncStatus.className = 'sync-status success';
    } else {
        signInBtn.classList.remove('authenticated');
        signInBtn.title = 'Sign in to Google Tasks';
        syncBtn.style.display = 'none';
        syncStatus.textContent = 'Not connected';
        syncStatus.className = 'sync-status';
    }
}

// Google Sign In
document.getElementById('googleSignIn').addEventListener('click', async () => {
    const btn = document.getElementById('googleSignIn');
    const status = document.getElementById('syncStatus');

    if (googleAPI.isAuthenticated) {
        // Sign out
        await googleAPI.signOut();
        await storage.saveAuthStatus(false);
        syncManager.stopAutoSync();
        updateSyncUI();
        status.textContent = 'Signed out';
        status.className = 'sync-status';
    } else {
        // Sign in
        btn.classList.add('syncing');
        status.textContent = 'Signing in...';
        status.className = 'sync-status';

        const success = await googleAPI.authenticate();
        btn.classList.remove('syncing');

        if (success) {
            await storage.saveAuthStatus(true);
            updateSyncUI();

            // Start auto sync and perform initial sync
            syncManager.startAutoSync();
            const mergedTasks = await syncManager.syncTasks();
            if (mergedTasks) {
                tasks = mergedTasks;
                render();
            }

            status.textContent = 'Sync complete';
            status.className = 'sync-status success';
        } else {
            status.textContent = 'Sign in failed';
            status.className = 'sync-status error';
        }
    }
});

// Manual Sync
document.getElementById('syncNow').addEventListener('click', async () => {
    const btn = document.getElementById('syncNow');
    const status = document.getElementById('syncStatus');

    btn.classList.add('syncing');
    status.textContent = 'Syncing...';
    status.className = 'sync-status';

    const mergedTasks = await syncManager.syncTasks();
    btn.classList.remove('syncing');

    if (mergedTasks) {
        tasks = mergedTasks;
        render();
        status.textContent = 'Sync complete';
        status.className = 'sync-status success';
    } else {
        status.textContent = 'Sync failed';
        status.className = 'sync-status error';
    }
});

// Helper functions for task rendering
function formatDueDate(dueDate) {
    if (!dueDate) return '';

    const date = new Date(dueDate);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Reset time for date comparison
    today.setHours(0, 0, 0, 0);
    tomorrow.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);

    if (date.getTime() === today.getTime()) {
        return { text: 'Today', class: 'today' };
    } else if (date.getTime() === tomorrow.getTime()) {
        return { text: 'Tomorrow', class: '' };
    } else if (date < today) {
        return { text: date.toLocaleDateString(), class: 'overdue' };
    } else {
        return { text: date.toLocaleDateString(), class: '' };
    }
}

function renderTaskDetails(task) {
    let detailsHtml = '';

    if (task.description && task.description.trim()) {
        detailsHtml += `<div class="task-description">${task.description}</div>`;
    }

    if (task.dueDate) {
        const dateInfo = formatDueDate(task.dueDate);
        detailsHtml += `<div class="task-due-date ${dateInfo.class}">
            <i class="material-icons">schedule</i>
            ${dateInfo.text}
        </div>`;
    }

    return detailsHtml ? `<div class="task-details">${detailsHtml}</div>` : '';
}

// Initialize authentication state on load
async function initializeAuth() {
    const authStatus = await storage.loadAuthStatus();
    if (authStatus.isAuthenticated) {
        const isStillAuth = await googleAPI.checkAuthStatus();
        if (isStillAuth) {
            updateSyncUI();
            syncManager.startAutoSync();
        } else {
            await storage.saveAuthStatus(false);
        }
    }
    updateSyncUI();
}

function render() {
    safe(() => {
        const list = document.getElementById('taskList');
        list.innerHTML = '';

        // Sort tasks: incomplete first, completed last
        const sortedTasks = tasks.map((task, originalIndex) => ({ task, originalIndex }))
            .sort((a, b) => {
                if (a.task.done === b.task.done) return 0;
                return a.task.done ? 1 : -1;
            });

        sortedTasks.forEach(({ task, originalIndex: i }) => {
            if (!task) return;

            const li = document.createElement('li');
            li.className = 'task-item';
            li.draggable = true;
            li.dataset.index = i;

            if (!task.subs) task.subs = [];
            if (task.done === undefined) task.done = false;
            if (!task.text) task.text = '';
            if (!task.description) task.description = '';
            if (!task.dueDate) task.dueDate = null;

            let subtasksHtml = '';
            if (task.subs && task.subs.length) {
                subtasksHtml = task.subs.filter(sub => sub).map((sub, si) => {
                    return `
                        <div class="subtask-item" draggable="true" data-ti="${i}" data-si="${si}">
                            <span class="subtask-handle">⋮</span>
                            <input type="checkbox" class="subtask-checkbox" ${sub.done ? 'checked' : ''} data-ti="${i}" data-si="${si}">
                            <span class="subtask-text ${sub.done ? 'completed' : ''}">${sub.text || ''}</span>
                            <button class="btn delete-btn" data-ti="${i}" data-si="${si}">×</button>
                        </div>
                    `;
                }).join('');
            }

            li.innerHTML = `
                <div class="task-main">
                    <span class="drag-handle">⋮⋮</span>
                    <input type="checkbox" class="checkbox" ${task.done ? 'checked' : ''} data-index="${i}">
                    <div class="task-content">
                        <div class="task-title-row">
                            <span class="task-text ${task.done ? 'completed' : ''}">${task.text}</span>
                        </div>
                        ${renderTaskDetails(task)}
                    </div>
                    <div class="task-actions">
                        <button class="btn edit-btn" data-index="${i}" title="Edit task">
                            <i class="material-icons">edit</i>
                        </button>
                        <button class="btn expand-btn" data-index="${i}" title="Toggle subtasks">
                            <i class="material-icons">${task.subs && task.subs.length ? 'expand_less' : 'add'}</i>
                        </button>
                        <button class="btn delete-btn task-delete" data-index="${i}" title="Delete task">
                            <i class="material-icons">delete</i>
                        </button>
                    </div>
                </div>
                <div class="task-edit-form" id="edit-${i}">
                    <input type="text" class="task-edit-input" placeholder="Task title" value="${task.text}" data-field="text">
                    <textarea class="task-edit-textarea" placeholder="Add description..." data-field="description">${task.description || ''}</textarea>
                    <input type="date" class="task-edit-date" data-field="dueDate" value="${task.dueDate || ''}">
                    <div class="task-edit-actions">
                        <button class="task-edit-btn cancel-edit" data-index="${i}">Cancel</button>
                        <button class="task-edit-btn primary save-edit" data-index="${i}">Save</button>
                    </div>
                </div>
                <div class="subtasks" id="sub-${i}">
                    <input type="text" class="subtask-input" id="subin-${i}" placeholder="New subtask..." data-index="${i}">
                    ${subtasksHtml}
                </div>
            `;

            li.ondragstart = (e) => {
                li.classList.add('dragging');
                e.dataTransfer.effectAllowed = 'move';
            };
            li.ondragend = () => {
                li.classList.remove('dragging');
                // Remove all drop anchors
                document.querySelectorAll('.drop-anchor').forEach(anchor => anchor.remove());
            };
            li.ondragover = (e) => {
                e.preventDefault();
                const dragItem = document.querySelector('.task-item.dragging');
                if (dragItem && dragItem !== li) {
                    // Remove existing anchors
                    document.querySelectorAll('.drop-anchor').forEach(anchor => anchor.remove());

                    // Create drop anchor
                    const anchor = document.createElement('div');
                    anchor.className = 'drop-anchor';
                    anchor.innerHTML = '<div class="anchor-line"></div>';

                    // Determine if we should insert before or after
                    const rect = li.getBoundingClientRect();
                    const midpoint = rect.top + rect.height / 2;

                    if (e.clientY < midpoint) {
                        li.parentNode.insertBefore(anchor, li);
                    } else {
                        li.parentNode.insertBefore(anchor, li.nextSibling);
                    }
                }
            };
            li.ondrop = (e) => {
                e.preventDefault();
                const drag = document.querySelector('.task-item.dragging');
                if (drag && drag !== li) {
                    const from = parseInt(drag.dataset.index);
                    const to = parseInt(li.dataset.index);
                    const [item] = tasks.splice(from, 1);
                    tasks.splice(to, 0, item);
                    saveTasks();
                    render();
                }
                // Remove all drop anchors
                document.querySelectorAll('.drop-anchor').forEach(anchor => anchor.remove());
            };

            // Clean up animation classes from previous renders
            li.classList.remove('completing', 'slide-down');

            list.appendChild(li);
        });

        // Event delegation for task checkboxes
        document.querySelectorAll('.task-item .checkbox').forEach(cb => {
            cb.addEventListener('change', () => {
                const i = parseInt(cb.dataset.index);
                if (tasks[i]) {
                    const taskItem = cb.closest('.task-item');
                    const wasCompleted = tasks[i].done;

                    tasks[i].done = !tasks[i].done;
                    saveTasks();

                    // If task is being completed (not uncompleted), animate it
                    if (!wasCompleted && tasks[i].done) {
                        taskItem.classList.add('completing');

                        // Wait for animation to complete, then re-render
                        setTimeout(() => {
                            render();
                        }, 500);
                    } else {
                        // If uncompleting or just regular toggle, render immediately
                        render();
                    }
                }
            });
        });

        // Event delegation for expand buttons
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

        // Event delegation for edit buttons
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

        // Event delegation for save edit buttons
        document.querySelectorAll('.save-edit').forEach(btn => {
            btn.addEventListener('click', () => {
                const i = parseInt(btn.dataset.index);
                const editForm = document.getElementById(`edit-${i}`);
                if (editForm && tasks[i]) {
                    const titleInput = editForm.querySelector('[data-field="text"]');
                    const descInput = editForm.querySelector('[data-field="description"]');
                    const dateInput = editForm.querySelector('[data-field="dueDate"]');

                    tasks[i].text = titleInput.value.trim();
                    tasks[i].description = descInput.value.trim();
                    tasks[i].dueDate = dateInput.value || null;

                    saveTasks();
                    render();
                }
            });
        });

        // Event delegation for cancel edit buttons
        document.querySelectorAll('.cancel-edit').forEach(btn => {
            btn.addEventListener('click', () => {
                const i = parseInt(btn.dataset.index);
                const editForm = document.getElementById(`edit-${i}`);
                if (editForm) {
                    editForm.classList.remove('visible');
                }
            });
        });

        // Event delegation for task delete buttons
        document.querySelectorAll('.task-delete').forEach(btn => {
            btn.addEventListener('click', async () => {
                const i = parseInt(btn.dataset.index);
                if (tasks[i]) {
                    // If task has Google ID, delete from Google as well
                    if (tasks[i].googleId && googleAPI.isAuthenticated) {
                        await syncManager.deleteTaskFromGoogle(tasks[i]);
                    }

                    tasks.splice(i, 1);
                    saveTasks();
                    render();
                }
            });
        });

        // Subtask inputs
        document.querySelectorAll('.subtask-input').forEach(input => {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    const i = parseInt(input.dataset.index);
                    const text = input.value.trim();
                    if (text && tasks[i]) {
                        if (!tasks[i].subs) tasks[i].subs = [];
                        tasks[i].subs.push({ text, done: false });
                        saveTasks();
                        const open = document.getElementById(`sub-${i}`).classList.contains('expanded');
                        render();
                        if (open) {
                            document.getElementById(`sub-${i}`).classList.add('expanded');
                            document.getElementById(`subin-${i}`).focus();
                        }
                    }
                }
            });
        });

        // Subtask checkboxes
        document.querySelectorAll('.subtask-checkbox').forEach(cb => {
            cb.addEventListener('change', () => {
                const i = parseInt(cb.dataset.ti);
                const si = parseInt(cb.dataset.si);
                if (tasks[i] && tasks[i].subs && tasks[i].subs[si]) {
                    tasks[i].subs[si].done = !tasks[i].subs[si].done;
                    saveTasks();
                    const open = document.getElementById(`sub-${i}`).classList.contains('expanded');
                    render();
                    if (open) document.getElementById(`sub-${i}`).classList.add('expanded');
                }
            });
        });

        // Subtask delete buttons
        document.querySelectorAll('.subtask-item .delete-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const i = parseInt(btn.dataset.ti);
                const si = parseInt(btn.dataset.si);
                if (tasks[i] && tasks[i].subs) {
                    tasks[i].subs.splice(si, 1);
                    saveTasks();
                    const open = document.getElementById(`sub-${i}`).classList.contains('expanded');
                    render();
                    if (open) document.getElementById(`sub-${i}`).classList.add('expanded');
                }
            });
        });

        // Subtask drag
        document.querySelectorAll('.subtask-item').forEach(el => {
            el.ondragstart = (e) => {
                el.classList.add('dragging');
                e.stopPropagation();
            };
            el.ondragend = () => el.classList.remove('dragging');
            el.ondragover = (e) => e.preventDefault();
            el.ondrop = (e) => {
                e.preventDefault();
                e.stopPropagation();
                const drag = document.querySelector('.subtask-item.dragging');
                if (drag && drag !== el) {
                    const ti = parseInt(el.dataset.ti);
                    const from = parseInt(drag.dataset.si);
                    const to = parseInt(el.dataset.si);
                    if (parseInt(drag.dataset.ti) === ti && tasks[ti] && tasks[ti].subs) {
                        const [item] = tasks[ti].subs.splice(from, 1);
                        tasks[ti].subs.splice(to, 0, item);
                        saveTasks();
                        const open = document.getElementById(`sub-${ti}`).classList.contains('expanded');
                        render();
                        if (open) document.getElementById(`sub-${ti}`).classList.add('expanded');
                    }
                }
            };
        });
    });
}

document.getElementById('taskInput').addEventListener('keypress', async (e) => {
    if (e.key === 'Enter') {
        const text = e.target.value.trim();
        if (text) {
            const newTask = {
                text,
                done: false,
                subs: [],
                description: '',
                dueDate: null
            };
            tasks.push(newTask);

            // If authenticated, push to Google as well
            if (googleAPI.isAuthenticated) {
                await syncManager.pushTaskToGoogle(newTask);
            }

            saveTasks();
            render();
            e.target.value = '';
        }
    }
});

// Initialize everything
async function initialize() {
    await loadTasks();
    await initializeAuth();
    render();
}

initialize();

// Weather (keeping existing functionality)
async function loadWeather() {
    const el = document.getElementById('weather');
    if (!navigator.geolocation) {
        el.innerHTML = '<div class="weather-location">Location unavailable</div>';
        return;
    }

    try {
        const pos = await new Promise((ok, fail) => {
            navigator.geolocation.getCurrentPosition(ok, fail, { timeout: 10000 });
        });

        const { latitude: lat, longitude: lon } = pos.coords;
        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&temperature_unit=celsius`);
        const data = await res.json();

        const temp = Math.round(data.current.temperature_2m);
        const code = data.current.weather_code;

        const descs = {
            0: 'Clear', 1: 'Mainly Clear', 2: 'Partly Cloudy', 3: 'Overcast',
            45: 'Foggy', 48: 'Foggy', 51: 'Light Drizzle', 53: 'Drizzle',
            55: 'Heavy Drizzle', 61: 'Light Rain', 63: 'Rain', 65: 'Heavy Rain',
            71: 'Light Snow', 73: 'Snow', 75: 'Heavy Snow', 77: 'Snow Grains',
            80: 'Light Showers', 81: 'Showers', 82: 'Heavy Showers',
            85: 'Light Snow Showers', 86: 'Snow Showers', 95: 'Thunderstorm',
            96: 'Thunderstorm', 99: 'Thunderstorm'
        };

        let loc = 'Your Location';
        try {
            const geo = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}`);
            const geoData = await geo.json();
            loc = geoData.city || geoData.locality || loc;
        } catch (e) {
            // Geocoding failed, use default location
        }

        el.innerHTML = `
            <div class="weather-location">${loc}</div>
            <div class="weather-temp">${temp}°C</div>
            <div class="weather-desc">${descs[code] || 'Unknown'}</div>
        `;
    } catch (e) {
        el.innerHTML = '<div class="weather-location">Weather unavailable</div>';
    }
}

loadWeather();
setInterval(loadWeather, 600000);

// News - Multiple RSS Feeds (with Chrome storage)
const rssFeeds = [
    'https://news.google.com/rss/topics/CAAqKggKIiRDQkFTRlFvSUwyMHZNRFZxYUdjU0JXVnVMVWRDR2dKUVN5Z0FQAQ?ceid=PK:en&oc=3&hl=en-PK&gl=PK'
];

let cachedNews = [];
let lastNewsUpdate = null;

function getTimeAgo(date) {
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);

    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
}

async function loadNews() {
    try {
        const allItems = [];

        for (const rssUrl of rssFeeds) {
            try {
                const res = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`);
                const data = await res.json();

                if (data.items && data.items.length) {
                    allItems.push(...data.items.slice(0, 10));
                }
            } catch (e) {
                console.error('Error loading feed:', rssUrl, e);
            }
        }

        if (allItems.length > 0) {
            cachedNews = allItems.sort(() => 0.5 - Math.random()).slice(0, 20).map(item => ({
                title: item.title,
                link: item.link
            }));
            lastNewsUpdate = new Date();

            // Save to Chrome storage
            await storage.saveCachedNews(cachedNews);
        }

        renderNews();
    } catch (e) {
        console.error('News error:', e);
        renderNews();
    }
}

function renderNews() {
    const ticker = document.getElementById('ticker');

    if (cachedNews.length > 0) {
        const updateText = lastNewsUpdate ? `Last updated ${getTimeAgo(lastNewsUpdate)}` : 'Loading...';
        const items = cachedNews.map((item) => {
            return `<span class="ticker-item news-item" data-link="${encodeURIComponent(item.link)}" style="cursor: pointer;">📰 ${item.title}</span>`;
        }).join('');

        const updateSpan = `<span class="ticker-item update-time" style="color: #888; font-style: italic;">📅 ${updateText}</span>`;
        ticker.innerHTML = updateSpan + items + items;

        // Add event listeners to news items
        ticker.querySelectorAll('.news-item').forEach(item => {
            item.addEventListener('click', () => {
                const link = decodeURIComponent(item.dataset.link);
                window.open(link, '_blank');
            });
        });
    } else {
        ticker.innerHTML = '<span class="ticker-item">News unavailable</span>';
    }
}

// Load cached news from storage on startup
async function initializeNews() {
    const { news, lastUpdate } = await storage.loadCachedNews();
    if (news.length > 0) {
        cachedNews = news;
        lastNewsUpdate = lastUpdate;
        renderNews();
    }
    loadNews();
}

initializeNews();
setInterval(loadNews, 3600000);
setInterval(renderNews, 60000);