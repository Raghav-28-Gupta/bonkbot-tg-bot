import type { BotContext } from "../../types";
import { DataStore } from "../../store/data-store";
import { JupiterService } from "../../services/jupiter.service";
import { TOKENS } from "../../config/config";
import { swapConfirmKeyboard } from "../keyboards";
import { logger } from "../../utils/logger";

export class MessageHandlers {
	constructor(
		private store: DataStore,
		private jupiterService: JupiterService
	) {}

	async handleText(ctx: BotContext): Promise<void> {
		if (!ctx.session || ctx.session.swapStep !== "amount" || !ctx.message || !("text" in ctx.message)) return;

		const amount = parseFloat(ctx.message.text);
		if (isNaN(amount) || amount <= 0) {
			await ctx.reply("❌ Invalid amount. Please enter a valid number.");
			return;
		}

		ctx.session.amount = amount;

		try {
			await ctx.reply("⏳ Getting best route from Jupiter...");

			const inputToken = TOKENS[ctx.session.inputToken!];
			const outputToken = TOKENS[ctx.session.outputToken!];
			const inputAmount = Math.floor( amount * Math.pow(10, inputToken.decimals) );
			const settings = this.store.getUserSettings(ctx.from!.id);

			const quote = await this.jupiterService.getQuote(
				inputToken.mint,
				outputToken.mint,
				inputAmount,
				settings.slippage
			);

			if (!quote) {
				await ctx.reply(
					"❌ Unable to get quote. Please try again or check your balance."
				);
				return;
			}

			const outputAmount = (parseFloat(quote.outAmount) / Math.pow(10, outputToken.decimals)).toFixed(6);
			const priceImpact = parseFloat(quote.priceImpactPct || "0").toFixed(2);
			const rate = (parseFloat(outputAmount) / amount).toFixed(6);

			ctx.session.quote = quote;

			await ctx.reply(
				`📊 *Swap Quote*\n\n` +
					`Pay: ${amount} ${inputToken.symbol}\n` +
					`Receive: ~${outputAmount} ${outputToken.symbol}\n\n` +
					`📈 Rate: 1 ${inputToken.symbol} = ${rate} ${outputToken.symbol}\n` +
					`💥 Price Impact: ${priceImpact}%\n` +
					`⚡ Slippage: ${settings.slippage}%\n\n` +
					`${
						parseFloat(priceImpact) > 5
							? "⚠️ *High price impact!*\n\n"
							: ""
					}` +
					`Confirm this swap?`,
				{
					parse_mode: "Markdown",
					...swapConfirmKeyboard,
				}
			);
		} catch (error) {
			logger.error("Quote error:", error);
			await ctx.reply("❌ Error getting quote. Please try again.");
		}
	}
}
