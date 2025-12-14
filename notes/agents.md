# Agent Prompts for Tweet Swiper

## Continue Development

```
Continue building the Tweet Swiper app in /home/vfp/repos/vfp/ex-my-x

Completed:
- Twitter API integration (OAuth 1.0a) with GET/DELETE endpoints at /api/tweets
- Swipeable TweetCard component with drag/touch gestures
- Main page with card deck UI, auto-load, and mock fallback
- Milpunk styling based on Andreas Labs reference
- Playwright tests (10 passing) with screenshots
- Updated README.md with documentation

Twitter credentials are in .env (currently returning 403 - may need valid credentials).
Style reference is at ~/repos/andreas/landing-pages/andreas-labs/

Start the dev server with `bun dev --port 3456`
```

## Code Review

```
Review the Tweet Swiper codebase in /home/vfp/repos/vfp/ex-my-x

Key files:
- src/app/page.tsx - Main swipe interface with card deck
- src/components/TweetCard.tsx - Draggable card with swipe detection
- src/lib/twitter.ts - Twitter API client and types
- src/app/api/tweets/route.ts - API endpoints for fetching/deleting tweets
- src/app/globals.css - Milpunk design system

Check for:
1. Accessibility issues
2. Performance optimizations
3. Error handling edge cases
4. Mobile touch gesture support
```

## Add New Feature

```
Add a new feature to Tweet Swiper in /home/vfp/repos/vfp/ex-my-x

Current features:
- Swipe left to delete, swipe right to keep
- Card stack visualization
- Auto-load when queue runs low
- Mock data fallback

The codebase uses:
- Next.js 16 with app router
- Tailwind CSS v4
- twitter-api-v2 for API calls

Milpunk design principles:
- Pure black (#000000) background
- Minimal border-radius (2px)
- Monospace fonts, uppercase tracking
- Dot grid patterns
```

## Fix Bug

```
Debug an issue in Tweet Swiper at /home/vfp/repos/vfp/ex-my-x

Run tests: bunx playwright test --port 3456
View test results: bunx playwright show-report

Key components:
- TweetCard handles drag/touch with useState for position tracking
- Swipe threshold is 100px
- Animation uses CSS classes animate-swipe-left/right
```

## Twitter API Troubleshooting

```
The Twitter API is returning 403 errors. Check:

1. Environment variables in .env:
   - X_API_KEY, X_KEY_SECRET (OAuth 1.0a app credentials)
   - X_BEARER (for read-only operations)
   - X_AUTH_ACCESS, X_AUTH_ACCESS_TOKEN_SECRET (user tokens)

2. API endpoint at /api/tweets uses v2.userTimeline() which requires:
   - Read permissions on the app
   - Valid user access tokens
   - User ID from /api/user endpoint

3. The app falls back to mock data when API fails - check console for errors

Reference docs: /home/vfp/repos/vfp/ex-my-x/notes/twitter-api.md
```
