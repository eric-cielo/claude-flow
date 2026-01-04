# Claude Code Configuration - Agentic Flow

## 🚨 CRITICAL: CONCURRENT EXECUTION & FILE MANAGEMENT

**ABSOLUTE RULES**:
1. ALL operations MUST be concurrent/parallel in a single message
2. **NEVER save working files, text/mds and tests to the root folder**
3. ALWAYS organize files in appropriate subdirectories
4. **USE CLAUDE CODE'S TASK TOOL** for spawning agents concurrently, not just MCP

### ⚡ GOLDEN RULE: "1 MESSAGE = ALL RELATED OPERATIONS"

**MANDATORY PATTERNS:**
- **TodoWrite**: ALWAYS batch ALL todos in ONE call (5-10+ todos minimum)
- **Task tool (Claude Code)**: ALWAYS spawn ALL agents in ONE message with full instructions
- **File operations**: ALWAYS batch ALL reads/writes/edits in ONE message
- **Bash commands**: ALWAYS batch ALL terminal operations in ONE message
- **Memory operations**: ALWAYS batch ALL memory store/retrieve in ONE message

### 🎯 CRITICAL: Claude Code Task Tool for Agent Execution

**Claude Code's Task tool is the PRIMARY way to spawn agents:**
```javascript
// ✅ CORRECT: Use Claude Code's Task tool for parallel agent execution
[Single Message]:
  Task("Research agent", "Analyze requirements and patterns...", "researcher")
  Task("Coder agent", "Implement core features...", "coder")
  Task("Tester agent", "Create comprehensive tests...", "tester")
  Task("Reviewer agent", "Review code quality...", "reviewer")
  Task("Architect agent", "Design system architecture...", "system-architect")
```

**MCP tools are ONLY for coordination setup:**
- `mcp__claude-flow__swarm_init` - Initialize coordination topology
- `mcp__claude-flow__agent_spawn` - Define agent types for coordination
- `mcp__claude-flow__task_orchestrate` - Orchestrate high-level workflows

### 📁 File Organization Rules

**NEVER save to root folder. Use these directories:**
- `/src` - Source code files
- `/tests` - Test files
- `/docs` - Documentation and markdown files
- `/config` - Configuration files
- `/scripts` - Utility scripts
- `/examples` - Example code

## 🚀 Quick Start

```bash
# Start MCP server for Claude Code integration
npx agentic-flow@alpha mcp start

# Run an agent directly
npx agentic-flow@alpha --agent coder --task "Your task here"

# List available agents
npx agentic-flow@alpha --list
```

## 🚀 Available Agents (54+ Total)

### 🆕 V3 Specialized Swarm Agents
**15-Agent Concurrent Implementation:**
- `queen-coordinator` - V3 orchestration & GitHub issue management
- `security-architect` - Security architecture & threat modeling
- `security-auditor` - CVE remediation & security testing
- `memory-specialist` - AgentDB unification (150x-12,500x faster)
- `swarm-specialist` - Unified coordination engine
- `integration-architect` - agentic-flow@alpha deep integration
- `performance-engineer` - 2.49x-7.47x optimization targets
- `core-architect` - Domain-driven design restructure
- `test-architect` - TDD London School methodology
- `project-coordinator` - Cross-domain coordination

### Core Development
`coder`, `reviewer`, `tester`, `planner`, `researcher`

### Swarm Coordination
`hierarchical-coordinator`, `mesh-coordinator`, `adaptive-coordinator`, `collective-intelligence-coordinator`, `swarm-memory-manager`

### Consensus & Distributed
`byzantine-coordinator`, `raft-manager`, `gossip-coordinator`, `consensus-builder`, `crdt-synchronizer`, `quorum-manager`, `security-manager`

### Performance & Optimization
`perf-analyzer`, `performance-benchmarker`, `task-orchestrator`, `memory-coordinator`, `smart-agent`

### GitHub & Repository
`github-modes`, `pr-manager`, `code-review-swarm`, `issue-tracker`, `release-manager`, `workflow-automation`, `project-board-sync`, `repo-architect`, `multi-repo-swarm`

### SPARC Methodology
`sparc-coord`, `sparc-coder`, `specification`, `pseudocode`, `architecture`, `refinement`

### Specialized Development
`backend-dev`, `mobile-dev`, `ml-developer`, `cicd-engineer`, `api-docs`, `system-architect`, `code-analyzer`, `base-template-generator`

## 🎯 Claude Code vs MCP Tools

