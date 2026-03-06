"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const web3_js_1 = require("@solana/web3.js");
const dotenv = __importStar(require("dotenv"));
const MultiAgentManager_1 = require("./agent/MultiAgentManager");
const ChainlinkPriceAdapter_1 = require("./protocols/ChainlinkPriceAdapter");
const LiveDashboard_1 = require("./agent/LiveDashboard");
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
        const connection = new web3_js_1.Connection(RPC_URL, 'confirmed');
        const version = await connection.getVersion();
        console.log(`Connected! Solana version: ${version['solana-core']}\n`);
        // Step 2: Initialize price adapter (REAL PRICES)
        console.log('Initializing Chainlink Price Adapter (REAL PRICES)...');
        const priceAdapter = new ChainlinkPriceAdapter_1.ChainlinkPriceAdapter(connection);
        console.log('Price adapter ready\n');
        // Step 3: Initialize multi-agent manager
        console.log('Initializing Multi-Agent Manager...');
        const agentManager = new MultiAgentManager_1.MultiAgentManager(connection);
        // Step 4: Create multiple autonomous agents
        console.log('\nCreating autonomous agents...');
        // Agent 1: Conservative (low risk)
        await agentManager.createAgent({
            agentId: 'conservative-bot',
            connection: connection,
            walletManager: undefined, // Will be created internally
            updateIntervalMs: 5000,
        });
        // Agent 2: Moderate (medium risk)
        await agentManager.createAgent({
            agentId: 'moderate-bot',
            connection: connection,
            walletManager: undefined,
            updateIntervalMs: 3000,
        });
        // Agent 3: Aggressive (high risk)
        await agentManager.createAgent({
            agentId: 'aggressive-bot',
            connection: connection,
            walletManager: undefined,
            updateIntervalMs: 2000,
        });
        console.log(`\nCreated ${agentManager.getAgentCount()} autonomous agents\n`);
        // Step 5: Initialize live dashboard
        console.log('Initializing Live Dashboard...');
        const dashboard = new LiveDashboard_1.LiveDashboard(agentManager, priceAdapter);
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
        agentManager.startAllAgents().catch((error) => {
            console.error('Error starting agents:', error.message);
        });
        // Start dashboard (main thread)
        await dashboard.start();
    }
    catch (error) {
        console.error('❌ Fatal error:', error);
        process.exit(1);
    }
}
// Run the application
main();
//# sourceMappingURL=index-advanced.js.map