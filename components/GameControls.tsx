'use client';

import { memo } from 'react';

interface GameControlsProps {
  isRunning: boolean;
  isCrashed: boolean;
  onStart: () => void;
  onReset: () => void;
}

const GameControls = memo(({ isRunning, isCrashed, onStart, onReset }: GameControlsProps) => {
  return (
    <div className="flex gap-3">
      {!isRunning && !isCrashed && (
        <button
          onClick={onStart}
          className="px-6 py-3 bg-crash-green text-white rounded-lg font-semibold hover:bg-green-600 transition-colors"
        >
          Start Round
        </button>
      )}
      {isCrashed && (
        <button
          onClick={onReset}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          New Round
        </button>
      )}
    </div>
  );
});

GameControls.displayName = 'GameControls';

export default GameControls;
