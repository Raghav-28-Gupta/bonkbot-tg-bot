import { validateConfig } from "./config/config";
import { SolSwapBot } from "./bot/bot";
import { logger } from "./utils/logger";

// Validate configuration
try {
	validateConfig();
} catch (error) {
	logger.error("Configuration error:", error);
	process.exit(1);
}

// Launch bot
const bot = new SolSwapBot();
bot.launch();
