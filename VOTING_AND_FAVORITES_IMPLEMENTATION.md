# Question Voting and Favorite Implementation

## Overview
This document summarizes the implementation of question voting (upvote/downvote) and favorite features for the DevColl Q&A platform.

## Backend Changes

### 1. Database Schema (Prisma)
**File:** `apps/post-service/prisma/schema.prisma`

Added two new models:

#### QuestionVote Model
- Stores user votes (UP/DOWN) on questions
- Each user can vote only once per question
- Voting the same type again toggles it off
- Voting a different type changes the vote

```prisma
model QuestionVote {
  id         String   @id @default(uuid())
  postId     String
  userId     String
  voteType   VoteType // UP or DOWN
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
  post Post @relation(fields: [postId], references: [id], onDelete: Cascade)
  @@unique([postId, userId])
}

enum VoteType {
  UP
  DOWN
}
```

#### FavoriteQuestion Model
- Stores user favorites with optional list organization
- Each user can favorite a question once
- Supports multiple lists (e.g., "For later", "Important", custom lists)

```prisma
model FavoriteQuestion {
  id        String   @id @default(uuid())
  postId    String
  userId    String
  listName  String?  @default("default")
  createdAt DateTime @default(now())
  post Post @relation(fields: [postId], references: [id], onDelete: Cascade)
  @@unique([postId, userId])
}
```

### 2. gRPC Proto Definitions
**File:** `proto/post.proto`

Added new RPC methods:

```protobuf
// Question voting operations
rpc VoteQuestion (VoteQuestionRequest) returns (VoteQuestionResponse);
rpc GetQuestionVotes (GetQuestionVotesRequest) returns (QuestionVotesResponse);

// Favorite operations
rpc FavoriteQuestion (FavoriteQuestionRequest) returns (FavoriteQuestionResponse);
rpc UnfavoriteQuestion (UnfavoriteQuestionRequest) returns (FavoriteQuestionResponse);
rpc GetUserFavorites (GetUserFavoritesRequest) returns (FavoriteQuestionsListResponse);
```

Updated PostResponse to include vote and favorite data:
- `upvotes`: Number of upvotes
- `downvotes`: Number of downvotes
- `totalVotes`: Net votes (upvotes - downvotes)
- `userVote`: Current user's vote ("up", "down", or null)
- `isFavorited`: Whether current user favorited this question

### 3. Post Service Implementation
**File:** `apps/post-service/src/post/post.service.ts`

#### Vote Methods

**`voteQuestion(questionId, userId, voteType)`**
- Toggles vote if user votes the same type again
- Changes vote if user votes different type
- Returns updated vote counts and user's vote status
- Clears cache after vote change

**`getQuestionVotes(questionId, userId?)`**
- Returns upvote/downvote counts
- Returns user's current vote if userId provided
- Calculates total votes (upvotes - downvotes)

#### Favorite Methods

**`favoriteQuestion(questionId, userId, listName?)`**
- Toggles favorite status
- Supports custom list names
- Returns whether question is now favorited
- Clears cache after change

**`unfavoriteQuestion(questionId, userId)`**
- Removes favorite
- Returns success status

**`getUserFavorites(userId, listName?, page, limit)`**
- Returns paginated list of user's favorites
- Optionally filter by list name
- Includes full question data with each favorite

#### Updated formatPostResponse
- Now includes vote counts (upvotes, downvotes, totalVotes)
- Includes user's vote status if userId provided
- Includes favorite status if userId provided

### 4. Post Controller
**File:** `apps/post-service/src/post/post.controller.ts`

Added gRPC handlers for all vote and favorite methods.

### 5. API Gateway REST Endpoints
**File:** `apps/api-gateway/src/post/post.controller.ts`

Added REST endpoints:

#### Voting Endpoints
- `POST /posts/:id/vote` - Vote on question (requires auth)
  - Body: `{ voteType: 'up' | 'down' }`
  - Returns: Vote counts and user's vote status
  
- `GET /posts/:id/votes` - Get vote counts
  - Returns: Vote statistics and user's vote if authenticated

#### Favorite Endpoints
- `POST /posts/:id/favorite` - Toggle favorite (requires auth)
  - Body: `{ listName?: string }`
  - Returns: Success status and isFavorited boolean
  
- `DELETE /posts/:id/favorite` - Remove favorite (requires auth)
  - Returns: Success status
  
- `GET /posts/favorites` - Get user's favorites (requires auth)
  - Query params: `listName?`, `page?`, `limit?`
  - Returns: Paginated list of favorites with question data

## Frontend Changes

### 1. API Client
**File:** `src/services/questions.api.ts`

Created new API client with methods:
- `voteQuestion(questionId, voteType)` - Vote on question
- `getQuestionVotes(questionId)` - Get vote statistics
- `favoriteQuestion(questionId, listName?)` - Toggle favorite
- `unfavoriteQuestion(questionId)` - Remove favorite
- `getUserFavorites(params)` - Get user's favorite questions

### 2. Question Detail Component
**File:** `src/components/questions/QuestionDetail.tsx`

Updated `handleQuestionVote` to:
- Call the backend API
- Handle authentication
- Show vote results
- Refresh page to show updated counts (can be improved with optimistic updates)

