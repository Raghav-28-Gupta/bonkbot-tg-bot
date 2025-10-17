export function formatBalance(amount: number, decimals: number = 4): string {
  return amount.toFixed(decimals);
}

export function formatUSD(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

export function formatTokenAmount(amount: string, decimals: number): string {
  return (parseFloat(amount) / Math.pow(10, decimals)).toFixed(6);
}

export function shortenAddress(address: string, chars: number = 4): string {
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

export function escapeMd(text: string): string {
  return text.replace(/[_*[\]()~`>#+=|{}.!-]/g, '\\$&');
}
