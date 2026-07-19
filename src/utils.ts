/**
 * General utility functions for Zen application
 */

export function parseMarkdown(text: string): string {
  if (!text) return '&nbsp;';
  
  // Escape HTML to prevent XSS (allowing basic styling)
  let html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
    
  // Bold **text**
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-gray-900 dark:text-white">$1</strong>');
  
  // Italic *text* or _text_
  html = html.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>');
  
  // Inline code `code`
  html = html.replace(/`(.*?)`/g, '<code class="px-1.5 py-0.5 bg-black/10 dark:bg-white/10 rounded text-xs font-mono border border-black/5 dark:border-white/5 text-pink-500 dark:text-pink-300">$1</code>');
  
  return html;
}

/**
 * Available emojis for pages
 */
export const PAGE_EMOJIS = [
  '🌸', '📝', '📓', '🗺️', '🏡', '💡', '🚀', '✨', '🎯', '🥑', 
  '📊', '📚', '💬', '☕', '🛠️', '🌿', '🧠', '🧩', '🎨', '✈️'
];

/**
 * Theme colors mapping for pastel tags
 */
export const PASTEL_COLORS = {
  pink: {
    bg: 'bg-pink-100 dark:bg-pink-950/40 border border-pink-200 dark:border-pink-900/30',
    text: 'text-pink-700 dark:text-pink-300',
    bullet: 'bg-pink-400 dark:bg-pink-300'
  },
  blue: {
    bg: 'bg-blue-100 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/30',
    text: 'text-blue-700 dark:text-blue-300',
    bullet: 'bg-blue-400 dark:bg-blue-300'
  },
  purple: {
    bg: 'bg-purple-100 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900/30',
    text: 'text-purple-700 dark:text-purple-300',
    bullet: 'bg-purple-400 dark:bg-purple-300'
  },
  mint: {
    bg: 'bg-emerald-100 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/30',
    text: 'text-emerald-700 dark:text-emerald-300',
    bullet: 'bg-emerald-400 dark:bg-emerald-300'
  },
  yellow: {
    bg: 'bg-amber-100 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/30',
    text: 'text-amber-700 dark:text-amber-300',
    bullet: 'bg-amber-400 dark:bg-amber-300'
  },
  orange: {
    bg: 'bg-orange-100 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-900/30',
    text: 'text-orange-700 dark:text-orange-300',
    bullet: 'bg-orange-400 dark:bg-orange-300'
  }
};

export type PastelColorKey = keyof typeof PASTEL_COLORS;

export const getPastelColor = (val: string): { bg: string; text: string; bullet: string } => {
  const keys = Object.keys(PASTEL_COLORS) as PastelColorKey[];
  // Generate stable index based on value string
  let hash = 0;
  for (let i = 0; i < val.length; i++) {
    hash = val.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % keys.length;
  return PASTEL_COLORS[keys[index]];
};
