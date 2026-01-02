import { Candle, Position, Marker, ChartConfig } from '@/types';

export function calculatePnL(position: Position, currentMultiplier: number): number {
  if (position.isSold && position.exitMultiplier) {
    return (position.exitMultiplier - position.entryMultiplier) * position.amount;
  }
  return (currentMultiplier - position.entryMultiplier) * position.amount;
}

export function calculateAveragePrice(positions: Position[]): number {
  if (positions.length === 0) return 0;
  const activePositions = positions.filter(p => !p.isSold);
  if (activePositions.length === 0) return 0;
  
  const totalValue = activePositions.reduce((sum, p) => sum + p.entryMultiplier * p.amount, 0);
  const totalAmount = activePositions.reduce((sum, p) => sum + p.amount, 0);
  return totalAmount > 0 ? totalValue / totalAmount : 0;
}

export function calculateTotalPnL(positions: Position[], currentMultiplier: number): number {
  return positions.reduce((sum, position) => {
    if (position.isSold && position.exitMultiplier) {
      return sum + (position.exitMultiplier - position.entryMultiplier) * position.amount;
    }
    return sum + (currentMultiplier - position.entryMultiplier) * position.amount;
  }, 0);
}

export function generateCrashMultiplier(): number {
  const random = Math.random();
  if (random < 0.1) return 1.0;
  if (random < 0.3) return 1.0 + Math.random() * 0.5;
  if (random < 0.6) return 1.5 + Math.random() * 1.0;
  return 2.0 + Math.random() * 3.0;
}

export function getMultiplierColor(multiplier: number): string {
  if (multiplier < 1.5) return '#ef4444';
  if (multiplier < 2.0) return '#f59e0b';
  return '#10b981';
}

export function formatMultiplier(multiplier: number): string {
  return multiplier.toFixed(2) + 'x';
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function getCandleX(index: number, config: ChartConfig): number {
  return config.padding.left + index * config.candleWidth;
}

export function getMultiplierY(multiplier: number, config: ChartConfig): number {
  const maxMultiplier = 5.0;
  const normalized = Math.min(multiplier / maxMultiplier, 1);
  return config.padding.top + (config.height - config.padding.top - config.padding.bottom) * (1 - normalized);
}

export function createGradient(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  color1: string,
  color2: string
): CanvasGradient {
  const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
  gradient.addColorStop(0, color1);
  gradient.addColorStop(1, color2);
  return gradient;
}
