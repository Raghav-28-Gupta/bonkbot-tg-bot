import { Markup } from "telegraf";

export const mainMenuKeyboard = Markup.keyboard([
	["💰 Balance", "🔄 Swap"],
	["📊 Prices", "⚙️ Settings"],
	["❓ Help"],
]).resize();

export const tokenSelectionKeyboard = (prefix: "input" | "output") =>
	Markup.inlineKeyboard([
		[
			Markup.button.callback("SOL", `swap_${prefix}_SOL`),
			Markup.button.callback("USDC", `swap_${prefix}_USDC`),
		],
		[
			Markup.button.callback("USDT", `swap_${prefix}_USDT`),
			Markup.button.callback("BONK", `swap_${prefix}_BONK`),
		],
		[
			Markup.button.callback("JUP", `swap_${prefix}_JUP`),
			Markup.button.callback("RAY", `swap_${prefix}_RAY`),
		],
		[Markup.button.callback("❌ Cancel", "swap_cancel")],
	]);

export const swapConfirmKeyboard = Markup.inlineKeyboard([
	[Markup.button.callback("✅ Confirm Swap", "swap_confirm")],
	[Markup.button.callback("❌ Cancel", "swap_cancel")],
]);

export const slippageKeyboard = Markup.inlineKeyboard([
	[
		Markup.button.callback("0.5%", "slippage_0.5"),
		Markup.button.callback("1%", "slippage_1"),
		Markup.button.callback("2%", "slippage_2"),
	],
	[
		Markup.button.callback("3%", "slippage_3"),
		Markup.button.callback("5%", "slippage_5"),
		Markup.button.callback("10%", "slippage_10"),
	],
	[Markup.button.callback("❌ Close", "settings_close")],
]);
