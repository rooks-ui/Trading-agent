import { MarketData } from '../agent/TradingStrategy';

/**
 * Market Simulator
 * 
 * This creates fake market data that looks realistic
 * In a real app, this would connect to actual price APIs
 * For devnet demo, we simulate it
 */
export class MarketSimulator {
  private basePrice: number = 0.5; // Starting price of ORCA in USDC
  private trend: 'up' | 'down' | 'stable' = 'stable';
  private volatility: number = 0;
  private step: number = 0;

  /**
   * Generate realistic market data
   * 
   * This is called repeatedly to simulate market changes over time
   * Like checking a stock ticker every second
   */
  getMarketData(): MarketData {
    this.step++;

    // Randomly decide if price goes up, down, or stays stable
    const trendShift = Math.random();
    if (trendShift > 0.7) this.trend = 'up';
    else if (trendShift > 0.4) this.trend = 'down';
    else this.trend = 'stable';

    // Calculate price change
    // More volatile when trending, less volatile when stable
    const volatilityMultiplier = this.trend === 'stable' ? 0.005 : 0.015;
    const priceChange = (Math.random() - 0.5) * volatilityMultiplier * this.basePrice;
    
    // Apply the change
    if (this.trend === 'up') {
      if (trendShift > 0.3) {
        this.trend = 'up';  // 70% STAY UP
    } else {
      this.trend = 'down' // 30% change
    }
}

    // Calculate volatility (how much the price jumped)
    this.volatility = Math.abs(priceChange) / this.basePrice;

    // Return market data in the expected format
    return {
      tokenA: {
        price: 1.0, // USDC always worth $1
        trend: 'stable',
        volatility: 0.001,
      },
      tokenB: {
        price: this.basePrice, // ORCA price changes
        trend: this.trend,
        volatility: this.volatility,
      },
      timestamp: Date.now(),
    };
  }

  getPrice(): number {
    return this.basePrice;
  }
}