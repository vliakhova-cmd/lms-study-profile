// The course produced by "Save as Draft" — name, description, and activities
// are all derived from the ASCEND-RA source document (see
// GeneratedSlideContent.tsx), not generic placeholder copy.

export interface CourseActivity {
  id: string;
  name: string;
  subtitle?: string;
  icon: 'document' | 'quiz' | 'pdf';
  required: boolean;
}

export interface SavedCourse {
  title: string;
  status: 'DRAFT';
  courseType: string;
  version: string;
  catalogCount: number;
  description: string;
  userCount: number;
  activities: CourseActivity[];
}

export const SAVED_COURSE: SavedCourse = {
  title: 'ASCEND-RA Clinical Study Protocol',
  status: 'DRAFT',
  courseType: 'Standard',
  version: '1.0',
  catalogCount: 1,
  description:
    'A Phase 3, randomized, double-blind, placebo-controlled study evaluating the efficacy and safety of MDN-4102 in adult subjects with moderate-to-severe active rheumatoid arthritis. Covers the protocol synopsis, background and rationale, study design, population, treatments, and safety monitoring across all 17 source pages.',
  userCount: 0,
  activities: [
    {
      id: 'a1',
      name: 'ASCEND-RA Clinical Study Protocol',
      subtitle: '17-page interactive document',
      icon: 'document',
      required: true,
    },
    {
      id: 'a2',
      name: 'ASCEND-RA Clinical Study Protocol (Source PDF)',
      subtitle: 'Original uploaded protocol document',
      icon: 'pdf',
      required: true,
    },
  ],
};
