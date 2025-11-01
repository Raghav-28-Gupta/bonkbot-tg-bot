import { PublicKey } from "@solana/web3.js";
import type { BotContext } from "../../types";
import { DataStore } from "../../store/data-store";
import { SolanaService } from "../../services/solana.service";
import { JupiterService } from "../../services/jupiter.service";
import { TOKENS, config } from "../../config/config";
import { formatBalance, formatUSD } from "../../utils/formatters";
import {
	mainMenuKeyboard,
	tokenSelectionKeyboard,
	slippageKeyboard,
} from "../keyboards";
import { logger } from "../../utils/logger";

export class CommandHandlers {
	constructor(
		private store: DataStore,
		private solanaService: SolanaService,
		private jupiterService: JupiterService
	) {}

	async handleStart(ctx: BotContext): Promise<void> {
		const userId = ctx.from!.id;
		const wallet = this.store.getUserWallet(userId);

		await ctx.replyWithMarkdownV2(
			`🚀 *Welcome to SolSwap Bot!*\n\n` +
				`✨ *Your wallet has been created*\n` +
				`Address: \`${wallet.publicKey}\`\n\n` +
				`⚠️ *IMPORTANT: Save your private key!*\n` +
				`Use /export to get your private key\n\n` +
				`📌 *Quick Commands:*\n` +
				`/balance - Check your balances\n` +
				`/swap - Swap tokens instantly\n` +
				`/settings - Configure slippage\n` +
				`/deposit - Get deposit address\n` +
				`/prices - View token prices\n` +
				`/help - Full help menu\n\n` +
				`💡 *Powered by Jupiter API V1*`,
			mainMenuKeyboard
		);
	}

	async handleBalance(ctx: BotContext): Promise<void> {
		try {
			await ctx.reply("⏳ Fetching balances...");

			const userId = ctx.from!.id;
			const wallet = this.store.getUserWallet(userId);
			const pubkey = new PublicKey(wallet.publicKey);

			const solBalance = await this.solanaService.getBalance(pubkey);
			let message = `💰 *Your Balances*\n\n`;
			message += `SOL: ${formatBalance(solBalance, 4)} SOL\n`;

			const tokenAccounts = await this.solanaService.getTokenAccounts(pubkey);
			let totalValue = solBalance * (await this.jupiterService.getTokenPrice(TOKENS.SOL.mint));

			for (const account of tokenAccounts) {
                    // Object.values(obj) -> returns an array of the given object's own enumerable property values
				const token = Object.values(TOKENS).find( 
					(t) => t.mint === account.mint
				);
				if (token) {
					const price = await this.jupiterService.getTokenPrice(account.mint);
					const value = account.amount * price;
					totalValue += value;
					message += `${token.symbol}: ${account.uiAmount} (${formatUSD(value)})\n`;
				}
			}

			message += `\n💵 Total: ${formatUSD(totalValue)}`;

			await ctx.replyWithMarkdown(message);
		} catch (error) {
			logger.error("Balance error:", error);
			await ctx.reply("❌ Error fetching balance. Please try again.");
		}
	}

	async handleSwap(ctx: BotContext): Promise<void> {
		ctx.session = ctx.session || {};
		ctx.session.swapStep = "input_token";

		await ctx.reply(
			"🔄 *Token Swap*\n\nSelect input token (what you want to swap):",
			{
				parse_mode: "Markdown",
				...tokenSelectionKeyboard("input"),
			}
		);
	}

	async handlePrices(ctx: BotContext): Promise<void> {
		try {
			await ctx.reply("📊 Fetching current prices...");

			let message = "📊 *Token Prices (USD)*\n\n";
               
               // Object.values(obj) -> returns an array of the given object's own enumerable property values
			for (const token of Object.values(TOKENS)) {
				const price = await this.jupiterService.getTokenPrice(token.mint);
				message += `${token.symbol}: $${price.toFixed(
					price < 1 ? 6 : 2
				)}\n`;
			}

			message += "\n🔄 Updated just now";

			await ctx.replyWithMarkdownV2(message);
		} catch (error) {
			await ctx.reply("❌ Error fetching prices.");
		}
	}

