#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
const archiver = require('archiver');

const distDir = path.join(__dirname, '../dist');
const packageDir = path.join(__dirname, '../packages');

async function packageExtension() {
    console.log('📦 Packaging extension for distribution...');

    try {
        // Ensure package directory exists
        await fs.ensureDir(packageDir);

        // Read version from manifest
        const manifestPath = path.join(distDir, 'manifest.json');
        const manifest = await fs.readJson(manifestPath);
        const version = manifest.version;

        // Create ZIP file
        const zipName = `custom-new-tab-extension-v${version}.zip`;
        const zipPath = path.join(packageDir, zipName);

        await createZip(distDir, zipPath);

        console.log('✅ Package created successfully!');
        console.log(`📦 Package: ${zipPath}`);
        console.log(`🏪 Ready for Chrome Web Store upload`);

        // Create development package (includes source maps and non-minified files)
        const devZipName = `custom-new-tab-extension-v${version}-dev.zip`;
        const devZipPath = path.join(packageDir, devZipName);

        await createZip(__dirname + '/..', devZipPath, [
            'node_modules',
            'tests',
            'scripts',
            'packages',
            '.git',
            '.github',
            '.claude',
            'package-lock.json',
            'dist'
        ]);

        console.log(`📦 Development package: ${devZipPath}`);

    } catch (error) {
        console.error('❌ Packaging failed:', error);
        process.exit(1);
    }
}

function createZip(sourceDir, outputPath, excludeDirs = []) {
    return new Promise((resolve, reject) => {
        const output = fs.createWriteStream(outputPath);
        const archive = archiver('zip', {
            zlib: { level: 9 } // Maximum compression
        });

        output.on('close', () => {
            const sizeKB = (archive.pointer() / 1024).toFixed(2);
            console.log(`📊 Archive size: ${sizeKB} KB`);
            resolve();
        });

        archive.on('error', reject);
        archive.pipe(output);

        // Add files to archive
        archive.glob('**/*', {
            cwd: sourceDir,
            ignore: excludeDirs.map(dir => `${dir}/**`),
            dot: false
        });

        archive.finalize();
    });
}

// Show package contents for verification
async function showPackageContents() {
    const manifestPath = path.join(distDir, 'manifest.json');
    if (!await fs.pathExists(manifestPath)) {
        console.log('❌ No dist build found. Run "npm run build:dist" first.');
        return;
    }

    console.log('\n📋 Package contents:');
    await listDirectory(distDir, '');
}

async function listDirectory(dir, prefix) {
    const items = await fs.readdir(dir);

    for (const item of items) {
        const itemPath = path.join(dir, item);
        const stat = await fs.stat(itemPath);

        if (stat.isDirectory()) {
            console.log(`${prefix}📁 ${item}/`);
            await listDirectory(itemPath, prefix + '  ');
        } else {
            const sizeKB = (stat.size / 1024).toFixed(1);
            console.log(`${prefix}📄 ${item} (${sizeKB} KB)`);
        }
    }
}

// Command line interface
if (require.main === module) {
    const command = process.argv[2];

    if (command === 'list') {
        showPackageContents();
    } else {
        packageExtension();
    }
}

module.exports = { packageExtension, showPackageContents };