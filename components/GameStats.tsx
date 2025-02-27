interface GameStatsProps {
  totalVolume: number;
  activePlayers: number;
  currentPrice: number;
  payoutMultiplier: number;
}

export default function GameStats({ totalVolume, activePlayers, currentPrice, payoutMultiplier }: GameStatsProps) {
  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
      <h2 className="text-xl font-semibold text-white mb-4">Game Stats</h2>
      <div className="space-y-4">
        <div className="flex justify-between">
          <span className="text-gray-400">SOL Price</span>
          <span className="text-white font-mono">${currentPrice.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">24h Volume</span>
          <span className="text-white font-mono">${totalVolume.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Active Players</span>
          <span className="text-white font-mono">{activePlayers}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Payout Multiplier</span>
          <span className="text-white font-mono">{payoutMultiplier}x</span>
        </div>
      </div>
    </div>
  );
} 