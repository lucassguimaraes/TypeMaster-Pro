
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import ReactDOM from 'react-dom/client';
import { 
  Zap, Trophy, BookOpen, Volume2, VolumeX, 
  RotateCcw, ChevronRight, Keyboard, Flame, Star, Award, TrendingUp, PlusCircle, Eye, EyeOff
} from 'lucide-react';

// --- CONFIGURAÇÕES E DADOS (MANTIDO EM UM SÓ LUGAR) ---

const FINGER_MAP: Record<string, string> = {
  'Q': 'minimo', 'A': 'minimo', 'Z': 'minimo', '1': 'minimo', '`': 'minimo', 'TAB': 'minimo', 'CAPSLOCK': 'minimo', 'SHIFT': 'minimo',
  'W': 'anelar', 'S': 'anelar', 'X': 'anelar', '2': 'anelar',
  'E': 'medio', 'D': 'medio', 'C': 'medio', '3': 'medio',
  'R': 'indicador', 'F': 'indicador', 'V': 'indicador', '4': 'indicador', '5': 'indicador', 'T': 'indicador', 'G': 'indicador', 'B': 'indicador',
  'Y': 'indicador', 'H': 'indicador', 'N': 'indicador', '6': 'indicador', '7': 'indicador', 'U': 'indicador', 'J': 'indicador', 'M': 'indicador',
  'I': 'medio', 'K': 'medio', ',': 'medio', '8': 'medio',
  'O': 'anelar', 'L': 'anelar', '.': 'anelar', '9': 'anelar',
  'P': 'minimo', 'Ç': 'minimo', ';': 'minimo', '0': 'minimo', '-': 'minimo', '=': 'minimo', 'BACKSPACE': 'minimo', 'ENTER': 'minimo',
  'SPACE': 'polegar'
};

const INITIAL_LESSONS = [
  { id: '1', title: 'Linha Inicial (Base)', desc: 'Mantenha os dedos em ASDF e JKLÇ.', content: 'asdf jkl; asdf jkl; asdf jkl; asdf jkl;', category: 'Básico' },
  { id: '2', title: 'Expandindo G e H', desc: 'Use os indicadores para alcançar o centro.', content: 'asdfg hjkl; asdfg hjkl; asdfg hjkl; asdfg hjkl;', category: 'Básico' },
  { id: '3', title: 'Palavras de Base', desc: 'Palavras curtas usando a linha de descanso.', content: 'fala sala lada jaca kada gaga fada dadas salas', category: 'Básico' },
  { id: '4', title: 'Linha Superior', desc: 'Introduzindo as teclas QWERTY.', content: 'que dia quente. o rato roeu a roupa.', category: 'Intermediário' },
  { id: '5', title: 'Desafio Pro', desc: 'Frases completas com símbolos.', content: 'A pratica leva a perfeicao na digitacao rapida!', category: 'Avançado' }
];