### Claude Code Handles ALL EXECUTION:
- **Task tool**: Spawn and run agents concurrently for actual work
- File operations (Read, Write, Edit, MultiEdit, Glob, Grep)
- Code generation and programming
- Bash commands and system operations
- Implementation work
- Project navigation and analysis
- TodoWrite and task management
- Git operations
- Package management
- Testing and debugging

### MCP Tools ONLY COORDINATE:
- Swarm initialization (topology setup)
- Agent type definitions (coordination patterns)
- Task orchestration (high-level planning)
- Memory management
- Neural features
- Performance tracking
- GitHub integration

**KEY**: MCP coordinates the strategy, Claude Code's Task tool executes with real agents.

## MCP Tool Categories

### Coordination
`swarm_init`, `agent_spawn`, `task_orchestrate`

### Monitoring
`swarm_status`, `agent_list`, `agent_metrics`, `task_status`, `task_results`

### Memory & Neural
`memory_usage`, `neural_status`, `neural_train`, `neural_patterns`

### GitHub Integration
`github_swarm`, `repo_analyze`, `pr_enhance`, `issue_triage`, `code_review`

## 🧠 Self-Learning Hooks System

### Available Hooks Commands:
```bash
# Before editing - get context and agent suggestions
npx agentic-flow@alpha hooks pre-edit <filePath>

# After editing - record outcome for learning
npx agentic-flow@alpha hooks post-edit <filePath> --success true

# Before commands - assess risk
npx agentic-flow@alpha hooks pre-command "<command>"

# After commands - record outcome
npx agentic-flow@alpha hooks post-command "<command>" --success true

# Route task to optimal agent using learned patterns
npx agentic-flow@alpha hooks route "<task description>"

# Explain routing decision with transparency
npx agentic-flow@alpha hooks explain "<task description>"

# Bootstrap intelligence from repository
npx agentic-flow@alpha hooks pretrain

# Generate optimized agent configs from pretrain data
npx agentic-flow@alpha hooks build-agents

# View learning metrics dashboard
npx agentic-flow@alpha hooks metrics

# Transfer patterns from another project
npx agentic-flow@alpha hooks transfer <sourceProject>

# RuVector intelligence (SONA, MoE, HNSW 150x faster)
npx agentic-flow@alpha hooks intelligence
```

### Pretraining System (4-Step Pipeline):
1. **RETRIEVE** - Top-k memory injection with MMR diversity
2. **JUDGE** - LLM-as-judge trajectory evaluation
3. **DISTILL** - Extract strategy memories from trajectories
4. **CONSOLIDATE** - Dedup, detect contradictions, prune old patterns

## Performance Benefits

- **84.8% SWE-Bench solve rate**
- **32.3% token reduction**
- **2.8-4.4x speed improvement**
- **27+ neural models**

## Advanced Features (v2.0.0)

- 🚀 Automatic Topology Selection
- ⚡ Parallel Execution (2.8-4.4x speed)
- 🧠 Neural Training
- 📊 Bottleneck Analysis
- 🤖 Smart Auto-Spawning
- 🛡️ Self-Healing Workflows
- 💾 Cross-Session Memory
- 🔗 GitHub Integration

## 🆚 V3 Development Guide

### 🎯 V3 Implementation Strategy

**Based on 10 Architecture Decision Records (ADRs):**
- **ADR-001**: Adopt agentic-flow as core foundation (eliminate 10,000+ duplicate lines)
- **ADR-002**: Domain-Driven Design structure (bounded contexts)
- **ADR-003**: Single coordination engine (unified SwarmCoordinator)
- **ADR-004**: Plugin-based architecture (microkernel pattern)
- **ADR-005**: MCP-first API design (consistent interfaces)
- **ADR-006**: Unified memory service (AgentDB integration)
- **ADR-007**: Event sourcing for state changes (audit trail)
- **ADR-008**: Vitest over Jest (10x faster testing)
- **ADR-009**: Hybrid memory backend default (SQLite + AgentDB)
- **ADR-010**: Remove Deno support (Node.js 20+ focus)

### 🛠️ V3 Agent Usage Patterns

**15-Agent Concurrent Swarm Commands:**
```bash
# Initialize v3 swarm (hierarchical mesh)
npx agentic-flow@alpha hooks init --v3-mode

# Spawn Queen Coordinator (manages all 15 agents)
npx agentic-flow@alpha agent spawn queen-coordinator --id 1

# Security Domain (Critical Priority - Agents #2-4)
npx agentic-flow@alpha agent spawn security-architect --id 2 &
npx agentic-flow@alpha agent spawn security-auditor --cve-focus &
npx agentic-flow@alpha agent spawn test-architect --security-tdd &

# Core Domain (Agents #5-9)
npx agentic-flow@alpha agent spawn core-architect --ddd-patterns &
npx agentic-flow@alpha agent spawn memory-specialist --agentdb-integration &
npx agentic-flow@alpha agent spawn swarm-specialist --unified-coordinator &

# Integration & Performance (Agents #10-15)
npx agentic-flow@alpha agent spawn integration-architect --agentic-flow-alpha &
npx agentic-flow@alpha agent spawn performance-engineer --2.49x-target &

# Wait for all agents to complete phase
wait
```

