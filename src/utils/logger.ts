type LogLevel = "info" | "warn" | "error" | "debug";

class Logger {
	private level: LogLevel = "info";

	setLevel(level: LogLevel): void {
		this.level = level;
	}

	info(...args: any[]): void {
		console.log(`[INFO] ${new Date().toISOString()}`, ...args);
	}

	warn(...args: any[]): void {
		console.warn(`[WARN] ${new Date().toISOString()}`, ...args);
	}

	error(...args: any[]): void {
		console.error(`[ERROR] ${new Date().toISOString()}`, ...args);
	}

	debug(...args: any[]): void {
		if (this.level === "debug") {
			console.log(`[DEBUG] ${new Date().toISOString()}`, ...args);
		}
	}
}

export const logger = new Logger();
