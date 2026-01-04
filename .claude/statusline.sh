#!/bin/bash
# Claude Flow V3 Development Status Line
# Shows DDD architecture progress, security status, and performance targets

V3_METRICS=".claude-flow/metrics/v3-progress.json"
SECURITY_AUDIT=".claude-flow/security/audit-status.json"
PERFORMANCE_METRICS=".claude-flow/metrics/performance.json"

# ANSI Color Codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[0;37m'
BOLD='\033[1m'
DIM='\033[2m'
UNDERLINE='\033[4m'
RESET='\033[0m'

# Bright colors
BRIGHT_RED='\033[1;31m'
BRIGHT_GREEN='\033[1;32m'
BRIGHT_YELLOW='\033[1;33m'
BRIGHT_BLUE='\033[1;34m'
BRIGHT_PURPLE='\033[1;35m'
BRIGHT_CYAN='\033[1;36m'

# V3 Development Targets
DOMAINS_TOTAL=5
AGENTS_TARGET=15
PERF_TARGET="2.49x-7.47x"
SECURITY_CVES=3

# Default values
DOMAINS_COMPLETED=0
AGENTS_ACTIVE=0
PERF_CURRENT="1.0x"
SECURITY_STATUS="PENDING"
DDD_PROGRESS=0
INTEGRATION_STATUS="○"

# Get current git branch
GIT_BRANCH=""
if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  GIT_BRANCH=$(git branch --show-current 2>/dev/null || echo "")
fi

# Check V3 domain implementation progress
if [ -f "$V3_METRICS" ]; then
  DOMAINS_COMPLETED=$(jq -r '.domains.completed // 0' "$V3_METRICS" 2>/dev/null || echo "0")
  DDD_PROGRESS=$(jq -r '.ddd.progress // 0' "$V3_METRICS" 2>/dev/null || echo "0")
  AGENTS_ACTIVE=$(jq -r '.swarm.activeAgents // 0' "$V3_METRICS" 2>/dev/null || echo "0")
else
  # Check for actual domain directories
  DOMAINS_COMPLETED=0
  [ -d "src/domains/task-management" ] && ((DOMAINS_COMPLETED++))
  [ -d "src/domains/session-management" ] && ((DOMAINS_COMPLETED++))
  [ -d "src/domains/health-monitoring" ] && ((DOMAINS_COMPLETED++))
  [ -d "src/domains/lifecycle-management" ] && ((DOMAINS_COMPLETED++))
  [ -d "src/domains/event-coordination" ] && ((DOMAINS_COMPLETED++))
fi

# Check security audit status
if [ -f "$SECURITY_AUDIT" ]; then
  SECURITY_STATUS=$(jq -r '.status // "PENDING"' "$SECURITY_AUDIT" 2>/dev/null || echo "PENDING")
  CVES_FIXED=$(jq -r '.cvesFixed // 0' "$SECURITY_AUDIT" 2>/dev/null || echo "0")
else
  CVES_FIXED=0
fi

# Check performance metrics
if [ -f "$PERFORMANCE_METRICS" ]; then
  PERF_CURRENT=$(jq -r '.flashAttention.speedup // "1.0x"' "$PERFORMANCE_METRICS" 2>/dev/null || echo "1.0x")
  MEMORY_REDUCTION=$(jq -r '.memory.reduction // "0%"' "$PERFORMANCE_METRICS" 2>/dev/null || echo "0%")
else
  MEMORY_REDUCTION="0%"
fi

# Check agentic-flow@alpha integration status
INTEGRATION_STATUS="○"
if [ -f "package.json" ]; then
  if grep -q "agentic-flow.*alpha" package.json 2>/dev/null; then
    INTEGRATION_STATUS="●"
  fi
fi

# Colorful domain status indicators
COMPLETED_DOMAIN="${BRIGHT_GREEN}●${RESET}"
PENDING_DOMAIN="${DIM}○${RESET}"
DOMAIN_STATUS="${PENDING_DOMAIN}${PENDING_DOMAIN}${PENDING_DOMAIN}${PENDING_DOMAIN}${PENDING_DOMAIN}"

case $DOMAINS_COMPLETED in
  1) DOMAIN_STATUS="${COMPLETED_DOMAIN}${PENDING_DOMAIN}${PENDING_DOMAIN}${PENDING_DOMAIN}${PENDING_DOMAIN}" ;;
  2) DOMAIN_STATUS="${COMPLETED_DOMAIN}${COMPLETED_DOMAIN}${PENDING_DOMAIN}${PENDING_DOMAIN}${PENDING_DOMAIN}" ;;
  3) DOMAIN_STATUS="${COMPLETED_DOMAIN}${COMPLETED_DOMAIN}${COMPLETED_DOMAIN}${PENDING_DOMAIN}${PENDING_DOMAIN}" ;;
  4) DOMAIN_STATUS="${COMPLETED_DOMAIN}${COMPLETED_DOMAIN}${COMPLETED_DOMAIN}${COMPLETED_DOMAIN}${PENDING_DOMAIN}" ;;
  5) DOMAIN_STATUS="${COMPLETED_DOMAIN}${COMPLETED_DOMAIN}${COMPLETED_DOMAIN}${COMPLETED_DOMAIN}${COMPLETED_DOMAIN}" ;;
esac

