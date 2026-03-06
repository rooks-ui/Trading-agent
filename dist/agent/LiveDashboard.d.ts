import { MultiAgentManager } from './MultiAgentManager';
import { ChainlinkPriceAdapter } from '../protocols/ChainlinkPriceAdapter';
/**
 * LIVE DASHBOARD - FIXED VERSION
 *
 * Real-time CLI visualization showing all agents and metrics
 */
export declare class LiveDashboard {
    private agentManager;
    private priceAdapter;
    private isRunning;
    private updateInterval;
    constructor(agentManager: MultiAgentManager, priceAdapter: ChainlinkPriceAdapter);
    /**
     * Start the dashboard
     */
    start(): Promise<void>;
    /**
     * Stop the dashboard
     */
    stop(): void;
    /**
     * Main render loop
     */
    private render;
    /**
     * Render header with title
     */
    private renderHeader;
    /**
     * Render current market prices
     */
    private renderMarketData;
    /**
     * Render summary of all agents
     */
    private renderAgentsSummary;
    /**
     * Render portfolio summary
     */
    private renderPortfolioSummary;
    /**
     * Render footer with controls
     */
    private renderFooter;
}
//# sourceMappingURL=LiveDashboard.d.ts.map