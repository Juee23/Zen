/**
 * Types for the Zen Notion-like workspace application
 */

export interface PropertyDefinition {
  id: string;
  name: string;
  type: 'status' | 'multi-select' | 'date' | 'text';
  options?: string[]; // options for status or multi-select
}

export interface DatabaseConfig {
  properties: PropertyDefinition[];
  activeView: 'table' | 'board' | 'list';
  filters: {
    propertyId: string;
    operator: 'is' | 'contains' | 'is-empty' | 'is-not-empty';
    value: string;
  }[];
}

export interface Page {
  id: string;
  title: string;
  icon: string; // Emoji
  parentId: string | null;
  isFavorite: boolean;
  isDatabase: boolean;
  databaseConfig?: DatabaseConfig;
  propertyValues?: Record<string, any>; // key: propertyId, value: custom value
  blocks: Block[];
  createdAt: number;
  updatedAt: number;
}

export type BlockType =
  | 'text'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'todo'
  | 'bullet'
  | 'number'
  | 'code'
  | 'callout'
  | 'divider'
  | 'quote';

export interface Block {
  id: string;
  type: BlockType;
  content: string; // Markdown text content
  checked?: boolean; // For todo block
  language?: string; // For code block
  icon?: string; // For callout block
}

export interface WorkspaceState {
  pages: Page[];
  activePageId: string | null;
  searchQuery: string;
  isSearchOpen: boolean;
  darkMode: boolean;
  recentPageIds: string[];
}
