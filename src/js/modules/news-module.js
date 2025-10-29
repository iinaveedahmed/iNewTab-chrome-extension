/**
 * News ticker module
 */

class NewsModule {
    constructor(storage) {
        this.storage = storage;
        this.tickerElement = document.getElementById('ticker');
        this.cachedNews = [];
        this.lastNewsUpdate = null;
        this.updateInterval = null;
        this.renderInterval = null;
        this.rssFeeds = Constants.RSS_FEEDS.slice(); // Default feeds
    }

    /**
     * Initialize the news module
     */
    async init() {
        await this.loadCachedNews();
        this.renderNews();
        this.loadNews();
        this.scheduleUpdates();
    }

    /**
     * Schedule periodic news updates
     */
    scheduleUpdates() {
        // Update news data
        this.updateInterval = setInterval(() => {
            this.loadNews();
        }, Constants.UI_CONFIG.NEWS_UPDATE_INTERVAL);

        // Update time ago display
        this.renderInterval = setInterval(() => {
            this.renderNews();
        }, 60000); // Update every minute
    }

    /**
     * Load cached news from storage
     */
    async loadCachedNews() {
        try {
            const { news, lastUpdate } = await this.storage.loadCachedNews();
            if (news.length > 0) {
                this.cachedNews = news;
                this.lastNewsUpdate = lastUpdate;
            }
        } catch (error) {
            console.error('Failed to load cached news:', error);
        }
    }

    /**
     * Load fresh news from RSS feeds
     */
    async loadNews() {
        try {
            const allItems = [];

            // Fetch from all RSS feeds
            for (const rssUrl of this.rssFeeds) {
                try {
                    const items = await this.fetchRSSFeed(rssUrl);
                    allItems.push(...items);
                } catch (error) {
                    console.error('Error loading feed:', rssUrl, error);
                }
            }

            if (allItems.length > 0) {
                // Process and cache news items
                this.cachedNews = this.processNewsItems(allItems);
                this.lastNewsUpdate = new Date();

                // Save to storage
                await this.storage.saveCachedNews(this.cachedNews);
            }

            this.renderNews();

        } catch (error) {
            console.error('News loading error:', error);
            this.renderNews(); // Render with cached data
        }
    }

    /**
     * Fetch RSS feed via JSON API
     */
    async fetchRSSFeed(rssUrl) {
        const apiUrl = `${Constants.API_CONFIG.NEWS.RSS_TO_JSON}?rss_url=${encodeURIComponent(rssUrl)}`;

        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`RSS API error: ${response.status}`);
        }

        const data = await response.json();
        return data.items || [];
    }

    /**
     * Process raw news items
     */
    processNewsItems(items) {
        return items
            .slice(0, 20) // Limit to 20 items
            .sort(() => 0.5 - Math.random()) // Randomize order
            .map(item => ({
                title: this.cleanTitle(item.title),
                link: item.link,
                publishedAt: item.pubDate || new Date().toISOString()
            }))
            .filter(item => item.title && item.link); // Filter out invalid items
    }

    /**
     * Clean news title
     */
    cleanTitle(title) {
        if (!title) return '';

        // Remove HTML entities and extra whitespace
        return title
            .replace(/&[^;]+;/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    }

    /**
     * Render news ticker
     */
    renderNews() {
        if (!this.tickerElement) return;

        if (this.cachedNews.length > 0) {
            const updateText = this.lastNewsUpdate
                ? `Last updated ${Utils.getTimeAgo(this.lastNewsUpdate)}`
                : 'Loading...';

            const newsItems = this.cachedNews
                .map(item => this.createNewsItemHTML(item))
                .join('');

            const updateSpan = `<span class="ticker-item update-time" style="color: #888; font-style: italic;">📅 ${updateText}</span>`;

            // Duplicate items for seamless scrolling
            this.tickerElement.innerHTML = updateSpan + newsItems + newsItems;

            // Add click event listeners
            this.setupNewsClickListeners();

        } else {
            this.tickerElement.innerHTML = '<span class="ticker-item">News unavailable</span>';
        }
    }

    /**
     * Create HTML for a news item
     */
    createNewsItemHTML(item) {
        const safeTitle = this.escapeHtml(item.title);
        const safeLink = encodeURIComponent(item.link);

        return `<span class="ticker-item news-item" data-link="${safeLink}" style="cursor: pointer;">📰 ${safeTitle}</span>`;
    }

    /**
     * Set up click listeners for news items
     */
    setupNewsClickListeners() {
        if (!this.tickerElement) return;

        this.tickerElement.querySelectorAll('.news-item').forEach(item => {
            item.addEventListener('click', () => {
                const link = decodeURIComponent(item.dataset.link);
                if (link) {
                    window.open(link, '_blank', 'noopener,noreferrer');
                }
            });
        });
    }

    /**
     * Escape HTML to prevent XSS
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Get news statistics
     */
    getStats() {
        return {
            totalItems: this.cachedNews.length,
            lastUpdate: this.lastNewsUpdate,
            nextUpdate: this.updateInterval ?
                new Date(Date.now() + Constants.UI_CONFIG.NEWS_UPDATE_INTERVAL) : null
        };
    }

    /**
     * Force refresh news
     */
    async refresh() {
        await this.loadNews();
    }

    /**
     * Update RSS feeds list
     */
    updateFeeds(newFeeds) {
        this.rssFeeds = newFeeds.slice(); // Copy array
        this.loadNews(); // Reload news with new feeds
    }

    /**
     * Clean up the module
     */
    destroy() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }

        if (this.renderInterval) {
            clearInterval(this.renderInterval);
            this.renderInterval = null;
        }
    }
}

// Export for use in other modules
window.NewsModule = NewsModule;