const LAYOUT_ABNT2 = [
  ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', 'Backspace'],
  ['Tab', 'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', '´', '[', 'Enter'],
  ['CapsLock', 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ç', '~', ']'],
  ['Shift', '\\', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', ',', '.', ';', 'Shift'],
  ['Space']
];

// --- COMPONENTES ---

const WPMChart = ({ data }: { data: { wpm: number; time: number }[] }) => {
  if (data.length < 2) return null;
  const width = 400;
  const height = 80;
  const maxWpm = Math.max(...data.map(d => d.wpm), 60);
  const minWpm = Math.min(...data.map(d => d.wpm), 0);
  const range = maxWpm - minWpm || 1;
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((d.wpm - minWpm) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="w-full mt-4 bg-slate-800/30 p-4 rounded-xl border border-slate-700/50">
      <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-2">Desempenho na Lição</p>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-16 overflow-visible">
        <polyline fill="none" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" points={points} className="drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
      </svg>
    </div>
  );
};

const Key = ({ val, active, error, finger }: any) => {
  const isSpace = val === 'Space';
  const displayVal = val === 'Backspace' ? '⌫' : val === 'Enter' ? '↵' : val === 'Tab' ? '⇥' : val === 'Shift' ? '⇧' : val;
  const baseWidth = isSpace ? 'w-64' : val.length > 1 ? 'w-16' : 'w-10';
  
  let stateClass = "bg-slate-800 text-slate-500 border-slate-900";
  if (error) stateClass = "bg-red-500 text-white border-red-700 animate-shake";
  else if (active) stateClass = "bg-blue-600 text-white border-blue-700 shadow-[0_0_15px_rgba(59,130,246,0.4)] scale-105";

  return (
    <div className={`h-10 flex items-center justify-center rounded-lg border-b-4 font-bold text-[10px] uppercase transition-all duration-75 ${baseWidth} ${stateClass} finger-${finger}`}>
      {isSpace ? '' : displayVal}
    </div>
  );
};

const VirtualKeyboard = ({ activeKey, errorKey }: any) => {
  return (
    <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 shadow-2xl flex flex-col gap-1.5 items-center">
      {LAYOUT_ABNT2.map((row, i) => (
        <div key={i} className="flex gap-1">
          {row.map(k => (
            <Key 
              key={k} 
              val={k} 
              active={activeKey?.toUpperCase() === k.toUpperCase()} 
              error={errorKey?.toUpperCase() === k.toUpperCase()}
              finger={FINGER_MAP[k.toUpperCase()] || ''}
            />
          ))}
        </div>
      ))}
      <div className="flex gap-4 mt-4 text-[8px] font-black uppercase tracking-tighter text-slate-500">
        <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500" /> Mínimo</span>
        <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-yellow-500" /> Anelar</span>
        <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500" /> Médio</span>
        <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-500" /> Indicador</span>
        <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-purple-500" /> Polegar</span>
      </div>
    </div>
  );
};

// --- APP PRINCIPAL ---

const App = () => {
  const [currentLesson, setCurrentLesson] = useState(INITIAL_LESSONS[0]);
  const [input, setInput] = useState('');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [errorChar, setErrorChar] = useState<string | null>(null);
  const [stats, setStats] = useState({ wpm: 0, accuracy: 100, errors: 0, history: [] as {wpm: number, time: number}[] });
  const [isFinished, setIsFinished] = useState(false);
  const [sound, setSound] = useState(true);
  const [focusMode, setFocusMode] = useState(false);
  
  const audioCtx = useRef<AudioContext | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const playSound = (isError = false) => {
    if (!sound) return;
    if (!audioCtx.current) audioCtx.current = new AudioContext();
    const osc = audioCtx.current.createOscillator();
    const gain = audioCtx.current.createGain();
    osc.frequency.setValueAtTime(isError ? 100 : 800, audioCtx.current.currentTime);
    osc.frequency.exponentialRampToValueAtTime(10, audioCtx.current.currentTime + 0.1);
    gain.gain.setValueAtTime(0.05, audioCtx.current.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.current.currentTime + 0.1);
    osc.connect(gain);
    gain.connect(audioCtx.current.destination);
    osc.start();
    osc.stop(audioCtx.current.currentTime + 0.1);
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (isFinished) return;
    if (!startTime && val.length > 0) setStartTime(Date.now());

    const expected = currentLesson.content;
    const correctSoFar = expected.substring(0, val.length);

    if (val === correctSoFar) {
      setInput(val);
      setErrorChar(null);
      playSound(false);
      
      const timeInMinutes = (Date.now() - (startTime || Date.now())) / 60000;
      const currentWpm = Math.round((val.length / 5) / (timeInMinutes || 1));
      
      setStats(prev => ({
        ...prev,
        wpm: currentWpm,
        accuracy: Math.round(((val.length - prev.errors) / val.length) * 100),
        history: [...prev.history, { wpm: currentWpm, time: Date.now() }]
      }));

      if (val.length === expected.length) setIsFinished(true);
    } else {
      setErrorChar(expected[val.length - 1] === ' ' ? 'SPACE' : expected[val.length - 1]);
      setStats(prev => ({ ...prev, errors: prev.errors + 1 }));
      playSound(true);
    }
  };

  const reset = () => {
    setInput('');
    setStartTime(null);
    setStats({ wpm: 0, accuracy: 100, errors: 0, history: [] });
    setIsFinished(false);
    setErrorChar(null);
    setTimeout(() => inputRef.current?.focus(), 10);
  };

  const nextChar = currentLesson.content[input.length] === ' ' ? 'SPACE' : currentLesson.content[input.length] || '';

  return (
    <div className="min-h-screen flex flex-col bg-[#0f172a] text-slate-200">
      {/* Navbar */}
      <nav className="h-14 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md px-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="text-blue-500 fill-blue-500 w-5 h-5" />
          <span className="font-black italic tracking-tighter text-lg">TYPEMASTER PRO</span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex gap-4 bg-slate-800/50 px-4 py-1 rounded-full border border-slate-700 text-[10px] font-black uppercase">
            <span className="text-blue-400">WPM: {stats.wpm}</span>
            <span className="text-emerald-400">Precisão: {stats.accuracy}%</span>
          </div>
          <button onClick={() => setFocusMode(!focusMode)} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400">
            {focusMode ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
          <button onClick={() => setSound(!sound)} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400">
            {sound ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>
        </div>
      </nav>

      <main className="flex-1 max-w-6xl mx-auto w-full p-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className={`lg:col-span-1 space-y-4 transition-all ${focusMode ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100'}`}>
          <div className="bg-slate-900/50 p-5 rounded-2xl border border-slate-800">
            <h2 className="text-[10px] font-black uppercase text-slate-500 mb-4 flex items-center gap-2">
              <BookOpen size={14} /> Lições
            </h2>
            <div className="space-y-1">
              {INITIAL_LESSONS.map((l) => (
                <button
                  key={l.id}
                  onClick={() => { setCurrentLesson(l); reset(); }}
                  className={`w-full text-left p-3 rounded-xl border transition-all text-xs font-bold ${
                    currentLesson.id === l.id 
                    ? 'bg-blue-600/10 border-blue-500 text-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.1)]' 
                    : 'bg-slate-800/30 border-transparent text-slate-500 hover:border-slate-700'
                  }`}
                >
                  <span className="block truncate">{l.title}</span>
                  <span className="text-[8px] opacity-50 uppercase">{l.category}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Typing Area */}
        <div className="lg:col-span-3 flex flex-col items-center gap-8">
          {isFinished ? (
            <div className="w-full bg-slate-900 border-2 border-slate-800 rounded-[2.5rem] p-12 text-center shadow-2xl animate-in zoom-in duration-300">
              <Trophy className="mx-auto text-yellow-500 w-16 h-16 mb-6 drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]" />
              <h2 className="text-4xl font-black mb-2 italic tracking-tight">RESULTADO FINAL</h2>
              <p className="text-slate-500 mb-8 uppercase text-xs font-black tracking-widest">{currentLesson.title}</p>
              
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700">
                  <span className="text-[10px] font-black text-slate-500 uppercase">Velocidade</span>
                  <p className="text-4xl font-black text-blue-400">{stats.wpm} <span className="text-xs">WPM</span></p>
                </div>
                <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700">
                  <span className="text-[10px] font-black text-slate-500 uppercase">Precisão</span>
                  <p className="text-4xl font-black text-emerald-400">{stats.accuracy}%</p>
                </div>
              </div>

              <WPMChart data={stats.history} />
              
              <button onClick={reset} className="w-full mt-8 py-4 bg-blue-600 hover:bg-blue-500 rounded-xl font-black text-white transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 active:scale-95">
                <RotateCcw size={18} /> RECOMEÇAR TRILHA
              </button>
            </div>
          ) : (
            <>
              <div className={`w-full text-center transition-all ${focusMode ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100'}`}>
                <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase">{currentLesson.title}</h3>
                <p className="text-slate-500 text-xs font-bold">{currentLesson.desc}</p>
              </div>

              <div className="relative w-full p-12 bg-slate-900 border-2 border-slate-800 rounded-[2.5rem] shadow-2xl min-h-[180px] flex items-center justify-center overflow-hidden">
                <div className="font-mono text-4xl tracking-[0.2em] leading-relaxed select-none text-center">
                  {currentLesson.content.split('').map((char, i) => {
                    let color = "text-slate-700";
                    if (i < input.length) color = "text-slate-100";
                    if (i === input.length) return <span key={i} className="typing-cursor text-blue-400">{char === ' ' ? '\u00A0' : char}</span>;
                    return <span key={i} className={color}>{char === ' ' ? '\u00A0' : char}</span>;
                  })}
                </div>
                <input 
                  ref={inputRef}
                  autoFocus 
                  className="absolute inset-0 opacity-0 cursor-default" 
                  value={input} 
                  onChange={handleInput}
                  onBlur={(e) => e.target.focus()}
                />
              </div>

              <div className={`transition-all w-full flex flex-col items-center gap-8 ${focusMode ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100'}`}>
                <VirtualKeyboard activeKey={nextChar} errorKey={errorChar} />
                <div className="flex gap-6 text-[9px] font-black uppercase text-slate-600 tracking-widest">
                  <div className="flex items-center gap-1.5"><Keyboard size={12}/> Layout ABNT2</div>
                  <div className="flex items-center gap-1.5"><Award size={12}/> Meta: 40 WPM</div>
                  <div className="flex items-center gap-1.5"><Star size={12}/> Nível: {currentLesson.category}</div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      <footer className="p-4 border-t border-slate-800 text-center opacity-30 text-[9px] font-black uppercase tracking-[0.5em]">
        TypeMaster Pro &bull; Prática de Alto Rendimento
      </footer>
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<App />);
