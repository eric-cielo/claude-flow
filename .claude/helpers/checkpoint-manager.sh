#!/bin/bash
# V3 Checkpoint Manager - Automatic Git checkpointing and progress tracking

set -e

# Configuration
CHECKPOINT_DIR=".claude-flow/checkpoints"
METRICS_DIR=".claude-flow/metrics"
AUTO_COMMIT_ENABLED=true
MIN_CHANGES_THRESHOLD=1

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
RESET='\033[0m'

# Ensure checkpoint directory exists
mkdir -p "$CHECKPOINT_DIR"

# Helper functions
log_info() {
  echo -e "${BLUE}🔄 $1${RESET}" >&2
}

log_success() {
  echo -e "${GREEN}✅ $1${RESET}" >&2
}

log_warning() {
  echo -e "${YELLOW}⚠️  $1${RESET}" >&2
}

log_error() {
  echo -e "${RED}❌ $1${RESET}" >&2
}

# Check if we're in a git repository
check_git_repo() {
  if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
    log_warning "Not in a git repository, skipping checkpoint"
    exit 0
  fi
}

# Check if there are enough changes to warrant a checkpoint
check_changes_threshold() {
  local changed_files=$(git status --porcelain 2>/dev/null | wc -l || echo 0)
  if [ "$changed_files" -lt "$MIN_CHANGES_THRESHOLD" ]; then
    log_info "Not enough changes for checkpoint ($changed_files < $MIN_CHANGES_THRESHOLD)"
    return 1
  fi
  return 0
}

# Create checkpoint metadata
create_checkpoint_metadata() {
  local checkpoint_type="$1"
  local message="$2"
  local timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
  local commit_hash=$(git rev-parse HEAD 2>/dev/null || echo "unknown")

  cat > "$CHECKPOINT_DIR/latest-checkpoint.json" <<EOF
{
  "timestamp": "$timestamp",
  "type": "$checkpoint_type",
  "message": "$message",
  "commitHash": "$commit_hash",
  "branch": "$(git branch --show-current 2>/dev/null || echo 'unknown')",
  "v3Progress": $(cat "$METRICS_DIR/v3-progress.json" 2>/dev/null || echo '{}'),
  "performance": $(cat "$METRICS_DIR/performance.json" 2>/dev/null || echo '{}'),
  "security": $(cat "$METRICS_DIR/../security/audit-status.json" 2>/dev/null || echo '{}')
}
EOF

  # Archive the checkpoint
  local checkpoint_file="$CHECKPOINT_DIR/checkpoint-$(date +%Y%m%d-%H%M%S).json"
  cp "$CHECKPOINT_DIR/latest-checkpoint.json" "$checkpoint_file"

  log_success "Checkpoint metadata created: $checkpoint_file"
}

# Auto-commit changes if enabled
auto_commit() {
  local message="$1"

  if [ "$AUTO_COMMIT_ENABLED" != "true" ]; then
    log_info "Auto-commit disabled, skipping"
    return 0
  fi

  # Check if there are changes to commit
  if git diff --quiet && git diff --cached --quiet; then
    log_info "No changes to commit"
    return 0
  fi

  # Add all changes
  git add . >/dev/null 2>&1 || true

  # Create commit with enhanced message
  local enhanced_message="$message

🚀 Generated with [Claude Code](https://claude.com/claude-code)
📊 V3 Development Progress Checkpoint

Co-Authored-By: Claude Sonnet 4 <noreply@anthropic.com>"

  if git commit -m "$enhanced_message" >/dev/null 2>&1; then
    local commit_hash=$(git rev-parse HEAD)
    log_success "Auto-commit created: ${commit_hash:0:7}"
  else
    log_info "No changes to commit or commit failed"
  fi
}

# Main checkpoint function
create_checkpoint() {
  local checkpoint_type="$1"
  local message="$2"

  check_git_repo

  case "$checkpoint_type" in
    "auto-checkpoint")
      if check_changes_threshold; then
        log_info "Creating auto-checkpoint: $message"
        create_checkpoint_metadata "$checkpoint_type" "$message"
        auto_commit "checkpoint: $message"
      fi
      ;;

    "agent-checkpoint")
      log_info "Creating agent checkpoint: $message"
      create_checkpoint_metadata "$checkpoint_type" "$message"
      auto_commit "feat(agent): $message"
      ;;

    "domain-checkpoint")
      log_info "Creating domain checkpoint: $message"
      create_checkpoint_metadata "$checkpoint_type" "$message"
      auto_commit "feat(domain): $message"
      ;;

    "security-checkpoint")
      log_info "Creating security checkpoint: $message"
      create_checkpoint_metadata "$checkpoint_type" "$message"
      auto_commit "security: $message"
      ;;

    "performance-checkpoint")
      log_info "Creating performance checkpoint: $message"
      create_checkpoint_metadata "$checkpoint_type" "$message"
      auto_commit "perf: $message"
      ;;

    "session-end")
      log_info "Creating session-end checkpoint"
      create_checkpoint_metadata "$checkpoint_type" "$message"
      auto_commit "checkpoint: session completed - $message"

      # Generate session summary
      if [ -f "$METRICS_DIR/v3-progress.json" ]; then
        local domains=$(jq -r '.domains.completed // 0' "$METRICS_DIR/v3-progress.json")
        local agents=$(jq -r '.swarm.activeAgents // 0' "$METRICS_DIR/v3-progress.json")
        local ddd=$(jq -r '.ddd.progress // 0' "$METRICS_DIR/v3-progress.json")

        echo "📊 Session Summary: $domains/5 domains, $agents/15 agents, $ddd% DDD progress" > "$CHECKPOINT_DIR/last-session-summary.txt"
      fi
      ;;

    "milestone-checkpoint")
      log_info "Creating milestone checkpoint: $message"
      create_checkpoint_metadata "$checkpoint_type" "$message"
      auto_commit "milestone: $message"
      ;;

    *)
      log_error "Unknown checkpoint type: $checkpoint_type"
      exit 1
      ;;
  esac
}

