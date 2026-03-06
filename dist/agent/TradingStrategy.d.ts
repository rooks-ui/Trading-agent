/**
 * This file contains the BRAIN of the AI agent
 * It analyzes market data and decides: BUY, SELL, or HOLD
 */
export interface MarketData {
    tokenA: {
        price: number;
        trend: 'up' | 'down' | 'stable';
        volatility: number;
    };
    tokenB: {
        price: number;
        trend: 'up' | 'down' | 'stable';
        volatility: number;
    };
    timestamp: number;
}
export interface Portfolio {
    tokenA_balance: number;
    tokenB_balance: number;
    totalValueUSD: number;
}
export type TradeAction = {
    type: 'BUY';
    tokenToSell: 'USDC';
    tokenToBuy: 'ORCA';
    amount: number;
    reason: string;
} | {
    type: 'SELL';
    tokenToSell: 'ORCA';
    tokenToBuy: 'USDC';
    amount: number;
    reason: string;
} | {
    type: 'HOLD';
    reason: string;
};
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
export declare class TradingStrategy {
    private portfolio;
    constructor();
    /**
     * This is the MAIN DECISION FUNCTION
     *
     * It looks at market data and returns what to do next
     * The agent will execute this automatically
     */
    decideAction(marketData: MarketData): TradeAction;
    /**
     * Update the portfolio after a trade executes
     *
     * Example: If we BUY 10 USDC worth of ORCA at price 0.5:
     * - We lose 10 USDC
     * - We gain 20 ORCA (10 / 0.5)
     */
    updatePortfolio(trade: TradeAction, executionPrice: number): void;
    getPortfolio(): Portfolio;
    setPortfolio(portfolio: Portfolio): void;
}
//# sourceMappingURL=TradingStrategy.d.ts.map