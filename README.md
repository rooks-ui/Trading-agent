Trading Agent: Autonomous AI on Solana
An autonomous trading agent that makes independent trading decisions and executes swaps on Solana devnet without human intervention.

What It Does:

Creates wallets for AI agents programmatically
Monitors market conditions and analyzes trends
Makes autonomous decisions using intelligent trading logic
Executes trades by signing transactions automatically
Manages portfolio across multiple assets
Tracks performance with trade history

Quick Start (Windows)
Step 1:

Download and install Node.js from https://nodejs.org/ (LTS version)
Verify installation: Open Command Prompt and type:

```
node --version
```
Step 2: Clone or Create Project
```
mkdir trading-agent
cd trading-agent
```
Step 3: Install Dependencies
Copy ALL your project files into this folder, then run:
```
npm install
```
Step 4: Create Environment File
Copy .env.example to .env:
```
SOLANA_RPC_URL=https://api.devnet.solana.com
WALLET_ENCRYPTION_KEY=ThisIsMySecretKey12345678901234
WALLET_DIR=./wallets
AGENT_UPDATE_INTERVAL=3000
AGENT_ID=trading-bot-1
```
Change WALLET_ENCRYPTION_KEY to something random (must be at least 32 characters)
Step 5: Run It!
```
npm start
```
You'll see the agent:

- Create a wallet
- Start monitoring the market
- Automatically decide to BUY or SELL
- Execute trades

Press Ctrl+C to stop.

How It Works
┌─────────────────────────────┐
│  Market Data Monitor        │ ← Checks prices constantly
│  (tracks price, volatility) │
└──────────┬──────────────────┘
           │
           ▼
┌─────────────────────────────┐
│  Trading Decision Engine    │ ← AI analyzes: Buy? Sell? Hold?
│  (analyzes trends)          │
└──────────┬──────────────────┘
           │
           ▼
┌─────────────────────────────┐
│  Transaction Executor       │ ← Signs transaction automatically
│  (autonomous signing)       │
└──────────┬──────────────────┘
           │
           ▼
┌─────────────────────────────┐
│  Solana Devnet              │ ← Broadcasts to blockchain
│  (executes real trades)     │
└─────────────────────────────┘

Trading Logic (The "AI" Part)
The agent uses these rules:

Buy when price drops - Contrarian strategy

If ORCA price falls 10%+ and we have capital, BUY
Reason: Smart traders buy low


Sell when price rises - Take profits

If ORCA price rises 10%+ and we own some, SELL 50%
Reason: Lock in gains before price drops


Hold otherwise - Wait for better opportunities

Don't trade unless conditions are right
Be patient


This is configurable! You can edit src/agent/TradingStrategy.ts to change the logic.

Project Structure
agentic-trading-agent/
├── src/
│   ├── wallet/
│   │   └── WalletManager.ts      ← Manages wallet & keys
│   ├── agent/
│   │   ├── TradingStrategy.ts    ← The AI decision logic
│   │   └── AutonomousAgent.ts    ← Main loop orchestrator
│   ├── protocols/
│   │   ├── OrcaAdapter.ts        ← DEX integration
│   │   └── MarketSimulator.ts    ← Simulates market prices
│   └── index.ts                  ← Main entry point
├── .env                          ← Your secrets (DON'T commit!)
├── .env.example                  ← Template
├── package.json                  ← Dependencies
└── tsconfig.json                 ← TypeScript config

Security

Private keys encrypted with AES-256-CBC at rest
Keys stored in ./wallets/wallet.encrypted
.env file should NEVER be committed to git
Automatic transaction signing (no human manual signing needed)


Understanding the Code :

WalletManager.ts
What it does: Creates and manages the agent's wallet
Key methods:

createWallet() - Generate new keypair
loadWallet() - Load existing encrypted wallet
signAndSendTransaction() - Sign & broadcast autonomously
getBalance() - Check wallet SOL balance

TradingStrategy.ts
What it does: The BRAIN of the agent - decides what to do
Key method:

decideAction(marketData) - Returns: BUY, SELL, or HOLD

This is where you modify the AI logic!
AutonomousAgent.ts
What it does: Orchestrates the trading loop
Main loop:

Get market data
Call TradingStrategy to decide
Execute trade
Record result
Wait
Repeat

MarketSimulator.ts
What it does: Simulates realistic market data
Currently generates fake prices. In production, replace with:

Chainlink price feeds
Jupiter API prices
Orca pool state queries

Testing & Demo Scenarios

Scenario 1: Just Watch It Trade

npm start

Watch as the agent autonomously trades based on simulated market data.
Scenario 2: Check Logs
The agent logs everything:

Market updates (price, trend, volatility)
Trading decisions (reason for buy/sell)
Execution results (signature, tokens received)
Portfolio updates

Scenario 3: Modify Trading Logic
Edit src/agent/TradingStrategy.ts to change decision rules:
```typescript
// Example: Buy more aggressively
if (tokenB.trend === 'down' && tokenB.volatility > 0.01) {  // Lower threshold
  const buyAmount = Math.min(this.portfolio.tokenA_balance * 0.5, 50);  // Use 50%, max 50
  // ...
}
```
Then rebuild: `npm run build`

Next Steps
To Make It Real:

Fund your wallet with devnet SOL (https://faucet.solana.com/)
Replace MarketSimulator with real price feeds
Replace OrcaAdapter with actual Orca SDK swaps
Deploy to mainnet (with caution!)

To Improve the AI:

Add technical indicators (RSI, MACD, Bollinger Bands)
Implement ML model for predictions
Add risk management (stop losses, portfolio limits)
Integrate multiple markets/tokens

To Scale:

Support multiple agents with shared wallet
Add transaction queuing
Implement portfolio rebalancing
Add monitoring/alerting

Important Notes

This is a devnet demo - No real money at risk
Prices are simulated - Not connected to real markets
Trades are not real - OrcaAdapter simulates execution
For production: Replace simulators with real data/APIs
Be careful on mainnet: Always test thoroughly on devnet first

Troubleshooting
"Command not found: npm"

Node.js not installed properly
Restart Command Prompt after installation
Try: `npm --version`

"WALLET_ENCRYPTION_KEY must be at least 32 characters"

Edit .env file
Make WALLET_ENCRYPTION_KEY longer (at least 32 characters)
Example: WALLET_ENCRYPTION_KEY=myverylongsecretkey1234567890123456

"Cannot find module 'solana/web3.js'"

Run: `npm install` again
Confirm node_modules folder exists

Agent not trading

Check market volatility (threshold might be too high)
Edit thresholds in TradingStrategy.ts
Check console logs for decision reasoning

Learning Resources

Solana Web3.js docs: https://docs.solana.com/
TypeScript guide: https://www.typescriptlang.org/docs/
Orca DEX: https://www.orca.so/
Solana Devnet: https://docs.solana.com/clusters#devnet
