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
exports.MLTradingStrategy = void 0;
const tf = __importStar(require("@tensorflow/tfjs"));
/**
 * ML-POWERED TRADING STRATEGY
 *
 * Uses a neural network to learn trading patterns
 * Implements the same interface as TradingStrategy for compatibility
 */
class MLTradingStrategy {
    constructor() {
        this.model = null;
        this.trainingHistory = [];
        this.portfolio = {
            tokenA_balance: 100,
            tokenB_balance: 0,
            totalValueUSD: 100,
        };
        this.modelTrained = false;
        this.priceHistory = [];
        this.maxHistoryLength = 20;
        this.buildModel();
    }
    /**
     * Build the neural network
     */
    buildModel() {
        this.model = tf.sequential({
            layers: [
                tf.layers.dense({
                    inputShape: [5],
                    units: 16,
                    activation: 'relu',
                    name: 'input_layer',
                }),
                tf.layers.dropout({ rate: 0.2 }),
                tf.layers.dense({
                    units: 32,
                    activation: 'relu',
                    name: 'hidden_layer',
                }),
                tf.layers.dropout({ rate: 0.2 }),
                tf.layers.dense({
                    units: 16,
                    activation: 'relu',
                    name: 'hidden_layer_2',
                }),
                tf.layers.dense({
                    units: 3,
                    activation: 'softmax',
                    name: 'output_layer',
                }),
            ],
        });
        this.model.compile({
            optimizer: tf.train.adam(0.01),
            loss: 'categoricalCrossentropy',
            metrics: ['accuracy'],
        });
        console.log('[ML] Neural network model built successfully');
    }
    /**
     * Convert market data to features for the neural network
     */
    marketDataToFeatures(marketData) {
        const trendValue = {
            up: 1.0,
            stable: 0.0,
            down: -1.0,
        }[marketData.tokenB.trend];
        const positionSize = this.portfolio.tokenB_balance > 0 ? 1 : 0;
        const portfolioRatio = this.portfolio.tokenA_balance / (this.portfolio.tokenA_balance + this.portfolio.tokenB_balance || 1);
        return [
            marketData.tokenB.price,
            trendValue,
            marketData.tokenB.volatility,
            portfolioRatio,
            positionSize,
        ];
    }
    /**
     * Make trading decision using the neural network
     */
    async decideAction(marketData) {
        if (!this.model) {
            throw new Error('Model not initialized');
        }
        this.priceHistory.push(marketData.tokenB.price);
        if (this.priceHistory.length > this.maxHistoryLength) {
            this.priceHistory.shift();
        }
        // If not trained, use simple rules
        if (!this.modelTrained) {
            return this.simpleRuleBasedDecision(marketData);
        }
        // Get features and run through network
        const features = this.marketDataToFeatures(marketData);
        const prediction = tf.tidy(() => {
            const input = tf.tensor2d([features], [1, 5]);
            const output = this.model.predict(input);
            return output.dataSync();
        });
        const probabilities = Array.from(prediction);
        const maxProbability = Math.max(...probabilities);
        const actionIndex = probabilities.indexOf(maxProbability);
        const actions = ['BUY', 'SELL', 'HOLD'];
        const action = actions[actionIndex];
        console.log(`[ML] Confidence: ${(maxProbability * 100).toFixed(1)}% for ${action}`);
        if (action === 'BUY' && maxProbability > 0.6 && this.portfolio.tokenA_balance > 10) {
            return {
                type: 'BUY',
                tokenToSell: 'USDC',
                tokenToBuy: 'ORCA',
                amount: Math.min(this.portfolio.tokenA_balance * 0.3, 20),
                reason: `ML model ${(maxProbability * 100).toFixed(0)}% confident to buy`,
            };
        }
        else if (action === 'SELL' && maxProbability > 0.6 && this.portfolio.tokenB_balance > 0) {
            return {
                type: 'SELL',
                tokenToSell: 'ORCA',
                tokenToBuy: 'USDC',
                amount: Math.min(this.portfolio.tokenB_balance * 0.5, 50),
                reason: `ML model ${(maxProbability * 100).toFixed(0)}% confident to sell`,
            };
        }
        else {
            return {
                type: 'HOLD',
                reason: `ML model not confident enough (${(maxProbability * 100).toFixed(0)}% < 60% threshold)`,
            };
        }
    }
    /**
     * Simple rule-based fallback while training
     */
    simpleRuleBasedDecision(marketData) {
        if (marketData.tokenB.trend === 'down' && marketData.tokenB.volatility > 0.005) {
            return {
                type: 'BUY',
                tokenToSell: 'USDC',
                tokenToBuy: 'ORCA',
                amount: Math.min(this.portfolio.tokenA_balance * 0.3, 20),
                reason: 'Price dropping, buying dip (rule-based)',
            };
        }
        if (marketData.tokenB.trend === 'up' && marketData.tokenB.volatility > 0.03 && this.portfolio.tokenB_balance > 0) {
            return {
                type: 'SELL',
                tokenToSell: 'ORCA',
                tokenToBuy: 'USDC',
                amount: Math.min(this.portfolio.tokenB_balance * 0.5, 50),
                reason: 'Price rising, taking profits (rule-based)',
            };
        }
        return {
            type: 'HOLD',
            reason: 'Waiting for better conditions',
        };
    }
    /**
     * Update portfolio after trade - REQUIRED METHOD
     */
    updatePortfolio(trade, executionPrice) {
        if (trade.type === 'BUY') {
            const tokensReceived = trade.amount / executionPrice;
            this.portfolio.tokenA_balance -= trade.amount;
            this.portfolio.tokenB_balance += tokensReceived;
            console.log(`[ML] Updated: -${trade.amount} USDC, +${tokensReceived.toFixed(4)} ORCA`);
        }
        else if (trade.type === 'SELL') {
            const usdcReceived = trade.amount * executionPrice;
            this.portfolio.tokenB_balance -= trade.amount;
            this.portfolio.tokenA_balance += usdcReceived;
            console.log(`[ML] Updated: -${trade.amount.toFixed(4)} ORCA, +${usdcReceived.toFixed(2)} USDC`);
        }
    }
    /**
     * Get portfolio - REQUIRED METHOD
     */
    getPortfolio() {
        return { ...this.portfolio };
    }
    /**
     * Set portfolio for initialization
     */
    setPortfolio(portfolio) {
        this.portfolio = portfolio;
    }
    /**
     * Train the model with historical data
     */
    async trainModel(epochs = 50) {
        if (this.trainingHistory.length < 10) {
            console.log('[ML] Not enough data to train yet (need 10+ samples)');
            return;
        }
        console.log(`[ML] Training with ${this.trainingHistory.length} samples...`);
        const features = [];
        const labels = [];
        for (const record of this.trainingHistory) {
            features.push(this.marketDataToFeatures(record.marketData));
            labels.push(this.actionToOneHot(record.action));
        }
        const xs = tf.tensor2d(features);
        const ys = tf.tensor2d(labels);
        const history = await this.model.fit(xs, ys, {
            epochs: epochs,
            batchSize: 2,
            verbose: 0,
            validationSplit: 0.2,
        });
        console.log('[ML] Training complete!');
        this.modelTrained = true;
        xs.dispose();
        ys.dispose();
    }
    /**
     * Convert action to one-hot encoding
     */
    actionToOneHot(action) {
        const actionMap = {
            BUY: [1, 0, 0],
            SELL: [0, 1, 0],
            HOLD: [0, 0, 1],
        };
        return actionMap[action];
    }
    /**
     * Record a trade for training data
     */
    recordTrade(marketData, action, profit) {
        this.trainingHistory.push({
            marketData,
            action,
            profit,
        });
        if (this.trainingHistory.length === 50 && !this.modelTrained) {
            console.log('[ML] Collected 50 trades, starting training...');
            this.trainModel(20);
        }
    }
    /**
     * Get model statistics
     */
    getModelStats() {
        const params = this.model?.countParams() || 0;
        return {
            trained: this.modelTrained,
            trainingDataPoints: this.trainingHistory.length,
            modelParams: params,
        };
    }
}
exports.MLTradingStrategy = MLTradingStrategy;
//# sourceMappingURL=MLTradingStrategy.js.map