# Colorful security status
SECURITY_ICON="🔴"
SECURITY_COLOR="${BRIGHT_RED}"
if [ "$SECURITY_STATUS" = "CLEAN" ]; then
  SECURITY_ICON="🟢"
  SECURITY_COLOR="${BRIGHT_GREEN}"
elif [ "$CVES_FIXED" -gt 0 ]; then
  SECURITY_ICON="🟡"
  SECURITY_COLOR="${BRIGHT_YELLOW}"
fi

# Integration status colors
INTEGRATION_COLOR="${DIM}"
if [ "$INTEGRATION_STATUS" = "●" ]; then
  INTEGRATION_COLOR="${BRIGHT_CYAN}"
fi

# Build colorful output with better formatting
OUTPUT=""

# Header Line: V3 Project + Branch + Integration Status
OUTPUT="${BOLD}${BRIGHT_PURPLE}▊ Claude Flow V3 ${RESET}"
OUTPUT="${OUTPUT}${INTEGRATION_COLOR}${INTEGRATION_STATUS} ${BRIGHT_CYAN}agentic-flow@alpha${RESET}"
if [ -n "$GIT_BRANCH" ]; then
  OUTPUT="${OUTPUT}  ${DIM}│${RESET}  ${BRIGHT_BLUE}⎇ ${GIT_BRANCH}${RESET}"
fi

# Separator line
OUTPUT="${OUTPUT}\n${DIM}─────────────────────────────────────────────────────${RESET}"

# Line 1: DDD Domain Decomposition Progress
DOMAINS_COLOR="${BRIGHT_GREEN}"
if [ "$DOMAINS_COMPLETED" -lt 3 ]; then
  DOMAINS_COLOR="${YELLOW}"
fi
if [ "$DOMAINS_COMPLETED" -eq 0 ]; then
  DOMAINS_COLOR="${RED}"
fi

PERF_COLOR="${BRIGHT_YELLOW}"
if [[ "$PERF_CURRENT" =~ ^[0-9]+\.[0-9]+x$ ]] && [[ "${PERF_CURRENT%x}" > "2.0" ]]; then
  PERF_COLOR="${BRIGHT_GREEN}"
fi

OUTPUT="${OUTPUT}\n${BRIGHT_CYAN}🏗️  DDD Domains${RESET}    [${DOMAIN_STATUS}]  ${DOMAINS_COLOR}${DOMAINS_COMPLETED}${RESET}/${BRIGHT_WHITE}${DOMAINS_TOTAL}${RESET}"
OUTPUT="${OUTPUT}    ${PERF_COLOR}⚡ ${PERF_CURRENT}${RESET} ${DIM}→${RESET} ${BRIGHT_YELLOW}${PERF_TARGET}${RESET}"

# Line 2: 15-Agent Swarm Coordination Status
AGENTS_COLOR="${BRIGHT_GREEN}"
if [ "$AGENTS_ACTIVE" -lt 8 ]; then
  AGENTS_COLOR="${YELLOW}"
fi
if [ "$AGENTS_ACTIVE" -eq 0 ]; then
  AGENTS_COLOR="${RED}"
fi

MEMORY_COLOR="${BRIGHT_GREEN}"
if [[ "$MEMORY_REDUCTION" == "0%" ]]; then
  MEMORY_COLOR="${DIM}"
fi

# Format agent count with padding
AGENT_DISPLAY=$(printf "%2d" "$AGENTS_ACTIVE")

OUTPUT="${OUTPUT}\n${BRIGHT_YELLOW}🤖 Swarm Agents${RESET}    [${AGENTS_COLOR}${AGENT_DISPLAY}${RESET}/${BRIGHT_WHITE}${AGENTS_TARGET}${RESET}]      ${SECURITY_ICON} ${SECURITY_COLOR}CVE ${CVES_FIXED}${RESET}/${BRIGHT_WHITE}${SECURITY_CVES}${RESET}    ${MEMORY_COLOR}💾 ${MEMORY_REDUCTION}${RESET}"

# Line 3: V3 Architecture Components with better alignment
DDD_COLOR="${BRIGHT_GREEN}"
if [ "$DDD_PROGRESS" -lt 50 ]; then
  DDD_COLOR="${YELLOW}"
fi
if [ "$DDD_PROGRESS" -eq 0 ]; then
  DDD_COLOR="${RED}"
fi

# Format DDD progress with padding
DDD_DISPLAY=$(printf "%3d" "$DDD_PROGRESS")

OUTPUT="${OUTPUT}\n${BRIGHT_PURPLE}🔧 Architecture${RESET}    ${CYAN}DDD${RESET} ${DDD_COLOR}●${DDD_DISPLAY}%${RESET}  ${DIM}│${RESET}  ${CYAN}Security${RESET} ${SECURITY_COLOR}●${SECURITY_STATUS}${RESET}"
OUTPUT="${OUTPUT}  ${DIM}│${RESET}  ${CYAN}Memory${RESET} ${BRIGHT_GREEN}●AgentDB${RESET}  ${DIM}│${RESET}  ${CYAN}Integration${RESET} ${INTEGRATION_COLOR}●${RESET}"

# Footer separator
OUTPUT="${OUTPUT}\n${DIM}─────────────────────────────────────────────────────${RESET}"

printf "%b\n" "$OUTPUT"
