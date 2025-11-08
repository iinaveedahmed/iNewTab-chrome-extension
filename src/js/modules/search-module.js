/**
 * Search module for handling multiple search engines with keyboard shortcuts
 */

class SearchModule {
    constructor() {
        this.searchBox = null;
        this.searchForm = null;
        this.selectedEngine = null;
        this.tagElement = null;
        this.shortcutBuffer = '';
        this.shortcutTimeout = null;

        // Help modal elements
        this.helpOverlay = null;
        this.helpModal = null;
        this.helpClose = null;

        // Build shortcut map from constants
        this.shortcutMap = new Map();
        Object.entries(Constants.SEARCH_ENGINES).forEach(([key, engine]) => {
            this.shortcutMap.set(engine.shortcut, { key, ...engine });
        });

        // Get default engine
        this.defaultEngine = Object.entries(Constants.SEARCH_ENGINES)
            .find(([, engine]) => engine.isDefault)?.[1] || Constants.SEARCH_ENGINES.perplexity;

        // Bind methods
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleGlobalKeyDown = this.handleGlobalKeyDown.bind(this);
        this.handleInput = this.handleInput.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.showHelp = this.showHelp.bind(this);
        this.hideHelp = this.hideHelp.bind(this);
    }

    /**
     * Initialize the search module
     */
    init() {
        this.searchBox = document.getElementById('searchBox');
        this.searchForm = document.getElementById('searchForm');
        this.helpOverlay = document.getElementById('helpModalOverlay');
        this.helpModal = document.getElementById('helpModal');
        this.helpClose = document.getElementById('helpClose');

        if (!this.searchBox || !this.searchForm) {
            console.error('Search elements not found');
            return;
        }

        this.setupEventListeners();
        this.updatePlaceholder();
        this.populateHelpModal();
    }

    /**
     * Set up event listeners
     */
    setupEventListeners() {
        this.searchBox.addEventListener('keydown', this.handleKeyDown);
        this.searchBox.addEventListener('input', this.handleInput);
        this.searchForm.addEventListener('submit', this.handleSubmit);

        // Global keyboard shortcuts
        document.addEventListener('keydown', this.handleGlobalKeyDown);

        // Help modal close
        if (this.helpClose) {
            this.helpClose.addEventListener('click', this.hideHelp);
        }

        // Close on overlay click
        if (this.helpOverlay) {
            this.helpOverlay.addEventListener('click', (e) => {
                if (e.target === this.helpOverlay) {
                    this.hideHelp();
                }
            });
        }
    }

    /**
     * Handle global keydown events
     */
    handleGlobalKeyDown(e) {
        // Ctrl+/ or Cmd+/ to show help
        if ((e.ctrlKey || e.metaKey) && e.key === '/') {
            e.preventDefault();
            this.toggleHelp();
        }

        // Escape to close help
        if (e.key === 'Escape' && this.helpOverlay?.classList.contains('visible')) {
            e.preventDefault();
            this.hideHelp();
        }
    }

    /**
     * Handle keydown events for shortcuts
     */
    handleKeyDown(e) {
        // Handle Tab key
        if (e.key === 'Tab') {
            const inputValue = this.searchBox.value.trim().toLowerCase();

            // Check if current input matches a shortcut
            if (this.shortcutMap.has(inputValue)) {
                e.preventDefault();
                const engine = this.shortcutMap.get(inputValue);
                this.selectEngine(engine);
                this.searchBox.value = '';
                this.shortcutBuffer = '';
                return;
            }

            // Check if shortcut buffer matches
            if (this.shortcutBuffer && this.shortcutMap.has(this.shortcutBuffer)) {
                e.preventDefault();
                const engine = this.shortcutMap.get(this.shortcutBuffer);
                this.selectEngine(engine);
                this.shortcutBuffer = '';
                return;
            }
        }

        // Handle Escape key to clear selection
        if (e.key === 'Escape') {
            if (this.selectedEngine) {
                e.preventDefault();
                this.clearSelection();
                this.shortcutBuffer = '';
            }
        }

        // Handle Backspace to clear tag if input is empty
        if (e.key === 'Backspace' && this.searchBox.value === '' && this.selectedEngine) {
            e.preventDefault();
            this.clearSelection();
        }
    }

    /**
     * Handle input events to build shortcut buffer
     */
    handleInput(e) {
        // Don't process if engine is already selected
        if (this.selectedEngine) {
            return;
        }

        const value = this.searchBox.value.trim().toLowerCase();

        // Update shortcut buffer
        this.shortcutBuffer = value;

        // Clear timeout if it exists
        if (this.shortcutTimeout) {
            clearTimeout(this.shortcutTimeout);
        }

        // Reset buffer after 1 second of inactivity
        this.shortcutTimeout = setTimeout(() => {
            if (!this.selectedEngine) {
                this.shortcutBuffer = '';
            }
        }, 1000);
    }

