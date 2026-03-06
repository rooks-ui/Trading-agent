import { MultiAgentManager, AgentMetrics } from './MultiAgentManager';
import { ChainlinkPriceAdapter } from '../protocols/ChainlinkPriceAdapter';

/**
 * LIVE DASHBOARD - FIXED VERSION
 * 
 * Real-time CLI visualization showing all agents and metrics
 */
export class LiveDashboard {
  private agentManager: MultiAgentManager;
  private priceAdapter: ChainlinkPriceAdapter;
  private isRunning: boolean = false;
  private updateInterval: NodeJS.Timeout | null = null;

  constructor(agentManager: MultiAgentManager, priceAdapter: ChainlinkPriceAdapter) {
    this.agentManager = agentManager;
    this.priceAdapter = priceAdapter;
  }

  /**
   * Start the dashboard
   */
  async start(): Promise<void> {
    console.clear();
    this.isRunning = true;

    this.updateInterval = setInterval(async () => {
      await this.render();
    }, 1000);

    // Keep the process alive
    await new Promise<void>((resolve) => {
      process.on('SIGINT', () => {
        this.stop();
        resolve();
      });
    });
  }

  /**
   * Stop the dashboard
   */
  stop(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
    this.isRunning = false;
    console.log('\n[Dashboard] Stopped');
  }

  /**
   * Main render loop
   */
  private async render(): Promise<void> {
    try {
      console.clear();

      // Render header
      this.renderHeader();

      // Get current market data
      const marketData = await this.priceAdapter.getMarketData();

      // Render market data
      this.renderMarketData(marketData);

      // Get agent metrics
      const allMetrics = this.agentManager.getAllMetrics();

      // Render all agents
      this.renderAgentsSummary(allMetrics);

      // Render portfolio summary
      this.renderPortfolioSummary(allMetrics);

      // Render footer
      this.renderFooter();
    } catch (error) {
      // Silently handle errors during render
    }
  }

  /**
   * Render header with title
   */
  private renderHeader(): void {
    console.log(`\x1b[36m${'═'.repeat(100)}\x1b[0m`);
    console.log(
      `\x1b[1m\x1b[36m🤖 AUTONOMOUS TRADING AGENT - LIVE DASHBOARD\x1b[0m`.padEnd(80)
    );
    console.log(`\x1b[36m${'═'.repeat(100)}\x1b[0m\n`);
    
    const timestamp = new Date().toLocaleTimeString();
    console.log(`⏱️  ${timestamp}`.padEnd(50) + `📊 Agents: ${this.agentManager.getAgentCount()}`);
    console.log();
  }

  /**
   * Render current market prices
   */
  private renderMarketData(marketData: any): void {
    const trendEmoji =
      marketData.tokenB.trend === 'up'
        ? '📈'
        : marketData.tokenB.trend === 'down'
        ? '📉'
        : '➡️';

    console.log(`\x1b[33m┌─ MARKET DATA ─────────────────────────────────────────────────────────────────────────┐\x1b[0m`);
    console.log(`\x1b[33m│\x1b[0m`);
    console.log(
      `\x1b[33m│\x1b[0m  ${trendEmoji} ORCA Price: $${marketData.tokenB.price.toFixed(4).padEnd(10)} | ` +
      `Trend: ${marketData.tokenB.trend.toUpperCase().padEnd(8)} | ` +
      `Volatility: ${(marketData.tokenB.volatility * 100).toFixed(2)}%`
    );
    console.log(
      `\x1b[33m│\x1b[0m  💰 USDC Price: $${marketData.tokenA.price.toFixed(4).padEnd(10)} | ` +
      `Trend: ${marketData.tokenA.trend.toUpperCase().padEnd(8)} | ` +
      `Volatility: ${(marketData.tokenA.volatility * 100).toFixed(2)}%`
    );
    console.log(`\x1b[33m│\x1b[0m`);
    console.log(`\x1b[33m└────────────────────────────────────────────────────────────────────────────────────────┘\x1b[0m\n`);
  }

  /**
   * Render summary of all agents
   */
  private renderAgentsSummary(metrics: AgentMetrics[]): void {
    console.log(`\x1b[32m┌─ AGENTS (${metrics.length}) ──────────────────────────────────────────────────────────────────────────┐\x1b[0m`);
    console.log(`\x1b[32m│\x1b[0m`);
    
    for (let i = 0; i < metrics.length; i++) {
      const metric = metrics[i];
      const roi = ((metric.profit / metric.startingBalance) * 100).toFixed(2);
      const winRate = (metric.winRate * 100).toFixed(0);
      const status = metric.tradesExecuted > 0 ? '🟢' : '🟡';
      
      console.log(
        `\x1b[32m│\x1b[0m  ${status} \x1b[1m${metric.agentId}\x1b[0m ` +
        `Trades: ${metric.tradesExecuted.toString().padStart(3)} | ` +
        `Profit: $${metric.profit.toFixed(2).padEnd(8)} | ` +
        `ROI: ${roi.padEnd(7)}% | ` +
        `Win Rate: ${winRate}%`
      );
    }
    
    console.log(`\x1b[32m│\x1b[0m`);
    console.log(`\x1b[32m└────────────────────────────────────────────────────────────────────────────────────────┘\x1b[0m\n`);
  }

  /**
   * Render portfolio summary
   */
  private renderPortfolioSummary(metrics: AgentMetrics[]): void {
    const totalProfit = metrics.reduce((sum, m) => sum + m.profit, 0);
    const totalTrades = metrics.reduce((sum, m) => sum + m.tradesExecuted, 0);
    const totalStarting = metrics.reduce((sum, m) => sum + m.startingBalance, 0);
    const portfolioROI = ((totalProfit / totalStarting) * 100).toFixed(2);
    const avgWinRate =
      metrics.length > 0
        ? metrics.reduce((sum, m) => sum + m.winRate, 0) / metrics.length
        : 0;

    console.log(`\x1b[35m┌─ PORTFOLIO SUMMARY ────────────────────────────────────────────────────────────────────┐\x1b[0m`);
    console.log(`\x1b[35m│\x1b[0m`);
    
    const profitColor = totalProfit >= 0 ? '\x1b[32m' : '\x1b[31m';
    console.log(
      `\x1b[35m│\x1b[0m  Total Profit: ${profitColor}$${totalProfit.toFixed(2)}\x1b[0m  |  ` +
      `Total Trades: ${totalTrades}  |  ` +
      `Portfolio ROI: ${portfolioROI}%  |  ` +
      `Avg Win Rate: ${(avgWinRate * 100).toFixed(0)}%`
    );
    
    console.log(`\x1b[35m│\x1b[0m`);
    console.log(`\x1b[35m└────────────────────────────────────────────────────────────────────────────────────────┘\x1b[0m\n`);
  }

  /**
   * Render footer with controls
   */
  private renderFooter(): void {
    console.log(`\x1b[36m${'─'.repeat(100)}\x1b[0m`);
    console.log(`\x1b[90m⌨️  Controls: [Ctrl+C] Exit\x1b[0m`);
    console.log(`\x1b[36m${'═'.repeat(100)}\x1b[0m`);
  }
}