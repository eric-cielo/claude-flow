import { createSdkMcpServer, tool } from '@anthropic-ai/claude-code';
import { z } from 'zod';
export function createMathMcpServer() {
    return createSdkMcpServer({
        name: 'math-operations',
        version: '1.0.0',
        tools: [
            tool({
                name: 'add',
                description: 'Add two numbers together',
                parameters: z.object({
                    a: z.number().describe('First number'),
                    b: z.number().describe('Second number')
                }),
                execute: async ({ a, b })=>{
                    return {
                        result: a + b
                    };
                }
            }),
            tool({
                name: 'multiply',
                description: 'Multiply two numbers',
                parameters: z.object({
                    a: z.number().describe('First number'),
                    b: z.number().describe('Second number')
                }),
                execute: async ({ a, b })=>{
                    return {
                        result: a * b
                    };
                }
            }),
            tool({
                name: 'factorial',
                description: 'Calculate factorial of a number',
                parameters: z.object({
                    n: z.number().int().min(0).describe('Number to calculate factorial of')
                }),
                execute: async ({ n })=>{
                    let result = 1;
                    for(let i = 2; i <= n; i++){
                        result *= i;
                    }
                    return {
                        result
                    };
                }
            })
        ]
    });
}
export function createSessionMcpServer() {
    const sessions = new Map();
    return createSdkMcpServer({
        name: 'session-manager',
        version: '1.0.0',
        tools: [
            tool({
                name: 'session_create',
                description: 'Create a new session with initial data',
                parameters: z.object({
                    sessionId: z.string().describe('Session identifier'),
                    data: z.record(z.any()).optional().describe('Initial session data')
                }),
                execute: async ({ sessionId, data = {} })=>{
                    if (sessions.has(sessionId)) {
                        return {
                            error: 'Session already exists'
                        };
                    }
                    sessions.set(sessionId, {
                        data,
                        created: Date.now()
                    });
                    return {
                        success: true,
                        sessionId,
                        created: sessions.get(sessionId).created
                    };
                }
            }),
            tool({
                name: 'session_get',
                description: 'Get session data by ID',
                parameters: z.object({
                    sessionId: z.string().describe('Session identifier')
                }),
                execute: async ({ sessionId })=>{
                    const session = sessions.get(sessionId);
                    if (!session) {
                        return {
                            error: 'Session not found'
                        };
                    }
                    return {
                        sessionId,
                        data: session.data,
                        created: session.created
                    };
                }
            }),
            tool({
                name: 'session_update',
                description: 'Update session data (merges with existing)',
                parameters: z.object({
                    sessionId: z.string().describe('Session identifier'),
                    data: z.record(z.any()).describe('Data to merge')
                }),
                execute: async ({ sessionId, data })=>{
                    const session = sessions.get(sessionId);
                    if (!session) {
                        return {
                            error: 'Session not found'
                        };
                    }
                    session.data = {
                        ...session.data,
                        ...data
                    };
                    return {
                        success: true,
                        sessionId,
                        data: session.data
                    };
                }
            }),
            tool({
                name: 'session_delete',
                description: 'Delete a session',
                parameters: z.object({
                    sessionId: z.string().describe('Session identifier')
                }),
                execute: async ({ sessionId })=>{
                    const existed = sessions.delete(sessionId);
                    return {
                        success: existed,
                        sessionId
                    };
                }
            }),
            tool({
                name: 'session_list',
                description: 'List all active sessions',
                parameters: z.object({}),
                execute: async ()=>{
                    const sessionList = Array.from(sessions.entries()).map(([id, session])=>({
                            sessionId: id,
                            created: session.created,
                            dataKeys: Object.keys(session.data)
                        }));
                    return {
                        sessions: sessionList,
                        count: sessionList.length
                    };
                }
            })
        ]
    });
}
export function createCheckpointMcpServer() {
    const { checkpointManager } = require('./checkpoint-manager');
    return createSdkMcpServer({
        name: 'checkpoint-manager',
        version: '1.0.0',
        tools: [
            tool({
                name: 'checkpoint_create',
                description: 'Create a checkpoint for a session',
                parameters: z.object({
                    sessionId: z.string().describe('Session identifier'),
                    description: z.string().describe("Checkpoint description")
                }),
                execute: async ({ sessionId, description })=>{
                    try {
                        const checkpointId = await checkpointManager.createCheckpoint(sessionId, description);
                        return {
                            success: true,
                            checkpointId,
                            description
                        };
                    } catch (error) {
                        return {
                            success: false,
                            error: error instanceof Error ? error.message : String(error)
                        };
                    }
                }
            }),
            tool({
                name: 'checkpoint_list',
                description: 'List all checkpoints for a session',
                parameters: z.object({
                    sessionId: z.string().describe('Session identifier')
                }),
                execute: async ({ sessionId })=>{
                    const checkpoints = checkpointManager.listCheckpoints(sessionId);
                    return {
                        sessionId,
                        checkpoints: checkpoints.map((c)=>({
                                id: c.id,
                                description: c.description,
                                timestamp: c.timestamp,
                                messageCount: c.messageCount,
                                totalTokens: c.totalTokens,
                                filesModified: c.filesModified
                            })),
                        count: checkpoints.length
                    };
                }
            }),
            tool({
                name: 'checkpoint_get',
                description: 'Get checkpoint details',
                parameters: z.object({
                    checkpointId: z.string().describe('Checkpoint identifier')
                }),
                execute: async ({ checkpointId })=>{
                    const checkpoint = checkpointManager.getCheckpoint(checkpointId);
                    if (!checkpoint) {
                        return {
                            error: 'Checkpoint not found'
                        };
                    }
                    return {
                        checkpoint: {
                            id: checkpoint.id,
                            sessionId: checkpoint.sessionId,
                            description: checkpoint.description,
                            timestamp: checkpoint.timestamp,
                            messageCount: checkpoint.messageCount,
                            totalTokens: checkpoint.totalTokens,
                            filesModified: checkpoint.filesModified
                        }
                    };
                }
            }),
            tool({
                name: 'checkpoint_delete',
                description: 'Delete a checkpoint',
                parameters: z.object({
                    checkpointId: z.string().describe('Checkpoint identifier')
                }),
                execute: async ({ checkpointId })=>{
                    try {
                        await checkpointManager.deleteCheckpoint(checkpointId);
                        return {
                            success: true,
                            checkpointId
                        };
                    } catch (error) {
                        return {
                            success: false,
                            error: error instanceof Error ? error.message : String(error)
                        };
                    }
                }
            }),
            tool({
                name: 'checkpoint_diff',
                description: 'Compare two checkpoints',
                parameters: z.object({
                    fromId: z.string().describe('From checkpoint ID'),
                    toId: z.string().describe('To checkpoint ID')
                }),
                execute: async ({ fromId, toId })=>{
                    try {
                        const diff = checkpointManager.getCheckpointDiff(fromId, toId);
                        return {
                            success: true,
                            diff
                        };
                    } catch (error) {
                        return {
                            success: false,
                            error: error instanceof Error ? error.message : String(error)
                        };
                    }
                }
            })
        ]
    });
}
export function createQueryControlMcpServer() {
    const { queryController } = require('./query-control');
    return createSdkMcpServer({
        name: 'query-control',
        version: '1.0.0',
        tools: [
            tool({
                name: 'query_pause_request',
                description: 'Request a query to pause at next safe point',
                parameters: z.object({
                    sessionId: z.string().describe('Session identifier')
                }),
                execute: async ({ sessionId })=>{
                    queryController.requestPause(sessionId);
                    return {
                        success: true,
                        sessionId,
                        status: 'pause_requested'
                    };
                }
            }),
            tool({
                name: 'query_pause_cancel',
                description: 'Cancel a pause request',
                parameters: z.object({
                    sessionId: z.string().describe('Session identifier')
                }),
                execute: async ({ sessionId })=>{
                    queryController.cancelPauseRequest(sessionId);
                    return {
                        success: true,
                        sessionId,
                        status: 'pause_cancelled'
                    };
                }
            }),
            tool({
                name: 'query_paused_list',
                description: 'List all paused queries',
                parameters: z.object({}),
                execute: async ()=>{
                    const paused = queryController.listPausedQueries();
                    return {
                        paused,
                        count: paused.length
                    };
                }
            }),
            tool({
                name: 'query_paused_get',
                description: 'Get paused query state',
                parameters: z.object({
                    sessionId: z.string().describe('Session identifier')
                }),
                execute: async ({ sessionId })=>{
                    const state = queryController.getPausedState(sessionId);
                    if (!state) {
                        return {
                            error: 'Paused query not found'
                        };
                    }
                    return {
                        sessionId,
                        pausePointMessageId: state.pausePointMessageId,
                        pausedAt: state.pausedAt,
                        messageCount: state.messages.length
                    };
                }
            }),
            tool({
                name: 'query_metrics',
                description: 'Get query control metrics',
                parameters: z.object({}),
                execute: async ()=>{
                    const metrics = queryController.getMetrics();
                    return {
                        metrics: {
                            totalPauses: metrics.totalPauses,
                            totalResumes: metrics.totalResumes,
                            averagePauseDuration: metrics.averagePauseDuration,
                            longestPause: metrics.longestPause
                        }
                    };
                }
            })
        ]
    });
}
export { createMathMcpServer, createSessionMcpServer, createCheckpointMcpServer, createQueryControlMcpServer };

//# sourceMappingURL=in-process-mcp.js.map