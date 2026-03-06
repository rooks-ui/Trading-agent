import { Connection } from '@solana/web3.js';
import { WalletManager } from '../wallet/WalletManager';
/**
 * Orca Adapter
 *
 * This would handle interactions with Orca DEX
 * For devnet demo, we simulate the swaps
 *
 * In production, you'd use @orca-so/whirlpools SDK to execute real swaps
 */
export declare class OrcaAdapter {
    private connection;
    private walletManager;
    private readonly USDC_MINT;
    private readonly ORCA_MINT;
    constructor(connection: Connection, walletManager: WalletManager);
    /**
     * Execute a swap (buy/sell tokens)
     *
     * Returns:
     * - signature: proof that it happened
     * - tokensReceived: how many tokens we got
     */
    executeSwap(fromToken: 'USDC' | 'ORCA', toToken: 'USDC' | 'ORCA', amount: number, estimatedPrice: number): Promise<{
        signature: string;
        tokensReceived: number;
    }>;
    /**
     * Get current price from Orca
     * In production, this queries the actual Orca pool
     */
    getPrice(): Promise<number>;
}
//# sourceMappingURL=OrcaAdapter.d.ts.map