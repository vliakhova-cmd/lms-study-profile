import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGraduationCap, faBookOpen, faBuilding, faAddressCard, faUser, faUsers, faFileContract, faWandMagicSparkles } from '@fortawesome/free-solid-svg-icons';
import {
  LIBRARY_COURSES,
  LEARNING_PLANS,
  LibraryItem,
  LibraryStatus,
  Assignment,
  Due,
  linkedTasksOf,
  COURSE_TOTAL,
  PLAN_TOTAL,
  PAGE_SIZE,
  COURSE_PAGES,
  PLAN_PAGES,
} from './libraryData';
import { Checkbox, PartialCheckbox, HEAD, CELL, SortableHeader, Chip, CellLink, Pagination, TableSurface } from './tableKit';
import { color, type, table as t, status as st, button as btn, icon, sysMsg, card } from './tokens';
import { suggestionsFor, ruleFromPairs, describeRule, acceptsSuggestion, suggestAssignments, SUGGESTION_SOURCES, type SuggestedRule } from './assignmentSuggestions';

// Training Library. Same chrome as the Sites and Delegated Tasks listings —
// tableKit's Checkbox/HEAD/CELL/Chip/Pagination on a TableSurface — with the
// catalogue's own columns: Status, Version, Site & Roles, Groups, Users,
// Linked task, Due.
//
// The two views differ only in their first column and one extra count, so one
// component renders both rather than two near-identical tables.

export const LIBRARY_VIEWS = ['Courses', 'Learning Plans'] as const;
export type LibraryView = (typeof LIBRARY_VIEWS)[number];

const STATUS_TONE: Record<LibraryStatus, string> = {
  published: color.statusSolidGreen,
  draft: color.statusSolidGrey,
};

const STATUS_LABEL: Record<LibraryStatus, string> = {
  published: 'Published',
  draft: 'Draft',
};

function Status({ tone }: { tone: LibraryStatus }) {
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
      {STATUS_LABEL[tone]}
    </span>
  );
}

/**
 * The proposal, announced once above the grid. The per-row suggestion is where
 * a single course gets decided; this says how many are waiting — otherwise the
 * only way to know is to scroll the catalogue looking for blank cells — and
 * opens the review dialog to settle them together.
 *
 * Purple, not red: an unscoped course is an unfinished job, not a fault.
 */
export function SuggestionBanner({ items, onReview }: { items: LibraryItem[]; onReview: () => void }) {
  const open = suggestAssignments(items);
  if (open.length === 0) return null;

  return (
    <div
      role="status"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: sysMsg.gapS,
        padding: sysMsg.paddingXY,
        borderRadius: sysMsg.radius,
        backgroundColor: card.accent.purple.bg,
        border: `1px solid ${card.accent.purple.selected}`,
        flexShrink: 0,
        minWidth: 0,
      }}
    >
      <FontAwesomeIcon
        icon={faWandMagicSparkles}
        style={{ width: icon.m, height: icon.m, color: color.accentPurpleSaturated, flexShrink: 0 }}
      />
      <span style={{ ...type.body, color: color.sysMsgText, minWidth: 0 }}>
        <b style={{ color: color.text }}>
          {open.length} {open.length === 1 ? 'course has' : 'courses have'} no Site &amp; Roles yet
        </b>{' '}
        — {SUGGESTION_SOURCES.join(' and ')} imply who {open.length === 1 ? 'it is' : 'they are'} for.
      </span>
      <button
        type="button"
        onClick={onReview}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          marginLeft: 'auto',
          padding: `${btn.mediumPaddingY}px ${btn.mediumPaddingX}px`,
          border: `1px solid ${color.accentPurpleSaturated}`,
          borderRadius: btn.radius,
          backgroundColor: color.accentPurpleSaturated,
          color: color.white,
          cursor: 'pointer',
          flexShrink: 0,
          ...type.button,
        }}
      >
        Review {open.length} {open.length === 1 ? 'suggestion' : 'suggestions'}
      </button>
    </div>
  );
}

/** "1 Site", not "1 Sites" — a rule narrowed to one reads as a sentence. */
const noun = (n: 'All' | number, one: string, many: string) => (n === 1 ? one : many);

/**
 * The assignment as it stands — two chips joined by a plain "AND", or a single
 * Mixed Values chip when the item is assigned differently per site. The count
 * carries the chip's Body/Semibold; the noun beside it drops to Body/Regular.
 */
