import React, { useState } from 'react';
import { Page } from '../types';
import { 
  Search, Plus, ChevronRight, ChevronDown, Star, Trash, 
  Database, FileText, Share2, Users, Sun, Moon, Sparkles, Menu, X, Check, Copy, Download,
  Clock, Settings, Home
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PAGE_EMOJIS } from '../utils';

interface SidebarProps {
  pages: Page[];
  activePageId: string | null;
  onSelectPage: (id: string) => void;
  onCreatePage: (parentId: string | null, isDatabase?: boolean) => void;
  onDeletePage: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onChangePageIcon: (id: string, icon: string) => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenSearch: () => void;
  userProfile?: { name: string; email: string; goal: string } | null;
  onLogout?: () => void;
  activeView?: string;
  onSelectView?: (view: 'workspace' | 'focus-study' | 'home') => void;
  onEditProfile?: () => void;
  
  // Collapsible states
  isSidebarOpen?: boolean;
  onToggleSidebar?: () => void;
  isOpenMobile?: boolean;
  onToggleMobile?: (open: boolean) => void;
}

export default function Sidebar({
  pages,
  activePageId,
  onSelectPage,
  onCreatePage,
  onDeletePage,
  onToggleFavorite,
  onChangePageIcon,
  darkMode,
  onToggleDarkMode,
  onOpenSearch,
  userProfile,
  onLogout,
  activeView = 'workspace',
  onSelectView,
  onEditProfile,
  isSidebarOpen = true,
  onToggleSidebar,
  isOpenMobile = false,
  onToggleMobile
}: SidebarProps) {
  // Navigation states
  const [expandedPages, setExpandedPages] = useState<Record<string, boolean>>({
    'welcome-page': true,
    'personal-space': true,
    'project-roadmap': true
  });
  
  // Emoji selector state
  const [activeEmojiPicker, setActiveEmojiPicker] = useState<string | null>(null);

  // Sharing Modal State
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);

  // Custom Inline Delete Confirmation ID
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedPages(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Build hierarchical structure
  const rootPages = pages.filter(p => p.parentId === null);
  const favorites = pages.filter(p => p.isFavorite);

  // Recursive render for nested pages
  const renderPageItem = (page: Page, depth: number = 0) => {
    const children = pages.filter(p => p.parentId === page.id);
    const hasChildren = children.length > 0;
    const isExpanded = !!expandedPages[page.id];
    const isActive = activePageId === page.id;

    return (
      <div key={page.id} className="relative group">
        <div 
          onClick={() => {
            onSelectPage(page.id);
            onToggleMobile?.(false);
          }}
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
          className={`flex items-center justify-between py-1.5 px-3 rounded-lg cursor-pointer text-sm transition-all duration-200 ${
            isActive 
              ? 'bg-pink-500/10 text-pink-600 dark:bg-white/5 dark:text-slate-200 font-medium' 
              : 'hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-slate-400 hover:text-slate-200'
          }`}
          id={`sidebar-page-${page.id}`}
        >
          <div className="flex items-center gap-2 min-w-0 flex-1">
            {/* Collapse toggle */}
            <button 
              onClick={(e) => toggleExpand(page.id, e)}
              className={`p-0.5 rounded hover:bg-slate-200 dark:hover:bg-white/5 transition-colors ${
                hasChildren ? 'opacity-100' : 'opacity-20 hover:opacity-50 pointer-events-none'
              }`}
            >
              {isExpanded ? (
                <ChevronDown size={14} className="text-slate-500" />
              ) : (
                <ChevronRight size={14} className="text-slate-500" />
              )}
            </button>

            {/* Emoji Trigger */}
            <div className="relative">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveEmojiPicker(activeEmojiPicker === page.id ? null : page.id);
                }}
                className="hover:scale-125 transition-transform duration-150 focus:outline-none"
              >
                {page.icon || '📝'}
              </button>

              {activeEmojiPicker === page.id && (
                <div 
                  className="absolute left-0 mt-2 z-50 p-2 bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-white/5 rounded-xl shadow-2xl grid grid-cols-5 gap-1.5 w-44"
                  onClick={e => e.stopPropagation()}
                >
                  {PAGE_EMOJIS.map(emoji => (
                    <button
                      key={emoji}
                      onClick={() => {
                        onChangePageIcon(page.id, emoji);
                        setActiveEmojiPicker(null);
                      }}
                      className="p-1 hover:bg-slate-100 dark:hover:bg-white/5 rounded transition-colors text-lg"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Title */}
            <span className="truncate flex-1 text-[13.5px]">
              {page.title || 'Untitled'}
            </span>
          </div>

          {/* Quick Actions (shown on hover) */}
          <div className={`${deleteConfirmId === page.id ? 'flex' : 'hidden group-hover:flex'} items-center gap-1.5 ml-2`}>
            {deleteConfirmId === page.id ? (
              <div className="flex items-center gap-1 bg-rose-500/10 dark:bg-rose-500/20 border border-rose-500/20 px-1 py-0.5 rounded-lg text-xs">
                <button
                  title="Confirm Delete Page & Nested Pages"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeletePage(page.id);
                    setDeleteConfirmId(null);
                  }}
                  className="p-0.5 text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 rounded hover:bg-rose-500/10 transition-colors cursor-pointer"
                >
                  <Check size={12} />
                </button>
                <button
                  title="Cancel Deletion"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteConfirmId(null);
                  }}
                  className="p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded hover:bg-slate-200 dark:hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <X size={12} />
                </button>
              </div>
            ) : (
              <>
                <button 
                  title="Add a nested page"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCreatePage(page.id);
                    setExpandedPages(prev => ({ ...prev, [page.id]: true }));
                  }}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded hover:bg-slate-200 dark:hover:bg-white/5 transition-all"
                >
                  <Plus size={13} />
                </button>
                <button 
                  title={page.isFavorite ? "Remove from Favorites" : "Add to Favorites"}
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(page.id);
                  }}
                  className={`p-1 rounded hover:bg-slate-200 dark:hover:bg-white/5 transition-all ${
                    page.isFavorite ? 'text-amber-400' : 'text-slate-400 hover:text-amber-400'
                  }`}
                >
                  <Star size={13} fill={page.isFavorite ? "currentColor" : "none"} />
                </button>
                <button 
                  title="Delete Page"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteConfirmId(page.id);
                  }}
                  className="p-1 text-slate-400 hover:text-rose-500 rounded hover:bg-slate-200 dark:hover:bg-white/5 transition-all"
                >
                  <Trash size={13} />
                </button>
              </>
            )}
          </div>

          {/* Database Indicator */}
          {!isActive && page.isDatabase && (
            <Database size={12} className="text-purple-400/80 ml-2 group-hover:hidden" />
          )}
        </div>

        {/* Render child pages nested */}
        <AnimatePresence initial={false}>
          {isExpanded && hasChildren && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              {children.map(child => renderPageItem(child, depth + 1))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  const sidebarContent = (
    <div className="h-full flex flex-col justify-between p-4 text-slate-800 dark:text-slate-100">
      <div className="space-y-6">
        {/* Workspace Brand Header */}
        <div className="flex items-center justify-between p-1.5 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5 shadow-sm">
          <div className="flex items-center gap-2.5 min-w-0 pl-1">
            <div className="w-8 h-8 bg-gradient-to-tr from-pink-400 via-purple-400 to-indigo-400 rounded-xl flex items-center justify-center text-white font-bold text-xs shadow-sm select-none shrink-0">
              {userProfile?.name ? userProfile.name.charAt(0).toUpperCase() : 'Z'}
            </div>
            <div className="min-w-0 flex-1">
              <span className="block text-xs font-bold text-slate-800 dark:text-slate-200 truncate leading-tight">
                {userProfile?.name || 'Zen'}
              </span>
              <span className="block text-[10px] font-mono text-slate-400 dark:text-slate-500 truncate mt-0.5">
                {userProfile?.goal || 'Personal Space'}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-0.5">
            {onToggleSidebar && (
              <button 
                onClick={onToggleSidebar}
                className="hidden lg:block p-1.5 hover:bg-slate-200 dark:hover:bg-white/5 rounded-lg text-slate-400 hover:text-pink-500 dark:text-slate-400 dark:hover:text-pink-200 transition-all cursor-pointer"
                title="Collapse Sidebar"
                id="workspace-collapse-btn"
              >
                <Menu size={13} />
              </button>
            )}
            {onEditProfile && (
              <button 
                onClick={onEditProfile}
                className="p-1.5 hover:bg-slate-200 dark:hover:bg-white/5 rounded-lg text-slate-400 hover:text-pink-500 dark:text-slate-400 dark:hover:text-slate-200 transition-all cursor-pointer"
                title="Edit Profile Sanctuary"
                id="workspace-edit-profile-btn"
              >
                <Settings size={13} />
              </button>
            )}
            <button 
              onClick={() => setShowShareModal(true)}
              className="p-1.5 hover:bg-slate-200 dark:hover:bg-white/5 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-all cursor-pointer"
              title="Workspace Share"
              id="workspace-share-btn"
            >
              <Share2 size={13} />
            </button>
            {onLogout && (
              <button 
                onClick={onLogout}
                className="p-1.5 hover:bg-slate-200 dark:hover:bg-white/5 rounded-lg text-slate-400 hover:text-red-400 transition-all cursor-pointer"
                title="Sign Out & Reset"
                id="workspace-logout-btn"
              >
                <X size={13} />
              </button>
            )}
          </div>
        </div>

        {/* Global Search trigger */}
        <button 
          onClick={onOpenSearch}
          className="w-full flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 rounded-xl text-slate-500 dark:text-slate-400 text-xs text-left hover:bg-slate-200/60 dark:hover:bg-white/5 transition-all shadow-sm cursor-pointer"
          id="global-search-trigger"
        >
          <Search size={14} />
          <span className="flex-1">Quick Search...</span>
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 bg-white dark:bg-[#181818] border border-slate-200 dark:border-white/5 text-[10px] rounded font-sans tracking-wide text-slate-400">Ctrl+K</kbd>
        </button>

        {/* Mindful Tools section */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 px-1 text-[11px] font-semibold text-slate-400 tracking-wider uppercase">
            <Clock size={11} className="text-pink-500" />
            <span>Mindful Tools</span>
          </div>
          <div className="space-y-1">
            <button
              onClick={() => {
                onSelectView?.('home');
                onToggleMobile?.(false);
              }}
              className={`w-full flex items-center gap-2 py-2 px-2.5 rounded-xl cursor-pointer text-sm transition-all duration-150 border ${
                activeView === 'home'
                  ? 'bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-indigo-500/10 text-pink-500 dark:text-pink-300 font-bold border-pink-500/20 shadow-sm'
                  : 'hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-slate-400 hover:text-slate-200 border-transparent'
              }`}
              id="sidebar-home-btn"
            >
              <span>🏡</span>
              <span className="flex-1 text-left text-[13px] font-medium">Home Sanctuary</span>
              <span className="text-[9px] font-mono font-bold text-pink-500 dark:text-pink-400 bg-pink-500/10 px-1.5 py-0.5 rounded-md">MAIN</span>
            </button>

            <button
              onClick={() => {
                onSelectView?.('focus-study');
                onToggleMobile?.(false);
              }}
              className={`w-full flex items-center gap-2 py-2 px-2.5 rounded-xl cursor-pointer text-sm transition-all duration-150 border ${
                activeView === 'focus-study'
                  ? 'bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-indigo-500/10 text-pink-500 dark:text-pink-300 font-bold border-pink-500/20 shadow-sm'
                  : 'hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-slate-400 hover:text-slate-200 border-transparent'
              }`}
              id="sidebar-focus-study-btn"
            >
              <span>⏱️</span>
              <span className="flex-1 text-left text-[13px] font-medium">Focus Study</span>
              <span className="text-[9px] font-mono font-bold text-pink-500 dark:text-pink-400 bg-pink-500/10 px-1.5 py-0.5 rounded-md">FLIP</span>
            </button>
          </div>
        </div>

        {/* Favorites section */}
        {favorites.length > 0 && (
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 px-1 text-[11px] font-semibold text-slate-400 tracking-wider uppercase">
              <Star size={11} className="text-amber-400" fill="currentColor" />
              <span>Favorites</span>
            </div>
            <div className="space-y-1">
              {favorites.map(page => (
                <div 
                  key={`fav-${page.id}`}
                  onClick={() => {
                    onSelectPage(page.id);
                    onToggleMobile?.(false);
                  }}
                  className={`flex items-center gap-2 py-1 px-2.5 rounded-lg cursor-pointer text-sm transition-all duration-150 ${
                    activePageId === page.id 
                      ? 'bg-pink-500/10 text-pink-600 dark:bg-white/5 dark:text-slate-200 font-medium' 
                      : 'hover:bg-slate-100 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span>{page.icon || '📝'}</span>
                  <span className="truncate flex-1 text-[13px]">{page.title || 'Untitled'}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Documents section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1 text-[11px] font-semibold text-slate-400 tracking-wider uppercase">
            <span>Workspace Pages</span>
            <div className="flex items-center gap-1">
              <button 
                title="Create standard document"
                onClick={() => onCreatePage(null, false)}
                className="p-1 hover:bg-slate-100 dark:hover:bg-white/5 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-all"
                id="add-document-btn"
              >
                <Plus size={12} />
              </button>
              <button 
                title="Create database view"
                onClick={() => onCreatePage(null, true)}
                className="p-1 hover:bg-slate-100 dark:hover:bg-white/5 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-all"
                id="add-database-btn"
              >
                <Database size={11} />
              </button>
            </div>
          </div>

          <div className="space-y-1 max-h-[50vh] overflow-y-auto pr-1">
            {rootPages.map(page => renderPageItem(page))}
            {rootPages.length === 0 && (
              <div className="text-center py-4 text-xs text-slate-400">
                No pages yet. Create one!
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sidebar Footer */}
      <div className="border-t border-slate-200/60 dark:border-white/5 pt-4 mt-4 space-y-3">
        {/* Workspace details placeholder */}
        <div className="flex items-center justify-between bg-slate-50 dark:bg-[#1E1E1E]/50 border border-slate-200/50 dark:border-white/5 rounded-xl p-2.5">
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex -space-x-1.5">
              <div className="w-5 h-5 rounded-full bg-pink-300 dark:bg-pink-700 border border-white dark:border-slate-900 flex items-center justify-center text-[8px] font-bold text-pink-900 dark:text-pink-100">JD</div>
              <div className="w-5 h-5 rounded-full bg-blue-300 dark:bg-blue-700 border border-white dark:border-slate-900 flex items-center justify-center text-[8px] font-bold text-blue-900 dark:text-blue-100">AI</div>
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate">2 active collaborators</span>
          </div>
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        </div>

        {/* Theme and controls */}
        <div className="flex items-center justify-between px-1 gap-2">
          <span className="text-xs font-mono text-slate-400">Zen Sanctuary v1.0.0</span>
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#181818] border border-slate-200 dark:border-white/5 rounded-2xl max-w-md w-full p-6 shadow-2xl relative text-[#E0E0E0]">
            <button 
              onClick={() => setShowShareModal(false)}
              className="absolute top-4 right-4 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-all"
            >
              <X size={16} />
            </button>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-purple-100 dark:bg-purple-950/40 text-purple-600 dark:text-purple-300 rounded-xl">
                  <Share2 size={20} />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-lg text-slate-900 dark:text-white">Share Workspace</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Invite collaborators to your Zen workspace</p>
                </div>
              </div>

              <div className="border-t border-slate-100 dark:border-white/5 my-2" />

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Workspace Members</label>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-[#1E1E1E]">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-pink-200 dark:bg-pink-900/60 flex items-center justify-center text-xs font-bold text-pink-700 dark:text-pink-300">JD</div>
                      <div>
                        <span className="text-xs font-medium block">You (Owner)</span>
                        <span className="text-[10px] text-slate-400">juivdesai@gmail.com</span>
                      </div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-pink-100 dark:bg-pink-950/40 text-pink-600 dark:text-pink-300 font-medium border border-pink-200 dark:border-pink-900/30">Admin</span>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-[#1E1E1E]">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-indigo-200 dark:bg-indigo-900/60 flex items-center justify-center text-xs font-bold text-indigo-700 dark:text-indigo-300">AI</div>
                      <div>
                        <span className="text-xs font-medium block">Zen Helper</span>
                        <span className="text-[10px] text-slate-400">active now</span>
                      </div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-300 font-medium border border-indigo-200 dark:border-indigo-900/30">Assistant</span>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 pt-2">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Invite Link</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    readOnly 
                    value={window.location.href}
                    className="flex-1 bg-slate-100 dark:bg-[#1E1E1E] border border-slate-200 dark:border-white/5 rounded-xl px-3 py-1.5 text-xs text-slate-500 outline-none select-all"
                  />
                  <button 
                    onClick={handleCopyLink}
                    className="px-3 py-1.5 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white font-medium text-xs rounded-xl hover:opacity-95 transition-all flex items-center gap-1 shrink-0"
                  >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (hidden on mobile, visible on lg) */}
      <aside 
        className={`hidden lg:block bg-[#18181C] border-r border-slate-200/40 dark:border-white/5 h-screen overflow-y-auto shrink-0 select-none transition-all duration-300 ${
          isSidebarOpen ? 'w-72' : 'w-0 border-r-0'
        }`}
      >
        <div className={`transition-opacity duration-200 w-72 h-full ${isSidebarOpen ? 'opacity-100' : 'opacity-0'}`}>
          {sidebarContent}
        </div>
      </aside>

      {/* Mobile Sidebar overlay */}
      <AnimatePresence>
        {isOpenMobile && (
          <div className="fixed inset-0 z-50 lg:hidden">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => onToggleMobile?.(false)}
              className="absolute inset-0 bg-black"
            />
            
            {/* Sliding Sidebar */}
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute top-0 left-0 bottom-0 w-80 bg-[#18181C] dark:bg-[#18181C] shadow-2xl overflow-y-auto z-50 border-r border-slate-200 dark:border-white/5"
            >
              <div className="absolute top-4 right-4 z-50">
                <button
                  onClick={() => onToggleMobile?.(false)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X size={18} />
                </button>
              </div>
              {sidebarContent}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
