# iNewTab Website

This directory contains the marketing website for the iNewTab Chrome extension.

**Note:** This website is hosted via GitHub Pages from the `/docs` folder.

## 🌐 Structure

```
docs/
├── index.html          # Main landing page
├── privacy.html        # Privacy Policy page
├── terms.html          # Terms of Service page
├── styles.css          # All styles and responsive design
├── script.js           # Interactive functionality
└── README.md           # This file
```

## ✨ Features

The website includes:

- **Hero Section** - Eye-catching introduction with CTA buttons
- **Google Tasks Sync Section** - Detailed explanation of OAuth integration
- **Security Section** - Emphasizing no middle server architecture
- **Open Source Section** - MIT License and contribution information
- **Features Showcase** - All extension features with detailed descriptions
- **RSS Feed Section** - Current features and upcoming improvements
- **FAQ Section** - Comprehensive answers to common questions
- **Contact Section** - Links to GitHub Issues and Discussions
- **Privacy Policy** - Detailed privacy information
- **Terms of Service** - Legal terms and conditions

## 🎨 Design

- **Modern UI** - Clean, professional design with Material Design influence
- **Responsive** - Works on desktop, tablet, and mobile devices
- **Gradients** - Beautiful gradient backgrounds and accents
- **Animations** - Smooth scroll-triggered animations
- **Accessibility** - Semantic HTML and proper ARIA labels
- **Performance** - Optimized CSS and minimal JavaScript

## 🚀 Deployment

### Option 1: GitHub Pages (Recommended)

1. Push the website to your repository (already in `/docs` folder)
2. Go to Settings → Pages
3. Select the branch and `/docs` folder
4. Your site will be available at `https://yourusername.github.io/iNewTab-chrome-extension/`

### Option 2: Netlify

1. Connect your GitHub repository to Netlify
2. Set the base directory to `docs`
3. Set the publish directory to `docs`
4. Deploy!

### Option 3: Vercel

1. Import your GitHub repository
2. Set the root directory to `docs`
3. Deploy automatically

### Option 4: Custom Hosting

Simply upload all files in the `docs` directory to your web server.

## 🛠️ Development

### Local Testing

You can test the website locally using any static server:

**Using Python:**
```bash
cd docs
python -m http.server 8000
# Visit http://localhost:8000
```

**Using Node.js (http-server):**
```bash
cd docs
npx http-server
```

**Using VS Code:**
Install the "Live Server" extension and right-click on `index.html` → "Open with Live Server"

## 📝 Customization

### Update Content

- Edit HTML files directly for content changes
- All text is easily editable in the HTML files
- No build process required

### Update Styles

- All styles are in `styles.css`
- CSS variables at the top make it easy to change colors
- Responsive breakpoints are clearly marked

### Update Links

Make sure to update these placeholders:
- Chrome Web Store link (currently `#` in the HTML)
- Any other specific URLs for your deployment

## 🎯 Key Sections

### Landing Page Sections

1. **Navigation** - Sticky navbar with smooth scrolling
2. **Hero** - Main value proposition with mockup
3. **Google Tasks Sync** - Feature grid highlighting sync capabilities
4. **Security** - Visual diagram showing direct OAuth connection
5. **Open Source** - MIT License information
6. **Features Showcase** - Detailed feature descriptions
7. **RSS Feed** - Current and upcoming RSS features
8. **FAQ** - 12 common questions answered
9. **Contact** - GitHub links for issues and discussions
10. **Footer** - Quick links and social

### Additional Pages

- **Privacy Policy** - Comprehensive privacy information
- **Terms of Service** - Legal terms and conditions

## 🔧 Technical Details

### Dependencies

- **Google Fonts** - Inter font family
- **Material Icons** - Icon font from Google
- **No JavaScript frameworks** - Vanilla JS for maximum performance
- **No build process** - Plain HTML, CSS, and JS

### Browser Support

- Chrome 88+
- Firefox 78+
- Safari 14+
- Edge 88+
- All modern browsers

### Performance

- Lightweight (< 100KB total)
- Fast loading with minimal dependencies
- Optimized CSS with utility classes
- Smooth animations using CSS transitions
- Lazy loading for images

## 📱 Responsive Design

The website is fully responsive with breakpoints at:
- **Desktop:** 1200px+ (default)
- **Tablet:** 768px - 1024px
- **Mobile:** < 768px

## 🎨 Color Palette

```css
--primary: #4285F4      /* Google Blue */
--secondary: #34A853    /* Google Green */
--accent: #FBBC04       /* Google Yellow */
--danger: #EA4335       /* Google Red */
--dark: #1a1a2e         /* Dark backgrounds */
--light: #ffffff        /* Light backgrounds */
```

## ✅ Checklist Before Launch

- [ ] Update Chrome Web Store link in CTA buttons
- [ ] Add actual extension screenshots/mockups
- [ ] Test all links (especially GitHub links)
- [ ] Test on mobile devices
- [ ] Run accessibility audit
- [ ] Test in all major browsers
- [ ] Add Google Analytics (if desired)
- [ ] Set up custom domain (if applicable)
- [ ] Add meta tags for social sharing (OpenGraph, Twitter Cards)
- [ ] Create favicon and app icons

## 🤝 Contributing

To improve the website:

1. Fork the repository
2. Make your changes in the `website` directory
3. Test locally
4. Submit a pull request

## 📄 License

The website content is part of the iNewTab project and is released under the MIT License.

## 🙏 Credits

- **Design Inspiration:** Material Design, modern SaaS websites
- **Icons:** Material Icons by Google
- **Fonts:** Inter by Rasmus Andersson
- **Developer:** iNewTab Team

---

Built with ❤️ for productivity
