# NextAuth Integration with Auth Service

## Overview
This auth-service is designed to work with NextAuth following your exact flow:

1. **NextAuth** handles Google OAuth and receives Google tokens
2. **NextAuth** calls **auth-service** to validate Google tokens and get internal tokens
3. **Auth-service** returns internal JWT + refresh tokens
4. **NextAuth** stores internal tokens instead of Google tokens
5. **All API requests** use internal tokens for authentication

## API Endpoints

### Main Endpoint for NextAuth Integration

**POST** `/auth/validate-google-token`

**Purpose**: Validate Google tokens from NextAuth and return internal JWT tokens

**Request Body**:
```json
{
  "accessToken": "google_access_token_from_nextauth",  // Optional
  "idToken": "google_id_token_from_nextauth",          // Optional
  "googleUserId": "google_user_id"                     // Optional
}
```

**Response**:
```json
{
  "success": true,
  "accessToken": "internal_jwt_access_token",
  "refreshToken": "internal_refresh_token", 
  "expiresIn": 900,
  "tokenType": "Bearer",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "User Name",
    "picture": "https://...",
    "role": "user"
  }
}
```

### Token Refresh Endpoint

**POST** `/auth/refresh`

**Purpose**: Refresh expired access tokens using refresh token

**Request Body**:
```json
{
  "refreshToken": "internal_refresh_token"
}
```

### Token Validation Endpoint

**POST** `/auth/validate`

**Purpose**: Validate internal access tokens (for API Gateway)

**Headers**: `Authorization: Bearer <internal_access_token>`

## NextAuth Configuration Example

Here's how your NextAuth should be configured to use this auth-service:

```typescript
// pages/api/auth/[...nextauth].ts or app/api/auth/[...nextauth]/route.ts

import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'

export default NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    })
  ],
  
  callbacks: {
    async jwt({ token, account, user }) {
      // When user first signs in with Google
      if (account?.provider === 'google' && account.access_token) {
        try {
          // Call auth-service to exchange Google token for internal tokens
          const response = await fetch('http://auth-service:3001/auth/validate-google-token', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              accessToken: account.access_token,
              idToken: account.id_token,
              googleUserId: account.providerAccountId
            })
          });

          if (response.ok) {
            const authData = await response.json();
            
            // Store internal tokens in NextAuth token
            token.internalAccessToken = authData.accessToken;
            token.internalRefreshToken = authData.refreshToken;
            token.expiresAt = Date.now() + (authData.expiresIn * 1000);
            token.user = authData.user;
            
            console.log('✅ Successfully exchanged Google token for internal tokens');
          } else {
            console.error('❌ Failed to exchange Google token');
          }
        } catch (error) {
          console.error('❌ Auth service error:', error);
        }
      }

      // Check if internal token needs refresh
      if (token.expiresAt && Date.now() > token.expiresAt - 60000) { // Refresh 1 min before expiry
        try {
          const response = await fetch('http://auth-service:3001/auth/refresh', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              refreshToken: token.internalRefreshToken
            })
          });

          if (response.ok) {
            const refreshData = await response.json();
            token.internalAccessToken = refreshData.accessToken;
            token.internalRefreshToken = refreshData.refreshToken;
            token.expiresAt = Date.now() + (refreshData.expiresIn * 1000);
            
            console.log('✅ Successfully refreshed internal token');
          }
        } catch (error) {
          console.error('❌ Token refresh failed:', error);
        }
      }

      return token;
    },

    async session({ session, token }) {
      // Add internal access token to session for API requests
      session.internalAccessToken = token.internalAccessToken;
      session.user = token.user;
      return session;
    }
  }
})
```

## API Client Configuration

Configure your API client to use internal tokens:

```typescript
// lib/api.ts
import { getSession } from 'next-auth/react'

export async function apiCall(endpoint: string, options: RequestInit = {}) {
  const session = await getSession();
  
  if (!session?.internalAccessToken) {
    throw new Error('No authentication token available');
  }

  return fetch(`${process.env.API_GATEWAY_URL}${endpoint}`, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${session.internalAccessToken}`,
      'Content-Type': 'application/json',
    },
  });
}
```

## Flow Summary

1. **User clicks "Sign in with Google"** → NextAuth handles OAuth
2. **NextAuth receives Google tokens** → Calls `/auth/validate-google-token`
3. **Auth-service validates Google tokens** → Returns internal JWT tokens
4. **NextAuth stores internal tokens** → Session contains internal tokens
5. **User makes API request** → Uses internal token from session
6. **API Gateway validates internal token** → Calls `/auth/validate`
7. **Token expires** → NextAuth automatically refreshes via `/auth/refresh`

This flow ensures that:
- ✅ Google tokens never leave NextAuth
- ✅ Internal tokens are used for all API requests
- ✅ Secure token rotation and refresh
- ✅ Centralized authentication logic in auth-service