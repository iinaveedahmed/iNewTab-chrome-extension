# Custom New Tab Chrome Extension - AI Coding Guidelines

## Project Overview
This is a Chrome extension that replaces the default new tab page with a custom dashboard featuring clock, search, tasks, weather, and news ticker. Built with vanilla JavaScript, no frameworks.

## Architecture & Key Components

### Core Structure
- `manifest.json` - Chrome extension manifest (v3) with new tab override and storage permissions
- `newtab.html` - Single-page dashboard with embedded CSS styling (dark theme)
- `script.js` - All functionality in one file with modular sections

### Component Boundaries
1. **Clock/Date** - Simple time display with 12-hour format
2. **Search** - Dual search (Perplexity default, Google with `g:` prefix)
3. **Task Manager** - Hierarchical tasks with subtasks, drag-drop, localStorage persistence
4. **Weather** - Geolocation-based weather via Open-Meteo API
5. **News Ticker** - RSS feeds via rss2json.com with caching and hourly updates

## Critical Patterns

### Error Handling
All operations wrapped in `safe()` function - use this pattern for any new code:
```javascript
function safe(fn) {
    try { return fn(); } 
    catch (e) { console.error(e); return null; }
}
```

### Data Persistence
- Tasks: `localStorage` with JSON serialization via `saveTasks()`
- News: Cached hourly with timestamp in `cachedNews` and `lastNewsUpdate`
- Always use `safe()` wrapper for localStorage operations

### Event Management
- Tasks use **event delegation** pattern - all event listeners attached after DOM manipulation
- Drag-drop implemented with native HTML5 API on both tasks and subtasks
- News ticker links use data attributes + post-render event binding

### API Integration
- **Weather**: Open-Meteo (no key required) + BigDataCloud for location names
- **News**: RSS feeds via rss2json.com proxy service
- **Error fallbacks**: All external APIs have graceful degradation messages

## Development Workflows

### Testing Extension
1. Open Chrome → Extensions → Developer mode → Load unpacked
2. Point to project root directory
3. Open new tab to test changes
4. Use DevTools console to debug `safe()` wrapped errors

### Key Files for Changes
- **UI/Styling**: Modify embedded CSS in `newtab.html` (no external stylesheets)
- **Functionality**: All logic in `script.js` with clear comment sections
- **Extension config**: `manifest.json` for permissions/icons

### Performance Considerations
- RSS updates: 1 hour intervals (avoid API rate limits)
- Weather updates: 10 minutes
- Time updates: 1 second for clock, 1 minute for "time ago" displays
- Task operations: Immediate localStorage saves with debouncing

## Code Conventions

### Naming
- Functions: camelCase (`updateClock`, `loadWeather`)
- Variables: camelCase with descriptive names (`cachedNews`, `lastNewsUpdate`)
- DOM IDs: kebab-case in HTML, camelCase in JS (`task-list` → `taskList`)

### Data Structures
```javascript
// Task format
{ text: string, done: boolean, subs: Array<{text: string, done: boolean}> }

// Cached news format  
{ title: string, link: string }
```

### DOM Manipulation
- Prefer `innerHTML` for bulk updates with post-render event binding
- Use `dataset` attributes for passing data to event handlers
- All external links must open in new tabs (`_blank`)

## Extension-Specific Notes
- Manifest v3 requires service workers (not used here - all client-side)
- Storage permission allows unlimited localStorage usage
- No external script loading - all code must be inline or in local files
- Icons referenced in manifest must exist in project root

## Common Debugging
- Check browser console for `safe()` caught errors
- Verify localStorage state in DevTools Application tab
- Test RSS feed URLs directly in rss2json.com for API issues
- Use Chrome extension DevTools for manifest validation