    /**
     * Handle form submission
     */
    handleSubmit(e) {
        e.preventDefault();

        const query = this.searchBox.value.trim();
        if (!query) return;

        // Determine which engine to use
        const engine = this.selectedEngine || this.defaultEngine;
        const searchUrl = engine.url + encodeURIComponent(query);

        // Navigate to search URL
        window.location.href = searchUrl;
    }

    /**
     * Select a search engine
     */
    selectEngine(engine) {
        this.selectedEngine = engine;
        this.renderTag();
        this.updatePlaceholder();
        this.searchBox.focus();
    }

    /**
     * Clear engine selection
     */
    clearSelection() {
        this.selectedEngine = null;
        this.removeTag();
        this.updatePlaceholder();
        this.searchBox.focus();
    }

    /**
     * Render the search engine tag inside the search form container
     */
    renderTag() {
        // Remove existing tag if present
        this.removeTag();

        // Create tag element
        const tag = document.createElement('span');
        tag.className = 'search-engine-tag';
        tag.style.backgroundColor = this.selectedEngine.color;
        tag.innerHTML = `
            <span class="tag-name">${this.selectedEngine.name}</span>
            <button class="tag-close" type="button" title="Clear (Esc)">
                <i class="material-icons">close</i>
            </button>
        `;

        // Add close button listener
        const closeBtn = tag.querySelector('.tag-close');
        closeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.clearSelection();
        });

        // Insert tag inside the search form (absolute positioned)
        this.searchForm.appendChild(tag);
        this.tagElement = tag;

        // Add class to search box for styling
        this.searchBox.classList.add('has-tag');
    }

    /**
     * Remove the search engine tag
     */
    removeTag() {
        if (this.tagElement) {
            this.tagElement.remove();
            this.tagElement = null;
        }
        this.searchBox.classList.remove('has-tag');
    }

    /**
     * Update search box placeholder
     */
    updatePlaceholder() {
        if (this.selectedEngine) {
            this.searchBox.placeholder = `Search on ${this.selectedEngine.name}...`;
        } else {
            this.searchBox.placeholder = 'Search...';
        }
    }

    /**
     * Populate help modal with shortcuts
     */
    populateHelpModal() {
        const shortcutsGrid = document.getElementById('shortcutsGrid');
        if (!shortcutsGrid) return;

        const shortcuts = Array.from(this.shortcutMap.entries())
            .sort((a, b) => a[0].localeCompare(b[0]));

        shortcutsGrid.innerHTML = shortcuts.map(([shortcut, engine]) => `
            <div class="shortcut-item">
                <div class="shortcut-info">
                    <div class="shortcut-color" style="background-color: ${engine.color}"></div>
                    <span class="shortcut-name">${engine.name}</span>
                </div>
                <div class="shortcut-key">
                    <kbd>${shortcut}</kbd>
                    <span style="color: #666;">+</span>
                    <kbd>Tab</kbd>
                </div>
            </div>
        `).join('');
    }

    /**
     * Show help modal
     */
    showHelp() {
        if (this.helpOverlay) {
            this.helpOverlay.classList.add('visible');
        }
    }

    /**
     * Hide help modal
     */
    hideHelp() {
        if (this.helpOverlay) {
            this.helpOverlay.classList.remove('visible');
        }
    }

    /**
     * Toggle help modal
     */
    toggleHelp() {
        if (this.helpOverlay?.classList.contains('visible')) {
            this.hideHelp();
        } else {
            this.showHelp();
        }
    }

    /**
     * Get current search engine
     */
    getCurrentEngine() {
        return this.selectedEngine || this.defaultEngine;
    }

    /**
     * Get available shortcuts
     */
    getShortcuts() {
        return Array.from(this.shortcutMap.entries()).map(([shortcut, engine]) => ({
            shortcut,
            name: engine.name,
            color: engine.color
        }));
    }

    /**
     * Clean up the module
     */
    destroy() {
        if (this.searchBox) {
            this.searchBox.removeEventListener('keydown', this.handleKeyDown);
            this.searchBox.removeEventListener('input', this.handleInput);
        }

        if (this.searchForm) {
            this.searchForm.removeEventListener('submit', this.handleSubmit);
        }

        if (this.helpClose) {
            this.helpClose.removeEventListener('click', this.hideHelp);
        }

        document.removeEventListener('keydown', this.handleGlobalKeyDown);

        if (this.shortcutTimeout) {
            clearTimeout(this.shortcutTimeout);
        }

        this.removeTag();
    }
}

// Export for use in other modules
window.SearchModule = SearchModule;
