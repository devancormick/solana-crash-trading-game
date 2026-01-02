'use client';

import { useEffect, useRef, useMemo, memo } from 'react';
import { GameState, ChartConfig, Marker } from '@/types';
import {
  getCandleX,
  getMultiplierY,
  getMultiplierColor,
  createGradient,
  formatMultiplier,
} from '@/lib/utils';

interface CrashChartProps {
  gameState: GameState;
  config: ChartConfig;
}

const CrashChart = memo(({ gameState, config }: CrashChartProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gradientCacheRef = useRef<Map<string, CanvasGradient>>(new Map());
  const lastRenderRef = useRef<number>(0);

  const visibleCandles = useMemo(() => {
    return gameState.candles.slice(-config.maxCandles);
  }, [gameState.candles, config.maxCandles]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const now = Date.now();
    if (now - lastRenderRef.current < 16) return;
    lastRenderRef.current = now;

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, config.width, config.height);

    if (visibleCandles.length === 0) return;

    const chartWidth = config.width - config.padding.left - config.padding.right;
    const chartHeight = config.height - config.padding.top - config.padding.bottom;
    const maxMultiplier = Math.max(...visibleCandles.map(c => c.multiplier), 5.0);
    const minMultiplier = 1.0;

    ctx.save();
    ctx.beginPath();
    ctx.rect(
      config.padding.left,
      config.padding.top,
      chartWidth,
      chartHeight
    );
    ctx.clip();

    const path = new Path2D();
    let firstPoint = true;

    visibleCandles.forEach((candle, index) => {
      const x = getCandleX(index, config);
      const normalizedMultiplier = (candle.multiplier - minMultiplier) / (maxMultiplier - minMultiplier);
      const y = config.padding.top + chartHeight * (1 - normalizedMultiplier);

      if (firstPoint) {
        path.moveTo(x, y);
        firstPoint = false;
      } else {
        path.lineTo(x, y);
      }
    });

    if (gameState.isRunning && visibleCandles.length > 0) {
      const lastCandle = visibleCandles[visibleCandles.length - 1];
      const lastX = getCandleX(visibleCandles.length - 1, config);
      const lastNormalized = (lastCandle.multiplier - minMultiplier) / (maxMultiplier - minMultiplier);
      const lastY = config.padding.top + chartHeight * (1 - lastNormalized);
      path.lineTo(lastX, lastY);
    }

    ctx.strokeStyle = getMultiplierColor(gameState.currentMultiplier);
    ctx.lineWidth = 2;
    ctx.stroke(path);

    const gradientKey = `${gameState.currentMultiplier}-${visibleCandles.length}`;
    let gradient = gradientCacheRef.current.get(gradientKey);

    if (!gradient && visibleCandles.length > 1) {
      const firstX = getCandleX(0, config);
      const lastX = getCandleX(visibleCandles.length - 1, config);
      const firstY = getMultiplierY(visibleCandles[0].multiplier, config);
      const lastY = getMultiplierY(visibleCandles[visibleCandles.length - 1].multiplier, config);

      gradient = createGradient(
        ctx,
        firstX,
        firstY,
        lastX,
        lastY,
        getMultiplierColor(visibleCandles[0].multiplier) + '40',
        getMultiplierColor(gameState.currentMultiplier) + '40'
      );
      gradientCacheRef.current.set(gradientKey, gradient);
    }

    if (gradient && visibleCandles.length > 1) {
      const fillPath = new Path2D(path);
      const lastX = getCandleX(visibleCandles.length - 1, config);
      const lastY = config.padding.top + chartHeight;
      fillPath.lineTo(lastX, lastY);
      fillPath.lineTo(config.padding.left, config.padding.top + chartHeight);
      fillPath.closePath();

      ctx.fillStyle = gradient;
      ctx.fill(fillPath);
    }

    if (gameState.averagePrice > 0 && gameState.positions.some(p => !p.isSold)) {
      const avgX = config.padding.left;
      const avgEndX = config.width - config.padding.right;
      const avgY = getMultiplierY(gameState.averagePrice, config);

      ctx.strokeStyle = '#8b5cf6';
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(avgX, avgY);
      ctx.lineTo(avgEndX, avgY);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    gameState.positions.forEach((position) => {
      if (position.isSold) return;

      const candleIndex = visibleCandles.findIndex(
        c => c.timestamp >= position.entryTimestamp
      );

      if (candleIndex === -1) return;

      const x = getCandleX(candleIndex, config);
      const y = getMultiplierY(position.entryMultiplier, config);

      ctx.fillStyle = '#3b82f6';
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x, config.padding.top + chartHeight);
      ctx.stroke();
    });

    ctx.restore();

    ctx.fillStyle = '#ffffff';
    ctx.font = '12px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(
      `Current: ${formatMultiplier(gameState.currentMultiplier)}`,
      config.padding.left,
      config.padding.top - 5
    );

    if (gameState.averagePrice > 0) {
      ctx.fillStyle = '#8b5cf6';
      ctx.fillText(
        `Avg: ${formatMultiplier(gameState.averagePrice)}`,
        config.padding.left + 120,
        config.padding.top - 5
      );
    }
  }, [gameState, config, visibleCandles]);

  return (
    <canvas
      ref={canvasRef}
      width={config.width}
      height={config.height}
      className="w-full h-full"
    />
  );
});

CrashChart.displayName = 'CrashChart';

export default CrashChart;
