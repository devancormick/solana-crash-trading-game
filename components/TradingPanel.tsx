'use client';

import { useState, useCallback, memo } from 'react';
import { GameState, Position } from '@/types';
import { formatCurrency, formatMultiplier, calculatePnL } from '@/lib/utils';

interface TradingPanelProps {
  gameState: GameState;
  onBuy: (amount: number) => void;
  onSell: (positionId: string, percentage: number) => void;
  isConnected: boolean;
}

const TradingPanel = memo(({ gameState, onBuy, onSell, isConnected }: TradingPanelProps) => {
  const [buyAmount, setBuyAmount] = useState<string>('10');
  const [selectedPosition, setSelectedPosition] = useState<string | null>(null);

  const handleBuy = useCallback(() => {
    const amount = parseFloat(buyAmount);
    if (amount > 0 && gameState.isRunning && !gameState.isCrashed) {
      onBuy(amount);
      setBuyAmount('10');
    }
  }, [buyAmount, gameState.isRunning, gameState.isCrashed, onBuy]);

  const handleSell = useCallback((positionId: string, percentage: number = 100) => {
    onSell(positionId, percentage);
    setSelectedPosition(null);
  }, [onSell]);

  const activePositions = gameState.positions.filter(p => !p.isSold);

  return (
    <div className="bg-crash-card rounded-lg p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Trading</h2>
        <div className="text-right">
          <div className="text-sm text-gray-400">Total PnL</div>
          <div className={`text-2xl font-bold ${
            gameState.totalPnL >= 0 ? 'text-crash-green' : 'text-crash-red'
          }`}>
            {formatCurrency(gameState.totalPnL)}
          </div>
        </div>
      </div>

      {gameState.isRunning && (
        <div className="bg-crash-bg rounded-lg p-4">
          <div className="text-sm text-gray-400 mb-1">Current Multiplier</div>
          <div className="text-3xl font-bold text-crash-green">
            {formatMultiplier(gameState.currentMultiplier)}
          </div>
        </div>
      )}

      {gameState.isCrashed && (
        <div className="bg-red-900/20 border border-red-500 rounded-lg p-4">
          <div className="text-red-400 font-semibold">Crashed!</div>
          <div className="text-sm text-gray-400">
            Crashed at {formatMultiplier(gameState.currentMultiplier)}
          </div>
        </div>
      )}

      <div className="space-y-3">
        <div>
          <label className="block text-sm text-gray-400 mb-2">Buy Amount</label>
          <div className="flex gap-2">
            <input
              type="number"
              value={buyAmount}
              onChange={(e) => setBuyAmount(e.target.value)}
              className="flex-1 bg-crash-bg border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-crash-green"
              placeholder="0.00"
              disabled={!gameState.isRunning || gameState.isCrashed || !isConnected}
            />
            <button
              onClick={handleBuy}
              disabled={!gameState.isRunning || gameState.isCrashed || !isConnected}
              className="px-6 py-2 bg-crash-green text-white rounded-lg font-semibold hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Buy
            </button>
          </div>
        </div>

        {activePositions.length > 0 && (
          <div>
            <div className="text-sm text-gray-400 mb-2">Active Positions</div>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {activePositions.map((position) => {
                const pnl = calculatePnL(position, gameState.currentMultiplier);
                return (
                  <div
                    key={position.id}
                    className="bg-crash-bg rounded-lg p-3 border border-gray-700"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <div className="text-sm text-gray-400">Entry</div>
                        <div className="text-white font-semibold">
                          {formatMultiplier(position.entryMultiplier)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-400">PnL</div>
                        <div className={`font-semibold ${
                          pnl >= 0 ? 'text-crash-green' : 'text-crash-red'
                        }`}>
                          {formatCurrency(pnl)}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSell(position.id, 50)}
                        className="flex-1 px-3 py-1.5 bg-yellow-600 text-white rounded text-sm font-semibold hover:bg-yellow-700 transition-colors"
                      >
                        Sell 50%
                      </button>
                      <button
                        onClick={() => handleSell(position.id, 100)}
                        className="flex-1 px-3 py-1.5 bg-crash-red text-white rounded text-sm font-semibold hover:bg-red-600 transition-colors"
                      >
                        Sell 100%
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

TradingPanel.displayName = 'TradingPanel';

export default TradingPanel;
