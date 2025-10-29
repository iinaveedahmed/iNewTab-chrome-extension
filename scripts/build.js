#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
const { minify } = require('terser');
const CleanCSS = require('clean-css');

const srcDir = path.join(__dirname, '../src');
const distDir = path.join(__dirname, '../dist');
const assetsDir = path.join(__dirname, '../assets');
const manifestPath = path.join(__dirname, '../manifest.json');

async function build() {
    console.log('🚀 Building distribution...');

    try {
        // Clean dist directory
        await fs.remove(distDir);
        await fs.ensureDir(distDir);

        // Copy and process HTML files
        await copyHTML();

        // Minify and copy CSS files
        await minifyCSS();

        // Minify and copy JavaScript files
        await minifyJS();

        // Copy assets
        await copyAssets();

        // Copy and update manifest
        await copyManifest();

        console.log('✅ Distribution build complete!');
        console.log(`📦 Files built to: ${distDir}`);

    } catch (error) {
        console.error('❌ Build failed:', error);
        process.exit(1);
    }
}

async function copyHTML() {
    console.log('📄 Processing HTML files...');

    const htmlSrc = path.join(srcDir, 'html');
    const htmlDist = path.join(distDir, 'src/html');

    await fs.ensureDir(htmlDist);

    // Copy HTML files and update paths for distribution
    const htmlFiles = await fs.readdir(htmlSrc);

    for (const file of htmlFiles) {
        if (file.endsWith('.html')) {
            let content = await fs.readFile(path.join(htmlSrc, file), 'utf8');

            // Update script and CSS paths for minified versions
            content = content.replace(/src="([^"]+)\.js"/g, 'src="$1.min.js"');
            content = content.replace(/href="([^"]+)\.css"/g, 'href="$1.min.css"');

            await fs.writeFile(path.join(htmlDist, file), content);
        }
    }
}

async function minifyCSS() {
    console.log('🎨 Minifying CSS files...');

    const cssSrc = path.join(srcDir, 'css');
    const cssDist = path.join(distDir, 'src/css');

    await fs.ensureDir(cssDist);

    const cssFiles = await fs.readdir(cssSrc);
    const cleanCSS = new CleanCSS({
        level: 2,
        returnPromise: true
    });

    for (const file of cssFiles) {
        if (file.endsWith('.css')) {
            const content = await fs.readFile(path.join(cssSrc, file), 'utf8');
            const minified = await cleanCSS.minify(content);

            if (minified.errors.length > 0) {
                console.warn(`CSS warnings for ${file}:`, minified.warnings);
            }

            const outputFile = file.replace('.css', '.min.css');
            await fs.writeFile(path.join(cssDist, outputFile), minified.styles);
        }
    }
}

async function minifyJS() {
    console.log('⚡ Minifying JavaScript files...');

    const jsSrc = path.join(srcDir, 'js');
    const jsDist = path.join(distDir, 'src/js');

    await fs.ensureDir(jsDist);

    // Process all JS directories
    await processJSDirectory(jsSrc, jsDist);
}

async function processJSDirectory(srcPath, distPath) {
    const items = await fs.readdir(srcPath);

    for (const item of items) {
        const itemSrcPath = path.join(srcPath, item);
        const itemDistPath = path.join(distPath, item);
        const stat = await fs.stat(itemSrcPath);

        if (stat.isDirectory()) {
            await fs.ensureDir(itemDistPath);
            await processJSDirectory(itemSrcPath, itemDistPath);
        } else if (item.endsWith('.js')) {
            const content = await fs.readFile(itemSrcPath, 'utf8');

            try {
                const minified = await minify(content, {
                    compress: {
                        drop_console: false, // Keep console logs for debugging
                        drop_debugger: true,
                        pure_funcs: ['console.debug']
                    },
                    mangle: {
                        reserved: ['chrome', 'Utils', 'Constants'] // Preserve global names
                    },
                    format: {
                        comments: false
                    }
                });

                const outputFile = item.replace('.js', '.min.js');
                await fs.writeFile(path.join(distPath, outputFile), minified.code);

            } catch (error) {
                console.warn(`Failed to minify ${item}, copying as-is:`, error.message);
                await fs.copy(itemSrcPath, itemDistPath);
            }
        }
    }
}

async function copyAssets() {
    console.log('📦 Copying assets...');

    if (await fs.pathExists(assetsDir)) {
        await fs.copy(assetsDir, path.join(distDir, 'assets'));
    }
}

async function copyManifest() {
    console.log('📋 Processing manifest...');

    const manifest = await fs.readJson(manifestPath);

    // Update paths in manifest for distribution
    if (manifest.chrome_url_overrides && manifest.chrome_url_overrides.newtab) {
        manifest.chrome_url_overrides.newtab = manifest.chrome_url_overrides.newtab
            .replace('src/html/', 'src/html/');
    }

    // Update icon paths
    if (manifest.icons) {
        Object.keys(manifest.icons).forEach(size => {
            manifest.icons[size] = manifest.icons[size];
        });
    }

    await fs.writeJson(path.join(distDir, 'manifest.json'), manifest, { spaces: 2 });
}

// Run build if called directly
if (require.main === module) {
    build();
}

module.exports = { build };