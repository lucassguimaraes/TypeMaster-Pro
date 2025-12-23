
import React, { useState, useEffect, useRef, useCallback } from 'react';
import ReactDOM from 'react-dom/client';
import { 
  BookOpen, TrendingUp, Trophy, ChevronRight, Zap, Volume2, 
  VolumeX, Eye, EyeOff, Palette, PlusCircle, Keyboard, Flame, Star 
} from 'lucide-react';

// --- TYPES ---
interface TypingStats {
  wpm: number; accuracy: number; errors: number; timeElapsed: number;
  charsTyped: number; history: { wpm: number; time: number }[];
  keyMap: Record<string, { errors: number; total: number }>;
  timestamp: number;
}
type Theme = 'default' | 'cyberpunk' | 'nord' | 'minimal';
type KeyboardLayout = 'abnt2' | 'us';
type SoundProfile = 'clicky' | 'linear' | 'tactile';
interface Lesson {
  id: string; title: string; description: string; content: string;
  category: 'basico' | 'intermediario' | 'avancado' | 'personalizado';
}
interface UserProgress {
  totalLessons: number; avgWpm: number; bestWpm: number; streak: number;
  lastPracticeDate: string | null; totalChars: number;
}

// --- CONSTANTS ---
const THEMES: { id: Theme; name: string; class: string }[] = [
  { id: 'default', name: 'Deep Sea', class: '' },
  { id: 'cyberpunk', name: 'Cyberpunk', class: 'theme-cyberpunk' },
  { id: 'nord', name: 'Nordic', class: 'theme-nord' },
  { id: 'minimal', name: 'Minimalist', class: 'theme-minimal' },
];

