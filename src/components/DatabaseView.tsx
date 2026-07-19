import React, { useState } from 'react';
import { Page, PropertyDefinition } from '../types';
import { createId } from '../initialData';
import { 
  Table as TableIcon, LayoutGrid, List as ListIcon, Plus, Calendar, 
  Tag, AlertCircle, Trash, Star, Filter, Eye, ChevronRight, X, Sparkles, Check, ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getPastelColor } from '../utils';
import Editor from './Editor';

interface DatabaseViewProps {
  databasePage: Page;
  childPages: Page[];
  onCreateItem: (title: string, initialValues?: Record<string, any>) => void;
  onDeleteItem: (id: string) => void;
  onUpdateItemProperties: (itemId: string, propertyValues: Record<string, any>) => void;
  onToggleFavorite: (id: string) => void;
  onChangePageIcon: (id: string, icon: string) => void;
  onChangePageTitle: (id: string, title: string) => void;
  onUpdatePageBlocks: (id: string, blocks: Page['blocks']) => void;
}

export default function DatabaseView({
  databasePage,
  childPages,
  onCreateItem,
  onDeleteItem,
  onUpdateItemProperties,
  onToggleFavorite,
  onChangePageIcon,
  onChangePageTitle,
  onUpdatePageBlocks
}: DatabaseViewProps) {
  const config = databasePage.databaseConfig || {
    properties: [],
    activeView: 'board',
    filters: []
  };

  const [activeTab, setActiveTab] = useState<'board' | 'table' | 'list'>(config.activeView);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [filterTag, setFilterTag] = useState<string>('All');
  const [newItemTitle, setNewItemTitle] = useState('');
  
  // Custom inline deletion confirmation state
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  
  // Statuses list derived from configuration
  const statusProp = config.properties.find(p => p.id === 'prop-status');
  const statuses = statusProp?.options || ['Backlog', 'In Progress', 'In Review', 'Done'];

  // Tags list derived from configuration
  const tagsProp = config.properties.find(p => p.id === 'prop-tags');
  const tags = tagsProp?.options || ['Feature', 'Bug', 'Design', 'Marketing', 'Core'];

  // Filter items
  const filteredItems = childPages.filter(item => {
    const itemValues = item.propertyValues || {};
    
    // Filter by status
    const itemStatus = itemValues['prop-status'] || statuses[0];
    if (filterStatus !== 'All' && itemStatus !== filterStatus) return false;

    // Filter by tag
    const itemTags = itemValues['prop-tags'] || [];
    if (filterTag !== 'All' && !itemTags.includes(filterTag)) return false;

    return true;
  });

  // Handle creating a new item
  const handleAddNewItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemTitle.trim()) return;
    
    // Set initial values
    const initialValues: Record<string, any> = {
      'prop-status': filterStatus !== 'All' ? filterStatus : statuses[0],
      'prop-tags': filterTag !== 'All' ? [filterTag] : [],
      'prop-due': new Date().toISOString().split('T')[0],
      'prop-notes': ''
    };

    onCreateItem(newItemTitle.trim(), initialValues);
    setNewItemTitle('');
  };

  // Add specific items directly in status column
  const handleAddInStatus = (status: string) => {
    const title = prompt(`Enter title for new task in "${status}":`);
    if (!title || !title.trim()) return;

    const initialValues: Record<string, any> = {
      'prop-status': status,
      'prop-tags': [],
      'prop-due': new Date().toISOString().split('T')[0],
      'prop-notes': ''
    };
    onCreateItem(title.trim(), initialValues);
  };

  // Selected sub-page inside database
  const selectedItem = childPages.find(p => p.id === selectedItemId);

  // Status updates helper
  const handleStatusChange = (itemId: string, nextStatus: string) => {
    const item = childPages.find(p => p.id === itemId);
    if (!item) return;
    const currentValues = item.propertyValues || {};
    onUpdateItemProperties(itemId, {
      ...currentValues,
      'prop-status': nextStatus
    });
  };

  // Tags updates helper
  const handleTagToggle = (itemId: string, tag: string) => {
    const item = childPages.find(p => p.id === itemId);
    if (!item) return;
    const currentValues = item.propertyValues || {};
    const currentTags = currentValues['prop-tags'] || [];
    
    let nextTags: string[];
    if (currentTags.includes(tag)) {
      nextTags = currentTags.filter((t: string) => t !== tag);
    } else {
      nextTags = [...currentTags, tag];
    }

    onUpdateItemProperties(itemId, {
      ...currentValues,
      'prop-tags': nextTags
    });
  };

  // Date/Notes updates helper
  const handlePropChange = (itemId: string, propId: string, val: any) => {
    const item = childPages.find(p => p.id === itemId);
    if (!item) return;
    const currentValues = item.propertyValues || {};
    onUpdateItemProperties(itemId, {
      ...currentValues,
      [propId]: val
    });
  };

  return (
    <div className="w-full h-full flex flex-col" id="database-manager-layout">
      {/* DB Toolbar & Controls */}
      <div className="border-b border-slate-200/50 dark:border-slate-800/50 p-4 md:px-8 flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0 bg-white/20 dark:bg-slate-900/10 backdrop-blur-md">
        
        {/* Navigation Tabs */}
        <div className="flex bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl w-fit" id="database-tabs-selector">
          <button
            onClick={() => setActiveTab('board')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
              activeTab === 'board'
                ? 'bg-white dark:bg-[#1E1E1E] text-slate-800 dark:text-[#E0E0E0] shadow-sm border dark:border-white/5'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <LayoutGrid size={13} />
            <span>Kanban Board</span>
          </button>
          <button
            onClick={() => setActiveTab('table')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
              activeTab === 'table'
                ? 'bg-white dark:bg-[#1E1E1E] text-slate-800 dark:text-[#E0E0E0] shadow-sm border dark:border-white/5'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <TableIcon size={13} />
            <span>Table Grid</span>
          </button>
          <button
            onClick={() => setActiveTab('list')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
              activeTab === 'list'
                ? 'bg-white dark:bg-[#1E1E1E] text-slate-800 dark:text-[#E0E0E0] shadow-sm border dark:border-white/5'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <ListIcon size={13} />
            <span>List Ledger</span>
          </button>
        </div>

        {/* Database Quick Filters & Create Row Form */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-[#1E1E1E] border border-slate-200 dark:border-white/5 rounded-xl px-2.5 py-1.5 text-xs text-slate-600 dark:text-slate-300">
            <Filter size={12} className="text-slate-400" />
            <span className="font-medium text-slate-400">Status:</span>
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="bg-transparent border-none outline-none font-semibold text-slate-700 dark:text-slate-200 cursor-pointer text-xs"
            >
              <option value="All">All Statuses</option>
              {statuses.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Tags Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-[#1E1E1E] border border-slate-200 dark:border-white/5 rounded-xl px-2.5 py-1.5 text-xs text-slate-600 dark:text-slate-300">
            <Tag size={12} className="text-slate-400" />
            <span className="font-medium text-slate-400">Tag:</span>
            <select
              value={filterTag}
              onChange={e => setFilterTag(e.target.value)}
              className="bg-transparent border-none outline-none font-semibold text-slate-700 dark:text-slate-200 cursor-pointer text-xs"
            >
              <option value="All">All Tags</option>
              {tags.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* Quick Create Item */}
          <form onSubmit={handleAddNewItem} className="flex items-center gap-1.5 shrink-0" id="quick-create-item-form">
            <input
              type="text"
              value={newItemTitle}
              onChange={e => setNewItemTitle(e.target.value)}
              placeholder="New database item title..."
              className="bg-slate-50 dark:bg-[#1E1E1E] border border-slate-200 dark:border-white/5 rounded-xl px-3 py-1.5 text-xs outline-none focus:ring-1 focus:ring-pink-500/30 w-44 md:w-56"
            />
            <button
              type="submit"
              className="p-1.5 bg-gradient-to-tr from-pink-500 to-indigo-500 text-white rounded-xl hover:opacity-95 shadow-md flex items-center justify-center transition-all cursor-pointer"
            >
              <Plus size={16} />
            </button>
          </form>
        </div>
      </div>

      {/* Primary Databases Content Views */}
      <div className="flex-1 p-4 md:p-8 overflow-y-auto" id="database-active-canvas">
        {/* VIEW 1: KANBAN BOARD */}
        {activeTab === 'board' && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
            {statuses.map(status => {
              const statusItems = filteredItems.filter(item => {
                const itemStatus = item.propertyValues?.['prop-status'] || statuses[0];
                return itemStatus === status;
              });

              return (
                <div 
                  key={status} 
                  className="bg-slate-50/50 dark:bg-[#181818]/80 border border-slate-200/50 dark:border-white/5 rounded-2xl p-4 flex flex-col max-h-[80vh]"
                >
                  {/* Status header */}
                  <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-200/40 dark:border-slate-800/40">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`w-2 h-2 rounded-full ${getPastelColor(status).bullet}`} />
                      <h4 className="font-display font-semibold text-xs text-slate-700 dark:text-slate-300 uppercase tracking-wider truncate">{status}</h4>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-200/60 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold font-mono">
                        {statusItems.length}
                      </span>
                    </div>

                    <button 
                      onClick={() => handleAddInStatus(status)}
                      className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                    >
                      <Plus size={13} />
                    </button>
                  </div>

                  {/* Cards stack */}
                  <div className="space-y-3 overflow-y-auto flex-1 pr-1 pb-4">
                    {statusItems.map(item => {
                      const itemValues = item.propertyValues || {};
                      const itemTags = itemValues['prop-tags'] || [];
                      const itemDate = itemValues['prop-due'] || '';

                      return (
                        <div
                          key={item.id}
                          onClick={() => setSelectedItemId(item.id)}
                          className="group relative bg-white dark:bg-[#1E1E1E] border border-slate-200/60 dark:border-white/5 rounded-xl p-3.5 shadow-sm hover:shadow-md transition-all cursor-pointer hover:border-pink-500/20 dark:hover:border-pink-400/20 active:scale-[0.99] duration-150"
                        >
                          {/* Card title & Icon */}
                          <div className="flex items-start gap-2 mb-2">
                            <span className="text-base select-none">{item.icon || '📝'}</span>
                            <h5 className="font-medium text-xs text-slate-800 dark:text-slate-200 leading-snug flex-1 group-hover:text-pink-600 dark:group-hover:text-pink-300 transition-colors truncate">
                              {item.title || 'Untitled item'}
                            </h5>
                          </div>

                          {/* Date and tags */}
                          <div className="space-y-2 mt-1.5">
                            {itemTags.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {itemTags.map((tag: string) => (
                                  <span
                                    key={tag}
                                    className={`text-[9px] px-1.5 py-0.5 rounded font-medium border ${getPastelColor(tag).bg} ${getPastelColor(tag).text}`}
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}

                            {itemDate && (
                              <div className="flex items-center gap-1 text-[9.5px] text-slate-400 font-mono">
                                <Calendar size={10} />
                                <span>{itemDate}</span>
                              </div>
                            )}
                          </div>

                          {/* Quick Change Status Dropdown on hover */}
                          <div className={`absolute right-2 top-2 ${deleteConfirmId === item.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity flex items-center gap-1.5 z-10 bg-white/90 dark:bg-[#1E1E1E]/90 pl-1 rounded`}>
                            {deleteConfirmId === item.id ? (
                              <div className="flex items-center gap-0.5 bg-rose-500/15 border border-rose-500/20 rounded px-1 text-[9px] py-0.5">
                                <button
                                  title="Confirm Delete"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onDeleteItem(item.id);
                                    setDeleteConfirmId(null);
                                  }}
                                  className="p-0.5 text-rose-500 hover:text-rose-400 cursor-pointer animate-pulse"
                                >
                                  <Check size={10} />
                                </button>
                                <button
                                  title="Cancel"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setDeleteConfirmId(null);
                                  }}
                                  className="p-0.5 text-slate-400 hover:text-slate-200 cursor-pointer"
                                >
                                  <X size={10} />
                                </button>
                              </div>
                            ) : (
                              <button
                                title="Delete Item"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeleteConfirmId(item.id);
                                }}
                                className="p-1 hover:bg-rose-500/10 hover:text-rose-500 text-slate-400 rounded transition-colors cursor-pointer"
                              >
                                <Trash size={11} />
                              </button>
                            )}
                            
                            <select
                              value={status}
                              onChange={(e) => {
                                e.stopPropagation();
                                handleStatusChange(item.id, e.target.value);
                              }}
                              onClick={e => e.stopPropagation()}
                              className="bg-slate-100 dark:bg-[#181818] text-[10px] py-0.5 px-1.5 rounded border border-slate-200 dark:border-white/5 font-semibold text-slate-600 dark:text-slate-300 outline-none"
                            >
                              {statuses.map(s => (
                                <option key={s} value={s}>{s}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      );
                    })}

                    {statusItems.length === 0 && (
                      <div className="text-center py-6 text-[11px] text-slate-400 italic border-2 border-dashed border-slate-200 dark:border-white/5 rounded-xl">
                        No tasks
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* VIEW 2: TABLE GRID */}
        {activeTab === 'table' && (
          <div className="overflow-x-auto bg-white dark:bg-[#1E1E1E] border border-slate-200/50 dark:border-white/5 rounded-2xl shadow-sm">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-slate-50 dark:bg-[#181818] border-b border-slate-200/50 dark:border-white/5 text-[11px] uppercase font-bold text-slate-400 tracking-wider">
                  <th className="py-3 px-4">Item Name</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Tags</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4">Notes</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-xs">
                {filteredItems.map(item => {
                  const itemValues = item.propertyValues || {};
                  const currentStatus = itemValues['prop-status'] || statuses[0];
                  const currentTags = itemValues['prop-tags'] || [];
                  const currentDate = itemValues['prop-due'] || '';
                  const currentNotes = itemValues['prop-notes'] || '';

                  return (
                    <tr 
                      key={item.id}
                      className="hover:bg-slate-50/50 dark:hover:bg-white/5 group transition-all"
                    >
                      {/* Name with emoji */}
                      <td 
                        onClick={() => setSelectedItemId(item.id)}
                        className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200 cursor-pointer hover:text-pink-500 dark:hover:text-pink-300"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-base shrink-0">{item.icon || '📝'}</span>
                          <span className="truncate max-w-[200px]">{item.title || 'Untitled Item'}</span>
                        </div>
                      </td>

                      {/* Status select cell */}
                      <td className="py-3 px-4">
                        <select
                          value={currentStatus}
                          onChange={(e) => handleStatusChange(item.id, e.target.value)}
                          className="bg-slate-100 dark:bg-[#181818] border dark:border-white/5 text-[10.5px] font-semibold text-slate-700 dark:text-slate-300 py-1 px-2.5 rounded-lg outline-none cursor-pointer"
                        >
                          {statuses.map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </td>

                      {/* Tags toggling cells */}
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1 items-center">
                          {currentTags.map((tag: string) => (
                            <span
                              key={tag}
                              onClick={() => handleTagToggle(item.id, tag)}
                              className={`text-[9.5px] px-1.5 py-0.5 rounded font-medium border cursor-pointer hover:opacity-80 transition-opacity ${getPastelColor(tag).bg} ${getPastelColor(tag).text}`}
                            >
                              {tag}
                            </span>
                          ))}
                          
                          {/* Quick add tag button */}
                          <div className="relative group/tag-add inline-block">
                            <button className="p-1 hover:bg-slate-100 dark:hover:bg-white/5 rounded border border-slate-200 dark:border-white/5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                              <Plus size={10} />
                            </button>
                            {/* Hidden popup options */}
                            <div className="hidden group-hover/tag-add:block absolute left-0 bottom-6 z-30 p-1.5 bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-white/5 rounded-lg shadow-xl w-32 space-y-1">
                              {tags.map(t => (
                                <button
                                  key={t}
                                  onClick={() => handleTagToggle(item.id, t)}
                                  className={`w-full text-left text-[10px] p-1 rounded font-medium block truncate ${
                                    currentTags.includes(t) ? 'bg-pink-500/10 text-pink-600' : 'hover:bg-slate-50 dark:hover:bg-white/5'
                                  }`}
                                >
                                  {t} {currentTags.includes(t) && '✓'}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Due Date Cell */}
                      <td className="py-3 px-4">
                        <input
                          type="date"
                          value={currentDate}
                          onChange={(e) => handlePropChange(item.id, 'prop-due', e.target.value)}
                          className="bg-transparent text-slate-600 dark:text-slate-300 font-mono text-xs border-none outline-none focus:bg-slate-100 dark:focus:bg-white/5 p-1 rounded-lg"
                        />
                      </td>

                      {/* Notes text cell */}
                      <td className="py-3 px-4">
                        <input
                          type="text"
                          value={currentNotes}
                          onChange={(e) => handlePropChange(item.id, 'prop-notes', e.target.value)}
                          placeholder="Empty note cell"
                          className="w-full max-w-[250px] bg-transparent text-slate-600 dark:text-slate-300 border-none outline-none focus:bg-slate-100 dark:focus:bg-white/5 p-1 rounded-lg"
                        />
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            title="Open blocks editor"
                            onClick={() => setSelectedItemId(item.id)}
                            className="p-1.5 text-slate-400 hover:text-pink-500 dark:hover:text-pink-400 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
                          >
                            <Eye size={13} />
                          </button>
                          {deleteConfirmId === item.id ? (
                            <div className="flex items-center gap-1 bg-rose-500/10 dark:bg-rose-500/20 border border-rose-500/20 px-1 py-0.5 rounded-lg text-xs">
                              <button
                                title="Confirm Delete"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDeleteItem(item.id);
                                  setDeleteConfirmId(null);
                                }}
                                className="p-0.5 text-rose-500 hover:text-rose-400 cursor-pointer animate-pulse"
                              >
                                <Check size={11} />
                              </button>
                              <button
                                title="Cancel"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeleteConfirmId(null);
                                }}
                                className="p-0.5 text-slate-400 hover:text-slate-200 cursor-pointer"
                              >
                                <X size={11} />
                              </button>
                            </div>
                          ) : (
                            <button
                              title="Delete Item"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteConfirmId(item.id);
                              }}
                              className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
                            >
                              <Trash size={13} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {filteredItems.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-slate-400 font-medium italic">
                      No matching database rows found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* VIEW 3: LIST LEDGER */}
        {activeTab === 'list' && (
          <div className="space-y-3 max-w-3xl mx-auto" id="database-list-ledger">
            {filteredItems.map(item => {
              const itemValues = item.propertyValues || {};
              const status = itemValues['prop-status'] || statuses[0];
              const itemTags = itemValues['prop-tags'] || [];
              const date = itemValues['prop-due'] || '';

              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedItemId(item.id)}
                  className="group flex items-center justify-between p-4 bg-white dark:bg-[#1E1E1E] border border-slate-200/50 dark:border-white/5 hover:border-pink-500/20 dark:hover:border-pink-400/20 rounded-2xl shadow-sm hover:shadow-md cursor-pointer transition-all duration-150"
                >
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    <span className="text-xl shrink-0 select-none">{item.icon || '📝'}</span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 group-hover:text-pink-600 dark:group-hover:text-pink-300 transition-colors truncate">
                          {item.title || 'Untitled'}
                        </span>
                        <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${getPastelColor(status).bg} ${getPastelColor(status).text}`}>
                          {status}
                        </span>
                      </div>
                      
                      {/* Subtitle / Properties inline */}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-[11px] text-slate-400">
                        {date && (
                          <span className="flex items-center gap-1 font-mono">
                            <Calendar size={10} />
                            <span>{date}</span>
                          </span>
                        )}
                        {itemValues['prop-notes'] && (
                          <span className="truncate max-w-[300px]">{itemValues['prop-notes']}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Tags column & Quick Delete */}
                  <div className="flex items-center gap-3 ml-4 shrink-0">
                    <div className="hidden sm:flex flex-wrap gap-1 justify-end max-w-xs">
                      {itemTags.map((tag: string) => (
                        <span
                          key={tag}
                          className={`text-[9px] px-1.5 py-0.5 rounded font-medium border ${getPastelColor(tag).bg} ${getPastelColor(tag).text}`}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {deleteConfirmId === item.id ? (
                      <div className="flex items-center gap-1 bg-rose-500/10 dark:bg-rose-500/20 border border-rose-500/20 px-1.5 py-1 rounded-xl text-xs shrink-0 z-10">
                        <button
                          title="Confirm Delete"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteItem(item.id);
                            setDeleteConfirmId(null);
                          }}
                          className="p-0.5 text-rose-500 hover:text-rose-400 cursor-pointer animate-pulse"
                        >
                          <Check size={11} />
                        </button>
                        <button
                          title="Cancel"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteConfirmId(null);
                          }}
                          className="p-0.5 text-slate-400 hover:text-slate-200 cursor-pointer"
                        >
                          <X size={11} />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteConfirmId(item.id);
                        }}
                        className={`p-2 hover:bg-rose-500/10 hover:text-rose-500 text-slate-400 rounded-xl transition-all cursor-pointer ${deleteConfirmId === item.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                      >
                        <Trash size={13} />
                      </button>
                    )}
                    
                    <ChevronRight size={15} className="text-slate-400 group-hover:text-pink-500 transition-colors" />
                  </div>
                </div>
              );
            })}

            {filteredItems.length === 0 && (
              <div className="text-center py-12 text-slate-400 italic">
                No database items in this list
              </div>
            )}
          </div>
        )}
      </div>

      {/* DETAILED MODAL SLIDE-OVER DRAWER (Active block-based editor inside item) */}
      <AnimatePresence>
        {selectedItemId && selectedItem && (
          <div className="fixed inset-0 z-50 overflow-hidden" id="database-item-drawer">
            {/* Backdrop blur overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedItemId(null)}
              className="absolute inset-0 bg-black backdrop-blur-xs"
            />

            {/* Slide-over Drawer block */}
            <div className="absolute inset-y-0 right-0 max-w-3xl w-full flex">
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 26, stiffness: 220 }}
                className="h-full w-full bg-white dark:bg-[#181818] shadow-2xl flex flex-col overflow-hidden border-l border-slate-200 dark:border-white/5"
              >
                {/* Header operations */}
                <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-white/5 shrink-0">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    <Sparkles size={13} className="text-pink-500" />
                    <span>Database Record Item</span>
                  </div>
                  
                  <button
                    onClick={() => setSelectedItemId(null)}
                    className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-[#181818] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-all"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Properties editor section */}
                <div className="bg-slate-50/50 dark:bg-[#1E1E1E]/50 p-5 border-b border-slate-100 dark:border-white/5 shrink-0 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    {/* Status Select */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Status</label>
                      <select
                        value={selectedItem.propertyValues?.['prop-status'] || statuses[0]}
                        onChange={(e) => handleStatusChange(selectedItem.id, e.target.value)}
                        className="w-full bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-white/5 rounded-xl px-3 py-1.5 text-xs text-slate-700 dark:text-slate-200 outline-none focus:ring-1 focus:ring-pink-500/30"
                      >
                        {statuses.map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>

                    {/* Date select */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Due Date</label>
                      <input
                        type="date"
                        value={selectedItem.propertyValues?.['prop-due'] || ''}
                        onChange={(e) => handlePropChange(selectedItem.id, 'prop-due', e.target.value)}
                        className="w-full bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-white/5 rounded-xl px-3 py-1.5 text-xs text-slate-700 dark:text-slate-200 outline-none focus:ring-1 focus:ring-pink-500/30"
                      />
                    </div>
                  </div>

                  {/* Tags manager */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Select Tags</label>
                    <div className="flex flex-wrap gap-1.5">
                      {tags.map(tag => {
                        const isChecked = (selectedItem.propertyValues?.['prop-tags'] || []).includes(tag);
                        return (
                          <button
                            key={tag}
                            onClick={() => handleTagToggle(selectedItem.id, tag)}
                            className={`text-[10px] px-2.5 py-1 rounded-xl font-medium border flex items-center gap-1 transition-all ${
                              isChecked 
                                ? `${getPastelColor(tag).bg} ${getPastelColor(tag).text} ring-1 ring-offset-1 ring-slate-300 dark:ring-slate-700`
                                : 'bg-slate-100 dark:bg-[#1E1E1E] border-slate-200 dark:border-white/5 text-slate-500 hover:bg-slate-200/80 dark:hover:bg-slate-700/80'
                            }`}
                          >
                            <span>{tag}</span>
                            {isChecked && <Check size={10} />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Sub-page Editor Block */}
                <div className="flex-1 overflow-y-auto bg-white dark:bg-[#181818]">
                  <Editor
                    page={selectedItem}
                    onChangePageTitle={onChangePageTitle}
                    onChangePageIcon={onChangePageIcon}
                    onUpdatePageBlocks={onUpdatePageBlocks}
                  />
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
