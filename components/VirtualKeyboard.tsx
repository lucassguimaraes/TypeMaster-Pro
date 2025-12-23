
import React from 'react';
import { LAYOUTS } from '../constants';
import { KeyboardLayout } from '../types';

interface VirtualKeyboardProps {
  activeKey: string;
  errorKey: string;
  heatmap?: Record<string, { errors: number; total: number }>;
  layout: KeyboardLayout;
}

const VirtualKeyboard: React.FC<VirtualKeyboardProps> = ({ activeKey, errorKey, heatmap, layout }) => {
  const currentLayout = LAYOUTS[layout];

  const getKeyStyle = (key: string) => {
    const normalizedKey = key.toUpperCase();
    const normalizedActive = activeKey.toUpperCase();
    const normalizedError = errorKey.toUpperCase();

    if (normalizedKey === normalizedError && errorKey !== '') {
      return 'bg-red-500 text-white border-red-700 animate-shake';
    }
    if (normalizedKey === normalizedActive) {
      return 'bg-blue-500 text-white border-blue-700 shadow-[0_0_15px_rgba(59,130,246,0.5)]';
    }

    if (heatmap && heatmap[normalizedKey]) {
      const { errors, total } = heatmap[normalizedKey];
      const errorRate = errors / Math.max(total, 1);
      if (errorRate > 0.1) {
        return `bg-orange-600/60 text-white border-orange-700`;
      }
    }

    return 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700';
  };

  const getKeyWidth = (key: string) => {
    switch (key) {
      case 'Backspace': return 'w-24';
      case 'Tab': return 'w-16';
      case 'Enter': return 'w-24';
      case 'CapsLock': return 'w-20';
      case 'Shift': return 'w-28';
      case 'Space': return 'w-80';
      default: return 'w-12';
    }
  };

  return (
    <div className="flex flex-col gap-1.5 p-4 bg-slate-900 rounded-xl border border-slate-700 shadow-2xl overflow-x-auto w-full">
      {currentLayout.map((row, i) => (
        <div key={i} className="flex justify-center gap-1.5">
          {row.map((key) => (
            <div
              key={key}
              className={`${getKeyWidth(key)} h-12 flex items-center justify-center rounded-lg border-b-4 text-[10px] font-bold transition-all duration-75 uppercase ${getKeyStyle(key)}`}
            >
              {key === 'Space' ? '' : key}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default VirtualKeyboard;
