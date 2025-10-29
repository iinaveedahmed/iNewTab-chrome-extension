# Contributing Guide

Thank you for your interest in contributing to the Custom New Tab Extension! This guide will help you get started with development and ensure your contributions align with the project standards.

## Development Setup

### Prerequisites

- Node.js 16+ and npm
- Chrome browser for testing
- Git
- Code editor (VS Code recommended)

### Getting Started

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/your-username/newTab.git
   cd newTab
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Google OAuth credentials**
   - Follow the [setup guide](SETUP.md) to create Google Cloud credentials
   - Update `manifest.json` with your client ID

4. **Load extension in Chrome**
   - Open `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked" and select the project folder

5. **Run tests**
   ```bash
   npm test
   ```

## Development Workflow

### Branch Strategy

- `main` - Stable release branch
- `develop` - Development integration branch
- `feature/*` - Feature branches
- `bugfix/*` - Bug fix branches
- `hotfix/*` - Critical fixes for production

### Making Changes

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Follow the coding standards below
   - Add tests for new functionality
   - Update documentation as needed

3. **Test your changes**
   ```bash
   npm test
   npm run lint
   ```

4. **Commit your changes**
   ```bash
   git commit -m "feat: add your feature description"
   ```

5. **Push and create pull request**
   ```bash
   git push origin feature/your-feature-name
   ```

## Coding Standards

### JavaScript Style Guide

We use ESLint with the following rules:

```javascript
// Use single quotes
const message = 'Hello world';

// Use 4-space indentation
function example() {
    if (condition) {
        doSomething();
    }
}

// Use semicolons
const value = getValue();

// Use const/let, not var
const immutableValue = 'constant';
let mutableValue = 'variable';

// Use descriptive names
const userAuthToken = getAuthToken();
const isUserAuthenticated = checkAuthStatus();

// Document complex functions
/**
 * Synchronizes local tasks with Google Tasks
 * @param {Array} localTasks - Local task array
 * @param {Array} googleTasks - Google Tasks array
 * @returns {Promise<Array>} Merged task array
 */
async function mergeTasks(localTasks, googleTasks) {
    // Implementation
}
```

### File Organization

```
src/
├── js/
│   ├── modules/          # Self-contained modules
│   │   ├── module-name.js    # PascalCase class exports
│   ├── utils/            # Utility functions
│   │   ├── helpers.js        # General utilities
│   │   └── constants.js      # App constants
│   └── main.js           # Application entry point
├── css/
│   └── styles.css        # Main stylesheet
└── html/
    └── newtab.html       # Main HTML page
```

### CSS Guidelines

```css
/* Use BEM methodology for class names */
.task-item {}
.task-item__title {}
.task-item__title--completed {}

/* Use meaningful custom properties */
:root {
    --primary-color: #667eea;
    --text-color: #e0e0e0;
    --background-color: #1a1a1a;
}

/* Group related properties */
.element {
    /* Display & Box Model */
    display: flex;
    width: 100%;
    padding: 16px;
    margin: 8px 0;

    /* Typography */
    font-size: 14px;
    color: var(--text-color);

    /* Visual */
    background: var(--background-color);
    border-radius: 8px;

    /* Animation */
    transition: all 0.3s ease;
}
```

### Testing Standards

#### Unit Tests

```javascript
describe('ModuleName', () => {
    let module;

    beforeEach(() => {
        module = new ModuleName();
    });

    describe('methodName', () => {
        it('should handle normal case', () => {
            const result = module.methodName('input');
            expect(result).toBe('expected');
        });

        it('should handle edge case', () => {
            const result = module.methodName(null);
            expect(result).toBeNull();
        });

        it('should throw error for invalid input', () => {
            expect(() => {
                module.methodName(invalidInput);
            }).toThrow('Expected error message');
        });
    });
});
```

#### Integration Tests

```javascript
describe('Feature Integration', () => {
    beforeEach(() => {
        // Set up test environment
        setupTestDOM();
        mockChromeAPIs();
    });

    it('should complete user workflow', async () => {
        // Test complete user scenarios
        const app = new NewTabApp();
        await app.init();

        // Simulate user actions
        await app.createTask('Test task');

        // Verify results
        expect(app.tasks).toHaveLength(1);
    });
});
```

## Architecture Guidelines

### Module Design

Each module should:
- Have a single responsibility
- Export a class with clear public interface
- Handle its own error cases
- Be testable in isolation

```javascript
class ModuleName {
    constructor(dependencies) {
        this.dependency = dependencies;
        this.state = this.initializeState();
    }

