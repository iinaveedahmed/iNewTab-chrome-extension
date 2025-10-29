# Custom New Tab Chrome Extension

## Project Overview
A Chrome extension that replaces the default new tab page with a custom dashboard featuring clock, search, task management, weather, and news ticker. Built with vanilla JavaScript using Chrome Extension Manifest v3.

## Architecture

### Core Files
- `manifest.json` - Chrome extension manifest (v3) with new tab override and storage permissions
- `newtab.html` - Single-page dashboard with embedded CSS styling (dark theme)
- `script.js` - All functionality in one file with modular sections
- `icon.png` - Extension icon (47KB)
- `.github/copilot-instructions.md` - Comprehensive development guidelines

### Features Overview
1. **Clock/Date Display** - Real-time clock with 12-hour format and full date
2. **Dual Search** - Perplexity default search, Google with `g:` prefix
3. **Task Manager** - Hierarchical tasks with subtasks, drag-drop reordering, localStorage persistence
4. **Weather Widget** - Geolocation-based weather via Open-Meteo API
5. **News Ticker** - RSS feeds via rss2json.com with caching and hourly updates

## Technical Implementation

### Error Handling
All operations wrapped in `safe()` function:
```javascript
function safe(fn) {
    try { return fn(); }
    catch (e) { console.error(e); return null; }
}
```

### Data Persistence
- **Tasks**: localStorage with JSON serialization via `saveTasks()`
- **News**: Cached hourly with timestamp tracking
- **Weather**: 10-minute refresh intervals

### Event Management
- **Tasks**: Event delegation pattern for dynamic DOM manipulation
- **Drag-drop**: Native HTML5 API for both tasks and subtasks
- **News ticker**: Animated scrolling with click handlers

### API Integrations
- **Weather**: Open-Meteo API (no key required) + BigDataCloud for location names
- **News**: RSS feeds via rss2json.com proxy service
- **Error handling**: Graceful degradation for all external services

## Development Commands

### Testing Extension
```bash
# Chrome Extensions → Developer mode → Load unpacked
# Point to project root directory
# Open new tab to test changes
```

### Debugging
- Use DevTools console to debug `safe()` wrapped errors
- Check localStorage state in Application tab
- Test RSS feed URLs directly in rss2json.com

## File Structure
```
newTab/
├── manifest.json          # Extension manifest
├── newtab.html           # Main HTML with embedded CSS
├── script.js             # All JavaScript functionality
├── icon.png              # Extension icon
└── .github/
    └── copilot-instructions.md  # Development guidelines
```

## Code Conventions

### Naming
- Functions: camelCase (`updateClock`, `loadWeather`)
- Variables: camelCase with descriptive names
- DOM IDs: kebab-case in HTML, camelCase in JS

### Data Structures
```javascript
// Task format
{ text: string, done: boolean, subs: Array<{text: string, done: boolean}> }

// Cached news format
{ title: string, link: string }
```

### Styling
- Dark theme with CSS variables
- Flexbox layouts
- CSS animations for news ticker
- Hover states and transitions

## Performance Considerations
- RSS updates: 1 hour intervals (avoid API rate limits)
- Weather updates: 10 minutes
- Time updates: 1 second for clock, 1 minute for "time ago" displays
- Task operations: Immediate localStorage saves

## Extension-Specific Notes
- Manifest v3 compliance
- Storage permission for unlimited localStorage
- No external script loading - all code inline
- Icons must exist in project root
- New tab override functionality

## Testing & Validation
- Load extension in Chrome Developer mode
- Test all features: clock, search, tasks, weather, news
- Verify localStorage persistence
- Check API error handling
- Validate manifest.json format