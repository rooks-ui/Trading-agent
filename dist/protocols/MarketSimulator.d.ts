import { MarketData } from '../agent/TradingStrategy';
/**
 * Market Simulator
 *
 * This creates fake market data that looks realistic
 * In a real app, this would connect to actual price APIs
 * For devnet demo, we simulate it
 */
export declare class MarketSimulator {
    private basePrice;
    private trend;
    private volatility;
    private step;
    /**
     * Generate realistic market data
     *
     * This is called repeatedly to simulate market changes over time
     * Like checking a stock ticker every second
     */
    getMarketData(): MarketData;
    getPrice(): number;
}
//# sourceMappingURL=MarketSimulator.d.ts.map