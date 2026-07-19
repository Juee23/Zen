import React, { useState, useEffect, useMemo } from 'react';
import { Page } from '../types';
import { 
  Plus, Trash2, Calendar as CalendarIcon, CheckSquare, ListTodo, 
  ChevronLeft, ChevronRight, FileText, Database, Sparkles, Clock, 
  Trash, Check, X, AlertCircle, Bell, ChevronRightSquare, CalendarDays,
  Target
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getPastelColor } from '../utils';

interface HomeViewProps {
  pages: Page[];
  onSelectPage: (id: string) => void;
  userProfile?: { name: string; email: string; goal: string } | null;
}

interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  tag: string;
  createdAt: number;
}

interface CalendarEvent {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  type: 'event' | 'deadline' | 'meeting' | 'mindfulness';
  time: string; // HH:MM
  description?: string;
}

const ZEN_AFFIRMATIONS = [
  "Quiet the mind and the soul will speak. 🌸",
  "Focus on the present moment, for it is the only one you truly have. ✨",
  "Great things are done by a series of small things brought together. 🎯",
  "Your mind is a sanctuary. Keep it serene and tidy. 🌿",
  "Simplicity is the ultimate sophistication in work and life. 💡",
  "Do not hurry, do not worry. You are exactly where you need to be. 🧘",
  "Energy flows where attention goes. Focus on what matters. 🚀"
];

