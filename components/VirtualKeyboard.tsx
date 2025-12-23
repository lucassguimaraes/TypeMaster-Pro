
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
    // Normalização rigorosa para comparar teclas especiais e símbolos
    const normalizedKey = key.toUpperCase();
    const normalizedActive = activeKey.toUpperCase();
    const normalizedError = errorKey.toUpperCase();

    // Se a tecla atual é a que o usuário errou
    if (errorKey !== '' && normalizedKey === normalizedError) {
      return 'bg-red-500 text-white border-red-700 animate-shake z-10';
    }
    
    // Se a tecla atual é a que deve ser pressionada
    if (activeKey !== '' && normalizedKey === normalizedActive) {
      return 'bg-blue-600 text-white border-blue-800 shadow-[0_0_20px_rgba(37,99,235,0.6)] scale-110 z-20 font-black';
    }

    if (heatmap && heatmap[normalizedKey]) {
      const { errors, total } = heatmap[normalizedKey];
      const errorRate = errors / Math.max(total, 1);
      if (errorRate > 0.1) {
        return `bg-orange-600/40 text-orange-100 border-orange-700`;
      }
    }

    return 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700';
  };

  const getKeyWidth = (key: string) => {
    switch (key) {
      case 'Backspace': return 'w-20 md:w-24';
      case 'Tab': return 'w-14 md:w-16';
      case 'Enter': return 'w-20 md:w-24';
      case 'CapsLock': return 'w-18 md:w-20';
      case 'Shift': return 'w-24 md:w-28';
      case 'Space': return 'w-64 md:w-80';
      default: return 'w-10 md:w-12';
    }
  };

  return (
    <div className="flex flex-col gap-1.5 p-4 bg-slate-900 rounded-2xl border border-slate-700 shadow-2xl w-fit">
      {currentLayout.map((row, i) => (
        <div key={i} className="flex justify-center gap-1 md:gap-1.5">
          {row.map((key) => (
            <div
              key={key}
              className={`${getKeyWidth(key)} h-10 md:h-12 flex items-center justify-center rounded-lg border-b-4 text-[10px] md:text-xs font-bold transition-all duration-75 uppercase ${getKeyStyle(key)}`}
            >
              {key === 'Space' ? '' : key === 'Backspace' ? '⌫' : key === 'Enter' ? '↵' : key === 'Shift' ? '⇧' : key}
            </div>
          ))}
        </div>
      ))}
      <div className="flex justify-center gap-4 mt-4 text-[8px] font-black uppercase text-slate-500 tracking-tighter">
        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500" /> Mínimo</div>
        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-yellow-500" /> Anelar</div>
        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500" /> Médio</div>
        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-500" /> Indicador</div>
        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-purple-500" /> Polegar</div>
      </div>
    </div>
  );
};

export default VirtualKeyboard;
