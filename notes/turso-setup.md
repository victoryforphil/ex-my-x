# Turso Database Setup

## Overview

Using Turso (libSQL) as the database with Drizzle ORM for type-safe queries.

## Installation

```bash
# Install Turso CLI
curl -sSfL https://get.tur.so/install.sh | bash

# Login
turso auth login

# Create database
turso db create tweet-swiper

# Get connection URL
turso db show tweet-swiper --url

# Create auth token
turso db tokens create tweet-swiper
```

## Environment Variables

```env
TURSO_DATABASE_URL="libsql://tweet-swiper-<username>.turso.io"
TURSO_AUTH_TOKEN="your-auth-token"
```

## Dependencies

```bash
bun add @libsql/client drizzle-orm
bun add -d drizzle-kit
```

## Schema Design

### Users Table
Stores authenticated users from X OAuth.

```typescript
export const users = sqliteTable('users', {
  id: text('id').primaryKey(), // X user ID
  username: text('username').notNull(),
  displayName: text('display_name').notNull(),
  profileImageUrl: text('profile_image_url'),
  accessToken: text('access_token'), // Encrypted
  accessTokenSecret: text('access_token_secret'), // Encrypted
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
});
```

### Tweets Table
Caches fetched tweets for faster access.

```typescript
export const tweets = sqliteTable('tweets', {
  id: text('id').primaryKey(), // X tweet ID
  userId: text('user_id').notNull().references(() => users.id),
  text: text('text').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  metrics: text('metrics', { mode: 'json' }), // JSON: likes, retweets, etc.
  media: text('media', { mode: 'json' }), // JSON: media attachments
  fetchedAt: integer('fetched_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
});
```

### Tweet Decisions Table
Tracks user decisions on each tweet.

```typescript
export const tweetDecisions = sqliteTable('tweet_decisions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().references(() => users.id),
  tweetId: text('tweet_id').notNull().references(() => tweets.id),
  decision: text('decision', { enum: ['keep', 'delete', 'skip'] }).notNull(),
  decidedAt: integer('decided_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
});
```

### API Usage Table
Tracks API calls for rate limiting.

```typescript
export const apiUsage = sqliteTable('api_usage', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().references(() => users.id),
  endpoint: text('endpoint').notNull(),
  requestCount: integer('request_count').default(0),
  windowStart: integer('window_start', { mode: 'timestamp' }).notNull(),
});
```

## Drizzle Configuration

```typescript
// drizzle.config.ts
import type { Config } from 'drizzle-kit';

export default {
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'sqlite',
  driver: 'turso',
  dbCredentials: {
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
  },
} satisfies Config;
```

## Client Setup

```typescript
// src/db/client.ts
import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import * as schema from './schema';

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export const db = drizzle(client, { schema });
```

## Migration Commands

```bash
# Generate migrations
bun drizzle-kit generate

# Push to database (dev)
bun drizzle-kit push

# View database in browser
bun drizzle-kit studio
```

## Query Examples

### Get random unreviewed tweet
```typescript
const unreviewed = await db
  .select()
  .from(tweets)
  .leftJoin(tweetDecisions, eq(tweets.id, tweetDecisions.tweetId))
  .where(
    and(
      eq(tweets.userId, userId),
      isNull(tweetDecisions.id)
    )
  )
  .orderBy(sql`RANDOM()`)
  .limit(1);
```

### Record decision
```typescript
await db.insert(tweetDecisions).values({
  userId,
  tweetId,
  decision: 'keep',
});
```

### Get stats
```typescript
const stats = await db
  .select({
    total: count(),
    kept: count(sql`CASE WHEN decision = 'keep' THEN 1 END`),
    deleted: count(sql`CASE WHEN decision = 'delete' THEN 1 END`),
  })
  .from(tweetDecisions)
  .where(eq(tweetDecisions.userId, userId));
```

## Local Development

For local development without Turso cloud:

```bash
# Create local SQLite file
touch local.db

# Use file URL
TURSO_DATABASE_URL="file:local.db"
```

Or use Turso's embedded replica:
```typescript
const client = createClient({
  url: 'file:local.db',
  syncUrl: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});
```
