import { Connection } from '@solana/web3.js';
import { WalletManager } from '../wallet/WalletManager';
import { AutonomousAgent } from './AutonomousAgent';

export interface AgentConfig {
  agentId: string;
  connection: Connection;
  walletManager: WalletManager | undefined; // Will be created if undefined
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
export class MultiAgentManager {
  private agents: Map<string, AutonomousAgent> = new Map();
  private connection: Connection;
  private wallets: Map<string, WalletManager> = new Map();
  private metrics: Map<string, AgentMetrics> = new Map();

  constructor(connection: Connection) {
    this.connection = connection;
  }

  /**
   * Create and register a new agent
   */
  async createAgent(config: AgentConfig): Promise<AutonomousAgent> {
    console.log(`\n📋 Creating Agent: ${config.agentId}`);
    
    // Create independent wallet for this agent if not provided
    let walletManager = config.walletManager;
    if (!walletManager) {
      walletManager = new WalletManager({
        connection: this.connection,
        walletDir: `./wallets/${config.agentId}`,
        encryptionKey: process.env.WALLET_ENCRYPTION_KEY!
      });

      // Create or load wallet
      if (!walletManager.walletExists()) {
        await walletManager.createWallet();
      } else {
        await walletManager.loadWallet();
      }
    }

    // Create agent
    const agent = new AutonomousAgent({
      agentId: config.agentId,
      connection: this.connection,
      walletManager,
      updateIntervalMs: config.updateIntervalMs,
      agentManager: this,
    });

    // Register agent and wallet
    this.agents.set(config.agentId, agent);
    this.wallets.set(config.agentId, walletManager);
    this.metrics.set(config.agentId, {
      agentId: config.agentId,
      startTime: Date.now(),
      tradesExecuted: 0,
      profit: 0,
      startingBalance: 100,
      currentBalance: 100,
      maxDrawdown: 0,
      winRate: 0,
    });

    console.log(`✓ Agent ${config.agentId} created successfully`);
    
    return agent;
  }

  /**
   * Start all agents simultaneously
   */
  async startAllAgents(): Promise<void> {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`🤖 STARTING ${this.agents.size} AUTONOMOUS AGENTS`);
    console.log(`${'='.repeat(60)}\n`);

    const agentPromises = Array.from(this.agents.values()).map(agent =>
      agent.start().catch((error: Error) => {
        console.error(`Agent error:`, error.message);
      })
    );

    // All agents run concurrently
    await Promise.all(agentPromises);
  }

  /**
   * Stop all agents gracefully
   */
  async stopAllAgents(): Promise<void> {
    console.log(`\n⛔ Shutting down all agents...`);
    
    for (const agent of this.agents.values()) {
      agent.stop();
    }

    this.printAggregateMetrics();
  }

  /**
   * Get metrics for a specific agent
   */
  getAgentMetrics(agentId: string): AgentMetrics | undefined {
    return this.metrics.get(agentId);
  }

  /**
   * Get all agents' metrics
   */
  getAllMetrics(): AgentMetrics[] {
    return Array.from(this.metrics.values());
  }

  /**
   * Update metrics after a trade
   */
  updateMetrics(agentId: string, tradeResult: {
    profit: number;
    tokensReceived: number;
    executionPrice: number;
  }): void {
    const metrics = this.metrics.get(agentId);
    if (!metrics) return;

    metrics.tradesExecuted++;
    metrics.profit += tradeResult.profit;
    metrics.currentBalance += tradeResult.profit;

    // Calculate drawdown
    const drawdown = metrics.startingBalance - metrics.currentBalance;
    if (drawdown > metrics.maxDrawdown) {
      metrics.maxDrawdown = drawdown;
    }

    // Calculate win rate
    if (tradeResult.profit > 0) {
      metrics.wins = (metrics.wins || 0) + 1;
    }
    metrics.winRate = metrics.wins! / metrics.tradesExecuted;
  }

  /**
   * Print summary metrics
   */
  private printAggregateMetrics(): void {
    const allMetrics = this.getAllMetrics();
    const totalProfit = allMetrics.reduce((sum, m) => sum + m.profit, 0);
    const totalTrades = allMetrics.reduce((sum, m) => sum + m.tradesExecuted, 0);
    const avgWinRate = allMetrics.length > 0
      ? allMetrics.reduce((sum, m) => sum + m.winRate, 0) / allMetrics.length
      : 0;

    console.log(`\n${'='.repeat(60)}`);
    console.log(`📊 AGGREGATE METRICS - ALL AGENTS`);
    console.log(`${'='.repeat(60)}`);
    console.log(`\nTotal Agents: ${allMetrics.length}`);
    console.log(`Total Trades: ${totalTrades}`);
    console.log(`Total Profit: ${totalProfit.toFixed(2)} USDC`);
    console.log(`Average Win Rate: ${(avgWinRate * 100).toFixed(1)}%`);
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Individual Agent Summary:`);
    console.log(`${'='.repeat(60)}\n`);

    for (const metrics of allMetrics) {
      const roi = ((metrics.profit / metrics.startingBalance) * 100).toFixed(2);
      console.log(`Agent ${metrics.agentId}`);
      console.log(`  Trades: ${metrics.tradesExecuted}`);
      console.log(`  Profit: ${metrics.profit.toFixed(2)} USDC`);
      console.log(`  ROI: ${roi}%`);
      console.log(`  Win Rate: ${(metrics.winRate * 100).toFixed(1)}%`);
      console.log(`  Max Drawdown: ${metrics.maxDrawdown.toFixed(2)} USDC\n`);
    }
  }

  /**
   * Get agent by ID
   */
  getAgent(agentId: string): AutonomousAgent | undefined {
    return this.agents.get(agentId);
  }

  /**
   * Get all agents
   */
  getAllAgents(): AutonomousAgent[] {
    return Array.from(this.agents.values());
  }

  /**
   * Get agent count
   */
  getAgentCount(): number {
    return this.agents.size;
  }
}