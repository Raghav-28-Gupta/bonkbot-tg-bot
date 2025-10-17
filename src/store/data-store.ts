import { Keypair } from "@solana/web3.js";
import bs58 from "bs58";
import type { UserWallet, UserSettings } from "../types";
import { config } from "../config/config";

export class DataStore {
	private userWallets = new Map<number, UserWallet>();
	private userSettings = new Map<number, UserSettings>();

	getUserWallet(userId: number): UserWallet {
		if (!this.userWallets.has(userId)) {
			const keypair = Keypair.generate();
			const wallet: UserWallet = {
				keypair,
				publicKey: keypair.publicKey.toString(),
				privateKey: bs58.encode(keypair.secretKey),
			};
			this.userWallets.set(userId, wallet);
		}
		return this.userWallets.get(userId)!;
	}

	getUserSettings(userId: number): UserSettings {
		if (!this.userSettings.has(userId)) {
			this.userSettings.set(userId, {
				slippage: config.defaultSlippage,
				priorityFee: config.defaultPriorityFee,
			});
		}
		return this.userSettings.get(userId)!;
	}

	updateUserSettings(userId: number, settings: Partial<UserSettings>): void {
		const current = this.getUserSettings(userId);
		this.userSettings.set(userId, { ...current, ...settings });
	}

	importWallet(userId: number, privateKey: string): boolean {
		try {
			const secretKey = bs58.decode(privateKey);
			const keypair = Keypair.fromSecretKey(secretKey);
			const wallet: UserWallet = {
				keypair,
				publicKey: keypair.publicKey.toString(),
				privateKey,
			};
			this.userWallets.set(userId, wallet);
			return true;
		} catch {
			return false;
		}
	}
}
