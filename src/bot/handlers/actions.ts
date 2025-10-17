import type { BotContext } from "../../types";
import { DataStore } from "../../store/data-store";
import { JupiterService } from "../../services/jupiter.service";
import { TOKENS } from "../../config/config";
import {
	tokenSelectionKeyboard,
	swapConfirmKeyboard,
	slippageKeyboard,
} from "../keyboards";
import { formatTokenAmount } from "../../utils/formatters";
import { logger } from "../../utils/logger";

export class ActionHandlers {
	constructor(
		private store: DataStore,
		private jupiterService: JupiterService
	) {}

	async handleSwapInputToken(ctx: BotContext): Promise<void> {
          // @ts-ignore
		const tokenSymbol = ctx.match![1];
		ctx.session = ctx.session || {};
		ctx.session.inputToken = tokenSymbol;
		ctx.session.swapStep = "output_token";

		await ctx.editMessageText(
			`✅ You will swap: ${tokenSymbol}\n\n🔄 Select output token (what you want to receive):`,
			{
				parse_mode: "Markdown",
				...tokenSelectionKeyboard("output"),    // cleanly add the inline_keyboard property
			}
		);
	}

	async handleSwapOutputToken(ctx: BotContext): Promise<void> {
          // @ts-ignore
		const tokenSymbol = ctx.match![1];
		ctx.session = ctx.session || {};

		if (ctx.session.inputToken === tokenSymbol) {
			await ctx.answerCbQuery("❌ Cannot swap same token!");
			return;
		}

		ctx.session.outputToken = tokenSymbol;
		ctx.session.swapStep = "amount";

		await ctx.editMessageText(
			`✅ Swap Route: ${ctx.session.inputToken} → ${tokenSymbol}\n\n` +
				`💵 Enter amount of ${ctx.session.inputToken} to swap:`,
			{ parse_mode: "Markdown" }
		);
	}

	async handleSwapConfirm(ctx: BotContext): Promise<void> {
		try {
			await ctx.editMessageText(
				"⏳ Executing swap on Solana...\n\nThis may take 10-30 seconds."
			);

			const userId = ctx.from!.id;
			const wallet = this.store.getUserWallet(userId);
			const signature = await this.jupiterService.executeSwap(
				wallet.publicKey,
				ctx.session!.quote!,
				wallet.keypair
			);

			const inputToken = TOKENS[ctx.session!.inputToken!];
			const outputToken = TOKENS[ctx.session!.outputToken!];
			const outputAmount = formatTokenAmount(
				ctx.session!.quote!.outAmount,
				outputToken.decimals
			);

			await ctx.reply(
				`✅ *Swap Successful!*\n\n` +
					`Swapped: ${ctx.session!.amount} ${inputToken.symbol}\n` +
					`Received: ~${outputAmount} ${outputToken.symbol}\n\n` +
					`Transaction:\n\`${signature}\`\n\n` +
					`[View on Solscan](https://solscan.io/tx/${signature})\n` +
					`[View on SolanaFM](https://solana.fm/tx/${signature})`,
				{ parse_mode: "Markdown" }
			);

			ctx.session = {};
		} catch (error) {
			logger.error("Swap error:", error);
			await ctx.reply(
				"❌ *Swap Failed*\n\n" +
					"Possible reasons:\n" +
					"• Insufficient balance\n" +
					"• High price impact\n" +
					"• Network congestion\n\n" +
					"Please check your balance with /balance and try again.",
				{ parse_mode: "Markdown" }
			);
		}
	}

	async handleSwapCancel(ctx: BotContext): Promise<void> {
		ctx.session = {};
		await ctx.answerCbQuery("❌ Swap cancelled");
		await ctx.editMessageText("❌ Swap cancelled.");
	}

	async handleSlippageChange(ctx: BotContext): Promise<void> {
          // @ts-ignore
		const slippage = parseFloat(ctx.match![1]);
		const userId = ctx.from!.id;
		this.store.updateUserSettings(userId, { slippage });

		await ctx.answerCbQuery(`✅ Slippage set to ${slippage}%`);
		await ctx.editMessageText(
			`✅ *Slippage Updated*\n\n` +
				`New slippage: ${slippage}%\n\n` +
				`${
					slippage > 3
						? "⚠️ Higher slippage = faster execution but potentially worse price\n\n"
						: ""
				}` +
				`This will apply to your next swap.`,
			{ parse_mode: "Markdown" }
		);
	}

	async handleSettingsClose(ctx: BotContext): Promise<void> {
		await ctx.answerCbQuery();
		await ctx.deleteMessage();
	}
}
