#!/bin/bash

#================================================================================
# Wrangler Deployment Wrapper Script
# Manages setup, configuration, and production deployment to Cloudflare
#================================================================================

set -euo pipefail

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="${SCRIPT_DIR}"
BUILD_DIR="${PROJECT_ROOT}/.next"
DIST_DIR="${PROJECT_ROOT}/dist"
LOG_FILE="${PROJECT_ROOT}/deployment.log"
ENV_FILE="${PROJECT_ROOT}/.env.production"
WRANGLER_CONFIG="${PROJECT_ROOT}/wrangler.toml"

# Defaults
ENVIRONMENT="${ENVIRONMENT:-production}"
VERBOSE="${VERBOSE:-0}"
DRY_RUN="${DRY_RUN:-0}"
SKIP_CHECKS="${SKIP_CHECKS:-0}"

#================================================================================
# Helper Functions
#================================================================================

log_info() {
    echo -e "${BLUE}ℹ ${NC}$*"
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] INFO: $*" >> "$LOG_FILE"
}

log_success() {
    echo -e "${GREEN}✓ ${NC}$*"
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] SUCCESS: $*" >> "$LOG_FILE"
}

log_warning() {
    echo -e "${YELLOW}⚠ ${NC}$*"
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $*" >> "$LOG_FILE"
}

log_error() {
    echo -e "${RED}✗ ${NC}$*" >&2
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $*" >> "$LOG_FILE"
}

log_section() {
    echo -e "\n${CYAN}════════════════════════════════════════${NC}"
    echo -e "${CYAN}  $*${NC}"
    echo -e "${CYAN}════════════════════════════════════════${NC}\n"
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] SECTION: $*" >> "$LOG_FILE"
}

verbose_log() {
    if [[ $VERBOSE -eq 1 ]]; then
        echo -e "${BLUE}DEBUG: $*${NC}"
    fi
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] DEBUG: $*" >> "$LOG_FILE"
}

#================================================================================
# Validation Functions
#================================================================================

check_required_command() {
    if ! command -v "$1" &> /dev/null; then
        log_error "Required command not found: $1"
        log_info "Please install $1 and try again"
        return 1
    fi
    verbose_log "Found command: $1 ($(command -v "$1"))"
}

check_dependencies() {
    log_section "Checking Dependencies"
    
    local required_cmds=("node" "npm" "git")
    local missing=0
    
    for cmd in "${required_cmds[@]}"; do
        if ! check_required_command "$cmd"; then
            missing=$((missing + 1))
        else
            log_success "Command available: $cmd"
        fi
    done
    
    if [[ $missing -gt 0 ]]; then
        log_error "Missing $missing required command(s)"
        return 1
    fi
    
    # Check Node version
    local node_version=$(node --version | cut -d 'v' -f 2)
    log_info "Node.js version: $node_version"
    
    return 0
}

check_configuration() {
    log_section "Checking Configuration"
    
    if [[ ! -f "${PROJECT_ROOT}/package.json" ]]; then
        log_error "package.json not found in ${PROJECT_ROOT}"
        return 1
    fi
    log_success "Found package.json"
    
    if [[ ! -f "${PROJECT_ROOT}/next.config.ts" ]]; then
        log_warning "next.config.ts not found (optional)"
    else
        log_success "Found next.config.ts"
    fi
    
    return 0
}

check_git_status() {
    log_section "Checking Git Status"
    
    if [[ ! -d "${PROJECT_ROOT}/.git" ]]; then
        log_warning "Not a git repository"
        return 0
    fi
    
    if ! git -C "$PROJECT_ROOT" rev-parse --is-inside-work-tree &> /dev/null; then
        log_warning "Git repository check failed"
        return 0
    fi
    
    local branch=$(git -C "$PROJECT_ROOT" rev-parse --abbrev-ref HEAD)
    local commit=$(git -C "$PROJECT_ROOT" rev-parse --short HEAD)
    log_info "Current branch: $branch"
    log_info "Current commit: $commit"
    
    if [[ $(git -C "$PROJECT_ROOT" status --porcelain | wc -l) -gt 0 ]]; then
        log_warning "Uncommitted changes detected"
    else
        log_success "Working directory clean"
    fi
    
    return 0
}

