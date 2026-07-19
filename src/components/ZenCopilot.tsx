import React, { useState, useRef, useEffect } from 'react';
import { Page, Block } from '../types';
import { createId } from '../initialData';
import { Sparkles, Send, X, Copy, Check, Plus, RefreshCw, Compass, BookOpen, Quote, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ZenCopilotProps {
  isOpen: boolean;
  onClose: () => void;
  activePage: Page | null;
  onUpdatePageBlocks: (id: string, blocks: Block[]) => void;
}

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  isStreaming?: boolean;
}

export default function ZenCopilot({ isOpen, onClose, activePage, onUpdatePageBlocks }: ZenCopilotProps) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: "Welcome to **Zen Copilot** 🧘✨. I'm your mindful workspace companion. How can I assist you with your thoughts or tasks today?"
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [insertedId, setInsertedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to the bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Preset prompts
  const PRESETS = [
    { label: "✨ Refine current draft", prompt: "Could you review my current open document, refine its flow, fix grammar, and make it sound more balanced and articulate?" },
    { label: "🧘 Draft a mindfulness prompt", prompt: "Give me 3 mindful writing or reflection prompts to help clear mental blocks and align my goals today." },
    { label: "💡 Workspace brainstorm", prompt: "Give me a structured checklist and inspiration ideas for setting up a creative personal project tracker." },
    { label: "🌸 Generate Daily Affirmations", prompt: "Create 3 soothing, empowering positive affirmations for today based on clarity and calm focus." }
  ];

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    // Add user message
    const userMessageId = createId();
    const assistantMessageId = createId();
    
    setMessages(prev => [
      ...prev,
      { id: userMessageId, sender: 'user', text: textToSend }
    ]);
    setInput('');
    setIsLoading(true);

    // Prepare system instruction and context
    let systemInstruction = "You are Zen, a calm, deeply supportive, and articulate AI writing partner and workspace companion. Keep your tone gentle, focused, and organized. Use beautiful typography pairings like lists, blockquotes, and bold headings to make responses easy to digest. Always keep instructions practical.";
    
    let promptText = textToSend;
    if (activePage) {
      // Expose the document context to the model
      const docContext = activePage.blocks.map(b => `[${b.type}]: ${b.content}`).join('\n');
      promptText = `Context - Open Document "${activePage.title}":\n${docContext}\n\nUser Question/Instruction:\n${textToSend}`;
    }

    try {
      // Add a streaming placeholder message
      setMessages(prev => [
        ...prev,
        { id: assistantMessageId, sender: 'assistant', text: '', isStreaming: true }
      ]);

      const response = await fetch('/api/ai/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: promptText,
          systemInstruction
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Connection failed');
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Streaming is not supported by your browser.');
      }

      const decoder = new TextDecoder();
      let done = false;
      let accumulatedText = '';

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        if (value) {
          const chunk = decoder.decode(value, { stream: !done });
          accumulatedText += chunk;
          
          setMessages(prev => 
            prev.map(msg => 
              msg.id === assistantMessageId 
                ? { ...msg, text: accumulatedText }
                : msg
            )
          );
        }
      }

      // Mark streaming as completed
      setMessages(prev => 
        prev.map(msg => 
          msg.id === assistantMessageId 
            ? { ...msg, isStreaming: false }
            : msg
        )
      );

    } catch (err: any) {
      console.error(err);
      setMessages(prev => 
        prev.map(msg => 
          msg.id === assistantMessageId 
            ? { 
                ...msg, 
                text: `⚠️ **AI Error:** ${err.message || 'Could not connect to the Zen server.'}\n\n*Please ensure you have configured your **GEMINI_API_KEY** in the Settings / Secrets tab.*`, 
                isStreaming: false 
              }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, msgId: string) => {
    // Strip markdown bold and header notations before copy for cleaner experience
    const cleanText = text.replace(/\*\*|###|##|#/g, '');
    navigator.clipboard.writeText(cleanText);
    setCopiedId(msgId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleInsertIntoDocument = (text: string, msgId: string) => {
    if (!activePage) return;

    // Create a new block from the response
    const newBlock: Block = {
      id: createId(),
      type: 'callout',
      content: text.replace(/\*\*|###|##|#/g, '').trim(),
      icon: '✨'
    };

    const updatedBlocks = [...activePage.blocks, newBlock];
    onUpdatePageBlocks(activePage.id, updatedBlocks);
    
    setInsertedId(msgId);
    setTimeout(() => setInsertedId(null), 2000);
  };

  // Safe renderer to turn markdown into styled spans
  const renderMessageContent = (text: string) => {
    if (!text) return <span className="inline-block w-2.5 h-4 bg-purple-400 animate-pulse rounded-sm" />;

    const lines = text.split('\n');
    return (
      <div className="space-y-2 text-slate-700 dark:text-slate-300">
        {lines.map((line, idx) => {
          const trimmed = line.trim();
          
          // Check for headers
          if (trimmed.startsWith('###')) {
            return (
              <h4 key={idx} className="text-sm font-bold text-pink-500 dark:text-pink-300 mt-3 mb-1 font-sans">
                {trimmed.replace('###', '').trim()}
              </h4>
            );
          }
          if (trimmed.startsWith('##')) {
            return (
              <h3 key={idx} className="text-base font-bold text-purple-500 dark:text-purple-300 mt-4 mb-1.5 font-sans">
                {trimmed.replace('##', '').trim()}
              </h3>
            );
          }
          if (trimmed.startsWith('#')) {
            return (
              <h2 key={idx} className="text-lg font-bold text-indigo-500 dark:text-indigo-400 mt-4 mb-2 font-sans">
                {trimmed.replace('#', '').trim()}
              </h2>
            );
          }

          // Check for bullets
          if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
            const cleanContent = trimmed.substring(2);
            return (
              <ul key={idx} className="list-disc pl-5 my-1">
                <li className="text-xs md:text-sm">{parseBold(cleanContent)}</li>
              </ul>
            );
          }

          // Check for blockquote
          if (trimmed.startsWith('>')) {
            return (
              <blockquote key={idx} className="border-l-2 border-pink-400/50 pl-3 py-0.5 my-2 text-xs italic text-slate-500 dark:text-slate-400 bg-slate-500/5 rounded-r">
                {parseBold(trimmed.substring(1))}
              </blockquote>
            );
          }

          if (trimmed === '') return <div key={idx} className="h-2" />;

          return <p key={idx} className="text-xs md:text-sm leading-relaxed">{parseBold(line)}</p>;
        })}
      </div>
    );
  };

  const parseBold = (str: string) => {
    const parts = str.split(/\*\*(.*?)\*\*/g);
    return parts.map((part, i) => i % 2 === 1 ? <strong key={i} className="font-bold text-slate-900 dark:text-white">{part}</strong> : part);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay for mobile view only */}
          <div 
            className="fixed inset-0 bg-black/20 backdrop-blur-xs z-40 lg:hidden" 
            onClick={onClose}
          />

          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-[420px] bg-white dark:bg-[#111112] border-l border-slate-200/50 dark:border-white/5 shadow-2xl z-50 flex flex-col"
            id="zen-copilot-container"
          >
            {/* Header */}
            <div className="h-14 border-b border-slate-200/50 dark:border-white/5 px-4 flex items-center justify-between bg-slate-50/50 dark:bg-white/[0.01]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-pink-500 via-purple-500 to-indigo-500 flex items-center justify-center shadow-md">
                  <Sparkles size={14} className="text-white" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-sm text-slate-900 dark:text-white">Zen Copilot</h3>
                  <p className="text-[10px] text-slate-400 font-medium">YOUR AI MINDFUL COMPANION</p>
                </div>
              </div>

              <button 
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 transition-all cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>

            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div className="space-y-4">
                {messages.map((msg) => (
                  <div 
                    key={msg.id} 
                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm shadow-xs border ${
                      msg.sender === 'user' 
                        ? 'bg-gradient-to-br from-purple-500 to-indigo-500 border-indigo-500 text-white' 
                        : 'bg-slate-50 dark:bg-white/[0.02] border-slate-200/50 dark:border-white/5'
                    }`}>
                      {msg.sender === 'assistant' ? (
                        <div>
                          {renderMessageContent(msg.text)}
                          
                          {/* Options toolbar for AI responses */}
                          {!msg.isStreaming && msg.id !== 'welcome' && (
                            <div className="flex items-center gap-2 mt-3 pt-2.5 border-t border-slate-200/30 dark:border-white/5 text-[11px] text-slate-400">
                              <button
                                onClick={() => copyToClipboard(msg.text, msg.id)}
                                className="flex items-center gap-1 hover:text-pink-500 dark:hover:text-pink-300 transition-colors cursor-pointer"
                              >
                                {copiedId === msg.id ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                                <span>{copiedId === msg.id ? 'Copied' : 'Copy'}</span>
                              </button>

                              {activePage && (
                                <>
                                  <span className="text-slate-300 dark:text-white/10">•</span>
                                  <button
                                    onClick={() => handleInsertIntoDocument(msg.text, msg.id)}
                                    className="flex items-center gap-1 hover:text-pink-500 dark:hover:text-pink-300 transition-colors cursor-pointer"
                                  >
                                    {insertedId === msg.id ? <Check size={11} className="text-emerald-400" /> : <Plus size={11} />}
                                    <span>{insertedId === msg.id ? 'Inserted' : 'Insert to draft'}</span>
                                  </button>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="leading-relaxed text-xs md:text-sm">{msg.text}</p>
                      )}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-slate-50 dark:bg-white/[0.02] border border-slate-200/50 dark:border-white/5 rounded-2xl px-4 py-3 flex items-center gap-2 text-xs text-slate-400">
                      <RefreshCw size={12} className="animate-spin text-purple-400" />
                      <span>Zen is reflecting...</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Suggestions / Presets */}
              {messages.length === 1 && (
                <div className="space-y-2 pt-4">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1">Mindful Suggestions</p>
                  <div className="grid grid-cols-1 gap-2">
                    {PRESETS.map((preset, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSend(preset.prompt)}
                        className="text-left p-3 text-xs rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-white/[0.02] dark:hover:bg-white/[0.05] border border-slate-200/40 dark:border-white/5 transition-all text-slate-600 dark:text-slate-300 hover:border-pink-500/20 dark:hover:border-pink-500/20 cursor-pointer"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Input bar */}
            <div className="p-3 border-t border-slate-200/50 dark:border-white/5 bg-slate-50/50 dark:bg-[#111112]">
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend(input);
                }}
                className="relative flex items-center"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={activePage ? `Refine "${activePage.title}" with Zen...` : "Ask Zen anything..."}
                  className="w-full pl-3.5 pr-10 py-2 text-xs bg-white dark:bg-[#1a1a1c] border border-slate-200 dark:border-white/5 rounded-xl outline-none focus:border-purple-400 dark:focus:border-purple-400/50 text-slate-800 dark:text-white transition-all shadow-inner"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className={`absolute right-1.5 p-1.5 rounded-lg transition-all ${
                    input.trim() && !isLoading 
                      ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white cursor-pointer hover:shadow-md' 
                      : 'text-slate-300 dark:text-slate-600 cursor-not-allowed'
                  }`}
                >
                  <Send size={11} />
                </button>
              </form>
              <p className="text-[9px] text-center text-slate-400/70 mt-1.5 font-medium">
                Zen leverages server-side Gemini 3.5 LLM with secure streaming.
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