const LAYOUTS: Record<KeyboardLayout, string[][]> = {
  abnt2: [
    ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', 'Backspace'],
    ['Tab', 'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', '´', '[', 'Enter'],
    ['CapsLock', 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ç', '~', ']'],
    ['Shift', '\\', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', ',', '.', ';', 'Shift'],
    ['Space']
  ],
  us: [
    ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', 'Backspace'],
    ['Tab', 'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', '[', ']', '\\'],
    ['CapsLock', 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', ';', "'", 'Enter'],
    ['Shift', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', ',', '.', '/', 'Shift'],
    ['Space']
  ]
};

const INITIAL_LESSONS: Lesson[] = [
  { id: '1', title: 'Linha Inicial', description: 'Dedos em ASDF e JKLÇ.', content: 'asdf jkl; asdf jkl; asdf jkl; asdf jkl;', category: 'basico' },
  { id: '2', title: 'Linha Inicial Expandida', description: 'Praticando G e H.', content: 'asdfg hjkl; asdfg hjkl; asdfg hjkl; asdfg hjkl;', category: 'basico' },
  { id: '3', title: 'Palavras Simples', description: 'Combinando a linha inicial.', content: 'fala sala jaca lada kada gaga fada dadas salas falas galas', category: 'basico' },
  { id: '4', title: 'Frases Curtas', description: 'Frases simples em português.', content: 'o rato roeu a roupa do rei. o sol brilha no ceu.', category: 'intermediario' }
];

// --- COMPONENTS ---

const WPMChart: React.FC<{ data: { wpm: number; time: number }[] }> = ({ data }) => {
  if (data.length < 2) return null;
  const width = 400; const height = 60;
  const maxWpm = Math.max(...data.map(d => d.wpm), 60);
  const minWpm = Math.min(...data.map(d => d.wpm), 0);
  const range = maxWpm - minWpm || 1;
  const points = data.map((d, i) => `${(i / (data.length - 1)) * width},${height - ((d.wpm - minWpm) / range) * height}`).join(' ');
  return (
    <div className="w-full mt-4">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-16 overflow-visible">
        <polyline fill="none" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round" points={points} className="drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
      </svg>
    </div>
  );
};

const VirtualKeyboard: React.FC<{ activeKey: string; errorKey: string; heatmap?: any; layout: KeyboardLayout }> = ({ activeKey, errorKey, heatmap, layout }) => {
  const currentLayout = LAYOUTS[layout];
  const getKeyStyle = (key: string) => {
    const nk = key.toUpperCase();
    const ak = activeKey.toUpperCase();
    const ek = errorKey.toUpperCase();
    if (nk === ek && errorKey !== '') return 'bg-red-500 text-white border-red-700 animate-shake';
    if (nk === ak) return 'bg-blue-500 text-white border-blue-700 shadow-[0_0_10px_rgba(59,130,246,0.5)]';
    return 'bg-slate-800 text-slate-500 border-slate-700';
  };
  const getWidth = (k: string) => {
    if (k === 'Space') return 'w-64';
    if (['Backspace', 'Enter', 'Shift'].includes(k)) return 'w-20';
    return 'w-10';
  };
  return (
    <div className="flex flex-col gap-1 p-3 bg-slate-900 rounded-xl border border-slate-800 shadow-2xl scale-90">
      {currentLayout.map((row, i) => (
        <div key={i} className="flex justify-center gap-1">
          {row.map(k => (
            <div key={k} className={`${getWidth(k)} h-10 flex items-center justify-center rounded border-b-2 text-[9px] font-bold uppercase ${getKeyStyle(k)}`}>
              {k === 'Space' ? '' : k}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

const TypingEngine: React.FC<{ lesson: Lesson; onComplete: any; settings: any }> = ({ lesson, onComplete, settings }) => {
  const [userInput, setUserInput] = useState('');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [errorIdx, setErrorIdx] = useState<number | null>(null);
  const [stats, setStats] = useState<TypingStats>({ wpm: 0, accuracy: 100, errors: 0, timeElapsed: 0, charsTyped: 0, history: [], keyMap: {}, timestamp: Date.now() });
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: any) => {
    const val = e.target.value;
    if (val.length > lesson.content.length) return;
    if (!startTime) setStartTime(Date.now());
    
    const lastIdx = val.length - 1;
    if (val[lastIdx] === lesson.content[lastIdx]) {
      setUserInput(val);
      setErrorIdx(null);
      const elapsed = (Date.now() - (startTime || Date.now())) / 60000;
      const wpm = Math.round((val.length / 5) / elapsed) || 0;
      setStats(s => ({ ...s, wpm, charsTyped: val.length, history: [...s.history, { wpm, time: elapsed }] }));
      if (val.length === lesson.content.length) onComplete({ ...stats, wpm, timeElapsed: elapsed * 60, timestamp: Date.now() });
    } else {
      setErrorIdx(lastIdx);
      setStats(s => ({ ...s, errors: s.errors + 1 }));
    }
  };

  return (
    <div className="w-full flex flex-col items-center gap-6">
      <div className="grid grid-cols-3 gap-4 w-full max-w-2xl">
        <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700 text-center">
          <p className="text-[10px] text-slate-500 font-bold uppercase">WPM</p>
          <p className="text-xl font-black text-blue-400">{stats.wpm}</p>
        </div>
        <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700 text-center">
          <p className="text-[10px] text-slate-500 font-bold uppercase">ERROS</p>
          <p className="text-xl font-black text-red-400">{stats.errors}</p>
        </div>
        <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700 text-center">
          <p className="text-[10px] text-slate-500 font-bold uppercase">PRECISÃO</p>
          <p className="text-xl font-black text-green-400">{Math.round(((userInput.length - stats.errors) / Math.max(userInput.length, 1)) * 100)}%</p>
        </div>
      </div>

      <div className="relative p-10 bg-slate-900 border-2 border-slate-700 rounded-2xl w-full max-w-3xl min-h-[150px] flex items-center justify-center">
        <div className="font-mono text-3xl tracking-widest leading-relaxed select-none text-center">
          {lesson.content.split('').map((char, i) => (
            <span key={i} className={`${i < userInput.length ? 'text-slate-200' : i === userInput.length ? 'text-blue-400 font-bold typing-cursor' : 'text-slate-600'}`}>
              {char === ' ' ? '\u00A0' : char}
            </span>
          ))}
        </div>
        <input ref={inputRef} autoFocus className="absolute inset-0 opacity-0 cursor-default" value={userInput} onChange={handleChange} />
      </div>
      <VirtualKeyboard activeKey={lesson.content[userInput.length] || ''} errorKey={errorIdx !== null ? lesson.content[errorIdx] : ''} layout={settings.layout} />
    </div>
  );
};

// --- APP ---
const App = () => {
  const [currentLesson, setCurrentLesson] = useState(INITIAL_LESSONS[0]);
  const [theme, setTheme] = useState<Theme>('default');
  const [layout, setLayout] = useState<KeyboardLayout>('abnt2');
  const [showResults, setShowResults] = useState(false);
  const [lastStats, setLastStats] = useState<any>(null);

  return (
    <div className={`min-h-screen flex flex-col ${THEMES.find(t => t.id === theme)?.class}`}>
      <nav className="h-16 border-b border-slate-800 flex items-center px-6 justify-between bg-slate-900/80 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <Zap className="text-blue-500" />
          <h1 className="font-black tracking-tighter text-xl">TYPEMASTER PRO</h1>
        </div>
        <div className="flex gap-4">
          <button onClick={() => setLayout(l => l === 'abnt2' ? 'us' : 'abnt2')} className="text-[10px] font-bold bg-slate-800 px-3 py-1 rounded border border-slate-700 uppercase">{layout}</button>
          <select value={theme} onChange={(e) => setTheme(e.target.value as Theme)} className="bg-slate-800 text-[10px] font-bold px-2 py-1 rounded border border-slate-700 outline-none">
            {THEMES.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>
      </nav>

      <main className="flex-1 max-w-6xl mx-auto w-full p-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
        <aside className="lg:col-span-1 space-y-4">
          <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800">
            <h2 className="text-[10px] font-black uppercase text-slate-500 mb-4 flex items-center gap-2"><BookOpen size={14}/> Lições</h2>
            <div className="space-y-2">
              {INITIAL_LESSONS.map(l => (
                <button key={l.id} onClick={() => { setCurrentLesson(l); setShowResults(false); }} className={`w-full text-left p-3 rounded-lg text-xs font-bold border ${currentLesson.id === l.id ? 'bg-blue-600/10 border-blue-500 text-blue-400' : 'bg-slate-800/30 border-transparent text-slate-500 hover:border-slate-700'}`}>
                  {l.title}
                </button>
              ))}
            </div>
          </div>
        </aside>

        <section className="lg:col-span-3 flex flex-col items-center">
          {showResults ? (
            <div className="bg-slate-900 border-2 border-slate-700 p-10 rounded-3xl w-full max-w-2xl text-center shadow-2xl animate-in fade-in zoom-in duration-300">
              <Trophy className="mx-auto text-yellow-500 mb-4" size={48} />
              <h2 className="text-3xl font-black mb-6 italic">RESULTADOS</h2>
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
                  <p className="text-[10px] font-bold text-slate-500 uppercase">Velocidade</p>
                  <p className="text-4xl font-black text-blue-400">{lastStats.wpm} <span className="text-xs">WPM</span></p>
                </div>
                <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
                  <p className="text-[10px] font-bold text-slate-500 uppercase">Precisão</p>
                  <p className="text-4xl font-black text-green-400">{lastStats.accuracy}%</p>
                </div>
              </div>
              <WPMChart data={lastStats.history} />
              <button onClick={() => setShowResults(false)} className="mt-8 w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-xl transition-all shadow-lg shadow-blue-500/20">TENTAR NOVAMENTE</button>
            </div>
          ) : (
            <TypingEngine lesson={currentLesson} onComplete={(s) => { setLastStats(s); setShowResults(true); }} settings={{ layout }} />
          )}
        </section>
      </main>
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<App />);
