import { Keypair, PublicKey, Connection, Transaction, VersionedTransaction } from '@solana/web3.js';
import * as fs from 'fs';
import * as crypto from 'crypto';
import * as path from 'path';

export interface WalletConfig {
  walletDir: string;
  encryptionKey: string;
  connection: Connection;
}

export class WalletManager {
  private keypair: Keypair | null = null;
  private connection: Connection;
  private walletDir: string;
  private encryptionKey: string;
  private walletPath: string;
  public publicKey: PublicKey | null = null;

  constructor(config: WalletConfig) {
    this.connection = config.connection;
    this.walletDir = config.walletDir;
    this.encryptionKey = config.encryptionKey;
    this.walletPath = path.join(this.walletDir, 'wallet.encrypted');

    if (!fs.existsSync(this.walletDir)) {
      fs.mkdirSync(this.walletDir, { recursive: true });
    }
  }

  async createWallet(): Promise<PublicKey> {
    console.log('[WalletManager] Creating new wallet...');
    this.keypair = Keypair.generate();
    this.publicKey = this.keypair.publicKey;
    
    await this.saveKeySecurely();
    console.log(`✓ Wallet created: ${this.publicKey.toBase58()}`);
    
    return this.publicKey;
  }

  async loadWallet(): Promise<PublicKey> {
    if (!fs.existsSync(this.walletPath)) {
      throw new Error(`Wallet file not found at ${this.walletPath}. Create a new wallet first.`);
    }

    console.log('[WalletManager] Loading existing wallet...');
    
    try {
      const fileContent = fs.readFileSync(this.walletPath, 'utf8');
      const [ivHex, encryptedHex] = fileContent.split(':');
      
      if (!ivHex || !encryptedHex) {
        throw new Error('Invalid wallet file format');
      }

      const iv = Buffer.from(ivHex, 'hex');
      const encrypted = Buffer.from(encryptedHex, 'hex');
      
      const keyBuffer = Buffer.from(this.encryptionKey.padEnd(32, ' ').slice(0, 32));
      
      const decipher = crypto.createDecipheriv('aes-256-cbc', keyBuffer, iv);
      let decrypted = decipher.update(encrypted, undefined, 'utf8');
      decrypted += decipher.final('utf8');
      
      const secretArray = JSON.parse(decrypted);
      this.keypair = Keypair.fromSecretKey(new Uint8Array(secretArray));
      this.publicKey = this.keypair.publicKey;
      
      console.log(`✓ Wallet loaded: ${this.publicKey.toBase58()}`);
      return this.publicKey;
    } catch (error) {
      throw new Error('Failed to decrypt wallet. Wrong encryption key or corrupted file?');
    }
  }

  async getBalance(): Promise<number> {
    if (!this.publicKey) {
      throw new Error('Wallet not initialized. Load or create a wallet first.');
    }

    const balanceLamports = await this.connection.getBalance(this.publicKey);
    const balanceSOL = balanceLamports / 1_000_000_000;
    
    console.log(`[WalletManager] Balance: ${balanceSOL.toFixed(4)} SOL`);
    return balanceSOL;
  }

  async signAndSendTransaction(
    tx: Transaction | VersionedTransaction,
    shouldLog: boolean = true
  ): Promise<string> {
    if (!this.keypair) {
      throw new Error('Keypair not loaded');
    }

    if (shouldLog) {
      console.log('[WalletManager] Signing transaction autonomously...');
    }

    if (tx instanceof Transaction) {
      tx.feePayer = this.publicKey!;
      tx.sign(this.keypair);
    } else {
      tx.sign([this.keypair]);
    }

    if (shouldLog) {
      console.log('[WalletManager] ✓ Signed. Broadcasting to network...');
    }

    const signature = await this.connection.sendRawTransaction(
      tx.serialize(),
      { skipPreflight: false, preflightCommitment: 'processed' }
    );

    const confirmation = await this.connection.confirmTransaction(
      signature,
      'confirmed'
    );

    if (shouldLog) {
      console.log(`[WalletManager] ✓ Transaction confirmed: ${signature}`);
    }

    return signature;
  }

  private async saveKeySecurely(): Promise<void> {
    if (!this.keypair) {
      throw new Error('No keypair to save');
    }

    try {
      const secretArray = Array.from(this.keypair.secretKey);
      const jsonStr = JSON.stringify(secretArray);
      
      const iv = crypto.randomBytes(16);
      const keyBuffer = Buffer.from(this.encryptionKey.padEnd(32, ' ').slice(0, 32));
      
      const cipher = crypto.createCipheriv('aes-256-cbc', keyBuffer, iv);
      let encrypted = cipher.update(jsonStr, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      const fileContent = iv.toString('hex') + ':' + encrypted;
      
      fs.writeFileSync(this.walletPath, fileContent);
      console.log(`[WalletManager] ✓ Wallet saved encrypted to ${this.walletPath}`);
    } catch (error) {
      throw new Error(`Failed to save wallet: ${error}`);
    }
  }

  getKeypair(): Keypair {
    if (!this.keypair) {
      throw new Error('Keypair not initialized');
    }
    return this.keypair;
  }

  walletExists(): boolean {
    return fs.existsSync(this.walletPath);
  }
}
