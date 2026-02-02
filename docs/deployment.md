# Deployment Guide

This guide covers deploying Sanakoe to various hosting platforms.

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Vercel (Recommended)](#vercel-recommended)
- [Netlify](#netlify)
- [Static Export](#static-export)
- [Docker](#docker)
- [Environment Variables](#environment-variables)
- [Post-Deployment Checklist](#post-deployment-checklist)

---

## Prerequisites

Before deploying, ensure:

1. All tests pass: `npm test && npm run test:e2e`
2. Build succeeds locally: `npm run build`
3. No TypeScript errors: `npm run type-check`
4. No lint errors: `npm run lint`

---

## Vercel (Recommended)

Vercel is the recommended platform as it's optimized for Next.js applications.

### One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/sanakoe)

### Manual Setup

1. **Install Vercel CLI:**

   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel:**

   ```bash
   vercel login
   ```

3. **Deploy:**

   ```bash
   # Preview deployment
   vercel

   # Production deployment
   vercel --prod
   ```

### Via GitHub Integration

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Vercel auto-detects Next.js settings
5. Click "Deploy"

### Vercel Configuration

Create `vercel.json` in the project root (optional):

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "regions": ["arn1"],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        }
      ]
    }
  ]
}
```

---

## Netlify

### Via Netlify UI

1. Go to [netlify.com](https://netlify.com)
2. Click "Add new site" → "Import an existing project"
3. Connect your GitHub repository
4. Configure build settings:
   - **Build command:** `npm run build`
   - **Publish directory:** `.next`
5. Click "Deploy site"

### Via Netlify CLI

1. **Install Netlify CLI:**

   ```bash
   npm i -g netlify-cli
   ```

2. **Login:**

   ```bash
   netlify login
   ```

3. **Initialize and Deploy:**
   ```bash
   netlify init
   netlify deploy --prod
   ```

### Netlify Configuration

Create `netlify.toml` in the project root:

```toml
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"

[[redirects]]
  from = "/"
  to = "/fi"
  status = 302
  force = false
```

Install the Next.js plugin:

```bash
npm install -D @netlify/plugin-nextjs
```

---

## Static Export

For hosting on static file servers (GitHub Pages, S3, etc.):

### Configure Next.js for Static Export

Update `next.config.js`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
```

### Build Static Files

```bash
npm run build
```

The static files will be in the `out/` directory.

### Deploy to GitHub Pages

1. **Add GitHub Actions workflow** (`.github/workflows/deploy.yml`):

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./out
```

2. Enable GitHub Pages in repository settings (Source: `gh-pages` branch)

---

## Docker

### Dockerfile

Create `Dockerfile` in the project root:

```dockerfile
# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
```

### Build and Run

```bash
# Build image
docker build -t sanakoe .

# Run container
docker run -p 3000:3000 sanakoe
```

### Docker Compose

Create `docker-compose.yml`:

```yaml
version: "3.8"

services:
  sanakoe:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    restart: unless-stopped
```

Run with:

```bash
docker-compose up -d
```

---

## Environment Variables

Sanakoe is a client-side only application and doesn't require environment variables for basic operation.

### Optional Variables

| Variable                     | Description         | Default |
| ---------------------------- | ------------------- | ------- |
| `NEXT_PUBLIC_DEFAULT_LOCALE` | Default UI language | `fi`    |
| `NEXT_PUBLIC_SITE_URL`       | Canonical site URL  | -       |

### Setting Environment Variables

**Vercel:**

- Project Settings → Environment Variables

**Netlify:**

- Site Settings → Build & Deploy → Environment

**Docker:**

```bash
docker run -e NEXT_PUBLIC_DEFAULT_LOCALE=en -p 3000:3000 sanakoe
```

---

## Post-Deployment Checklist

After deploying, verify:

- [ ] Home page loads at `/` and redirects to `/fi`
- [ ] English locale works at `/en`
- [ ] Finnish locale works at `/fi`
- [ ] CSV upload functions correctly
- [ ] Manual entry table works
- [ ] Quiz flow completes successfully
- [ ] Results page displays correctly
- [ ] Language switching works
- [ ] Word list overlay opens
- [ ] localStorage persists data
- [ ] No console errors in browser
- [ ] Mobile/tablet responsive layout works

### Performance Check

Run Lighthouse audit:

1. Open Chrome DevTools
2. Go to "Lighthouse" tab
3. Run audit for Performance, Accessibility, Best Practices, SEO

Target scores:

- Performance: > 90
- Accessibility: > 90
- Best Practices: > 90
- SEO: > 90

---

## Troubleshooting

### Build Fails on Vercel/Netlify

```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm ci
npm run build
```

### 404 on Page Refresh

Ensure your hosting platform supports Next.js routing:

- Vercel: Automatic
- Netlify: Requires `@netlify/plugin-nextjs`
- Static: Use `trailingSlash: true` in config

### Locale Routing Not Working

Check that middleware is deployed correctly. Some platforms may need explicit configuration for middleware support.

### Images Not Loading

For static export, ensure `images.unoptimized: true` in `next.config.js`.

---

## Monitoring (Optional)

### Error Tracking with Sentry

1. Install Sentry:

   ```bash
   npm install @sentry/nextjs
   ```

2. Run setup wizard:

   ```bash
   npx @sentry/wizard@latest -i nextjs
   ```

3. Configure in `sentry.client.config.js`

### Analytics (Privacy-Respecting)

Consider [Plausible](https://plausible.io) or [Umami](https://umami.is) for privacy-friendly analytics.

---

## Support

For deployment issues:

1. Check the [troubleshooting section](#troubleshooting)
2. Review platform-specific documentation
3. Open an issue on GitHub