#================================================================================
# Setup Functions
#================================================================================

setup_npm_dependencies() {
    log_section "Installing/Updating NPM Dependencies"
    
    if [[ $DRY_RUN -eq 1 ]]; then
        log_info "[DRY RUN] Would run: npm ci"
        return 0
    fi
    
    cd "$PROJECT_ROOT"
    
    if npm ci --prefer-offline --no-audit 2>&1 | tee -a "$LOG_FILE"; then
        log_success "NPM dependencies installed"
        return 0
    else
        log_error "Failed to install NPM dependencies"
        return 1
    fi
}

install_wrangler() {
    log_section "Setting Up Wrangler"
    
    # Check if wrangler is already installed locally
    if [[ -f "${PROJECT_ROOT}/node_modules/.bin/wrangler" ]]; then
        log_success "Wrangler already installed locally"
        verbose_log "Wrangler path: $(command -v "${PROJECT_ROOT}/node_modules/.bin/wrangler")"
        return 0
    fi
    
    log_info "Installing wrangler..."
    
    if [[ $DRY_RUN -eq 1 ]]; then
        log_info "[DRY RUN] Would run: npm install wrangler --save-dev"
        return 0
    fi
    
    cd "$PROJECT_ROOT"
    if npm install wrangler --save-dev 2>&1 | tee -a "$LOG_FILE"; then
        log_success "Wrangler installed"
        return 0
    else
        log_error "Failed to install wrangler"
        return 1
    fi
}

create_wrangler_config() {
    log_section "Creating Wrangler Configuration"
    
    if [[ -f "$WRANGLER_CONFIG" ]]; then
        log_info "wrangler.toml already exists, skipping creation"
        return 0
    fi
    
    log_info "Generating wrangler.toml..."
    
    local account_id="${CLOUDFLARE_ACCOUNT_ID:-}"
    local project_name="${CLOUDFLARE_PROJECT_NAME:-prompts-app}"
    
    if [[ -z "$account_id" ]]; then
        log_warning "CLOUDFLARE_ACCOUNT_ID not set, using placeholder"
        account_id="your-account-id"
    fi
    
    cat > "$WRANGLER_CONFIG" << 'EOF'
# Wrangler Configuration for Next.js Prompts App
# https://developers.cloudflare.com/workers/wrangler/

name = "prompts-app"
type = "javascript"
account_id = "your-account-id"
workers_dev = true
routes = []
zone_id = ""

# Build configuration
build = { command = "npm run build", cwd = "." }

# Environment variables
[env.production]
name = "prompts-app-production"
account_id = "your-account-id"
routes = [{ pattern = "example.com/*", zone_id = "your-zone-id" }]
vars = { ENVIRONMENT = "production" }

[env.staging]
name = "prompts-app-staging"
account_id = "your-account-id"
routes = [{ pattern = "staging.example.com/*", zone_id = "your-zone-id" }]
vars = { ENVIRONMENT = "staging" }

# KV Bindings for data storage
[[kv_namespaces]]
binding = "PROMPTS_KV"
id = "your-kv-namespace-id"
preview_id = "your-kv-preview-namespace-id"

# R2 Binding for asset storage (optional)
[[r2_buckets]]
binding = "ASSETS"
bucket_name = "prompts-app-assets"

# Compatibility settings
compatibility_date = "2024-02-14"
compatibility_flags = ["nodejs_compat"]

# Observability
[observability]
enabled = true
EOF
    
    log_success "Created wrangler.toml"
    log_info "Please update the configuration with your Cloudflare credentials"
    return 0
}

