import React, { useState, useRef, useEffect } from 'react';
import { Page, Block, BlockType } from '../types';
import { createId } from '../initialData';
import { 
  Plus, GripVertical, ChevronDown, Trash, Copy, ArrowUp, ArrowDown,
  Heading1, Heading2, Heading3, CheckSquare, List, ListOrdered, Code, AlertCircle, Quote, Minus, Type, HelpCircle
} from 'lucide-react';
import { parseMarkdown, PAGE_EMOJIS } from '../utils';
import { motion, AnimatePresence } from 'motion/react';

interface EditorProps {
  page: Page;
  onChangePageTitle: (id: string, title: string) => void;
  onChangePageIcon: (id: string, icon: string) => void;
  onUpdatePageBlocks: (id: string, blocks: Block[]) => void;
  onNavigateToPage?: (id: string) => void;
}

interface CommandItem {
  type: BlockType;
  label: string;
  description: string;
  icon: React.ReactNode;
}

export default function Editor({
  page,
  onChangePageTitle,
  onChangePageIcon,
  onUpdatePageBlocks,
  onNavigateToPage
}: EditorProps) {
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);
  const [hoveredBlockId, setHoveredBlockId] = useState<string | null>(null);
  const [slashMenu, setSlashMenu] = useState<{ blockId: string; filter: string; x: number; y: number } | null>(null);
  const [slashSelectedIndex, setSlashSelectedIndex] = useState(0);
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  
  const slashMenuRef = useRef<HTMLDivElement>(null);
  const blockRefs = useRef<Record<string, HTMLTextAreaElement | null>>({});

  // Command items for the Slash command menu
  const COMMANDS: CommandItem[] = [
    { type: 'text', label: 'Text', description: 'Just start writing with plain text.', icon: <Type size={16} /> },
    { type: 'h1', label: 'Heading 1', description: 'Big section heading.', icon: <Heading1 size={16} /> },
    { type: 'h2', label: 'Heading 2', description: 'Medium section heading.', icon: <Heading2 size={16} /> },
    { type: 'h3', label: 'Heading 3', description: 'Small section heading.', icon: <Heading3 size={16} /> },
    { type: 'todo', label: 'To-do list', description: 'Track tasks with checkboxes.', icon: <CheckSquare size={16} /> },
    { type: 'bullet', label: 'Bulleted list', description: 'Create a simple bulleted list.', icon: <List size={16} /> },
    { type: 'number', label: 'Numbered list', description: 'Create a sequential list.', icon: <ListOrdered size={16} /> },
    { type: 'code', label: 'Code Block', description: 'Write code with syntax highlighting.', icon: <Code size={16} /> },
    { type: 'callout', label: 'Callout', description: 'Make writing stand out.', icon: <AlertCircle size={16} /> },
    { type: 'quote', label: 'Quote', description: 'Capture a quote.', icon: <Quote size={16} /> },
    { type: 'divider', label: 'Divider', description: 'Visually divide sections.', icon: <Minus size={16} /> }
  ];

  // Auto-resize textareas as content changes
  useEffect(() => {
    Object.keys(blockRefs.current).forEach(id => {
      const el = blockRefs.current[id];
      if (el) {
        el.style.height = 'auto';
        el.style.height = `${el.scrollHeight}px`;
      }
    });
  }, [page.blocks]);

  // Click outside listener for slash menu and emoji picker
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (slashMenuRef.current && !slashMenuRef.current.contains(e.target as Node)) {
        setSlashMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update a single block's values
  const handleUpdateBlock = (blockId: string, updates: Partial<Block>) => {
    const updatedBlocks = page.blocks.map(b => {
      if (b.id === blockId) {
        return { ...b, ...updates };
      }
      return b;
    });
    onUpdatePageBlocks(page.id, updatedBlocks);
  };

  // Add a block below a certain block
  const handleAddBlockBelow = (currentBlockId: string, type: BlockType = 'text', content: string = '') => {
    const currentIndex = page.blocks.findIndex(b => b.id === currentBlockId);
    const newBlock: Block = {
      id: createId(),
      type,
      content,
      checked: type === 'todo' ? false : undefined,
      language: type === 'code' ? 'javascript' : undefined,
      icon: type === 'callout' ? '✨' : undefined
    };

    const updatedBlocks = [...page.blocks];
    updatedBlocks.splice(currentIndex + 1, 0, newBlock);
    onUpdatePageBlocks(page.id, updatedBlocks);
    
    // Focus the new block in the next render
    setTimeout(() => {
      const el = blockRefs.current[newBlock.id];
      if (el) {
        el.focus();
        setActiveBlockId(newBlock.id);
      }
    }, 50);
  };

  // Delete block
  const handleDeleteBlock = (blockId: string) => {
    if (page.blocks.length <= 1) {
      // Don't delete the last block, just clear it
      handleUpdateBlock(blockId, { type: 'text', content: '' });
      return;
    }
    const updatedBlocks = page.blocks.filter(b => b.id !== blockId);
    onUpdatePageBlocks(page.id, updatedBlocks);
  };

  // Move block up
  const handleMoveBlockUp = (blockId: string) => {
    const index = page.blocks.findIndex(b => b.id === blockId);
    if (index === 0) return;
    const updatedBlocks = [...page.blocks];
    const [moved] = updatedBlocks.splice(index, 1);
    updatedBlocks.splice(index - 1, 0, moved);
    onUpdatePageBlocks(page.id, updatedBlocks);
  };

  // Move block down
  const handleMoveBlockDown = (blockId: string) => {
    const index = page.blocks.findIndex(b => b.id === blockId);
    if (index === page.blocks.length - 1) return;
    const updatedBlocks = [...page.blocks];
    const [moved] = updatedBlocks.splice(index, 1);
    updatedBlocks.splice(index + 1, 0, moved);
    onUpdatePageBlocks(page.id, updatedBlocks);
  };

  // Transform block type
  const handleTransformBlock = (blockId: string, type: BlockType) => {
    handleUpdateBlock(blockId, {
      type,
      checked: type === 'todo' ? false : undefined,
      language: type === 'code' ? 'javascript' : undefined,
      icon: type === 'callout' ? '✨' : undefined,
      // Clear slash command in content
      content: blockRefs.current[blockId]?.value.replace(/\/\w*$/, '') || ''
    });
    setSlashMenu(null);
    
    // Focus again
    setTimeout(() => {
      blockRefs.current[blockId]?.focus();
    }, 50);
  };

  // Handle textarea change & key bindings
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>, block: Block) => {
    const { selectionStart, value } = e.currentTarget;

    if (slashMenu) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSlashSelectedIndex(prev => (prev + 1) % filteredCommands.length);
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSlashSelectedIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length);
        return;
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredCommands[slashSelectedIndex]) {
          handleTransformBlock(block.id, filteredCommands[slashSelectedIndex].type);
        }
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        setSlashMenu(null);
        return;
      }
    }

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      // If code block, enter just inserts newline, but we handled it using standard textarea behavior
      if (block.type === 'code') {
        const start = e.currentTarget.selectionStart;
        const end = e.currentTarget.selectionEnd;
        const newValue = value.substring(0, start) + '\n' + value.substring(end);
        handleUpdateBlock(block.id, { content: newValue });
        setTimeout(() => {
          if (blockRefs.current[block.id]) {
            blockRefs.current[block.id]!.selectionStart = blockRefs.current[block.id]!.selectionEnd = start + 1;
          }
        }, 10);
        return;
      }
      
      handleAddBlockBelow(block.id, 'text');
    }

    if (e.key === 'Backspace' && selectionStart === 0 && value.length === 0) {
      e.preventDefault();
      if (block.type !== 'text') {
        // Transform back to text block first
        handleUpdateBlock(block.id, { type: 'text' });
      } else {
        // Delete block and focus previous block
        const currentIndex = page.blocks.findIndex(b => b.id === block.id);
        if (currentIndex > 0) {
          const prevBlock = page.blocks[currentIndex - 1];
          handleDeleteBlock(block.id);
          setTimeout(() => {
            blockRefs.current[prevBlock.id]?.focus();
          }, 50);
        }
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>, blockId: string) => {
    const value = e.target.value;
    handleUpdateBlock(blockId, { content: value });

    // Detect slash command
    const selectionStart = e.target.selectionStart;
    const textBeforeCursor = value.substring(0, selectionStart);
    const slashIndex = textBeforeCursor.lastIndexOf('/');

    if (slashIndex !== -1 && slashIndex === textBeforeCursor.length - 1) {
      // Slash typed at cursor
      const rect = e.target.getBoundingClientRect();
      setSlashMenu({
        blockId,
        filter: '',
        x: rect.left,
        y: rect.top + window.scrollY + 24
      });
      setSlashSelectedIndex(0);
    } else if (slashMenu && slashMenu.blockId === blockId) {
      if (slashIndex === -1) {
        setSlashMenu(null);
      } else {
        const filter = textBeforeCursor.substring(slashIndex + 1);
        setSlashMenu(prev => prev ? { ...prev, filter } : null);
        setSlashSelectedIndex(0);
      }
    }
  };

  // Filter commands by slash filter
  const filteredCommands = slashMenu 
    ? COMMANDS.filter(cmd => 
        cmd.label.toLowerCase().includes(slashMenu.filter.toLowerCase()) ||
        cmd.type.toLowerCase().includes(slashMenu.filter.toLowerCase())
      )
    : COMMANDS;

  return (
    <div className="w-full max-w-4xl mx-auto px-4 md:px-12 py-10 pb-32" id="zen-block-editor">
      {/* Icon and Cover Section */}
      <div className="relative group/page-icon mb-6 flex items-center justify-start gap-4">
        <div className="relative">
          <button 
            onClick={() => setEmojiPickerOpen(!emojiPickerOpen)}
            className="text-5xl md:text-6xl p-2 rounded-2xl hover:bg-slate-100 dark:hover:bg-white/5 transition-all cursor-pointer duration-200 block shadow-sm hover:scale-105 active:scale-95"
            id="page-emoji-selector"
          >
            {page.icon || '📝'}
          </button>

          {emojiPickerOpen && (
            <div 
              className="absolute left-0 mt-3 z-50 p-3 bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-white/5 rounded-2xl shadow-2xl grid grid-cols-5 gap-2 w-52"
              onClick={e => e.stopPropagation()}
            >
              {PAGE_EMOJIS.map(emoji => (
                <button
                  key={emoji}
                  onClick={() => {
                    onChangePageIcon(page.id, emoji);
                    setEmojiPickerOpen(false);
                  }}
                  className="p-1.5 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-all text-xl"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Page Title */}
      <input
        type="text"
        value={page.title}
        onChange={(e) => onChangePageTitle(page.id, e.target.value)}
        placeholder="Untitled Workspace"
        className="w-full font-display font-bold text-3xl md:text-4xl text-slate-900 dark:text-white bg-transparent border-0 border-b-2 border-transparent hover:border-slate-100 dark:hover:border-white/5 focus:border-pink-500/30 outline-none pb-2 mb-8 transition-colors duration-200 tracking-tight"
        id="page-title-input"
      />

      {/* Editor Blocks */}
      <div className="space-y-3 min-h-[50vh]">
        {page.blocks.map((block) => {
          const isActive = activeBlockId === block.id;
          const isHovered = hoveredBlockId === block.id;

          return (
            <div
              key={block.id}
              className="group/block relative flex items-start gap-1"
              onMouseEnter={() => setHoveredBlockId(block.id)}
              onMouseLeave={() => setHoveredBlockId(null)}
            >
              {/* Left Block Control Menu Trigger (Only visible on hover or if active) */}
              <div className={`absolute -left-12 top-0.5 z-30 flex items-center transition-all ${
                isHovered ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}>
                {/* Drag handle or quick operations dropdown */}
                <div className="flex items-center bg-white dark:bg-[#181818] border border-slate-200/50 dark:border-white/5 rounded-xl p-0.5 shadow-md">
                  <button
                    title="Add block below"
                    onClick={() => handleAddBlockBelow(block.id)}
                    className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-50 dark:hover:bg-white/5"
                  >
                    <Plus size={13} />
                  </button>

                  {/* Reorder actions */}
                  <button
                    title="Move block up"
                    onClick={() => handleMoveBlockUp(block.id)}
                    className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-50 dark:hover:bg-white/5"
                  >
                    <ArrowUp size={13} />
                  </button>
                  <button
                    title="Move block down"
                    onClick={() => handleMoveBlockDown(block.id)}
                    className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-50 dark:hover:bg-white/5"
                  >
                    <ArrowDown size={13} />
                  </button>
                  
                  {/* Delete action */}
                  <button
                    title="Delete block"
                    onClick={() => handleDeleteBlock(block.id)}
                    className="p-1 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-slate-50 dark:hover:bg-white/5"
                  >
                    <Trash size={13} />
                  </button>
                </div>
              </div>

              {/* Block Content Renderers depending on block types */}
              <div className="flex-1 w-full min-w-0">
                {block.type === 'divider' ? (
                  <div className="py-2 cursor-pointer" onClick={() => setActiveBlockId(block.id)}>
                    <hr className="border-t border-slate-200 dark:border-white/5" />
                  </div>
                ) : (
                  <div className="w-full">
                    {/* Rendered State (when blurred/not active) */}
                    {!isActive && block.content ? (
                      <div 
                        onClick={() => {
                          setActiveBlockId(block.id);
                          // Delay focus to ensure textarea is rendered
                          setTimeout(() => {
                            blockRefs.current[block.id]?.focus();
                            // Place cursor at the end
                            if (blockRefs.current[block.id]) {
                              const len = blockRefs.current[block.id]!.value.length;
                              blockRefs.current[block.id]!.setSelectionRange(len, len);
                            }
                          }, 50);
                        }}
                        className={`w-full min-h-[1.5rem] rounded-lg px-2 py-1 transition-all text-slate-800 dark:text-slate-200 leading-relaxed break-words cursor-text ${
                          block.type === 'h1' ? 'text-2xl md:text-3xl font-display font-bold text-slate-900 dark:text-white mt-4 mb-2' :
                          block.type === 'h2' ? 'text-xl md:text-2xl font-display font-semibold text-slate-900 dark:text-white mt-3 mb-1.5' :
                          block.type === 'h3' ? 'text-lg md:text-xl font-display font-medium text-slate-900 dark:text-white mt-2 mb-1' :
                          block.type === 'todo' ? 'flex items-center gap-2.5' :
                          block.type === 'bullet' ? 'flex items-start gap-2.5 pl-2' :
                          block.type === 'number' ? 'flex items-start gap-2 pl-2' :
                          block.type === 'quote' ? 'border-l-4 border-pink-400/80 pl-4 py-1 italic text-slate-600 dark:text-slate-400 my-2 bg-slate-50/50 dark:bg-[#1E1E1E]/20 rounded-r-lg' :
                          block.type === 'callout' ? 'flex items-start gap-3 p-3.5 bg-pink-500/5 dark:bg-[#1E1E1E]/40 border border-pink-200/40 dark:border-white/5 rounded-2xl shadow-sm' :
                          block.type === 'code' ? 'p-4 bg-[#0D0E12] border dark:border-white/5 rounded-2xl font-mono text-xs text-slate-300 shadow-inner animate-fade-in' :
                          'hover:bg-slate-50 dark:hover:bg-white/5'
                        }`}
                      >
                        {block.type === 'todo' && (
                          <input
                            type="checkbox"
                            checked={block.checked || false}
                            onChange={(e) => {
                              e.stopPropagation();
                              handleUpdateBlock(block.id, { checked: e.target.checked });
                            }}
                            className="rounded-md border-slate-300 dark:border-white/5 text-pink-500 focus:ring-pink-500 w-4.5 h-4.5 cursor-pointer"
                          />
                        )}
                        {block.type === 'bullet' && (
                          <span className="w-1.5 h-1.5 rounded-full bg-pink-400 dark:bg-pink-300 shrink-0 mt-2.5" />
                        )}
                        {block.type === 'number' && (
                          <span className="text-pink-500 dark:text-pink-400 font-semibold text-xs mt-1 shrink-0">
                            {page.blocks.filter((b, idx) => b.type === 'number' && idx <= page.blocks.findIndex(cur => cur.id === block.id)).length}.
                          </span>
                        )}
                        {block.type === 'callout' && (
                          <span className="text-xl shrink-0 select-none">{block.icon || '✨'}</span>
                        )}
                        
                        {/* The rendered html text */}
                        <div 
                          className={`flex-1 min-w-0 ${block.type === 'todo' && block.checked ? 'line-through text-slate-400' : ''}`}
                          dangerouslySetInnerHTML={{ __html: parseMarkdown(block.content) }}
                        />
                      </div>
                    ) : (
                      // Editable State (when focused or if empty)
                      <div className={`relative px-2 py-1 rounded-xl transition-all ${
                        isActive ? 'bg-slate-50/80 dark:bg-[#1E1E1E]/40 ring-1 ring-slate-200 dark:ring-white/5' : ''
                      }`}>
                        {block.type === 'todo' && (
                          <div className="absolute left-3 top-2.5 flex items-center">
                            <input
                              type="checkbox"
                              checked={block.checked || false}
                              onChange={(e) => handleUpdateBlock(block.id, { checked: e.target.checked })}
                              className="rounded border-slate-300 text-pink-500 focus:ring-pink-500 w-4 h-4"
                            />
                          </div>
                        )}
                        
                        {block.type === 'callout' && (
                          <div className="absolute left-3 top-2.5 select-none text-base">
                            <button 
                              onClick={() => {
                                const nextIcon = block.icon === '✨' ? '💡' : block.icon === '💡' ? '📌' : block.icon === '📌' ? '🚨' : '✨';
                                handleUpdateBlock(block.id, { icon: nextIcon });
                              }}
                              className="hover:scale-110 active:scale-95 transition-transform"
                            >
                              {block.icon || '✨'}
                            </button>
                          </div>
                        )}

                        <textarea
                          ref={(el) => { blockRefs.current[block.id] = el; }}
                          rows={1}
                          value={block.content}
                          onChange={(e) => handleInputChange(e, block.id)}
                          onKeyDown={(e) => handleKeyDown(e, block)}
                          onFocus={() => setActiveBlockId(block.id)}
                          onBlur={() => {
                            // Delay blur slightly to allow slash commands to click
                            setTimeout(() => setActiveBlockId(null), 150);
                          }}
                          placeholder={
                            block.type === 'h1' ? 'Heading 1' :
                            block.type === 'h2' ? 'Heading 2' :
                            block.type === 'h3' ? 'Heading 3' :
                            'Type "/" for blocks, commands...'
                          }
                          className={`w-full bg-transparent border-0 outline-none focus:ring-0 text-slate-800 dark:text-slate-100 placeholder-slate-400/80 resize-none font-sans leading-relaxed block ${
                            block.type === 'h1' ? 'text-2xl md:text-3xl font-bold font-display mt-1' :
                            block.type === 'h2' ? 'text-xl md:text-2xl font-semibold font-display mt-1' :
                            block.type === 'h3' ? 'text-lg md:text-xl font-medium font-display mt-1' :
                            block.type === 'todo' ? 'pl-8' :
                            block.type === 'callout' ? 'pl-8' :
                            block.type === 'code' ? 'font-mono text-xs p-2 bg-slate-950 text-emerald-400 rounded-lg min-h-24' :
                            ''
                          }`}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating slash command inserter menu */}
      {slashMenu && (
        <div 
          ref={slashMenuRef}
          style={{ top: `${slashMenu.y}px`, left: `${slashMenu.x}px` }}
          className="absolute z-50 w-72 max-h-60 overflow-y-auto bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-white/5 rounded-2xl shadow-2xl p-2 space-y-0.5"
        >
          <div className="px-2.5 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider select-none">
            Transform Block to...
          </div>
          {filteredCommands.map((cmd, index) => {
            const isSelected = index === slashSelectedIndex;
            return (
              <button
                key={cmd.type}
                onClick={() => handleTransformBlock(slashMenu.blockId, cmd.type)}
                onMouseEnter={() => setSlashSelectedIndex(index)}
                className={`w-full flex items-center gap-3 px-2.5 py-2 rounded-xl text-left transition-all duration-150 ${
                  isSelected 
                    ? 'bg-pink-500/10 text-pink-600 dark:bg-white/5 dark:text-slate-200 font-medium' 
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5'
                }`}
              >
                <div className={`p-1.5 rounded-lg shrink-0 ${
                  isSelected ? 'bg-pink-500/15 text-pink-500' : 'bg-slate-100 dark:bg-[#181818] border dark:border-white/5 text-slate-500'
                }`}>
                  {cmd.icon}
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-semibold block leading-tight">{cmd.label}</span>
                  <span className="text-[10px] text-slate-400 block truncate leading-none mt-0.5">{cmd.description}</span>
                </div>
              </button>
            );
          })}
          {filteredCommands.length === 0 && (
            <div className="text-center py-4 text-xs text-slate-400">
              No matching blocks found
            </div>
          )}
        </div>
      )}
    </div>
  );
}
