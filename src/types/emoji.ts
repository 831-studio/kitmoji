export interface Emoji {
  id: number;
  emoji: string;
  name: string;
  keywords: string;
  category: string;
  unicode: string;
  created_at?: string;
  updated_at?: string;
}

export interface EmojiResponse {
  emojis: Emoji[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SearchFilters {
  search: string;
  category: string;
}