import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, ArrowLeft, Check, Sparkles, BookOpen, Settings, 
  Lock, Mail, User, Eye, EyeOff, Layout, FileText, FolderTree, Database, Code
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface OnboardingProps {
  onComplete: (profile: { name: string; email: string; goal: string }) => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [goal, setGoal] = useState('Personal Sanctuary 🌸');
  const [isLogin, setIsLogin] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pre-seed a demo guest user in local storage if not present
  useEffect(() => {
    const storedUsers = localStorage.getItem('zen-registered-users');
    if (!storedUsers) {
      const defaultUsers = [
        { name: 'Zen Guest', email: 'guest@zen.com', password: 'password', goal: 'Personal Sanctuary 🌸' }
      ];
      localStorage.setItem('zen-registered-users', JSON.stringify(defaultUsers));
    }
  }, []);

  // Clear errors on field updates
  useEffect(() => {
    setError(null);
  }, [isLogin, email, password, name]);
  
  // Interactive Simulator States
  const [simulatedBlock, setSimulatedBlock] = useState<'text' | 'todo' | 'code'>('text');
  const [simulatedMenuOpen, setSimulatedMenuOpen] = useState(false);
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({ 'root': true });
  const [simulatedTasks, setSimulatedTasks] = useState([
    { id: 1, title: 'Draft Zen Philosophy', status: 'In Progress' },
    { id: 2, title: 'Launch Workspace App', status: 'In Progress' },
    { id: 3, title: 'Drink Matcha Tea', status: 'Done' }
  ]);

  const goals = [
    { id: 'Personal Sanctuary 🌸', label: 'Personal Sanctuary', desc: 'Private journaling, notes, lists & reflections', icon: Sparkles, color: 'from-pink-400 to-rose-400' },
    { id: 'Work & Projects 💼', label: 'Work & Projects', desc: 'Kanban roadmaps, clients, & deliverables', icon: Settings, color: 'from-indigo-400 to-blue-400' },
    { id: 'Study Wiki 🎓', label: 'Study Wiki', desc: 'Lecture research, study guides, & task tracking', icon: BookOpen, color: 'from-purple-400 to-violet-400' },
    { id: 'Creative Workspace 🎨', label: 'Creative Workspace', desc: 'Inspirations, brainstorm, & asset tracking', icon: Layout, color: 'from-teal-400 to-emerald-400' }
  ];

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) return;

    const storedUsers = localStorage.getItem('zen-registered-users');
    let users = [];
    if (storedUsers) {
      try {
        users = JSON.parse(storedUsers);
      } catch (err) {}
    }

    if (isLogin) {
      const foundUser = users.find(
        (u: any) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
      );

      if (foundUser) {
        onComplete({ name: foundUser.name, email: foundUser.email, goal: foundUser.goal });
      } else {
        setError('Invalid email or password. Try guest@zen.com with password.');
      }
    } else {
      if (!name) return;
      if (users.some((u: any) => u.email.toLowerCase() === email.toLowerCase())) {
        setError('An account with this email already exists. Please log in.');
        return;
      }

      const newUser = { name, email, goal, password };
      users.push(newUser);
      localStorage.setItem('zen-registered-users', JSON.stringify(users));
      onComplete({ name, email, goal });
    }
  };

  const isFormValid = isLogin 
    ? email.trim().includes('@') && password.length >= 6
    : name.trim() !== '' && email.trim().includes('@') && password.length >= 6;

  // Toggle tree node expansion
  const toggleNode = (id: string) => {
    setExpandedNodes(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Toggle task status
  const moveTask = (taskId: number) => {
    setSimulatedTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        return { ...t, status: t.status === 'Done' ? 'In Progress' : 'Done' };
      }
      return t;
    }));
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0A0A0B] flex items-center justify-center p-4 overflow-y-auto selection:bg-pink-500/20 selection:text-pink-300">
      
      {/* Visual background atmospheric lights */}
      <div className="absolute top-0 left-0 right-0 h-96 bg-gradient-to-b from-purple-500/5 via-transparent to-transparent pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-96 bg-gradient-to-t from-pink-500/5 via-transparent to-transparent pointer-events-none" />

      <div className="w-full max-w-4xl min-h-[550px] bg-[#121214] border border-white/5 rounded-[32px] shadow-2xl flex flex-col md:flex-row overflow-hidden relative z-10">
        
        {/* Left Visual Column */}
        <div className="w-full md:w-[42%] bg-gradient-to-b from-[#18181B] to-[#121214] p-8 flex flex-col justify-between border-b md:border-b-0 md:border-r border-white/5">
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-tr from-pink-400 via-purple-400 to-indigo-400 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-md">
                Z
              </div>
              <span className="font-display font-bold text-lg text-white tracking-tight">Zen</span>
            </div>

            {/* Step Indicators */}
            <div className="hidden md:flex flex-col gap-4 pt-8">
              {[
                'Peaceful Welcome',
                'Block Editor',
                'Sidebar Tree',
                'Task Databases',
                'Create Sanctuary'
              ].map((label, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold transition-all ${
                    step === idx 
                      ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/20 scale-110' 
                      : step > idx 
                        ? 'bg-emerald-500/20 text-emerald-400' 
                        : 'bg-white/5 text-slate-500'
                  }`}>
                    {step > idx ? <Check size={12} /> : idx + 1}
                  </div>
                  <span className={`text-xs font-semibold tracking-wide transition-colors ${
                    step === idx ? 'text-white font-bold' : 'text-slate-500'
                  }`}>{label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-8">
            <p className="text-[10px] font-mono text-slate-600 uppercase tracking-widest">MINIMALIST DIGITAL SANCTUARY</p>
          </div>
        </div>

        {/* Right Active Onboarding Area */}
        <div className="flex-1 p-8 md:p-12 flex flex-col justify-between bg-[#121214]">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              transition={{ duration: 0.25 }}
              className="flex-1 flex flex-col justify-center"
            >
              
              {/* STEP 0: Welcome Slide */}
              {step === 0 && (
                <div className="space-y-6">
                  <div className="w-16 h-16 rounded-3xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center">
                    <Sparkles size={30} className="text-pink-400 animate-pulse" />
                  </div>
                  <div className="space-y-2">
                    <h1 className="font-display font-bold text-3xl text-white tracking-tight leading-tight">
                      Step Into Your <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">Sanctuary</span>
                    </h1>
                    <p className="text-sm text-slate-400 leading-relaxed max-w-md">
                      Zen is a beautiful, offline-first digital home designed for absolute tranquility. Organize your life goals, project roadmaps, and wikis without the clutter.
                    </p>
                  </div>
                  <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl max-w-md">
                    <p className="text-xs text-slate-400 leading-relaxed italic">
                      "Simplify, slow down, and create a calm interface for your daily productivity."
                    </p>
                  </div>
                </div>
              )}

              {/* STEP 1: Block Editor */}
              {step === 1 && (
                <div className="space-y-6">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                    <FileText size={24} className="text-indigo-400" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="font-display font-bold text-2xl text-white tracking-tight">
                      The Fluid Block Editor ✍️
                    </h2>
                    <p className="text-xs text-slate-400 leading-relaxed max-w-md">
                      Type normally, or press <kbd className="bg-white/10 px-1.5 py-0.5 rounded text-[10px] font-mono text-slate-300">Enter</kbd> to add a new block. Trigger slash commands with <kbd className="bg-white/10 px-1.5 py-0.5 rounded text-[10px] font-mono text-slate-300">/</kbd> to format instantly.
                    </p>
                  </div>

                  {/* Block Editor Interactive Simulator */}
                  <div className="p-4 bg-[#18181C] border border-white/5 rounded-2xl max-w-md space-y-3 relative">
                    <p className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-1">Interactive Editor Sandbox</p>
                    
                    <div className="space-y-2">
                      {simulatedBlock === 'text' && (
                        <div className="p-2.5 bg-white/[0.03] border border-white/5 rounded-xl flex items-center justify-between">
                          <span className="text-xs text-slate-300 font-sans">I am a clean standard text block.</span>
                          <button 
                            onClick={() => setSimulatedMenuOpen(true)}
                            className="text-[10px] bg-pink-500/20 text-pink-300 hover:bg-pink-500/30 px-2 py-1 rounded-lg cursor-pointer"
                          >
                            Press /
                          </button>
                        </div>
                      )}

                      {simulatedBlock === 'todo' && (
                        <div className="p-2.5 bg-emerald-500/5 border border-emerald-500/20 rounded-xl flex items-center gap-2">
                          <div className="w-4 h-4 rounded border border-emerald-400/50 flex items-center justify-center text-emerald-400">
                            <Check size={10} />
                          </div>
                          <span className="text-xs text-slate-300 font-sans line-through">Check off goals seamlessly!</span>
                        </div>
                      )}

                      {simulatedBlock === 'code' && (
                        <div className="p-2.5 bg-purple-500/5 border border-purple-500/20 rounded-xl space-y-1 font-mono text-[10px]">
                          <p className="text-purple-400">// Beautiful syntax container</p>
                          <p className="text-slate-300">const serenity = true;</p>
                        </div>
                      )}
                    </div>

                    {/* Slash Command simulated popover */}
                    <AnimatePresence>
                      {simulatedMenuOpen && (
                        <motion.div 
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="absolute bottom-12 right-4 bg-[#212124] border border-white/10 rounded-xl p-1.5 shadow-xl w-36 z-20 space-y-1"
                        >
                          <button 
                            onClick={() => {
                              setSimulatedBlock('todo');
                              setSimulatedMenuOpen(false);
                            }}
                            className="w-full text-left text-[11px] p-1.5 hover:bg-white/5 text-slate-300 rounded flex items-center gap-1.5 cursor-pointer"
                          >
                            <span>☑️</span> Todo Checkbox
                          </button>
                          <button 
                            onClick={() => {
                              setSimulatedBlock('code');
                              setSimulatedMenuOpen(false);
                            }}
                            className="w-full text-left text-[11px] p-1.5 hover:bg-white/5 text-slate-300 rounded flex items-center gap-1.5 cursor-pointer"
                          >
                            <span>💻</span> Code Block
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {simulatedBlock !== 'text' && (
                      <button 
                        onClick={() => {
                          setSimulatedBlock('text');
                          setSimulatedMenuOpen(false);
                        }}
                        className="text-[10px] text-slate-500 hover:text-slate-300 underline mt-1"
                      >
                        Reset Simulator
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* STEP 2: Hierarchical Pages */}
              {step === 2 && (
                <div className="space-y-6">
                  <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                    <FolderTree size={24} className="text-purple-400" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="font-display font-bold text-2xl text-white tracking-tight">
                      Mindful Sidebar Tree 🗂️
                    </h2>
                    <p className="text-xs text-slate-400 leading-relaxed max-w-md">
                      Organize infinitely with nested pages in the sidebar. Keep your mind completely structured. Click nodes below to preview expand/collapse state.
                    </p>
                  </div>

                  {/* Interactive Sidebar Tree Simulator */}
                  <div className="p-4 bg-[#18181C] border border-white/5 rounded-2xl max-w-md font-sans">
                    <p className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-2">Simulated Sidebar Hierarchy</p>
                    <div className="space-y-1.5">
                      <div 
                        onClick={() => toggleNode('root')}
                        className="flex items-center gap-2 p-1.5 hover:bg-white/5 rounded-lg cursor-pointer text-xs text-slate-200"
                      >
                        <span>{expandedNodes['root'] ? '▼' : '►'}</span>
                        <span>🌸 Welcome Home</span>
                      </div>
                      
                      {expandedNodes['root'] && (
                        <div className="pl-4 border-l border-white/5 space-y-1">
                          <div className="flex items-center gap-2 p-1 hover:bg-white/5 rounded text-xs text-slate-400">
                            <span>💡</span> Quick Tips
                          </div>
                          <div 
                            onClick={() => toggleNode('personal')}
                            className="flex items-center gap-2 p-1 hover:bg-white/5 rounded cursor-pointer text-xs text-slate-400"
                          >
                            <span>{expandedNodes['personal'] ? '▼' : '►'}</span>
                            <span>🏡 Personal Sanctuary</span>
                          </div>
                          {expandedNodes['personal'] && (
                            <div className="pl-4 border-l border-white/5 space-y-1">
                              <div className="flex items-center gap-2 p-1 hover:bg-white/5 rounded text-xs text-slate-500">
                                <span>📓</span> Daily Journal
                              </div>
                              <div className="flex items-center gap-2 p-1 hover:bg-white/5 rounded text-xs text-slate-500">
                                <span>🛒</span> Sourdough Groceries
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: Databases / Kanban */}
              {step === 3 && (
                <div className="space-y-6">
                  <div className="w-14 h-14 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center">
                    <Database size={24} className="text-teal-400" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="font-display font-bold text-2xl text-white tracking-tight">
                      Boards & Databases 📊
                    </h2>
                    <p className="text-xs text-slate-400 leading-relaxed max-w-md">
                      Power-users can build databases containing board and list views. Click individual task items below to experience real-time board manipulation.
                    </p>
                  </div>

                  {/* Kanban Board Simulator */}
                  <div className="p-4 bg-[#18181C] border border-white/5 rounded-2xl max-w-md">
                    <p className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-2">Simulated Interactive Kanban</p>
                    <div className="grid grid-cols-2 gap-3">
                      
                      {/* Doing Column */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-1 px-1">
                          <div className="w-1.5 h-1.5 rounded-full bg-pink-400" />
                          <span className="text-[10px] font-bold text-slate-400 tracking-wide uppercase">In Progress</span>
                        </div>
                        <div className="space-y-1.5 min-h-[60px]">
                          {simulatedTasks.filter(t => t.status === 'In Progress').map(t => (
                            <div 
                              key={t.id} 
                              onClick={() => moveTask(t.id)}
                              className="p-2 bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 rounded-xl text-[11px] text-slate-300 flex items-center justify-between cursor-pointer"
                            >
                              <span className="truncate">{t.title}</span>
                              <span className="text-[9px] bg-pink-500/10 text-pink-300 px-1 rounded">►</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Done Column */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-1 px-1">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          <span className="text-[10px] font-bold text-slate-400 tracking-wide uppercase">Done</span>
                        </div>
                        <div className="space-y-1.5 min-h-[60px]">
                          {simulatedTasks.filter(t => t.status === 'Done').map(t => (
                            <div 
                              key={t.id} 
                              onClick={() => moveTask(t.id)}
                              className="p-2 bg-emerald-500/5 hover:bg-emerald-500/10 border border-emerald-500/10 rounded-xl text-[11px] text-slate-400 flex items-center justify-between cursor-pointer line-through decoration-emerald-500/20"
                            >
                              <span className="truncate">{t.title}</span>
                              <span className="text-[9px] bg-emerald-500/10 text-emerald-300 px-1 rounded">✓</span>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: Account Creation Screen */}
              {step === 4 && (
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Tab Selector */}
                  <div className="flex bg-[#18181C] p-1 rounded-xl max-w-md border border-white/5">
                    <button
                      type="button"
                      onClick={() => setIsLogin(false)}
                      className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                        !isLogin 
                          ? 'bg-pink-500 text-white shadow-md' 
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Create Sanctuary (Sign Up)
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsLogin(true)}
                      className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                        isLogin 
                          ? 'bg-pink-500 text-white shadow-md' 
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Enter Sanctuary (Log In)
                    </button>
                  </div>

                  <div className="space-y-1">
                    <h2 className="font-display font-bold text-2xl text-white tracking-tight">
                      {isLogin ? 'Enter Your Zen Sanctuary 🌸' : 'Create Your Zen Sanctuary Account 🌸'}
                    </h2>
                    <p className="text-xs text-slate-400">
                      {isLogin 
                        ? 'Welcome back. Log in to restore your local sanctuary.' 
                        : 'We personalize your starter templates based on your custom focus goal.'}
                    </p>
                  </div>

                  {error && (
                    <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs rounded-xl max-w-md">
                      ⚠️ {error}
                    </div>
                  )}

                  {/* Form inputs */}
                  <div className="space-y-3 max-w-md">
                    {!isLogin && (
                      <div className="relative">
                        <User size={14} className="absolute left-3.5 top-3.5 text-slate-500" />
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Your full name"
                          className="w-full pl-10 pr-4 py-2.5 bg-[#18181C] border border-white/5 hover:border-white/10 focus:border-pink-500/50 rounded-xl text-xs text-white outline-none transition-all placeholder-slate-500"
                          id="signup-name-input"
                        />
                      </div>
                    )}

                    <div className="relative">
                      <Mail size={14} className="absolute left-3.5 top-3.5 text-slate-500" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Your email address"
                        className="w-full pl-10 pr-4 py-2.5 bg-[#18181C] border border-white/5 hover:border-white/10 focus:border-pink-500/50 rounded-xl text-xs text-white outline-none transition-all placeholder-slate-500"
                        id="signup-email-input"
                      />
                    </div>

                    <div className="relative">
                      <Lock size={14} className="absolute left-3.5 top-3.5 text-slate-500" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Your password (min 6 chars)"
                        className="w-full pl-10 pr-10 py-2.5 bg-[#18181C] border border-white/5 hover:border-white/10 focus:border-pink-500/50 rounded-xl text-xs text-white outline-none transition-all placeholder-slate-500"
                        id="signup-password-input"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3.5 text-slate-500 hover:text-slate-300 cursor-pointer"
                      >
                        {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>

                  {/* Goal Selections */}
                  {!isLogin && (
                    <div className="space-y-2">
                      <p className="text-[11px] font-semibold text-slate-400 tracking-wider uppercase">Select your focus goal</p>
                      <div className="grid grid-cols-2 gap-2.5 max-w-md">
                        {goals.map(g => {
                          const Icon = g.icon;
                          const isSelected = goal === g.id;
                          return (
                            <div
                              key={g.id}
                              onClick={() => setGoal(g.id)}
                              className={`p-3 rounded-xl border cursor-pointer text-left transition-all relative overflow-hidden flex flex-col justify-between h-[85px] ${
                                isSelected 
                                  ? 'bg-pink-500/5 border-pink-500/30 shadow-md shadow-pink-500/5' 
                                  : 'bg-[#18181C] border-white/5 hover:border-white/10'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className={`p-1.5 rounded-lg bg-gradient-to-tr ${g.color} text-slate-900`}>
                                  <Icon size={12} />
                                </div>
                                {isSelected && (
                                  <span className="text-[10px] font-bold text-pink-400 flex items-center gap-0.5">
                                    <Check size={10} /> Selected
                                  </span>
                                )}
                              </div>
                              <div>
                                <p className="text-[11px] font-bold text-white leading-snug">{g.label}</p>
                                <p className="text-[9px] text-slate-500 truncate leading-none mt-0.5">{g.desc}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={!isFormValid}
                      className={`w-full max-w-md py-3 text-xs font-semibold rounded-xl tracking-wide shadow-lg transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer ${
                        isFormValid 
                          ? 'bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white hover:opacity-95 shadow-pink-500/10' 
                          : 'bg-slate-800 text-slate-500 pointer-events-none'
                      }`}
                      id="signup-submit-btn"
                    >
                      <Sparkles size={13} />
                      <span>{isLogin ? 'Enter Sanctuary & Restore' : 'Create Sanctuary & Begin'}</span>
                    </button>
                  </div>

                  {isLogin && (
                    <p className="text-[11px] text-slate-500 max-w-md leading-relaxed">
                      💡 Testing? Sign in with email <span className="text-pink-400 font-mono">guest@zen.com</span> and password <span className="text-pink-400 font-mono">password</span>.
                    </p>
                  )}
                </form>
              )}

            </motion.div>
          </AnimatePresence>

          {/* Bottom Control Bar */}
          <div className="flex items-center justify-between border-t border-white/5 pt-6 mt-6 max-w-md md:max-w-none">
            {step < 4 ? (
              <button
                onClick={() => setStep(4)}
                className="text-xs text-slate-500 hover:text-slate-300 underline cursor-pointer"
              >
                Skip to Signup
              </button>
            ) : (
              <div className="text-[10px] text-slate-500 font-mono">
                Your data is saved securely in your browser cache.
              </div>
            )}

            <div className="flex items-center gap-3">
              {step > 0 && (
                <button
                  onClick={handleBack}
                  className="flex items-center gap-1 px-3.5 py-1.5 border border-white/5 hover:bg-white/5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-all cursor-pointer"
                >
                  <ArrowLeft size={13} />
                  <span>Back</span>
                </button>
              )}
              
              {step < 4 && (
                <button
                  onClick={handleNext}
                  className="flex items-center gap-1 px-4 py-1.5 bg-white hover:bg-slate-100 rounded-xl text-xs font-semibold text-slate-900 transition-all cursor-pointer"
                >
                  <span>Next</span>
                  <ArrowRight size={13} />
                </button>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