### 3. Vote Controls Component
**File:** `src/components/questions/VoteControls.tsx`

Updated `handleBookmarkClick` to:
- Check authentication
- Call backend favorite API
- Update local storage for consistency
- Show success/error notifications
- Handle errors gracefully

## Features

### Voting System
1. **Toggle Behavior**: Clicking the same vote button removes the vote
2. **Switch Votes**: Clicking the opposite button changes the vote
3. **Vote Counts**: Display upvotes, downvotes, and net score
4. **User State**: Show which way the user voted (highlighted button)
5. **Authentication Required**: Only authenticated users can vote

### Favorite System
1. **Toggle Behavior**: Clicking bookmark toggles favorite on/off
2. **List Organization**: Support for multiple favorite lists
3. **Default List**: "For later" as default list name
4. **User-Specific**: Each user has their own favorites
5. **Authentication Required**: Only authenticated users can favorite
6. **Profile Integration**: Favorites accessible from profile page

## Data Flow

### Voting Flow
```
1. User clicks vote button (up/down)
2. Frontend calls POST /posts/:id/vote
3. API Gateway forwards to PostService.VoteQuestion
4. Post Service checks existing vote:
   - Same type: Delete vote (toggle off)
   - Different type: Update vote
   - No vote: Create new vote
5. Return updated vote counts + user's vote status
6. Frontend updates UI
```

### Favorite Flow
```
1. User clicks bookmark icon
2. Frontend calls POST /posts/:id/favorite
3. API Gateway forwards to PostService.FavoriteQuestion
4. Post Service checks existing favorite:
   - Exists: Delete (unfavorite)
   - Doesn't exist: Create (favorite)
5. Return success status + isFavorited boolean
6. Frontend updates UI and local storage
```

## Database Migration

Migration file created: `20251111092030_add_question_votes_and_favorites`

Tables created:
- `question_votes` - Stores all user votes
- `favorite_questions` - Stores all favorites

Indexes created for performance:
- `postId` - Fast lookup of votes/favorites for a question
- `userId` - Fast lookup of user's votes/favorites
- `userId + listName` - Fast lookup of user's favorites by list

## Future Improvements

1. **Optimistic UI Updates**: Update frontend immediately without page reload
2. **Real-time Vote Counts**: WebSocket updates for live vote count changes
3. **Vote Analytics**: Track vote trends over time
4. **Favorite Lists Management**: UI for creating/managing custom lists
5. **Favorite Lists in Sidebar**: Show custom lists in profile sidebar
6. **Bulk Operations**: Ability to move favorites between lists
7. **Share Favorite Lists**: Public/private favorite list sharing
8. **Vote Notifications**: Notify question authors of votes
9. **Rate Limiting**: Prevent vote spam
10. **Vote History**: Track vote changes for moderation

## Testing Checklist

### Backend
- [x] Database migration successful
- [ ] Vote creation works
- [ ] Vote toggle works (same type removes vote)
- [ ] Vote switch works (different type changes vote)
- [ ] Vote counts calculated correctly
- [ ] Favorite creation works
- [ ] Favorite toggle works
- [ ] User favorites retrieval works
- [ ] Authentication required for protected endpoints
- [ ] Cache invalidation works

### Frontend
- [ ] Vote buttons work when authenticated
- [ ] Vote buttons show login prompt when not authenticated
- [ ] Vote counts display correctly
- [ ] User's vote status highlighted correctly
- [ ] Bookmark button works when authenticated
- [ ] Bookmark button shows login prompt when not authenticated
- [ ] Bookmark status displays correctly
- [ ] Favorites appear in profile page
- [ ] Error handling works

## API Reference

### Vote Question
```http
POST /posts/:id/vote
Authorization: Bearer <token>
Content-Type: application/json

{
  "voteType": "up" | "down"
}

Response:
{
  "success": true,
  "upvotes": 10,
  "downvotes": 2,
  "totalVotes": 8,
  "userVote": "up"
}
```

### Get Question Votes
```http
GET /posts/:id/votes
Authorization: Bearer <token> (optional)

Response:
{
  "success": true,
  "upvotes": 10,
  "downvotes": 2,
  "totalVotes": 8,
  "userVote": "up" // only if authenticated
}
```

### Favorite Question
```http
POST /posts/:id/favorite
Authorization: Bearer <token>
Content-Type: application/json

{
  "listName": "For later" // optional
}

Response:
{
  "success": true,
  "isFavorited": true
}
```

### Get User Favorites
```http
GET /posts/favorites?listName=default&page=1&limit=20
Authorization: Bearer <token>

Response:
{
  "favorites": [
    {
      "id": "fav-uuid",
      "questionId": "post-uuid",
      "listName": "For later",
      "createdAt": "2025-11-11T09:20:30Z",
      "question": { /* full question object */ }
    }
  ],
  "total": 15,
  "page": 1,
  "limit": 20
}
```

## Notes

- All vote and favorite operations require authentication
- Votes and favorites are tied to user accounts
- Database ensures one vote and one favorite per user per question
- Cache is cleared after vote/favorite changes to ensure fresh data
- Frontend uses both backend API and local storage for optimal UX
- List names are case-sensitive and support custom names
- Default list name is "default" if not specified
