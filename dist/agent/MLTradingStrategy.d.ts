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
 * ML-POWERED TRADING STRATEGY
 *
 * Uses a neural network to learn trading patterns
 * Implements the same interface as TradingStrategy for compatibility
 */
export declare class MLTradingStrategy {
    private model;
    private trainingHistory;
    private portfolio;
    private modelTrained;
    private priceHistory;
    private maxHistoryLength;
    constructor();
    /**
     * Build the neural network
     */
    private buildModel;
    /**
     * Convert market data to features for the neural network
     */
    private marketDataToFeatures;
    /**
     * Make trading decision using the neural network
     */
    decideAction(marketData: MarketData): Promise<TradeAction>;
    /**
     * Simple rule-based fallback while training
     */
    private simpleRuleBasedDecision;
    /**
     * Update portfolio after trade - REQUIRED METHOD
     */
    updatePortfolio(trade: TradeAction, executionPrice: number): void;
    /**
     * Get portfolio - REQUIRED METHOD
     */
    getPortfolio(): Portfolio;
    /**
     * Set portfolio for initialization
     */
    setPortfolio(portfolio: Portfolio): void;
    /**
     * Train the model with historical data
     */
    trainModel(epochs?: number): Promise<void>;
    /**
     * Convert action to one-hot encoding
     */
    private actionToOneHot;
    /**
     * Record a trade for training data
     */
    recordTrade(marketData: MarketData, action: 'BUY' | 'SELL' | 'HOLD', profit: number): void;
    /**
     * Get model statistics
     */
    getModelStats(): {
        trained: boolean;
        trainingDataPoints: number;
        modelParams: number;
    };
}
//# sourceMappingURL=MLTradingStrategy.d.ts.map