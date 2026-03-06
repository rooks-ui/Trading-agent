import { Connection } from '@solana/web3.js';
import { WalletManager } from '../wallet/WalletManager';
export interface AgentConfig {
    agentId: string;
    connection: Connection;
    walletManager: WalletManager;
    updateIntervalMs: number;
}
/**
 * Autonomous Trading Agent
 *
 * This is the MAIN LOOP of the system:
 * 1. Check market prices
 * 2. Decide: buy, sell, or hold?
 * 3. Execute the trade automatically
 * 4. Repeat
 *
 * All without human interaction!
 */
export declare class AutonomousAgent {
    private agentId;
    private walletManager;
    private strategy;
    private orcaAdapter;
    private marketSimulator;
    private updateIntervalMs;
    private isRunning;
    private agentManager;
    private tradeHistory;
    constructor(config: AgentConfig & {
        agentManager?: any;
    });
    /**
     * Start the autonomous trading loop
     *
     * This runs forever (until you press Ctrl+C)
     * It continuously:
     * 1. Checks market
     * 2. Makes decision
     * 3. Executes trade
     * 4. Waits
     * 5. Repeat
     */
    start(): Promise<void>;
    /**
     * Stop the agent
     */
    stop(): void;
    /**
     * One complete cycle of the autonomous trading loop
     *
     * This happens repeatedly:
     */
    private autonomousStep;
    /**
     * Actually execute the trade
     */
    private executeAction;
    /**
     * Display the market update
     */
    private logMarketUpdate;
    /**
     * Display the decision made
     */
    private logDecision;
    /**
     * Print summary when shutting down
     */
    private printSummary;
    /**
     * Helper function to wait
     */
    private sleep;
}
//# sourceMappingURL=AutonomousAgent.d.ts.map