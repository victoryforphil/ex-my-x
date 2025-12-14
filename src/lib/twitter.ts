import { TwitterApi, ApiResponseError } from 'twitter-api-v2';

// Create authenticated Twitter client using OAuth 1.0a
export function getTwitterClient() {
  return new TwitterApi({
    appKey: process.env.X_API_KEY!,
    appSecret: process.env.X_KEY_SECRET!,
    accessToken: process.env.X_AUTH_ACCESS!,
    accessSecret: process.env.X_AUTH_ACCESS_TOKEN_SECRET!,
  });
}

// Rate limit info storage
let rateLimitReset: number | null = null;

export function isRateLimited(): { limited: boolean; resetAt?: Date; retryAfter?: number } {
  if (rateLimitReset && Date.now() < rateLimitReset) {
    return {
      limited: true,
      resetAt: new Date(rateLimitReset),
      retryAfter: Math.ceil((rateLimitReset - Date.now()) / 1000),
    };
  }
  return { limited: false };
}

export function handleRateLimit(error: unknown): void {
  if (error instanceof ApiResponseError && error.code === 429) {
    // Parse reset time from headers or default to 15 minutes
    const resetHeader = error.rateLimit?.reset;
    if (resetHeader) {
      rateLimitReset = resetHeader * 1000; // Convert to ms
    } else {
      rateLimitReset = Date.now() + 15 * 60 * 1000; // 15 min default
    }
  }
}

export function clearRateLimit(): void {
  rateLimitReset = null;
}

export interface Tweet {
  id: string;
  text: string;
  created_at: string;
  public_metrics?: {
    retweet_count: number;
    reply_count: number;
    like_count: number;
    quote_count: number;
    impression_count?: number;
  };
  author_id?: string;
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
  media?: Array<{
    media_key: string;
    type: 'photo' | 'video' | 'animated_gif';
    url?: string;
    preview_image_url?: string;
  }>;
}

export interface TweetsResponse {
  tweets: Tweet[];
  nextToken?: string;
  meta?: {
    result_count: number;
    next_token?: string;
  };
  error?: string;
}
