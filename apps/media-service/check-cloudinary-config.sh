#!/bin/bash

echo "🔍 Checking Cloudinary Configuration..."
echo ""

# Check if .env file exists in root
if [ -f "../../.env" ]; then
    echo "✅ Root .env file found"
    
    # Check for Cloudinary credentials
    if grep -q "CLOUDINARY_CLOUD_NAME" ../../.env; then
        CLOUD_NAME=$(grep "CLOUDINARY_CLOUD_NAME" ../../.env | cut -d '=' -f2)
        echo "✅ CLOUDINARY_CLOUD_NAME: $CLOUD_NAME"
    else
        echo "❌ CLOUDINARY_CLOUD_NAME not found"
    fi
    
    if grep -q "CLOUDINARY_API_KEY" ../../.env; then
        API_KEY=$(grep "CLOUDINARY_API_KEY" ../../.env | cut -d '=' -f2)
        echo "✅ CLOUDINARY_API_KEY: ${API_KEY:0:10}... (hidden)"
    else
        echo "❌ CLOUDINARY_API_KEY not found"
    fi
    
    if grep -q "CLOUDINARY_API_SECRET" ../../.env; then
        echo "✅ CLOUDINARY_API_SECRET: ********** (hidden)"
    else
        echo "❌ CLOUDINARY_API_SECRET not found"
    fi
else
    echo "❌ Root .env file not found"
fi

echo ""
echo "📝 Summary:"
echo "   - Cloudinary credentials should be in: ../../.env"
echo "   - Media service will read from root .env automatically"
echo "   - No need to duplicate in apps/media-service/.env"
echo ""
echo "🚀 Ready to start media service!"
