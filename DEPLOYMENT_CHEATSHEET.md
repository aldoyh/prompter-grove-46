# Deployment Quick Reference

## One-Liners for Common Tasks

### Initial Setup (First Time)
```bash
chmod +x deploy.sh && ./deploy.sh setup
```

### Deploy to Production
```bash
./deploy.sh deploy
```

### Deploy with Verification
```bash
./deploy.sh deploy --dry-run && ./deploy.sh deploy
```

### Quick Health Check
```bash
./deploy.sh health
```

### View Recent Logs
```bash
./deploy.sh logs
```

### Rollback Last Deployment
```bash
./deploy.sh rollback
```

---

## Command Cheat Sheet

### Setup & Configuration
| Command | Purpose |
|---------|---------|
| `./deploy.sh setup` | Initialize deployment environment |
| `./deploy.sh configure` | Verify configuration |
| `bash pre-deploy-check.sh` | Run pre-deployment checks |
| `npx wrangler login` | Authenticate with Cloudflare |

### Building
| Command | Purpose |
|---------|---------|
| `./deploy.sh build` | Build application |
| `npm run build` | Next.js build |
| `npx tsc --noEmit` | TypeScript check |

### Deployment
| Command | Purpose |
|---------|---------|
| `./deploy.sh deploy` | Deploy to production |
| `./deploy.sh deploy --dry-run` | Preview deployment |
| `./deploy.sh deploy --env staging` | Deploy to staging |
| `./deploy.sh deploy --verbose` | Detailed output |
| `npx wrangler deploy` | Manual wrangler deploy |

### Monitoring & Logs
| Command | Purpose |
|---------|---------|
| `./deploy.sh health` | Check deployment status |
| `./deploy.sh logs` | View deployment logs |
| `./deploy.sh logs 100` | View last 100 lines |
| `npx wrangler tail` | Real-time Cloudflare logs |
| `npx wrangler deployments list` | Deployment history |

### Rollback & Recovery
| Command | Purpose |
|---------|---------|
| `./deploy.sh rollback` | Rollback to previous |
| `npx wrangler rollback` | Manual rollback |

### Information
| Command | Purpose |
|---------|---------|
| `./deploy.sh help` | Show help |
| `npx wrangler whoami` | Show current user |
| `npx wrangler deployments list` | List deployments |

---

## Environment Variables Quick Reference

```bash
# Required
CLOUDFLARE_API_TOKEN=xxx
CLOUDFLARE_ACCOUNT_ID=yyy

# Optional Script flags
ENVIRONMENT=production
DRY_RUN=1           # (0 or 1)
VERBOSE=1           # (0 or 1)
SKIP_CHECKS=1       # (0 or 1)

# Usage
export CLOUDFLARE_API_TOKEN="your-token"
./deploy.sh deploy
```

---

## GitHub Actions Secrets Setup

1. Go to: `Repository → Settings → Secrets → Actions`
2. Add:
   - `CLOUDFLARE_API_TOKEN`
   - `CLOUDFLARE_ACCOUNT_ID`
3. Workflows will use automatically

---

## Cloudflare Configuration Quick Setup

### Find Your IDs

```bash
# Account ID: Cloudflare Dashboard → Account Settings → right side
# Zone ID: DNS tab → copy "Zone ID"
# KV Namespace: Workers → KV → click namespace → copy ID
```

### Update Configuration

```bash
# Edit wrangler.toml
nano wrangler.toml

# Edit environment variables
nano .env.production

# Authenticate
npx wrangler login
```

---

## Common Scenarios

### Scenario: Deploy Code Changes
```bash
git add .
git commit -m "feat: new feature"
git push origin main
# GitHub Actions automatically deploys
```

### Scenario: Deploy from Local
```bash
./deploy.sh deploy
```

### Scenario: Test Before Deploying
```bash
./deploy.sh deploy --dry-run
./deploy.sh deploy
```

