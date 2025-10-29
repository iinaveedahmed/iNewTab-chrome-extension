/**
 * Utility functions for the new tab extension
 */

/**
 * Safe wrapper for operations that might throw errors
 * @param {Function} fn - Function to execute safely
 * @returns {*} Result of function execution or null on error
 */
function safe(fn) {
    try {
        return fn();
    } catch (e) {
        console.error(e);
        return null;
    }
}

/**
 * Format a due date for display
 * @param {string|null} dueDate - ISO date string
 * @returns {Object} Object with text and class for styling
 */
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

/**
 * Get time ago string for news updates
 * @param {Date} date - Date to compare
 * @returns {string} Human readable time ago string
 */
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

/**
 * Debounce function to limit rate of function calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Generate unique ID for tasks
 * @returns {string} Unique identifier
 */
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid email format
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Deep clone an object
 * @param {Object} obj - Object to clone
 * @returns {Object} Cloned object
 */
function deepClone(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj.getTime());
    if (obj instanceof Array) return obj.map(item => deepClone(item));
    if (typeof obj === 'object') {
        const clonedObj = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                clonedObj[key] = deepClone(obj[key]);
            }
        }
        return clonedObj;
    }
}

// Export functions for use in other modules
window.Utils = {
    safe,
    formatDueDate,
    getTimeAgo,
    debounce,
    generateId,
    isValidEmail,
    deepClone
};