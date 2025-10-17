import { Telegraf, session } from "telegraf";
import type { BotContext } from "../types";
import { DataStore } from "../store/data-store";
import { SolanaService } from "../services/solana.service";
import { JupiterService } from "../services/jupiter.service";
import { CommandHandlers } from "./handlers/commands";
import { ActionHandlers } from "./handlers/actions";
import { MessageHandlers } from "./handlers/messages";
import { config } from "../config/config";
import { logger } from "../utils/logger";

export class SolSwapBot {
	private bot: Telegraf<BotContext>;
	private store: DataStore;
	private solanaService: SolanaService;
	private jupiterService: JupiterService;
	private commandHandlers: CommandHandlers;
	private actionHandlers: ActionHandlers;
	private messageHandlers: MessageHandlers;

	constructor() {
		this.bot = new Telegraf<BotContext>(config.botToken);
		
		// Add session middleware
		this.bot.use(session());
		
		this.store = new DataStore();
		this.solanaService = new SolanaService();
		this.jupiterService = new JupiterService(
			this.solanaService.getConnection()
		);

		this.commandHandlers = new CommandHandlers(
			this.store,
			this.solanaService,
			this.jupiterService
		);
		this.actionHandlers = new ActionHandlers(
			this.store,
			this.jupiterService
		);
		this.messageHandlers = new MessageHandlers(
			this.store,
			this.jupiterService
		);

		this.setupHandlers();
	}

	private setupHandlers(): void {
		// Commands
		this.bot.command("start", (ctx) =>
			this.commandHandlers.handleStart(ctx)
		);
		this.bot.command("balance", (ctx) =>
			this.commandHandlers.handleBalance(ctx)
		);
		this.bot.command("swap", (ctx) => this.commandHandlers.handleSwap(ctx));
		this.bot.command("prices", (ctx) =>
			this.commandHandlers.handlePrices(ctx)
		);
		this.bot.command("settings", (ctx) =>
			this.commandHandlers.handleSettings(ctx)
		);
		this.bot.command("deposit", (ctx) =>
			this.commandHandlers.handleDeposit(ctx)
		);
		this.bot.command("withdraw", (ctx) =>
			this.commandHandlers.handleWithdraw(ctx)
		);
		this.bot.command("export", (ctx) =>
			this.commandHandlers.handleExport(ctx)
		);
		this.bot.command("help", (ctx) => this.commandHandlers.handleHelp(ctx));

		// Actions
		this.bot.action(/swap_input_(.+)/, (ctx) =>
			this.actionHandlers.handleSwapInputToken(ctx)
		);
		this.bot.action(/swap_output_(.+)/, (ctx) =>
			this.actionHandlers.handleSwapOutputToken(ctx)
		);
		this.bot.action("swap_confirm", (ctx) =>
			this.actionHandlers.handleSwapConfirm(ctx)
		);
		this.bot.action("swap_cancel", (ctx) =>
			this.actionHandlers.handleSwapCancel(ctx)
		);
		this.bot.action(/slippage_(.+)/, (ctx) =>
			this.actionHandlers.handleSlippageChange(ctx)
		);
		this.bot.action("settings_close", (ctx) =>
			this.actionHandlers.handleSettingsClose(ctx)
		);

		// Text messages
		this.bot.on("text", (ctx) => this.messageHandlers.handleText(ctx));

		// Keyboard shortcuts
		this.bot.hears("💰 Balance", (ctx) =>
			this.commandHandlers.handleBalance(ctx)
		);
		this.bot.hears("🔄 Swap", (ctx) =>
			this.commandHandlers.handleSwap(ctx)
		);
		this.bot.hears("📊 Prices", (ctx) =>
			this.commandHandlers.handlePrices(ctx)
		);
		this.bot.hears("⚙️ Settings", (ctx) =>
			this.commandHandlers.handleSettings(ctx)
		);
		this.bot.hears("❓ Help", (ctx) =>
			this.commandHandlers.handleHelp(ctx)
		);

		// Error handler
		this.bot.catch((err, ctx) => {
			logger.error("Bot error:", err);
			ctx.reply("❌ An error occurred. Please try again or contact support.");
		});
	}

	public launch(): void {
		logger.info("🤖 Starting SolSwap Telegram Bot...");
		logger.info("📡 Using Jupiter API V1 (lite-api.jup.ag)");
		logger.info("🔗 RPC:", config.rpcUrl);

		this.bot
			.launch()
			.then(() => {
				logger.info("✅ Bot is running!");
				logger.info("💡 Use /start in Telegram to begin");
			})
			.catch((err) => {
				logger.error("❌ Failed to start bot:", err);
				process.exit(1);
			});

		// Graceful shutdown
		process.once("SIGINT", () => {
			logger.info("⚠️ SIGINT received, stopping bot...");
			this.bot.stop("SIGINT");
		});

		process.once("SIGTERM", () => {
			logger.info("⚠️ SIGTERM received, stopping bot...");
			this.bot.stop("SIGTERM");
		});
	}
}