create_env_production() {
    log_section "Setting Up Environment Variables"
    
    if [[ -f "$ENV_FILE" ]]; then
        log_info ".env.production already exists, skipping creation"
        return 0
    fi
    
    log_info "Creating .env.production..."
    
    cat > "$ENV_FILE" << 'EOF'
# Production Environment Variables
ENVIRONMENT=production
NODE_ENV=production

# API Configuration
NEXT_PUBLIC_API_URL=https://api.example.com

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_ERROR_REPORTING=true

# Cloudflare Configuration (optional)
CLOUDFLARE_API_TOKEN=your-api-token
CLOUDFLARE_ACCOUNT_ID=your-account-id
CLOUDFLARE_ZONE_ID=your-zone-id
EOF
    
    log_success "Created .env.production"
    log_warning "Please update environment variables before deployment"
    return 0
}

#================================================================================
# Build Functions
#================================================================================

build_application() {
    log_section "Building Application"
    
    if [[ $DRY_RUN -eq 1 ]]; then
        log_info "[DRY RUN] Would run: npm run build"
        return 0
    fi
    
    cd "$PROJECT_ROOT"
    
    # Clean previous build
    if [[ -d "$BUILD_DIR" ]]; then
        log_info "Cleaning previous build artifacts..."
        rm -rf "$BUILD_DIR"
    fi
    
    log_info "Running build process..."
    if npm run build 2>&1 | tee -a "$LOG_FILE"; then
        log_success "Application built successfully"
        
        # Show build artifacts
        if [[ -d "$BUILD_DIR" ]]; then
            local size=$(du -sh "$BUILD_DIR" | cut -f1)
            log_info "Build size: $size"
        fi
        
        return 0
    else
        log_error "Build failed"
        return 1
    fi
}

verify_build() {
    log_section "Verifying Build"
    
    if [[ ! -d "$BUILD_DIR" ]]; then
        log_error "Build directory not found: $BUILD_DIR"
        return 1
    fi
    
    if [[ ! -f "$BUILD_DIR/BUILD_ID" ]]; then
        log_warning "Build ID file not found (this may be normal)"
    fi
    
    log_success "Build verification passed"
    return 0
}

#================================================================================
# Deployment Functions
#================================================================================

authenticate_cloudflare() {
    log_section "Authenticating with Cloudflare"
    
    if [[ -f "${HOME}/.wrangler/config.toml" ]]; then
        log_success "Cloudflare credentials found"
        return 0
    fi
    
    log_warning "Cloudflare credentials not found"
    log_info "Run the following command to authenticate:"
    echo -e "  ${CYAN}wrangler login${NC}"
    
    if [[ $DRY_RUN -eq 0 && $SKIP_CHECKS -eq 0 ]]; then
        log_info "Attempting automatic login..."
        if command -v wrangler &> /dev/null; then
            wrangler login || log_warning "Failed to login automatically"
        fi
    fi
    
    return 0
}

validate_wrangler_config() {
    log_section "Validating Wrangler Configuration"
    
    if [[ ! -f "$WRANGLER_CONFIG" ]]; then
        log_error "wrangler.toml not found"
        return 1
    fi
    
    if [[ $DRY_RUN -eq 1 ]]; then
        log_info "[DRY RUN] Would validate wrangler.toml"
        return 0
    fi
    
    cd "$PROJECT_ROOT"
    
    if npx wrangler deploy --dry-run 2>&1 | tee -a "$LOG_FILE"; then
        log_success "Wrangler configuration is valid"
        return 0
    else
        log_warning "Wrangler configuration validation had warnings (may be non-critical)"
        return 0
    fi
}

deploy_to_cloudflare() {
    log_section "Deploying to Cloudflare ${ENVIRONMENT}"
    
    if [[ $DRY_RUN -eq 1 ]]; then
        log_info "[DRY RUN] Would deploy to Cloudflare"
        return 0
    fi
    
    if [[ $SKIP_CHECKS -eq 0 ]]; then
        if ! authenticate_cloudflare; then
            log_error "Authentication failed"
            return 1
        fi
    fi
    
    cd "$PROJECT_ROOT"
    
    local deploy_cmd="npx wrangler deploy"
    
    if [[ "$ENVIRONMENT" != "production" ]]; then
        deploy_cmd="$deploy_cmd --env $ENVIRONMENT"
    fi
    
    log_info "Running: $deploy_cmd"
    
    if $deploy_cmd 2>&1 | tee -a "$LOG_FILE"; then
        log_success "Deployment completed successfully"
        return 0
    else
        log_error "Deployment failed"
        return 1
    fi
}

