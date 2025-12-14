'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { TweetCard } from '@/components/TweetCard';
import { Tweet, TweetsResponse } from '@/lib/twitter';

// Mock tweets for testing when API is unavailable
const MOCK_TWEETS: Tweet[] = [
  {
    id: '1234567890',
    text: 'This is a sample tweet for testing the swipe interface. The milpunk aesthetic is looking good!',
    created_at: new Date().toISOString(),
    public_metrics: {
      like_count: 42,
      retweet_count: 12,
      reply_count: 5,
      quote_count: 3,
    },
  },
  {
    id: '1234567891',
    text: 'Another test tweet. Swipe left to delete, swipe right to keep. Simple as that.',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    public_metrics: {
      like_count: 128,
      retweet_count: 45,
      reply_count: 22,
      quote_count: 8,
    },
  },
  {
    id: '1234567892',
    text: 'Testing the card stack effect. Each card should appear stacked behind the top one with a subtle offset.',
    created_at: new Date(Date.now() - 172800000).toISOString(),
    public_metrics: {
      like_count: 7,
      retweet_count: 2,
      reply_count: 1,
      quote_count: 0,
    },
  },
  {
    id: '1234567893',
    text: 'The auto-load feature should kick in when you have only 2 cards remaining. New cards will be fetched automatically.',
    created_at: new Date(Date.now() - 259200000).toISOString(),
    public_metrics: {
      like_count: 89,
      retweet_count: 34,
      reply_count: 12,
      quote_count: 4,
    },
  },
  {
    id: '1234567894',
    text: 'Last card in the initial batch. Keep swiping to see more!',
    created_at: new Date(Date.now() - 345600000).toISOString(),
    public_metrics: {
      like_count: 256,
      retweet_count: 67,
      reply_count: 31,
      quote_count: 15,
    },
  },
];

