# 0001. Client-Side Only Architecture

**Date:** 2026-02-01  
**Status:** Accepted

## Context

We need to decide on the overall architecture for the Sanakoe vocabulary quiz application. The key requirements are:

- **Fast time-to-market:** MVP needs to launch quickly
- **Minimal operational costs:** No budget for backend infrastructure
- **Privacy-first:** Word lists and quiz results should be private
- **Simple deployment:** Easy to host and maintain
- **No account system:** No user authentication required for MVP
- **Target audience:** Kids (9-13 years old) who need immediate access

The application needs to:

1. Store word lists (CSV upload or manual entry)
2. Track personal best records
3. Persist quiz state during active sessions
4. Support bilingual UI (Finnish/English)

Key constraints:

- Small team with limited backend expertise
- No requirement for cross-device sync in MVP
- Data privacy is important (word lists might be personal/educational)
- Need to launch within weeks, not months

## Decision

We will implement Sanakoe as a **purely client-side application** using Next.js with static export, storing all data in the browser's localStorage.

**Architecture components:**

- **Frontend:** Next.js 14+ with App Router (static export mode)
- **State Management:** Zustand for runtime state
- **Persistence:** localStorage for data storage
- **Hosting:** Static hosting (Vercel, Netlify, GitHub Pages)
- **No backend server** - all logic runs in the browser

**Data storage:**

```
localStorage:
  - sanakoe_records: Personal best records per word list
  - sanakoe_last_list: Last used word list
  - sanakoe_manual_draft: Manual entry draft
  - sanakoe_storage_version: Schema version
```

## Consequences

### Positive

1. **Zero infrastructure costs** - Static hosting is free (Vercel/Netlify/GitHub Pages)
2. **Instant deployment** - No backend to configure or maintain
3. **Fast startup** - No API calls, no loading spinners for data fetch
4. **100% privacy** - All data stays on user's device, never sent to servers
5. **Offline-capable** - Works without internet connection (after initial load)
6. **Simple development** - No backend code, APIs, databases, or auth to implement
7. **Easy scaling** - CDN handles all traffic, no server capacity planning
8. **Quick iterations** - Deploy changes in minutes, not hours

### Negative

1. **No cross-device sync** - Records and word lists don't follow user across devices
2. **Data loss risk** - Clearing browser data loses all progress
3. **No backup** - Users can't recover data if localStorage is cleared
4. **Limited analytics** - Can't track usage patterns or engagement metrics
5. **No shared word lists** - Can't easily share word lists between users
6. **localStorage limits** - Typically 5-10MB per domain (sufficient for MVP but could be limiting)
7. **No server-side validation** - All validation must happen client-side

### Neutral

1. **Single-player only** - No multiplayer features possible (acceptable for MVP)
2. **No remote administration** - Can't push updates to user data
3. **Browser-dependent** - Behavior might vary slightly across browsers

## Alternatives Considered

### Alternative 1: Full-Stack Application (Next.js + Database)

**Description:** Traditional approach with Next.js API routes, PostgreSQL database, and user authentication.

**Why rejected:**

- Significantly longer development time (auth, API, database schema, migrations)
- Monthly hosting costs ($10-50/month for database + backend)
- Requires backend expertise and ongoing maintenance
- Overkill for MVP requirements
- Privacy concerns with storing word lists on server
- Authentication adds friction for kids

**When to reconsider:** If cross-device sync becomes critical or if we need analytics/multiplayer features.

### Alternative 2: Hybrid Approach (Client-Side + Optional Cloud Sync)

**Description:** Client-side by default, with optional account creation for cloud sync.

**Why rejected:**

- Still requires backend infrastructure for sync feature
- Increases complexity (need to handle both local and remote state)
- Adds development time for optional feature
- User confusion about two different modes
- Better to launch simple and add sync later if needed

**When to reconsider:** Post-MVP phase if users request cross-device sync.

### Alternative 3: Backend-as-a-Service (Firebase, Supabase)

**Description:** Use BaaS platform for authentication and data storage.

**Why rejected:**

- Still requires account creation (friction for kids)
- External dependency and potential costs at scale
- Privacy concerns with third-party data storage
- Unnecessary for single-device use case
- Vendor lock-in

**When to reconsider:** If we need user authentication and real-time features in future.

### Alternative 4: DIY Backend (Express + MongoDB)

