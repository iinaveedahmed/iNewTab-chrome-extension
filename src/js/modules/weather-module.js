/**
 * Weather widget module
 */

class WeatherModule {
    constructor() {
        this.weatherElement = document.getElementById('weather');
        this.updateInterval = null;
    }

    /**
     * Initialize the weather module
     */
    init() {
        this.loadWeather();
        this.scheduleUpdates();
    }

    /**
     * Schedule periodic weather updates
     */
    scheduleUpdates() {
        this.updateInterval = setInterval(() => {
            this.loadWeather();
        }, Constants.UI_CONFIG.WEATHER_UPDATE_INTERVAL);
    }

    /**
     * Load and display weather data
     */
    async loadWeather() {
        if (!this.weatherElement) return;

        try {
            // Check for geolocation support
            if (!navigator.geolocation) {
                this.showError('Location unavailable');
                return;
            }

            // Get user's location
            const position = await this.getCurrentPosition();
            const { latitude: lat, longitude: lon } = position.coords;

            // Fetch weather data
            const weatherData = await this.fetchWeatherData(lat, lon);

            // Get location name
            const locationName = await this.getLocationName(lat, lon);

            // Display weather
            this.displayWeather(weatherData, locationName);

        } catch (error) {
            console.error('Weather error:', error);
            this.showError('Weather unavailable');
        }
    }

    /**
     * Get current position using Geolocation API
     */
    getCurrentPosition() {
        return new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
                resolve,
                reject,
                { timeout: 10000, enableHighAccuracy: false }
            );
        });
    }

    /**
     * Fetch weather data from API
     */
    async fetchWeatherData(lat, lon) {
        const url = `${Constants.API_CONFIG.WEATHER.BASE_URL}/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&temperature_unit=celsius`;

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Weather API error: ${response.status}`);
        }

        return await response.json();
    }

    /**
     * Get location name from coordinates
     */
    async getLocationName(lat, lon) {
        try {
            const url = `${Constants.API_CONFIG.WEATHER.GEO_URL}?latitude=${lat}&longitude=${lon}`;
            const response = await fetch(url);

            if (response.ok) {
                const geoData = await response.json();
                return geoData.city || geoData.locality || 'Your Location';
            }
        } catch (error) {
            console.error('Geocoding error:', error);
        }

        return 'Your Location';
    }

    /**
     * Display weather information
     */
    displayWeather(data, location) {
        if (!this.weatherElement || !data.current) return;

        const temp = Math.round(data.current.temperature_2m);
        const weatherCode = data.current.weather_code;
        const description = Constants.WEATHER_DESCRIPTIONS[weatherCode] || 'Unknown';

        this.weatherElement.innerHTML = `
            <div class="weather-location">${this.escapeHtml(location)}</div>
            <div class="weather-temp">${temp}°C</div>
            <div class="weather-desc">${description}</div>
        `;
    }

    /**
     * Show error message
     */
    showError(message) {
        if (this.weatherElement) {
            this.weatherElement.innerHTML = `
                <div class="weather-location">${message}</div>
            `;
        }
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
     * Clean up the module
     */
    destroy() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    }
}

// Export for use in other modules
window.WeatherModule = WeatherModule;