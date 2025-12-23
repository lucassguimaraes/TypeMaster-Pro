
import React, { useState, useEffect, useRef, useCallback } from 'react';
import ReactDOM from 'react-dom/client';
import { 
  Zap, Trophy, BookOpen, Settings, Volume2, VolumeX, 
  RotateCcw, ChevronRight, Keyboard, Flame, Star, Award
} from 'lucide-react';

// --- CONFIGURAÇÕES E DADOS ---

const FINGER_MAP: Record<string, string> = {
  'Q': 'mínimo', 'A': 'mínimo', 'Z': 'mínimo', '1': 'mínimo', '`': 'mínimo', 'Tab': 'mínimo', 'CapsLock': 'mínimo', 'Shift': 'mínimo',
  'W': 'anelar', 'S': 'anelar', 'X': 'anelar', '2': 'anelar',
  'E': 'médio', 'D': 'médio', 'C': 'médio', '3': 'médio',
  'R': 'indicador', 'F': 'indicador', 'V': 'indicador', '4': 'indicador', '5': 'indicador', 'T': 'indicador', 'G': 'indicador', 'B': 'indicador',
  'Y': 'indicador', 'H': 'indicador', 'N': 'indicador', '6': 'indicador', '7': 'indicador', 'U': 'indicador', 'J': 'indicador', 'M': 'indicador',
  'I': 'médio', 'K': 'médio', ',': 'médio', '8': 'médio',
  'O': 'anelar', 'L': 'anelar', '.': 'anelar', '9': 'anelar',
  'P': 'mínimo', 'Ç': 'mínimo', ';': 'mínimo', '0': 'mínimo', '-': 'mínimo', '=': 'mínimo', 'Backspace': 'mínimo', 'Enter': 'mínimo',
  'Space': 'polegar'
};

const INITIAL_LESSONS = [
  { id: '1', title: 'Linha Inicial (Base)', desc: 'Dedos em ASDF e JKLÇ.', content: 'asdf jkl; asdf jkl; asdf jkl; asdf jkl;' },
  { id: '2', title: 'Expandindo G e H', desc: 'Use os indicadores para alcançar G e H.', content: 'asdfg hjkl; asdfg hjkl; asdfg hjkl; asdfg hjkl;' },
  { id: '3', title: 'Palavras de Base', desc: 'Palavras usando apenas a linha inicial.', content: 'fala sala lada jaca kada gaga fada dadas salas' },
  { id: '4', title: 'Linha Superior', desc: 'Introduzindo QWERTY e UIOP.', content: 'que dia quente. o rato roeu a roupa.' },
  { id: '5', title: 'Desafio de Velocidade', desc: 'Frase completa com pontuação.', content: 'A pratica leva a perfeicao na digitacao rapida!' }
];

