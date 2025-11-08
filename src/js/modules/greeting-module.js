/**
 * Greeting module for time-based greetings and inspirational quotes
 */

class GreetingModule {
    constructor(storage) {
        this.storage = storage;
        this.greetingElement = null;
        this.quoteTextElement = null;
        this.quoteAuthorElement = null;
        this.currentQuote = null;
        this.quoteUpdateInterval = null;

        // Quote batch management
        this.quoteBatch = [];
        this.currentQuoteIndex = 0;
        this.batchSize = 20; // DummyJSON API - fetch 20 quotes per batch
        this.fetchThreshold = 5; // Fetch more when 5 or fewer remaining
    }

    /**
     * Initialize the greeting module
     */
    async init() {
        this.greetingElement = document.getElementById('greeting');
        this.quoteTextElement = document.getElementById('quoteText');
        this.quoteAuthorElement = document.getElementById('quoteAuthor');

        if (!this.greetingElement || !this.quoteTextElement) {
            console.error('Greeting elements not found');
            return;
        }

        this.updateGreeting();

        // Load quote batch and display next quote
        await this.loadQuoteBatch();
        this.showNextQuote();

        // Update greeting every minute
        setInterval(() => this.updateGreeting(), 60000);
    }

    /**
     * Update greeting based on time of day
     */
    updateGreeting() {
        const now = new Date();
        const hour = now.getHours();
        const isWeekend = now.getDay() === 0 || now.getDay() === 6; // Sunday = 0, Saturday = 6

        // Use current minute to determine which greeting to show (cycles every ~6 minutes)
        const greetingIndex = Math.floor(now.getMinutes() / 6) % 10;

        let greeting = '';

        if (isWeekend) {
            greeting = this.getWeekendGreeting(hour, greetingIndex);
        } else {
            greeting = this.getHourlyGreeting(hour, greetingIndex);
        }

        if (this.greetingElement) {
            this.greetingElement.textContent = greeting;
        }
    }

