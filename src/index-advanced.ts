import { Connection } from '@solana/web3.js';
import * as dotenv from 'dotenv';
import { MultiAgentManager } from './agent/MultiAgentManager';
import { ChainlinkPriceAdapter } from './protocols/ChainlinkPriceAdapter';
import { LiveDashboard } from './agent/LiveDashboard';
// Load environment variables
dotenv.config();

async function main() {
  try {
    console.log('═══════════════════════════════════════════════════════════════════════════');
    console.log('AGENTIC TRADING AGENT');
    console.log('With Real Prices, Multiple Agents, ML Strategy & Live Dashboard');
    console.log('═══════════════════════════════════════════════════════════════════════════\n');

    // Configuration
    const RPC_URL = process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com';
    const ENCRYPTION_KEY = process.env.WALLET_ENCRYPTION_KEY;

    if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length < 32) {
      console.error('❌ Error: WALLET_ENCRYPTION_KEY must be at least 32 characters');
      process.exit(1);
    }

    // Step 1: Connect to Solana
    console.log(`Connecting to Solana devnet: ${RPC_URL}`);
    const connection = new Connection(RPC_URL, 'confirmed');
    const version = await connection.getVersion();
    console.log(`Connected! Solana version: ${version['solana-core']}\n`);

    // Step 2: Initialize price adapter (REAL PRICES)
    console.log('Initializing Chainlink Price Adapter (REAL PRICES)...');
    const priceAdapter = new ChainlinkPriceAdapter(connection);
    console.log('Price adapter ready\n');

    // Step 3: Initialize multi-agent manager
    console.log('Initializing Multi-Agent Manager...');
    const agentManager = new MultiAgentManager(connection);

    // Step 4: Create multiple autonomous agents
    console.log('\nCreating autonomous agents...');

    // Agent 1: Conservative (low risk)
    await agentManager.createAgent({
      agentId: 'conservative-bot',
      connection: connection,
      walletManager: undefined as any, // Will be created internally
      updateIntervalMs: 5000,
    });

    // Agent 2: Moderate (medium risk)
    await agentManager.createAgent({
      agentId: 'moderate-bot',
      connection: connection,
      walletManager: undefined as any,
      updateIntervalMs: 3000,
    });

    // Agent 3: Aggressive (high risk)
    await agentManager.createAgent({
      agentId: 'aggressive-bot',
      connection: connection,
      walletManager: undefined as any,
      updateIntervalMs: 2000,
    });

    console.log(`\nCreated ${agentManager.getAgentCount()} autonomous agents\n`);

    // Step 5: Initialize live dashboard
    console.log('Initializing Live Dashboard...');
    const dashboard = new LiveDashboard(agentManager, priceAdapter);
    console.log('Dashboard ready\n');

    // Step 6: Handle graceful shutdown
    process.on('SIGINT', async () => {
      console.log('\n\nShutdown signal received');
      console.log('   Stopping all agents...\n');
      await agentManager.stopAllAgents();
      process.exit(0);
    });

    // Step 7: Start everything!
    console.log('Starting all components...\n');

    // Start agents in background
    agentManager.startAllAgents().catch((error: Error) => {
      console.error('Error starting agents:', error.message);
    });

    // Start dashboard (main thread)
    await dashboard.start();

  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

// Run the application
main();