export default function Home() {
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [nextToken, setNextToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletedCount, setDeletedCount] = useState(0);
  const [keptCount, setKeptCount] = useState(0);
  const [useMock, setUseMock] = useState(false);
  const hasFetched = useRef(false);

  // Fetch tweets from API
  const fetchTweets = useCallback(async (paginationToken?: string) => {
    // Prevent duplicate initial fetch (React strict mode)
    if (!paginationToken && hasFetched.current) return;
    if (!paginationToken) hasFetched.current = true;
    
    try {
      const params = new URLSearchParams();
      if (paginationToken) {
        params.set('pagination_token', paginationToken);
      }

      const response = await fetch(`/api/tweets?${params}`);
      const data: TweetsResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch tweets');
      }

      setTweets((prev) => [...prev, ...data.tweets]);
      setNextToken(data.nextToken || null);
    } catch (err) {
      console.error('Error fetching tweets:', err);
      setError(String(err));
      // Fall back to mock data if API fails
      if (tweets.length === 0) {
        setUseMock(true);
        setTweets(MOCK_TWEETS);
      }
    } finally {
      setIsLoading(false);
    }
  }, [tweets.length]);

  // Delete tweet from Twitter
  const deleteTweet = async (tweetId: string) => {
    if (useMock) {
      return true; // Mock mode - just pretend it worked
    }

    try {
      const response = await fetch('/api/tweets', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tweetId }),
      });
      const data = await response.json();
      return data.deleted;
    } catch (err) {
      console.error('Error deleting tweet:', err);
      return false;
    }
  };

  // Initial load
  useEffect(() => {
    fetchTweets();
  }, [fetchTweets]);

  // Auto-load more tweets only when completely empty
  useEffect(() => {
    if (tweets.length === 0 && nextToken && !isLoading && (deletedCount > 0 || keptCount > 0)) {
      fetchTweets(nextToken);
    }
  }, [tweets.length, nextToken, isLoading, fetchTweets, deletedCount, keptCount]);

  // Handle swipe left (delete)
  const handleSwipeLeft = async (tweet: Tweet) => {
    // Optimistically remove from UI
    setTweets((prev) => prev.filter((t) => t.id !== tweet.id));
    setDeletedCount((prev) => prev + 1);

    // Actually delete from Twitter
    await deleteTweet(tweet.id);
  };

  // Handle swipe right (keep)
  const handleSwipeRight = (tweet: Tweet) => {
    setTweets((prev) => prev.filter((t) => t.id !== tweet.id));
    setKeptCount((prev) => prev + 1);
  };

  // Visible cards (current + next only)
  const visibleTweets = tweets.slice(0, 2);

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Grid background */}
      <div className="fixed inset-0 grid-pattern pointer-events-none" />
      
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-subtle">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 border border-border flex items-center justify-center">
                <span className="text-lg font-bold">X</span>
              </div>
              <div>
                <span className="text-sm font-bold tracking-wider uppercase">Tweet Swiper</span>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
                  {useMock ? 'MOCK_MODE' : 'LIVE_MODE'}
                </p>
              </div>
            </div>
            
            {/* Stats */}
            <div className="flex items-center gap-6 text-center">
              <div>
                <div className="text-xl font-bold font-mono text-destructive">{deletedCount}</div>
                <div className="text-[9px] text-muted-foreground uppercase tracking-widest">DELETED</div>
              </div>
              <div className="w-px h-8 bg-border" />
              <div>
                <div className="text-xl font-bold font-mono text-[#00ffaa]">{keptCount}</div>
                <div className="text-[9px] text-muted-foreground uppercase tracking-widest">KEPT</div>
              </div>
              <div className="w-px h-8 bg-border" />
              <div>
                <div className="text-xl font-bold font-mono">{tweets.length}</div>
                <div className="text-[9px] text-muted-foreground uppercase tracking-widest">QUEUE</div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="pt-24 pb-8 px-4 flex flex-col items-center justify-center min-h-screen">
        {/* Instructions */}
        <div className="text-center mb-8 animate-fade-in">
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
            Swipe left to delete / Swipe right to keep
          </p>
        </div>

        {/* Card stack container */}
        <div className="relative w-full max-w-md h-[500px] card-stack">
          {isLoading && tweets.length === 0 ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="w-12 h-12 border border-border mx-auto mb-4 flex items-center justify-center animate-pulse-slow">
                  <span className="text-xs font-mono text-muted-foreground">...</span>
                </div>
                <p className="text-sm text-muted-foreground uppercase tracking-wider">Loading tweets</p>
              </div>
            </div>
          ) : error && tweets.length === 0 ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center p-6 border border-destructive/30 bg-destructive/5">
                <p className="text-sm text-destructive uppercase tracking-wider mb-2">Error</p>
                <p className="text-xs text-muted-foreground">{error}</p>
              </div>
            </div>
          ) : tweets.length === 0 ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center p-6 border border-border bg-card">
                <div className="w-12 h-12 border border-border mx-auto mb-4 flex items-center justify-center">
                  <span className="text-lg font-bold">!</span>
                </div>
                <p className="text-sm text-foreground uppercase tracking-wider mb-2">All Done</p>
                <p className="text-xs text-muted-foreground">No more tweets to review</p>
                <div className="mt-4 pt-4 border-t border-border flex gap-4 justify-center">
                  <div className="text-center">
                    <div className="text-lg font-bold font-mono text-destructive">{deletedCount}</div>
                    <div className="text-[9px] text-muted-foreground uppercase tracking-widest">DELETED</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold font-mono text-[#00ffaa]">{keptCount}</div>
                    <div className="text-[9px] text-muted-foreground uppercase tracking-widest">KEPT</div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            visibleTweets.map((tweet, index) => (
              <TweetCard
                key={tweet.id}
                tweet={tweet}
                isTop={index === 0}
                stackIndex={index}
                onSwipeLeft={() => handleSwipeLeft(tweet)}
                onSwipeRight={() => handleSwipeRight(tweet)}
              />
            ))
          )}
        </div>

        {/* Keyboard hints */}
        <div className="mt-8 flex gap-6 text-center animate-fade-in delay-300">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 border border-border flex items-center justify-center text-xs font-mono text-muted-foreground">
              ←
            </div>
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest">Delete</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 border border-border flex items-center justify-center text-xs font-mono text-muted-foreground">
              →
            </div>
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest">Keep</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 py-4 border-t border-border glass-subtle">
        <div className="mx-auto max-w-7xl px-6 flex items-center justify-between">
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
            Tweet Swiper // Cleanup Tool
          </p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
            {isLoading && tweets.length > 0 ? 'Loading more...' : nextToken ? 'More available' : 'End of feed'}
          </p>
        </div>
      </footer>
    </div>
  );
}
