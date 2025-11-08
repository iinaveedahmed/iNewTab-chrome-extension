# Google Tasks Integration Setup

## Prerequisites

Before you can use the Google Tasks integration, you need to set up OAuth credentials.

## Google Cloud Console Setup

### 1. Create a Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Google Tasks API** for your project

### 2. Create OAuth 2.0 Credentials
1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth 2.0 Client IDs**
3. Select **Chrome Extension** as the application type
4. Add your extension ID to the authorized extensions list

### 3. Update manifest.json
1. Copy your OAuth 2.0 Client ID from Google Cloud Console
2. Replace `YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com` in `manifest.json` with your actual client ID:

```json
{
  "oauth2": {
    "client_id": "YOUR_ACTUAL_CLIENT_ID.apps.googleusercontent.com",
    "scopes": [
      "https://www.googleapis.com/auth/tasks"
    ]
  }
}
```

## Installation

### 1. Load Extension in Chrome
1. Open Chrome and go to `chrome://extensions/`
2. Enable **Developer mode** (toggle in top right)
3. Click **Load unpacked**
4. Select this project folder

### 2. Test Authentication
1. Open a new tab to see the extension
2. Click the account icon in the Tasks section
3. Complete the Google OAuth flow
4. Your tasks should now sync with Google Tasks!

## Features

✅ **Bidirectional Sync**: Changes in the extension sync to Google Tasks and vice versa
✅ **Offline Support**: Works offline with Chrome storage, syncs when online
✅ **Automatic Sync**: Syncs every 5 minutes when authenticated
✅ **Manual Sync**: Click the sync button for immediate synchronization
✅ **Task Animations**: Smooth animations when completing tasks
✅ **Drag & Drop**: Reorder tasks with visual feedback
✅ **Subtasks**: Hierarchical task organization
✅ **Modern UI**: Google Fonts and Material Icons

## Architecture

- **Chrome Storage API**: Replaces localStorage for better performance
- **Google Tasks API**: Full integration with Google's task service
- **Sync Manager**: Handles bidirectional synchronization
- **Material Design**: Modern UI with Google Fonts and icons

## Troubleshooting

### Authentication Issues
- Ensure your Client ID is correct in manifest.json
- Check that Google Tasks API is enabled in Google Cloud Console
- Verify the extension ID matches what's configured in OAuth settings

### Sync Issues
- Check browser console for error messages
- Try manual sync with the sync button
- Sign out and sign back in to refresh authentication

### Performance
- Extension uses Chrome Storage API for better performance
- Local changes are saved immediately
- Google sync happens in the background

## Development

The extension is built with vanilla JavaScript and consists of:

- `manifest.json` - Extension configuration with Google OAuth
- `newtab.html` - Main page structure
- `styles.css` - All styling with Google Fonts
- `script.js` - Main application logic
- `chrome-storage.js` - Chrome Storage API wrapper
- `google-tasks.js` - Google Tasks API integration
- `sync-manager.js` - Synchronization logic

## Security

- OAuth tokens are managed by Chrome's identity API
- No sensitive data is stored locally
- All API calls use HTTPS
- Follows Chrome extension security best practices