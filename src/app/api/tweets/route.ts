import { NextRequest, NextResponse } from 'next/server';
import { getTwitterClient, Tweet, TweetsResponse, isRateLimited, handleRateLimit } from '@/lib/twitter';

// Cache user ID to avoid extra API call
let cachedUserId: string | null = null;

export async function GET(request: NextRequest) {
  // Check if rate limited
  const rateLimit = isRateLimited();
  if (rateLimit.limited) {
    return NextResponse.json(
      { 
        error: 'Rate limited by Twitter API', 
        retryAfter: rateLimit.retryAfter,
        resetAt: rateLimit.resetAt?.toISOString(),
      },
      { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfter) } }
    );
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const paginationToken = searchParams.get('pagination_token');

    const client = getTwitterClient();
    
    // Use cached user ID or fetch it
    if (!cachedUserId) {
      const me = await client.v2.me();
      cachedUserId = me.data.id;
    }

    // Fetch user's tweets - Twitter API minimum is 5
    const response = await client.v2.userTimeline(cachedUserId, {
      max_results: 5,
      ...(paginationToken && { pagination_token: paginationToken }),
      'tweet.fields': ['created_at', 'public_metrics', 'entities', 'attachments'],
      'expansions': ['attachments.media_keys'],
      'media.fields': ['url', 'preview_image_url', 'type'],
    });

    // Map the response
    const tweets: Tweet[] = response.data.data?.map((tweet) => {
      const mediaKeys = tweet.attachments?.media_keys || [];
      const media = response.includes?.media?.filter((m) =>
        mediaKeys.includes(m.media_key)
      );

      return {
        id: tweet.id,
        text: tweet.text,
        created_at: tweet.created_at || new Date().toISOString(),
        public_metrics: tweet.public_metrics,
        author_id: tweet.author_id,
        entities: tweet.entities,
        media: media?.map((m) => ({
          media_key: m.media_key,
          type: m.type as 'photo' | 'video' | 'animated_gif',
          url: m.url,
          preview_image_url: m.preview_image_url,
        })),
      };
    }) || [];

    const result: TweetsResponse = {
      tweets,
      nextToken: response.meta?.next_token,
      meta: {
        result_count: response.meta?.result_count || 0,
        next_token: response.meta?.next_token,
      },
    };

    return NextResponse.json(result);
  } catch (error) {
    handleRateLimit(error);
    console.error('Error fetching tweets:', error);
    
    // Check if it's a rate limit error
    if (String(error).includes('429')) {
      const rateLimit = isRateLimited();
      return NextResponse.json(
        { 
          error: 'Rate limited by Twitter API', 
          retryAfter: rateLimit.retryAfter,
          resetAt: rateLimit.resetAt?.toISOString(),
        },
        { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfter || 900) } }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch tweets', details: String(error) },
      { status: 500 }
    );
  }
}

// DELETE endpoint for removing a tweet
export async function DELETE(request: NextRequest) {
  try {
    const { tweetId } = await request.json();

    if (!tweetId) {
      return NextResponse.json(
        { error: 'Tweet ID is required' },
        { status: 400 }
      );
    }

    const client = getTwitterClient();
    const result = await client.v2.deleteTweet(tweetId);

    return NextResponse.json({
      deleted: result.data.deleted,
      id: tweetId,
    });
  } catch (error) {
    console.error('Error deleting tweet:', error);
    return NextResponse.json(
      { error: 'Failed to delete tweet', details: String(error) },
      { status: 500 }
    );
  }
}
