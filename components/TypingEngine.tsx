
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { TypingStats, Lesson, KeyboardLayout, SoundProfile } from '../types';
import VirtualKeyboard from './VirtualKeyboard';

interface TypingEngineProps {
  lesson: Lesson;
  onComplete: (stats: TypingStats) => void;
  settings: {
    soundEnabled: boolean;
    soundProfile: SoundProfile;
    focusMode: boolean;
    layout: KeyboardLayout;
  };
}

const TypingEngine: React.FC<TypingEngineProps> = ({ lesson, onComplete, settings }) => {
  const [userInput, setUserInput] = useState('');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [errorIndex, setErrorIndex] = useState<number | null>(null);
  const [isShaking, setIsShaking] = useState(false);
  const [stats, setStats] = useState<TypingStats>({
    wpm: 0,
    accuracy: 100,
    errors: 0,
    timeElapsed: 0,
    charsTyped: 0,
    history: [],
    keyMap: {},
    timestamp: Date.now()
  });
  
  const inputRef = useRef<HTMLInputElement>(null);
  const audioCtx = useRef<AudioContext | null>(null);

  const playClickSound = useCallback((isError = false) => {
    if (!settings.soundEnabled) return;
    if (!audioCtx.current) {
      audioCtx.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    
    const osc = audioCtx.current.createOscillator();
    const gain = audioCtx.current.createGain();
    
    // Simple synth for different profiles
    const freq = isError ? 120 : (settings.soundProfile === 'clicky' ? 900 : 400);
    const duration = settings.soundProfile === 'tactile' ? 0.15 : 0.08;

    osc.type = settings.soundProfile === 'linear' ? 'sine' : 'square';
    osc.frequency.setValueAtTime(freq, audioCtx.current.currentTime);
    osc.frequency.exponentialRampToValueAtTime(10, audioCtx.current.currentTime + duration);
    
    gain.gain.setValueAtTime(0.05, audioCtx.current.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.current.currentTime + duration);
    
    osc.connect(gain);
    gain.connect(audioCtx.current.destination);
    osc.start();
    osc.stop(audioCtx.current.currentTime + duration);
  }, [settings.soundEnabled, settings.soundProfile]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      setUserInput('');
      setStartTime(null);
      setErrorIndex(null);
      return;
    }
    if (e.key.length > 1 && e.key !== 'Backspace' && e.key !== 'Enter') return;
    if (!startTime && e.key.length === 1) setStartTime(Date.now());
    inputRef.current?.focus();
  }, [startTime]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const lastCharIndex = value.length - 1;
    const expectedChar = lesson.content[lastCharIndex];
    const typedChar = value[lastCharIndex];

    if (value.length > lesson.content.length) return;

    const normalizedKey = expectedChar?.toUpperCase();
    const currentKeyStats = stats.keyMap[normalizedKey] || { errors: 0, total: 0 };

    if (typedChar === expectedChar) {
      playClickSound(false);
      setUserInput(value);
      setErrorIndex(null);
      
      const currentTime = Date.now();
      const elapsedMs = currentTime - (startTime || currentTime);
      const newWpm = Math.round((value.length / 5) / (elapsedMs / 60000)) || 0;
      
      setStats(prev => ({
        ...prev,
        wpm: newWpm,
        charsTyped: value.length,
        timeElapsed: elapsedMs / 1000,
        accuracy: Math.round(((value.length - prev.errors) / value.length) * 100) || 100,
        history: [...prev.history, { wpm: newWpm, time: elapsedMs / 1000 }],
        keyMap: {
          ...prev.keyMap,
          [normalizedKey]: { ...currentKeyStats, total: currentKeyStats.total + 1 }
        }
      }));

      if (value.length === lesson.content.length) {
        onComplete({ 
          ...stats, 
          wpm: newWpm, 
          timeElapsed: elapsedMs / 1000,
          timestamp: Date.now()
        });
        setStartTime(null);
        setUserInput('');
      }
    } else if (value.length > userInput.length) {
      playClickSound(true);
      setErrorIndex(lastCharIndex);
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 300);
      
      setStats(prev => ({
        ...prev,
        errors: prev.errors + 1,
        accuracy: Math.round(((prev.charsTyped - (prev.errors + 1)) / (prev.charsTyped + 1)) * 100),
        keyMap: {
          ...prev.keyMap,
          [normalizedKey]: { ...currentKeyStats, errors: currentKeyStats.errors + 1, total: currentKeyStats.total + 1 }
        }
      }));
    }
  };

  const nextChar = lesson.content[userInput.length] || '';
  const errorChar = errorIndex !== null ? lesson.content[errorIndex] : '';

  return (
    <div className={`w-full max-w-4xl flex flex-col gap-8 transition-all duration-500`}>
      <div className={`grid grid-cols-4 gap-4 transition-all ${settings.focusMode && userInput.length > 0 ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100'}`}>
        {[
          { label: 'WPM', value: stats.wpm, color: 'text-blue-400' },
          { label: 'Precisão', value: `${stats.accuracy}%`, color: 'text-green-400' },
          { label: 'Erros', value: stats.errors, color: 'text-red-400' },
          { label: 'Tempo', value: `${stats.timeElapsed.toFixed(1)}s`, color: 'text-yellow-400' }
        ].map((stat, i) => (
          <div key={i} className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 backdrop-blur-sm shadow-inner">
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">{stat.label}</p>
            <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className={`relative p-12 bg-slate-900 rounded-3xl border-2 border-slate-700 shadow-2xl overflow-hidden min-h-[240px] flex items-center justify-center transition-all ${isShaking ? 'animate-shake border-red-500/50' : ''}`}>
        <div className="font-mono text-4xl leading-relaxed tracking-widest select-none max-w-full break-words text-center">
          {lesson.content.split('').map((char, i) => {
            let color = 'text-slate-600'; // Letras futuras (apagadas)
            let cursorClass = '';
            
            if (i < userInput.length) {
              color = 'text-slate-100'; // Letras já digitadas (brancas)
            } else if (i === userInput.length) {
              // LETRA ATUAL: Destaque máximo em azul brilhante
              color = errorIndex === i ? 'text-red-500' : 'text-blue-400 font-bold';
              cursorClass = 'typing-cursor';
            }

            return (
              <span key={i} className={`${color} ${cursorClass} transition-all duration-75 relative px-[1px]`}>
                {char === ' ' ? '\u00A0' : char}
              </span>
            );
          })}
        </div>
        
        <input
          ref={inputRef}
          type="text"
          className="absolute inset-0 opacity-0 cursor-default"
          value={userInput}
          onChange={handleChange}
          autoFocus
        />
      </div>

      {!settings.focusMode && (
        <VirtualKeyboard activeKey={nextChar} errorKey={errorChar} heatmap={stats.keyMap} layout={settings.layout} />
      )}

      <div className={`text-center text-slate-500 text-xs transition-opacity ${settings.focusMode ? 'opacity-0' : 'opacity-100'}`}>
        Pressione <kbd className="px-2 py-0.5 bg-slate-800 rounded border border-slate-700">Esc</kbd> para resetar a lição.
      </div>
    </div>
  );
};

export default TypingEngine;
