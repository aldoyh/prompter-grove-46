# Cloudflare Deployment Guide

This guide explains how to set up and deploy your Next.js Prompts application to Cloudflare using the `deploy.sh` script.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Setup Guide](#setup-guide)
- [Configuration](#configuration)
- [Deployment](#deployment)
- [Monitoring](#monitoring)
- [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Tools

- **Node.js** v16+ ([Download](https://nodejs.org/))
- **npm** v7+ (comes with Node.js)
- **Git** ([Download](https://git-scm.com/))

### Cloudflare Account

1. Create a [Cloudflare account](https://dash.cloudflare.com/sign-up)
2. Set up a domain with Cloudflare or use `workers.dev` subdomain
3. Enable **Cloudflare Workers** or **Pages** in your account

### API Credentials

1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Go to **Account Settings** → **API Tokens**
3. Create a token with these permissions:
   - `account:read`
   - `workers:write`
   - `workers_routes:write`
   - `workers_kv:write`
4. Copy your API token and keep it safe

### Get Your Account ID

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Your Account ID is on the right side of **Account Settings** page
3. You'll need this for configuration

## Quick Start

### 1. Initial Setup (First Time Only)

```bash
# Make script executable
chmod +x deploy.sh

# Run one-time setup
./deploy.sh setup
```

This will:
- ✓ Check dependencies
- ✓ Install npm packages
- ✓ Install wrangler CLI
- ✓ Create `wrangler.toml`
- ✓ Create `.env.production`

### 2. Configure Credentials

Edit `wrangler.toml` and `.env.production`:

```bash
# Edit wrangler.toml
nano wrangler.toml
# Update: account_id, routes, zone_id

# Edit environment variables
nano .env.production
# Update: API token, credentials
```

### 3. Authenticate with Cloudflare

```bash
./deploy.sh configure
```

Or authenticate directly:

```bash
npx wrangler login
```

### 4. Deploy to Production

```bash
# One-command deployment with all checks
./deploy.sh deploy

# Or dry-run first to see what will happen
./deploy.sh deploy --dry-run
```

## Setup Guide

### Step 1: Project Initialization

```bash
git clone https://github.com/yourusername/prompts-app.git
cd prompts-app
./deploy.sh setup
```

### Step 2: Configure Wrangler

The `wrangler.toml` file controls deployment. Key sections:

```toml
name = "prompts-app"
account_id = "your-account-id-here"

[env.production]
name = "prompts-app-production"
routes = [{ pattern = "yourdomain.com/*", zone_id = "your-zone-id" }]

[[kv_namespaces]]
binding = "PROMPTS_KV"
id = "your-kv-namespace-id"
```

**Finding Your IDs:**
- Account ID: Cloudflare Dashboard → Account Settings
- Zone ID: DNS page → Get your zone
- KV Namespace: Workers → KV → View Namespace

### Step 3: Set Environment Variables

Edit `.env.production`:

```bash
ENVIRONMENT=production
NODE_ENV=production
CLOUDFLARE_API_TOKEN=your-api-token
CLOUDFLARE_ACCOUNT_ID=your-account-id
CLOUDFLARE_ZONE_ID=your-zone-id
```

## Configuration

### wrangler.toml Sections

#### Basic Configuration

```toml
name = "prompts-app"
type = "javascript"
account_id = "abc123..."
workers_dev = true
```

#### Build Configuration

```toml
[build]
command = "npm run build"
cwd = "."
```

#### Environments

```toml
[env.production]
name = "prompts-app-prod"
routes = [{ pattern = "example.com/*", zone_id = "xyz789..." }]

[env.staging]
name = "prompts-app-staging"
workers_dev = true
```

#### KV Namespace Bindings

```toml
[[kv_namespaces]]
binding = "PROMPTS_KV"
id = "your-production-kv-id"
preview_id = "your-preview-kv-id"
```

#### R2 Bucket Bindings (Optional)

```toml
[[r2_buckets]]
binding = "ASSETS"
bucket_name = "prompts-app-assets"
```

### Environment Variables

#### Production (.env.production)

```bash
# Core
ENVIRONMENT=production
NODE_ENV=production

# API
NEXT_PUBLIC_API_URL=https://api.yourdomain.com

# Features
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_ERROR_REPORTING=true

# Logging
LOG_LEVEL=info
```

#### Development (.env.development)

```bash
ENVIRONMENT=development
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## Deployment

### One-Command Deployment

```bash
./deploy.sh deploy
```

This runs the full pipeline:
1. ✓ Dependency checks
2. ✓ Configuration validation
3. ✓ Git status check
4. ✓ Build application
5. ✓ Cloudflare authentication
6. ✓ Deploy to Workers/Pages
7. ✓ Verify deployment

### Deployment to Specific Environment

```bash
# Deploy to staging
./deploy.sh deploy --env staging

# Deploy to development
./deploy.sh deploy --env development
```

### Dry-Run Deployment

Test without making changes:

```bash
./deploy.sh deploy --dry-run
```

### Build Only

Just build without deploying:

```bash
./deploy.sh build
```

### Verbose Mode

See detailed output:

```bash
./deploy.sh deploy --verbose
```

## Monitoring

### Check Deployment Status

```bash
./deploy.sh health
```

Shows:
- ✓ Dependency status
- ✓ Build artifacts
- ✓ Code changes
- ✓ Deployment info

### View Deployment Logs

```bash
# Last 50 lines
./deploy.sh logs

# Last 100 lines
./deploy.sh logs 100

# Follow logs in real-time
./deploy.sh logs --follow
```

### Real-Time Logs

```bash
# Cloudflare real-time logs
npx wrangler tail

# With filtering
npx wrangler tail --env production
```

### Deployment History

```bash
# List recent deployments
npx wrangler deployments list

# Show deployment details
npx wrangler deployments info <deployment-id>
```

## Monitoring & Analytics

### Cloudflare Analytics

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Select your Workers/Pages
3. View **Analytics** tab:
   - Requests count
   - Response times
   - CPU time
   - Errors

### Performance Optimization

```bash
# Check bundle size
npm run build

# Analyze webpack bundle
npm install --save-dev webpack-bundle-analyzer
```

## Rollback

### Rollback to Previous Version

```bash
./deploy.sh rollback previous
```

### Manual Rollback

```bash
npx wrangler rollback
```

### View Deployment History

```bash
npx wrangler deployments list
```

## Troubleshooting

### Authentication Issues

**Problem:** `Error: Not authenticated`

**Solution:**
```bash
npx wrangler login
```

Follow the prompts to authenticate with Cloudflare.

### Wrangler Not Found

**Problem:** `command not found: wrangler`

**Solution:**
```bash
npm install wrangler --save-dev
```

### Build Errors

**Problem:** Build fails with TypeScript errors

**Solution:**
```bash
# Check for type errors
npm run build

# Fix errors in src/
# Re-run build
npm run build
```

### Deployment Fails

**Problem:** Deployment error with configuration

**Solution:**
```bash
# Validate configuration
npx wrangler deploy --dry-run

# Check configuration
cat wrangler.toml

# Verify credentials
npx wrangler whoami
```

### KV Namespace Not Found

**Problem:** `Error: KV namespace not found`

**Solution:**
1. Create KV namespace:
```bash
npx wrangler kv:namespace create "PROMPTS_KV"
```

2. Update `wrangler.toml` with the returned ID:
```toml
[[kv_namespaces]]
binding = "PROMPTS_KV"
id = "your-namespace-id"
```

### Environment Variables Not Applied

**Problem:** Environment variables not available in worker

**Solution:**
```bash
# Check .env.production is sourced
echo $CLOUDFLARE_API_TOKEN

# Redeploy
./deploy.sh deploy
```

### Port Already in Use

**Problem:** `Port 3000 already in use`

**Solution:**
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
./deploy.sh --port 3001
```

## Advanced Usage

### Custom Build Process

Edit `wrangler.toml`:

```toml
[build]
command = "npm run build && npm run optimize"
cwd = "."
```

### Multiple Environments

```bash
# Staging
./deploy.sh deploy --env staging

# Production
./deploy.sh deploy --env production
```

### CI/CD Integration

GitLab CI example:

```yaml
deploy:
  stage: deploy
  script:
    - ./deploy.sh deploy --env production
  only:
    - main
```

GitHub Actions example:

```yaml
- name: Deploy
  run: ./deploy.sh deploy --env production
  env:
    CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
```

### Custom Domain Setup

1. Add domain to Cloudflare
2. Update `wrangler.toml`:
```toml
[[routes]]
pattern = "api.yourdomain.com/*"
zone_id = "your-zone-id"
```

3. Redeploy:
```bash
./deploy.sh deploy
```

## Best Practices

### Before Deployment

- ✓ Run `./deploy.sh health` to check status
- ✓ Test locally with `npm run dev`
- ✓ Run builds locally with `npm run build`
- ✓ Commit all changes to git

### During Deployment

- ✓ Use `--dry-run` for testing
- ✓ Monitor logs with `./deploy.sh logs`
- ✓ Deploy during low-traffic times
- ✓ Have rollback plan ready

### After Deployment

- ✓ Verify with `./deploy.sh health`
- ✓ Check real-time logs: `npx wrangler tail`
- ✓ Test critical features
- ✓ Monitor error rates

## Security

### API Token Safety

```bash
# Never commit tokens!
echo ".env.production" >> .gitignore
echo ".wrangler/" >> .gitignore

# Use environment variables in CI/CD
export CLOUDFLARE_API_TOKEN="your-token"
```

### Minimal Permissions

Create API token with only required scopes:
- `workers:write` - Deploy workers
- `account:read` - Read account info
- `workers_kv:write` - Access KV storage

### Rotate Credentials

Periodically rotate your API tokens:
1. Create new token in Cloudflare
2. Update `.env.production`
3. Redeploy
4. Delete old token

## Performance Tips

1. **Enable Caching:**
   ```toml
   [cache]
   default_ttl = 3600
   ```

2. **Minify Assets:**
   Just use `npm run build`

3. **Use KV for Data:**
   Store static data in KV instead of database

4. **Monitor CPU Time:**
   Keep worker execution under 50ms for best performance

## Getting Help

### Resources

- [Wrangler Documentation](https://developers.cloudflare.com/workers/wrangler/)
- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Next.js Deployment](https://nextjs.org/docs/deployment)

### Support

- Cloudflare Support: https://support.cloudflare.com/
- GitHub Issues: Create an issue in this repo
- Discord: Join Cloudflare Workers Discord

---

**Last Updated:** February 14, 2024  
**Script Version:** 1.0.0
