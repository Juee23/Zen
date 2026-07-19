import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Pause, RotateCcw, Volume2, VolumeX, Sparkles, Trophy, 
  Settings, Clock, Bell, Coffee, Check, AlertCircle, ArrowUpRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface FocusSession {
  id: string;
  duration: number; // in seconds
  timestamp: number;
  label: string;
}

// Simple browser Web Audio Synthesizer for zen sounds
const playZenSound = (type: 'tick' | 'bell' | 'complete' | 'ambient-start') => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    if (type === 'tick') {
      // Gentle soft click metronome
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(350, ctx.currentTime);
      gain.gain.setValueAtTime(0.02, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } else if (type === 'bell') {
      // Harmonious tibetan bell
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(440, ctx.currentTime); // A4
      
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(659.25, ctx.currentTime); // E5 (harmonic fifth)

      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2.5);
      
      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);
      
      osc1.start();
      osc2.start();
      osc1.stop(ctx.currentTime + 2.5);
      osc2.stop(ctx.currentTime + 2.5);
    } else if (type === 'complete') {
      // Uplifting multi-tonal chime
      const chords = [523.25, 659.25, 783.99, 1046.50]; // C Major Triad high
      chords.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.12);
        gain.gain.setValueAtTime(0.0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.06, ctx.currentTime + idx * 0.12 + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.12 + 1.2);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.12);
        osc.stop(ctx.currentTime + idx * 0.12 + 1.2);
      });
    }
  } catch (error) {
    console.warn('Web Audio Context not allowed or supported yet', error);
  }
};

