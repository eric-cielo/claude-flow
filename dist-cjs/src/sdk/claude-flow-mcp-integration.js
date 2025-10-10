import { query } from '@anthropic-ai/claude-code';
import { RealSessionForking } from './session-forking';
import { RealQueryController } from './query-control';
import { RealCheckpointManager } from './checkpoint-manager';
import { createMathMcpServer, createSessionMcpServer, createCheckpointMcpServer, createQueryControlMcpServer } from './in-process-mcp';
export class IntegratedClaudeFlowSession {
    forking;
    controller;
    checkpointManager;
    config;
    constructor(config = {}){
        this.config = config;
        if (config.enableSessionForking) {
            this.forking = new RealSessionForking();
        }
        if (config.enableQueryControl) {
            this.controller = new RealQueryController();
        }
        if (config.enableCheckpoints) {
            this.checkpointManager = new RealCheckpointManager({
                autoCheckpointInterval: config.checkpointInterval || 10
            });
        }
    }
    async createIntegratedQuery(prompt, sessionId, options = {}) {
        const mcpServers = {};
        if (this.config.inProcessServers?.math) {
            mcpServers.math = createMathMcpServer();
        }
        if (this.config.inProcessServers?.session) {
            mcpServers.session = createSessionMcpServer();
        }
        if (this.config.inProcessServers?.checkpoint) {
            mcpServers.checkpoint = createCheckpointMcpServer();
        }
        if (this.config.inProcessServers?.queryControl) {
            mcpServers.queryControl = createQueryControlMcpServer();
        }
        const integratedQuery = query({
            prompt,
            options: {
                ...options,
                mcpServers: Object.keys(mcpServers).length > 0 ? mcpServers : undefined
            }
        });
        if (this.forking) {
            await this.forking.trackSession(sessionId, integratedQuery);
        }
        if (this.checkpointManager && this.config.enableCheckpoints) {
            await this.checkpointManager.trackSession(sessionId, integratedQuery, true);
        }
        return integratedQuery;
    }
    async forkWithMcpCoordination(baseSessionId, forkDescription) {
        if (!this.forking) {
            throw new Error('Session forking not enabled');
        }
        const fork = await this.forking.fork(baseSessionId, {});
        if (this.checkpointManager) {
            await this.checkpointManager.createCheckpoint(baseSessionId, `Fork created: ${forkDescription}`);
        }
        return fork;
    }
    async pauseWithCheckpoint(activeQuery, sessionId, originalPrompt, checkpointDescription) {
        if (!this.controller) {
            throw new Error('Query control not enabled');
        }
        this.controller.requestPause(sessionId);
        const pausePointId = await this.controller.pauseQuery(activeQuery, sessionId, originalPrompt, {});
        if (this.checkpointManager) {
            await this.checkpointManager.createCheckpoint(sessionId, checkpointDescription || `Paused at ${pausePointId}`);
        }
        return pausePointId;
    }
    async resumeFromCheckpoint(checkpointId, continuePrompt) {
        if (!this.checkpointManager) {
            throw new Error('Checkpoints not enabled');
        }
        return await this.checkpointManager.rollbackToCheckpoint(checkpointId, continuePrompt);
    }
    getMetrics() {
        return {
            queryControl: this.controller?.getMetrics(),
            activeSessions: this.forking?.getActiveSessions(),
            checkpoints: this.checkpointManager ? {
                enabled: true
            } : {
                enabled: false
            }
        };
    }
}
export async function exampleClaudeFlowMcpWithSdk() {
    const session = new IntegratedClaudeFlowSession({
        enableSessionForking: true,
        enableQueryControl: true,
        enableCheckpoints: true,
        checkpointInterval: 10,
        mcpToolsConfig: {
            swarmTopology: 'mesh',
            maxAgents: 8,
            enableNeural: true,
            enableMemory: true
        },
        inProcessServers: {
            math: true,
            session: true,
            checkpoint: true,
            queryControl: true
        }
    });
    const mainQuery = await session.createIntegratedQuery(`
    Initialize a mesh swarm with 8 agents using Claude Flow MCP tools.
    Then use the math MCP server to calculate factorial of 10.
    Store results in session and create a checkpoint.
    `, 'integrated-session', {});
    console.log('Created integrated query with:');
    console.log('- SDK: Session forking, checkpoints, query control');
    console.log('- In-process MCP: math, session, checkpoint, queryControl');
    console.log('- Claude Flow MCP tools: swarm_init, agent_spawn, etc.');
    const fork1 = await session.forkWithMcpCoordination('integrated-session', 'Try hierarchical topology');
    console.log('Forked session:', fork1.sessionId);
    if (session['checkpointManager']) {
        const cp = await session['checkpointManager'].createCheckpoint('integrated-session', 'Before swarm initialization');
        console.log('Checkpoint created:', cp);
    }
    const metrics = session.getMetrics();
    console.log('Metrics:', metrics);
}
export function exampleNpxIntegration() {
    console.log(`
╔════════════════════════════════════════════════════════════╗
║  Claude Flow NPX + SDK Integration                         ║
╚════════════════════════════════════════════════════════════╝

# Install Claude Flow MCP server
claude mcp add claude-flow npx claude-flow@alpha mcp start

# Optional: Add ruv-swarm for enhanced coordination
claude mcp add ruv-swarm npx ruv-swarm mcp start

# Now use SDK features WITH MCP tools:

## 1. Session Forking + Swarm Coordination
import { query } from '@anthropic-ai/claude-code';
import { RealSessionForking } from './sdk/session-forking';

const forking = new RealSessionForking();
const q = query({
  prompt: 'Use mcp__claude-flow__swarm_init to create mesh topology',
  options: {
    // MCP tools are auto-available via 'claude mcp add'
  }
});

await forking.trackSession('swarm-session', q);
const fork = await forking.fork('swarm-session');

## 2. Checkpoints + Neural Training
import { RealCheckpointManager } from './sdk/checkpoint-manager';

const manager = new RealCheckpointManager();
const q = query({
  prompt: 'Use mcp__claude-flow__neural_train to train patterns',
});

await manager.trackSession('neural-session', q, true);
const cp = await manager.createCheckpoint('neural-session', 'Before training');

// Train neural patterns with Claude Flow MCP
// Then rollback if needed:
await manager.rollbackToCheckpoint(cp);

## 3. Query Control + Task Orchestration
import { RealQueryController } from './sdk/query-control';

const controller = new RealQueryController();
const q = query({
  prompt: \`
    Use mcp__claude-flow__task_orchestrate to:
    - Break down complex task
    - Distribute to agents
    - Monitor progress
  \`,
});

// Pause if needed
controller.requestPause('task-session');
const pauseId = await controller.pauseQuery(q, 'task-session', 'Task', {});

// Resume later
const resumed = await controller.resumeQuery('task-session');

## 4. In-Process MCP + Claude Flow MCP Together
import { createMathMcpServer } from './sdk/in-process-mcp';

const q = query({
  prompt: \`
    Use math server to calculate factorial.
    Use mcp__claude-flow__memory_usage to store result.
    Use mcp__claude-flow__agent_spawn to process result.
  \`,
  options: {
    mcpServers: {
      math: createMathMcpServer(), // In-process (fast!)
      // claude-flow MCP tools auto-available
    }
  }
});

╔════════════════════════════════════════════════════════════╗
║  Key Benefits:                                             ║
║  ✅ SDK = In-process, zero overhead                       ║
║  ✅ MCP tools = Coordination, neural, swarms              ║
║  ✅ Together = Maximum power and flexibility              ║
╚════════════════════════════════════════════════════════════╝
  `);
}
export { IntegratedClaudeFlowSession };

//# sourceMappingURL=claude-flow-mcp-integration.js.map