 'use client';

import { createChart, ColorType, IChartApi, ISeriesApi, LineStyle } from 'lightweight-charts';
import { useEffect, useRef } from 'react';
import { format } from 'date-fns';

interface PriceData {
  time: number;
  value: number;
}

interface ChartProps {
  data: PriceData[];
  currentPrice: number;
  timeRemaining: number;
  roundStartPrice?: number;
}

const PriceChart = ({ data, currentPrice, timeRemaining, roundStartPrice }: ChartProps) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Area"> | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { color: '#1a1a1a' },
        textColor: '#DDD',
      },
      grid: {
        vertLines: { color: '#2B2B43' },
        horzLines: { color: '#2B2B43' },
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: true,
      },
      width: chartContainerRef.current.clientWidth,
      height: 400,
    });

    const areaSeries = chart.addAreaSeries({
      lineColor: '#2962FF',
      topColor: '#2962FF',
      bottomColor: 'rgba(41, 98, 255, 0.28)',
    });

    chartRef.current = chart;
    seriesRef.current = areaSeries;

    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (chartRef.current) {
        chartRef.current.remove();
      }
    };
  }, []);

  useEffect(() => {
    if (!seriesRef.current) return;
    seriesRef.current.setData(data);
  }, [data]);

  useEffect(() => {
    if (!chartRef.current || !seriesRef.current || !roundStartPrice) return;

    // Add price line for round start
    chartRef.current.addLineSeries({
      color: '#FFE600',
      lineWidth: 2,
      lineStyle: LineStyle.Dashed,
    }).setData([
      { time: data[data.length - 30].time, value: roundStartPrice },
      { time: data[data.length - 1].time, value: roundStartPrice },
    ]);
  }, [roundStartPrice]);

  return (
    <div className="relative">
      <div ref={chartContainerRef} className="w-full" />
      <div className="absolute top-4 right-4 bg-gray-800 p-2 rounded">
        <div className="text-white">
          Price: ${currentPrice.toFixed(2)}
        </div>
        <div className={`text-${timeRemaining <= 10 ? 'red' : 'white'}-500`}>
          Time: {timeRemaining}s
        </div>
      </div>
    </div>
  );
};

export default PriceChart;