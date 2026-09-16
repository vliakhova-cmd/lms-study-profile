import { GeneratedSlide } from './types';

// Page-by-page content generated from the "ASCEND-RA Clinical Study
// Protocol" source document — a Phase 3 study of MDN-4102 in rheumatoid
// arthritis. Each entry is a direct, full-fidelity image capture of one
// page of the source PDF (pages 2–18; page 1 of the source file is the
// course-viewer chrome, not document content), preserving the original
// layout, tables, highlights, and photography exactly as authored.

import page2 from './assets/pdf-pages/page-2.png';
import page3 from './assets/pdf-pages/page-3.png';
import page4 from './assets/pdf-pages/page-4.png';
import page5 from './assets/pdf-pages/page-5.png';
import page6 from './assets/pdf-pages/page-6.png';
import page7 from './assets/pdf-pages/page-7.png';
import page8 from './assets/pdf-pages/page-8.png';
import page9 from './assets/pdf-pages/page-9.png';
import page10 from './assets/pdf-pages/page-10.png';
import page11 from './assets/pdf-pages/page-11.png';
import page12 from './assets/pdf-pages/page-12.png';
import page13 from './assets/pdf-pages/page-13.png';
import page14 from './assets/pdf-pages/page-14.png';
import page15 from './assets/pdf-pages/page-15.png';
import page16 from './assets/pdf-pages/page-16.png';
import page17 from './assets/pdf-pages/page-17.png';
import page18 from './assets/pdf-pages/page-18.png';

const HEADER_BG = '#1f2d3d';

export interface DocPage {
  id: string;
  number: number;
  header: string;
  src: string;
  width: number;
  height: number;
}

export const DOC_PAGES: DocPage[] = [
  { id: 'page-1', number: 1, header: 'Clinical Study Protocol', src: page2, width: 1600, height: 2339 },
  { id: 'page-2', number: 2, header: 'Protocol Amendment History', src: page3, width: 1600, height: 1027 },
  { id: 'page-3', number: 3, header: 'Table of Contents', src: page4, width: 1600, height: 1931 },
  { id: 'page-4', number: 4, header: '1. Protocol Synopsis', src: page5, width: 1600, height: 2124 },
  { id: 'page-5', number: 5, header: '2. Background and Rationale', src: page6, width: 1600, height: 1814 },
  { id: 'page-6', number: 6, header: '3. Study Objectives and Endpoints', src: page7, width: 1600, height: 1612 },
  { id: 'page-7', number: 7, header: '4. Study Design', src: page8, width: 1600, height: 2805 },
  { id: 'page-8', number: 8, header: '4.3 Schedule of Assessments (cont.)', src: page9, width: 1600, height: 900 },
  { id: 'page-9', number: 9, header: '5. Study Population', src: page10, width: 1600, height: 2411 },
  { id: 'page-10', number: 10, header: '6. Study Treatments', src: page11, width: 1600, height: 1447 },
  { id: 'page-11', number: 11, header: '7. Efficacy Assessments', src: page12, width: 1600, height: 902 },
  { id: 'page-12', number: 12, header: '8. Safety Assessments', src: page13, width: 1600, height: 1399 },
  { id: 'page-13', number: 13, header: '9. Statistical Considerations', src: page14, width: 1600, height: 1583 },
  { id: 'page-14', number: 14, header: '10. Ethical and Regulatory Considerations', src: page15, width: 1600, height: 900 },
  { id: 'page-15', number: 15, header: '11. Data Management and Quality Assurance', src: page16, width: 1600, height: 900 },
  { id: 'page-16', number: 16, header: '12. Study Administration', src: page17, width: 1600, height: 1814 },
  { id: 'page-17', number: 17, header: '13. References', src: page18, width: 1600, height: 1015 },
];

export const GENERATED_SLIDES: GeneratedSlide[] = DOC_PAGES.map(page => ({
  id: page.id,
  label: page.header,
  accent: HEADER_BG,
}));

export function SlideThumbnail({ slide }: { slide: GeneratedSlide; active: boolean }) {
  const page = DOC_PAGES.find(p => p.id === slide.id);
  if (!page) return null;
  return (
    <div style={{ width: '100%', height: '100%', overflow: 'hidden', backgroundColor: 'white' }}>
      <img
        src={page.src}
        alt={page.header}
        style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top', display: 'block' }}
      />
    </div>
  );
}

export function PageBlock({ page }: { page: DocPage }) {
  return (
    <div style={{ width: '100%', backgroundColor: 'white', border: '1px solid #e5e5e5', borderRadius: 8, overflow: 'hidden', boxShadow: '0px 1px 2px rgba(0,0,0,0.04)' }}>
      <img src={page.src} alt={page.header} style={{ width: '100%', height: 'auto', display: 'block' }} />
    </div>
  );
}