	async handleSettings(ctx: BotContext): Promise<void> {
		const userId = ctx.from!.id;
		const settings = this.store.getUserSettings(userId);

		await ctx.reply(
			`⚙️ *Settings*\n\n` +
				`Current Slippage: ${settings.slippage}%\n` +
				`Priority Fee: ${settings.priorityFee}\n\n` +
				`Select slippage tolerance:`,
			{
				parse_mode: "Markdown",
				...slippageKeyboard,
			}
		);
	}

	async handleDeposit(ctx: BotContext): Promise<void> {
		const userId = ctx.from!.id;
		const wallet = this.store.getUserWallet(userId);

		await ctx.replyWithMarkdownV2(
			`📥 *Deposit Address*\n\n` +
				`Send SOL or SPL tokens to this address:\n\n` +
				`\`${wallet.publicKey}\`\n\n` +
				`⚠️ *Important:*\n` +
				`• Only send tokens on Solana network\n` +
				`• Double-check the address\n` +
				`• Transactions are irreversible\n\n` +
				`Use /balance to check your deposits`
		);
	}

	async handleWithdraw(ctx: BotContext): Promise<void> {
		await ctx.reply(
			"📤 *Withdraw Funds*\n\n" +
				"⚠️ To withdraw, you can:\n\n" +
				"1. Export your private key with /export\n" +
				"2. Import it into Phantom/Solflare wallet\n" +
				"3. Send tokens from there\n\n" +
				"Or provide a destination address and amount here.",
			{ parse_mode: "Markdown" }
		);
	}

	async handleExport(ctx: BotContext): Promise<void> {
		const userId = ctx.from!.id;
		const wallet = this.store.getUserWallet(userId);

		const msg = await ctx.reply(
			`🔐 *Private Key Export*\n\n` +
				`⚠️ *CRITICAL: NEVER share this with anyone!*\n\n` +
				`Private Key:\n\`${wallet.privateKey}\`\n\n` +
				`Public Key:\n\`${wallet.publicKey}\`\n\n` +
				`💡 You can import this into:\n` +
				`• Phantom Wallet\n` +
				`• Solflare Wallet\n` +
				`• Any Solana wallet\n\n` +
				`🔥 This message will be deleted in 60 seconds`,
               { parse_mode: "Markdown" }     
		);
          
          // Delete the message containing the private key
		setTimeout(() => {
			ctx.deleteMessage(msg.message_id).catch(() => {});
		}, config.privateKeyDeleteTimeout);
	}

	async handleHelp(ctx: BotContext): Promise<void> {
		await ctx.reply(
			`❓ *Help Menu*\n\n` +
				`*Main Commands:*\n` +
				`/start - Initialize your wallet\n` +
				`/balance - Check token balances\n` +
				`/swap - Swap tokens via Jupiter\n` +
				`/prices - View current prices\n` +
				`/settings - Configure slippage\n` +
				`/deposit - Get deposit address\n` +
				`/withdraw - Withdraw instructions\n` +
				`/export - Export private key\n\n` +
				`*Features:*\n` +
				`✅ Best prices via Jupiter Aggregator\n` +
				`✅ Non-custodial (you own your keys)\n` +
				`✅ Fast execution with priority fees\n` +
				`✅ Support for all SPL tokens\n` +
				`✅ Real-time price quotes\n\n` +
				`*How to Swap:*\n` +
				`1. Deposit SOL/tokens to your wallet\n` +
				`2. Use /swap command\n` +
				`3. Select tokens and amount\n` +
				`4. Confirm the swap\n` +
				`5. Wait for confirmation\n\n` +
				`Need support? Ask in our group!`,
               { parse_mode: "Markdown" }     
		);
	}
}
