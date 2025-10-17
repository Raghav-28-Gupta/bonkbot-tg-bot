# 🤖 SolSwap Telegram Bot

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Bun](https://img.shields.io/badge/runtime-Bun-FFDB1E.svg)
![Solana](https://img.shields.io/badge/blockchain-Solana-00FFBD.svg)

A professional, non-custodial Telegram bot for seamless token swapping on Solana using Jupiter Aggregator.

[Features](#features) • [Installation](#installation) • [Usage](#usage) • [Architecture](#architecture) • [Security](#security)

</div>

## ✨ Features

| Category | Features |
|----------|----------|
| **🔐 Wallet Management** | Non-custodial wallets, In-memory key storage, Secure key export |
| **💱 Trading** | Jupiter DEX aggregation, Real-time price feeds, Configurable slippage, Multi-token support |
| **🛡️ Security** | Auto-delete sensitive messages, No persistent storage, Secure key handling |
| **👨‍💻 User Experience** | Intuitive Telegram interface, Balance checking, Price monitoring, Quick swaps |

## 🚀 Quick Start

### Prerequisites

- [Bun](https://bun.sh) runtime (v1.0.0 or higher)
- Telegram Bot Token from [@BotFather](https://t.me/BotFather)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/solswap-telegram-bot
cd solswap-telegram-bot

# Install dependencies
bun install

# Configure environment
cp .env.example .env

# Edit configuration
nano .env
```

### Environment Configuration

```env
# Required
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here

# Optional (with defaults)
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
JUPITER_API_URL=https://quote-api.jup.ag/v6
DEFAULT_SLIPPAGE=1.0
```

## 🎯 Usage

### Development

```bash
# Run in development mode with hot reload
bun run dev
```

### Production

```bash
# Build the project
bun run build

# Start production server
bun run start
```

## 🤖 Bot Commands

| Command | Description | Usage |
|---------|-------------|-------|
| `/start` | Initialize your wallet | `/start` |
| `/balance` | Check token balances | `/balance` |
| `/swap` | Execute token swap | `/swap <amount> <from_token> <to_token>` |
| `/prices` | View real-time prices | `/prices SOL USDC` |
| `/settings` | Configure trading settings | `/settings slippage 0.5` |
| `/export` | Export private key (auto-deletes) | `/export` |

### Example Swap

```bash
/swap 1 SOL USDC
# Swaps 1 SOL to USDC with current market rates
```

## 🏗 Architecture

```
src/
├── bot/           # Telegram bot handlers
│   ├── commands/  # Slash command implementations
│   └── middleware/# Message processing middleware
├── services/      # External service integrations
│   ├── jupiter/   # Jupiter swap functionality
│   └── solana/    # Solana blockchain interactions
├── store/         # User data management
├── config/        # Application configuration
└── utils/         # Helper functions and utilities
```

### Key Components

- **Bot Layer**: Telegram interaction handling
- **Service Layer**: Blockchain and DEX integrations
- **Store Layer**: In-memory user session management
- **Config Layer**: Environment-based configuration

## 🔒 Security

### Security Features

- ✅ **Non-custodial**: Users control their private keys
- ✅ **In-memory Storage**: Keys never persisted to disk
- ✅ **Auto-deletion**: Sensitive messages deleted after 60s
- ✅ **No Withdrawals**: Bot cannot initiate transfers
- ✅ **Input Validation**: All user inputs rigorously validated

### Security Best Practices

```typescript
// Example: Secure key handling
class WalletManager {
  private keys: Map<string, Uint8Array> = new Map();
  
  // Keys are stored only in memory
  async createWallet(userId: string): Promise<string> {
    const keypair = Keypair.generate();
    this.keys.set(userId, keypair.secretKey);
    return keypair.publicKey.toString();
  }
  
  // Automatic cleanup
  cleanupUser(userId: string) {
    this.keys.delete(userId);
  }
}
```

## 📊 Example Workflow

1. **Start** → User initiates bot with `/start`
2. **Fund** → User deposits SOL to generated wallet
3. **Swap** → User executes trades with `/swap`
4. **Monitor** → User checks balances with `/balance`
5. **Export** → User can export keys with `/export`

## 🛠 Development

### Adding New Commands

```typescript
// src/bot/commands/price.ts
export const priceCommand = new Composer();

priceCommand.command('prices', async (ctx) => {
  const [tokenA, tokenB] = ctx.message.text.split(' ').slice(1);
  const price = await getPrice(tokenA, tokenB);
  
  await ctx.replyWithMarkdownV2(
    `💹 *Current Price*\n` +
    `${tokenA} → ${tokenB}: $${price}`
  );
});
```

### Testing

```bash
# Run test suite
bun test

# Run with coverage
bun test --coverage
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- 📖 [Documentation](https://docs.solswap.com)
- 💬 [Telegram Support Group](https://t.me/solswap_support)
- 🐛 [Issue Tracker](https://github.com/your-org/solswap-telegram-bot/issues)

---

<div align="center">

**Built with ❤️ using Bun, Solana Web3.js, and Telegraf**

[Report Bug](https://github.com/your-org/solswap-telegram-bot/issues) • [Request Feature](https://github.com/your-org/solswap-telegram-bot/issues)

</div>

