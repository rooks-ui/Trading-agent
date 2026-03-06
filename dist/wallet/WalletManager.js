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
exports.WalletManager = void 0;
const web3_js_1 = require("@solana/web3.js");
const fs = __importStar(require("fs"));
const crypto = __importStar(require("crypto"));
const path = __importStar(require("path"));
class WalletManager {
    constructor(config) {
        this.keypair = null;
        this.publicKey = null;
        this.connection = config.connection;
        this.walletDir = config.walletDir;
        this.encryptionKey = config.encryptionKey;
        this.walletPath = path.join(this.walletDir, 'wallet.encrypted');
        if (!fs.existsSync(this.walletDir)) {
            fs.mkdirSync(this.walletDir, { recursive: true });
        }
    }
    async createWallet() {
        console.log('[WalletManager] Creating new wallet...');
        this.keypair = web3_js_1.Keypair.generate();
        this.publicKey = this.keypair.publicKey;
        await this.saveKeySecurely();
        console.log(`✓ Wallet created: ${this.publicKey.toBase58()}`);
        return this.publicKey;
    }
    async loadWallet() {
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
            this.keypair = web3_js_1.Keypair.fromSecretKey(new Uint8Array(secretArray));
            this.publicKey = this.keypair.publicKey;
            console.log(`✓ Wallet loaded: ${this.publicKey.toBase58()}`);
            return this.publicKey;
        }
        catch (error) {
            throw new Error('Failed to decrypt wallet. Wrong encryption key or corrupted file?');
        }
    }
    async getBalance() {
        if (!this.publicKey) {
            throw new Error('Wallet not initialized. Load or create a wallet first.');
        }
        const balanceLamports = await this.connection.getBalance(this.publicKey);
        const balanceSOL = balanceLamports / 1000000000;
        console.log(`[WalletManager] Balance: ${balanceSOL.toFixed(4)} SOL`);
        return balanceSOL;
    }
    async signAndSendTransaction(tx, shouldLog = true) {
        if (!this.keypair) {
            throw new Error('Keypair not loaded');
        }
        if (shouldLog) {
            console.log('[WalletManager] Signing transaction autonomously...');
        }
        if (tx instanceof web3_js_1.Transaction) {
            tx.feePayer = this.publicKey;
            tx.sign(this.keypair);
        }
        else {
            tx.sign([this.keypair]);
        }
        if (shouldLog) {
            console.log('[WalletManager] ✓ Signed. Broadcasting to network...');
        }
        const signature = await this.connection.sendRawTransaction(tx.serialize(), { skipPreflight: false, preflightCommitment: 'processed' });
        const confirmation = await this.connection.confirmTransaction(signature, 'confirmed');
        if (shouldLog) {
            console.log(`[WalletManager] ✓ Transaction confirmed: ${signature}`);
        }
        return signature;
    }
    async saveKeySecurely() {
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
        }
        catch (error) {
            throw new Error(`Failed to save wallet: ${error}`);
        }
    }
    getKeypair() {
        if (!this.keypair) {
            throw new Error('Keypair not initialized');
        }
        return this.keypair;
    }
    walletExists() {
        return fs.existsSync(this.walletPath);
    }
}
exports.WalletManager = WalletManager;
//# sourceMappingURL=WalletManager.js.map