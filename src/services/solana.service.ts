import { Connection, PublicKey } from "@solana/web3.js";
import type { TokenBalance } from "../types";
import { config } from "../config/config";
import { logger } from "../utils/logger";

export class SolanaService {
	private connection: Connection;

	constructor() {
		this.connection = new Connection(config.rpcUrl, "confirmed");
	}

	async getBalance(publicKey: PublicKey): Promise<number> {
		try {
			const balance = await this.connection.getBalance(publicKey);
			return balance / 1e9;
		} catch (error) {
			logger.error("Balance fetch error:", error);
			return 0;
		}
	}

	async getTokenAccounts(publicKey: PublicKey): Promise<TokenBalance[]> {
		try {
			const response =
				await this.connection.getParsedTokenAccountsByOwner(publicKey, {
					programId: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),
				});

			return response.value
				.map((account) => {
					const data = account.account.data.parsed.info;
					return {
						mint: data.mint,
						symbol: "UNKNOWN",
						amount: parseFloat(data.tokenAmount.uiAmount),
						uiAmount: data.tokenAmount.uiAmountString,
						decimals: data.tokenAmount.decimals,
					};
				})
				.filter((token) => token.amount > 0);
		} catch (error) {
			logger.error("Token accounts fetch error:", error);
			return [];
		}
	}

	getConnection(): Connection {
		return this.connection;
	}
}
