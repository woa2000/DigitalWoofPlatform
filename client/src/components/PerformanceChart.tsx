/**
 * Componente de gráfico para visualização de performance
 * 
 * Suporte para line charts, bar charts, pie charts e área charts
 * com interatividade e responsividade
 */

import React, { useMemo } from 'react';
import { MetricTimeSeries } from '../hooks/usePerformance';
import { Skeleton } from './ui/skeleton';

// Simulação de biblioteca de charts (Recharts)
interface ChartProps {
  data: MetricTimeSeries[];
  type: 'line' | 'bar' | 'pie' | 'area';
  height?: number;
  loading?: boolean;
  colors?: string[];
  showLegend?: boolean;
  showTooltip?: boolean;
  showGrid?: boolean;
}

export function PerformanceChart({
  data,
  type,
  height = 300,
  loading,
  colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'],
  showLegend = true,
  showTooltip = true,
  showGrid = true
}: ChartProps) {
  // Transform data for chart consumption
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];

    if (type === 'pie') {
      // For pie charts, aggregate latest values
      return data.map((series, index) => ({
        name: series.metricName,
        value: series.data.length > 0 ? series.data[series.data.length - 1].value : 0,
        color: colors[index % colors.length]
      }));
    }

    // For time series charts, combine all series data
    const timePoints: string[] = [];
    data.forEach(series => {
      series.data.forEach(point => {
        if (!timePoints.includes(point.timestamp)) {
          timePoints.push(point.timestamp);
        }
      });
    });

    timePoints.sort();

    return timePoints.map(timestamp => {
      const dataPoint: any = { timestamp };
      data.forEach(series => {
        const point = series.data.find(p => p.timestamp === timestamp);
        dataPoint[series.metricName] = point?.value || 0;
      });
      return dataPoint;
    });
  }, [data, type, colors]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="w-full" style={{ height }} />
        {showLegend && (
          <div className="flex items-center gap-4 justify-center">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-2">
                <Skeleton className="h-3 w-3 rounded-full" />
                <Skeleton className="h-3 w-16" />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (!data || data.length === 0 || chartData.length === 0) {
    return (
      <div 
        className="flex items-center justify-center border border-dashed border-muted-foreground/25 rounded-lg"
        style={{ height }}
      >
        <div className="text-center text-muted-foreground">
          <p className="text-sm">Nenhum dado disponível</p>
          <p className="text-xs">Ajuste os filtros para ver os dados</p>
        </div>
      </div>
    );
  }

  // Format timestamp for display
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('pt-BR', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Format value for display
  const formatValue = (value: number, unit?: string) => {
    if (unit === 'percentage') {
      return `${value.toFixed(1)}%`;
    } else if (unit === 'currency') {
      return new Intl.NumberFormat('pt-BR', { 
        style: 'currency', 
        currency: 'BRL',
        notation: 'compact',
        maximumFractionDigits: 1
      }).format(value);
    } else if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toLocaleString('pt-BR');
  };

  // Render different chart types
  const renderChart = () => {
    switch (type) {
      case 'line':
        return <LineChart />;
      case 'bar':
        return <BarChart />;
      case 'pie':
        return <PieChart />;
      case 'area':
        return <AreaChart />;
      default:
        return <LineChart />;
    }
  };

  // Line Chart Component
  function LineChart() {
    const maxValue = Math.max(...chartData.flatMap(d => 
      Object.values(d).filter(v => typeof v === 'number') as number[]
    ));
    
    const padding = 40;
    const chartWidth = 800 - padding * 2;
    const chartHeight = height - padding * 2;

    return (
      <div className="relative">
        <svg width="100%" height={height} viewBox={`0 0 800 ${height}`}>
          {/* Grid lines */}
          {showGrid && (
            <g stroke="#e5e7eb" strokeWidth="1" opacity="0.5">
              {Array.from({ length: 5 }).map((_, i) => {
                const y = padding + (chartHeight / 4) * i;
                return (
                  <line key={i} x1={padding} y1={y} x2={800 - padding} y2={y} />
                );
              })}
            </g>
          )}

          {/* Lines */}
          {data.map((series, seriesIndex) => {
            const color = colors[seriesIndex % colors.length];
            const points = chartData.map((d, i) => {
              const x = padding + (chartWidth / (chartData.length - 1)) * i;
              const value = d[series.metricName] || 0;
              const y = padding + chartHeight - (value / maxValue) * chartHeight;
              return `${x},${y}`;
            }).join(' ');

            return (
              <g key={series.metricId}>
                <polyline
                  points={points}
                  fill="none"
                  stroke={color}
                  strokeWidth="2"
                />
                {/* Data points */}
                {chartData.map((d, i) => {
                  const x = padding + (chartWidth / (chartData.length - 1)) * i;
                  const value = d[series.metricName] || 0;
                  const y = padding + chartHeight - (value / maxValue) * chartHeight;
                  return (
                    <circle
                      key={i}
                      cx={x}
                      cy={y}
                      r="3"
                      fill={color}
                    />
                  );
                })}
              </g>
            );
          })}

          {/* X-axis labels */}
          {chartData.map((d, i) => {
            if (i % Math.ceil(chartData.length / 6) === 0) {
              const x = padding + (chartWidth / (chartData.length - 1)) * i;
              return (
                <text
                  key={i}
                  x={x}
                  y={height - 10}
                  textAnchor="middle"
                  fontSize="12"
                  fill="#6b7280"
                >
                  {formatTimestamp(d.timestamp)}
                </text>
              );
            }
            return null;
          })}

          {/* Y-axis labels */}
          {Array.from({ length: 5 }).map((_, i) => {
            const value = (maxValue / 4) * (4 - i);
            const y = padding + (chartHeight / 4) * i;
            return (
              <text
                key={i}
                x={padding - 10}
                y={y + 4}
                textAnchor="end"
                fontSize="12"
                fill="#6b7280"
              >
                {formatValue(value)}
              </text>
            );
          })}
        </svg>

        {/* Legend */}
        {showLegend && (
          <div className="flex items-center gap-4 justify-center mt-4 flex-wrap">
            {data.map((series, index) => (
              <div key={series.metricId} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: colors[index % colors.length] }}
                />
                <span className="text-sm text-muted-foreground">
                  {series.metricName}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Bar Chart Component
  function BarChart() {
    const maxValue = Math.max(...chartData.flatMap(d => 
      Object.values(d).filter(v => typeof v === 'number') as number[]
    ));
    
    const padding = 40;
    const chartWidth = 800 - padding * 2;
    const chartHeight = height - padding * 2;
    const barWidth = chartWidth / chartData.length / data.length;

    return (
      <div className="relative">
        <svg width="100%" height={height} viewBox={`0 0 800 ${height}`}>
          {/* Grid lines */}
          {showGrid && (
            <g stroke="#e5e7eb" strokeWidth="1" opacity="0.5">
              {Array.from({ length: 5 }).map((_, i) => {
                const y = padding + (chartHeight / 4) * i;
                return (
                  <line key={i} x1={padding} y1={y} x2={800 - padding} y2={y} />
                );
              })}
            </g>
          )}

          {/* Bars */}
          {chartData.map((d, dataIndex) => (
            <g key={dataIndex}>
              {data.map((series, seriesIndex) => {
                const value = d[series.metricName] || 0;
                const barHeight = (value / maxValue) * chartHeight;
                const x = padding + (chartWidth / chartData.length) * dataIndex + barWidth * seriesIndex;
                const y = padding + chartHeight - barHeight;
                const color = colors[seriesIndex % colors.length];

                return (
                  <rect
                    key={`${dataIndex}-${seriesIndex}`}
                    x={x}
                    y={y}
                    width={barWidth * 0.8}
                    height={barHeight}
                    fill={color}
                    opacity="0.8"
                  />
                );
              })}
            </g>
          ))}

          {/* X-axis labels */}
          {chartData.map((d, i) => {
            if (i % Math.ceil(chartData.length / 6) === 0) {
              const x = padding + (chartWidth / chartData.length) * i + (chartWidth / chartData.length) / 2;
              return (
                <text
                  key={i}
                  x={x}
                  y={height - 10}
                  textAnchor="middle"
                  fontSize="12"
                  fill="#6b7280"
                >
                  {formatTimestamp(d.timestamp)}
                </text>
              );
            }
            return null;
          })}

          {/* Y-axis labels */}
          {Array.from({ length: 5 }).map((_, i) => {
            const value = (maxValue / 4) * (4 - i);
            const y = padding + (chartHeight / 4) * i;
            return (
              <text
                key={i}
                x={padding - 10}
                y={y + 4}
                textAnchor="end"
                fontSize="12"
                fill="#6b7280"
              >
                {formatValue(value)}
              </text>
            );
          })}
        </svg>

        {/* Legend */}
        {showLegend && (
          <div className="flex items-center gap-4 justify-center mt-4 flex-wrap">
            {data.map((series, index) => (
              <div key={series.metricId} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: colors[index % colors.length] }}
                />
                <span className="text-sm text-muted-foreground">
                  {series.metricName}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Pie Chart Component
  function PieChart() {
    const total = chartData.reduce((sum, d) => sum + d.value, 0);
    const centerX = 400;
    const centerY = height / 2;
    const radius = Math.min(centerX - 100, centerY - 50);

    let currentAngle = 0;

    return (
      <div className="relative">
        <svg width="100%" height={height} viewBox={`0 0 800 ${height}`}>
          {chartData.map((d, index) => {
            const percentage = d.value / total;
            const startAngle = currentAngle;
            const endAngle = currentAngle + percentage * 2 * Math.PI;
            currentAngle = endAngle;

            const x1 = centerX + radius * Math.cos(startAngle);
            const y1 = centerY + radius * Math.sin(startAngle);
            const x2 = centerX + radius * Math.cos(endAngle);
            const y2 = centerY + radius * Math.sin(endAngle);

            const largeArcFlag = percentage > 0.5 ? 1 : 0;

            const pathData = [
              `M ${centerX} ${centerY}`,
              `L ${x1} ${y1}`,
              `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
              'Z'
            ].join(' ');

            return (
              <path
                key={index}
                d={pathData}
                fill={d.color}
                opacity="0.8"
              />
            );
          })}
        </svg>

        {/* Legend */}
        {showLegend && (
          <div className="flex items-center gap-4 justify-center mt-4 flex-wrap">
            {chartData.map((d, index) => (
              <div key={index} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: d.color }}
                />
                <span className="text-sm text-muted-foreground">
                  {d.name} ({((d.value / total) * 100).toFixed(1)}%)
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Area Chart Component (similar to line but with filled areas)
  function AreaChart() {
    const maxValue = Math.max(...chartData.flatMap(d => 
      Object.values(d).filter(v => typeof v === 'number') as number[]
    ));
    
    const padding = 40;
    const chartWidth = 800 - padding * 2;
    const chartHeight = height - padding * 2;

    return (
      <div className="relative">
        <svg width="100%" height={height} viewBox={`0 0 800 ${height}`}>
          {/* Grid lines */}
          {showGrid && (
            <g stroke="#e5e7eb" strokeWidth="1" opacity="0.5">
              {Array.from({ length: 5 }).map((_, i) => {
                const y = padding + (chartHeight / 4) * i;
                return (
                  <line key={i} x1={padding} y1={y} x2={800 - padding} y2={y} />
                );
              })}
            </g>
          )}

          {/* Areas */}
          {data.map((series, seriesIndex) => {
            const color = colors[seriesIndex % colors.length];
            const points = chartData.map((d, i) => {
              const x = padding + (chartWidth / (chartData.length - 1)) * i;
              const value = d[series.metricName] || 0;
              const y = padding + chartHeight - (value / maxValue) * chartHeight;
              return { x, y };
            });

            const pathData = [
              `M ${points[0].x} ${padding + chartHeight}`,
              ...points.map(p => `L ${p.x} ${p.y}`),
              `L ${points[points.length - 1].x} ${padding + chartHeight}`,
              'Z'
            ].join(' ');

            return (
              <path
                key={series.metricId}
                d={pathData}
                fill={color}
                opacity="0.3"
              />
            );
          })}

          {/* X-axis labels */}
          {chartData.map((d, i) => {
            if (i % Math.ceil(chartData.length / 6) === 0) {
              const x = padding + (chartWidth / (chartData.length - 1)) * i;
              return (
                <text
                  key={i}
                  x={x}
                  y={height - 10}
                  textAnchor="middle"
                  fontSize="12"
                  fill="#6b7280"
                >
                  {formatTimestamp(d.timestamp)}
                </text>
              );
            }
            return null;
          })}

          {/* Y-axis labels */}
          {Array.from({ length: 5 }).map((_, i) => {
            const value = (maxValue / 4) * (4 - i);
            const y = padding + (chartHeight / 4) * i;
            return (
              <text
                key={i}
                x={padding - 10}
                y={y + 4}
                textAnchor="end"
                fontSize="12"
                fill="#6b7280"
              >
                {formatValue(value)}
              </text>
            );
          })}
        </svg>

        {/* Legend */}
        {showLegend && (
          <div className="flex items-center gap-4 justify-center mt-4 flex-wrap">
            {data.map((series, index) => (
              <div key={series.metricId} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: colors[index % colors.length] }}
                />
                <span className="text-sm text-muted-foreground">
                  {series.metricName}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="w-full">
      {renderChart()}
    </div>
  );
}