    /**
     * Get casual greeting for weekdays based on hour and index
     */
    getHourlyGreeting(hour, index) {
        const greetings = {
            0: ['Night owl mode activated', 'Midnight thoughts?', 'Late night vibes', 'Burning the midnight oil?', 'Still going strong?', 'The world is asleep', 'Quiet hours', 'Moon is high', 'Night time magic', 'Stars are out'],
            1: ['Very late night', 'Almost tomorrow', 'The witching hour', 'Deep into the night', 'Time flies at night', 'Still awake?', 'Night adventures', 'Silent hours', 'Dark and peaceful', 'Rest of the world sleeps'],
            2: ['Extremely late night', 'Way past bedtime', 'The quiet before dawn', 'Deep night hours', 'Time to rest?', 'Night is darkest', 'Dreams await', 'Sleep is calling', 'Night wanderer', 'Peaceful darkness'],
            3: ['Pre-dawn hours', 'Almost sunrise', 'The darkest hour', 'Night is fading', 'Dawn approaches', 'Early bird rising?', 'New day coming', 'Night yields to day', 'Before the light', 'Silent morning'],
            4: ['Super early morning', 'Rise and grind', 'Dawn patrol', 'Early riser!', 'Breaking dawn', 'First light soon', 'Morning is near', 'Crack of dawn', 'Sunrise incoming', 'Early start'],
            5: ['Early bird special', 'Morning person!', 'First light', 'Dawn has arrived', 'Fresh start', 'New day begins', 'Morning energy', 'Sunrise vibes', 'Day is dawning', 'Early morning magic'],
            6: ['Good morning!', 'Rise and shine', 'Morning sunshine', 'New day, new you', 'Fresh morning', 'Coffee time?', 'Morning energy', 'Start strong', 'Greet the day', 'Morning vibes'],
            7: ['Morning motivation', 'Ready to conquer?', 'Breakfast time', 'Morning hustle', 'Day is young', 'Fresh possibilities', 'Make it count', 'Morning power', 'Seize the day', 'Morning goals'],
            8: ['Getting started', 'Morning flow', 'Day is rolling', 'In full swing', 'Morning momentum', 'Let\'s do this', 'Productive vibes', 'Work mode on', 'Morning grind', 'Focused energy'],
            9: ['Mid-morning check-in', 'Going strong', 'Morning progress', 'Keep it up', 'Productive morning', 'On a roll', 'Morning wins', 'Crushing it', 'Making moves', 'Stay focused'],
            10: ['Almost noon', 'Late morning', 'Halfway to lunch', 'Morning finale', 'Pre-lunch vibes', 'Keep going', 'Morning strong', 'Final morning push', 'Lunch soon', 'Morning wrap-up'],
            11: ['Nearly lunchtime', 'Almost noon', 'Late morning hustle', 'Lunch is near', 'Final morning hour', 'Keep pushing', 'Pre-lunch energy', 'Morning\'s end', 'Midday approaches', 'Last morning bits'],
            12: ['It\'s noon!', 'Midday magic', 'Lunch o\'clock', 'Halfway through', 'Peak of the day', 'Midday vibes', 'Noon time', 'Day\'s middle', 'Lunch break?', 'Midday energy'],
            13: ['Early afternoon', 'Post-lunch flow', 'Afternoon begins', 'Second half starts', 'Afternoon vibes', 'Re-energized?', 'Back at it', 'Afternoon mode', 'Keep rolling', 'Day continues'],
            14: ['Afternoon groove', 'Mid-afternoon', 'Cruising along', 'Afternoon flow', 'Steady progress', 'Stay strong', 'Afternoon hustle', 'Keep going', 'Productive afternoon', 'Making progress'],
            15: ['Mid-afternoon', 'Coffee break?', 'Afternoon recharge', 'Second wind', 'Keep the momentum', 'Afternoon energy', 'Stay focused', 'Push through', 'You got this', 'Almost there'],
            16: ['Late afternoon', 'Day winding down', 'Final hours', 'Finish strong', 'Afternoon finale', 'Almost done', 'End in sight', 'Last push', 'Wrap it up', 'Nearly there'],
            17: ['Early evening', 'Work day ending?', 'Evening begins', 'Time to unwind?', 'Evening arrives', 'Day is done', 'Relax time', 'Evening vibes', 'Wind down', 'Evening starts'],
            18: ['Good evening', 'Evening time', 'Dinner hour', 'Evening relaxation', 'Unwind time', 'Evening peace', 'Day is over', 'Evening chill', 'Relaxing evening', 'Evening comfort'],
            19: ['Evening continues', 'Relaxing hours', 'Evening vibes', 'Peaceful evening', 'Chill time', 'Evening calm', 'Unwind mode', 'Easy evening', 'Night approaching', 'Evening peace'],
            20: ['Late evening', 'Night time soon', 'Evening winds down', 'Almost night', 'Peaceful hours', 'Quiet evening', 'Evening finale', 'Night is near', 'Calm evening', 'Restful time'],
            21: ['Good night', 'Night begins', 'Evening done', 'Night time', 'Dark outside', 'Night vibes', 'Peaceful night', 'Night starts', 'Rest time', 'Nightfall'],
            22: ['Late night', 'Night hours', 'Winding down?', 'Night time chill', 'Rest soon?', 'Night is here', 'Quiet night', 'Peaceful hours', 'Night mode', 'Sleep soon?'],
            23: ['Almost midnight', 'Very late', 'Day\'s end', 'Night deepens', 'Last hour', 'Night owl?', 'Late vibes', 'Sleep time?', 'Day almost done', 'Midnight approaches']
        };

        return greetings[hour][index];
    }

