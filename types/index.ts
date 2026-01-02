export interface Candle {
  id: string;
  multiplier: number;
  timestamp: number;
  crashed: boolean;
}

export interface Position {
  id: string;
  entryMultiplier: number;
  entryTimestamp: number;
  amount: number;
  exitMultiplier?: number;
  exitTimestamp?: number;
  isSold: boolean;
}

export interface Marker {
  id: string;
  positionId: string;
  multiplier: number;
  timestamp: number;
  type: 'entry' | 'exit';
  x: number;
  y: number;
}

export interface GameState {
  currentMultiplier: number;
  isRunning: boolean;
  isCrashed: boolean;
  candles: Candle[];
  positions: Position[];
  markers: Marker[];
  totalPnL: number;
  averagePrice: number;
}

export interface ChartConfig {
  width: number;
  height: number;
  padding: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  candleWidth: number;
  maxCandles: number;
}
