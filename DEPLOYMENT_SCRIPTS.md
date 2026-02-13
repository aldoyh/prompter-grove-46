# Deployment Scripts & Automation

This directory contains comprehensive deployment automation for the Prompts application to Cloudflare Workers/Pages.

## Files Overview

### Core Scripts

#### `deploy.sh` (Main Deployment Script)
The primary wrapper for Wrangler CLI that handles the complete deployment lifecycle.

**Features:**
- ✓ Dependency validation
- ✓ Automated setup & configuration
- ✓ Build verification
- ✓ Cloudflare authentication
- ✓ One-command deployment
- ✓ Dry-run capabilities
- ✓ Health checks
- ✓ Rollback support
- ✓ Comprehensive logging

**Usage:**
```bash
./deploy.sh help                           # Show help
./deploy.sh setup                          # One-time initialization
./deploy.sh configure                      # Verify configuration
./deploy.sh build                          # Build only
./deploy.sh deploy                         # Deploy to production
./deploy.sh deploy --dry-run               # Test without changes
./deploy.sh deploy --env staging           # Deploy to staging
./deploy.sh health                         # Check deployment status
./deploy.sh logs [lines]                   # View deployment logs
./deploy.sh rollback                       # Rollback to previous version
```

#### `pre-deploy-check.sh` (Pre-deployment Validation)
Runs comprehensive checks before deployment to catch issues early.

**Checks:**
- ✓ Required commands (node, npm, git)
- ✓ Configuration files (wrangler.toml, .env.production)
- ✓ Git repository status
- ✓ Dependencies installation
- ✓ Build artifacts
- ✓ Security configuration

**Usage:**
```bash
bash pre-deploy-check.sh
```

### Configuration Files

#### `.env.production.example`
Template for production environment variables. Copy to `.env.production` and fill in values.

```bash
cp .env.production.example .env.production
nano .env.production  # Edit with your values
```

#### `wrangler.toml` (Auto-generated)
Cloudflare Wrangler configuration. Created during `setup` command.

**Key Sections:**
- `name` - Project name
- `account_id` - Cloudflare account ID
- `[env.production]` - Production environment
- `[[kv_namespaces]]` - KV storage binding
- `[[routes]]` - Domain routing rules

### CI/CD Workflows

#### `.github/workflows/deploy.yml`
Automated deployment on push to main branch.

**Triggers:**
- Push to `main` or `master` branches
- Manual workflow dispatch

**Steps:**
1. Checkout code
2. Setup Node.js environment
3. Install dependencies
4. Run pre-deployment checks
5. Build application
6. Deploy to Cloudflare
7. Run smoke tests

#### `.github/workflows/ci.yml`
Continuous integration pipeline for testing on pull requests.

**Jobs:**
- **Lint** - Code quality checks with ESLint
- **Build** - Application build verification
- **Test** - Unit tests and coverage
- **Security** - Vulnerability scanning
- **Dependencies** - Outdated package detection

## Quick Start

### 1. First Time Setup

```bash
# Clone repository
git clone <your-repo>
cd prompts-app

# Make scripts executable
chmod +x deploy.sh pre-deploy-check.sh

# Run setup
./deploy.sh setup
```

### 2. Configure Credentials

```bash
# Edit Wrangler config
nano wrangler.toml
# Update: account_id, routes

# Edit environment variables
nano .env.production
# Update: API tokens, credentials
```

### 3. Authenticate

```bash
npx wrangler login
```

Or use environment variable:
```bash
export CLOUDFLARE_API_TOKEN="your-token"
```

### 4. Deploy

```bash
# Test deployment
./deploy.sh deploy --dry-run

# Real deployment
./deploy.sh deploy
```

## Command Reference

### Setup Phase

```bash
# Complete environment setup
./deploy.sh setup

# What it does:
# - Validates dependencies (node, npm, git)
# - Installs npm packages
# - Installs wrangler CLI
# - Creates wrangler.toml
# - Creates .env.production
```

### Configuration Phase

```bash
# Verify all configurations
./deploy.sh configure

# What it does:
# - Checks dependencies
# - Validates configuration files
# - Checks git status
```

### Build Phase

```bash
# Build application
./deploy.sh build

# Build with verbose logging
./deploy.sh build --verbose

# What it does:
# - Validates dependencies
# - Installs npm packages
# - Runs next build
# - Verifies build artifacts
```

### Deployment Phase

```bash
# Full deployment pipeline
./deploy.sh deploy

# Options:
./deploy.sh deploy --env staging        # Deploy to staging
./deploy.sh deploy --env production     # Deploy to production (default)
./deploy.sh deploy --dry-run            # Preview changes
./deploy.sh deploy --verbose            # Detailed output
./deploy.sh deploy --skip-checks        # Skip pre-checks (not recommended)
```

### Post-deployment

```bash
# Check deployment status
./deploy.sh health

# View logs
./deploy.sh logs                         # Last 50 lines
./deploy.sh logs 100                     # Last 100 lines
./deploy.sh logs 500                     # Last 500 lines

# Real-time Cloudflare logs
npx wrangler tail

# List recent deployments
npx wrangler deployments list

# Rollback to previous version
./deploy.sh rollback
```

## Environment Variables

### Required

```bash
CLOUDFLARE_API_TOKEN      # Your Cloudflare API token
CLOUDFLARE_ACCOUNT_ID     # Your Cloudflare account ID
```

### Optional Script Options

```bash
ENVIRONMENT=production     # Target environment (default: production)
DRY_RUN=1                 # Run without making changes
VERBOSE=1                 # Enable verbose logging
SKIP_CHECKS=1             # Skip pre-deployment checks
```

