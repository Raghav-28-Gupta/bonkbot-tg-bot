import { Connection, Keypair, VersionedTransaction } from "@solana/web3.js";
import type {
	JupiterQuote,
	JupiterSwapResponse,
	JupiterPriceResponse,
} from "../types";
import { config } from "../config/config";
import { logger } from "../utils/logger";

export class JupiterService {
	private connection: Connection;

	constructor(connection: Connection) {
		this.connection = connection;
	}

	async getQuote(
		inputMint: string,
		outputMint: string,
		amount: number,
		slippage: number
	): Promise<JupiterQuote | null> {
		try {
			const params = new URLSearchParams({
				inputMint,
				outputMint,
				amount: amount.toString(),
				slippageBps: Math.floor(slippage * 100).toString(),
				asLegacyTransaction: "true", // Request versioned transaction
				only: "direct,route", // Use direct routes to avoid ALT issues on devnet
			});

			const response = await fetch(`${config.jupiterQuoteApi}?${params}`);

			if (!response.ok) {
				const error = await response.text();
				logger.error("Jupiter quote error:", error);
				return null;
			}
               
			return await response.json() as JupiterQuote;
		} catch (error) {
			logger.error("Error fetching quote:", error);
			return null;
		}
	}

	async executeSwap(
		userPublicKey: string,
		quoteResponse: JupiterQuote,
		keypair: Keypair
	): Promise<string> {
		try {
			const swapResponse = await fetch(config.jupiterSwapApi, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					quoteResponse,
					userPublicKey,
					wrapAndUnwrapSol: true,
					dynamicComputeUnitLimit: true,
					asLegacyTransaction: true,
					prioritizationFeeLamports: {
						autoMultiplier: 2,
					},
				}),
			});

			if (!swapResponse.ok) {
				const errorText = await swapResponse.text();
				logger.error("Swap API error:", errorText);
				throw new Error(`Swap API error: ${errorText}`);
			}
               
			const responseData = await swapResponse.json() as JupiterSwapResponse;
			const { swapTransaction } = responseData;
			
			const swapTransactionBuf = Buffer.from(swapTransaction, "base64");

			// Use Transaction instead of VersionedTransaction for legacy transactions
			const { Transaction } = await import("@solana/web3.js");
			const transaction = Transaction.from(swapTransactionBuf);

			transaction.sign(keypair);

			// Use sendRawTransaction instead of sendTransaction for better ALT handling
			const signature = await this.connection.sendRawTransaction(transaction.serialize(), {
				skipPreflight: true, // Skip preflight for ALT issues
				maxRetries: 10,
			});

			logger.info("Transaction sent, signature:", signature);

			// Wait for confirmation with timeout (120 seconds for devnet)
			const confirmation = await Promise.race([
				this.connection.confirmTransaction(signature, "confirmed"),
				new Promise((_, reject) =>
					setTimeout(() => reject(new Error("Confirmation timeout")), 120000)
				),
			]);
	   
			if ((confirmation as any).value.err) {
				throw new Error(`Transaction failed: ${JSON.stringify((confirmation as any).value.err)}`);
			}

			return signature;
		} catch (error) {
			logger.error("Swap execution error:", error);
			throw error;
		}
	}

	async getTokenPrice(mintAddress: string): Promise<number> {
		try {
			const response = await fetch(`${config.jupiterPriceApi}?ids=${mintAddress}`);
			if (!response.ok) {
				logger.error(`Price API error: ${response.status} ${response.statusText}`);
				return 0;
			}
               
			const data: any = await response.json();
			logger.debug("Price API response:", data);

			// Checking if data has the expected structure
			if (!data || typeof data !== 'object') {
				logger.error("Invalid price API response structure");
				return 0;
			}

			// Handle Jupiter API response format: data[mintAddress].usdPrice
			if (data[mintAddress] && typeof data[mintAddress] === 'object') {
				return data[mintAddress].usdPrice || 0;
			} else {
				logger.warn(`Price not found for mint: ${mintAddress}`);
				return 0;
			}
		} catch (error) {
			logger.error("Price fetch error:", error);
			return 0;
		}
	}
}
