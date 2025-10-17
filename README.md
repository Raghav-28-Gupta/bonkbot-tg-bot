# SolSwap Telegram Bot

A production-ready Telegram bot for swapping tokens on Solana using Jupiter Aggregator.

## Features

- ✅ Non-custodial wallet management
- ✅ Token swaps via Jupiter API V1
- ✅ Real-time price feeds
- ✅ Balance checking
- ✅ Configurable slippage
- ✅ TypeScript + Bun

## Setup

1. Install dependencies:

2. Copy `.env.example` to `.env` and configure:

3. Get your Telegram bot token from [@BotFather](https://t.me/BotFather)

4. Update `.env` with your token: TELEGRAM_BOT_TOKEN=your_token_here

## Development

bun run dev

## Production

bun run build
bun run start

## Commands

- `/start` - Initialize wallet
- `/balance` - Check balances
- `/swap` - Swap tokens
- `/prices` - View prices
- `/settings` - Configure slippage
- `/export` - Export private key

## Architecture

- **src/bot/** - Bot logic and handlers
- **src/services/** - Jupiter and Solana services
- **src/store/** - User data management
- **src/config/** - Configuration
- **src/utils/** - Utilities

## Security

- Private keys stored in-memory (not persisted)
- Export messages auto-delete after 60s
- Non-custodial architecture

## License

MIT

# Install dependencies
bun install

# Create .env file
cp .env.example .env

# Edit .env with your bot token
nano .env

# Run in development mode
bun run dev

# Build for production
bun run build

# Run in production
bun run start

