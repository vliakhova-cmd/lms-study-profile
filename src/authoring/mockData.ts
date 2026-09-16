import { LessonType } from './types';

export const DEFAULT_SOURCE_DOC = 'ASCEND-RA Clinical Study Protocol';

export const LANGUAGES = ['English', 'Spanish', 'French', 'German'];

export interface LessonTypeDef {
  id: LessonType;
  label: string;
  color: string;
  bg: string;
  border: string;
}

export const LESSON_TYPES: LessonTypeDef[] = [
  { id: 'document', label: 'Document Into Lesson', color: '#25861E', bg: 'rgba(37,134,30,0.1)', border: 'rgba(37,134,30,0.5)' },
  { id: 'video', label: 'Video Lesson', color: '#7349AA', bg: 'rgba(115,73,170,0.1)', border: 'rgba(115,73,170,0.5)' },
  { id: 'analysis', label: 'Analysis', color: '#1972AA', bg: 'rgba(25,114,170,0.1)', border: 'rgba(25,114,170,0.5)' },
  { id: 'assessment', label: 'Assessment', color: '#B451A2', bg: 'rgba(180,81,162,0.1)', border: 'rgba(180,81,162,0.5)' },
];

export const AI_INTRO_RESPONSE =
  "I can see the selected source document. I've pulled in the exact pages from the ASCEND-RA protocol — 17 pages, reproduced as-is with the original layout, tables, and images — from the cover and protocol synopsis through study design, population, treatments, and the full reference list.";

export const AI_FOLLOWUP_RESPONSES = [
  "Got it — I've reworked that section to reflect your note. Take a look at the updated slide on the left.",
  "Done. I adjusted the wording and kept the key figures intact so the protocol details stay accurate.",
  "Updated the slide accordingly. Let me know if you'd like a different tone or more detail anywhere.",
];
