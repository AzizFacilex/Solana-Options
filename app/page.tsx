'use client';

import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useEffect, useState } from 'react';
import BetInterface from '../components/BetInterface';
import BettingHistory from '../components/BettingHistory';
import GameStats from '../components/GameStats';
import PriceChart from '../components/PriceChart';

interface PriceData {
  time: number;
  value: number;
}

interface Bet {
  id: string;
  type: 'CALL' | 'PUT';
  amount: number;
  entryPrice: number;
  timestamp: number;
  result?: 'WIN' | 'LOSS';
  payout?: number;
}

const ROUND_DURATION = 60;
const BET_WINDOW = 30;
const MINIMUM_BET = 0.1;
const PAYOUT_MULTIPLIER = 1.9;

export default function Home() {
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  const [timeRemaining, setTimeRemaining] = useState<number>(30);
  const [priceHistory, setPriceHistory] = useState<PriceData[]>([]);
  const [roundStartPrice, setRoundStartPrice] = useState<number | undefined>(undefined);
  const [gamePhase, setGamePhase] = useState<'betting' | 'locked'>('betting');
  const [bettingHistory, setBettingHistory] = useState<Bet[]>([]);
  const [totalVolume, setTotalVolume] = useState<number>(0);
  const [activePlayers, setActivePlayers] = useState<number>(0);
  
  // Initialize Pyth connection for real-time Solana price
  useEffect(() => {
    const ws = new WebSocket('wss://stream.binance.com:9443/ws/solusdt@ticker');
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const price = parseFloat(data.c); // Current price
      
      setCurrentPrice(price);
      setPriceHistory(prev => {
        const currentTime = Math.floor(Date.now() / 1000);
        const lastTime = prev.length > 0 ? prev[prev.length - 1].time : currentTime - 1;
        const newTime = lastTime >= currentTime ? lastTime + 1 : currentTime;
        
        const newHistory = [...prev, {
          time: newTime,
          value: price
        }];
        
        return newHistory
          .slice(-60)
          .sort((a, b) => a.time - b.time);
      });
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.onclose = () => {
      console.log('WebSocket connection closed');
    };

    return () => {
      ws.close();
    };
  }, []);

  // Game loop logic
  useEffect(() => {
    const gameLoop = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 0) {
          if (gamePhase === 'betting') {
            setGamePhase('locked');
            setRoundStartPrice(currentPrice);
            return BET_WINDOW;
          } else {
            // Settle bets
            setBettingHistory(prev => 
              prev.map(bet => {
                if (!bet.result) {
                  const isWin = (bet.type === 'CALL' && currentPrice > bet.entryPrice) ||
                               (bet.type === 'PUT' && currentPrice < bet.entryPrice);
                  return {
                    ...bet,
                    result: isWin ? 'WIN' : 'LOSS',
                    payout: isWin ? bet.amount * PAYOUT_MULTIPLIER : 0
                  };
                }
                return bet;
              })
            );
            setGamePhase('betting');
            setRoundStartPrice(undefined);
            return ROUND_DURATION - BET_WINDOW;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(gameLoop);
  }, [gamePhase, currentPrice]);

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <nav className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-8">
            <h1 className="text-2xl font-bold text-white">Solana Minute Options</h1>
            <div className="flex gap-4">
              <div className="text-sm bg-gray-800 px-3 py-1 rounded">
                <span className="text-gray-400">24h Volume:</span>
                <span className="text-white ml-2">${totalVolume.toFixed(2)}</span>
              </div>
              <div className="text-sm bg-gray-800 px-3 py-1 rounded">
                <span className="text-gray-400">Active Players:</span>
                <span className="text-white ml-2">{activePlayers}</span>
              </div>
            </div>
          </div>
          <WalletMultiButton className="!bg-blue-600 hover:!bg-blue-700" />
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-white">SOL/USD Chart</h2>
                <div className="flex gap-4 items-center">
                  <div className="text-white bg-gray-700 px-3 py-1 rounded">
                    Phase: {gamePhase.toUpperCase()}
                  </div>
                  <div className={`text-lg font-mono ${timeRemaining <= 10 ? 'text-red-500' : 'text-white'}`}>
                    {timeRemaining}s
                  </div>
                </div>
              </div>
              <PriceChart 
                data={priceHistory}
                currentPrice={currentPrice}
                timeRemaining={timeRemaining}
                roundStartPrice={roundStartPrice}
              />
            </div>

            <BetInterface 
              currentPrice={currentPrice} 
              timeRemaining={timeRemaining}
              disabled={gamePhase === 'locked'}
              onBetSubmit={(type: "CALL" | "PUT", amount: number) => {
                const newBet: Bet = {
                  id: Date.now().toString(),
                  type,
                  amount,
                  entryPrice: currentPrice,
                  timestamp: Date.now(),
                };
                setBettingHistory(prev => [...prev, newBet]);
                setTotalVolume(prev => prev + amount);
                setActivePlayers(prev => prev + 1);
              }}
            />
          </div>

          <div className="space-y-8">
            <GameStats
              totalVolume={totalVolume}
              activePlayers={activePlayers}
              currentPrice={currentPrice}
              payoutMultiplier={PAYOUT_MULTIPLIER}
            />
            <BettingHistory
              bets={bettingHistory}
              currentPrice={currentPrice}
            />
          </div>
        </div>
      </div>
    </div>
  );
} 