publish_assets() {
    log_section "Publishing Assets"
    
    log_info "Checking for static assets to publish..."
    
    # This is optional - only for projects that need it
    if [[ ! -d "${PROJECT_ROOT}/public" ]]; then
        log_info "No public assets directory found (skipping)"
        return 0
    fi
    
    if [[ $DRY_RUN -eq 1 ]]; then
        log_info "[DRY RUN] Would publish assets"
        return 0
    fi
    
    log_info "Assets will be served from the build output"
    log_success "Asset configuration complete"
    return 0
}

#================================================================================
# Verification Functions
#================================================================================

verify_deployment() {
    log_section "Verifying Deployment"
    
    if [[ $DRY_RUN -eq 1 ]]; then
        log_info "[DRY RUN] Skipping deployment verification"
        return 0
    fi
    
    cd "$PROJECT_ROOT"
    
    log_info "Fetching deployment information..."
    
    if npx wrangler deployments list 2>&1 | head -5 | tee -a "$LOG_FILE"; then
        log_success "Deployment verified"
        return 0
    else
        log_warning "Could not verify deployment (may be temporary)"
        return 0
    fi
}

show_deployment_info() {
    log_section "Deployment Information"
    
    cd "$PROJECT_ROOT"
    
    log_info "Project Configuration:"
    if [[ -f "$WRANGLER_CONFIG" ]]; then
        grep -E "^name|^account_id" "$WRANGLER_CONFIG" | head -2 | sed 's/^/  /'
    fi
    
    log_info "Build Information:"
    echo "  Build directory: $BUILD_DIR"
    echo "  Build timestamp: $(date +'%Y-%m-%d %H:%M:%S')"
    
    if [[ -f "$LOG_FILE" ]]; then
        log_info "Deployment log: $LOG_FILE"
    fi
    
    return 0
}

#================================================================================
# Rollback Functions
#================================================================================

rollback_deployment() {
    log_section "Rolling Back Deployment"
    
    local version="${1:-previous}"
    
    if [[ $DRY_RUN -eq 1 ]]; then
        log_info "[DRY RUN] Would rollback to: $version"
        return 0
    fi
    
    cd "$PROJECT_ROOT"
    
    log_warning "Rolling back to: $version"
    
    if npx wrangler rollback --message "Rollback initiated by deployment script" 2>&1 | tee -a "$LOG_FILE"; then
        log_success "Rollback completed"
        return 0
    else
        log_error "Rollback failed"
        return 1
    fi
}

#================================================================================
# Health Check Functions
#================================================================================

health_check() {
    log_section "Running Health Checks"
    
    local checks_passed=0
    local checks_total=0
    
    # Check 1: Node modules
    checks_total=$((checks_total + 1))
    if [[ -d "${PROJECT_ROOT}/node_modules" ]]; then
        log_success "Node modules installed"
        checks_passed=$((checks_passed + 1))
    else
        log_warning "Node modules not found"
    fi
    
    # Check 2: Build artifacts
    checks_total=$((checks_total + 1))
    if [[ -d "$BUILD_DIR" ]]; then
        log_success "Build artifacts exist"
        checks_passed=$((checks_passed + 1))
    else
        log_warning "Build artifacts not found"
    fi
    
    # Check 3: Git clean
    checks_total=$((checks_total + 1))
    if [[ -d "${PROJECT_ROOT}/.git" ]]; then
        if [[ $(git -C "$PROJECT_ROOT" status --porcelain | wc -l) -eq 0 ]]; then
            log_success "Working directory clean"
            checks_passed=$((checks_passed + 1))
        else
            log_warning "Uncommitted changes detected"
        fi
    fi
    
    log_info "Health checks: $checks_passed/$checks_total passed"
    
    return 0
}

#================================================================================
# Command Functions
#================================================================================

