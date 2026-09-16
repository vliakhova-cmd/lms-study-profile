export type StatusTone = 'pendingEnrollment' | 'notStarted' | 'inProgress' | 'na' | 'completed';

export interface CourseRow {
  id: number;
  name: string;
  status?: string;
  statusTone?: StatusTone;
  version: string;
  enrollmentType: string;
  enrollmentDetail?: string;
  dueDate: string;
  completionDate?: string;
}

// Rows read off the "Training Plans" table for Alexandria Sosa → Courses.
export const COURSES: CourseRow[] = [
  {
    id: 1,
    name: 'USA TMTT 2025 Refresher',
    status: 'Pending Enrollment',
    statusTone: 'pendingEnrollment',
    version: '5.0',
    enrollmentType: 'Site',
    enrollmentDetail: 'PI • Arizona Cardiology',
    dueDate: '14 Oct 2025',
  },
  {
    id: 2,
    name: 'USA TMTT 2024 Overview',
    status: 'Not Started',
    statusTone: 'notStarted',
    version: '2.0',
    enrollmentType: 'Training Group',
    enrollmentDetail: 'Managers Group',
    dueDate: '24 Jul 2025',
  },
  {
    id: 3,
    name: 'USA SURG 2025 Basics',
    status: 'Not Started',
    statusTone: 'notStarted',
    version: '1.0',
    enrollmentType: 'Site',
    enrollmentDetail: 'PI • Arizona Cardiology',
    dueDate: '14 Oct 2025',
  },
  {
    id: 4,
    name: 'TMTT-CLASP IID Protocol',
    status: 'Not Started',
    statusTone: 'notStarted',
    version: '2.0',
    enrollmentType: 'Direct Enrollment',
    dueDate: '25 Sep 2025',
  },
  {
    id: 5,
    name: 'RAVE Training Module',
    status: 'In Progress',
    statusTone: 'inProgress',
    version: '1.0',
    enrollmentType: 'Site',
    enrollmentDetail: 'PI • Cincinnati Children’s',
    dueDate: '07 May 2025',
  },
  {
    id: 6,
    name: 'Modified Randomization',
    status: 'In Progress',
    statusTone: 'inProgress',
    version: '1.0',
    enrollmentType: 'Site',
    enrollmentDetail: 'PI • Heart Center',
    dueDate: '18 Feb 2025',
  },
  {
    id: 7,
    name: 'USA SURG 2025 Advanced',
    status: 'N/A',
    statusTone: 'na',
    version: '2.0',
    enrollmentType: 'Site',
    enrollmentDetail: 'PI • Montefiore',
    dueDate: '19 Aug 2025',
  },
  {
    id: 8,
    name: 'CLASP IID Protocol Deep Dive',
    status: 'In Progress',
    statusTone: 'inProgress',
    version: '2.0',
    enrollmentType: 'Site',
    enrollmentDetail: 'PI • Heart Center',
    dueDate: '07 May 2025',
  },
  {
    id: 9,
    name: 'Reminder T59 Safety Update',
    status: 'In Progress',
    statusTone: 'inProgress',
    version: '2.0',
    enrollmentType: 'Site',
    enrollmentDetail: 'PI • Cincinnati Children’s',
    dueDate: '19 Aug 2025',
  },
  {
    id: 10,
    name: 'USA TMTT 2024 Certification',
    status: 'Completed',
    statusTone: 'completed',
    version: '1.0',
    enrollmentType: 'Site',
    enrollmentDetail: 'PI • Ascension Texas',
    dueDate: '04 Nov 2025',
    completionDate: '04 Nov 2024',
  },
];

export const COURSE_COUNT = 15;
export const TOTAL_ITEMS = 20;
export const PAGE_SIZE = 10;
export const TOTAL_PAGES = 2;
