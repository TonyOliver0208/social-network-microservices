# Google OAuth Implementation Guide

## Overview

This document describes the Google OAuth authentication flow implemented in the DevColl microservices backend. The system validates Google OAuth tokens from the frontend and generates internal JWT tokens for secure access to protected resources.

## Architecture Flow

```
┌─────────────┐      ┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│   Frontend  │      │ API Gateway  │      │ Auth Service │      │   Database   │
│  (NextAuth) │      │    (REST)    │      │    (gRPC)    │      │  (Postgres)  │
└──────┬──────┘      └──────┬───────┘      └──────┬───────┘      └──────┬───────┘
       │                     │                     │                     │
       │ 1. Google OAuth     │                     │                     │
       │    Sign In          │                     │                     │
       │◄────────────────────┤                     │                     │
       │                     │                     │                     │
       │ 2. POST /v1/auth/google                  │                     │
       │    { token, tokenType }                   │                     │
       ├────────────────────►│                     │                     │
       │                     │                     │                     │
       │                     │ 3. GoogleAuth RPC   │                     │
       │                     │    (validate token) │                     │
       │                     ├────────────────────►│                     │
       │                     │                     │                     │
       │                     │                     │ 4. Verify with      │
       │                     │                     │    Google OAuth2    │
       │                     │                     │    Client           │
       │                     │                     │                     │
       │                     │                     │ 5. Find/Create User │
       │                     │                     ├────────────────────►│
       │                     │                     │◄────────────────────┤
       │                     │                     │                     │
       │                     │                     │ 6. Generate Internal│
       │                     │                     │    JWT Tokens       │
       │                     │                     │                     │
       │                     │ 7. Return Tokens    │                     │
       │                     │◄────────────────────┤                     │
       │                     │                     │                     │
       │ 8. Return Response  │                     │                     │
       │    { accessToken,   │                     │                     │
       │      refreshToken } │                     │                     │
       │◄────────────────────┤                     │                     │
       │                     │                     │                     │
       │ 9. Use Internal     │                     │                     │
       │    JWT for API      │                     │                     │
       │    Calls            │                     │                     │
       ├────────────────────►│                     │                     │
```

## Implementation Details

### 1. Proto Definition (auth.proto)

The `GoogleAuth` RPC method was added to handle Google OAuth authentication:

```protobuf
service AuthService {
  rpc GoogleAuth (GoogleAuthRequest) returns (AuthResponse);
  // ... other methods
}

message GoogleAuthRequest {
  string token = 1;
  string tokenType = 2; // "id_token" or "access_token"
}

message AuthResponse {
  string accessToken = 1;
  string refreshToken = 2;
  User user = 3;
  int32 expiresIn = 4;
  int32 refreshExpiresIn = 5;
}
```

### 2. Database Schema (Prisma)

The User model was updated to support OAuth providers:

```prisma
model User {
  id            String   @id @default(uuid())
  email         String   @unique
  username      String   @unique
  password      String?  // Optional for OAuth users
  firstName     String?
  lastName      String?
  profileImage  String?
  provider      String   @default("local") // "local", "google", etc.
  providerId    String?  // OAuth provider's user ID
  isVerified    Boolean  @default(false)
  isActive      Boolean  @default(true)
  // ... other fields
  
  @@unique([provider, providerId])
  @@index([provider, providerId])
}
```

### 3. Auth Service Implementation

#### Google OAuth Validation (`auth.service.ts`)

```typescript
async googleAuth(googleAuthDto: GoogleAuthDto): Promise<ServiceResponse> {
  // 1. Verify Google token using google-auth-library
  const ticket = await this.googleClient.verifyIdToken({
    idToken: googleAuthDto.token,
    audience: this.configService.get('GOOGLE_CLIENT_ID'),
  });

  const payload = ticket.getPayload();
  
  // 2. Extract user info from Google token
  const { sub: googleUserId, email, name, picture } = payload;
  
  // 3. Find or create user in database
  let user = await this.findOrCreateGoogleUser(googleUserId, email, name, picture);
  
  // 4. Generate internal JWT tokens
  const tokens = await this.generateTokens(user.id, user.email, user.username);
  
  // 5. Return tokens and user info
  return {
    success: true,
    data: {
      user,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresIn: 900, // 15 minutes
      refreshExpiresIn: 604800, // 7 days
    }
  };
}
```

Key features:
- Validates Google ID token with `google-auth-library`
- Links Google account to existing users if email matches
- Creates new users automatically for first-time Google sign-ins
- Generates unique usernames from email
- Google users are marked as verified by default
- Updates profile information (name, picture) on each login

### 4. API Gateway Endpoint

REST endpoint at `/v1/auth/google`:

```typescript
@Post('google')
@ApiOperation({ 
  summary: 'Authenticate with Google OAuth',
  description: 'Validates Google OAuth token and returns internal JWT tokens'
})
async googleAuth(@Body() googleAuthDto: GoogleAuthDto) {
  const result = await lastValueFrom(
    this.authService.GoogleAuth(googleAuthDto)
  );
  
  return {
    success: true,
    data: {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      expiresIn: result.expiresIn,
      refreshExpiresIn: result.refreshExpiresIn,
      user: result.user,
    },
    message: 'Google authentication successful',
    timestamp: new Date().toISOString(),
  };
}
```

