'use client';

import { useMemo } from 'react';
import { useGameState } from '@/hooks/useGameState';
import CrashChart from '@/components/CrashChart';
import TradingPanel from '@/components/TradingPanel';
import GameControls from '@/components/GameControls';
import ErrorBoundary from '@/components/ErrorBoundary';
import { ChartConfig } from '@/types';

export default function Home() {
  const { state, startGame, buyPosition, sellPosition, resetGame } = useGameState();

  const chartConfig: ChartConfig = useMemo(() => ({
    width: 1200,
    height: 400,
    padding: {
      top: 40,
      right: 20,
      bottom: 40,
      left: 60,
    },
    candleWidth: 4,
    maxCandles: 200,
  }), []);

  const handleBuy = (amount: number) => {
    buyPosition(amount);
  };

  const handleSell = (positionId: string, percentage: number) => {
    sellPosition(positionId, percentage);
  };

  const handleReset = () => {
    resetGame();
  };

  return (
    <main className="min-h-screen bg-crash-bg p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">Solana Crash Trading Game</h1>
          <GameControls
            isRunning={state.isRunning}
            isCrashed={state.isCrashed}
            onStart={startGame}
            onReset={handleReset}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-crash-card rounded-lg p-4">
              <ErrorBoundary>
                <CrashChart gameState={state} config={chartConfig} />
              </ErrorBoundary>
            </div>
          </div>

          <div className="lg:col-span-1">
            <ErrorBoundary>
              <TradingPanel
                gameState={state}
                onBuy={handleBuy}
                onSell={handleSell}
                isConnected={true}
              />
            </ErrorBoundary>
          </div>
        </div>

        <div className="bg-crash-card rounded-lg p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-sm text-gray-400">Total Positions</div>
              <div className="text-xl font-bold text-white">{state.positions.length}</div>
            </div>
            <div>
              <div className="text-sm text-gray-400">Active Positions</div>
              <div className="text-xl font-bold text-white">
                {state.positions.filter(p => !p.isSold).length}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-400">Total Candles</div>
              <div className="text-xl font-bold text-white">{state.candles.length}</div>
            </div>
            <div>
              <div className="text-sm text-gray-400">Status</div>
              <div className="text-xl font-bold text-white">
                {state.isRunning ? 'Running' : state.isCrashed ? 'Crashed' : 'Waiting'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
