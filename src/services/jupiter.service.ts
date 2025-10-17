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
			});

			const response = await fetch(`${config.jupiterQuoteApi}?${params}`);

			if (!response.ok) {
				const error = await response.text();
				logger.error("Jupiter quote error:", error);
				return null;
			}
               
               // @ts-ignore
			return await response.json();
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
					prioritizationFeeLamports: {
						autoMultiplier: 2,
					},
				}),
			});

			if (!swapResponse.ok) {
				throw new Error(`Swap API error: ${await swapResponse.text()}`);
			}
               
               // @ts-ignore
			const { swapTransaction }: JupiterSwapResponse = await swapResponse.json();
			const swapTransactionBuf = Buffer.from(swapTransaction, "base64");
			const transaction = VersionedTransaction.deserialize(swapTransactionBuf);

			transaction.sign([keypair]);

			const signature = await this.connection.sendTransaction(transaction,
				{
                       skipPreflight: false,
                       maxRetries: 3,
				}
			);

			await this.connection.confirmTransaction(signature, "confirmed");

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

			// Handling different possible response formats
			if (data.data && typeof data.data === 'object') {
				return data.data[mintAddress]?.price || 0;
			} else if (data[mintAddress]) {
				return data[mintAddress].price || 0;
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
