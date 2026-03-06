"use strict";
/**
 * This file contains the BRAIN of the AI agent
 * It analyzes market data and decides: BUY, SELL, or HOLD
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TradingStrategy = void 0;
/**
 * Trading Strategy - This is where the agent's intelligence lives
 *
 * It analyzes:
 * - Price trends (is price going up or down?)
 * - Volatility (is it stable or jumping around?)
 * - Portfolio (how much money do we have?)
 *
 * Then it decides: buy, sell, or wait
 */
class TradingStrategy {
    constructor() {
        this.portfolio = {
            tokenA_balance: 100, // Start with 100 USDC (simulated)
            tokenB_balance: 0, // 0 ORCA
            totalValueUSD: 100,
        };
    }
    /**
     * This is the MAIN DECISION FUNCTION
     *
     * It looks at market data and returns what to do next
     * The agent will execute this automatically
     */
    decideAction(marketData) {
        const { tokenA, tokenB } = marketData;
        // RULE 1: Buy when price is dropping (contrarian strategy)
        // Why? If everyone is selling, prices drop. Smart buyers buy low.
        if (tokenB.trend === 'down' && tokenB.volatility > 0.02) {
            const buyAmount = Math.min(this.portfolio.tokenA_balance * 0.3, 20);
            if (buyAmount > 0) {
                return {
                    type: 'BUY',
                    tokenToSell: 'USDC',
                    tokenToBuy: 'ORCA',
                    amount: buyAmount,
                    reason: `Price dropping (trend=${tokenB.trend}, volatility=${tokenB.volatility.toFixed(3)}). Buy opportunity!`,
                };
            }
        }
        // RULE 2: Sell when price is rising significantly (take profits)
        // Why? If we bought low and price went up, we made profit. Sell to lock in gains.
        if (tokenB.trend === 'up' && tokenB.volatility > 0.03 && this.portfolio.tokenB_balance > 0) {
            const sellAmount = Math.min(this.portfolio.tokenB_balance * 0.5, 50);
            if (sellAmount > 0) {
                return {
                    type: 'SELL',
                    tokenToSell: 'ORCA',
                    tokenToBuy: 'USDC',
                    amount: sellAmount,
                    reason: `Price rising (trend=${tokenB.trend}, volatility=${tokenB.volatility.toFixed(3)}). Take profits!`,
                };
            }
        }
        // RULE 3: Hold if conditions aren't favorable
        // Why? Don't trade if we're not sure. Sitting on sidelines is ok.
        return {
            type: 'HOLD',
            reason: 'Market conditions not favorable. Waiting for better opportunity.',
        };
    }
    /**
     * Update the portfolio after a trade executes
     *
     * Example: If we BUY 10 USDC worth of ORCA at price 0.5:
     * - We lose 10 USDC
     * - We gain 20 ORCA (10 / 0.5)
     */
    updatePortfolio(trade, executionPrice) {
        if (trade.type === 'BUY') {
            const tokensReceived = trade.amount / executionPrice;
            this.portfolio.tokenA_balance -= trade.amount;
            this.portfolio.tokenB_balance += tokensReceived;
            console.log(`[Strategy] Updated: -${trade.amount} USDC, +${tokensReceived.toFixed(4)} ORCA`);
        }
        else if (trade.type === 'SELL') {
            const usdcReceived = trade.amount * executionPrice;
            this.portfolio.tokenB_balance -= trade.amount;
            this.portfolio.tokenA_balance += usdcReceived;
            console.log(`[Strategy] Updated: -${trade.amount.toFixed(4)} ORCA, +${usdcReceived.toFixed(2)} USDC`);
        }
    }
    getPortfolio() {
        return { ...this.portfolio };
    }
    setPortfolio(portfolio) {
        this.portfolio = portfolio;
    }
}
exports.TradingStrategy = TradingStrategy;
//# sourceMappingURL=TradingStrategy.js.map