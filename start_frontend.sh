#!/bin/bash
# Start script for the React Native frontend

echo "Risk Control Frontend - Starting..."
echo "==================================="

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Start Metro bundler
echo "Starting Metro bundler..."
echo "Frontend will be available for Android/iOS development"
echo ""
echo "To run on Android: npm run android"
echo "To run on iOS: npm run ios"
echo "Press Ctrl+C to stop Metro"
echo ""

npm start