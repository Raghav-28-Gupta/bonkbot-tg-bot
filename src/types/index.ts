import type { Context } from "telegraf";
import type { Keypair, PublicKey } from "@solana/web3.js";

// SESSION
export interface SessionData {
	swapStep?: "input_token" | "output_token" | "amount";
	inputToken?: string;
	outputToken?: string;
	amount?: number;
	quote?: JupiterQuote;
}

export interface BotContext extends Context {
	session?: SessionData;
}

// USER DATA
export interface UserWallet {
	keypair: Keypair;
	publicKey: string;
	privateKey: string;
}

export interface UserSettings {
	slippage: number;
	priorityFee: string;
}

// TOKENS
export interface Token {
	mint: string;
	symbol: string;
	decimals: number;
	name?: string;
}

// JUPITER API
export interface JupiterQuote {
	inputMint: string;
	outputMint: string;
	inAmount: string;
	outAmount: string;
	priceImpactPct?: string;
	routePlan?: any[];
}

export interface JupiterSwapResponse {
	swapTransaction: string;
	lastValidBlockHeight?: number;
}

export interface JupiterPriceResponse {
	data: {
		[key: string]: {
			id: string;
			price: number;
			extraInfo?: any;
		};
	};
}

// BLOCKCHAIN
export interface TokenBalance {
	mint: string;
	symbol: string;
	amount: number;
	uiAmount: string;
	decimals: number;
}

export interface SwapQuoteRequest {
	inputMint: string;
	outputMint: string;
	amount: number;
	slippage: number;
}

export interface SwapExecutionRequest {
	userPublicKey: string;
	quoteResponse: JupiterQuote;
	keypair: Keypair;
}
