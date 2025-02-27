import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { FC, useState } from 'react';

interface BetInterfaceProps {
  currentPrice: number;
  timeRemaining: number;
  disabled?: boolean;
  onBetSubmit: (type: "CALL" | "PUT", amount: number) => void;
}

const BetInterface: FC<BetInterfaceProps> = ({ currentPrice, timeRemaining, disabled }) => {
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const [betAmount, setBetAmount] = useState<number>(0);
  
  const placeBet = async (direction: 'CALL' | 'PUT') => {
    if (!publicKey) return;
    
    try {
      // TODO: Implement bet transaction logic
      console.log(`Placing ${direction} bet with amount: ${betAmount}`);
    } catch (error) {
      console.error('Error placing bet:', error);
    }
  };

  return (
    <div className="flex flex-col gap-4 p-6 bg-gray-800 rounded-lg">
      <div className="flex justify-between items-center">
        <span className="text-white">Current SOL Price: ${currentPrice}</span>
        <span className="text-white">Time Remaining: {timeRemaining}s</span>
      </div>
      
      <input
        type="number"
        min="0"
        step="0.1"
        value={betAmount}
        onChange={(e) => setBetAmount(Number(e.target.value))}
        className="p-2 rounded bg-gray-700 text-white"
        placeholder="Enter bet amount in SOL"
      />
      
      <div className="flex gap-4">
        <button
          onClick={() => placeBet('CALL')}
          className="flex-1 py-3 bg-green-500 hover:bg-green-600 rounded text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!publicKey || disabled}
        >
          CALL ↑
        </button>
        <button
          onClick={() => placeBet('PUT')}
          className="flex-1 py-3 bg-red-500 hover:bg-red-600 rounded text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!publicKey || disabled}
        >
          PUT ↓
        </button>
      </div>
      
      {disabled && (
        <p className="text-yellow-400 text-center">
          Betting is locked for this round
        </p>
      )}
      
      {!publicKey && (
        <p className="text-yellow-400 text-center">
          Please connect your wallet to place bets
        </p>
      )}
    </div>
  );
};

export default BetInterface; 