export default function HomeView({ pages, onSelectPage, userProfile }: HomeViewProps) {
  // --- States ---
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [newTodoText, setNewTodoText] = useState('');
  const [todoFilter, setTodoFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [newTodoPriority, setNewTodoPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [newTodoTag, setNewTodoTag] = useState('Personal');

  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  
  // New event form state
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventTime, setNewEventTime] = useState('10:00');
  const [newEventType, setNewEventType] = useState<'event' | 'deadline' | 'meeting' | 'mindfulness'>('event');
  const [newEventDesc, setNewEventDesc] = useState('');
  const [showEventForm, setShowEventForm] = useState(false);

  // Zen quote state
  const [quoteIndex, setQuoteIndex] = useState(0);

  // Initialize Zen Affirmation random selection
  useEffect(() => {
    const randomIdx = Math.floor(Math.random() * ZEN_AFFIRMATIONS.length);
    setQuoteIndex(randomIdx);
  }, []);

  // --- Persistent Storage Loading ---
  useEffect(() => {
    // Load Todos
    const storedTodos = localStorage.getItem('zen-home-todos');
    if (storedTodos) {
      setTodos(JSON.parse(storedTodos));
    } else {
      // Default todos
      const defaults: TodoItem[] = [
        { id: '1', text: 'Reflect on daily goals 🧘', completed: false, priority: 'high', tag: 'Mindfulness', createdAt: Date.now() - 3600000 },
        { id: '2', text: 'Create workspace wiki outline 📚', completed: true, priority: 'medium', tag: 'Work', createdAt: Date.now() - 7200000 },
        { id: '3', text: 'Complete study milestone 🎓', completed: false, priority: 'low', tag: 'Study', createdAt: Date.now() }
      ];
      setTodos(defaults);
      localStorage.setItem('zen-home-todos', JSON.stringify(defaults));
    }

    // Load Events
    const storedEvents = localStorage.getItem('zen-home-calendar-events');
    const todayStr = new Date().toISOString().split('T')[0];
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    if (storedEvents) {
      setEvents(JSON.parse(storedEvents));
    } else {
      // Default events
      const defaultEvents: CalendarEvent[] = [
        { id: 'e1', date: todayStr, title: 'Weekly Sanctuary Reflection', type: 'mindfulness', time: '09:00', description: 'Take 15 minutes to organize ideas and set key focus intentions.' },
        { id: 'e2', date: todayStr, title: 'Study Plan Deadline 🎓', type: 'deadline', time: '17:00', description: 'Review all core workspace goals and set assignments.' },
        { id: 'e3', date: tomorrowStr, title: 'Zen Sync Meeting 💬', type: 'meeting', time: '14:00', description: 'Collaborative alignment for ongoing personal wikis and project boards.' }
      ];
      setEvents(defaultEvents);
      localStorage.setItem('zen-home-calendar-events', JSON.stringify(defaultEvents));
    }
  }, []);

  // --- Save to LocalStorage helpers ---
  const saveTodos = (updatedTodos: TodoItem[]) => {
    setTodos(updatedTodos);
    localStorage.setItem('zen-home-todos', JSON.stringify(updatedTodos));
  };

  const saveEvents = (updatedEvents: CalendarEvent[]) => {
    setEvents(updatedEvents);
    localStorage.setItem('zen-home-calendar-events', JSON.stringify(updatedEvents));
  };

  // --- To-Do Handlers ---
  const handleAddTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodoText.trim()) return;

    const newTodo: TodoItem = {
      id: Date.now().toString(),
      text: newTodoText.trim(),
      completed: false,
      priority: newTodoPriority,
      tag: newTodoTag.trim() || 'General',
      createdAt: Date.now()
    };

    saveTodos([newTodo, ...todos]);
    setNewTodoText('');
    setNewTodoTag('Personal');
  };

  const handleToggleTodo = (id: string) => {
    const updated = todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
    saveTodos(updated);
  };

  const handleDeleteTodo = (id: string) => {
    const updated = todos.filter(todo => todo.id !== id);
    saveTodos(updated);
  };

  // Filtered Todos
  const filteredTodos = useMemo(() => {
    return todos.filter(todo => {
      if (todoFilter === 'pending') return !todo.completed;
      if (todoFilter === 'completed') return todo.completed;
      return true;
    });
  }, [todos, todoFilter]);

  // Todo Completion Statistics
  const todoStats = useMemo(() => {
    const total = todos.length;
    const completed = todos.filter(t => t.completed).length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, percentage };
  }, [todos]);

  // --- Calendar Math Helpers ---
  const daysInMonth = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    return new Date(year, month + 1, 0).getDate();
  }, [currentMonth]);

  const firstDayIndex = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    // 0 = Sunday, 1 = Monday, etc.
    return new Date(year, month, 1).getDay();
  }, [currentMonth]);

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const isToday = (day: number) => {
    const today = new Date();
    return today.getDate() === day &&
      today.getMonth() === currentMonth.getMonth() &&
      today.getFullYear() === currentMonth.getFullYear();
  };

  const isSelected = (day: number) => {
    return selectedDate.getDate() === day &&
      selectedDate.getMonth() === currentMonth.getMonth() &&
      selectedDate.getFullYear() === currentMonth.getFullYear();
  };

  const formattedSelectedDate = useMemo(() => {
    return selectedDate.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }, [selectedDate]);

  // Get date key for event lookup (YYYY-MM-DD)
  const getDateKey = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const selectedDateKey = useMemo(() => getDateKey(selectedDate), [selectedDate]);

  // Get events on selected date
  const selectedDateEvents = useMemo(() => {
    return events
      .filter(e => e.date === selectedDateKey)
      .sort((a, b) => a.time.localeCompare(b.time));
  }, [events, selectedDateKey]);

  // Check if a day has events for calendar render
  const getDayEventsCount = (day: number) => {
    const targetDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const key = getDateKey(targetDate);
    const dayEvents = events.filter(e => e.date === key);
    return {
      count: dayEvents.length,
      types: dayEvents.map(e => e.type)
    };
  };

  // --- Event Add/Delete Handlers ---
  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle.trim()) return;

    const newEvent: CalendarEvent = {
      id: Date.now().toString(),
      date: selectedDateKey,
      title: newEventTitle.trim(),
      type: newEventType,
      time: newEventTime || '12:00',
      description: newEventDesc.trim() || undefined
    };

    saveEvents([...events, newEvent]);
    setNewEventTitle('');
    setNewEventTime('10:00');
    setNewEventDesc('');
    setShowEventForm(false);
  };

  const handleDeleteEvent = (id: string) => {
    const updated = events.filter(e => e.id !== id);
    saveEvents(updated);
  };

  // --- Thumbnails Helpers ---
  // List only root pages, limit to 6 for a compact gorgeous look
  const rootPages = useMemo(() => {
    return pages.filter(p => p.parentId === null).slice(0, 6);
  }, [pages]);

  // Priority color map helper
  const getPriorityBadge = (priority: 'low' | 'medium' | 'high') => {
    switch (priority) {
      case 'high':
        return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
      case 'medium':
        return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      default:
        return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
    }
  };

  // Calendar event type styles
  const getEventTypeStyles = (type: string) => {
    switch (type) {
      case 'deadline':
        return {
          bg: 'bg-rose-500/10 dark:bg-rose-500/20 border-rose-500/20 text-rose-600 dark:text-rose-300',
          dot: 'bg-rose-500'
        };
      case 'meeting':
        return {
          bg: 'bg-blue-500/10 dark:bg-blue-500/20 border-blue-500/20 text-blue-600 dark:text-blue-300',
          dot: 'bg-blue-500'
        };
      case 'mindfulness':
        return {
          bg: 'bg-emerald-500/10 dark:bg-emerald-500/20 border-emerald-500/20 text-emerald-600 dark:text-emerald-300',
          dot: 'bg-emerald-500'
        };
      default: // event
        return {
          bg: 'bg-purple-500/10 dark:bg-purple-500/20 border-purple-500/20 text-purple-600 dark:text-purple-300',
          dot: 'bg-purple-500'
        };
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-12 py-8 space-y-8 text-slate-700 dark:text-slate-300" id="home-dashboard-container">
      
      {/* 1. MINDFUL GREETING HEADER */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 sm:p-8 bg-gradient-to-r from-pink-500/5 via-purple-500/5 to-indigo-500/5 dark:from-pink-500/10 dark:via-purple-500/10 dark:to-indigo-500/10 rounded-3xl border border-slate-200/50 dark:border-white/[0.03] shadow-md relative overflow-hidden"
        id="home-greeting-banner"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-tr from-pink-500/10 to-indigo-500/10 rounded-full blur-3xl -z-10 pointer-events-none" />
        
        <div className="space-y-1.5 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-2xl animate-pulse">🌸</span>
            <span className="text-xs font-bold uppercase tracking-widest text-pink-500 dark:text-pink-400 font-mono">My Sanctuary Home</span>
          </div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-slate-900 dark:text-white tracking-tight">
            Welcome back, {userProfile?.name || 'Zen Companion'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium italic">
            "{ZEN_AFFIRMATIONS[quoteIndex]}"
          </p>
        </div>

        {/* Quick Goal Presets / Tracker */}
        <div className="flex flex-col justify-center px-5 py-3.5 bg-white/60 dark:bg-white/[0.02] border border-slate-200/40 dark:border-white/5 rounded-2xl min-w-[200px] text-center md:text-left shadow-sm">
          <div className="flex items-center justify-center md:justify-start gap-1.5 text-xs font-semibold text-slate-400 dark:text-slate-500 mb-1">
            <Target size={13} className="text-purple-500" />
            <span className="uppercase tracking-wide text-[10px]">Active Intent</span>
          </div>
          <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm truncate">{userProfile?.goal || 'Personal Sanctuary 🌸'}</p>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono mt-0.5">Tasks Done: {todoStats.completed}/{todoStats.total} ({todoStats.percentage}%)</span>
        </div>
      </motion.div>

      {/* TWO-COLUMN BENTO GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Workspace Thumbnails & Calendar (lg:span-8) */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* A. WORKSPACE PAGES THUMBNAILS */}
          <div className="space-y-3.5" id="home-thumbnails-section">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <FileText size={18} className="text-pink-500" />
                <h2 className="font-display font-bold text-lg text-slate-900 dark:text-white">Workspace Shortcuts</h2>
              </div>
              <span className="text-xs text-slate-400 dark:text-slate-500 font-semibold uppercase font-mono tracking-widest">{rootPages.length} Pages</span>
            </div>

            {rootPages.length === 0 ? (
              <div className="p-6 bg-white dark:bg-[#151518] border border-slate-200/50 dark:border-white/5 rounded-3xl text-center space-y-3 shadow-sm">
                <p className="text-xs text-slate-400 dark:text-slate-500">Your workspace is currently a blank canvas.</p>
                <p className="text-xs text-slate-400 dark:text-slate-500">Create a page in the sidebar to fill this space.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {rootPages.map((page) => {
                  const pastel = getPastelColor(page.id);
                  const isDb = page.isDatabase;
                  const itemCreatedDate = new Date(page.updatedAt || page.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric'
                  });

                  return (
                    <motion.div
                      key={page.id}
                      whileHover={{ y: -3, scale: 1.01 }}
                      transition={{ duration: 0.15 }}
                      onClick={() => onSelectPage(page.id)}
                      className="group bg-white dark:bg-[#151518] border border-slate-200/50 dark:border-white/5 rounded-2xl overflow-hidden cursor-pointer shadow-sm hover:shadow-md hover:border-pink-500/20 transition-all flex flex-col justify-between"
                    >
                      {/* Decorative Pastel Header */}
                      <div className={`h-2.5 w-full ${pastel.bg.split(' ')[0]}`} />

                      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                        <div className="flex items-start gap-3">
                          <span className="text-2xl p-2 bg-slate-50 dark:bg-white/[0.03] border border-slate-200/40 dark:border-white/5 rounded-xl group-hover:scale-110 transition-transform select-none shrink-0">
                            {page.icon || '📝'}
                          </span>
                          <div className="min-w-0">
                            <h3 className="font-semibold text-slate-800 dark:text-white text-sm group-hover:text-pink-500 transition-colors truncate">
                              {page.title || 'Untitled Page'}
                            </h3>
                            <div className="flex items-center gap-1.5 mt-1 text-[10px] text-slate-400 dark:text-slate-500">
                              {isDb ? <Database size={10} className="text-purple-500" /> : <FileText size={10} className="text-pink-500" />}
                              <span className="font-medium">{isDb ? 'Database Hub' : 'Wiki Document'}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-white/[0.03] text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                          <span className="font-mono">Updated {itemCreatedDate}</span>
                          <span className="text-pink-500 dark:text-pink-400 group-hover:translate-x-1 transition-transform">→</span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {/* B. DETAILED MINDFUL CALENDAR */}
          <div className="space-y-3.5" id="home-calendar-section">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <CalendarIcon size={18} className="text-pink-500" />
                <h2 className="font-display font-bold text-lg text-slate-900 dark:text-white">Events & Deadlines</h2>
              </div>
              <span className="text-xs text-slate-400 dark:text-slate-500 font-semibold uppercase font-mono tracking-widest">Interactive Schedule</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 bg-white dark:bg-[#151518] border border-slate-200/50 dark:border-white/5 rounded-3xl overflow-hidden shadow-sm">
              
              {/* CALENDAR MONTH GRID (md:col-span-7) */}
              <div className="md:col-span-7 p-5 sm:p-6 border-b md:border-b-0 md:border-r border-slate-100 dark:border-white/[0.04] space-y-4">
                
                {/* Month navigation */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-white/[0.03]">
                  <h3 className="font-display font-bold text-base text-slate-800 dark:text-white flex items-center gap-2 select-none">
                    <span>{currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                  </h3>
                  <div className="flex items-center gap-1.5">
                    <button 
                      onClick={handlePrevMonth}
                      className="p-1.5 hover:bg-slate-50 dark:hover:bg-white/5 rounded-lg border border-slate-200/50 dark:border-white/5 transition-colors cursor-pointer"
                    >
                      <ChevronLeft size={14} />
                    </button>
                    <button 
                      onClick={handleNextMonth}
                      className="p-1.5 hover:bg-slate-50 dark:hover:bg-white/5 rounded-lg border border-slate-200/50 dark:border-white/5 transition-colors cursor-pointer"
                    >
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>

                {/* Weekdays Labels */}
                <div className="grid grid-cols-7 gap-1 text-center">
                  {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d, i) => (
                    <span key={i} className="text-[10px] font-bold font-mono text-slate-400 dark:text-slate-500 uppercase tracking-widest">{d}</span>
                  ))}
                </div>

                {/* Days Grid */}
                <div className="grid grid-cols-7 gap-1.5">
                  {/* Empty spacers for offset start */}
                  {Array.from({ length: firstDayIndex }).map((_, idx) => (
                    <div key={`spacer-${idx}`} className="aspect-square" />
                  ))}

                  {/* Month Days */}
                  {Array.from({ length: daysInMonth }).map((_, idx) => {
                    const day = idx + 1;
                    const dateObj = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
                    const today = isToday(day);
                    const selected = isSelected(day);
                    
                    const { count, types } = getDayEventsCount(day);

                    return (
                      <button
                        key={`day-${day}`}
                        onClick={() => setSelectedDate(dateObj)}
                        className={`aspect-square relative flex flex-col items-center justify-center text-xs rounded-xl transition-all border font-medium cursor-pointer ${
                          selected 
                            ? 'bg-gradient-to-tr from-pink-500 via-purple-500 to-indigo-500 text-white font-bold border-transparent shadow-md'
                            : today
                              ? 'bg-pink-500/10 text-pink-500 dark:text-pink-400 border-pink-500/20 font-bold'
                              : 'bg-transparent text-slate-700 dark:text-slate-400 border-transparent hover:bg-slate-100 dark:hover:bg-white/5'
                        }`}
                      >
                        <span>{day}</span>

                        {/* Event Dot Indicators */}
                        {count > 0 && (
                          <div className="absolute bottom-1.5 flex items-center gap-0.5 justify-center">
                            {types.slice(0, 3).map((type, tIdx) => {
                              const styles = getEventTypeStyles(type);
                              return (
                                <span 
                                  key={tIdx} 
                                  className={`w-1 h-1 rounded-full ${selected ? 'bg-white' : styles.dot}`} 
                                />
                              );
                            })}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* SELECTED DAY EVENTS DETAIL & ADD EVENT PANEL (md:col-span-5) */}
              <div className="md:col-span-5 p-5 sm:p-6 bg-slate-500/[0.01] dark:bg-white/[0.01] flex flex-col h-full justify-between space-y-4">
                
                {/* Header detail */}
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 font-mono font-bold uppercase">
                    <CalendarDays size={12} className="text-pink-500" />
                    <span>Focus Schedule</span>
                  </div>
                  <h4 className="font-bold text-slate-800 dark:text-white text-sm line-clamp-1">{formattedSelectedDate}</h4>
                </div>

                {/* Events list content */}
                <div className="flex-1 overflow-y-auto max-h-[160px] md:max-h-[220px] pr-1 space-y-2.5">
                  {selectedDateEvents.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-4">
                      <p className="text-xs text-slate-400 dark:text-slate-500 italic">No events or deadlines scheduled for this date.</p>
                    </div>
                  ) : (
                    <AnimatePresence initial={false}>
                      {selectedDateEvents.map((ev) => {
                        const styles = getEventTypeStyles(ev.type);
                        return (
                          <motion.div
                            key={ev.id}
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            className={`p-3 rounded-xl border ${styles.bg} relative group`}
                          >
                            <div className="flex justify-between items-start gap-2">
                              <div className="space-y-1 min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <Clock size={11} className="shrink-0 text-slate-400 dark:text-slate-500" />
                                  <span className="text-[10px] font-mono font-bold">{ev.time}</span>
                                  <span className="text-[9px] font-mono font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-md bg-white/40 dark:bg-black/30 border border-black/5 dark:border-white/5">{ev.type}</span>
                                </div>
                                <h5 className="font-semibold text-xs leading-snug">{ev.title}</h5>
                                {ev.description && (
                                  <p className="text-[10px] opacity-80 leading-relaxed font-sans">{ev.description}</p>
                                )}
                              </div>

                              <button
                                onClick={() => handleDeleteEvent(ev.id)}
                                className="p-1 hover:bg-rose-500/10 hover:text-rose-500 text-slate-400/60 hover:text-slate-800 rounded opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shrink-0"
                                title="Delete event"
                              >
                                <Trash2 size={11} />
                              </button>
                            </div>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  )}
                </div>

                {/* Inline form or add trigger */}
                <div className="pt-2 border-t border-slate-100 dark:border-white/[0.03]">
                  {showEventForm ? (
                    <motion.form 
                      onSubmit={handleAddEvent}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-2"
                    >
                      <input
                        type="text"
                        required
                        placeholder="Event or Deadline title..."
                        value={newEventTitle}
                        onChange={(e) => setNewEventTitle(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white dark:bg-[#151518] border border-slate-200 dark:border-white/5 rounded-lg text-xs text-slate-800 dark:text-slate-100 outline-none focus:border-pink-500/40"
                      />

                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="time"
                          value={newEventTime}
                          onChange={(e) => setNewEventTime(e.target.value)}
                          className="px-2.5 py-1.5 bg-white dark:bg-[#151518] border border-slate-200 dark:border-white/5 rounded-lg text-xs text-slate-800 dark:text-slate-100 outline-none"
                        />
                        <select
                          value={newEventType}
                          onChange={(e) => setNewEventType(e.target.value as any)}
                          className="px-2 py-1.5 bg-white dark:bg-[#151518] border border-slate-200 dark:border-white/5 rounded-lg text-xs text-slate-700 dark:text-slate-300 outline-none"
                        >
                          <option value="event">🌸 Event</option>
                          <option value="deadline">🚨 Deadline</option>
                          <option value="meeting">💬 Meeting</option>
                          <option value="mindfulness">🧘 Mindfulness</option>
                        </select>
                      </div>

                      <input
                        type="text"
                        placeholder="Short description (optional)..."
                        value={newEventDesc}
                        onChange={(e) => setNewEventDesc(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white dark:bg-[#151518] border border-slate-200 dark:border-white/5 rounded-lg text-[10px] text-slate-800 dark:text-slate-100 outline-none focus:border-pink-500/40"
                      />

                      <div className="flex gap-1.5">
                        <button
                          type="submit"
                          className="flex-1 py-1 px-2.5 bg-gradient-to-r from-pink-500 to-purple-500 hover:opacity-95 text-white font-bold text-xs rounded-lg transition-all cursor-pointer"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowEventForm(false)}
                          className="py-1 px-2.5 bg-slate-100 dark:bg-white/5 text-slate-500 hover:text-slate-300 text-xs font-semibold rounded-lg transition-all cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </motion.form>
                  ) : (
                    <button
                      onClick={() => setShowEventForm(true)}
                      className="w-full flex items-center justify-center gap-1.5 py-2 border border-dashed border-slate-200 dark:border-white/10 hover:border-pink-500/30 hover:bg-slate-100 dark:hover:bg-white/[0.02] rounded-xl text-xs font-semibold text-slate-500 dark:text-slate-400 transition-all cursor-pointer"
                    >
                      <Plus size={12} className="text-pink-500 animate-pulse" />
                      <span>Add Event / Deadline</span>
                    </button>
                  )}
                </div>

              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Interactive To-Do List & Mindfulness widget (lg:span-4) */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* C. INTUITIVE CHECKLIST TO-DO LIST */}
          <div className="space-y-3.5 bg-white dark:bg-[#151518] border border-slate-200/50 dark:border-white/5 rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col h-full" id="home-todos-section">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/[0.04]">
              <div className="flex items-center gap-2">
                <ListTodo size={18} className="text-pink-500" />
                <h2 className="font-display font-bold text-base text-slate-900 dark:text-white">Zen Checklist</h2>
              </div>
              <span className="text-[10px] font-mono font-bold bg-pink-500/10 text-pink-500 px-2 py-0.5 rounded-full uppercase">To-Do</span>
            </div>

            {/* Todo Progress bar */}
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between items-center text-[10px] font-semibold text-slate-400 dark:text-slate-500 font-mono">
                <span>COMPLETION RATE</span>
                <span>{todoStats.percentage}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 rounded-full"
                  animate={{ width: `${todoStats.percentage}%` }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                />
              </div>
            </div>

            {/* Filter buttons */}
            <div className="flex gap-1 bg-slate-50 dark:bg-white/[0.02] border border-slate-200/40 dark:border-white/5 p-1 rounded-xl">
              {(['all', 'pending', 'completed'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setTodoFilter(filter)}
                  className={`flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                    todoFilter === filter 
                      ? 'bg-white dark:bg-[#1E1E1E] text-pink-500 dark:text-pink-400 shadow-sm font-extrabold' 
                      : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>

            {/* Form to Add Todo */}
            <form onSubmit={handleAddTodo} className="space-y-2">
              <input
                type="text"
                required
                placeholder="What is your next focus task?"
                value={newTodoText}
                onChange={(e) => setNewTodoText(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#121214] border border-slate-200 dark:border-white/5 rounded-xl text-xs text-slate-800 dark:text-slate-100 outline-none focus:border-pink-500/40"
              />
              
              <div className="grid grid-cols-2 gap-2">
                {/* Priority Selector */}
                <select
                  value={newTodoPriority}
                  onChange={(e) => setNewTodoPriority(e.target.value as any)}
                  className="px-2 py-1.5 bg-slate-50 dark:bg-[#121214] border border-slate-200 dark:border-white/5 rounded-lg text-xs text-slate-600 dark:text-slate-400 outline-none cursor-pointer"
                >
                  <option value="low">🟡 Low Priority</option>
                  <option value="medium">🟠 Med Priority</option>
                  <option value="high">🔴 High Priority</option>
                </select>

                {/* Tag Input */}
                <input
                  type="text"
                  placeholder="Tag (e.g. Work)"
                  value={newTodoTag}
                  onChange={(e) => setNewTodoTag(e.target.value)}
                  className="px-2.5 py-1.5 bg-slate-50 dark:bg-[#121214] border border-slate-200 dark:border-white/5 rounded-lg text-xs text-slate-800 dark:text-slate-100 outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-1.5 py-2 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:opacity-95 text-white font-bold text-xs rounded-xl transition-all shadow-md cursor-pointer"
              >
                <Plus size={13} />
                <span>Add Task</span>
              </button>
            </form>

            {/* Todo List Items Scrollbox */}
            <div className="flex-1 overflow-y-auto max-h-[280px] pr-1 space-y-2 mt-2">
              {filteredTodos.length === 0 ? (
                <div className="h-28 flex flex-col items-center justify-center text-center">
                  <p className="text-xs text-slate-400 dark:text-slate-500 italic">No tasks found matching filter.</p>
                </div>
              ) : (
                <AnimatePresence initial={false}>
                  {filteredTodos.map((todo) => {
                    const priorityStyle = getPriorityBadge(todo.priority);
                    return (
                      <motion.div
                        key={todo.id}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className={`flex items-center justify-between p-3 bg-slate-50 dark:bg-[#121214] border border-slate-200/50 dark:border-white/[0.02] rounded-xl hover:border-slate-300 dark:hover:border-white/5 group transition-all`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          {/* Checkbox trigger */}
                          <button
                            type="button"
                            onClick={() => handleToggleTodo(todo.id)}
                            className={`w-4 h-4 rounded border flex items-center justify-center cursor-pointer shrink-0 transition-all ${
                              todo.completed
                                ? 'bg-emerald-500 border-transparent text-white'
                                : 'border-slate-300 dark:border-slate-600 hover:border-pink-500'
                            }`}
                          >
                            {todo.completed && <Check size={11} strokeWidth={3} />}
                          </button>

                          <div className="min-w-0">
                            <p className={`text-xs font-medium text-slate-800 dark:text-slate-200 leading-snug truncate ${todo.completed ? 'line-through text-slate-400 dark:text-slate-500 font-normal' : ''}`}>
                              {todo.text}
                            </p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className={`text-[8px] font-bold font-mono px-1 py-0.5 rounded border ${priorityStyle}`}>
                                {todo.priority}
                              </span>
                              {todo.tag && (
                                <span className="text-[8px] font-mono text-slate-400 dark:text-slate-500">
                                  #{todo.tag}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Delete Todo */}
                        <button
                          onClick={() => handleDeleteTodo(todo.id)}
                          className="p-1.5 hover:bg-rose-500/10 hover:text-rose-500 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg cursor-pointer"
                          title="Delete task"
                        >
                          <Trash size={12} />
                        </button>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              )}
            </div>
          </div>

          {/* D. MINDFUL SELF-REFLECTION / BREATH WIDGET */}
          <div className="p-5 sm:p-6 bg-gradient-to-b from-indigo-500/5 to-purple-500/5 dark:from-indigo-500/10 dark:to-purple-500/10 border border-slate-200/50 dark:border-white/5 rounded-3xl space-y-4 shadow-sm relative overflow-hidden text-center" id="home-breathing-card">
            <div className="absolute inset-0 bg-radial-gradient from-purple-500/[0.04] to-transparent pointer-events-none" />
            <div className="space-y-1">
              <span className="text-lg">🧘</span>
              <h3 className="font-display font-bold text-sm text-slate-900 dark:text-white">Mindful Breathing Circle</h3>
              <p className="text-[10px] text-slate-400 dark:text-slate-500">Take a 30-second breath break to calm the mind.</p>
            </div>

            {/* Custom animated pulse circle */}
            <div className="flex justify-center py-2">
              <motion.div 
                className="w-16 h-16 rounded-full bg-gradient-to-r from-pink-400 to-indigo-400 dark:from-pink-500 dark:to-indigo-500 flex items-center justify-center text-[10px] text-white font-mono font-bold tracking-wider shadow-lg shadow-indigo-500/10 relative"
                animate={{ scale: [1, 1.4, 1] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              >
                {/* Breath helper */}
                <motion.span
                  animate={{ opacity: [1, 0.4, 1] }}
                  transition={{ duration: 6, repeat: Infinity }}
                >
                  BREATHE
                </motion.span>
              </motion.div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