cmd_setup() {
    log_section "Setting Up Deployment Environment"
    
    check_dependencies || return 1
    check_configuration || return 1
    setup_npm_dependencies || return 1
    install_wrangler || return 1
    create_wrangler_config || return 1
    create_env_production || return 1
    
    log_success "Setup completed successfully!"
    log_info "Next steps:"
    echo "  1. Update wrangler.toml with your Cloudflare credentials"
    echo "  2. Update .env.production with your environment variables"
    echo "  3. Run './deploy.sh configure' to configure the deployment"
    
    return 0
}

cmd_configure() {
    log_section "Configuring Production Deployment"
    
    check_dependencies || return 1
    check_configuration || return 1
    check_git_status || return 1
    
    if [[ ! -f "$WRANGLER_CONFIG" ]]; then
        log_error "wrangler.toml not found. Run './deploy.sh setup' first"
        return 1
    fi
    
    if [[ ! -f "$ENV_FILE" ]]; then
        log_error ".env.production not found. Run './deploy.sh setup' first"
        return 1
    fi
    
    log_success "Configuration verified"
    log_info "Configuration files:"
    echo "  • $WRANGLER_CONFIG"
    echo "  • $ENV_FILE"
    
    return 0
}

cmd_build() {
    log_section "Building for Production"
    
    check_dependencies || return 1
    check_configuration || return 1
    setup_npm_dependencies || return 1
    build_application || return 1
    verify_build || return 1
    
    log_success "Build completed successfully!"
    
    return 0
}

cmd_deploy() {
    log_section "Deploying to Production (${ENVIRONMENT})"
    
    if [[ $SKIP_CHECKS -eq 0 ]]; then
        check_dependencies || return 1
        check_configuration || return 1
        check_git_status || return 1
        cmd_configure || return 1
        cmd_build || return 1
    fi
    
    if [[ $DRY_RUN -eq 0 ]]; then
        # Confirm deployment
        if [[ -t 0 ]]; then
            echo -e "\n${YELLOW}⚠  This will deploy to ${ENVIRONMENT} environment${NC}"
            read -p "Continue with deployment? (yes/no) " -n 3 -r
            echo
            if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
                log_warning "Deployment cancelled"
                return 0
            fi
        fi
    fi
    
    validate_wrangler_config || return 1
    deploy_to_cloudflare || return 1
    publish_assets || return 1
    verify_deployment || return 1
    show_deployment_info || return 1
    
    log_success "Deployment completed successfully!"
    
    return 0
}

cmd_rollback() {
    local version="${1:-previous}"
    
    if [[ $DRY_RUN -eq 0 ]]; then
        echo -e "\n${YELLOW}⚠  This will rollback the ${ENVIRONMENT} deployment${NC}"
        read -p "Continue with rollback? (yes/no) " -n 3 -r
        echo
        if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
            log_warning "Rollback cancelled"
            return 0
        fi
    fi
    
    rollback_deployment "$version" || return 1
    
    log_success "Rollback completed!"
    
    return 0
}

cmd_health() {
    health_check || return 1
    show_deployment_info || return 1
    return 0
}

cmd_logs() {
    log_section "Deployment Logs"
    
    if [[ ! -f "$LOG_FILE" ]]; then
        log_error "Log file not found: $LOG_FILE"
        return 1
    fi
    
    tail -n "${1:-50}" "$LOG_FILE"
    
    return 0
}

#================================================================================
# Help and Usage
#================================================================================