    /**
     * Get special casual greeting for weekends
     */
    getWeekendGreeting(hour, index) {
        const greetings = {
            0: ['Weekend night vibes', 'Saturday night!', 'Weekend freedom', 'No work tomorrow!', 'Party mode?', 'Weekend night magic', 'Live it up', 'Weekend fun', 'Enjoy the night', 'Weekend energy'],
            1: ['Weekend late night', 'No rush tomorrow', 'Weekend freedom', 'Sleep in tomorrow!', 'Weekend nights hit different', 'Enjoy the freedom', 'Weekend vibes strong', 'No alarm tomorrow', 'Weekend mode', 'Free night'],
            2: ['Super late weekend', 'Time is irrelevant', 'Weekend freedom', 'No schedule', 'Living free', 'Weekend night owl', 'Do your thing', 'Free time', 'Weekend magic', 'Unscheduled bliss'],
            3: ['Weekend pre-dawn', 'Still weekend!', 'Free morning ahead', 'No rush', 'Weekend continues', 'Sleep in time', 'Peaceful weekend', 'Free hours', 'Weekend calm', 'Relaxed vibes'],
            4: ['Weekend early bird', 'Early weekend start', 'Weekend morning', 'Free day ahead', 'Weekend sunrise', 'Your time', 'Free morning', 'Weekend fresh start', 'No rush today', 'Weekend dawn'],
            5: ['Weekend sunrise', 'Early weekend magic', 'Free morning', 'Weekend begins', 'Your day', 'Weekend energy', 'Fresh weekend', 'Free time ahead', 'Weekend vibes', 'Peaceful start'],
            6: ['Happy weekend morning!', 'Weekend bliss', 'No work today!', 'Sleep in day', 'Weekend joy', 'Free morning', 'Weekend happiness', 'Relax mode', 'Your weekend', 'Free day'],
            7: ['Weekend breakfast', 'Lazy morning?', 'Weekend relaxation', 'No rush!', 'Weekend vibes', 'Free time', 'Chill morning', 'Weekend joy', 'Your pace', 'Relaxed weekend'],
            8: ['Weekend rolling', 'Free day energy', 'Weekend fun', 'Do what you love', 'Your time', 'Weekend adventures', 'Free schedule', 'Weekend magic', 'Enjoy yourself', 'Weekend freedom'],
            9: ['Weekend morning', 'Living your best', 'Free day vibes', 'Weekend energy', 'Do your thing', 'Weekend adventures', 'Your time', 'Free morning', 'Weekend fun', 'Enjoy today'],
            10: ['Late weekend morning', 'Brunch time?', 'Weekend vibes', 'Free day', 'Relax mode', 'Weekend joy', 'Your schedule', 'Free time', 'Weekend bliss', 'Easy morning'],
            11: ['Almost weekend noon', 'Brunch o\'clock', 'Free day', 'Weekend vibes', 'Your time', 'Relaxed weekend', 'Free schedule', 'Weekend joy', 'Chill vibes', 'Easy day'],
            12: ['Weekend noon!', 'Midday weekend', 'Free afternoon ahead', 'Weekend vibes strong', 'Your day', 'Weekend energy', 'Free time', 'Weekend magic', 'Relax mode', 'Weekend bliss'],
            13: ['Weekend afternoon', 'Free time', 'Weekend vibes', 'Relaxing day', 'Your schedule', 'Weekend joy', 'Free afternoon', 'Chill vibes', 'Weekend energy', 'Easy day'],
            14: ['Weekend flowing', 'Free afternoon', 'Weekend vibes', 'Relaxation mode', 'Your time', 'Weekend magic', 'Free schedule', 'Chill time', 'Weekend bliss', 'Easy vibes'],
            15: ['Mid-weekend afternoon', 'Free time', 'Relaxing hours', 'Weekend vibes', 'Your pace', 'Chill afternoon', 'Free day', 'Weekend joy', 'Easy time', 'Weekend magic'],
            16: ['Late weekend afternoon', 'Free evening ahead', 'Weekend continues', 'Relaxed vibes', 'Your time', 'Weekend energy', 'Free schedule', 'Chill mode', 'Weekend bliss', 'Easy evening'],
            17: ['Weekend evening', 'Free night ahead', 'Weekend vibes', 'Relax time', 'Your evening', 'Weekend magic', 'Free time', 'Chill evening', 'Weekend joy', 'Easy night'],
            18: ['Weekend dinner time', 'Free evening', 'Weekend vibes', 'Relaxed evening', 'Your time', 'Weekend energy', 'Free night', 'Chill vibes', 'Weekend bliss', 'Easy evening'],
            19: ['Weekend evening', 'Free night', 'Weekend vibes strong', 'Relax mode', 'Your evening', 'Weekend magic', 'Free time', 'Chill night', 'Weekend joy', 'Easy vibes'],
            20: ['Weekend night', 'Free evening', 'Weekend vibes', 'Relaxed night', 'Your time', 'Weekend energy', 'Free night', 'Chill mode', 'Weekend bliss', 'Easy night'],
            21: ['Weekend night time', 'Free night ahead', 'Weekend vibes', 'No work tomorrow!', 'Your night', 'Weekend magic', 'Free evening', 'Party time?', 'Weekend joy', 'Night fun'],
            22: ['Late weekend night', 'Free night', 'Weekend vibes strong', 'No alarm set?', 'Your time', 'Weekend energy', 'Free schedule', 'Night vibes', 'Weekend bliss', 'Late night fun'],
            23: ['Almost weekend midnight', 'Free night', 'Weekend magic', 'No rush tomorrow', 'Your night', 'Weekend vibes', 'Free time', 'Late night', 'Weekend joy', 'Night owl weekend']
        };

        return greetings[hour][index];
    }

