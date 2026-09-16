import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGraduationCap, faCircleInfo } from '@fortawesome/free-solid-svg-icons';
import { COURSES, StatusTone, CourseRow, TOTAL_ITEMS, PAGE_SIZE, TOTAL_PAGES } from './coursesData';
import { Checkbox, HEAD, CELL, SortableHeader, Pagination, TableSurface } from './tableKit';
import { color, type, table as t, status as st, icon } from './tokens';

// Adapted from doa-log/src/DocumentGrid.tsx: same Checkbox/Status/table-cell
// tokens and pagination shape, retargeted to the Training Plans columns
// (Course Name / Status / Version / Enrollment Type / Due Date / Completion
// Date) instead of the eTMF document grid's columns.

const STATUS_TONE: Record<StatusTone, string> = {
  pendingEnrollment: color.statusSolidPurple,
  // Coral/red, not the pink — reads as distinct from Pending Enrollment's
  // purple, whereas pink sat too close to it in the same lightness band.
  notStarted: color.statusSolidRed,
  inProgress: color.statusOrange,
  na: color.statusSolidGrey,
  completed: color.statusSolidGreen,
};

function Status({ label, tone = 'inProgress' }: { label: string; tone?: StatusTone }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: st.gap,
        maxWidth: st.labelMaxWidth,
        padding: `0 ${st.paddingX}px`,
        borderRadius: st.radius,
        backgroundColor: STATUS_TONE[tone],
        color: color.text,
        ...type.status,
        textTransform: 'uppercase',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
      {tone === 'na' && <FontAwesomeIcon icon={faCircleInfo} style={{ width: 11, height: 11, color: color.textMuted }} />}
    </span>
  );
}

function Row({ row, checked, onCheck }: { row: CourseRow; checked: boolean; onCheck: (v: boolean) => void }) {
  const [hover, setHover] = useState(false);
  const bg = checked ? color.cellSelectedBg : hover ? color.cellHoverBg : 'transparent';
  return (
    <tr
      aria-selected={checked}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ backgroundColor: bg, transition: 'background-color 100ms' }}
    >
      <td style={{ ...CELL, width: t.colCheckbox, minWidth: t.colCheckbox, paddingLeft: 10, paddingRight: 5 }}>
        <Checkbox checked={checked} onChange={onCheck} />
      </td>

      <td style={{ ...CELL, maxWidth: 220 }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: t.gap, minWidth: 0 }}>
          <FontAwesomeIcon icon={faGraduationCap} style={{ width: icon.s, height: icon.s, color: color.informational, flexShrink: 0 }} />
          <a
            href="#"
            onClick={e => e.preventDefault()}
            title={row.name}
            style={{ ...type.link, color: color.primary, textDecoration: 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
          >
            {row.name}
          </a>
        </span>
      </td>

      <td style={CELL}>{row.status && <Status label={row.status} tone={row.statusTone} />}</td>

      <td style={{ ...CELL, maxWidth: 70 }}>{row.version}</td>

      <td style={{ ...CELL, maxWidth: 220, whiteSpace: 'normal' }}>
        <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 2 }}>
          <span style={{ ...type.bodySemibold, color: color.text }}>{row.enrollmentType}</span>
          {row.enrollmentDetail && <span style={{ ...type.captionRegular, color: color.cellAdditionalText }}>{row.enrollmentDetail}</span>}
        </span>
      </td>

      <td style={CELL}>{row.dueDate}</td>
      <td style={CELL}>{row.completionDate ?? ''}</td>
    </tr>
  );
}

export function CourseTable({ onSelectionChange }: { onSelectionChange?: (n: number) => void }) {
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [pageNum, setPageNum] = useState(1);

  const allChecked = selected.size === COURSES.length;

  const commit = (next: Set<number>) => {
    setSelected(next);
    onSelectionChange?.(next.size);
  };

  const toggleAll = (v: boolean) => commit(v ? new Set(COURSES.map(c => c.id)) : new Set());
  const toggleOne = (id: number, v: boolean) => {
    const next = new Set(selected);
    if (v) next.add(id);
    else next.delete(id);
    commit(next);
  };

  return (
    <TableSurface>
      <div style={{ flex: '1 0 0', minHeight: 0, overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'auto' }}>
          <thead style={{ position: 'sticky', top: 0, zIndex: 1 }}>
            <tr>
              <th style={{ ...HEAD, width: t.colCheckbox, minWidth: t.colCheckbox, paddingLeft: 10, paddingRight: 5 }}>
                <Checkbox checked={allChecked} onChange={toggleAll} />
              </th>
              <SortableHeader>Course Name</SortableHeader>
              <th style={HEAD}>Status</th>
              <th style={HEAD}>Version</th>
              <th style={HEAD}>Enrollment Type</th>
              <th style={HEAD}>Due Date</th>
              <th style={HEAD}>Completion Date</th>
            </tr>
          </thead>
          <tbody>
            {COURSES.map(row => (
              <Row key={row.id} row={row} checked={selected.has(row.id)} onCheck={v => toggleOne(row.id, v)} />
            ))}
          </tbody>
        </table>
      </div>

      <Pagination page={pageNum} totalPages={TOTAL_PAGES} pageSize={PAGE_SIZE} totalItems={TOTAL_ITEMS} onPage={setPageNum} />
    </TableSurface>
  );
}

export default CourseTable;