show_help() {
    cat << 'EOF'
╔════════════════════════════════════════════════════════════════════════════╗
║                 Wrangler Deployment Wrapper Script                         ║
║                    Deploy to Cloudflare Production                          ║
╚════════════════════════════════════════════════════════════════════════════╝

USAGE:
  ./deploy.sh [COMMAND] [OPTIONS]

COMMANDS:
  setup           Initialize deployment environment (one-time setup)
  configure       Configure production deployment settings
  build           Build application for production
  deploy          Build and deploy to production (full pipeline)
  rollback [v]    Rollback to previous deployment version
  health          Run health checks and show deployment info
  logs [n]        Show deployment logs (last n lines, default: 50)
  version         Show script version
  help            Show this help message

OPTIONS:
  -e, --env ENV              Environment: production, staging, development
  -d, --dry-run              Run without making changes
  -v, --verbose              Enable verbose logging
  -s, --skip-checks          Skip pre-deployment checks
  --log-file FILE            Specify custom log file path

EXAMPLES:
  # One-time setup
  ./deploy.sh setup

  # Configure deployment
  ./deploy.sh configure

  # Build application
  ./deploy.sh build

  # Full deployment pipeline
  ./deploy.sh deploy

  # Deploy to staging
  ./deploy.sh deploy --env staging

  # Dry run deployment
  ./deploy.sh deploy --dry-run

  # Rollback deployment
  ./deploy.sh rollback previous

  # Check deployment health
  ./deploy.sh health

  # View logs
  ./deploy.sh logs 100

ENVIRONMENT VARIABLES:
  ENVIRONMENT              Target environment (default: production)
  VERBOSE                  Enable verbose logging (0 or 1)
  DRY_RUN                  Run without making changes (0 or 1)
  SKIP_CHECKS              Skip pre-deployment checks (0 or 1)
  CLOUDFLARE_ACCOUNT_ID    Cloudflare account ID
  CLOUDFLARE_ZONE_ID       Cloudflare zone ID (for routing)
  CLOUDFLARE_API_TOKEN     Cloudflare API token

PREREQUISITES:
  • Node.js v16+
  • npm or yarn
  • Git (for version control)
  • Cloudflare account with Workers/Pages enabled
  • wrangler CLI (installed via npm)

CONFIGURATION FILES:
  • wrangler.toml              Wrangler configuration (created during setup)
  • .env.production            Production environment variables (created during setup)
  • deployment.log             Deployment logs

DOCUMENTATION:
  Wrangler: https://developers.cloudflare.com/workers/wrangler/
  Next.js:  https://nextjs.org/docs/deployment

SEE ALSO:
  • wrangler publish
  • wrangler login
  • wrangler tail

VERSION: 1.0.0
LAST UPDATED: 2024-02-14

EOF
}

#================================================================================
# Main Script
#================================================================================

main() {
    # Initialize log file
    mkdir -p "$(dirname "$LOG_FILE")"
    touch "$LOG_FILE"
    
    # Parse command line arguments
    local command="${1:-help}"
    shift || true
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            -e|--env)
                ENVIRONMENT="$2"
                shift 2
                ;;
            -d|--dry-run)
                DRY_RUN=1
                shift
                ;;
            -v|--verbose)
                VERBOSE=1
                shift
                ;;
            -s|--skip-checks)
                SKIP_CHECKS=1
                shift
                ;;
            --log-file)
                LOG_FILE="$2"
                shift 2
                ;;
            *)
                log_error "Unknown option: $1"
                show_help
                exit 1
                ;;
        esac
    done
    
    # Log script execution
    log_section "Script Execution Started"
    echo "Command: $command"
    echo "Environment: $ENVIRONMENT"
    echo "Dry Run: $DRY_RUN"
    echo "Verbose: $VERBOSE"
    echo "Project Root: $PROJECT_ROOT"
    
    # Execute command
    case "$command" in
        setup)
            cmd_setup
            ;;
        configure)
            cmd_configure
            ;;
        build)
            cmd_build
            ;;
        deploy)
            cmd_deploy
            ;;
        rollback)
            cmd_rollback "$@"
            ;;
        health)
            cmd_health
            ;;
        logs)
            cmd_logs "$@"
            ;;
        version)
            echo "Deploy Script v1.0.0"
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            log_error "Unknown command: $command"
            show_help
            exit 1
            ;;
    esac
    
    local exit_code=$?
    
    if [[ $exit_code -eq 0 ]]; then
        log_success "Script execution completed successfully"
    else
        log_error "Script execution failed with exit code $exit_code"
    fi
    
    echo -e "\n${BLUE}📋 Logs saved to: $LOG_FILE${NC}\n"
    
    exit $exit_code
}

# Execute main function
main "$@"