### 📊 V3 Performance Targets
- **Flash Attention**: 2.49x-7.47x speedup
- **AgentDB Search**: 150x-12,500x improvement
- **Memory Reduction**: 50-75%
- **Code Reduction**: <5,000 lines (vs 15,000+)
- **Startup Time**: <500ms
- **SONA Learning**: <0.05ms adaptation

### 🏗️ V3 Domain Structure
```
src/
├── agent-lifecycle/      # Bounded Context 1
│   ├── domain/          # Business logic
│   ├── application/     # Use cases
│   ├── infrastructure/  # Persistence
│   └── api/            # CLI, MCP interfaces
├── task-execution/      # Bounded Context 2
├── memory-management/   # Bounded Context 3
├── coordination/        # Bounded Context 4
├── shared-kernel/       # Shared utilities
└── infrastructure/      # Cross-cutting concerns
```

### 🔧 V3 Development Commands
```bash
# V3-specific agent builds
npx agentic-flow@alpha hooks build-agents --focus "v3-implementation"

# Security-first approach
npx agentic-flow@alpha hooks build-agents --focus "security"

# Performance optimization
npx agentic-flow@alpha hooks build-agents --focus "performance"

# Route tasks to optimal v3 agents
npx agentic-flow@alpha hooks route "Implement unified memory service for v3"

# Monitor v3 swarm performance
npx agentic-flow@alpha hooks metrics --v3-dashboard
```

## 🏗️ V3 Module Constellation Architecture

### **Modular Design Philosophy**
V3 implements a **constellation of @claude-flow modules** in `/v3/module-names/` for maximum flexibility, security, and cross-platform compatibility.

### **Module Structure**
```
v3/
├── @claude-flow/security/          # Security module (CVE fixes, patterns)
├── @claude-flow/memory/            # AgentDB unification module
├── @claude-flow/integration/       # agentic-flow@alpha integration
├── @claude-flow/performance/       # Optimization & benchmarking
├── @claude-flow/swarm/             # 15-agent coordination
├── @claude-flow/cli/               # CLI modernization
├── @claude-flow/neural/            # SONA learning integration
├── @claude-flow/testing/           # TDD London School framework
├── @claude-flow/deployment/        # Release & CI/CD
└── @claude-flow/shared/            # Shared utilities & types
```

### **Cross-Platform Module Commands**

#### **Windows (PowerShell/CMD)**
```powershell
# Security module
npx @claude-flow/security@latest audit --platform windows
npm run security:scan --if-present

# Memory module
npx @claude-flow/memory@latest unify --backend agentdb
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Integration module
npx @claude-flow/integration@latest --agentic-flow-version alpha
$env:CLAUDE_FLOW_MODE = "integration"
```

#### **macOS (Bash/Zsh)**
```bash
# Security module
npx @claude-flow/security@latest audit --platform darwin
export CLAUDE_FLOW_SECURITY_MODE="strict"

# Memory module
npx @claude-flow/memory@latest unify --backend agentdb
export CLAUDE_FLOW_MEMORY_PATH="./data"

# Integration module
npx @claude-flow/integration@latest --agentic-flow-version alpha
export CLAUDE_FLOW_MODE="integration"
```

#### **Linux (Bash)**
```bash
# Security module
npx @claude-flow/security@latest audit --platform linux
export CLAUDE_FLOW_SECURITY_MODE="strict"

# Memory module
npx @claude-flow/memory@latest unify --backend agentdb
export CLAUDE_FLOW_MEMORY_PATH="./data"

# Performance module
npx @claude-flow/performance@latest benchmark --target "2.49x-7.47x"
ulimit -n 65536  # Increase file descriptor limit
```

### **Module Installation & Usage**

#### **Individual Module Installation**
```bash
# Install specific modules
npm install @claude-flow/security@latest
npm install @claude-flow/memory@latest
npm install @claude-flow/integration@latest

# Or install all v3 modules
npm install @claude-flow/v3-complete@latest
```

