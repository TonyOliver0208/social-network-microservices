#!/bin/bash

# Load environment variables from .env file
set -a
source .env
set +a

# Check which service to run
case "$1" in
  auth)
    cd apps/auth-service && npx prisma studio
    ;;
  user)
    cd apps/user-service && npx prisma studio
    ;;
  post)
    cd apps/post-service && npx prisma studio
    ;;
  *)
    echo "Usage: ./prisma-studio.sh [auth|user|post]"
    echo "Example: ./prisma-studio.sh auth"
    exit 1
    ;;
esac
