/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Page, Block } from './types';
import { getInitialPages, createId } from './initialData';
import Sidebar from './components/Sidebar';
import SearchDialog from './components/SearchDialog';
import Editor from './components/Editor';
import DatabaseView from './components/DatabaseView';
import Onboarding from './components/Onboarding';
import FocusStudy from './components/FocusStudy';
import HomeView from './components/HomeView';
import ZenCopilot from './components/ZenCopilot';
import { 
  ChevronRight, Star, ExternalLink, HelpCircle, Sparkles, BookOpen, Clock, 
  Settings, Users, Info, ArrowUpRight, Compass, CompassIcon, X, Check, Menu
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [pages, setPages] = useState<Page[]>([]);
  const [activePageId, setActivePageId] = useState<string | null>(null);
  const [recentPageIds, setRecentPageIds] = useState<string[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(true); // Default to gorgeous dark mode!
  const [showWelcomeGuide, setShowWelcomeGuide] = useState(false);
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);

  // Collapsible Sidebar States
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    const stored = localStorage.getItem('zen-sidebar-open');
    return stored !== null ? stored === 'true' : true;
  });
  const [isOpenMobile, setIsOpenMobile] = useState(false);

  useEffect(() => {
    localStorage.setItem('zen-sidebar-open', String(isSidebarOpen));
  }, [isSidebarOpen]);

  // User profile & onboarding flow states
  const [userProfile, setUserProfile] = useState<{ name: string; email: string; goal: string } | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Focus Study / Special Views State
  const [activeView, setActiveView] = useState<'workspace' | 'focus-study' | 'home'>('home');

  // Edit Profile Modal States
  const [showProfileEditModal, setShowProfileEditModal] = useState(false);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editGoal, setEditGoal] = useState('');

  // Sync edit profile values with active profile when opened
  useEffect(() => {
    if (showProfileEditModal && userProfile) {
      setEditName(userProfile.name);
      setEditEmail(userProfile.email);
      setEditGoal(userProfile.goal);
    }
  }, [showProfileEditModal, userProfile]);

  // Initialize and load from local storage
  useEffect(() => {
    const storedProfile = localStorage.getItem('zen-user-profile');
    const storedPages = localStorage.getItem('zen-pages');
    const storedDarkMode = localStorage.getItem('zen-dark-mode');
    const storedActivePage = localStorage.getItem('zen-active-page');
    const storedRecents = localStorage.getItem('zen-recents');

    let isProfileActive = false;
    if (storedProfile) {
      try {
        const parsedProfile = JSON.parse(storedProfile);
        setUserProfile(parsedProfile);
        isProfileActive = true;
      } catch (e) {
        setShowOnboarding(true);
      }
    } else {
      setShowOnboarding(true);
    }

    if (storedPages) {
      try {
        const parsed = JSON.parse(storedPages);
        setPages(parsed);
      } catch (e) {
        setPages(getInitialPages());
      }
    } else if (isProfileActive) {
      const profile = JSON.parse(storedProfile!);
      const initial = getInitialPages(profile.name, profile.goal);
      setPages(initial);
      localStorage.setItem('zen-pages', JSON.stringify(initial));
    }

    if (storedDarkMode !== null) {
      setDarkMode(storedDarkMode === 'true');
    }

    if (storedActivePage) {
      setActivePageId(storedActivePage);
    } else {
      setActivePageId('welcome-page');
    }

    if (storedRecents) {
      try {
        setRecentPageIds(JSON.parse(storedRecents));
      } catch (e) {}
    }
  }, []);

  // Sync state to local storage
  useEffect(() => {
    if (pages.length > 0) {
      localStorage.setItem('zen-pages', JSON.stringify(pages));
    }
  }, [pages]);

  useEffect(() => {
    localStorage.setItem('zen-dark-mode', String(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    if (activePageId) {
      localStorage.setItem('zen-active-page', activePageId);
      // Update recents
      setRecentPageIds(prev => {
        const filtered = prev.filter(id => id !== activePageId);
        const updated = [activePageId, ...filtered].slice(0, 10);
        localStorage.setItem('zen-recents', JSON.stringify(updated));
        return updated;
      });
    }
  }, [activePageId]);

  // Bind Ctrl+K for Search Dialogue
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // ACTIVE PAGE SELECTION
  const activePage = pages.find(p => p.id === activePageId);

  // TREE TRAVERSAL HELPERS
  const getBreadcrumbs = (pageId: string): Page[] => {
    const trail: Page[] = [];
    let current = pages.find(p => p.id === pageId);
    while (current) {
      trail.unshift(current);
      current = current.parentId ? pages.find(p => p.id === current!.parentId) : undefined;
    }
    return trail;
  };

  const getAllDescendantIds = (parentId: string): string[] => {
    const children = pages.filter(p => p.parentId === parentId);
    return children.reduce((acc, child) => {
      return [...acc, child.id, ...getAllDescendantIds(child.id)];
    }, [] as string[]);
  };

  // ACTIONS
  const handleOnboardingComplete = (profile: { name: string; email: string; goal: string }) => {
    setUserProfile(profile);
    localStorage.setItem('zen-user-profile', JSON.stringify(profile));
    
    // Generate custom pages based on their name and goal!
    const customPages = getInitialPages(profile.name, profile.goal);
    setPages(customPages);
    localStorage.setItem('zen-pages', JSON.stringify(customPages));
    setActivePageId('welcome-page');
    setShowOnboarding(false);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim() || !editEmail.trim() || !editGoal.trim()) return;
    
    const updated = {
      name: editName.trim(),
      email: editEmail.trim(),
      goal: editGoal.trim()
    };
    setUserProfile(updated);
    localStorage.setItem('zen-user-profile', JSON.stringify(updated));
    setShowProfileEditModal(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('zen-user-profile');
    localStorage.removeItem('zen-pages');
    localStorage.removeItem('zen-active-page');
    localStorage.removeItem('zen-recents');
    setUserProfile(null);
    setPages([]);
    setActivePageId(null);
    setRecentPageIds([]);
    setShowOnboarding(true);
  };

  const handleSelectPage = (id: string) => {
    setActiveView('workspace');
    setActivePageId(id);
  };

  const handleCreatePage = (parentId: string | null = null, isDatabase = false) => {
    const newPageId = createId();
    const newPage: Page = {
      id: newPageId,
      title: isDatabase ? 'New Database 📊' : 'Untitled Document',
      icon: isDatabase ? '📊' : '📝',
      parentId,
      isFavorite: false,
      isDatabase,
      blocks: isDatabase ? [] : [
        {
          id: createId(),
          type: 'h1',
          content: 'New Workspace Document'
        },
        {
          id: createId(),
          type: 'text',
          content: 'Start writing or press `/` to insert block elements.'
        }
      ],
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    if (isDatabase) {
      newPage.databaseConfig = {
        properties: [
          { id: 'prop-status', name: 'Status', type: 'status', options: ['Backlog', 'In Progress', 'In Review', 'Done'] },
          { id: 'prop-tags', name: 'Tags', type: 'multi-select', options: ['Idea', 'Research', 'In Review', 'Completed'] },
          { id: 'prop-due', name: 'Due Date', type: 'date' },
          { id: 'prop-notes', name: 'Notes', type: 'text' }
        ],
        activeView: 'board',
        filters: []
      };
    }

    setPages(prev => [...prev, newPage]);
    setActivePageId(newPageId);
    setActiveView('workspace');
  };

  const handleDeletePage = (id: string) => {
    const idsToDelete = [id, ...getAllDescendantIds(id)];
    setPages(prev => prev.filter(p => !idsToDelete.includes(p.id)));
    
    // Fallback to another root page or home if active was deleted
    if (activePageId && idsToDelete.includes(activePageId)) {
      const remainingRoot = pages.filter(p => !idsToDelete.includes(p.id) && p.parentId === null);
      if (remainingRoot.length > 0) {
        setActivePageId(remainingRoot[0].id);
      } else {
        setActivePageId(null);
      }
    }
  };

  const handleToggleFavorite = (id: string) => {
    setPages(prev => prev.map(p => 
      p.id === id ? { ...p, isFavorite: !p.isFavorite } : p
    ));
  };

  const handleChangePageIcon = (id: string, icon: string) => {
    setPages(prev => prev.map(p => 
      p.id === id ? { ...p, icon } : p
    ));
  };

  const handleChangePageTitle = (id: string, title: string) => {
    setPages(prev => prev.map(p => 
      p.id === id ? { ...p, title } : p
    ));
  };

  const handleUpdatePageBlocks = (id: string, blocks: Block[]) => {
    setPages(prev => prev.map(p => 
      p.id === id ? { ...p, blocks, updatedAt: Date.now() } : p
    ));
  };

  // DATABASE VIEW SPECIFIC CRUD
  const handleCreateDatabaseItem = (title: string, initialValues: Record<string, any> = {}) => {
    if (!activePageId) return;
    const itemPageId = createId();
    const itemPage: Page = {
      id: itemPageId,
      title,
      icon: '📝',
      parentId: activePageId,
      isFavorite: false,
      isDatabase: false,
      propertyValues: initialValues,
      blocks: [
        {
          id: createId(),
          type: 'h1',
          content: title
        },
        {
          id: createId(),
          type: 'text',
          content: 'Add details for this record item here.'
        }
      ],
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    setPages(prev => [...prev, itemPage]);
  };

  const handleUpdateDatabaseItemProperties = (itemId: string, propertyValues: Record<string, any>) => {
    setPages(prev => prev.map(p => 
      p.id === itemId ? { ...p, propertyValues, updatedAt: Date.now() } : p
    ));
  };

  // Fetch child pages for the active database
  const activeDatabaseItems = activePageId 
    ? pages.filter(p => p.parentId === activePageId && p.propertyValues !== undefined)
    : [];

  const breadcrumbs = activePageId ? getBreadcrumbs(activePageId) : [];

  if (showOnboarding) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className={`flex h-screen overflow-hidden ${darkMode ? 'dark bg-[#0F0F0F] text-[#E0E0E0]' : 'bg-[#fafbfe]'}`} id="zen-app-root">
      
      {/* Sidebar Navigation */}
      <Sidebar
        pages={pages}
        activePageId={activePageId}
        onSelectPage={handleSelectPage}
        onCreatePage={handleCreatePage}
        onDeletePage={handleDeletePage}
        onToggleFavorite={handleToggleFavorite}
        onChangePageIcon={handleChangePageIcon}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        onOpenSearch={() => setIsSearchOpen(true)}
        userProfile={userProfile}
        onLogout={handleLogout}
        activeView={activeView}
        onSelectView={(view) => {
          setActiveView(view);
          if (view !== 'workspace') {
            setActivePageId(null);
          }
        }}
        onEditProfile={() => setShowProfileEditModal(true)}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        isOpenMobile={isOpenMobile}
        onToggleMobile={setIsOpenMobile}
      />

      {/* Floating Hamburger toggle (shows on mobile, and on desktop if sidebar is collapsed) */}
      <div className={`fixed top-2.5 left-4 z-40 transition-all duration-300 ${isSidebarOpen ? 'lg:hidden' : 'block'}`}>
        <button
          onClick={() => {
            if (window.innerWidth < 1024) {
              setIsOpenMobile(true);
            } else {
              setIsSidebarOpen(true);
            }
          }}
          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200/50 dark:border-white/5 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 cursor-pointer shadow-sm"
          id="mobile-hamburger-btn"
          title="Open Sidebar"
        >
          <Menu size={15} />
        </button>
      </div>

      {/* Main Panel Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        
        {/* Top bar with Breadcrumbs, Favorite toggle, Collaborators & Actions */}
        <header className="h-12 border-b border-slate-200/50 dark:border-white/5 flex items-center justify-between px-6 shrink-0 bg-white/40 dark:bg-[#0F0F0F]/80 backdrop-blur-md z-30">
          
          {/* Breadcrumbs trail */}
          <div className={`flex items-center gap-1.5 min-w-0 flex-1 transition-all duration-300 ${isSidebarOpen ? 'pl-10 lg:pl-0' : 'pl-10'}`} id="breadcrumbs-trail">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Workspace</span>
            {activeView === 'home' ? (
              <>
                <ChevronRight size={12} className="text-slate-400" />
                <span className="text-xs font-semibold text-slate-800 dark:text-white flex items-center gap-1 select-none">
                  <span>🏡</span>
                  <span>Home Sanctuary</span>
                </span>
              </>
            ) : activeView === 'focus-study' ? (
              <>
                <ChevronRight size={12} className="text-slate-400" />
                <span className="text-xs font-semibold text-slate-800 dark:text-white flex items-center gap-1 select-none">
                  <span>⏱️</span>
                  <span>Focus Study</span>
                </span>
              </>
            ) : (
              breadcrumbs.map((crumb, idx) => (
                <React.Fragment key={crumb.id}>
                  <ChevronRight size={12} className="text-slate-400" />
                  <button
                    onClick={() => handleSelectPage(crumb.id)}
                    className={`flex items-center gap-1 text-xs font-medium truncate max-w-[120px] hover:text-pink-500 dark:hover:text-pink-300 transition-colors ${
                      idx === breadcrumbs.length - 1 
                        ? 'text-slate-800 dark:text-white font-semibold' 
                        : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    <span className="shrink-0">{crumb.icon || '📝'}</span>
                    <span className="truncate">{crumb.title || 'Untitled'}</span>
                  </button>
                </React.Fragment>
              ))
            )}
          </div>

          {/* Quick info toolbar actions */}
          <div className="flex items-center gap-3 shrink-0">
            {activePage && (
              <button
                onClick={() => handleToggleFavorite(activePage.id)}
                className={`p-2 rounded-xl border border-slate-200/50 dark:border-white/5 shadow-sm transition-all ${
                  activePage.isFavorite 
                    ? 'text-amber-400 bg-amber-500/5 hover:bg-amber-500/10' 
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5'
                }`}
                title={activePage.isFavorite ? "Remove favorite" : "Bookmark page"}
                id="header-star-btn"
              >
                <Star size={14} fill={activePage.isFavorite ? "currentColor" : "none"} />
              </button>
            )}

            <button
              onClick={() => setIsCopilotOpen(!isCopilotOpen)}
              className={`p-2 rounded-xl border border-slate-200/50 dark:border-white/5 shadow-sm transition-all flex items-center gap-1.5 cursor-pointer ${
                isCopilotOpen
                  ? 'text-pink-500 dark:text-pink-300 bg-pink-500/5 dark:bg-pink-500/10 border-pink-500/20'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5'
              }`}
              title="Zen Copilot"
              id="header-copilot-btn"
            >
              <Sparkles size={14} className={isCopilotOpen ? 'animate-pulse' : ''} />
              <span className="text-[11px] font-semibold tracking-wide hidden sm:inline">Zen Copilot</span>
            </button>

            <button
              onClick={() => setShowWelcomeGuide(!showWelcomeGuide)}
              className="p-2 rounded-xl border border-slate-200/50 dark:border-white/5 shadow-sm text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
              title="Zen Guide"
              id="header-guide-btn"
            >
              <HelpCircle size={14} />
            </button>
          </div>
        </header>

        {/* Scrollable Canvas content body */}
        <div className="flex-1 overflow-y-auto bg-gradient-to-b from-transparent to-slate-500/[0.01]">
          {activeView === 'home' ? (
            <HomeView pages={pages} onSelectPage={handleSelectPage} userProfile={userProfile} />
          ) : activeView === 'focus-study' ? (
            <FocusStudy />
          ) : activePage ? (
            <div className="h-full">
              {activePage.isDatabase ? (
                // DATABASE VIEW CONTAINER
                <div className="h-full flex flex-col">
                  {/* Database metadata header */}
                  <div className="pt-8 px-4 md:px-12 w-full max-w-7xl mx-auto shrink-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-4xl p-1 bg-slate-100 dark:bg-white/5 rounded-xl select-none">{activePage.icon || '📊'}</span>
                      <div>
                        <input
                          type="text"
                          value={activePage.title}
                          onChange={(e) => handleChangePageTitle(activePage.id, e.target.value)}
                          placeholder="Untitled Database"
                          className="font-display font-bold text-2xl md:text-3xl text-slate-900 dark:text-white bg-transparent border-none outline-none tracking-tight focus:ring-0 w-full"
                          id="database-title-header"
                        />
                        <p className="text-xs text-slate-400 mt-0.5 font-medium">DATABASES HUB</p>
                      </div>
                    </div>
                  </div>

                  {/* Render Table, Board, or List views */}
                  <div className="flex-1 mt-4">
                    <DatabaseView
                      databasePage={activePage}
                      childPages={activeDatabaseItems}
                      onCreateItem={handleCreateDatabaseItem}
                      onDeleteItem={handleDeletePage}
                      onUpdateItemProperties={handleUpdateDatabaseItemProperties}
                      onToggleFavorite={handleToggleFavorite}
                      onChangePageIcon={handleChangePageIcon}
                      onChangePageTitle={handleChangePageTitle}
                      onUpdatePageBlocks={handleUpdatePageBlocks}
                    />
                  </div>
                </div>
              ) : (
                // STANDARD PAGE EDITOR
                <Editor
                  page={activePage}
                  onChangePageTitle={handleChangePageTitle}
                  onChangePageIcon={handleChangePageIcon}
                  onUpdatePageBlocks={handleUpdatePageBlocks}
                />
              )}
            </div>
          ) : (
            // BLANK / WELCOME STATE
            <div className="h-full flex items-center justify-center p-8 text-center" id="empty-state-workspace">
              <div className="max-w-md space-y-6">
                <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-pink-400 via-purple-400 to-indigo-400 flex items-center justify-center mx-auto shadow-2xl shadow-purple-500/10">
                  <Sparkles size={28} className="text-white animate-pulse" />
                </div>
                
                <div className="space-y-2">
                  <h2 className="font-display font-bold text-2xl text-slate-800 dark:text-white">Create your sanctuary</h2>
                  <p className="text-sm text-slate-400/90 leading-relaxed">Zen is a minimalist home for your notes, wikis, task tracking, and databases. Add your first page to start reflecting.</p>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={() => handleCreatePage(null, false)}
                    className="flex flex-col items-center gap-2.5 p-4 rounded-2xl bg-white dark:bg-[#1E1E1E] border border-slate-200/50 dark:border-white/5 hover:border-pink-500/20 dark:hover:border-pink-400/20 hover:shadow-md cursor-pointer transition-all text-slate-700 dark:text-slate-300 group"
                  >
                    <BookOpen size={20} className="text-pink-400 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-semibold">Blank Document</span>
                  </button>

                  <button
                    onClick={() => handleCreatePage(null, true)}
                    className="flex flex-col items-center gap-2.5 p-4 rounded-2xl bg-white dark:bg-[#1E1E1E] border border-slate-200/50 dark:border-white/5 hover:border-purple-500/20 dark:hover:border-purple-400/20 hover:shadow-md cursor-pointer transition-all text-slate-700 dark:text-slate-300 group"
                  >
                    <Settings size={20} className="text-purple-400 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-semibold">Blank Database</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Global Search Dialogue (Ctrl+K) */}
      <AnimatePresence>
        {isSearchOpen && (
          <SearchDialog
            isOpen={isSearchOpen}
            onClose={() => setIsSearchOpen(false)}
            pages={pages}
            recentPageIds={recentPageIds}
            onSelectPage={handleSelectPage}
          />
        )}
      </AnimatePresence>

      {/* Zen Welcome Guide Dialog */}
      <AnimatePresence>
        {showWelcomeGuide && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-white/5 rounded-3xl p-6 shadow-2xl max-w-md w-full relative space-y-4 text-slate-700 dark:text-slate-300"
              id="guide-modal-popup"
            >
              <button
                onClick={() => setShowWelcomeGuide(false)}
                className="absolute top-4 right-4 p-1.5 hover:bg-slate-100 dark:hover:bg-white/5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
              >
                <X size={16} />
              </button>

              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-pink-100 dark:bg-pink-950/40 text-pink-500 rounded-xl">
                  <Info size={18} />
                </div>
                <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">Zen Quick Start Guide</h3>
              </div>

              <div className="space-y-3.5 text-xs leading-relaxed">
                <div className="space-y-1">
                  <p className="font-semibold text-slate-900 dark:text-white">🌸 Aesthetic design</p>
                  <p className="text-slate-500 dark:text-slate-400">Experience a carefully paired dark mode with soft pastel accents: pinks, blues, mints, and lavenders for tags and highlights.</p>
                </div>

                <div className="space-y-1">
                  <p className="font-semibold text-slate-900 dark:text-white">✍️ Block editing</p>
                  <p className="text-slate-500 dark:text-slate-400">Pressing `Enter` creates a text block. Type `/` at any point to invoke commands for headers, lists, code, quotes, and dividers.</p>
                </div>

                <div className="space-y-1">
                  <p className="font-semibold text-slate-900 dark:text-white">📊 Kanban & Tables</p>
                  <p className="text-slate-500 dark:text-slate-400">Create a Database to enjoy Table, Board, and List views. Clicking any row will slide open its nested page editor.</p>
                </div>

                <div className="space-y-1">
                  <p className="font-semibold text-slate-900 dark:text-white">⌨️ Keyboard shortcuts</p>
                  <ul className="list-disc list-inside text-slate-500 dark:text-slate-400 pl-1 space-y-0.5">
                    <li><kbd className="bg-slate-100 dark:bg-slate-800 px-1 rounded">Ctrl+K</kbd> to open Search dialog</li>
                    <li><kbd className="bg-slate-100 dark:bg-slate-800 px-1 rounded">Enter</kbd> to add blocks or select items</li>
                    <li><kbd className="bg-slate-100 dark:bg-slate-800 px-1 rounded">Backspace</kbd> on empty lines to delete</li>
                  </ul>
                </div>
              </div>

              <button
                onClick={() => setShowWelcomeGuide(false)}
                className="w-full py-2 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white font-semibold text-xs rounded-xl hover:opacity-95 shadow-md"
              >
                Embrace Zen
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {showProfileEditModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-white/5 rounded-3xl p-6 shadow-2xl max-w-md w-full relative space-y-4 text-slate-700 dark:text-slate-300"
              id="profile-edit-modal-popup"
            >
              <button
                onClick={() => setShowProfileEditModal(false)}
                className="absolute top-4 right-4 p-1.5 hover:bg-slate-100 dark:hover:bg-white/5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg cursor-pointer"
              >
                <X size={16} />
              </button>

              <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100 dark:border-white/[0.04]">
                <div className="p-2 bg-pink-100 dark:bg-pink-950/40 text-pink-500 rounded-xl">
                  <Settings size={18} />
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">Profile Sanctuary</h3>
                  <p className="text-[10px] text-slate-400 font-medium font-mono uppercase tracking-wider">Refine your identity</p>
                </div>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4 pt-1">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400">Sanctuary Name</label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#151518] border border-slate-200 dark:border-white/5 rounded-xl text-xs text-slate-800 dark:text-slate-100 outline-none focus:border-pink-500/50"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400">Email Address</label>
                  <input
                    type="email"
                    required
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#151518] border border-slate-200 dark:border-white/5 rounded-xl text-xs text-slate-800 dark:text-slate-100 outline-none focus:border-pink-500/50"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400">Focus Goal / Presets</label>
                  
                  {/* Grid of Preset Goals */}
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    {[
                      'Personal Sanctuary 🌸',
                      'Work & Projects 💼',
                      'Study Wiki 🎓',
                      'Creative Workspace 🎨'
                    ].map(preset => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setEditGoal(preset)}
                        className={`p-2.5 text-left text-xs rounded-xl border transition-all flex flex-col justify-between cursor-pointer ${
                          editGoal === preset 
                            ? 'bg-pink-500/5 border-pink-500/20 text-pink-500 font-semibold' 
                            : 'bg-slate-50 dark:bg-[#151518] border-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
                        }`}
                      >
                        <span>{preset.split(' ')[0]}</span>
                        <span className="text-[10px] mt-1">{preset.substring(preset.indexOf(' ') + 1)}</span>
                      </button>
                    ))}
                  </div>

                  <input
                    type="text"
                    required
                    value={editGoal}
                    onChange={(e) => setEditGoal(e.target.value)}
                    placeholder="Or type a custom goal..."
                    className="w-full mt-2 px-3.5 py-2.5 bg-slate-50 dark:bg-[#151518] border border-slate-200 dark:border-white/5 rounded-xl text-xs text-slate-800 dark:text-slate-100 outline-none focus:border-pink-500/50"
                  />
                </div>

                <div className="flex gap-2.5 pt-4 border-t border-slate-100 dark:border-white/[0.04]">
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white font-semibold text-xs rounded-xl hover:opacity-95 shadow-md cursor-pointer"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowProfileEditModal(false)}
                    className="flex-1 py-2.5 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:text-slate-200 font-semibold text-xs rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Zen Copilot AI Panel */}
      <ZenCopilot
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
        activePage={activePage || null}
        onUpdatePageBlocks={handleUpdatePageBlocks}
      />
    </div>
  );
}

