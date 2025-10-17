import { config as loadEnv } from "dotenv";

loadEnv();

export const config = {
	// Telegram
	botToken: process.env.TELEGRAM_BOT_TOKEN || "",

	// Solana
	rpcUrl: process.env.SOLANA_RPC_URL || "https://api.devnet-beta.solana.com",
	network: process.env.SOLANA_NETWORK || "devnet-beta",

	// Jupiter
	jupiterQuoteApi: process.env.JUPITER_QUOTE_API || "https://lite-api.jup.ag/swap/v1/quote",
	jupiterSwapApi: process.env.JUPITER_SWAP_API || "https://lite-api.jup.ag/swap/v1/swap",
	jupiterPriceApi: process.env.JUPITER_PRICE_API || "https://lite-api.jup.ag/price/v3",

	// Bot Settings
	defaultSlippage: parseFloat(process.env.DEFAULT_SLIPPAGE || "1.0"),
	defaultPriorityFee: process.env.DEFAULT_PRIORITY_FEE || "auto",
	privateKeyDeleteTimeout: parseInt(process.env.PRIVATE_KEY_DELETE_TIMEOUT || "60000"),

	// Logging
	logLevel: process.env.LOG_LEVEL || "info",
};

// Token list
export const TOKENS: Record<string, any> = {
	SOL: {
		mint: "So11111111111111111111111111111111111111112",
		symbol: "SOL",
		decimals: 9,
		name: "Solana",
	},
	USDC: {
		mint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
		symbol: "USDC",
		decimals: 6,
		name: "USD Coin",
	},
	USDT: {
		mint: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
		symbol: "USDT",
		decimals: 6,
		name: "Tether USD",
	},
	BONK: {
		mint: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
		symbol: "BONK",
		decimals: 5,
		name: "Bonk",
	},
	JUP: {
		mint: "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN",
		symbol: "JUP",
		decimals: 6,
		name: "Jupiter",
	},
	RAY: {
		mint: "4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R",
		symbol: "RAY",
		decimals: 6,
		name: "Raydium",
	},
};

// Validate required config
export function validateConfig(): void {
	if (!config.botToken) {
		throw new Error("TELEGRAM_BOT_TOKEN is required");
	}
	if (!config.rpcUrl) {
		throw new Error("SOLANA_RPC_URL is required");
	}
}
