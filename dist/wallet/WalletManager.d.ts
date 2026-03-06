import { Keypair, PublicKey, Connection, Transaction, VersionedTransaction } from '@solana/web3.js';
export interface WalletConfig {
    walletDir: string;
    encryptionKey: string;
    connection: Connection;
}
export declare class WalletManager {
    private keypair;
    private connection;
    private walletDir;
    private encryptionKey;
    private walletPath;
    publicKey: PublicKey | null;
    constructor(config: WalletConfig);
    createWallet(): Promise<PublicKey>;
    loadWallet(): Promise<PublicKey>;
    getBalance(): Promise<number>;
    signAndSendTransaction(tx: Transaction | VersionedTransaction, shouldLog?: boolean): Promise<string>;
    private saveKeySecurely;
    getKeypair(): Keypair;
    walletExists(): boolean;
}
//# sourceMappingURL=WalletManager.d.ts.map