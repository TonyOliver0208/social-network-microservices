#!/bin/bash

# Cloudinary Configuration Test Script
# This script helps verify your Cloudinary credentials

echo "🔍 Cloudinary Configuration Checker"
echo "===================================="
echo ""

# Read credentials from .env file
source .env 2>/dev/null || {
    echo "❌ Error: .env file not found!"
    echo "Please create a .env file with your Cloudinary credentials"
    exit 1
}

echo "📋 Current Configuration:"
echo "  Cloud Name: $CLOUDINARY_CLOUD_NAME"
echo "  API Key: $CLOUDINARY_API_KEY"
echo "  API Secret: ${CLOUDINARY_API_SECRET:0:5}***"
echo ""

# Test Cloudinary connection
echo "🧪 Testing Cloudinary Connection..."
echo ""

response=$(curl -s -w "\n%{http_code}" -X GET \
  "https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/resources/image" \
  -u "${CLOUDINARY_API_KEY}:${CLOUDINARY_API_SECRET}")

http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | head -n-1)

if [ "$http_code" -eq 200 ]; then
    echo "✅ SUCCESS! Cloudinary credentials are valid!"
    echo ""
    echo "Your media service should work now."
    echo "If it's still not working, restart the services:"
    echo "  npm run dev:all"
elif [ "$http_code" -eq 401 ]; then
    echo "❌ AUTHENTICATION FAILED!"
    echo ""
    echo "Error Details:"
    echo "$body" | jq '.' 2>/dev/null || echo "$body"
    echo ""
    echo "📝 Please update your .env file with correct credentials:"
    echo ""
    echo "1. Go to: https://console.cloudinary.com/"
    echo "2. Sign up or log in"
    echo "3. Go to Dashboard"
    echo "4. Copy your credentials:"
    echo "   - Cloud Name"
    echo "   - API Key"
    echo "   - API Secret"
    echo ""
    echo "5. Update .env file:"
    echo "   CLOUDINARY_CLOUD_NAME=your_actual_cloud_name"
    echo "   CLOUDINARY_API_KEY=your_actual_api_key"
    echo "   CLOUDINARY_API_SECRET=your_actual_api_secret"
else
    echo "⚠️  Unexpected response (HTTP $http_code)"
    echo "$body"
fi

echo ""
echo "===================================="
