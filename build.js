#!/usr/bin/env node

// Build script for Financial Advisor Dashboard
// This script prepares the files for deployment

const fs = require('fs');
const path = require('path');

console.log('🚀 Building Financial Advisor Dashboard...');

// Ensure public directory exists
const publicDir = path.join(__dirname, 'public');
if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
    console.log('✅ Created public directory');
}

// Files to copy to public directory
const filesToCopy = [
    'index.html',
    'styles.css', 
    'script.js',
    'aws-config.js',
    'cognito-auth.js'
];

// Copy files
filesToCopy.forEach(file => {
    const sourcePath = path.join(__dirname, file);
    const destPath = path.join(publicDir, file);
    
    if (fs.existsSync(sourcePath)) {
        fs.copyFileSync(sourcePath, destPath);
        console.log(`✅ Copied ${file} to public directory`);
    } else {
        console.warn(`⚠️  File ${file} not found`);
    }
});

console.log('✅ Build completed successfully!');
console.log('📁 Public directory ready for deployment');
console.log('🌐 Files in public directory:');
console.log(fs.readdirSync(publicDir).map(file => `   - ${file}`).join('\n'));
