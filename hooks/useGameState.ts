import { useState, useCallback, useRef, useEffect } from 'react';
import { GameState, Candle, Position, Marker } from '@/types';
import { calculateAveragePrice, calculateTotalPnL, generateCrashMultiplier } from '@/lib/utils';

const INITIAL_STATE: GameState = {
  currentMultiplier: 1.0,
  isRunning: false,
  isCrashed: false,
  candles: [],
  positions: [],
  markers: [],
  totalPnL: 0,
  averagePrice: 0,
};

export function useGameState() {
  const [state, setState] = useState<GameState>(INITIAL_STATE);
  const animationFrameRef = useRef<number>();
  const lastUpdateRef = useRef<number>(0);
  const crashedMultiplierRef = useRef<number>(0);
  const isSellingRef = useRef<boolean>(false);

  const startGame = useCallback(() => {
    const crashMultiplier = generateCrashMultiplier();
    crashedMultiplierRef.current = crashMultiplier;
    
    setState(prev => ({
      ...prev,
      isRunning: true,
      isCrashed: false,
      currentMultiplier: 1.0,
    }));

    lastUpdateRef.current = Date.now();
  }, []);

  const stopGame = useCallback(() => {
    setState(prev => ({
      ...prev,
      isRunning: false,
      isCrashed: true,
    }));
  }, []);

  const buyPosition = useCallback((amount: number) => {
    if (!state.isRunning || state.isCrashed) return null;

    const position: Position = {
      id: `pos-${Date.now()}-${Math.random()}`,
      entryMultiplier: state.currentMultiplier,
      entryTimestamp: Date.now(),
      amount,
      isSold: false,
    };

    setState(prev => ({
      ...prev,
      positions: [...prev.positions, position],
      averagePrice: calculateAveragePrice([...prev.positions, position]),
    }));

    return position;
  }, [state.isRunning, state.isCrashed, state.currentMultiplier]);

  const sellPosition = useCallback((positionId: string, percentage: number = 100) => {
    if (isSellingRef.current) return;
    isSellingRef.current = true;

    setState(prev => {
      const position = prev.positions.find(p => p.id === positionId);
      if (!position || position.isSold) {
        isSellingRef.current = false;
        return prev;
      }

      const currentMultiplier = prev.currentMultiplier;
      const sellAmount = position.amount * (percentage / 100);
      const remainingAmount = position.amount - sellAmount;

      if (percentage >= 100) {
        const updatedPosition: Position = {
          ...position,
          exitMultiplier: currentMultiplier,
          exitTimestamp: Date.now(),
          isSold: true,
          amount: 0,
        };

        const updatedPositions = prev.positions.map(p =>
          p.id === positionId ? updatedPosition : p
        );

        const frozenPnL = calculateTotalPnL(updatedPositions, currentMultiplier);

        setTimeout(() => {
          isSellingRef.current = false;
        }, 0);

        return {
          ...prev,
          positions: updatedPositions,
          totalPnL: frozenPnL,
          averagePrice: calculateAveragePrice(updatedPositions),
        };
      } else {
        const soldPosition: Position = {
          ...position,
          exitMultiplier: currentMultiplier,
          exitTimestamp: Date.now(),
          isSold: true,
          amount: sellAmount,
        };

        const remainingPosition: Position = {
          ...position,
          amount: remainingAmount,
        };

        const updatedPositions = prev.positions
          .filter(p => p.id !== positionId)
          .concat([soldPosition, remainingPosition]);

        const frozenPnL = calculateTotalPnL(updatedPositions, currentMultiplier);

        setTimeout(() => {
          isSellingRef.current = false;
        }, 0);

        return {
          ...prev,
          positions: updatedPositions,
          totalPnL: frozenPnL,
          averagePrice: calculateAveragePrice(updatedPositions),
        };
      }
    });
  }, []);

  useEffect(() => {
    if (!state.isRunning || state.isCrashed) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      return;
    }

    const update = () => {
      const now = Date.now();
      const delta = now - lastUpdateRef.current;
      lastUpdateRef.current = now;

      setState(prev => {
        const increment = (delta / 1000) * 0.1;
        const newMultiplier = Math.min(
          prev.currentMultiplier + increment,
          crashedMultiplierRef.current
        );

        if (newMultiplier >= crashedMultiplierRef.current) {
          return {
            ...prev,
            currentMultiplier: crashedMultiplierRef.current,
            isRunning: false,
            isCrashed: true,
          };
        }

        const newCandle: Candle = {
          id: `candle-${now}`,
          multiplier: newMultiplier,
          timestamp: now,
          crashed: false,
        };

        const updatedCandles = [...prev.candles.slice(-99), newCandle];

        const activePositions = prev.positions.filter(p => !p.isSold);
        const newTotalPnL = activePositions.length > 0
          ? calculateTotalPnL(prev.positions, newMultiplier)
          : prev.totalPnL;

        return {
          ...prev,
          currentMultiplier: newMultiplier,
          candles: updatedCandles,
          totalPnL: newTotalPnL,
        };
      });

      animationFrameRef.current = requestAnimationFrame(update);
    };

    animationFrameRef.current = requestAnimationFrame(update);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [state.isRunning, state.isCrashed]);

  const resetGame = useCallback(() => {
    setState(INITIAL_STATE);
    crashedMultiplierRef.current = 0;
    lastUpdateRef.current = 0;
    isSellingRef.current = false;
  }, []);

  return {
    state,
    startGame,
    stopGame,
    buyPosition,
    sellPosition,
    resetGame,
  };
}