// Flip card single digit visualizer with beautiful motion
function FlipCard({ digit, label }: { digit: string; label: string }) {
  const [prevDigit, setPrevDigit] = useState(digit);
  const [isFlipping, setIsFlipping] = useState(false);

  useEffect(() => {
    if (digit !== prevDigit) {
      setIsFlipping(true);
      const timer = setTimeout(() => {
        setPrevDigit(digit);
        setIsFlipping(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [digit, prevDigit]);

  return (
    <div className="flex flex-col items-center">
      {/* 3D PERSPECTIVE CONTAINER */}
      <div className="relative w-10 h-14 min-[360px]:w-12 min-[360px]:h-16 min-[420px]:w-16 min-[420px]:h-20 sm:w-20 sm:h-24 bg-[#141416] dark:bg-[#1E1E20] rounded-xl sm:rounded-2xl shadow-xl border border-slate-200/20 dark:border-white/[0.05] overflow-hidden flex flex-col justify-center items-center select-none perspective-800">
        
        {/* Horizontal middle divider line */}
        <div className="absolute left-0 right-0 h-[1.5px] bg-slate-300/30 dark:bg-black/40 z-10 top-1/2 -translate-y-1/2" />
        
        {/* UPPER/LOWER PASTEL COLOR GLOW ACCENT */}
        <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/[0.015] to-transparent pointer-events-none" />

        <AnimatePresence mode="popLayout">
          <motion.span
            key={digit}
            initial={{ rotateX: -90, opacity: 0 }}
            animate={{ rotateX: 0, opacity: 1 }}
            exit={{ rotateX: 90, opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="text-2xl min-[360px]:text-3xl min-[420px]:text-4xl sm:text-5xl font-mono font-bold text-transparent bg-clip-text bg-gradient-to-b from-pink-400 via-purple-400 to-indigo-400 dark:from-pink-300 dark:via-purple-300 dark:to-indigo-300"
          >
            {digit}
          </motion.span>
        </AnimatePresence>
      </div>
      <span className="text-[7px] min-[360px]:text-[8px] sm:text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-2">{label}</span>
    </div>
  );
}

export default function FocusStudy() {
  const [hoursInput, setHoursInput] = useState(0);
  const [minutesInput, setMinutesInput] = useState(25);
  const [secondsInput, setSecondsInput] = useState(0);

  const [totalSeconds, setTotalSeconds] = useState(25 * 60);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [focusLabel, setFocusLabel] = useState('Pomodoro Focus 🧠');

  const [sessionLogs, setSessionLogs] = useState<FocusSession[]>([]);
  const [showConfig, setShowConfig] = useState(false);

  // Sound Synth ticking ref
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Load past session history from cache
  useEffect(() => {
    const cached = localStorage.getItem('zen-focus-sessions');
    if (cached) {
      try {
        setSessionLogs(JSON.parse(cached));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Timer Tick Core Loop
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            // Timer complete!
            setIsRunning(false);
            if (soundEnabled) playZenSound('complete');
            
            // Log completed session
            const newSession: FocusSession = {
              id: Math.random().toString(36).substring(2, 11),
              duration: totalSeconds,
              timestamp: Date.now(),
              label: focusLabel
            };
            const updated = [newSession, ...sessionLogs];
            setSessionLogs(updated);
            localStorage.setItem('zen-focus-sessions', JSON.stringify(updated));

            return 0;
          }

          // Gentle tick sound occasionally
          if (soundEnabled && (prev - 1) % 5 === 0) {
            playZenSound('tick');
          }

          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, totalSeconds, focusLabel, sessionLogs, soundEnabled]);

  // Handle Preset Clicks
  const handleApplyPreset = (m: number, label: string) => {
    setIsRunning(false);
    setHoursInput(Math.floor(m / 60));
    setMinutesInput(m % 60);
    setSecondsInput(0);
    
    const secs = m * 60;
    setTotalSeconds(secs);
    setTimeLeft(secs);
    setFocusLabel(label);
    if (soundEnabled) playZenSound('tick');
  };

  // Toggle Play / Pause
  const handleTogglePlay = () => {
    if (!isRunning && timeLeft === 0) {
      // reset to current inputs if finished
      handleApplyCustom();
    }
    setIsRunning(!isRunning);
    if (soundEnabled) playZenSound('bell');
  };

  // Reset Timer
  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(totalSeconds);
    if (soundEnabled) playZenSound('tick');
  };

  // Apply custom time parameters
  const handleApplyCustom = () => {
    const calculatedSecs = (hoursInput * 3600) + (minutesInput * 60) + secondsInput;
    if (calculatedSecs <= 0) return;
    setIsRunning(false);
    setTotalSeconds(calculatedSecs);
    setTimeLeft(calculatedSecs);
    setShowConfig(false);
    if (soundEnabled) playZenSound('tick');
  };

  // Compute Digits for Flip Cards
  const hrs = Math.floor(timeLeft / 3600);
  const mins = Math.floor((timeLeft % 3600) / 60);
  const secs = timeLeft % 60;

  const hrStr = hrs.toString().padStart(2, '0');
  const minStr = mins.toString().padStart(2, '0');
  const secStr = secs.toString().padStart(2, '0');

  // Total Focus Minutes Completed
  const totalFocusSecs = sessionLogs.reduce((acc, s) => acc + s.duration, 0);
  const totalFocusMins = Math.round(totalFocusSecs / 60);

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 md:py-12 space-y-8 animate-fade-in text-slate-800 dark:text-slate-100 select-none">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/50 dark:border-white/5 pb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-400 via-purple-400 to-indigo-400 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-purple-500/10">
            <Clock size={22} className="animate-pulse" />
          </div>
          <div>
            <h1 className="font-display font-bold text-2xl sm:text-3xl tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              Focus Study <span>🧘</span>
            </h1>
            <p className="text-xs text-slate-400 font-medium">MINIMALIST RETRO FLIP POMODORO SANCTUARY</p>
          </div>
        </div>

        {/* SOUNDS & OPTIONS TOGGLE */}
        <div className="flex items-center gap-2.5 self-start md:self-auto">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2.5 rounded-xl border transition-all flex items-center gap-1.5 text-xs font-semibold cursor-pointer ${
              soundEnabled 
                ? 'bg-pink-500/5 border-pink-500/20 text-pink-500' 
                : 'bg-slate-100 dark:bg-white/5 border-slate-200/50 dark:border-white/5 text-slate-400 hover:text-slate-200'
            }`}
            title="Toggle Sound Effects"
          >
            {soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
            <span className="hidden sm:inline">{soundEnabled ? 'Chimes Active' : 'Muted'}</span>
          </button>

          <button
            onClick={() => setShowConfig(!showConfig)}
            className={`p-2.5 rounded-xl border transition-all flex items-center gap-1.5 text-xs font-semibold cursor-pointer ${
              showConfig 
                ? 'bg-purple-500/10 border-purple-500/30 text-purple-400' 
                : 'bg-slate-100 dark:bg-white/5 border-slate-200/50 dark:border-white/5 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10'
            }`}
          >
            <Settings size={14} />
            <span>Customize</span>
          </button>
        </div>
      </div>

      {/* OVERALL BENTO GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* MAIN FLIP TIMER & CONTROLS (8 COLS) */}
        <div className="lg:col-span-8 space-y-6 flex flex-col items-center">
          
          {/* CUSTOMIZABLE PARAMETERS DROPDOWN PANEL */}
          <AnimatePresence>
            {showConfig && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="w-full bg-slate-50 dark:bg-[#151518] border border-slate-200/60 dark:border-white/5 rounded-3xl p-6 space-y-5 overflow-hidden shadow-inner"
              >
                <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm">
                  <Settings size={16} className="text-pink-400" />
                  <span>Set Your Personal Sanctuary Timer</span>
                </div>

                <div className="grid grid-cols-3 gap-4 max-w-sm">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase">Hours</label>
                    <input
                      type="number"
                      min="0"
                      max="23"
                      value={hoursInput}
                      onChange={(e) => setHoursInput(Math.max(0, Math.min(23, parseInt(e.target.value) || 0)))}
                      className="w-full px-3 py-2 bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-white/5 rounded-xl text-center font-mono text-sm outline-none focus:border-pink-500/50"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase">Minutes</label>
                    <input
                      type="number"
                      min="0"
                      max="59"
                      value={minutesInput}
                      onChange={(e) => setMinutesInput(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                      className="w-full px-3 py-2 bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-white/5 rounded-xl text-center font-mono text-sm outline-none focus:border-pink-500/50"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase">Seconds</label>
                    <input
                      type="number"
                      min="0"
                      max="59"
                      value={secondsInput}
                      onChange={(e) => setSecondsInput(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                      className="w-full px-3 py-2 bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-white/5 rounded-xl text-center font-mono text-sm outline-none focus:border-pink-500/50"
                    />
                  </div>
                </div>

                <div className="space-y-1.5 max-w-md">
                  <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase">Focus Session Name</label>
                  <input
                    type="text"
                    value={focusLabel}
                    onChange={(e) => setFocusLabel(e.target.value)}
                    placeholder="e.g. Reading Plato's Republic 📚"
                    className="w-full px-4 py-2.5 bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-white/5 rounded-xl text-xs outline-none focus:border-pink-500/50"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={handleApplyCustom}
                    className="px-4 py-2 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white text-xs font-semibold rounded-xl hover:opacity-95 shadow-md cursor-pointer"
                  >
                    Apply Custom Timer
                  </button>
                  <button
                    onClick={() => setShowConfig(false)}
                    className="px-4 py-2 bg-slate-200 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:text-slate-200 text-xs font-semibold rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ACTIVE GOAL BANNER */}
          <div className="px-5 py-2 rounded-full bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5 flex items-center gap-2 shadow-sm shrink-0">
            <span className="w-2 h-2 rounded-full bg-pink-400 animate-ping" />
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300 font-sans tracking-wide uppercase">{focusLabel}</span>
          </div>

          {/* FLIP CLOCK CONTAINER */}
          <div className="flex items-center gap-1 min-[380px]:gap-2 sm:gap-4 p-4 min-[380px]:p-6 sm:p-8 bg-slate-50 dark:bg-[#111113] border border-slate-200/50 dark:border-white/[0.03] rounded-[24px] sm:rounded-[36px] shadow-xl w-full max-w-lg justify-center relative group">
            
            <div className="absolute inset-0 bg-gradient-to-tr from-pink-500/5 via-purple-500/5 to-transparent rounded-[24px] sm:rounded-[36px] pointer-events-none opacity-40 group-hover:opacity-100 transition-opacity" />

            {/* HOURS CARD (Only show if hrs > 0) */}
            {hrs > 0 && (
              <>
                <div className="flex gap-1">
                  <FlipCard digit={hrStr.charAt(0)} label="h" />
                  <FlipCard digit={hrStr.charAt(1)} label="" />
                </div>
                <div className="text-xl min-[360px]:text-2xl min-[420px]:text-3xl sm:text-4xl font-bold font-mono text-slate-400 pb-4 sm:pb-5 select-none">:</div>
              </>
            )}

            {/* MINUTES CARD */}
            <div className="flex gap-1">
              <FlipCard digit={minStr.charAt(0)} label="m" />
              <FlipCard digit={minStr.charAt(1)} label="" />
            </div>

            <div className="text-xl min-[360px]:text-2xl min-[420px]:text-3xl sm:text-4xl font-bold font-mono text-slate-400 pb-4 sm:pb-5 select-none">:</div>

            {/* SECONDS CARD */}
            <div className="flex gap-1">
              <FlipCard digit={secStr.charAt(0)} label="s" />
              <FlipCard digit={secStr.charAt(1)} label="" />
            </div>

          </div>

          {/* TIMER CORE CONTROLS */}
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={handleTogglePlay}
              className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-all transform hover:scale-105 active:scale-95 cursor-pointer ${
                isRunning 
                  ? 'bg-amber-500 text-white hover:bg-amber-600 shadow-amber-500/10' 
                  : 'bg-pink-500 text-white hover:bg-pink-600 shadow-pink-500/10 dark:bg-pink-600 dark:hover:bg-pink-500'
              }`}
              id="focus-play-btn"
            >
              {isRunning ? <Pause size={24} fill="currentColor" /> : <Play size={24} className="ml-1" fill="currentColor" />}
            </button>

            <button
              onClick={handleReset}
              className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-[#1E1E22] border border-slate-200/50 dark:border-white/5 text-slate-500 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 flex items-center justify-center shadow-sm transition-all transform hover:scale-105 active:scale-95 cursor-pointer"
              title="Reset Timer"
              id="focus-reset-btn"
            >
              <RotateCcw size={18} />
            </button>
          </div>

          {/* MINDFUL QUICK PRESET OPTIONS */}
          <div className="w-full max-w-md space-y-2.5 text-center">
            <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Mindful Focus Presets</p>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <button
                onClick={() => handleApplyPreset(25, 'Pomodoro Focus 🧠')}
                className="p-3 bg-white dark:bg-[#151518] hover:border-pink-500/20 border border-slate-200/50 dark:border-white/5 rounded-xl transition-all text-xs font-semibold hover:shadow-sm cursor-pointer"
              >
                🍅 25m Focus
              </button>
              <button
                onClick={() => handleApplyPreset(50, 'Deep Study Flow 📚')}
                className="p-3 bg-white dark:bg-[#151518] hover:border-purple-500/20 border border-slate-200/50 dark:border-white/5 rounded-xl transition-all text-xs font-semibold hover:shadow-sm cursor-pointer"
              >
                🌌 50m Study
              </button>
              <button
                onClick={() => handleApplyPreset(5, 'Short Rest Cup ☕')}
                className="p-3 bg-white dark:bg-[#151518] hover:border-teal-500/20 border border-slate-200/50 dark:border-white/5 rounded-xl transition-all text-xs font-semibold hover:shadow-sm cursor-pointer"
              >
                ☕ 5m Rest
              </button>
              <button
                onClick={() => handleApplyPreset(15, 'Long Recharge Walk 🌿')}
                className="p-3 bg-white dark:bg-[#151518] hover:border-indigo-500/20 border border-slate-200/50 dark:border-white/5 rounded-xl transition-all text-xs font-semibold hover:shadow-sm cursor-pointer"
              >
                🌿 15m Walk
              </button>
            </div>
          </div>

        </div>

        {/* SIDE BAR LOGS & AMBIENCE (4 COLS) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* DAILY HARVEST TROPHY CARD */}
          <div className="bg-gradient-to-br from-pink-500/5 via-purple-500/5 to-transparent border border-pink-500/10 rounded-3xl p-5 relative overflow-hidden">
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-gradient-to-tr from-pink-500/10 via-purple-500/10 to-transparent rounded-full pointer-events-none blur-xl" />
            
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500">
                <Trophy size={18} />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider font-mono">Daily harvest</p>
                <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white mt-0.5">{totalFocusMins} Focused Minutes</h3>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-white/[0.04] flex items-center justify-between text-xs text-slate-400">
              <span>Total completions:</span>
              <span className="font-bold text-slate-700 dark:text-slate-200">{sessionLogs.length} sessions</span>
            </div>
          </div>

          {/* FOCUS HISTORY TIMELINE */}
          <div className="bg-slate-50 dark:bg-[#151518] border border-slate-200/60 dark:border-white/5 rounded-3xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold font-mono text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <Trophy size={13} className="text-pink-400" />
                <span>Sanctuary Log</span>
              </h3>
              {sessionLogs.length > 0 && (
                <button
                  onClick={() => {
                    if (confirm('Clear focus history?')) {
                      setSessionLogs([]);
                      localStorage.removeItem('zen-focus-sessions');
                    }
                  }}
                  className="text-[10px] text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
                >
                  Clear All
                </button>
              )}
            </div>

            <div className="space-y-2.5 max-h-[180px] overflow-y-auto pr-1">
              {sessionLogs.map((log) => (
                <div 
                  key={log.id}
                  className="p-3 bg-white dark:bg-[#1E1E22] border border-slate-100 dark:border-white/[0.03] rounded-2xl flex items-center justify-between gap-2 shadow-sm"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate leading-tight">{log.label}</p>
                    <p className="text-[9px] font-mono text-slate-400 mt-1">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <span className="text-[10px] font-mono font-bold bg-pink-500/10 text-pink-500 dark:text-pink-400 px-2 py-0.5 rounded-lg shrink-0">
                    +{Math.round(log.duration / 60)}m
                  </span>
                </div>
              ))}

              {sessionLogs.length === 0 && (
                <div className="text-center py-6 text-xs text-slate-400 italic">
                  No study sessions harvested today. Start the timer to reflect!
                </div>
              )}
            </div>
          </div>

          {/* AUDIO SYNTH AMBIENT LABS */}
          <div className="bg-slate-50 dark:bg-[#151518] border border-slate-200/60 dark:border-white/5 rounded-3xl p-5 space-y-3">
            <h3 className="text-xs font-bold font-mono text-slate-400 uppercase tracking-widest">
              Ambient Audio Labs 🎹
            </h3>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Synthesized live ambient tones to keep your brain waves focused.
            </p>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => playZenSound('bell')}
                className="py-2.5 bg-white dark:bg-[#1E1E22] hover:bg-slate-100 dark:hover:bg-white/[0.03] border border-slate-100 dark:border-white/[0.03] text-[11px] text-slate-600 dark:text-slate-300 font-semibold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
              >
                🔔 Tibetan Bell
              </button>
              <button
                onClick={() => playZenSound('complete')}
                className="py-2.5 bg-white dark:bg-[#1E1E22] hover:bg-slate-100 dark:hover:bg-white/[0.03] border border-slate-100 dark:border-white/[0.03] text-[11px] text-slate-600 dark:text-slate-300 font-semibold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
              >
                ✨ Harp Chime
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
