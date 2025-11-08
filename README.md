# iNewTab

[![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-brightgreen?style=for-the-badge&logo=googlechrome)](https://github.com/iinaveedahmed/iNewTab-chrome-extension)
[![MIT License](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Material Design](https://img.shields.io/badge/Material_Design-0081CB?style=for-the-badge&logo=material-design&logoColor=white)](https://material.io/design)
[![Google Tasks API](https://img.shields.io/badge/Google_Tasks-API-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://developers.google.com/tasks)
[![Jest](https://img.shields.io/badge/Jest-Testing-C21325?style=for-the-badge&logo=jest&logoColor=white)](https://jestjs.io/)

A beautiful, productivity-focused Chrome extension that transforms your new tab page into a smart dashboard with time-aware greetings, inspirational quotes, multi-engine search, advanced task management, Google Tasks sync with multi-list support, weather updates, and customizable news feeds.

## Features

🚀 **Modern UI Design**
- **Tabbed Settings Interface** - Organized General, Google, and News tabs
- **Material UI Standards** - 8px spacing grid and consistent button heights
- **Dark/Light Theme Support** - Professional themes for any preference
- Clean interface with smooth animations and transitions
- Google Fonts (Inter) and Material Icons

📋 **Enhanced Task Management**
- **Google Tasks Native Sorting** - Uses same ordering logic as Google Tasks
- **Multi-Task List Support** - Switch between different Google Task Lists
- **Completed Tasks Management** - Collapsible section for completed tasks
- **Position Syncing** - Drag & drop order syncs back to Google Tasks
- **Smart Task Placement** - New tasks appear at top, respecting due dates
- **Visual Urgency Indicators** - Clear priority system for due dates
- **Hidden Actions** - Clean interface with actions appearing on hover
- **Comprehensive Tooltips** - Hover for detailed task information
- Hierarchical subtasks with drag-and-drop reordering
- Task completion animations

☁️ **Google Tasks Integration**
- **Multi-List Support** - Select and switch between different Google Task Lists
- **Bidirectional synchronization** with position/order syncing
- **Real-time Sync Status** - Shows last sync time and connection status
- **Force Task List Switching** - Clears local tasks and downloads from selected list
- **Native Ordering** - Respects Google Tasks' position-based sorting
- OAuth 2.0 authentication
- Automatic background sync every 5 minutes
- Offline support with Chrome storage

🌤️ **Weather Widget**
- Location-based weather updates
- Temperature and weather condition display
- Automatic updates every 10 minutes

📰 **News Ticker**
- **Customizable RSS Feeds** - Add/remove feeds through settings
- Scrolling news feed with real-time updates
- Cached news for offline viewing
- Clickable news items that open in new tabs

💬 **Smart Greetings & Quotes**
- **240 Casual Greetings** - 10 unique greetings for each hour of the day
- **Weekend-Specific Messages** - Special greetings for Saturdays and Sundays
- **Auto-Cycling** - Greetings change every ~6 minutes within the hour
- **Time-Aware** - Context-appropriate messages based on time of day
- **Inspirational Quotes** - Fetched from DummyJSON API
- **Quote Batch System** - 20 quotes fetched and cached for offline use
- **Smart Cycling** - New quote on each page refresh
- **Auto-Refetch** - Fetches more quotes when 5 or fewer remain
- Fallback quotes for offline scenarios

⏰ **Real-time Clock**
- Live updating clock with date display
- 12-hour format with AM/PM indicator

🎨 **Customization & Visibility**
- **Show/Hide Any Widget** - Toggle visibility for greeting, quote, clock, search, tasks, weather, news
- **Settings Hover Reveal** - Settings icon appears only when hovering top-right corner
- **Resource Optimization** - Hidden widgets don't load or consume resources
- **Fast Loading** - No fade-in animations for instant display
- **Theme Persistence** - Settings saved and restored on reload

🔍 **Multi-Engine Smart Search**
- **Quick Search Engine Selection** - Type shortcut + Tab to select engine
- **8 Popular Search Engines** - Perplexity (default), Google, ChatGPT, DuckDuckGo, Bing, YouTube, GitHub, Stack Overflow
- **Visual Engine Tags** - Color-coded tags appear inside search box
- **Interactive Help Modal** - Press `Ctrl+/` to view all shortcuts
- **Keyboard Shortcuts**:
  - `p` + Tab → Perplexity
  - `g` + Tab → Google
  - `c` + Tab → ChatGPT
  - `d` + Tab → DuckDuckGo
  - `b` + Tab → Bing
  - `y` + Tab → YouTube
  - `gh` + Tab → GitHub
  - `so` + Tab → Stack Overflow
  - `Ctrl+/` → Show/hide help modal
  - `Esc` → Clear selection or close help
- **Easy Tag Removal** - Press Esc or click X to clear selection
- Instant navigation on form submission

## Installation

### For Development

1. **Clone the repository**
   ```bash
   git clone git@github.com:iinaveedahmed/iNewTab-chrome-extension.git
   cd iNewTab-chrome-extension
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Google OAuth**
   - Follow instructions in `documentation/SETUP.md` to create Google Cloud credentials
   - Update `manifest.json` with your OAuth client ID

4. **Load in Chrome**
   - Open `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked" and select the project folder

### For Production

1. **Build the extension**
   ```bash
   npm run build
   ```

2. **Package for distribution**
   - ZIP the entire project folder
   - Upload to Chrome Web Store or distribute manually

## Project Structure

```
iNewTab-chrome-extension/
├── src/                          # Source code
│   ├── css/                      # Stylesheets
│   │   └── styles.css           # Main styles
│   ├── html/                     # HTML files
│   │   └── newtab.html          # Main new tab page
│   └── js/                       # JavaScript modules
│       ├── modules/              # Core modules
│       │   ├── chrome-storage.js    # Chrome storage wrapper
│       │   ├── google-tasks.js      # Google Tasks API
│       │   ├── sync-manager.js      # Sync management
│       │   ├── task-renderer.js     # Task UI rendering
│       │   ├── weather-module.js    # Weather widget
│       │   ├── news-module.js       # News ticker
│       │   ├── greeting-module.js   # Greetings & quotes
│       │   ├── search-module.js     # Multi-engine search
│       │   └── settings-module.js   # Settings management
│       ├── utils/                # Utility functions
│       │   ├── constants.js         # App constants
│       │   └── helpers.js           # Helper functions
│       └── main.js               # Main application entry
├── assets/                       # Static assets
│   └── icons/                    # Extension icons
├── tests/                        # Test files
│   ├── unit/                     # Unit tests
│   ├── integration/              # Integration tests
│   └── setup.js                  # Test setup
├── documentation/                # Documentation (API, setup, contributing)
├── docs/                         # Website (GitHub Pages)
├── dist/                         # Build output
├── manifest.json                 # Extension manifest
└── package.json                  # NPM configuration
```

## Development

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### Code Quality

```bash
# Lint code
npm run lint

# Fix linting issues
npm run lint:fix
```

### Building

```bash
# Run tests and linting
npm run build
```

## Configuration

### Environment Variables

The extension uses Google OAuth for authentication. Configure your credentials in `manifest.json`:

```json
{
  "oauth2": {
    "client_id": "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com",
    "scopes": ["https://www.googleapis.com/auth/tasks"]
  }
}
```

### Customization

#### RSS Feeds
Default news source in `src/js/utils/constants.js`:

```javascript
const RSS_FEEDS = [
    'https://news.google.com/rss'
];
```

You can also add/remove RSS feeds through the Settings interface (Settings → News tab).

#### Sync Intervals
Adjust sync frequency in `src/js/utils/constants.js`:

```javascript
const SYNC_CONFIG = {
    AUTO_SYNC_INTERVAL: 5 * 60 * 1000, // 5 minutes
};
```

## API Reference

### Core Classes

#### `NewTabApp`
Main application class that coordinates all modules.

```javascript
const app = new NewTabApp();
await app.init();
```

#### `ChromeStorage`
Wrapper for Chrome storage API with async/await support.

```javascript
const storage = new ChromeStorage();
await storage.saveTasks(tasks);
const tasks = await storage.loadTasks();
```

#### `GoogleTasksAPI`
Google Tasks API integration with OAuth authentication and multi-list support.

```javascript
const api = new GoogleTasksAPI();
await api.authenticate();
const taskLists = await api.getAllTaskLists();
api.setTaskList('list-id');
const tasks = await api.getTasks();
await api.moveTask('task-id', null, 'previous-task-id');
```

#### `TaskRenderer`
Handles task UI rendering and event management.

```javascript
const renderer = new TaskRenderer(tasks, app);
renderer.render();
```

### Utility Functions

#### `Utils.formatDueDate(date)`
Formats due dates with smart labels.

```javascript
Utils.formatDueDate('2023-10-15'); // { text: 'Today', class: 'today' }
```

#### `Utils.debounce(func, delay)`
Debounces function calls.

```javascript
const debouncedSave = Utils.debounce(saveFunction, 300);
```

## Security

- **OAuth 2.0**: Secure authentication with Google
- **XSS Prevention**: All user content is escaped
- **CSP**: Content Security Policy enforced
- **HTTPS Only**: All API calls use secure connections
- **Minimal Permissions**: Only requests necessary Chrome permissions

## Browser Support

- Chrome 88+
- Edge 88+ (Chromium-based)
- Brave Browser
- Any Chromium-based browser with extension support

## Contributing

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Run tests** (`npm test`)
4. **Commit changes** (`git commit -m 'Add amazing feature'`)
5. **Push to branch** (`git push origin feature/amazing-feature`)
6. **Open a Pull Request**

### Development Guidelines

- Follow ESLint configuration
- Write tests for new features
- Update documentation
- Use semantic commit messages
- Ensure cross-browser compatibility

## Troubleshooting

### Common Issues

#### Authentication Not Working
1. Verify OAuth client ID in `manifest.json`
2. Check Google Cloud Console API enablement
3. Ensure redirect URLs are correctly configured

#### Tasks Not Syncing
1. Check internet connection
2. Verify Google Tasks API permissions
3. Try manual sync button
4. Check browser console for errors
5. Verify correct task list is selected

#### Task List Not Switching
1. Ensure you're authenticated with Google
2. Check task list dropdown shows available lists
3. Try disconnecting and reconnecting Google account
4. Verify task list selection is saved in settings

#### Completed Tasks Not Hiding
1. Check completed tasks toggle button functionality
2. Verify tasks are marked as completed properly
3. Try refreshing the extension
4. Check task rendering logic in console

#### Extension Not Loading
1. Verify `manifest.json` syntax
2. Check file paths in HTML
3. Ensure all required permissions are granted
4. Check Chrome extensions page for errors

### Debug Mode

Enable verbose logging by setting:
```javascript
window.DEBUG = true;
```

## Performance

- **Storage**: Uses Chrome Storage API for better performance than localStorage
- **Caching**: News and weather data cached locally
- **Lazy Loading**: Modules loaded only when needed
- **Debouncing**: User input debounced to prevent excessive API calls
- **Background Sync**: Tasks sync in background without blocking UI

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Google Tasks API](https://developers.google.com/tasks)
- [Open-Meteo Weather API](https://open-meteo.com/)
- [RSS2JSON API](https://rss2json.com/)
- [DummyJSON API](https://dummyjson.com/) - For inspirational quotes
- [Material Design Icons](https://fonts.google.com/icons)
- [Inter Font](https://fonts.google.com/specimen/Inter)

## Changelog

### Version 2.2.0
- **Smart Greetings System** - 240 casual, time-aware greetings (10 per hour)
- **Weekend Greetings** - Special messages for Saturdays and Sundays
- **Inspirational Quotes** - Batch fetching from DummyJSON API with caching
- **Quote Cycling** - New quote on each page refresh with auto-refetch
- **Multi-Engine Search** - 8 search engines with keyboard shortcuts
- **Search Help Modal** - Press Ctrl+/ to view shortcuts and tips
- **Visibility Controls** - Show/hide any widget (greeting, quote, clock, search, tasks, weather, news)
- **Settings Hover Reveal** - Settings icon appears on top-right corner hover
- **Resource Optimization** - Hidden widgets don't load or consume resources
- **Performance Boost** - Removed fade-in animations for instant display
- Enhanced ChromeStorage with quote batch caching
- Fixed CORS issues with CORS-friendly API selection

### Version 2.1.0
- **Google Task List Selection** - Choose which Google Task List to display
- **Completed Tasks Management** - Collapsible section for completed tasks
- **Google Tasks Native Sorting** - Uses same ordering logic as Google Tasks
- **Position Syncing** - Drag & drop order syncs back to Google Tasks
- **Real-time Sync Status** - Shows accurate last sync timestamps
- **Force Download on List Switch** - Ensures clean task list switching
- Enhanced task creation positioning (new tasks at top)
- Improved error handling and user feedback

### Version 2.0.0
- **Tabbed Settings Interface** with General, Google, and News sections
- **Smart Task Management** with due date sorting and urgency indicators
- **Material UI Standards** with consistent spacing and button heights
- **Enhanced UX** with hidden actions that appear on hover
- **Improved Sync Status** showing actual sync timing
- **Better Theme Support** with comprehensive dark/light mode
- **RSS Feed Management** through settings interface
- Complete rewrite with modular architecture
- Added comprehensive test suite with 53 passing tests

### Version 1.0.0
- Initial release
- Basic task management
- Weather and news widgets
- Chrome storage integration