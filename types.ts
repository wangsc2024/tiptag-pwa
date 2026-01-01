export interface Document {
  id: string;
  title: string;
  content: string; // HTML string
  updatedAt: number;
}

export enum AISuggestionType {
  FIX_GRAMMAR = 'Fix Grammar',
  SUMMARIZE = 'Summarize',
  EXPAND = 'Continue Writing',
  REPHRASE = 'Rephrase',
  GENERATE_IDEAS = 'Generate Ideas'
}
