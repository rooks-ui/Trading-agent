import { Connection } from '@solana/web3.js';
import * as dotenv from 'dotenv';
import { WalletManager } from './wallet/WalletManager';
import { AutonomousAgent } from './agent/AutonomousAgent';

// Load environment variables from .env file
dotenv.config();

async function main() {
  try {
    console.log('═══════════════════════════════════════════════════════════');
    console.log('🚀 Agentic Trading Agent - Solana Autonomous Trading System');
    console.log('═══════════════════════════════════════════════════════════\n');

    // Load configuration from environment variables
    const RPC_URL = process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com';
    const ENCRYPTION_KEY = process.env.WALLET_ENCRYPTION_KEY;
    const WALLET_DIR = process.env.WALLET_DIR || './wallets';
    const AGENT_ID = process.env.AGENT_ID || 'trading-agent-1';
    const UPDATE_INTERVAL = parseInt(process.env.AGENT_UPDATE_INTERVAL || '3000');

    // Validate configuration
    if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length < 32) {
      console.error('❌ Error: WALLET_ENCRYPTION_KEY must be at least 32 characters');
      console.error('   Edit .env file and set a proper encryption key');
      process.exit(1);
    }

    // Step 1: Connect to Solana devnet
    console.log(`📡 Connecting to Solana devnet: ${RPC_URL}`);
    const connection = new Connection(RPC_URL, 'confirmed');

    // Test the connection
    const version = await connection.getVersion();
    console.log(`✓ Connected! Solana version: ${version['solana-core']}\n`);

    // Step 2: Initialize wallet
    console.log('💼 Initializing wallet...');
    const walletManager = new WalletManager({
      connection,
      walletDir: WALLET_DIR,
      encryptionKey: ENCRYPTION_KEY,
    });

    // Step 3: Create or load wallet
    if (!walletManager.walletExists()) {
      console.log('\n📝 Creating new wallet for agent...');
      await walletManager.createWallet();
      
      console.log('\n⚠️  IMPORTANT: Fund this wallet with devnet SOL to execute real trades!');
      console.log('   Devnet SOL Faucet: https://faucet.solana.com/');
      console.log('   Or use: solana airdrop 5 <pubkey> --url devnet\n');
    } else {
      console.log('\n📂 Loading existing wallet...');
      await walletManager.loadWallet();
    }

    // Step 4: Check balance
    try {
      const balance = await walletManager.getBalance();
      if (balance < 0.001) {
        console.log('⚠️  Wallet is low on SOL. Consider funding it.\n');
      }
    } catch (error) {
      console.log('⚠️  Could not check balance (wallet might not exist on-chain yet)\n');
    }

    // Step 5: Create the autonomous agent
    console.log('🤖 Creating autonomous trading agent...\n');
    const agent = new AutonomousAgent({
      agentId: AGENT_ID,
      connection,
      walletManager,
      updateIntervalMs: UPDATE_INTERVAL,
    });

    // Step 6: Handle graceful shutdown (when user presses Ctrl+C)
    process.on('SIGINT', () => {
      console.log('\n\n⛔ Shutdown signal received (Ctrl+C pressed)');
      console.log('   Stopping agent...\n');
      agent.stop();
      process.exit(0);
    });

    // Step 7: Start the autonomous trading loop
    console.log('Starting autonomous trading...\n');
    await agent.start();
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

// Run the application
main();