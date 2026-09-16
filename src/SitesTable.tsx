import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHospital, faUser, faUsers, faGraduationCap, faBookOpen, faCircleExclamation } from '@fortawesome/free-solid-svg-icons';
import { SITES, SiteRow, SiteStatus, TOTAL_ITEMS, PAGE_SIZE, TOTAL_PAGES } from './sitesData';
import { notEnrolledAtSite } from './doaData';
import {
  Checkbox,
  PartialCheckbox,
  HEAD,
  CELL,
  SortableHeader,
  Chip,
  CellLink,
  RowActionsButton,
  FavoriteStar,
  Pagination,
  TableSurface,
} from './tableKit';
import { color, type, table as t, status as st, progressBar as pb, icon } from './tokens';

// Sites listing. The Site Name column is preceded by three narrow icon
// columns — entity glyph, row actions, favourite — exactly as doa-log's
// document grid lays them out; the site's number lives inside its name
// ("0982 - Miles, H") rather than in a column of its own.

const STATUS_TONE: Record<SiteStatus, string> = {
  pending: color.statusOrange,
  ready: color.statusSolidGreen,
  active: color.statusSolidBlue,
};

function Status({ label, tone }: { label: string; tone: SiteStatus }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
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
    </span>
  );
}

/** progress-bar/small — the percentage sits above its bar, as the frame shows. */
function TrainingProgress({ percent, notEnrolled }: { percent?: number; notEnrolled: number }) {
  if (percent == null) return null;
  return (
    <span style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 90 }}>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
        <span style={{ ...type.captionRegular, color: color.text }}>{percent}%</span>
        {/* Which site to chase. The percentage is of people who HAVE the
            courses, so it cannot fall because of someone nobody enrolled —
            the count says how many that is. */}
        {notEnrolled > 0 && (
          <span
            title={`${notEnrolled} ${notEnrolled === 1 ? 'person carries a delegated task' : 'people carry a delegated task'} here with no enrolment in its course`}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 3, ...type.captionSemibold, color: color.critical }}
          >
            <FontAwesomeIcon icon={faCircleExclamation} style={{ width: icon.xs, height: icon.xs }} />
            {notEnrolled}
          </span>
        )}
      </span>
      <span style={{ height: pb.height, borderRadius: pb.radius, backgroundColor: color.progressTrack, overflow: 'hidden' }}>
        <span style={{ display: 'block', width: `${percent}%`, height: '100%', borderRadius: pb.radius, backgroundColor: color.confirmation }} />
      </span>
    </span>
  );
}

function Row({ row, checked, onCheck, onOpen }: { row: SiteRow; checked: boolean; onCheck: (v: boolean) => void; onOpen?: (row: SiteRow) => void }) {
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

      {/* The entity glyph is its own column, not a prefix inside the name */}
      <td style={{ ...CELL, width: t.colEntity, minWidth: t.colEntity, paddingLeft: 5, paddingRight: 5, textAlign: 'center' }}>
        <FontAwesomeIcon icon={faHospital} style={{ width: icon.m, height: icon.m, color: color.primary }} />
      </td>

      <td style={{ ...CELL, width: t.colMoreButton, minWidth: t.colMoreButton, paddingLeft: 5, paddingRight: 5 }}>
        <RowActionsButton />
      </td>

      <td style={{ ...CELL, width: t.colFavorite, minWidth: t.colFavorite, paddingLeft: 5, paddingRight: 5, textAlign: 'center' }}>
        <FavoriteStar />
      </td>

      {/* The site name is the way into that site's own profile. */}
      <td style={{ ...CELL, maxWidth: 260 }}>
        <CellLink label={row.name} onClick={() => onOpen?.(row)} />
      </td>

      <td style={CELL}>
        <Status label={row.status} tone={row.statusTone} />
      </td>

      <td style={{ ...CELL, maxWidth: 200 }}>
        {/* A count of coordinators is just the number — the person glyph would
            repeat what the column already says. */}
        {row.coordinator ? <CellLink glyph={faUser} label={row.coordinator} /> : <Chip label={row.coordinatorCount ?? 0} theme="info" />}
      </td>

      <td style={CELL}>
        <Chip glyph={faUsers} label={row.personnel} theme="info" />
      </td>

      <td style={{ ...CELL, minWidth: 120 }}>
        <TrainingProgress percent={row.trainingProgress} notEnrolled={notEnrolledAtSite(row.name)} />
      </td>

      <td style={CELL}>
        <Chip glyph={faGraduationCap} label={row.courses} theme="info" />
      </td>

      <td style={CELL}>{row.learningPlans != null && <Chip glyph={faBookOpen} label={row.learningPlans} theme="info" />}</td>
    </tr>
  );
}

export function SitesTable({ onSelectionChange, onOpenSite }: { onSelectionChange?: (n: number) => void; /** Clicking a site name drills into its profile. */ onOpenSite?: (row: SiteRow) => void }) {
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [page, setPage] = useState(1);

  const allChecked = selected.size === SITES.length;
  const someChecked = selected.size > 0 && !allChecked;

  const commit = (next: Set<number>) => {
    setSelected(next);
    onSelectionChange?.(next.size);
  };

  const toggleAll = (v: boolean) => commit(v ? new Set(SITES.map(s => s.id)) : new Set());
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
                {someChecked ? <PartialCheckbox onChange={toggleAll} /> : <Checkbox checked={allChecked} onChange={toggleAll} />}
              </th>
              {/* The three icon columns carry no header label */}
              <th style={{ ...HEAD, width: t.colEntity, minWidth: t.colEntity, paddingLeft: 5, paddingRight: 5 }} />
              <th style={{ ...HEAD, width: t.colMoreButton, minWidth: t.colMoreButton, paddingLeft: 5, paddingRight: 5 }} />
              <th style={{ ...HEAD, width: t.colFavorite, minWidth: t.colFavorite, paddingLeft: 5, paddingRight: 5 }} />
              <SortableHeader>Site Name</SortableHeader>
              <th style={HEAD}>Site Status</th>
              <th style={HEAD}>Site Coordinator</th>
              <th style={HEAD}>Site Personnel</th>
              <th style={HEAD}>Training Progress</th>
              <th style={HEAD}>Courses</th>
              <th style={HEAD}>Learning Plans</th>
            </tr>
          </thead>
          <tbody>
            {SITES.map(row => (
              <Row key={row.id} row={row} checked={selected.has(row.id)} onCheck={v => toggleOne(row.id, v)} onOpen={onOpenSite} />
            ))}
          </tbody>
        </table>
      </div>

      <Pagination page={page} totalPages={TOTAL_PAGES} pageSize={PAGE_SIZE} totalItems={TOTAL_ITEMS} onPage={setPage} />
    </TableSurface>
  );
}

export default SitesTable;
