# Twitter/X API v2 Research

## Overview

This document contains research notes on the Twitter/X API v2 for the Tweet Swiper application.

## Authentication Methods

### OAuth 1.0a (Current Setup)
We have OAuth 1.0a credentials configured:
- `X_API_KEY` - Consumer API Key
- `X_KEY_SECRET` - Consumer API Secret
- `X_BEARER` - Bearer Token for app-only auth
- `X_AUTH_ACCESS` - User Access Token
- `X_AUTH_ACCESS_TOKEN_SECRET` - User Access Token Secret

This allows us to:
- Read user's tweets
- Delete tweets on behalf of the user
- Access user profile information

### OAuth 2.0 (Alternative)
For web-based login flow, OAuth 2.0 with PKCE is recommended:
- Authorization Endpoint: `https://x.com/i/oauth2/authorize`
- Token Endpoint: `https://api.x.com/2/oauth2/token`
- Required Scopes: `tweet.read`, `tweet.write`, `users.read`, `offline.access`

## Key Endpoints

### Get User's Tweets
```
GET https://api.x.com/2/users/:id/tweets
```

**Parameters:**
| Parameter | Description |
|-----------|-------------|
| `max_results` | 5-100 tweets per request (default: 10) |
| `pagination_token` | For fetching next page |
| `tweet.fields` | `created_at,public_metrics,text,author_id,entities,attachments` |
| `expansions` | `author_id,attachments.media_keys` |
| `media.fields` | `url,preview_image_url,type` |

**Example Request:**
```bash
curl "https://api.x.com/2/users/me/tweets?max_results=100&tweet.fields=created_at,public_metrics,entities,attachments&expansions=attachments.media_keys&media.fields=url,preview_image_url,type" \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

### Get Current User
```
GET https://api.x.com/2/users/me
```

Returns user ID, username, name, profile image, etc.

### Delete Tweet
```
DELETE https://api.x.com/2/tweets/:id
```

**Requirements:**
- Must use User Context authentication
- User must own the tweet
- Deletion is permanent and irreversible

**Response:**
```json
{
  "data": {
    "deleted": true
  }
}
```

## Rate Limits

| Endpoint | Limit |
|----------|-------|
| `GET /2/users/:id/tweets` | 900 requests / 15 min |
| `DELETE /2/tweets/:id` | 50 requests / 15 min |
| All write operations | 300 creates/deletes per 3 hours |

### Free Tier Limits
- 500 tweets/month readable
- 50 tweets/month writable (posts)
- No limit specified for deletes

### Rate Limit Headers
- `x-rate-limit-limit` - Total allowed in window
- `x-rate-limit-remaining` - Remaining requests
- `x-rate-limit-reset` - Unix timestamp of reset

## Tweet Object Structure

```typescript
interface Tweet {
  id: string;
  text: string;
  created_at: string; // ISO 8601
  public_metrics: {
    retweet_count: number;
    reply_count: number;
    like_count: number;
    quote_count: number;
    impression_count: number;
  };
  entities?: {
    urls?: Array<{
      start: number;
      end: number;
      url: string;
      expanded_url: string;
      display_url: string;
    }>;
    hashtags?: Array<{
      start: number;
      end: number;
      tag: string;
    }>;
    mentions?: Array<{
      start: number;
      end: number;
      username: string;
    }>;
  };
  attachments?: {
    media_keys?: string[];
  };
}

interface Media {
  media_key: string;
  type: 'photo' | 'video' | 'animated_gif';
  url?: string; // For photos
  preview_image_url?: string; // For videos/gifs
}
```

## Implementation Notes

### OAuth 1.0a Signature
For OAuth 1.0a, requests must include:
1. `oauth_consumer_key`
2. `oauth_token`
3. `oauth_signature_method` (HMAC-SHA1)
4. `oauth_timestamp`
5. `oauth_nonce`
6. `oauth_version` (1.0)
7. `oauth_signature` (computed)

Using a library like `twitter-api-v2` handles this automatically.

### Recommended Library
```bash
bun add twitter-api-v2
```

```typescript
import { TwitterApi } from 'twitter-api-v2';

const client = new TwitterApi({
  appKey: process.env.X_API_KEY!,
  appSecret: process.env.X_KEY_SECRET!,
  accessToken: process.env.X_AUTH_ACCESS!,
  accessSecret: process.env.X_AUTH_ACCESS_TOKEN_SECRET!,
});

// Get user's tweets
const tweets = await client.v2.userTimeline(userId, {
  max_results: 100,
  'tweet.fields': ['created_at', 'public_metrics', 'entities', 'attachments'],
  'expansions': ['attachments.media_keys'],
  'media.fields': ['url', 'preview_image_url', 'type'],
});

// Delete a tweet
await client.v2.deleteTweet(tweetId);
```

### Error Handling
Common errors:
- `401 Unauthorized` - Invalid/expired tokens
- `403 Forbidden` - Rate limit exceeded or missing permissions
- `404 Not Found` - Tweet doesn't exist
- `429 Too Many Requests` - Rate limited, check `Retry-After` header

## Security Considerations

1. Never expose API keys in client-side code
2. Store tokens encrypted in database
3. Validate user owns tweet before delete
4. Implement rate limit tracking to avoid suspension
5. Use HTTPS for all API calls