function AssignedChips({ assignment }: { assignment: Exclude<Assignment, { kind: 'none' }> }) {
  if (assignment.kind === 'mixed') {
    return <Chip label={<>Mixed <span style={type.body}>Values</span></>} />;
  }
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: t.gap }}>
      <Chip glyph={faBuilding} label={<>{assignment.sites} <span style={type.body}>{noun(assignment.sites, 'Site', 'Sites')}</span></>} />
      <span style={{ ...type.captionRegular, color: color.textMuted }}>AND</span>
      <Chip glyph={faAddressCard} label={<>{assignment.roles} <span style={type.body}>{noun(assignment.roles, 'Role', 'Roles')}</span></>} />
    </span>
  );
}

/**
 * Nothing is assigned yet, so the cell carries a PROPOSAL: the rule the study's
 * own documents imply — which sites, which roles, or all of either — with the
 * reasoning behind it and a way to take it. The same derivation the review
 * dialog uses, shown where the decision is made.
 */
function SuggestedAssignment({ item, onApply, onReview }: { item: LibraryItem; onApply?: (rule: SuggestedRule) => void; onReview?: () => void }) {
  const pairs = suggestionsFor(item);

  // Nothing delegated means nothing to reason from — say plainly that nothing
  // is assigned rather than proposing out of thin air.
  if (pairs.length === 0) {
    return <span style={{ ...type.body, color: color.textMuted }}>Not assigned</span>;
  }

  const rule = ruleFromPairs(item, pairs);

  return (
    <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 4, minWidth: 0 }}>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, minWidth: 0 }}>
        <FontAwesomeIcon icon={faWandMagicSparkles} style={{ width: icon.s, height: icon.s, color: color.accentPurpleSaturated, flexShrink: 0 }} />
        <span style={{ ...type.bodySemibold, color: color.text }}>{describeRule(rule)}</span>
        <span style={{ ...type.captionRegular, color: color.textMuted }}>suggested</span>
      </span>

      <span
        title={rule.reasons.join(' · ')}
        style={{
          ...type.captionRegular,
          color: color.cellAdditionalText,
          maxWidth: 260,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {rule.reasons[0]}
      </span>

      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
        <button
          type="button"
          onClick={() => onApply?.(rule)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: `${btn.smallPaddingY}px ${btn.smallPaddingX}px`,
            border: `1px solid ${color.primary}`,
            borderRadius: btn.radius,
            backgroundColor: color.primary,
            color: color.white,
            cursor: 'pointer',
            ...type.buttonSmall,
          }}
        >
          Apply
        </button>
        <button
          type="button"
          onClick={onReview}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: `${btn.smallPaddingY}px ${btn.smallPaddingX}px`,
            border: `1px solid ${color.border}`,
            borderRadius: btn.radius,
            backgroundColor: color.white,
            color: color.primary,
            cursor: 'pointer',
            ...type.buttonSmall,
          }}
        >
          Review
        </button>
      </span>
    </span>
  );
}

function AssignmentCell({
  assignment,
  item,
  onApplySuggestion,
  onReview,
}: {
  assignment: Assignment;
  item: LibraryItem;
  onApplySuggestion?: (rule: SuggestedRule) => void;
  onReview?: () => void;
}) {
  // Only an item with no audience yet is open to a proposal. Once an
  // assignment is set — draft or published — the cell just reports it.
  if (acceptsSuggestion(item)) {
    return <SuggestedAssignment item={item} onApply={onApplySuggestion} onReview={onReview} />;
  }
  return <AssignedChips assignment={assignment as Exclude<Assignment, { kind: 'none' }>} />;
}

/** The due value with the rule that produced it stacked underneath. */
function DueCell({ due }: { due: Due }) {
  return (
    <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 2 }}>
      <span style={{ ...type.bodySemibold, color: color.text }}>{due.value}</span>
      {due.rule && <span style={{ ...type.captionRegular, color: color.cellAdditionalText }}>{due.rule}</span>}
    </span>
  );
}

/**
 * Linked task — the delegated duties this item qualifies someone for. One duty
 * shows its name; several collapse to a counter, the way the Delegated Tasks
 * grid shows a duty's courses. Either way it opens that section.
 */
