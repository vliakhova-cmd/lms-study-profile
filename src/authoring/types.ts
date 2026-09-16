export type LessonType = 'document' | 'video' | 'analysis' | 'assessment';

export type FlowStage = 'compose' | 'thinking' | 'result' | 'saving';

export type RightPanelTab = 'edit' | 'settings';

export interface ChatMessage {
  id: string;
  from: 'user' | 'ai';
  text: string;
  timestamp: string;
}

export interface GeneratedSlide {
  id: string;
  label: string;
  accent: string;
}
