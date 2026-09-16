export type ContentKind = 'document' | 'video' | 'assessment';
export type ContentStatus = 'approved' | 'draft';

export interface ContentRow {
  id: string;
  name: string;
  kind: ContentKind;
  status: ContentStatus;
  version: string;
  contentDate: string;
  effectiveDate: string;
  type: string;
  assignedCourses: number;
}

export const CONTENT_ROWS: ContentRow[] = [
  { id: 'c1', name: 'ASCEND-RA Clinical Study Protocol', kind: 'document', status: 'approved', version: '1.0', contentDate: '2 Jan 2027', effectiveDate: '2 Jan 2027', type: 'GL (Application/doc)', assignedCourses: 2 },
  { id: 'c2', name: 'Protocol Training — Study ABC-2024 v2.0', kind: 'document', status: 'approved', version: '1.0', contentDate: '21 Jan 2026', effectiveDate: '21 Jan 2026', type: 'GL (Application/doc)', assignedCourses: 1 },
  { id: 'c3', name: 'Informed Consent Process and Procedures', kind: 'video', status: 'approved', version: '1.0', contentDate: '31 Dec 2026', effectiveDate: '31 Dec 2026', type: 'GL (Application/doc)', assignedCourses: 3 },
  { id: 'c4', name: 'Adverse Event and SAE Reporting', kind: 'document', status: 'approved', version: '2.0', contentDate: '3 Jan 2026', effectiveDate: '3 Jan 2026', type: 'CMS (Application/pdf)', assignedCourses: 2 },
  { id: 'c5', name: 'Investigational Product Handling and Storage', kind: 'video', status: 'draft', version: '1.0', contentDate: '24 Dec 2026', effectiveDate: '24 Dec 2026', type: 'CMS (Application/pdf)', assignedCourses: 4 },
  { id: 'c6', name: 'Electronic Data Capture (EDC) System Training', kind: 'document', status: 'approved', version: '1.0', contentDate: '9 Dec 2026', effectiveDate: '9 Dec 2026', type: 'GL (Application/doc)', assignedCourses: 2 },
  { id: 'c7', name: 'Clinical Site Inspection Readiness', kind: 'document', status: 'approved', version: '2.0', contentDate: '8 Jun 2026', effectiveDate: '8 Jun 2026', type: 'GL (Application/doc)', assignedCourses: 5 },
  { id: 'c8', name: 'ICH E6(R2) GCP Refresher Training', kind: 'assessment', status: 'approved', version: '3.0', contentDate: '11 Sep 2026', effectiveDate: '11 Sep 2026', type: 'CMS (Application/pdf)', assignedCourses: 2 },
];