    /**
     * Load batch of quotes from storage or API
     */
    async loadQuoteBatch() {
        try {
            // Try to load cached batch first
            const cachedData = await this.loadCachedBatch();

            if (cachedData && cachedData.quotes && cachedData.quotes.length > 0) {
                this.quoteBatch = cachedData.quotes;
                this.currentQuoteIndex = cachedData.currentIndex || 0;

                // If we're running low, fetch more in background
                if (this.quoteBatch.length - this.currentQuoteIndex < this.fetchThreshold) {
                    this.fetchQuoteBatch();
                }
            } else {
                // No cached batch, fetch new one
                await this.fetchQuoteBatch();
            }

        } catch (error) {
            console.error('Failed to load quote batch:', error);
            // Use fallback quotes
            this.quoteBatch = [
                { text: 'The only way to do great work is to love what you do.', author: 'Steve Jobs' },
                { text: 'Believe you can and you\'re halfway there.', author: 'Theodore Roosevelt' },
                { text: 'Success is not final, failure is not fatal: it is the courage to continue that counts.', author: 'Winston Churchill' }
            ];
            this.currentQuoteIndex = 0;
        }
    }

    /**
     * Fetch batch of quotes from API
     */
    async fetchQuoteBatch() {
        try {
            const quotes = [];

            // Fetch multiple quotes using DummyJSON API (CORS-friendly)
            const fetchPromises = [];
            for (let i = 0; i < this.batchSize; i++) {
                fetchPromises.push(
                    fetch('https://dummyjson.com/quotes/random')
                        .then(res => res.json())
                        .catch(err => {
                            console.error('Failed to fetch quote:', err);
                            return null;
                        })
                );
            }

            const results = await Promise.all(fetchPromises);

            // Filter out failed fetches and format quotes
            // DummyJSON returns: {"id": 1, "quote": "Quote text", "author": "Author"}
            results.forEach(data => {
                if (data && data.quote && data.author) {
                    quotes.push({
                        text: data.quote,
                        author: data.author
                    });
                }
            });

            // Only update batch if we got quotes
            if (quotes.length > 0) {
                // Append new quotes to existing batch
                this.quoteBatch = [...this.quoteBatch, ...quotes];

                // Clean up shown quotes if batch gets too large
                if (this.currentQuoteIndex > this.batchSize) {
                    this.quoteBatch = this.quoteBatch.slice(this.currentQuoteIndex);
                    this.currentQuoteIndex = 0;
                }

                // Save batch to cache
                await this.cacheBatch();
            }

        } catch (error) {
            console.error('Failed to fetch quote batch:', error);
        }
    }

    /**
     * Show next quote from batch
     */
    showNextQuote() {
        if (this.quoteBatch.length === 0) {
            // Use fallback
            this.displayQuote('The only way to do great work is to love what you do.', 'Steve Jobs');
            return;
        }

        // Get next quote
        const quote = this.quoteBatch[this.currentQuoteIndex];
        this.displayQuote(quote.text, quote.author);

        // Move to next index
        this.currentQuoteIndex++;

        // Check if we need to fetch more quotes
        const remaining = this.quoteBatch.length - this.currentQuoteIndex;
        if (remaining < this.fetchThreshold) {
            this.fetchQuoteBatch();
        }

        // Save current index
        this.cacheBatch();
    }

    /**
     * Display quote on the page
     */
    displayQuote(text, author) {
        this.currentQuote = { text, author };

        if (this.quoteTextElement) {
            this.quoteTextElement.textContent = `"${text}"`;
        }

        if (this.quoteAuthorElement) {
            this.quoteAuthorElement.textContent = author ? `— ${author}` : '';
        }
    }

    /**
     * Cache quote batch to storage
     */
    async cacheBatch() {
        try {
            const batchData = {
                quotes: this.quoteBatch,
                currentIndex: this.currentQuoteIndex,
                timestamp: Date.now()
            };

            await this.storage.saveQuoteBatch(batchData);
        } catch (error) {
            console.error('Failed to cache batch:', error);
        }
    }

    /**
     * Load cached batch from storage
     */
    async loadCachedBatch() {
        try {
            return await this.storage.loadQuoteBatch();
        } catch (error) {
            console.error('Failed to load cached batch:', error);
            return null;
        }
    }

    /**
     * Refresh quote manually (show next quote)
     */
    refreshQuote() {
        this.showNextQuote();
    }

    /**
     * Clean up the module
     */
    destroy() {
        // No intervals to clear anymore
        // Quote updates happen on page load only
    }
}

// Export for use in other modules
window.GreetingModule = GreetingModule;
