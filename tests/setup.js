/**
 * Jest test setup file
 * Sets up global mocks and utilities for testing
 */

// Mock Chrome APIs
global.chrome = {
    storage: {
        local: {
            get: jest.fn(),
            set: jest.fn(),
            clear: jest.fn(),
            getBytesInUse: jest.fn()
        }
    },
    identity: {
        getAuthToken: jest.fn(),
        removeCachedAuthToken: jest.fn()
    },
    runtime: {
        lastError: null
    }
};

// Mock fetch API
global.fetch = jest.fn();

// Mock geolocation API
global.navigator = {
    geolocation: {
        getCurrentPosition: jest.fn()
    }
};

// Mock DOM methods
global.document.createRange = () => ({
    setStart: jest.fn(),
    setEnd: jest.fn(),
    commonAncestorContainer: {
        nodeName: 'BODY',
        ownerDocument: document
    }
});

// Mock window methods
global.window.open = jest.fn();

// Create mock HTML elements for testing
const createMockElement = (id) => {
    const element = document.createElement('div');
    element.id = id;
    return element;
};

// Set up DOM structure that the app expects
beforeEach(() => {
    document.body.innerHTML = `
        <div id="clock"></div>
        <div id="date"></div>
        <form id="searchForm">
            <input id="searchBox" type="text">
        </form>
        <input id="taskInput" type="text">
        <ul id="taskList"></ul>
        <div id="completedTasksSection" style="display: none;">
            <div id="completedTasksHeader">
                <span id="completedTasksCount">(0)</span>
                <button id="completedTasksToggle"></button>
            </div>
            <ul id="completedTaskList" style="display: none;"></ul>
        </div>
        <button id="googleSignIn"></button>
        <button id="syncNow"></button>
        <span id="syncStatus"></span>
        <span id="syncStatusMinimal"></span>
        <div id="weather"></div>
        <div id="ticker"></div>
    `;

    // Reset mocks
    jest.clearAllMocks();

    // Reset fetch mock
    fetch.mockReset();
});

// Helper function to create mock tasks
global.createMockTask = (overrides = {}) => ({
    id: 'test-id-123',
    text: 'Test task',
    done: false,
    subs: [],
    description: '',
    dueDate: null,
    googleId: null,
    createdAt: new Date().toISOString(),
    ...overrides
});

// Helper function to create mock responses
global.createMockResponse = (data, ok = true) => ({
    ok,
    json: jest.fn().mockResolvedValue(data),
    text: jest.fn().mockResolvedValue(JSON.stringify(data))
});

// Console mock for cleaner test output
global.console = {
    ...console,
    error: jest.fn(),
    warn: jest.fn(),
    log: jest.fn()
};