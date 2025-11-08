# Chrome Web Store Submission Guide

## Extension Package Ready ✓

**Package Location:** `packages/custom-new-tab-extension-v2.2.0.zip`
**Package Size:** 82 KB
**Version:** 2.2.0
**Status:** Ready for upload

---

## Pre-Submission Checklist

### ✅ Technical Requirements (Complete)
- [x] **Manifest Version 3** - Using latest manifest format
- [x] **Version Number** - 2.2.0 in manifest.json, package.json, and HTML
- [x] **Extension Name** - "iNewTab"
- [x] **Description** - Detailed description (max 132 characters met)
- [x] **Icons** - 300x300 PNG icon included (Chrome will scale to 16, 48, 128)
- [x] **Permissions** - Only necessary permissions requested:
  - `storage` - For Chrome storage API
  - `identity` - For Google OAuth
  - `https://www.googleapis.com/*` - Google Tasks API
  - `https://dummyjson.com/*` - Quotes API
- [x] **OAuth Configuration** - Google OAuth client ID configured
- [x] **Code Quality** - All tests passing (53/53)
- [x] **Minification** - JS and CSS minified for distribution
- [x] **No External Code** - All code is original or properly licensed

### 📋 Chrome Web Store Listing Requirements

You will need to prepare the following for the Chrome Web Store Developer Dashboard:

#### 1. **Store Listing Information**

**Product Name:**
```
iNewTab - Smart Productivity Dashboard
```

**Summary (max 132 characters):**
```
Transform your new tab into a smart dashboard with greetings, quotes, multi-search, tasks, weather & news
```

**Description (max 16,000 characters):**
```
iNewTab replaces your browser's new tab page with a beautiful, productivity-focused dashboard that helps you stay organized and inspired throughout your day.

🎯 KEY FEATURES

💬 Smart Greetings & Quotes
• 240 casual, time-aware greetings that change every hour
• Weekend-specific messages for Saturdays and Sundays
• Inspirational quotes that refresh on each tab open
• Offline support with cached quotes

🔍 Multi-Engine Search
• 8 popular search engines in one place
• Quick keyboard shortcuts (p, g, c, d, b, y, gh, so + Tab)
• Perplexity, Google, ChatGPT, DuckDuckGo, Bing, YouTube, GitHub, Stack Overflow
• Visual color-coded tags
• Help modal with Ctrl+/

📋 Smart Task Management
• Local task management with drag-and-drop
• Google Tasks sync with multiple task list support
• Subtasks and due dates
• Completed tasks section
• Automatic sync every 5 minutes
• Offline-first design

🎨 Full Customization
• Show/hide any widget (greeting, quote, clock, search, tasks, weather, news)
• Dark and light themes
• Settings reveal on hover (top-right corner)
• Resource optimization - hidden widgets don't load

🌤️ Weather & News
• Location-based weather updates
• Customizable RSS news feeds
• Default Google News or add your own feeds

✨ PRIVACY & PERFORMANCE
• All data stored locally in Chrome storage
• No data collection or analytics
• Minimal permissions requested
• Fast and lightweight (82 KB)
• No external tracking

🔒 SECURITY
• OAuth 2.0 for secure Google authentication
• XSS prevention with content escaping
• HTTPS-only API calls
• Regular security updates

📱 REQUIREMENTS
• Chrome 88+ or any Chromium-based browser
• Optional: Google account for task sync

🆓 FREE & OPEN SOURCE
• MIT License
• Source code: https://github.com/iinaveedahmed/iNewTab-chrome-extension
• Active development and support

⭐ PERFECT FOR
• Professionals seeking productivity tools
• Students managing tasks and deadlines
• Anyone who wants a beautiful new tab experience
• Users who value privacy and customization
```

**Category:**
```
Productivity
```

**Language:**
```
English
```

#### 2. **Store Listing Assets**

**Icon (Required):**
- ✅ Already included: `assets/icons/icon.png` (300x300)
- Chrome will automatically scale to required sizes

**Screenshots (Required - Minimum 1, Maximum 5):**
You need to create screenshots showing:
1. **Main dashboard view** - Show greeting, quote, search, tasks, and widgets
2. **Multi-engine search** - Show search engine selection with tags
3. **Google Tasks integration** - Show task management and sync
4. **Settings panel** - Show visibility controls and customization options
5. **Different themes** - Show dark and light mode

**Screenshot Requirements:**
- Size: 1280x800 or 640x400 pixels
- Format: PNG or JPEG
- No padding or borders

**Promotional Images (Optional but Recommended):**
- **Small Promo Tile:** 440x280 (recommended for better visibility)
- **Marquee Promo Tile:** 1400x560 (for featured placement)

#### 3. **Privacy Practice Disclosure**

**Data Collection:**
```
This extension does NOT collect, transmit, or sell user data.
All data is stored locally in Chrome storage.
```

**Single Purpose:**
```
Replace the new tab page with a productivity-focused dashboard
```

