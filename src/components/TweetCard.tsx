'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Tweet } from '@/lib/twitter';

interface TweetCardProps {
  tweet: Tweet;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  isTop: boolean;
  stackIndex: number;
}

export function TweetCard({ tweet, onSwipeLeft, onSwipeRight, isTop, stackIndex }: TweetCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);

  const rotation = position.x * 0.05;
  const swipeThreshold = 100;

  // Format date
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isTop || isAnimatingOut) return;
    setIsDragging(true);
    setStartPos({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !isTop) return;
    const newX = e.clientX - startPos.x;
    const newY = e.clientY - startPos.y;
    setPosition({ x: newX, y: newY });
    
    if (newX > swipeThreshold) {
      setSwipeDirection('right');
    } else if (newX < -swipeThreshold) {
      setSwipeDirection('left');
    } else {
      setSwipeDirection(null);
    }
  }, [isDragging, isTop, startPos, swipeThreshold]);

  const handleMouseUp = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);

    if (position.x > swipeThreshold) {
      // Swipe right - keep
      setIsAnimatingOut(true);
      setTimeout(() => {
        onSwipeRight();
      }, 300);
    } else if (position.x < -swipeThreshold) {
      // Swipe left - delete
      setIsAnimatingOut(true);
      setTimeout(() => {
        onSwipeLeft();
      }, 300);
    } else {
      // Snap back
      setPosition({ x: 0, y: 0 });
      setSwipeDirection(null);
    }
  }, [isDragging, position.x, swipeThreshold, onSwipeLeft, onSwipeRight]);

  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isTop || isAnimatingOut) return;
    const touch = e.touches[0];
    setIsDragging(true);
    setStartPos({ x: touch.clientX - position.x, y: touch.clientY - position.y });
  };

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isDragging || !isTop) return;
    const touch = e.touches[0];
    const newX = touch.clientX - startPos.x;
    const newY = touch.clientY - startPos.y;
    setPosition({ x: newX, y: newY });
    
    if (newX > swipeThreshold) {
      setSwipeDirection('right');
    } else if (newX < -swipeThreshold) {
      setSwipeDirection('left');
    } else {
      setSwipeDirection(null);
    }
  }, [isDragging, isTop, startPos, swipeThreshold]);

  const handleTouchEnd = useCallback(() => {
    handleMouseUp();
  }, [handleMouseUp]);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleTouchEnd);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

  // Button handlers for keyboard/accessibility
  const handleKeep = () => {
    if (isAnimatingOut) return;
    setPosition({ x: 300, y: 0 });
    setSwipeDirection('right');
    setIsAnimatingOut(true);
    setTimeout(() => {
      onSwipeRight();
    }, 300);
  };

  const handleDelete = () => {
    if (isAnimatingOut) return;
    setPosition({ x: -300, y: 0 });
    setSwipeDirection('left');
    setIsAnimatingOut(true);
    setTimeout(() => {
      onSwipeLeft();
    }, 300);
  };

  // Calculate stack offset
  const stackOffset = stackIndex * 8;
  const stackScale = 1 - stackIndex * 0.05;
  const stackOpacity = 1 - stackIndex * 0.2;

  return (
    <div
      ref={cardRef}
      className={`absolute w-full transition-transform ${isTop ? 'cursor-grab active:cursor-grabbing' : 'pointer-events-none'} ${isAnimatingOut ? (swipeDirection === 'right' ? 'animate-swipe-right' : 'animate-swipe-left') : ''}`}
      style={{
        transform: isTop
          ? `translate(${position.x}px, ${position.y}px) rotate(${rotation}deg)`
          : `translateY(${stackOffset}px) scale(${stackScale})`,
        opacity: isTop ? 1 : stackOpacity,
        zIndex: 10 - stackIndex,
        transition: isDragging ? 'none' : 'transform 0.3s ease, opacity 0.3s ease',
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      {/* Swipe indicators */}
      {isTop && swipeDirection === 'right' && (
        <div className="absolute inset-0 swipe-indicator-keep rounded-sm pointer-events-none z-10" />
      )}
      {isTop && swipeDirection === 'left' && (
        <div className="absolute inset-0 swipe-indicator-delete rounded-sm pointer-events-none z-10" />
      )}

      {/* Card content */}
      <div className="bg-card border border-border p-6 relative overflow-hidden">
        {/* Grid pattern background */}
        <div className="absolute inset-0 dot-grid opacity-30 pointer-events-none" />
        
        {/* Header */}
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 border border-border flex items-center justify-center bg-muted">
                <span className="text-[10px] font-mono text-muted-foreground uppercase">TWIT</span>
              </div>
              <div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-widest">TWEET_ID</div>
                <div className="font-mono text-xs text-foreground/70">{tweet.id.slice(-8)}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-muted-foreground uppercase tracking-widest">CREATED</div>
              <div className="font-mono text-xs text-foreground/70">{formatDate(tweet.created_at)}</div>
            </div>
          </div>

          {/* Tweet text */}
          <div className="mb-6">
            <div className="text-[10px] text-muted-foreground uppercase tracking-widest mb-2">CONTENT</div>
            <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap break-words">
              {tweet.text}
            </p>
          </div>

          {/* Media preview */}
          {tweet.media && tweet.media.length > 0 && (
            <div className="mb-6">
              <div className="text-[10px] text-muted-foreground uppercase tracking-widest mb-2">MEDIA</div>
              <div className="flex gap-2 overflow-x-auto">
                {tweet.media.map((m) => (
                  <div key={m.media_key} className="w-16 h-16 bg-muted border border-border flex-shrink-0 flex items-center justify-center">
                    <span className="text-[8px] font-mono text-muted-foreground uppercase">{m.type}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Metrics */}
          {tweet.public_metrics && (
            <div className="grid grid-cols-4 gap-2 mb-6 pt-4 border-t border-border">
              <div className="text-center">
                <div className="text-lg font-bold font-mono">{tweet.public_metrics.like_count}</div>
                <div className="text-[9px] text-muted-foreground uppercase tracking-widest">LIKES</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold font-mono">{tweet.public_metrics.retweet_count}</div>
                <div className="text-[9px] text-muted-foreground uppercase tracking-widest">RTS</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold font-mono">{tweet.public_metrics.reply_count}</div>
                <div className="text-[9px] text-muted-foreground uppercase tracking-widest">REPLIES</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold font-mono">{tweet.public_metrics.quote_count}</div>
                <div className="text-[9px] text-muted-foreground uppercase tracking-widest">QUOTES</div>
              </div>
            </div>
          )}

          {/* Action buttons - only show on top card */}
          {isTop && (
            <div className="flex gap-4">
              <button
                onClick={(e) => { e.stopPropagation(); handleDelete(); }}
                className="flex-1 py-3 bg-destructive/10 border border-destructive/30 text-destructive hover:bg-destructive/20 transition-colors uppercase tracking-wider text-xs font-medium"
              >
                DELETE
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleKeep(); }}
                className="flex-1 py-3 bg-[#00ffaa]/10 border border-[#00ffaa]/30 text-[#00ffaa] hover:bg-[#00ffaa]/20 transition-colors uppercase tracking-wider text-xs font-medium"
              >
                KEEP
              </button>
            </div>
          )}
        </div>

        {/* Corner markers */}
        <div className="absolute top-0 left-0 w-3 h-3 border-l border-t border-border/50" />
        <div className="absolute top-0 right-0 w-3 h-3 border-r border-t border-border/50" />
        <div className="absolute bottom-0 left-0 w-3 h-3 border-l border-b border-border/50" />
        <div className="absolute bottom-0 right-0 w-3 h-3 border-r border-b border-border/50" />
      </div>
    </div>
  );
}