### Runtime Enhancement

```bash
# Set during deployment
export CLOUDFLARE_API_TOKEN="token"
export CLOUDFLARE_ACCOUNT_ID="id"
./deploy.sh deploy
```

## GitHub Actions Setup

### Add Secrets to GitHub

1. Go to Repository → Settings → Secrets → Actions
2. Add secrets:
   - `CLOUDFLARE_API_TOKEN`
   - `CLOUDFLARE_ACCOUNT_ID`

### Protected Deployments

Environment protection rules in GitHub:

```bash
# Only specific branches can deploy
# Environment: production
# Deployment branches: main, master
```

## Manual Wrangler Commands

### Deployment

```bash
# Deploy to Workers
npx wrangler deploy

# Deploy with specific environment
npx wrangler deploy --env production

# Dry run
npx wrangler deploy --dry-run
```

### Configuration

```bash
# Authenticating
npx wrangler login

# Check authentication
npx wrangler whoami

# List KV namespaces
npx wrangler kv:namespace list

# Create KV namespace
npx wrangler kv:namespace create "PROMPTS_KV"
```

### Monitoring

```bash
# Real-time logs
npx wrangler tail

# Deployment history
npx wrangler deployments list

# Show specific deployment
npx wrangler deployments info <id>
```

### Development

```bash
# Local development
npx wrangler dev

# With local binding
npx wrangler dev --local
```

## Troubleshooting

### Deployment Fails

```bash
# Run checks
./deploy.sh health

# Validate configuration
./deploy.sh deploy --dry-run

# Check logs
./deploy.sh logs 100
```

### Authentication Issues

```bash
# Clear cached credentials
rm ~/.wrangler/config.toml

# Re-authenticate
npx wrangler login

# Or use environment variable
export CLOUDFLARE_API_TOKEN="your-token"
```

### Build Errors

```bash
# Check TypeScript errors
npx tsc --noEmit

# Clean and rebuild
rm -rf .next node_modules
npm install
npm run build
```

### KV Namespace Not Found

```bash
# List existing namespaces
npx wrangler kv:namespace list

# Create if missing
npx wrangler kv:namespace create "PROMPTS_KV"

# Update wrangler.toml with the ID
```

## Performance Tips

1. **Use Dry-Run First**
   ```bash
   ./deploy.sh deploy --dry-run
   ```

2. **Monitor Build Size**
   ```bash
   du -sh .next
   ```

3. **Check Real-time Logs**
   ```bash
   npx wrangler tail
   ```

4. **Optimize Build**
   ```bash
   npm run build
   # Look for large dependencies
   ```

## Security Best Practices

### Credentials Management

```bash
# Never commit credentials
echo ".env.production" >> .gitignore
echo ".wrangler/" >> .gitignore

# Use GitHub Secrets instead
# Go to Settings → Secrets → Actions
```

### API Token Rotation

```bash
# Create new token periodically
# 1. Generate new token in Cloudflare
# 2. Update GitHub secret
# 3. Redeploy
# 4. Revoke old token
```

### Minimal Permissions

API token should only have:
- `workers:write` - Deploy workers
- `account:read` - Read account info
- `workers_kv:write` - Access KV

## Monitoring & Alerts

### Cloudflare Analytics

1. Cloudflare Dashboard → Your Worker
2. Analytics tab shows:
   - Request counts
   - Response times
   - CPU time
   - Error rates

### Error Tracking

```bash
# View error logs
npx wrangler tail --env production

# Filter errors
npx wrangler tail --format json | grep error
```

### Performance Monitoring

```bash
# Check deployment performance
npx wrangler deploy --dry-run

# Monitor execution time
npx wrangler tail --env production --format json
```

## Advanced Usage

### Custom Build Process

Edit `wrangler.toml`:

```toml
[build]
command = "npm run build && npm run optimize"
```

### Multiple Environments

```bash
# Staging
./deploy.sh deploy --env staging

# Production
./deploy.sh deploy --env production

# Custom
./deploy.sh deploy --env custom
```

### CI/CD Integration

GitLab CI:
```yaml
deploy:
  stage: deploy
  script:
    - ./deploy.sh deploy --env production
  only:
    - main
```

Jenkins:
```groovy
stage('Deploy') {
  steps {
    sh './deploy.sh deploy --env production'
  }
}
```

## Rollback Strategy

### Automatic Rollback

```bash
./deploy.sh rollback
```

### Manual Steps

1. **Identify bad deployment**
   ```bash
   npx wrangler deployments list
   ```

2. **Get previous deployment ID**
   ```bash
   npx wrangler deployments info <previous-id>
   ```

3. **Rollback**
   ```bash
   npx wrangler rollback
   ```

## Support & Resources

### Documentation
- [Wrangler Docs](https://developers.cloudflare.com/workers/wrangler/)
- [Cloudflare Workers](https://developers.cloudflare.com/workers/)
- [Next.js Deployment](https://nextjs.org/docs/deployment)

### Getting Help
- Check logs: `./deploy.sh logs`
- Run health check: `./deploy.sh health`
- Review pre-checks: `bash pre-deploy-check.sh`
- GitHub Issues: Create issue in repository

### Reporting Issues
```bash
# Collect debug information
./deploy.sh deploy --verbose 2>&1 | tee debug.log

# Share with support
# Include: debug.log, wrangler.toml (sanitized), error messages
```

## Version History

- **v1.0.0** (2024-02-14)
  - Initial release
  - Full deployment pipeline
  - CI/CD workflows
  - Comprehensive documentation

---

**Last Updated:** February 14, 2024  
**Maintainer:** Your Team  
**License:** MIT
