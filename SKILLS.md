Agentic Wallet - Skills & Capabilities
This document describes the capabilities of the Agentic Trading Agent wallet system. Both humans and AI agents can read this to understand what the system can do.
Core Capabilities
1. Wallet Management
wallet:create
Creates a new wallet for an autonomous agent.
Usage:
INPUT:
- agentId: string (unique identifier for this agent)

OUTPUT:
- publicKey: string (base58 encoded public address)
- success: boolean
Example:
INPUT: { agentId: "trading-bot-1" }
OUTPUT: { 
  publicKey: "6mXdJ7hJvW9S...", 
  success: true 
}

wallet:load
Load an existing encrypted wallet.
Usage:
INPUT:
- walletPath: string (path to encrypted wallet file)
- encryptionKey: string (min 32 characters)

OUTPUT:
- publicKey: string (base58 encoded)
- success: boolean
- error?: string

wallet:get_balance
Check the SOL balance of a wallet.
Usage:
INPUT:
- publicKey: string (agent's public key)

OUTPUT:
- balanceSOL: number
- balanceLamports: number
- timestamp: number

2. Autonomous Trading
trading:decide_action
The AI decision engine. Analyzes market data and decides: BUY, SELL, or HOLD.
Usage:
INPUT:
- marketData: {
    tokenA: { price, trend, volatility }
    tokenB: { price, trend, volatility }
    timestamp: number
  }

OUTPUT:
- action: "BUY" | "SELL" | "HOLD"
- amount?: number (if BUY or SELL)
- reason: string
- confidence: number (0.0 to 1.0)
Example:
INPUT: {
  tokenA: { price: 1.0, trend: "stable", volatility: 0.001 },
  tokenB: { price: 0.45, trend: "down", volatility: 0.05 },
  timestamp: 1234567890
}

OUTPUT: {
  action: "BUY",
  amount: 10,
  reason: "Price dropping with high volatility. Contrarian buy signal.",
  confidence: 0.85
}
Decision Rules:

BUY when: Price drops 5%+ AND volatility > 2%

Uses 30% of available capital
Contrarian strategy


SELL when: Price rises 5%+ AND volatility > 3%

Sells 50% of holdings
Take profits strategy


HOLD when: Conditions not favorable

Wait for better opportunity



trading:execute_swap
Execute a token swap autonomously.
Usage:
INPUT:
- fromToken: "USDC" | "ORCA"
- toToken: "USDC" | "ORCA"
- amount: number
- agentId: string

OUTPUT:
- signature: string (transaction ID)
- tokensReceived: number
- executionPrice: number
- success: boolean
Example:
INPUT: {
  fromToken: "USDC",
  toToken: "ORCA",
  amount: 10,
  agentId: "trading-bot-1"
}

OUTPUT: {
  signature: "mock_sig_1234567890",
  tokensReceived: 20.5,
  executionPrice: 0.488,
  success: true
}

trading:get_portfolio
Get current portfolio state.
Usage:
INPUT:
- agentId: string

OUTPUT:
- tokenA_balance: number (USDC)
- tokenB_balance: number (ORCA)
- totalValueUSD: number
- trades_executed: number

3. Market Data
market:get_data
Get current market data (simulated or real).
Usage:
INPUT:
- tokens: ["ORCA", "USDC"]
- source: "simulator" | "oracle" (default: "simulator")

OUTPUT:
- tokenA: { price, trend, volatility }
- tokenB: { price, trend, volatility }
- timestamp: number
Trend Values:

"up" - Price increasing
"down" - Price decreasing
"stable" - Price neutral

Volatility:

0.001 = 0.1% (very stable)
0.05 = 5.0% (volatile)
0.10+ = 10%+ (very volatile)


4. Transaction Management
transaction:sign
Sign a transaction autonomously (no human approval needed).
Usage:
INPUT:
- transaction: Uint8Array (serialized transaction)
- agentId: string

OUTPUT:
- signature: string
- signed: boolean
- timestamp: number

transaction:get_history
Get transaction history for an agent.
Usage:
INPUT:
- agentId: string
- limit?: number (default: 100)

OUTPUT:
- transactions: Array<{
    signature: string
    action: "BUY" | "SELL" | "HOLD"
    timestamp: number
    amount: number
  }>
- total: number

Agent Workflow
Typical agent loop:
1. MONITOR: Call market:get_data()
   → Get current prices, trends, volatility

2. DECIDE: Call trading:decide_action(marketData)
   → Agent thinks: "What should I do?"
   → Get response: BUY, SELL, or HOLD

3. EXECUTE: If action != HOLD:
   a. Call trading:execute_swap(...)
   → Send transaction to blockchain
   → Receive signature confirmation

4. RECORD: Call transaction:get_history()
   → Track what happened
   → Learn from past trades

5. WAIT: Sleep X milliseconds

6. REPEAT: Go back to step 1

Security Capabilities
Key Management

Encryption: AES-256-CBC at rest
No Hardcoding: Keys never in code
Automatic Signing: Agents sign autonomously
No Human Intervention: Necessary for true autonomy

Transaction Safety

Validation: All transactions checked before signing
Rate Limiting: Max 10 transactions per minute per agent
Simulation: Dry-run before mainnet
Audit Trail: All actions logged


Performance Metrics
Throughput

Decision Time: < 100ms
Transaction Signing: < 50ms
Network Broadcast: ~1-2 seconds
Block Confirmation: ~5-10 seconds (on Solana)

Scalability

Agents per Wallet: Multiple (with routing)
Transactions per Day: 1000+ (rate limited)
Markets Monitored: N (extensible)


Advanced Features
Multi-Agent Support
Multiple agents can share infrastructure:
Agent1 (trading-bot-1) → Wallet Manager → Solana
Agent2 (trading-bot-2) → Wallet Manager → Solana
Agent3 (trading-bot-3) → Wallet Manager → Solana
Each agent:

Has independent decision logic
Uses shared wallet infrastructure
Maintains separate portfolio state
Executes isolated transactions

Custom Decision Engines
Replace default trading logic with:

Machine Learning models (TensorFlow.js)
Complex heuristics
External API integration
Multi-factor analysis

Real Market Integration
Replace MarketSimulator with:

Chainlink price feeds
Jupiter API (best prices)
Orca pool state queries
Custom oracle solutions


Configuration
Agent Configuration
typescriptinterface AgentConfig {
  agentId: string;          // Unique identifier
  updateIntervalMs: number; // How often to check market (default: 3000ms)
  riskLevel: number;        // 1 (conservative) to 10 (aggressive)
  tradeSize: number;        // Percentage of capital per trade (0.1 to 1.0)
  markets: string[];        // Tokens to trade
}
Wallet Configuration
typescriptinterface WalletConfig {
  walletDir: string;        // Where to store encrypted keys
  encryptionKey: string;    // Min 32 characters
  connection: Connection;   // Solana RPC endpoint
}

Limitations & Future Work
Current Limitations

Devnet Only: No mainnet trading (safety feature)
Simulated Markets: Not connected to real prices yet
Single Strategy: Only one trading algorithm
No Risk Management: No stop losses or hedging

Future Capabilities (Roadmap)

 Mainnet support (with safety guards)
 Real market price feeds
 Risk management (stop losses, position sizing)
 Portfolio rebalancing
 Multiple strategy selection
 Reinforcement learning
 Natural language agent instructions
 Cross-protocol arbitrage
 MEV awareness
 Gas optimization


Integration Examples
Python Agent
pythonimport requests

def make_decision():
    market_data = requests.get('http://localhost:3000/market/data').json()
    decision = requests.post(
        'http://localhost:3000/trading/decide',
        json=market_data
    ).json()
    return decision
JavaScript Agent
javascriptconst agent = require('./autonomous-agent');

async function run() {
  const marketData = await agent.getMarketData();
  const action = agent.decideAction(marketData);
  
  if (action.type !== 'HOLD') {
    await agent.executeSwap(action);
  }
}
CLI Agent
bashnpm start -- --agent-id trading-bot-1 --mode autonomous

Related Files

WalletManager.ts - Core wallet implementation
TradingStrategy.ts - Decision logic
AutonomousAgent.ts - Main loop
OrcaAdapter.ts - DEX integration
MarketSimulator.ts - Market data


Support & Questions
For questions about capabilities:

Check README.md for overview
Review source code for implementation details
Test with CLI: npm start
Modify and experiment!


Last Updated: February 2025
Version: 1.0.0
Status: Production-ready for devnet
