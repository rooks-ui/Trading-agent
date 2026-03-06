"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutonomousAgent = void 0;
const OrcaAdapter_1 = require("../protocols/OrcaAdapter");
const MarketSimulator_1 = require("../protocols/MarketSimulator");
const MLTradingStrategy_1 = require("./MLTradingStrategy");
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
class AutonomousAgent {
    constructor(config) {
        this.isRunning = false;
        this.tradeHistory = [];
        this.agentId = config.agentId;
        if (!config.walletManager) {
            throw new Error(`AutonomousAgent ${config.agentId} requires a WalletManager`);
        }
        this.walletManager = config.walletManager;
        this.agentManager = config.agentManager;
        this.updateIntervalMs = config.updateIntervalMs;
        //this.strategy = new TradingStrategy();
        this.strategy = new MLTradingStrategy_1.MLTradingStrategy();
        this.orcaAdapter = new OrcaAdapter_1.OrcaAdapter(config.connection, config.walletManager);
        this.marketSimulator = new MarketSimulator_1.MarketSimulator();
    }
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
    async start() {
        if (this.isRunning) {
            console.log(`[Agent ${this.agentId}] Already running`);
            return;
        }
        this.isRunning = true;
        console.log(`\n🤖 [Agent ${this.agentId}] Starting autonomous trading...`);
        console.log(`   Wallet: ${this.walletManager.publicKey?.toBase58()}`);
        console.log(`   Update interval: ${this.updateIntervalMs}ms`);
        console.log(`   ─────────────────────────────────\n`);
        // The main loop - runs forever
        while (this.isRunning) {
            await this.autonomousStep();
            await this.sleep(this.updateIntervalMs);
        }
    }
    /**
     * Stop the agent
     */
    stop() {
        this.isRunning = false;
        console.log(`\n[Agent ${this.agentId}] Stopped`);
        this.printSummary();
    }
    /**
     * One complete cycle of the autonomous trading loop
     *
     * This happens repeatedly:
     */
    async autonomousStep() {
        try {
            // STEP 1: Monitor the market (check prices)
            const marketData = this.marketSimulator.getMarketData();
            this.logMarketUpdate(marketData);
            // STEP 2: Make a decision (this is where the "AI" thinking happens)
            const action = await this.strategy.decideAction(marketData);
            this.logDecision(action);
            // STEP 3: Execute if it's not a HOLD
            if (action.type !== 'HOLD') {
                const signature = await this.executeAction(action, marketData.tokenB.price);
                // Update our portfolio (if we bought, we now have ORCA, etc.)
                this.strategy.updatePortfolio(action, marketData.tokenB.price);
                // Record this trade
                this.tradeHistory.push({
                    timestamp: Date.now(),
                    action,
                    signature,
                });
                if (this.agentManager) {
                    this.agentManager.updateMetrics(this.agentId, {
                        profit: 0, // Calculate if you want
                        tokensReceived: action.amount,
                        executionPrice: marketData.tokenB.price,
                    });
                }
                console.log(`✓ Trade recorded in history (total trades: ${this.tradeHistory.length})\n`);
            }
        }
        catch (error) {
            console.error(`[Agent ${this.agentId}] Error during autonomous step:`, error);
        }
    }
    /**
     * Actually execute the trade
     */
    async executeAction(action, currentPrice) {
        if (action.type === 'HOLD') {
            return 'hold';
        }
        const { tokenToSell, tokenToBuy, amount } = action;
        console.log(`\n💰 [Agent ${this.agentId}] EXECUTING TRADE:`);
        console.log(`   Action: ${action.type}`);
        console.log(`   Amount: ${amount}`);
        console.log(`   Reason: ${action.reason}`);
        // Call the Orca adapter to execute the swap
        const { signature, tokensReceived } = await this.orcaAdapter.executeSwap(tokenToSell, tokenToBuy, amount, currentPrice);
        console.log(`   Tokens Received: ${tokensReceived.toFixed(4)}`);
        console.log(`   TX Signature: ${signature}\n`);
        return signature;
    }
    /**
     * Display the market update
     */
    logMarketUpdate(marketData) {
        const { tokenB } = marketData;
        const trendEmoji = tokenB.trend === 'up' ? '📈' :
            tokenB.trend === 'down' ? '📉' :
                '➡️';
        console.log(`\n${trendEmoji} [Market Update]`);
        console.log(`   ORCA Price: $${tokenB.price.toFixed(4)}`);
        console.log(`   Trend: ${tokenB.trend}`);
        console.log(`   Volatility: ${(tokenB.volatility * 100).toFixed(2)}%`);
    }
    /**
     * Display the decision made
     */
    logDecision(action) {
        if (action.type === 'BUY') {
            console.log(`\n🟢 [Decision] BUY`);
            console.log(`   Amount: ${action.amount}`);
        }
        else if (action.type === 'SELL') {
            console.log(`\n🔴 [Decision] SELL`);
            console.log(`   Amount: ${action.amount.toFixed(4)}`);
        }
        else {
            console.log(`\n⚪ [Decision] HOLD`);
        }
        console.log(`   Reason: ${action.reason}`);
    }
    /**
     * Print summary when shutting down
     */
    printSummary() {
        const portfolio = this.strategy.getPortfolio();
        console.log(`\n${'='.repeat(50)}`);
        console.log(`Portfolio Summary for Agent ${this.agentId}`);
        console.log(`${'='.repeat(50)}`);
        console.log(`USDC Balance: ${portfolio.tokenA_balance.toFixed(2)}`);
        console.log(`ORCA Balance: ${portfolio.tokenB_balance.toFixed(4)}`);
        console.log(`Total Trades: ${this.tradeHistory.length}`);
        console.log(`${'='.repeat(50)}\n`);
    }
    /**
     * Helper function to wait
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
exports.AutonomousAgent = AutonomousAgent;
//# sourceMappingURL=AutonomousAgent.js.map