### Scenario: Deploy to Staging
```bash
./deploy.sh deploy --env staging
```

### Scenario: Check What Changed
```bash
./deploy.sh health
git status
```

### Scenario: Something Went Wrong
```bash
./deploy.sh logs 50          # Check logs
./deploy.sh health           # Check status
./deploy.sh rollback         # Rollback if needed
```

### Scenario: Check Real-time Errors
```bash
npx wrangler tail --env production --format json
```

### Scenario: Manual Troubleshooting
```bash
bash pre-deploy-check.sh     # Run checks
npm run build                 # Build locally
./deploy.sh deploy --dry-run  # Preview
```

---

## Required Files Checklist

### Must Exist
- ✓ `deploy.sh` - Main script
- ✓ `wrangler.toml` - Wrangler config
- ✓ `.env.production` - Environment variables
- ✓ `package.json` - Dependencies
- ✓ `next.config.ts` - Next.js config

### Must NOT Be Committed
- ✗ `.env.production` - Add to `.gitignore`
- ✗ `.wrangler/` - Add to `.gitignore`
- ✗ `node_modules/` - Add to `.gitignore`
- ✗ `.next/` - Add to `.gitignore`

---

## Exit Codes Reference

| Code | Meaning |
|------|---------|
| `0` | Success |
| `1` | General error |
| `2` | Missing dependency |
| `3` | Invalid configuration |
| `4` | Build failed |
| `5` | Deployment failed |

---

## Performance Tips

```bash
# Check build size
du -sh .next

# Clean build
rm -rf .next && npm run build

# Optimize
npm audit fix
npm outdated

# Monitor
npx wrangler tail --env production --format json | tail -20
```

---

## Security Checklist

- [ ] `.env.production` added to `.gitignore`
- [ ] API token stored in GitHub Secrets
- [ ] No credentials in `wrangler.toml`
- [ ] Minimal API token permissions set
- [ ] Regularly rotate API tokens

---

## Debugging Commands

```bash
# Verbose deployment
./deploy.sh deploy --verbose

# Show all environment variables
env | grep CLOUDFLARE

# Validate TypeScript
npx tsc --noEmit

# Check Wrangler config
npx wrangler deploy --dry-run

# View script version
./deploy.sh version

# Last command run
history | tail -1
```

---

## Emergency Commands

```bash
# Quick rollback if deployment broken
./deploy.sh rollback

# Kill stuck deployment
# (usually not needed, handled automatically)

# Clean everything and redeploy
rm -rf .next node_modules
npm install
./deploy.sh deploy
```

---

## Links & Resources

### Official Documentation
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/)
- [Cloudflare Workers](https://developers.cloudflare.com/workers/)
- [Next.js Deployment](https://nextjs.org/docs/deployment)

### Account Management
- [Cloudflare Dashboard](https://dash.cloudflare.com/)
- [API Tokens](https://dash.cloudflare.com/profile/api-tokens)
- [Workers](https://dash.cloudflare.com/workers)

### Support
- [Cloudflare Support](https://support.cloudflare.com/)
- [GitHub Issues](https://github.com/your-repo/issues)
- [Discord Community](https://discord.gg/cloudflaredev)

---

## Tips & Tricks

### Faster Deployments
```bash
./deploy.sh deploy --skip-checks  # Skip if you're confident
```

### Keep Organized
```bash
./deploy.sh logs > deployment-2024-02-14.log  # Archive logs
```

### Watch Real-time
```bash
npx wrangler tail --env production --format pretty
```

### Bulk Operations
```bash
# Multiple environments
./deploy.sh deploy --env staging && ./deploy.sh deploy --env production
```

---

## Keyboard Shortcuts

**In Terminal:**
```
Ctrl+C  - Stop running command
Ctrl+Z  - Suspend command
Ctrl+L  - Clear screen
Ctrl+R  - Search command history
```

---

**Last Updated:** February 14, 2024
