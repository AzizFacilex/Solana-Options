interface Bet {
  id: string;
  type: 'CALL' | 'PUT';
  amount: number;
  entryPrice: number;
  result?: 'WIN' | 'LOSS';
  payout?: number;
}

interface BettingHistoryProps {
  bets: Bet[];
  currentPrice: number;
}

export default function BettingHistory({ bets, currentPrice }: BettingHistoryProps) {
  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
      <h2 className="text-xl font-semibold text-white mb-4">Your Bets</h2>
      <div className="space-y-4">
        {bets.slice().reverse().map(bet => (
          <div key={bet.id} className="bg-gray-700 p-4 rounded">
            <div className="flex justify-between mb-2">
              <span className={bet.type === 'CALL' ? 'text-green-500' : 'text-red-500'}>
                {bet.type}
              </span>
              <span className="text-white font-mono">{bet.amount} SOL</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Entry: ${bet.entryPrice.toFixed(2)}</span>
              {bet.result && (
                <span className={bet.result === 'WIN' ? 'text-green-500' : 'text-red-500'}>
                  {bet.result}: {bet.payout?.toFixed(2)} SOL
                </span>
              )}
            </div>
          </div>
        ))}
        {bets.length === 0 && (
          <div className="text-gray-400 text-center">No bets placed yet</div>
        )}
      </div>
    </div>
  );
} 