#### **Module Composition**
```typescript
// v3/main.ts - Module orchestration
import { SecurityModule } from '@claude-flow/security';
import { MemoryModule } from '@claude-flow/memory';
import { IntegrationModule } from '@claude-flow/integration';
import { PerformanceModule } from '@claude-flow/performance';
import { SwarmModule } from '@claude-flow/swarm';

class V3ClaudeFlow {
  constructor() {
    this.security = new SecurityModule({ strict: true });
    this.memory = new MemoryModule({ backend: 'agentdb' });
    this.integration = new IntegrationModule({
      agentic: { version: 'alpha' }
    });
    this.performance = new PerformanceModule({
      targets: { flashAttention: '2.49x-7.47x' }
    });
    this.swarm = new SwarmModule({
      topology: 'hierarchical-mesh',
      agents: 15
    });
  }

  async initialize(): Promise<void> {
    // Initialize in dependency order
    await this.security.initialize();
    await this.memory.initialize();
    await this.integration.initialize();
    await this.performance.initialize();
    await this.swarm.initialize();
  }
}
```

## 🛡️ V3 Security Guidelines

### **Security-First Development**
```bash
# Pre-commit security checks (all platforms)
npm run security:pre-commit
npx @claude-flow/security audit --strict

# CVE scanning
npm audit --audit-level high
npx @claude-flow/security cve-scan --fix-critical
```

### **Environment-Specific Security**

#### **Windows Security**
```powershell
# Enable Windows Defender scanning
Add-MpPreference -ExclusionPath ".\node_modules" -Force
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Windows-specific security checks
npx @claude-flow/security@latest --platform windows --check-acl
Get-Acl -Path ".\v3" | Format-List
```

#### **macOS Security**
```bash
# macOS keychain integration
security add-generic-password -a claude-flow -s claude-flow-v3 -w
export CLAUDE_FLOW_KEYCHAIN="claude-flow-v3"

# macOS-specific security
npx @claude-flow/security@latest --platform darwin --check-gatekeeper
codesign --verify --deep ./v3/
```

#### **Linux Security**
```bash
# SELinux/AppArmor compatibility
npx @claude-flow/security@latest --platform linux --check-selinux
sestatus # Check SELinux status

# File permissions security
chmod 750 ./v3/
chown -R $USER:$USER ./v3/
```

### **Secure Module Configuration**
```typescript
// v3/config/security.ts
export const securityConfig = {
  // Input validation
  validation: {
    maxInputSize: 10000,
    allowedChars: /^[a-zA-Z0-9._\-\s]+$/,
    sanitizeHtml: true
  },

  // Path security
  paths: {
    allowedDirectories: ['./v3/', './src/', './tests/'],
    blockedPatterns: ['../', '~/', '/etc/', '/tmp/'],
    maxPathLength: 255
  },

  // Command execution
  execution: {
    shell: false,
    timeout: 30000,
    allowedCommands: ['npm', 'npx', 'node', 'git'],
    blockedCommands: ['rm', 'del', 'format', 'dd']
  },

  // Network security
  network: {
    allowedHosts: ['api.anthropic.com', 'github.com'],
    requireHttps: true,
    timeoutMs: 10000
  },

  // Memory security
  memory: {
    maxHeapSize: '2GB',
    enableGC: true,
    clearSensitiveData: true
  }
};
```

### **Credential Management**
```bash
# Environment-specific credential setup
## Windows
setx CLAUDE_FLOW_API_KEY "your-secure-key"
setx CLAUDE_FLOW_ENV "production"

## macOS/Linux
export CLAUDE_FLOW_API_KEY="your-secure-key"
export CLAUDE_FLOW_ENV="production"

# Secure credential validation
npx @claude-flow/security validate-credentials --env production
```

## 🌍 Multi-Environment Support

### **Platform Detection & Adaptation**
```typescript
// v3/utils/platform.ts
export class PlatformAdapter {
  static detect(): 'windows' | 'darwin' | 'linux' {
    return process.platform as any;
  }

  static getCommands() {
    switch (this.detect()) {
      case 'windows':
        return {
          shell: 'powershell.exe',
          npm: 'npm.cmd',
          npx: 'npx.cmd'
        };
      case 'darwin':
      case 'linux':
        return {
          shell: '/bin/bash',
          npm: 'npm',
          npx: 'npx'
        };
    }
  }

  static getPaths() {
    const platform = this.detect();
    return {
      home: platform === 'windows' ? process.env.USERPROFILE : process.env.HOME,
      sep: platform === 'windows' ? '\\' : '/',
      config: platform === 'windows'
        ? path.join(process.env.APPDATA!, 'claude-flow')
        : path.join(process.env.HOME!, '.claude-flow')
    };
  }
}
```