    // Public methods
    async publicMethod() {
        try {
            return await this.performOperation();
        } catch (error) {
            this.handleError(error);
            throw error;
        }
    }

    // Private methods
    handleError(error) {
        console.error(`ModuleName error:`, error);
    }
}
```

### Error Handling

```javascript
// Async functions should handle errors gracefully
async function fetchData() {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Fetch failed:', error);
        return null; // Return safe default
    }
}

// Use the safe wrapper for operations that might fail
const result = Utils.safe(() => {
    return riskyOperation();
});
```

### Performance Best Practices

```javascript
// Debounce user input
const debouncedSave = Utils.debounce(saveTasks, 300);

// Use event delegation for dynamic content
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('task-checkbox')) {
        handleTaskToggle(e.target);
    }
});

// Lazy load heavy operations
async function lazyLoadModule() {
    if (!this.heavyModule) {
        this.heavyModule = await import('./heavy-module.js');
    }
    return this.heavyModule;
}
```

## Pull Request Guidelines

### PR Checklist

Before submitting a pull request, ensure:

- [ ] Code follows style guidelines
- [ ] Tests pass (`npm test`)
- [ ] Linting passes (`npm run lint`)
- [ ] New functionality has tests
- [ ] Documentation is updated
- [ ] Chrome extension loads without errors
- [ ] Features work as expected in browser

### PR Description Template

```markdown
## Description
Brief description of changes made.

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed
- [ ] Extension tested in Chrome

## Screenshots (if applicable)
Add screenshots of UI changes.

## Related Issues
Closes #issue_number
```

## Code Review Process

### For Contributors

1. **Self-review** your code before requesting review
2. **Respond promptly** to review feedback
3. **Ask questions** if feedback is unclear
4. **Test thoroughly** after making changes

### For Reviewers

1. **Be constructive** and specific in feedback
2. **Explain reasoning** behind suggestions
3. **Approve quickly** when code meets standards
4. **Test functionality** when possible

## Release Process

### Version Numbers

We use semantic versioning (semver):
- `MAJOR.MINOR.PATCH`
- `MAJOR` - Breaking changes
- `MINOR` - New features (backward compatible)
- `PATCH` - Bug fixes (backward compatible)

### Release Checklist

1. Update version in `package.json` and `manifest.json`
2. Update `CHANGELOG.md`
3. Run full test suite
4. Create release branch
5. Merge to main after approval
6. Tag release
7. Package extension for distribution

## Getting Help

### Resources

- [Chrome Extension Documentation](https://developer.chrome.com/docs/extensions/)
- [Google Tasks API](https://developers.google.com/tasks)
- [Jest Testing Framework](https://jestjs.io/)
- [ESLint Rules](https://eslint.org/docs/rules/)

### Communication

- **Issues**: Use GitHub issues for bugs and feature requests
- **Discussions**: Use GitHub discussions for questions and ideas
- **Email**: Contact maintainers for security issues

### Common Issues

#### Extension Not Loading
1. Check `manifest.json` syntax
2. Verify file paths in HTML
3. Check console for JavaScript errors
4. Ensure all permissions are granted

#### Tests Failing
1. Run `npm install` to ensure dependencies are up to date
2. Check if new tests need Chrome API mocks
3. Verify test data matches expected format
4. Clear Chrome storage before testing

#### Build Errors
1. Run `npm run lint:fix` to auto-fix style issues
2. Check for missing dependencies
3. Verify all files are properly exported/imported
4. Ensure no syntax errors in JSON files

## Recognition

Contributors will be recognized in:
- Project README
- Release notes
- Contributor page (if applicable)

Thank you for contributing to making this extension better! 🚀