function LinkedTaskCell({ item, onOpenTasks }: { item: LibraryItem; onOpenTasks?: () => void }) {
  const tasks = linkedTasksOf(item);

  // Same rule as the count chips: nothing linked leaves the cell empty.
  if (tasks.length === 0) return null;

  const title = tasks.map(d => `${d.no}. ${d.name}`).join(' · ');

  if (tasks.length === 1) {
    return (
      <span title={title} style={{ display: 'inline-flex', minWidth: 0 }} onClick={onOpenTasks}>
        <CellLink glyph={faFileContract} label={tasks[0].name} />
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={onOpenTasks}
      title={title}
      style={{ padding: 0, border: 'none', background: 'transparent', cursor: 'pointer' }}
    >
      <Chip glyph={faFileContract} label={tasks.length} theme="info" />
    </button>
  );
}

function Row({
  row,
  view,
  checked,
  onCheck,
  onOpenTasks,
  onApplySuggestion,
  onReview,
}: {
  row: LibraryItem;
  view: LibraryView;
  checked: boolean;
  onCheck: (v: boolean) => void;
  onOpenTasks?: () => void;
  onApplySuggestion?: (id: number, rule: SuggestedRule) => void;
  onReview?: () => void;
}) {
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

      <td style={{ ...CELL, maxWidth: 260 }}>
        <CellLink glyph={view === 'Courses' ? faGraduationCap : faBookOpen} label={row.name} />
      </td>

      <td style={CELL}>
        <Status tone={row.status} />
      </td>

      <td style={{ ...CELL, maxWidth: 70 }}>{row.version}</td>

      <td style={{ ...CELL, minWidth: 220, whiteSpace: 'normal' }}>
        <AssignmentCell
          assignment={row.assignment}
          item={row}
          onApplySuggestion={rule => onApplySuggestion?.(row.id, rule)}
          onReview={onReview}
        />
      </td>

      {/* A count chip only appears when there is something to count — nothing
          is linked yet on a freshly drafted course, and a zero in a chip reads
          as a value rather than as an absence. */}
      {view === 'Learning Plans' && <td style={CELL}>{!!row.courses && <Chip glyph={faGraduationCap} label={row.courses} theme="info" />}</td>}

      <td style={CELL}>{!!row.groups && <Chip glyph={faUsers} label={row.groups} theme="info" />}</td>

      <td style={CELL}>{!!row.users && <Chip glyph={faUser} label={row.users} theme="info" />}</td>

      <td style={{ ...CELL, maxWidth: 240 }}>
        <LinkedTaskCell item={row} onOpenTasks={onOpenTasks} />
      </td>

      <td style={CELL}>
        <DueCell due={row.due} />
      </td>
    </tr>
  );
}

export function LibraryTable({
  view,
  courses,
  onSelectionChange,
  onOpenTasks,
  onApplySuggestion,
  onReview,
}: {
  view: LibraryView;
  /**
   * The Courses view's rows. The page owns them, because a course authored in
   * the AI modal has to land in this listing.
   */
  courses?: LibraryItem[];
  onSelectionChange?: (n: number) => void;
  /** Opening a linked duty switches the page to Delegated Tasks. */
  onOpenTasks?: () => void;
  /** Taking an unassigned course's suggested rule, straight from its row. */
  onApplySuggestion?: (id: number, rule: SuggestedRule) => void;
  /** Opening the full review dialog instead of taking the suggestion as-is. */
  onReview?: () => void;
}) {
  const rows = view === 'Courses' ? (courses ?? LIBRARY_COURSES) : LEARNING_PLANS;
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [page, setPage] = useState(1);

  const allChecked = rows.every(r => selected.has(r.id));
  const someChecked = rows.some(r => selected.has(r.id)) && !allChecked;

  const commit = (next: Set<number>) => {
    setSelected(next);
    onSelectionChange?.(next.size);
  };

  const toggleAll = (v: boolean) => commit(v ? new Set(rows.map(r => r.id)) : new Set());
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
              <SortableHeader>{view === 'Courses' ? 'Course Name' : 'Learning Plan Name'}</SortableHeader>
              <th style={HEAD}>Status</th>
              <th style={HEAD}>Version</th>
              <th style={HEAD}>Site &amp; Roles</th>
              {view === 'Learning Plans' && <th style={HEAD}>Courses</th>}
              <th style={HEAD}>Groups</th>
              <th style={HEAD}>Users</th>
              <th style={HEAD}>Linked task</th>
              <th style={HEAD}>Due</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(row => (
              <Row
                key={row.id}
                row={row}
                view={view}
                checked={selected.has(row.id)}
                onCheck={v => toggleOne(row.id, v)}
                onOpenTasks={onOpenTasks}
                onApplySuggestion={onApplySuggestion}
                onReview={onReview}
              />
            ))}
          </tbody>
        </table>
      </div>

      <Pagination
        page={page}
        totalPages={view === 'Courses' ? COURSE_PAGES : PLAN_PAGES}
        pageSize={PAGE_SIZE}
        // Only page 1 is real data, so an authored course adds to the total.
        totalItems={view === 'Courses' ? COURSE_TOTAL + rows.length - LIBRARY_COURSES.length : PLAN_TOTAL}
        onPage={setPage}
      />
    </TableSurface>
  );
}

export default LibraryTable;