# Show checkpoint history
show_history() {
  echo -e "${PURPLE}📚 Recent Checkpoints${RESET}"
  echo "===================="

  if [ ! -d "$CHECKPOINT_DIR" ] || [ -z "$(ls -A "$CHECKPOINT_DIR"/*.json 2>/dev/null)" ]; then
    echo "No checkpoints found"
    return
  fi

  for checkpoint in $(ls -t "$CHECKPOINT_DIR"/checkpoint-*.json 2>/dev/null | head -5); do
    local timestamp=$(jq -r '.timestamp' "$checkpoint" 2>/dev/null || echo "unknown")
    local type=$(jq -r '.type' "$checkpoint" 2>/dev/null || echo "unknown")
    local message=$(jq -r '.message' "$checkpoint" 2>/dev/null || echo "unknown")
    local commit=$(jq -r '.commitHash' "$checkpoint" 2>/dev/null | cut -c1-7 || echo "unknown")

    echo -e "${CYAN}$timestamp${RESET} [$type] $message (${commit})"
  done
}

# Main script logic
case "$1" in
  "auto-checkpoint"|"agent-checkpoint"|"domain-checkpoint"|"security-checkpoint"|"performance-checkpoint"|"session-end"|"milestone-checkpoint")
    create_checkpoint "$1" "${2:-Auto checkpoint}"
    ;;

  "history")
    show_history
    ;;

  "status")
    if [ -f "$CHECKPOINT_DIR/latest-checkpoint.json" ]; then
      echo -e "${BLUE}📋 Latest Checkpoint${RESET}"
      echo "==================="
      jq -r '"Timestamp: " + .timestamp + "\nType: " + .type + "\nMessage: " + .message + "\nCommit: " + .commitHash' "$CHECKPOINT_DIR/latest-checkpoint.json" 2>/dev/null || echo "Error reading checkpoint"
    else
      echo "No checkpoints found"
    fi
    ;;

  *)
    echo "V3 Checkpoint Manager"
    echo "===================="
    echo ""
    echo "Usage: $0 <command> [options]"
    echo ""
    echo "Commands:"
    echo "  auto-checkpoint [message]        Create automatic checkpoint"
    echo "  agent-checkpoint [message]       Create agent milestone checkpoint"
    echo "  domain-checkpoint [message]      Create domain completion checkpoint"
    echo "  security-checkpoint [message]    Create security fix checkpoint"
    echo "  performance-checkpoint [message] Create performance improvement checkpoint"
    echo "  session-end [message]            Create session end checkpoint"
    echo "  milestone-checkpoint [message]   Create major milestone checkpoint"
    echo "  history                          Show recent checkpoint history"
    echo "  status                           Show latest checkpoint info"
    echo ""
    echo "Examples:"
    echo "  $0 auto-checkpoint \"Updated statusline configuration\""
    echo "  $0 domain-checkpoint \"Completed task-management domain\""
    echo "  $0 agent-checkpoint \"Deployed 8 agents successfully\""
    ;;
esac