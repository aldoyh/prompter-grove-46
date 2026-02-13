#!/bin/bash

#================================================================================
# Pre-deployment checks and validation script
# Runs before deployment to catch issues early
#================================================================================

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

log_pass() { echo -e "${GREEN}✓${NC} $*"; }
log_fail() { echo -e "${RED}✗${NC} $*"; }
log_warn() { echo -e "${YELLOW}⚠${NC} $*"; }
log_info() { echo -e "${BLUE}ℹ${NC} $*"; }

check_count=0
pass_count=0

run_check() {
    local name="$1"
    local cmd="$2"
    check_count=$((check_count + 1))
    
    echo -n "  [$check_count] $name... "
    
    if eval "$cmd" &> /dev/null; then
        log_pass
        pass_count=$((pass_count + 1))
        return 0
    else
        log_fail
        return 1
    fi
}

echo -e "\n${BLUE}════════════════════════════════════════${NC}"
echo -e "${BLUE}  Pre-deployment Checks${NC}"
echo -e "${BLUE}════════════════════════════════════════${NC}\n"

# Basic checks
echo -e "${BLUE}Basic Requirements:${NC}"
run_check "Node.js installed" "command -v node"
run_check "npm installed" "command -v npm"
run_check "Git installed" "command -v git"
run_check "package.json exists" "test -f '$PROJECT_ROOT/package.json'"

# Configuration checks
echo -e "\n${BLUE}Configuration Files:${NC}"
run_check "wrangler.toml exists" "test -f '$PROJECT_ROOT/wrangler.toml'"
run_check ".env.production exists" "test -f '$PROJECT_ROOT/.env.production'"
run_check "next.config.ts exists" "test -f '$PROJECT_ROOT/next.config.ts'"

# Git checks
echo -e "\n${BLUE}Git Repository:${NC}"
run_check "Git repository initialized" "test -d '$PROJECT_ROOT/.git'"
run_check "Git has commits" "git -C '$PROJECT_ROOT' rev-parse HEAD > /dev/null 2>&1"

if git -C "$PROJECT_ROOT" rev-parse --is-inside-work-tree > /dev/null 2>&1; then
    local uncommitted=$(git -C "$PROJECT_ROOT" status --porcelain | wc -l)
    if [[ $uncommitted -eq 0 ]]; then
        run_check "Working directory clean" "test $uncommitted -eq 0"
    else
        run_check "Uncommitted changes" "test $uncommitted -gt 0"
        log_warn "You have $uncommitted uncommitted changes"
    fi
fi

# Node dependencies
echo -e "\n${BLUE}Dependencies:${NC}"
run_check "node_modules exists" "test -d '$PROJECT_ROOT/node_modules'"

if [[ -d "$PROJECT_ROOT/node_modules" ]]; then
    run_check "TypeScript installed" "test -d '$PROJECT_ROOT/node_modules/typescript'"
    run_check "Next.js installed" "test -d '$PROJECT_ROOT/node_modules/next'"
    run_check "Tailwind CSS installed" "test -d '$PROJECT_ROOT/node_modules/tailwindcss'"
fi

# Build artifacts
echo -e "\n${BLUE}Build Status:${NC}"
if [[ -d "$PROJECT_ROOT/.next" ]]; then
    run_check "Build directory exists" "test -d '$PROJECT_ROOT/.next'"
else
    log_warn "Build directory not found (normal for new deployments)"
fi

# Security checks
echo -e "\n${BLUE}Security:${NC}"
if [[ -f "$PROJECT_ROOT/.env.production" ]]; then
    run_check ".env.production not in git" "! git -C '$PROJECT_ROOT' ls-files --cached | grep -q '.env.production'"
    run_check ".gitignore configured" "grep -q '.env' '$PROJECT_ROOT/.gitignore' 2>/dev/null || true && echo -q"
fi

# Summary
echo -e "\n${BLUE}════════════════════════════════════════${NC}"
echo -e "Checks: ${GREEN}$pass_count${NC}/$check_count passed\n"

if [[ $pass_count -eq $check_count ]]; then
    log_pass "All checks passed! Ready for deployment\n"
    exit 0
else
    log_fail "Some checks failed. Please fix issues before deploying\n"
    exit 1
fi
