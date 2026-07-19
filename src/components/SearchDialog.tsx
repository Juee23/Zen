import React, { useEffect, useRef, useState } from 'react';
import { Page } from '../types';
import { Search, FileText, CornerDownLeft, Sparkles, X, Database } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SearchDialogProps {
  isOpen: boolean;
  onClose: () => void;
  pages: Page[];
  recentPageIds: string[];
  onSelectPage: (id: string) => void;
}

export default function SearchDialog({
  isOpen,
  onClose,
  pages,
  recentPageIds,
  onSelectPage
}: SearchDialogProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Listen to escape key & Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Filter pages
  const filteredPages = query.trim() === ''
    ? []
    : pages.filter(page => 
        page.title.toLowerCase().includes(query.toLowerCase())
      );

  // Get recent pages list
  const recentPages = pages.filter(page => 
    recentPageIds.includes(page.id)
  ).slice(0, 5);

  const displayList = query.trim() === '' ? recentPages : filteredPages;

  // Handle arrow key navigation & Enter
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % Math.max(displayList.length, 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + displayList.length) % Math.max(displayList.length, 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (displayList[selectedIndex]) {
        onSelectPage(displayList[selectedIndex].id);
        onClose();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 md:p-20 flex items-start justify-center">
      {/* Overlay Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 backdrop-blur-[4px] transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: -20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -20 }}
        transition={{ type: 'spring', duration: 0.3 }}
        className="relative mx-auto w-full max-w-xl transform rounded-2xl border border-slate-200 dark:border-white/5 bg-white dark:bg-[#181818] shadow-2xl transition-all"
        onKeyDown={handleKeyDown}
        id="search-dialog-modal"
      >
        {/* Search header */}
        <div className="flex items-center px-4 py-3 border-b border-slate-100 dark:border-white/5">
          <Search className="h-5 w-5 text-slate-400 mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Type a page title to search..."
            className="h-9 w-full bg-transparent text-sm text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:ring-0 border-0"
            id="search-input-field"
          />
          <button 
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X size={15} />
          </button>
        </div>

        {/* Content list */}
        <div className="max-h-80 overflow-y-auto p-2">
          {query.trim() === '' ? (
            // Recents View
            <div className="space-y-1">
              <div className="px-3 py-1.5 text-[10.5px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Sparkles size={11} className="text-purple-400" />
                <span>Recent Pages</span>
              </div>
              {recentPages.map((page, index) => {
                const isSelected = index === selectedIndex;
                return (
                  <div
                    key={`recent-${page.id}`}
                    onClick={() => {
                      onSelectPage(page.id);
                      onClose();
                    }}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl cursor-pointer transition-all ${
                      isSelected 
                        ? 'bg-pink-500/10 text-pink-600 dark:bg-white/5 dark:text-slate-200 font-medium' 
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-base shrink-0">{page.icon || '📝'}</span>
                      <span className="text-sm truncate">{page.title || 'Untitled'}</span>
                      {page.isDatabase && (
                        <Database size={11} className="text-purple-400 shrink-0 ml-1" />
                      )}
                    </div>
                    {isSelected && (
                      <span className="flex items-center gap-1 text-[10px] text-pink-500/80 font-mono">
                        <span>Select</span>
                        <CornerDownLeft size={10} />
                      </span>
                    )}
                  </div>
                );
              })}
              {recentPages.length === 0 && (
                <div className="text-center py-6 text-xs text-slate-400">
                  No recently visited pages. Start browsing!
                </div>
              )}
            </div>
          ) : (
            // Search Results
            <div className="space-y-1">
              <div className="px-3 py-1.5 text-[10.5px] font-bold text-slate-400 uppercase tracking-wider">
                Matching Results ({filteredPages.length})
              </div>
              {filteredPages.map((page, index) => {
                const isSelected = index === selectedIndex;
                return (
                  <div
                    key={`search-res-${page.id}`}
                    onClick={() => {
                      onSelectPage(page.id);
                      onClose();
                    }}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl cursor-pointer transition-all ${
                      isSelected 
                        ? 'bg-pink-500/10 text-pink-600 dark:bg-white/5 dark:text-slate-200 font-medium' 
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-base shrink-0">{page.icon || '📝'}</span>
                      <span className="text-sm truncate">{page.title || 'Untitled'}</span>
                      {page.isDatabase && (
                        <Database size={11} className="text-purple-400 shrink-0 ml-1" />
                      )}
                    </div>
                    {isSelected && (
                      <span className="flex items-center gap-1 text-[10px] text-pink-500/80 font-mono">
                        <span>Select</span>
                        <CornerDownLeft size={10} />
                      </span>
                    )}
                  </div>
                );
              })}
              {filteredPages.length === 0 && (
                <div className="text-center py-8 text-sm text-slate-400">
                  No pages match "{query}"
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="flex items-center justify-between px-4 py-2 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 rounded-b-2xl font-mono select-none">
          <div className="flex gap-3">
            <span><kbd className="bg-white dark:bg-slate-950 px-1 py-0.5 rounded border border-slate-200 dark:border-slate-800">↑↓</kbd> Navigate</span>
            <span><kbd className="bg-white dark:bg-slate-950 px-1 py-0.5 rounded border border-slate-200 dark:border-slate-800">Enter</kbd> Select</span>
          </div>
          <span><kbd className="bg-white dark:bg-slate-950 px-1 py-0.5 rounded border border-slate-200 dark:border-slate-800">Esc</kbd> Close</span>
        </div>
      </motion.div>
    </div>
  );
}