**Description:** Custom backend server with Express.js and MongoDB.

**Why rejected:**

- Most complex option requiring DevOps knowledge
- Hosting costs ($15-30/month minimum)
- Security concerns (need to implement auth, encryption, etc.)
- Maintenance burden (updates, monitoring, backups)
- Significant time investment

**When to reconsider:** Never for this use case. If backend needed, would use Next.js API routes or BaaS instead.

## Implementation Notes

### localStorage Usage Patterns

```typescript
// Save records
const saveRecords = (records: Records) => {
  try {
    localStorage.setItem("sanakoe_records", JSON.stringify(records));
  } catch (e) {
    if (e.name === "QuotaExceededError") {
      // Show user-friendly error
      alert("Storage full. Please clear some data.");
    }
  }
};

// Load records with fallback
const loadRecords = (): Records => {
  try {
    const item = localStorage.getItem("sanakoe_records");
    return item ? JSON.parse(item) : {};
  } catch (e) {
    console.error("Failed to load records:", e);
    return {};
  }
};
```

### Storage Quota Management

- Typical localStorage limit: 5-10MB
- JSON stringified word list (100 words): ~10KB
- Records object: ~1KB per list
- Safe estimate: Can store 50+ word lists with records

### Data Migration Strategy

```typescript
const STORAGE_VERSION = "1.0";

const migrateStorage = () => {
  const version = localStorage.getItem("sanakoe_storage_version");

  if (!version) {
    // First time user, no migration needed
    localStorage.setItem("sanakoe_storage_version", STORAGE_VERSION);
    return;
  }

  if (version !== STORAGE_VERSION) {
    // Future: migration logic here
    // Example: v1.0 -> v1.1 might rename keys or transform data
    localStorage.setItem("sanakoe_storage_version", STORAGE_VERSION);
  }
};
```

### Static Export Configuration

```javascript
// next.config.js
module.exports = {
  output: "export", // Generate static HTML/CSS/JS
  trailingSlash: true, // For better static hosting
  images: {
    unoptimized: true, // Required for static export
  },
};
```

### Deployment

```bash
# Build static site
npm run build

# Output in /out directory
# Deploy to:
# - Vercel: automatic via Git integration
# - Netlify: drag & drop /out folder
# - GitHub Pages: copy /out to gh-pages branch
```

### Future Migration Path

If cross-device sync becomes necessary:

1. **Phase 1:** Add export/import features (download JSON, upload JSON)
2. **Phase 2:** Add optional cloud backup (user explicitly chooses to sync)
3. **Phase 3:** Implement hybrid mode (local-first, background sync)

This allows gradual migration without rewriting the entire application.

## Monitoring & Analytics

Since we have no backend, traditional analytics aren't available. Consider:

- **Privacy-respecting analytics:** Plausible or Fathom (optional, opt-in)
- **Error tracking:** Sentry for client-side errors (optional)
- **User feedback:** Simple form with formspree.io or similar

For MVP: **No analytics at all** to maximize privacy and simplicity.

## Security Considerations

### Threat Model

**Low-risk threats:**

- No authentication means no credential theft
- No server means no server-side vulnerabilities
- No API means no API abuse

**Remaining risks:**

1. **XSS attacks** - Mitigated by React's automatic escaping
2. **localStorage tampering** - Acceptable (single-player, no competitive elements)
3. **CSV injection** - Mitigated by treating all input as plain text

### Data Privacy

- All data stays local (GDPR compliant by design)
- No cookies, no tracking, no data collection
- Word lists never leave user's device
- No privacy policy needed (but recommended for transparency)

## Success Criteria

This decision is successful if:

1. ✅ Application launches within 2 weeks
2. ✅ Zero hosting costs for first 6 months
3. ✅ No data breach incidents (impossible with no server)
4. ✅ Users can complete quizzes without internet connection
5. ✅ < 3 seconds load time on average connection

## Review Trigger

Revisit this decision if:

- Users frequently request cross-device sync (>20% of feedback)
- Need to implement multiplayer features
- Need server-side analytics or A/B testing
- localStorage limits become a problem (>5% of users)

## References

- [Next.js Static Exports](https://nextjs.org/docs/app/building-your-application/deploying/static-exports)
- [localStorage MDN Documentation](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)
- [JAMstack Architecture](https://jamstack.org/)
- [Local-First Software](https://www.inkandswitch.com/local-first/)