const LAYOUT_ABNT2 = [
  ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', 'Backspace'],
  ['Tab', 'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', '´', '[', 'Enter'],
  ['CapsLock', 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ç', '~', ']'],
  ['Shift', '\\', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', ',', '.', ';', 'Shift'],
  ['Space']
];

// --- COMPONENTES AUXILIARES ---

const Key = ({ val, active, error, finger }: any) => {
  const isSpace = val === 'Space';
  const baseClass = `flex items-center justify-center rounded-lg border-b-4 font-bold text-[10px] uppercase transition-all duration-75 ${isSpace ? 'w-64 h-12' : 'w-10 h-10'}`;
  
  let stateClass = "bg-slate-800 text-slate-500 border-slate-900";
  if (error) stateClass = "bg-red-500 text-white border-red-700 animate-shake";
  else if (active) stateClass = "bg-blue-500 text-white border-blue-700 shadow-[0_0_15px_rgba(59,130,246,0.5)] scale-105";

  return (
    <div className={`${baseClass} ${stateClass} finger-${finger}`}>
      {isSpace ? '' : val}
    </div>
  );
};

const VirtualKeyboard = ({ activeKey, errorKey }: any) => {
  return (
    <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 shadow-2xl flex flex-col gap-1.5 items-center">
      {LAYOUT_ABNT2.map((row, i) => (
        <div key={i} className="flex gap-1.5">
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
      <div className="flex gap-4 mt-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">
        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500"></div> Mínimo</div>
        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-yellow-500"></div> Anelar</div>
        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Médio</div>
        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Indicador</div>
        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-purple-500"></div> Polegar</div>
      </div>
    </div>
  );
};

// --- APLICAÇÃO PRINCIPAL ---

const App = () => {
  const [currentLesson, setCurrentLesson] = useState(INITIAL_LESSONS[0]);
  const [input, setInput] = useState('');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [errorChar, setErrorChar] = useState<string | null>(null);
  const [stats, setStats] = useState({ wpm: 0, accuracy: 100, errors: 0 });
  const [isFinished, setIsFinished] = useState(false);
  const [sound, setSound] = useState(true);
  
  const audioCtx = useRef<AudioContext | null>(null);

  const playClick = (isError = false) => {
    if (!sound) return;
    if (!audioCtx.current) audioCtx.current = new AudioContext();
    const osc = audioCtx.current.createOscillator();
    const gain = audioCtx.current.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(isError ? 150 : 600, audioCtx.current.currentTime);
    osc.frequency.exponentialRampToValueAtTime(10, audioCtx.current.currentTime + 0.1);
    gain.gain.setValueAtTime(0.1, audioCtx.current.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.current.currentTime + 0.1);
    osc.connect(gain);
    gain.connect(audioCtx.current.destination);
    osc.start();
    osc.stop(audioCtx.current.currentTime + 0.1);
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (isFinished) return;
    if (!startTime) setStartTime(Date.now());

    const expected = currentLesson.content;
    const lastTyped = val[val.length - 1];
    const correctSoFar = expected.substring(0, val.length);

    if (val === correctSoFar) {
      setInput(val);
      setErrorChar(null);
      playClick(false);
      
      // Calcular WPM
      const timeInMinutes = (Date.now() - (startTime || Date.now())) / 60000;
      const currentWpm = Math.round((val.length / 5) / (timeInMinutes || 1));
      
      setStats(prev => ({
        ...prev,
        wpm: currentWpm,
        accuracy: Math.round(((val.length - prev.errors) / val.length) * 100)
      }));

      if (val.length === expected.length) {
        setIsFinished(true);
      }
    } else {
      setErrorChar(expected[val.length - 1]);
      setStats(prev => ({ ...prev, errors: prev.errors + 1 }));
      playClick(true);
    }
  };

  const reset = () => {
    setInput('');
    setStartTime(null);
    setStats({ wpm: 0, accuracy: 100, errors: 0 });
    setIsFinished(false);
    setErrorChar(null);
  };

  const nextChar = currentLesson.content[input.length] || '';

  return (
    <div className="min-h-screen flex flex-col bg-[#0f172a] text-slate-200">
      {/* Header */}
      <nav className="h-16 border-b border-slate-800 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-50 px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-1.5 rounded-lg">
            <Zap className="text-white w-5 h-5" />
          </div>
          <h1 className="font-black tracking-tighter text-xl italic bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
            TYPEMASTER PRO
          </h1>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-6 bg-slate-800/50 px-4 py-1.5 rounded-full border border-slate-700">
            <div className="text-center">
              <span className="block text-[8px] font-bold text-slate-500 uppercase">WPM</span>
              <span className="font-black text-blue-400 leading-none">{stats.wpm}</span>
            </div>
            <div className="text-center">
              <span className="block text-[8px] font-bold text-slate-500 uppercase">Precisão</span>
              <span className="font-black text-emerald-400 leading-none">{stats.accuracy}%</span>
            </div>
          </div>
          <button onClick={() => setSound(!sound)} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400">
            {sound ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>
        </div>
      </nav>

      <main className="flex-1 max-w-5xl mx-auto w-full p-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-slate-900/50 p-5 rounded-2xl border border-slate-800">
            <h2 className="text-[10px] font-black uppercase text-slate-500 mb-4 flex items-center gap-2">
              <BookOpen size={14} /> Trilha de Aprendizado
            </h2>
            <div className="space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar">
              {INITIAL_LESSONS.map((l) => (
                <button
                  key={l.id}
                  onClick={() => { setCurrentLesson(l); reset(); }}
                  className={`w-full text-left p-3 rounded-xl border transition-all text-xs font-bold ${
                    currentLesson.id === l.id 
                    ? 'bg-blue-600/10 border-blue-500 text-blue-400' 
                    : 'bg-slate-800/30 border-transparent text-slate-500 hover:border-slate-700'
                  }`}
                >
                  {l.title}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Typing Area */}
        <div className="lg:col-span-3 flex flex-col items-center gap-8">
          {isFinished ? (
            <div className="w-full bg-slate-900 border-2 border-slate-700 rounded-3xl p-10 text-center shadow-2xl animate-in zoom-in duration-300">
              <Trophy className="mx-auto text-yellow-500 w-16 h-16 mb-6 drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]" />
              <h2 className="text-4xl font-black mb-2 italic tracking-tight">EXCELENTE!</h2>
              <p className="text-slate-400 mb-8">Você concluiu: {currentLesson.title}</p>
              
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Velocidade Média</span>
                  <p className="text-4xl font-black text-blue-400">{stats.wpm} <span className="text-sm">WPM</span></p>
                </div>
                <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Acerto</span>
                  <p className="text-4xl font-black text-emerald-400">{stats.accuracy}%</p>
                </div>
              </div>
              
              <button onClick={reset} className="w-full py-4 bg-blue-600 hover:bg-blue-500 rounded-xl font-black text-white transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20">
                <RotateCcw size={18} /> TENTAR NOVAMENTE
              </button>
            </div>
          ) : (
            <>
              <div className="w-full text-center">
                <h3 className="text-2xl font-black text-white italic">{currentLesson.title}</h3>
                <p className="text-slate-500 text-sm">{currentLesson.desc}</p>
              </div>

              <div className="relative w-full p-12 bg-slate-900 border-2 border-slate-700 rounded-3xl shadow-2xl min-h-[160px] flex items-center justify-center overflow-hidden">
                <div className="font-mono text-3xl tracking-[0.2em] leading-relaxed select-none text-center">
                  {currentLesson.content.split('').map((char, i) => {
                    let color = "text-slate-600";
                    if (i < input.length) color = "text-slate-100";
                    if (i === input.length) return <span key={i} className="typing-cursor">{char === ' ' ? '\u00A0' : char}</span>;
                    return <span key={i} className={color}>{char === ' ' ? '\u00A0' : char}</span>;
                  })}
                </div>
                <input 
                  autoFocus 
                  className="absolute inset-0 opacity-0 cursor-default" 
                  value={input} 
                  onChange={handleInput}
                  onBlur={(e) => e.target.focus()}
                />
              </div>

              <VirtualKeyboard activeKey={nextChar} errorKey={errorChar} />
              
              <div className="flex gap-8 text-[10px] font-black uppercase text-slate-600">
                <div className="flex items-center gap-2"><Keyboard size={14}/> Layout: ABNT2</div>
                <div className="flex items-center gap-2"><Award size={14}/> Meta: 40 WPM</div>
              </div>
            </>
          )}
        </div>
      </main>

      <footer className="p-6 border-t border-slate-800 text-center opacity-40">
        <p className="text-[10px] font-black uppercase tracking-[0.3em]">TypeMaster Pro &bull; Aprenda Digitando</p>
      </footer>
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<App />);
