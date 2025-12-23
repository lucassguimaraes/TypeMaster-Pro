
import React, { useState, useEffect } from 'react';
import { Lesson, TypingStats, Theme, KeyboardLayout, SoundProfile, UserProgress } from './types';
import { INITIAL_LESSONS, THEMES } from './constants';
import TypingEngine from './components/TypingEngine';
import VirtualKeyboard from './components/VirtualKeyboard';
import WPMChart from './components/WPMChart';
import { BookOpen, TrendingUp, Trophy, ChevronRight, Zap, Volume2, VolumeX, Eye, EyeOff, Palette, PlusCircle, Keyboard, Flame, Star } from 'lucide-react';

const App: React.FC = () => {
  // Load state from LocalStorage
  const [lessons, setLessons] = useState<Lesson[]>(() => {
    const saved = localStorage.getItem('tm-lessons');
    return saved ? [...INITIAL_LESSONS, ...JSON.parse(saved)] : INITIAL_LESSONS;
  });
  const [globalStats, setGlobalStats] = useState<TypingStats[]>(() => {
    const saved = localStorage.getItem('tm-stats');
    return saved ? JSON.parse(saved) : [];
  });
  const [progress, setProgress] = useState<UserProgress>(() => {
    const saved = localStorage.getItem('tm-progress');
    return saved ? JSON.parse(saved) : { totalLessons: 0, avgWpm: 0, bestWpm: 0, streak: 0, lastPracticeDate: null, totalChars: 0 };
  });

  const [currentLesson, setCurrentLesson] = useState<Lesson>(INITIAL_LESSONS[0]);
  const [showResults, setShowResults] = useState(false);
  const [lastStats, setLastStats] = useState<TypingStats | null>(null);
  
  const [theme, setTheme] = useState<Theme>('default');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [soundProfile, setSoundProfile] = useState<SoundProfile>('clicky');
  const [focusMode, setFocusMode] = useState(false);
  const [layout, setLayout] = useState<KeyboardLayout>('abnt2');
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customText, setCustomText] = useState('');

  // Save to LocalStorage when states change
  useEffect(() => {
    localStorage.setItem('tm-stats', JSON.stringify(globalStats.slice(-100)));
  }, [globalStats]);

  useEffect(() => {
    localStorage.setItem('tm-progress', JSON.stringify(progress));
  }, [progress]);

  const handleLessonComplete = (stats: TypingStats) => {
    setLastStats(stats);
    setGlobalStats(prev => [...prev, stats]);
    
    // Update Progress
    const today = new Date().toDateString();
    let newStreak = progress.streak;
    
    if (progress.lastPracticeDate !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      newStreak = progress.lastPracticeDate === yesterday.toDateString() ? progress.streak + 1 : 1;
    }

    const newProgress: UserProgress = {
      totalLessons: progress.totalLessons + 1,
      bestWpm: Math.max(progress.bestWpm, stats.wpm),
      avgWpm: Math.round(((progress.avgWpm * progress.totalLessons) + stats.wpm) / (progress.totalLessons + 1)),
      streak: newStreak,
      lastPracticeDate: today,
      totalChars: progress.totalChars + stats.charsTyped
    };
    
    setProgress(newProgress);
    setShowResults(true);
  };

  const startNextLesson = () => {
    const currentIndex = lessons.findIndex(l => l.id === currentLesson.id);
    if (currentIndex < lessons.length - 1) {
      setCurrentLesson(lessons[currentIndex + 1]);
      setShowResults(false);
    }
  };

  const addCustomLesson = () => {
    if (!customText.trim()) return;
    const newLesson: Lesson = {
      id: `custom-${Date.now()}`,
      title: 'Personalizado',
      description: 'Praticando conteúdo do usuário.',
      content: customText.trim(),
      category: 'personalizado'
    };
    const updatedCustom = [...lessons.filter(l => l.category === 'personalizado'), newLesson];
    localStorage.setItem('tm-lessons', JSON.stringify(updatedCustom));
    setLessons(prev => [...prev, newLesson]);
    setCurrentLesson(newLesson);
    setShowCustomModal(false);
    setCustomText('');
  };

  const activeTheme = THEMES.find(t => t.id === theme) || THEMES[0];

  return (
    <div className={`min-h-screen flex flex-col ${activeTheme.class}`}>
      <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-1.5 rounded-lg shadow-lg shadow-blue-500/20">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-black tracking-tighter bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              TYPEMASTER PRO
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Streak Indicator */}
            <div className="flex items-center gap-1.5 bg-orange-500/10 px-3 py-1.5 rounded-full border border-orange-500/30">
              <Flame className="w-4 h-4 text-orange-500" />
              <span className="text-sm font-black text-orange-400">{progress.streak}</span>
            </div>

            <div className="flex items-center gap-2 bg-slate-800/50 p-1 rounded-xl border border-slate-700">
               <button onClick={() => setSoundEnabled(!soundEnabled)} className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-slate-400" title="Alternar Som">
                 {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
               </button>
               <button onClick={() => setLayout(layout === 'abnt2' ? 'us' : 'abnt2')} className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-slate-400" title="Alternar Layout">
                 <Keyboard size={18} />
                 <span className="absolute -top-1 -right-1 text-[8px] bg-blue-600 text-white px-1 rounded uppercase">{layout}</span>
               </button>
               <button onClick={() => setFocusMode(!focusMode)} className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-slate-400" title="Modo Foco">
                 {focusMode ? <Eye size={18} /> : <EyeOff size={18} />}
               </button>
               <div className="relative group">
                 <button className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-slate-400">
                   <Palette size={18} />
                 </button>
                 <div className="absolute right-0 top-full mt-2 w-48 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all p-2 z-50">
                    {THEMES.map(t => (
                      <button 
                        key={t.id} 
                        onClick={() => setTheme(t.id)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-colors ${theme === t.id ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 text-slate-400'}`}
                      >
                        {t.name}
                      </button>
                    ))}
                    <div className="border-t border-slate-800 mt-2 pt-2">
                       <p className="px-3 text-[10px] uppercase text-slate-500 font-bold mb-1">Som do Teclado</p>
                       {(['clicky', 'linear', 'tactile'] as SoundProfile[]).map(p => (
                         <button key={p} onClick={() => setSoundProfile(p)} className={`w-full text-left px-3 py-1.5 rounded-lg text-[10px] uppercase font-bold ${soundProfile === p ? 'text-blue-400 bg-blue-400/10' : 'text-slate-500 hover:text-white'}`}>{p}</button>
                       ))}
                    </div>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        <div className={`lg:col-span-1 flex flex-col gap-4 transition-all duration-500 ${focusMode ? 'opacity-0 scale-95 pointer-events-none translate-x-[-20px]' : 'opacity-100'}`}>
          <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-400" />
                <h2 className="font-black text-slate-200 uppercase text-xs tracking-widest">Plano de Estudo</h2>
              </div>
              <button onClick={() => setShowCustomModal(true)} className="text-blue-400 hover:text-blue-300 transition-transform active:scale-90">
                <PlusCircle size={20} />
              </button>
            </div>
            
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {lessons.map((lesson) => (
                <button
                  key={lesson.id}
                  onClick={() => { setCurrentLesson(lesson); setShowResults(false); }}
                  className={`w-full text-left p-3 rounded-xl border-2 transition-all duration-200 group ${
                    currentLesson.id === lesson.id 
                    ? 'bg-blue-600/10 border-blue-500 text-blue-400' 
                    : 'bg-slate-800/30 border-transparent hover:border-slate-700 text-slate-400'
                  }`}
                >
                  <span className="text-sm font-bold block truncate">{lesson.title}</span>
                  <p className="text-[9px] uppercase tracking-widest opacity-60 mt-1 font-black">{lesson.category}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
            <div className="flex items-center gap-2 mb-4">
              <Star className="w-5 h-5 text-yellow-400" />
              <h2 className="font-black text-slate-200 uppercase text-xs tracking-widest">Carreira</h2>
            </div>
            <div className="space-y-4">
               <div className="flex justify-between items-center bg-slate-800/30 p-3 rounded-xl border border-slate-700/50">
                  <span className="text-slate-500 text-[10px] font-bold uppercase">Recorde WPM</span>
                  <span className="font-mono text-white font-black text-lg">{progress.bestWpm}</span>
               </div>
               <div className="flex justify-between items-center bg-slate-800/30 p-3 rounded-xl border border-slate-700/50">
                  <span className="text-slate-500 text-[10px] font-bold uppercase">Total Teclas</span>
                  <span className="font-mono text-white font-black text-lg">{(progress.totalChars / 1000).toFixed(1)}k</span>
               </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 flex flex-col items-center">
          {showResults && lastStats ? (
            <div className="w-full max-w-4xl animate-in fade-in slide-in-from-bottom-8 duration-500">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  <div className="bg-slate-900 border-2 border-slate-700 rounded-3xl p-8 flex flex-col items-center shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                       <Trophy size={120} />
                    </div>
                    <Trophy className="w-12 h-12 text-yellow-500 mb-6 drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]" />
                    <h2 className="text-3xl font-black mb-2 uppercase italic tracking-tighter">LIÇÃO COMPLETA!</h2>
                    <p className="text-slate-500 mb-8 text-sm">Você está dominando o teclado.</p>
                    
                    <div className="grid grid-cols-2 gap-4 w-full">
                      <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700 shadow-inner">
                        <span className="text-slate-500 text-[9px] font-black uppercase tracking-widest">Velocidade Final</span>
                        <div className="text-4xl font-black text-blue-400">{lastStats.wpm} <span className="text-xs text-blue-400/50">WPM</span></div>
                      </div>
                      <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700 shadow-inner">
                        <span className="text-slate-500 text-[9px] font-black uppercase tracking-widest">Precisão Geral</span>
                        <div className="text-4xl font-black text-green-400">{lastStats.accuracy}%</div>
                      </div>
                    </div>

                    <WPMChart data={lastStats.history} />

                    <div className="mt-10 w-full flex gap-3">
                       <button onClick={startNextLesson} className="flex-1 py-4 bg-blue-600 hover:bg-blue-500 rounded-2xl font-black text-white text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 active:scale-95">
                        PRÓXIMA LIÇÃO <ChevronRight size={18} />
                       </button>
                       <button onClick={() => setShowResults(false)} className="px-6 py-4 bg-slate-800 hover:bg-slate-700 rounded-2xl font-black text-white text-xs uppercase transition-all border border-slate-700 active:scale-95">
                        REPETIR
                       </button>
                    </div>
                  </div>

                  <div className="bg-slate-900 border-2 border-slate-700 rounded-3xl p-8 shadow-2xl flex flex-col">
                    <h3 className="text-xs font-black uppercase tracking-widest mb-6 flex items-center gap-2 text-orange-400">
                      <TrendingUp size={16} /> Análise de Teclado
                    </h3>
                    <div className="flex-1 flex flex-col">
                      <div className="scale-[0.55] origin-top-left w-[180%]">
                        <VirtualKeyboard activeKey="" errorKey="" heatmap={lastStats.keyMap} layout={layout} />
                      </div>
                      <div className="mt-auto pt-6 border-t border-slate-800 space-y-4">
                         <h4 className="text-[10px] font-black text-slate-500 uppercase">Teclas Problemáticas</h4>
                         <div className="flex flex-wrap gap-2">
                            {Object.entries(lastStats.keyMap)
                              .filter(([_, data]) => data.errors > 0)
                              .sort((a, b) => b[1].errors - a[1].errors)
                              .slice(0, 5)
                              .map(([key, data]) => (
                                <div key={key} className="bg-red-500/10 border border-red-500/30 px-3 py-1.5 rounded-lg flex items-center gap-2">
                                   <span className="font-mono font-black text-red-400">{key === ' ' ? 'SPA' : key}</span>
                                   <span className="text-[9px] text-red-500/60 font-bold">{data.errors} ERROS</span>
                                </div>
                              ))
                            }
                            {Object.entries(lastStats.keyMap).filter(([_, d]) => d.errors > 0).length === 0 && (
                              <p className="text-xs text-green-500 font-bold italic">Nenhum erro detectado! Digitação perfeita.</p>
                            )}
                         </div>
                      </div>
                    </div>
                  </div>
               </div>
            </div>
          ) : (
            <>
              <div className={`w-full mb-8 transition-all duration-500 ${focusMode && currentLesson.content.length > 0 ? 'opacity-0 -translate-y-4' : 'opacity-100'}`}>
                <div className="flex items-center gap-3 mb-1">
                   <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase">{currentLesson.title}</h2>
                   <span className="bg-blue-600/20 text-blue-400 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest">{currentLesson.category}</span>
                </div>
                <p className="text-slate-500 text-sm font-medium">{currentLesson.description}</p>
              </div>
              <TypingEngine 
                lesson={currentLesson} 
                onComplete={handleLessonComplete} 
                settings={{ soundEnabled, soundProfile, focusMode, layout }} 
              />
            </>
          )}
        </div>
      </main>

      {showCustomModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-slate-900 border-2 border-slate-700 rounded-[2.5rem] p-10 w-full max-w-xl shadow-2xl">
            <h2 className="text-2xl font-black mb-2 uppercase italic">Novo Treino</h2>
            <p className="text-slate-500 text-sm mb-6">Cole qualquer texto abaixo para praticar sua digitação.</p>
            <textarea
              className="w-full h-48 bg-slate-800 border-2 border-slate-700 rounded-3xl p-6 text-white font-mono text-sm focus:outline-none focus:border-blue-500 transition-all mb-8 shadow-inner"
              placeholder="Ex: Trecho de código, parágrafo de livro..."
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
            />
            <div className="flex gap-4">
              <button onClick={() => setShowCustomModal(false)} className="flex-1 py-4 bg-slate-800 hover:bg-slate-700 rounded-2xl font-black text-xs uppercase tracking-widest transition-all">Cancelar</button>
              <button onClick={addCustomLesson} className="flex-1 py-4 bg-blue-600 hover:bg-blue-500 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-blue-500/20">Criar Lição</button>
            </div>
          </div>
        </div>
      )}

      <footer className={`border-t border-slate-800 py-6 bg-slate-900/50 transition-all duration-500 ${focusMode ? 'opacity-0 translate-y-4' : 'opacity-100'}`}>
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <p className="text-slate-600 text-[10px] font-black uppercase tracking-widest">
            TypeMaster Pro &bull; V2.0 High Performance
          </p>
          <div className="flex gap-4">
             <div className="text-[10px] text-slate-500 font-bold">WPM MÉDIO: <span className="text-white">{progress.avgWpm}</span></div>
             <div className="text-[10px] text-slate-500 font-bold">LIÇÕES: <span className="text-white">{progress.totalLessons}</span></div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
