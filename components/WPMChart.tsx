
import React from 'react';

interface WPMChartProps {
  data: { wpm: number; time: number }[];
}

const WPMChart: React.FC<WPMChartProps> = ({ data }) => {
  if (data.length < 2) return null;

  const width = 400;
  const height = 100;
  const maxWpm = Math.max(...data.map(d => d.wpm), 60);
  const minWpm = Math.min(...data.map(d => d.wpm), 0);
  const range = maxWpm - minWpm || 1;

  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((d.wpm - minWpm) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="w-full mt-4">
      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-2">Curva de Velocidade</p>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-24 overflow-visible">
        <polyline
          fill="none"
          stroke="#3b82f6"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
          className="drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]"
        />
        {/* Baseline */}
        <line x1="0" y1={height} x2={width} y2={height} stroke="#334155" strokeWidth="1" strokeDasharray="4" />
      </svg>
    </div>
  );
};

export default WPMChart;
