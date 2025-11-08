/**
 * Application constants
 */

// API Configuration
const API_CONFIG = {
    GOOGLE_TASKS: {
        BASE_URL: 'https://www.googleapis.com/tasks/v1',
        SCOPES: ['https://www.googleapis.com/auth/tasks']
    },
    WEATHER: {
        BASE_URL: 'https://api.open-meteo.com/v1',
        GEO_URL: 'https://api.bigdatacloud.net/data/reverse-geocode-client'
    },
    NEWS: {
        RSS_TO_JSON: 'https://api.rss2json.com/v1/api.json'
    }
};

// Default RSS feeds for news
const RSS_FEEDS = [
    'https://news.google.com/rss'
];

// Weather condition descriptions
const WEATHER_DESCRIPTIONS = {
    0: 'Clear', 1: 'Mainly Clear', 2: 'Partly Cloudy', 3: 'Overcast',
    45: 'Foggy', 48: 'Foggy', 51: 'Light Drizzle', 53: 'Drizzle',
    55: 'Heavy Drizzle', 61: 'Light Rain', 63: 'Rain', 65: 'Heavy Rain',
    71: 'Light Snow', 73: 'Snow', 75: 'Heavy Snow', 77: 'Snow Grains',
    80: 'Light Showers', 81: 'Showers', 82: 'Heavy Showers',
    85: 'Light Snow Showers', 86: 'Snow Showers', 95: 'Thunderstorm',
    96: 'Thunderstorm', 99: 'Thunderstorm'
};

// Sync configuration
const SYNC_CONFIG = {
    AUTO_SYNC_INTERVAL: 5 * 60 * 1000, // 5 minutes
    RETRY_DELAY: 2000, // 2 seconds
    MAX_RETRIES: 3
};

// UI configuration
const UI_CONFIG = {
    ANIMATION_DURATION: 500, // milliseconds
    DEBOUNCE_DELAY: 300, // milliseconds
    NEWS_UPDATE_INTERVAL: 3600000, // 1 hour
    WEATHER_UPDATE_INTERVAL: 600000, // 10 minutes
    CLOCK_UPDATE_INTERVAL: 1000 // 1 second
};

// Storage keys
const STORAGE_KEYS = {
    TASKS: 'tasks',
    SYNC_STATUS: 'syncStatus',
    AUTH_STATUS: 'isAuthenticated',
    AUTH_TIME: 'authTime',
    LAST_SYNC: 'lastSyncTime',
    CACHED_NEWS: 'cachedNews',
    LAST_NEWS_UPDATE: 'lastNewsUpdate',
    USER_PREFERENCES: 'userPreferences'
};

// Task statuses
const TASK_STATUS = {
    PENDING: 'pending',
    COMPLETED: 'completed',
    IN_PROGRESS: 'in_progress'
};

// Google Tasks API statuses
const GOOGLE_TASK_STATUS = {
    NEEDS_ACTION: 'needsAction',
    COMPLETED: 'completed'
};

// Error messages
const ERROR_MESSAGES = {
    AUTH_FAILED: 'Authentication failed. Please try again.',
    SYNC_FAILED: 'Synchronization failed. Check your connection.',
    STORAGE_FAILED: 'Failed to save data. Please try again.',
    NETWORK_ERROR: 'Network error. Please check your connection.',
    INVALID_DATA: 'Invalid data format.',
    PERMISSION_DENIED: 'Permission denied. Please check your settings.'
};

// Success messages
const SUCCESS_MESSAGES = {
    TASK_CREATED: 'Task created successfully',
    TASK_UPDATED: 'Task updated successfully',
    TASK_DELETED: 'Task deleted successfully',
    SYNC_COMPLETE: 'Synchronization complete',
    AUTH_SUCCESS: 'Authentication successful'
};

// Search engines configuration
const SEARCH_ENGINES = {
    perplexity: {
        name: 'Perplexity',
        shortcut: 'p',
        url: 'https://www.perplexity.ai/search?q=',
        color: '#20808d',
        isDefault: true
    },
    google: {
        name: 'Google',
        shortcut: 'g',
        url: 'https://www.google.com/search?q=',
        color: '#4285f4'
    },
    chatgpt: {
        name: 'ChatGPT',
        shortcut: 'c',
        url: 'https://chatgpt.com/?q=',
        color: '#10a37f'
    },
    duckduckgo: {
        name: 'DuckDuckGo',
        shortcut: 'd',
        url: 'https://duckduckgo.com/?q=',
        color: '#de5833'
    },
    bing: {
        name: 'Bing',
        shortcut: 'b',
        url: 'https://www.bing.com/search?q=',
        color: '#008373'
    },
    youtube: {
        name: 'YouTube',
        shortcut: 'y',
        url: 'https://www.youtube.com/results?search_query=',
        color: '#ff0000'
    },
    github: {
        name: 'GitHub',
        shortcut: 'gh',
        url: 'https://github.com/search?q=',
        color: '#24292e'
    },
    stackoverflow: {
        name: 'Stack Overflow',
        shortcut: 'so',
        url: 'https://stackoverflow.com/search?q=',
        color: '#f48024'
    }
};

// Export constants
window.Constants = {
    API_CONFIG,
    RSS_FEEDS,
    WEATHER_DESCRIPTIONS,
    SYNC_CONFIG,
    UI_CONFIG,
    STORAGE_KEYS,
    TASK_STATUS,
    GOOGLE_TASK_STATUS,
    ERROR_MESSAGES,
    SUCCESS_MESSAGES,
    SEARCH_ENGINES
};