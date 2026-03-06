import { Connection } from '@solana/web3.js';
import { WalletManager } from '../wallet/WalletManager';
import { AutonomousAgent } from './AutonomousAgent';
export interface AgentConfig {
    agentId: string;
    connection: Connection;
    walletManager: WalletManager | undefined;
    updateIntervalMs: number;
    agentManager?: any;
}
export interface AgentMetrics {
    agentId: string;
    startTime: number;
    tradesExecuted: number;
    profit: number;
    startingBalance: number;
    currentBalance: number;
    maxDrawdown: number;
    winRate: number;
    wins?: number;
}
/**
 * Multi-Agent Manager
 *
 * Manages multiple autonomous agents
 */
export declare class MultiAgentManager {
    private agents;
    private connection;
    private wallets;
    private metrics;
    constructor(connection: Connection);
    /**
     * Create and register a new agent
     */
    createAgent(config: AgentConfig): Promise<AutonomousAgent>;
    /**
     * Start all agents simultaneously
     */
    startAllAgents(): Promise<void>;
    /**
     * Stop all agents gracefully
     */
    stopAllAgents(): Promise<void>;
    /**
     * Get metrics for a specific agent
     */
    getAgentMetrics(agentId: string): AgentMetrics | undefined;
    /**
     * Get all agents' metrics
     */
    getAllMetrics(): AgentMetrics[];
    /**
     * Update metrics after a trade
     */
    updateMetrics(agentId: string, tradeResult: {
        profit: number;
        tokensReceived: number;
        executionPrice: number;
    }): void;
    /**
     * Print summary metrics
     */
    private printAggregateMetrics;
    /**
     * Get agent by ID
     */
    getAgent(agentId: string): AutonomousAgent | undefined;
    /**
     * Get all agents
     */
    getAllAgents(): AutonomousAgent[];
    /**
     * Get agent count
     */
    getAgentCount(): number;
}
//# sourceMappingURL=MultiAgentManager.d.ts.map