### 5. Frontend Integration

The frontend (NextAuth) calls the backend endpoint:

```typescript
// In auth.ts (NextAuth configuration)
async function exchangeGoogleTokens(account: any) {
  const response = await authApi.post("/google", {
    token: account.id_token,
    tokenType: "id_token"
  });

  return {
    accessToken: response.data.accessToken,
    refreshToken: response.data.refreshToken,
    accessTokenExpires: Date.now() + response.data.expiresIn * 1000,
    refreshTokenExpires: Date.now() + response.data.refreshExpiresIn * 1000,
  };
}
```

## Configuration

### Environment Variables

Add to your `.env` file:

```bash
# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d
```

### Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Configure OAuth consent screen
6. Add authorized redirect URIs for your frontend
7. Copy Client ID and Client Secret to `.env`

## Security Features

### Token Validation
- Google tokens are validated using official `google-auth-library`
- Tokens are verified against your Google Client ID
- Expired or invalid tokens are rejected

### Internal Token Generation
- Separate internal JWT tokens are generated
- Access tokens expire in 15 minutes
- Refresh tokens expire in 7 days
- Tokens include user ID, email, and username in payload

### User Verification
- Google accounts are automatically verified
- Profile information is updated on each login
- Supports linking Google accounts to existing users

### Database Security
- Unique constraint on `(provider, providerId)`
- Indexed fields for fast lookups
- Password field is optional for OAuth users
- Deactivated accounts cannot authenticate

## API Endpoints

### POST /v1/auth/google

Authenticate with Google OAuth token.

**Request:**
```json
{
  "token": "eyJhbGciOiJSUzI1NiIsImtpZCI6Ij...",
  "tokenType": "id_token"
}
```

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 900,
    "refreshExpiresIn": 604800,
    "user": {
      "id": "uuid",
      "email": "user@gmail.com",
      "username": "user_gmail",
      "firstName": "John",
      "lastName": "Doe",
      "profileImage": "https://lh3.googleusercontent.com/...",
      "provider": "google",
      "isVerified": true
    }
  },
  "message": "Google authentication successful",
  "timestamp": "2025-10-30T07:51:25.000Z"
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "Invalid or expired Google token",
  "timestamp": "2025-10-30T07:51:25.000Z"
}
```

### POST /v1/auth/refresh

Refresh access token using refresh token.

**Request:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 900,
  "refreshExpiresIn": 604800
}
```

## Testing

### Test Google OAuth Flow

1. Start the services:
```bash
npm run dev:auth
npm run dev:gateway
```

2. Test with curl:
```bash
curl -X POST http://localhost:3000/v1/auth/google \
  -H "Content-Type: application/json" \
  -d '{
    "token": "YOUR_GOOGLE_ID_TOKEN",
    "tokenType": "id_token"
  }'
```

3. Verify internal token:
```bash
curl -X GET http://localhost:3000/v1/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Troubleshooting

### Common Issues

#### 1. "GOOGLE_CLIENT_ID not configured"
- Ensure `GOOGLE_CLIENT_ID` is set in `.env`
- Restart auth-service after adding environment variables

#### 2. "Invalid Google token"
- Token might be expired (Google ID tokens expire in 1 hour)
- Ensure token is from the correct Google Client ID
- Check if token is properly formatted

#### 3. "Email not provided by Google"
- Ensure email scope is requested in frontend OAuth flow
- Check Google account has a verified email address

#### 4. Database migration errors
- Run: `npm run prisma:migrate:auth`
- Ensure database is running and accessible

## Migration Guide

### From Basic Auth to OAuth

If you have existing users, they can link their Google accounts:

1. User signs in with Google
2. System checks if email exists in database
3. If exists, links Google account to existing user
4. Updates provider fields: `provider='google'`, `providerId='google-user-id'`
5. User can now sign in with either method

### Database Migration

The migration adds the following fields:
- `firstName` (String, optional)
- `lastName` (String, optional)
- `profileImage` (String, optional)
- `provider` (String, default: "local")
- `providerId` (String, optional)

Existing users will have:
- `provider = "local"`
- `providerId = null`
- `password` remains unchanged

## Best Practices

1. **Token Security**
   - Never log Google tokens in production
   - Store internal tokens securely in HTTP-only cookies
   - Use short expiration times for access tokens

2. **Error Handling**
   - Provide clear error messages to users
   - Log detailed errors for debugging
   - Handle Google API rate limits

3. **User Experience**
   - Auto-verify email for Google users
   - Update profile picture on each login
   - Support account linking

4. **Database**
   - Index provider fields for performance
   - Use unique constraint on (provider, providerId)
   - Keep password optional for OAuth users

## Future Enhancements

- [ ] Support for GitHub OAuth
- [ ] Support for Facebook OAuth
- [ ] Multi-provider account linking UI
- [ ] OAuth token refresh from Google
- [ ] Account unlinking functionality
- [ ] Provider-specific user metadata

## References

- [Google OAuth2 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [google-auth-library NPM](https://www.npmjs.com/package/google-auth-library)
- [NextAuth.js Documentation](https://next-auth.js.org/)
- [NestJS JWT Documentation](https://docs.nestjs.com/security/authentication)

---

**Last Updated:** October 30, 2025  
**Version:** 1.0.0  
**Author:** DevColl Team