**Permission Justifications:**
- `storage` - Store tasks, settings, and cached data locally
- `identity` - Optional Google OAuth for Google Tasks sync
- `https://www.googleapis.com/*` - Sync with Google Tasks API
- `https://dummyjson.com/*` - Fetch inspirational quotes

#### 4. **OAuth Scopes (if applicable)**

Since this extension uses Google OAuth:
- **Scope:** `https://www.googleapis.com/auth/tasks`
- **Justification:** Required to read and write Google Tasks data for bidirectional sync

---

## Submission Steps

### 1. **Create Developer Account**
1. Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
2. Pay one-time $5 registration fee
3. Complete developer verification

### 2. **Upload Extension**
1. Click "New Item"
2. Upload: `packages/custom-new-tab-extension-v2.2.0.zip`
3. Wait for automated review (checks for malware, policy violations)

### 3. **Complete Store Listing**
1. Fill in all required fields from section above
2. **Upload screenshots** (you need to create these first - see requirements above)
3. Add optional promotional images for better visibility
4. Set pricing (Free)
5. Select regions (Worldwide recommended)

### 4. **Privacy & Compliance**
1. Complete privacy practices questionnaire
2. Declare that extension does NOT collect user data
3. Provide justification for each permission
4. Add privacy policy URL (optional but recommended)

### 5. **OAuth Configuration**
1. In Google Cloud Console, add authorized domains:
   - `chromiumapp.org` (for Chrome extensions)
2. Add authorized redirect URIs:
   - `https://<extension-id>.chromiumapp.org/`
3. Get extension ID after first upload (appears in dashboard)
4. Update OAuth configuration with extension ID

### 6. **Submit for Review**
1. Review all information carefully
2. Click "Submit for Review"
3. Wait for Google review (typically 1-7 days)
4. Address any feedback if review is rejected

---

## Post-Submission

### If Approved ✅
- Extension will be published to Chrome Web Store
- Update README.md with Chrome Web Store link
- Share on social media and developer communities
- Monitor reviews and feedback

### If Rejected ❌
- Read rejection reason carefully
- Make necessary changes
- Re-submit updated package
- Common rejection reasons:
  - Unclear permission justifications
  - Missing privacy policy for data collection
  - Misleading screenshots or description
  - Keyword stuffing in description

---

## Updating the Extension

For future updates:
1. Increment version in `manifest.json` and `package.json`
2. Run `npm run build:zip`
3. Upload new ZIP to existing extension listing
4. Update changelog in store description
5. Submit updated version for review

---

## Important Notes

### Google OAuth Client ID
⚠️ **SECURITY WARNING:** The current OAuth client ID in the code is for development/testing.

**Before publishing:**
1. Create a new OAuth 2.0 client in Google Cloud Console specifically for production
2. Update `manifest.json` with the production client ID
3. Configure authorized domains and redirect URIs
4. Keep production credentials secure (never commit to public repos)

### Required Actions Before First Submission
- [ ] Create 1-5 screenshots of the extension in use
- [ ] (Optional) Create promotional images (440x280 and 1400x560)
- [ ] (Optional) Set up privacy policy URL if you plan to collect any data in future
- [ ] (Recommended) Create different OAuth client ID for production
- [ ] Test extension in incognito mode to ensure it works
- [ ] Test extension with fresh Google account to verify OAuth flow

---

## Support & Resources

**Chrome Web Store Documentation:**
- [Developer Program Policies](https://developer.chrome.com/docs/webstore/program-policies/)
- [Publishing Guide](https://developer.chrome.com/docs/webstore/publish/)
- [Branding Guidelines](https://developer.chrome.com/docs/webstore/branding/)

**Extension Support:**
- GitHub Issues: https://github.com/iinaveedahmed/iNewTab-chrome-extension/issues
- Email: naveed@inatiqo.com

---

## Package Information

**Production Package:**
```
File: packages/custom-new-tab-extension-v2.2.0.zip
Size: 82 KB
Ready for Chrome Web Store upload
```

**Development Package:**
```
File: packages/custom-new-tab-extension-v2.2.0-dev.zip
Size: 174 KB
For development and debugging (not for Web Store)
```

**Build Commands:**
```bash
# Run tests and build
npm run build

# Create distribution build
npm run build:dist

# Create ZIP packages
npm run build:zip

# View package contents
node scripts/package.js list
```

---

## Version History

### v2.2.0 (Current)
- Smart greetings system (240 casual messages)
- Inspirational quotes from DummyJSON API
- Multi-engine search with 8 search engines
- Complete visibility controls
- Settings hover reveal
- Performance optimizations

### v2.1.0
- Google Task List selection
- Completed tasks management
- Position syncing with Google Tasks

### v2.0.0
- Complete rewrite with modular architecture
- Material UI design
- Enhanced task management

---

**Status:** ✅ Ready for Chrome Web Store Submission

**Next Steps:**
1. Create screenshots (1-5 images showing extension features)
2. Create developer account and pay $5 fee
3. Upload package and complete store listing
4. Submit for review
