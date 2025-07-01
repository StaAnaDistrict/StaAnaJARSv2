#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🏺 Sta. Ana JARS Server Setup');
console.log('==============================\n');

// Check if config.env exists
if (!fs.existsSync('./config.env')) {
  console.error('❌ config.env file not found!');
  console.log('Please create a config.env file with your database credentials.');
  process.exit(1);
}

// Check if package.json exists
if (!fs.existsSync('./package.json')) {
  console.error('❌ package.json not found!');
  console.log('Please run: npm init -y');
  process.exit(1);
}

// Check if node_modules exists
if (!fs.existsSync('./node_modules')) {
  console.log('📦 Installing dependencies...');
  const { execSync } = require('child_process');
  try {
    execSync('npm install', { stdio: 'inherit' });
    console.log('✅ Dependencies installed successfully!\n');
  } catch (error) {
    console.error('❌ Failed to install dependencies');
    process.exit(1);
  }
}

// Check config.env for placeholder values
const configContent = fs.readFileSync('./config.env', 'utf8');
const hasPlaceholders = configContent.includes('your-') || configContent.includes('placeholder');

if (hasPlaceholders) {
  console.log('⚠️  WARNING: You need to update your database credentials in config.env');
  console.log('Please edit config.env and replace the placeholder values with your actual Filess.io credentials.\n');
}

console.log('🚀 Starting server...');
console.log('📖 For setup instructions, see: SETUP_GUIDE.md\n');

// Start the server
require('./server.js'); 