### **Cross-Platform Module Scripts**
```json
// package.json - Cross-platform scripts
{
  "scripts": {
    "v3:security": "npx @claude-flow/security audit",
    "v3:security:win": "powershell -Command \"npx @claude-flow/security audit --platform windows\"",
    "v3:security:unix": "npx @claude-flow/security audit --platform $(uname -s | tr '[:upper:]' '[:lower:]')",

    "v3:memory": "npx @claude-flow/memory unify --backend agentdb",
    "v3:memory:win": "set CLAUDE_FLOW_MEMORY_PATH=.\\data && npm run v3:memory",
    "v3:memory:unix": "CLAUDE_FLOW_MEMORY_PATH=./data npm run v3:memory",

    "v3:performance": "npx @claude-flow/performance benchmark",
    "v3:performance:win": "powershell -Command \"npx @claude-flow/performance benchmark --platform windows\"",
    "v3:performance:unix": "npx @claude-flow/performance benchmark --platform $(uname)",

    "v3:swarm": "npx @claude-flow/swarm coordinate --agents 15",
    "v3:integration": "npx @claude-flow/integration --agentic-flow-version alpha",

    "v3:full-stack": "npm-run-all --parallel v3:security v3:memory v3:integration v3:performance"
  }
}
```

### **Environment-Specific Configuration**
```typescript
// v3/config/environment.ts
export class EnvironmentConfig {
  static getConfig() {
    const platform = process.platform;
    const env = process.env.NODE_ENV || 'development';

    const baseConfig = {
      security: { strict: env === 'production' },
      memory: { backend: 'agentdb' },
      performance: { targets: { flashAttention: '2.49x-7.47x' } }
    };

    const platformConfig = {
      win32: {
        paths: { separator: '\\', config: process.env.APPDATA },
        commands: { shell: 'powershell.exe' },
        security: { useWindowsACL: true }
      },
      darwin: {
        paths: { separator: '/', config: '~/.claude-flow' },
        commands: { shell: '/bin/bash' },
        security: { useKeychain: true }
      },
      linux: {
        paths: { separator: '/', config: '~/.claude-flow' },
        commands: { shell: '/bin/bash' },
        security: { useSELinux: true }
      }
    };

    return {
      ...baseConfig,
      platform: platformConfig[platform] || platformConfig.linux
    };
  }
}
```

## 📦 V3 Module Development Workflow

### **Module Development Commands**
```bash
# Create new v3 module
npx @claude-flow/cli create-module --name "@claude-flow/my-module"

# Test module across platforms
npm run test:cross-platform
npm run test:windows    # Windows-specific tests
npm run test:darwin     # macOS-specific tests
npm run test:linux      # Linux-specific tests

# Build and publish module
npm run build:multi-platform
npm publish --tag v3-latest
```

### **Module Testing Framework**
```typescript
// v3/testing/cross-platform.test.ts
describe('V3 Cross-Platform Compatibility', () => {
  test('should work on Windows', async () => {
    if (process.platform !== 'win32') return;

    const result = await executeModule('@claude-flow/security', {
      platform: 'windows'
    });

    expect(result.success).toBe(true);
    expect(result.windowsSpecific).toBeDefined();
  });

  test('should work on macOS', async () => {
    if (process.platform !== 'darwin') return;

    const result = await executeModule('@claude-flow/security', {
      platform: 'darwin'
    });

    expect(result.success).toBe(true);
    expect(result.keychainIntegration).toBe(true);
  });

  test('should work on Linux', async () => {
    if (process.platform !== 'linux') return;

    const result = await executeModule('@claude-flow/security', {
      platform: 'linux'
    });

    expect(result.success).toBe(true);
    expect(result.linuxSpecific).toBeDefined();
  });
});
```

## Code Style & Best Practices

- **Domain-Driven Design**: Clear bounded contexts (ADR-002)
- **Modular Design**: Files under 500 lines
- **Security-First**: Address CVE-1, CVE-2, CVE-3 immediately
- **agentic-flow Integration**: Build on, don't duplicate (ADR-001)
- **Event Sourcing**: Critical state changes for audit (ADR-007)
- **TDD London School**: Mock-first approach
- **Performance Conscious**: Target 2.49x-7.47x improvements
- **Environment Safety**: Never hardcode secrets
- **Documentation**: Keep updated with ADR decisions

## Support

- Documentation: https://github.com/ruvnet/agentic-flow
- Issues: https://github.com/ruvnet/agentic-flow/issues

---

Remember: **Agentic Flow coordinates, Claude Code creates!**

# important-instruction-reminders
Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User.
Never save working files, text/mds and tests to the root folder.
