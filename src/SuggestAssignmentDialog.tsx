import { useEffect, useMemo, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faWandMagicSparkles,
  faXmark,
  faGraduationCap,
  faBookOpen,
  faMagnifyingGlass,
  faBuilding,
  faUser,
  faCircleInfo,
  faPlus,
  faPen,
  faTrashCan,
  faAngleDown,
  faFileLines,
  faFileContract,
  IconDefinition,
} from '@fortawesome/free-solid-svg-icons';
import { LibraryItem } from './libraryData';
import {
  suggestAssignments,
  sourcesFor,
  ruleFromPairs,
  rowsFromPairs,
  SUGGESTION_SITES,
  SUGGESTION_SOURCES,
  type AssignmentRow,
  type SuggestedPair,
  type SuggestedRule,
} from './assignmentSuggestions';
import { SITES } from './sitesData';
import { Checkbox, PartialCheckbox, HEAD, CELL, Chip, CellLink, TableSurface } from './tableKit';
import { FilterRow, type FilterSpec } from './FilterRow';
import { color, type, dialog as dlg, button as btn, toolbar as tb, table as t, status as st, icon, sysMsg, card } from './tokens';

// Suggested Site & Roles.
//
// Master–detail: the courses waiting for an audience down the left, and on the
// right the ASSIGNMENT RULES for the selected one — the same flow GL | PROD |
// 2.7's Sites & Roles wizard uses to map a course (node 30271:47005), ported
// onto this project's DS 2.0 tokens rather than 2.7's own palette.
//
// The move that matters is the unit of work. A flat list of site/role pairs
// makes you tick eight rows to say one thing; the rules grid says it once —
// a site (or All Sites) with its roles in a multiselector — so "everyone
// randomising, everywhere" is one row you edit rather than nine you audit.
// Nothing here is invented: the rows are folded from the derivation in
// assignmentSuggestions, and editing only ever narrows what it proposed.

const keyOf = (courseId: number, p: SuggestedPair) => `${courseId}|${p.site}|${p.role}`;
const rowKey = (courseId: number, row: AssignmentRow) => `${courseId}|${row.site}`;

/** The rules grid's own filters, as the pattern lists them. */
const RULE_FILTERS: FilterSpec[] = [
  { label: 'Site Status', options: ['All', 'Active', 'Ready for Training', 'Pending'] },
  { label: 'Site Coordinator', options: ['All', 'Jacob Jones', 'Annette Black', 'Ricardo Nolan'] },
  { label: 'Role', options: ['All', 'PI', 'Sub-I', 'Coordinator', 'Pharmacist', 'Study Nurse', 'Lab Technician', 'Data Entry'] },
];

const siteRow = (label: string) => SITES.find(s => s.name === label);

const STATUS_TONE: Record<string, string> = {
  active: color.statusSolidBlue,
  ready: color.statusSolidGreen,
  pending: color.statusOrange,
};

function DialogButton({ label, primary, disabled, onClick }: { label: string; primary?: boolean; disabled?: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: btn.mediumMinWidth,
        padding: `${btn.mediumPaddingY}px ${btn.mediumPaddingX}px`,
        border: `${btn.borderWidth}px solid ${primary ? color.primary : color.border}`,
        borderRadius: btn.radius,
        backgroundColor: primary ? color.primary : color.white,
        color: primary ? color.white : color.primary,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? t.cellDisabledOpacity / 100 : 1,
        ...type.button,
      }}
    >
      {label}
    </button>
  );
}

/** menu/base — the panel Add Sites, Bulk Role Edit and a roles field drop. */
function Dropdown({ children, onClose, align = 'left' }: { children: React.ReactNode; onClose: () => void; align?: 'left' | 'right' }) {
  return (
    <>
      <div style={{ position: 'fixed', inset: 0, zIndex: 19 }} onClick={onClose} />
      <div
        style={{
          position: 'absolute',
          top: '100%',
          [align]: 0,
          marginTop: 4,
          zIndex: 20,
          minWidth: 200,
          maxHeight: 240,
          overflowY: 'auto',
          padding: 5,
          backgroundColor: color.white,
          borderRadius: 5,
          boxShadow: '0 5px 20px rgba(11,21,40,0.15), 0 0 0 1px rgba(11,21,40,0.05)',
        }}
      >
        {children}
      </div>
    </>
  );
}

/** One line in a Dropdown — a checkbox row, or a plain pick. */
function MenuRow({ label, note, checked, disabled, onClick }: { label: string; note?: string; checked?: boolean; disabled?: boolean; onClick?: () => void }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        width: '100%',
        minHeight: 30,
        padding: '2px 8px',
        border: 'none',
        borderRadius: 5,
        backgroundColor: hover && !disabled ? color.cellHoverBg : 'transparent',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? t.cellDisabledOpacity / 100 : 1,
        textAlign: 'left',
        ...type.body,
        color: color.text,
      }}
    >
      {checked !== undefined && <Checkbox checked={checked} onChange={() => onClick?.()} />}
      <span style={{ flex: '1 0 0', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</span>
      {note && <span style={{ ...type.captionRegular, color: color.textMuted, flexShrink: 0 }}>{note}</span>}
    </button>
  );
}

/** Button/Flat — the toolbar's actions, disabled until they have something to act on. */
function ToolbarAction({
  glyph,
  label,
  disabled,
  onClick,
  children,
}: {
  glyph: IconDefinition;
  label: string;
  disabled?: boolean;
  onClick?: () => void;
  /** An open menu, rendered under the action. */
  children?: React.ReactNode;
}) {
  const [hover, setHover] = useState(false);
  return (
    <div style={{ position: 'relative' }}>
      <button
        type="button"
        disabled={disabled}
        onClick={onClick}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: btn.flatGap,
          padding: `${btn.flatPaddingY}px ${btn.flatPaddingX}px`,
          border: `${btn.flatBorderWidth}px solid transparent`,
          borderRadius: btn.flatRadius,
          backgroundColor: hover && !disabled ? color.flatPrimaryHoverBg : 'transparent',
          color: color.flatPrimaryText,
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? t.cellDisabledOpacity / 100 : 1,
          whiteSpace: 'nowrap',
          ...type.button,
        }}
      >
        <FontAwesomeIcon icon={glyph} style={{ width: icon.s, height: icon.s }} />
        {label}
      </button>
      {children}
    </div>
  );
}

/**
 * Text Fields/Multiselector — the Roles cell. The roles mapped at this site as
 * removable tokens, and a caret that offers the ones the derivation proposed
 * but that have since been taken off. Its candidates are exactly what the DOA
 * log and the matrix stand behind, so the field cannot invent an audience.
 */
function RoleField({ roles, candidates, onToggle }: { roles: string[]; candidates: string[]; onToggle: (role: string) => void }) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ position: 'relative' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 5,
          minHeight: 30,
          padding: '2px 5px 3px 3px',
          border: `1px solid ${color.border}`,
          borderRadius: btn.radius,
          backgroundColor: color.white,
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: 5, flex: '1 0 0', minWidth: 0, flexWrap: 'wrap' }}>
          {roles.map(role => (
            <span
              key={role}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                padding: '0 5px',
                borderRadius: btn.radius,
                backgroundColor: color.toolbarBg,
                border: `1px solid ${color.navAlterSelectedBg}`,
                ...type.bodySemibold,
                color: color.text,
              }}
            >
              {role}
              <button
                type="button"
                aria-label={`Remove ${role}`}
                onClick={() => onToggle(role)}
                style={{ display: 'inline-flex', padding: 0, border: 'none', background: 'transparent', cursor: 'pointer', color: color.iconMuted }}
              >
                <FontAwesomeIcon icon={faXmark} style={{ width: 10, height: 10 }} />
              </button>
            </span>
          ))}
          {roles.length === 0 && <span style={{ ...type.body, color: color.textMuted, paddingLeft: 2 }}>No roles</span>}
        </span>

        <button
          type="button"
          aria-label="Add a role"
          onClick={() => setOpen(o => !o)}
          style={{ display: 'inline-flex', padding: 0, border: 'none', background: 'transparent', cursor: 'pointer', color: color.iconMuted, flexShrink: 0 }}
        >
          <FontAwesomeIcon icon={faAngleDown} style={{ width: icon.s, height: icon.s }} />
        </button>
      </div>

      {open && (
        <Dropdown onClose={() => setOpen(false)} align="right">
          {candidates.map(role => (
            <MenuRow key={role} label={role} checked={roles.includes(role)} onClick={() => onToggle(role)} />
          ))}
        </Dropdown>
      )}
    </div>
  );
}

/** field/input — the rail's own search, narrowing the course list. */
function RailSearch({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 5,
        height: 30,
        padding: '0 8px',
        backgroundColor: color.white,
        border: `1px solid ${color.border}`,
        borderRadius: btn.radius,
      }}
    >
      <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: btn.iconBoxS, height: btn.iconBoxS, flexShrink: 0 }}>
        <FontAwesomeIcon icon={faMagnifyingGlass} style={{ width: icon.s, height: icon.s, color: color.iconMuted }} />
      </span>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="Search"
        style={{ flex: '1 0 0', minWidth: 0, border: 'none', outline: 'none', background: 'transparent', ...type.body, color: color.text }}
      />
    </div>
  );
}

/**
 * One course in the rail, with how much of its proposal is still standing —
 * so the rail says at a glance where the reviewing has got to, and an
 * untouched course is visibly different from one that has been cut back.
 */
function RailItem({
  item,
  kept,
  total,
  selected,
  onSelect,
}: {
  item: LibraryItem;
  kept: number;
  total: number;
  selected: boolean;
  onSelect: () => void;
}) {
  const [hover, setHover] = useState(false);

  return (
    <button
      type="button"
      onClick={onSelect}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      title={`${kept} of ${total} suggested mappings kept`}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        width: '100%',
        minHeight: 40,
        padding: '5px 10px',
        border: 'none',
        // qv-panel/navigation/item/selected-bg — solid, with white contents.
        backgroundColor: selected ? color.qvNavSelectedBg : hover ? color.navAlterHoverBg : 'transparent',
        color: selected ? color.qvNavSelectedText : color.text,
        cursor: 'pointer',
        textAlign: 'left',
        minWidth: 0,
      }}
    >
      <FontAwesomeIcon
        icon={item.courses != null ? faBookOpen : faGraduationCap}
        style={{ width: icon.s, height: icon.s, color: selected ? color.qvNavSelectedText : color.iconFaint, flexShrink: 0 }}
      />
      <span style={{ ...type.body, flex: '1 0 0', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</span>
      <span style={{ ...type.bodyBold, flexShrink: 0, color: selected ? color.qvNavSelectedText : kept === 0 ? color.textMuted : color.text }}>
        {kept}/{total}
      </span>
    </button>
  );
}

/**
 * What the proposal was read FROM, in two chips: the document the course was
 * built on, and the delegated duty it qualifies. That is the whole chain —
 * document → duty → the sites and roles that carry it — and it is the first
 * thing to check before accepting anything, so it is stated rather than
 * buried in a sentence. The long-form reasoning stays on hover.
 */
function EvidenceChip({ glyph, label }: { glyph: IconDefinition; label: string }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        maxWidth: 260,
        padding: '0 8px',
        borderRadius: 100,
        backgroundColor: card.accent.purple.bg,
        border: `1px solid ${card.accent.purple.selected}`,
        ...type.bodySemibold,
        color: color.accentPurpleText,
      }}
    >
      <FontAwesomeIcon icon={glyph} style={{ width: icon.xs, height: icon.xs, color: card.accent.purple.bar, flexShrink: 0 }} />
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</span>
    </span>
  );
}

function BasedOn({ item, pairs, why }: { item: LibraryItem; pairs: SuggestedPair[]; why: string }) {
  const sources = sourcesFor(item);
  const duties = [...new Set(pairs.map(p => p.duty))];

  if (pairs.length === 0) {
    return <span style={{ ...type.captionRegular, color: color.cellAdditionalText }}>Nothing left — this course stays unassigned.</span>;
  }

  return (
    <span title={why} style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', minWidth: 0 }}>
      <span style={{ ...type.captionSemibold, color: color.textMuted, textTransform: 'uppercase', flexShrink: 0 }}>Based on</span>
      {sources.slice(0, 1).map(src => (
        <EvidenceChip key={src} glyph={faFileLines} label={src} />
      ))}
      {/* One duty names itself; several are only a count, or the row is a wall */}
      <EvidenceChip
        glyph={faFileContract}
        label={duties.length === 1 ? duties[0] : `${duties.length} delegated duties`}
      />
    </span>
  );
}

export function SuggestAssignmentDialog({
  items,
  onClose,
  onApply,
}: {
  items: LibraryItem[];
  onClose: () => void;
  /** The rule each course's remaining rows add up to, by course id. */
  onApply: (accepted: Map<number, SuggestedRule>) => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const suggestions = useMemo(() => suggestAssignments(items), [items]);

  // The proposal arrives whole and is edited DOWN. Nothing listed here has an
  // audience to overrule, so the work is taking out what does not belong.
  const [removed, setRemoved] = useState<Set<string>>(new Set());
  const [selectedId, setSelectedId] = useState<number | null>(suggestions[0]?.item.id ?? null);
  const [query, setQuery] = useState('');
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [menu, setMenu] = useState<'sites' | 'roles' | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (el && !el.open) el.showModal();
  }, []);

  const keptOf = (s: (typeof suggestions)[number]) => s.pairs.filter(p => !removed.has(keyOf(s.item.id, p)));

  const shown = suggestions.filter(s => s.item.name.toLowerCase().includes(query.toLowerCase()));
  const current = suggestions.find(s => s.item.id === selectedId) ?? null;
  const courseId = current?.item.id ?? 0;

  const kept = current ? keptOf(current) : [];
  const rows = useMemo(() => rowsFromPairs(kept), [kept]);
  const rule = current ? ruleFromPairs(current.item, kept) : null;

  /** Drop or restore the pairs a change covers. */
  const setPairs = (pairs: SuggestedPair[], keep: boolean) =>
    setRemoved(prev => {
      const next = new Set(prev);
      for (const p of pairs) {
        if (keep) next.delete(keyOf(courseId, p));
        else next.add(keyOf(courseId, p));
      }
      return next;
    });

  /** The sites a row speaks for — every site, or just its own. */
  const sitesOf = (row: AssignmentRow) => (row.allSites ? SUGGESTION_SITES : [row.site]);

  const toggleRole = (row: AssignmentRow, role: string) => {
    const affected = (current?.pairs ?? []).filter(p => p.role === role && sitesOf(row).includes(p.site));
    setPairs(affected, !row.roles.includes(role));
  };

  /** What the derivation originally proposed for this row — the caret's list. */
  const candidatesFor = (row: AssignmentRow) => {
    const all = (current?.pairs ?? []).filter(p => sitesOf(row).includes(p.site));
    return [...new Set(all.map(p => p.role))];
  };

  const removeRows = (rs: AssignmentRow[]) => {
    for (const row of rs) setPairs((current?.pairs ?? []).filter(p => sitesOf(row).includes(p.site) && row.roles.includes(p.role)), false);
    setPicked(new Set());
  };

  const pickedRows = rows.filter(r => picked.has(rowKey(courseId, r)));

  /** Sites whose proposal has been taken off entirely — what Add Sites offers back. */
  const missingSites = SUGGESTION_SITES.filter(site => !rows.some(r => r.allSites || r.site === site));

  /** The courses Apply would actually write a rule for — what its label counts. */
  const courseCount = suggestions.filter(s => keptOf(s).length > 0).length;

  function apply() {
    const accepted = new Map<number, SuggestedRule>();
    for (const s of suggestions) {
      const take = keptOf(s);
      // The rule is recomputed from what survived the edit, so taking a site
      // out turns "All Sites" into the sites that remain.
      if (take.length > 0) accepted.set(s.item.id, ruleFromPairs(s.item, take));
    }
    onApply(accepted);
  }

  return (
    <dialog
      ref={ref}
      onCancel={e => {
        e.preventDefault();
        onClose();
      }}
      style={{
        // dialog/extralarge — between large-min-width and max-width, and the
        // dialog ground is dialog/bg, not white: the WHITE is the content panel.
        width: 1100,
        maxWidth: `min(${dlg.maxWidth}px, calc(100vw - 40px))`,
        minHeight: dlg.minHeight,
        maxHeight: `min(${dlg.maxHeight}px, calc(100vh - 40px))`,
        display: 'flex',
        flexDirection: 'column',
        padding: 0,
        border: 'none',
        borderRadius: dlg.radius,
        backgroundColor: dlg.bg,
        boxShadow: dlg.shadow,
        color: color.text,
        fontFamily: type.body.fontFamily,
        overflow: 'hidden',
      }}
    >
      {/* dialog/titlebar — transparent fill AND transparent border: the panel
          below is what separates it, not a rule. */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: dlg.titlebarGap,
          padding: `${dlg.titlebarPaddingY}px ${dlg.titlebarPaddingX}px`,
          flexShrink: 0,
        }}
      >
        <FontAwesomeIcon icon={faWandMagicSparkles} style={{ width: icon.s, height: icon.s, color: color.accentPurpleSaturated, flexShrink: 0 }} />
        <span style={{ display: 'flex', flexDirection: 'column', flex: '1 0 0', minWidth: 0 }}>
          <span style={{ ...type.h3, color: color.text }}>Suggested Site &amp; Roles</span>
          <span style={{ ...type.captionRegular, color: color.textMuted }}>Derived from {SUGGESTION_SOURCES.join(' and ')}</span>
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            // dialog/titlebar/x-size is the BOX; the glyph is Icons/solid/s.
            width: dlg.titlebarXSize,
            height: dlg.titlebarXSize,
            padding: 0,
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            color: color.flatPrimaryText,
            flexShrink: 0,
          }}
        >
          <FontAwesomeIcon icon={faXmark} style={{ width: icon.s, height: icon.s }} />
        </button>
      </div>

      {/* dialog/content — white, inset margin-x 15 with margin-y 0 */}
      <div
        style={{
          display: 'flex',
          // Tall enough to work in, free to shrink under the dialog's max-height.
          height: 560,
          flex: '1 1 auto',
          minHeight: 0,
          margin: `0 ${dlg.contentInset}px`,
          backgroundColor: dlg.contentBg,
          borderRadius: dlg.contentRadius,
          overflow: 'hidden',
        }}
      >
        {/* Master — the courses waiting for an audience */}
        <div
          style={{
            width: 280,
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            borderRight: `1px solid ${color.borderSubtle}`,
            backgroundColor: color.pageBg,
            minHeight: 0,
          }}
        >
          <div style={{ padding: 10, flexShrink: 0 }}>
            <RailSearch value={query} onChange={setQuery} />
          </div>

          <div style={{ flex: '1 0 0', minHeight: 0, overflowY: 'auto' }}>
            {shown.map(s => (
              <RailItem
                key={s.item.id}
                item={s.item}
                kept={keptOf(s).length}
                total={s.pairs.length}
                selected={s.item.id === selectedId}
                onSelect={() => {
                  setSelectedId(s.item.id);
                  setPicked(new Set());
                  setMenu(null);
                }}
              />
            ))}
            {shown.length === 0 && (
              <span style={{ display: 'block', padding: '5px 10px', ...type.body, color: color.textMuted }}>
                {suggestions.length === 0 ? 'Every course already has an audience.' : 'No course matches that search.'}
              </span>
            )}
          </div>
        </div>

        {/* Detail — the assignment rules for the selected course */}
        <div style={{ flex: '1 0 0', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 15, padding: 15, minHeight: 0 }}>
          {current && rule ? (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5, flexShrink: 0, minWidth: 0 }}>
                <span style={{ ...type.h4, color: color.text }}>Assignment Rules</span>
                <span style={{ ...type.body, color: color.textMuted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  How <b style={{ ...type.bodySemibold, color: color.text }}>{current.item.name}</b> reaches site personnel.
                </span>
                <BasedOn item={current.item} pairs={kept} why={rule.reasons.join(' · ')} />
              </div>

              {/* The staging rule the pattern states: mapping is not enrolment */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: sysMsg.gapS,
                  padding: 10,
                  borderRadius: sysMsg.radius,
                  backgroundColor: color.pageBg,
                  border: `1px solid ${color.borderSubtle}`,
                  flexShrink: 0,
                }}
              >
                <FontAwesomeIcon icon={faCircleInfo} style={{ width: icon.s, height: icon.s, color: color.iconMuted, flexShrink: 0 }} />
                <span style={{ ...type.captionRegular, color: color.text }}>
                  This is a staging area. Users will not be enrolled until the course is released.
                </span>
              </div>

              {/* Toolbar/eTMF — the actions that edit the rules */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: tb.gap,
                  height: tb.height,
                  padding: `0 ${tb.paddingX}px`,
                  backgroundColor: color.toolbarBg,
                  borderRadius: tb.radius,
                  flexShrink: 0,
                }}
              >
                <ToolbarAction
                  glyph={faPlus}
                  label="Add Sites"
                  disabled={missingSites.length === 0}
                  onClick={() => setMenu(m => (m === 'sites' ? null : 'sites'))}
                >
                  {menu === 'sites' && (
                    <Dropdown onClose={() => setMenu(null)}>
                      {missingSites.map(site => {
                        const proposed = (current.pairs ?? []).filter(p => p.site === site);
                        return (
                          <MenuRow
                            key={site}
                            label={site}
                            note={proposed.length === 0 ? 'no delegated duty' : `${proposed.length} ${proposed.length === 1 ? 'role' : 'roles'}`}
                            disabled={proposed.length === 0}
                            onClick={() => {
                              setPairs(proposed, true);
                              setMenu(null);
                            }}
                          />
                        );
                      })}
                    </Dropdown>
                  )}
                </ToolbarAction>

                <ToolbarAction
                  glyph={faPen}
                  label="Bulk Role Edit"
                  disabled={pickedRows.length === 0}
                  onClick={() => setMenu(m => (m === 'roles' ? null : 'roles'))}
                >
                  {menu === 'roles' && (
                    <Dropdown onClose={() => setMenu(null)}>
                      {[...new Set(pickedRows.flatMap(r => candidatesFor(r)))].map(role => {
                        const on = pickedRows.every(r => r.roles.includes(role));
                        return (
                          <MenuRow
                            key={role}
                            label={role}
                            checked={on}
                            note={`${pickedRows.length} ${pickedRows.length === 1 ? 'row' : 'rows'}`}
                            onClick={() =>
                              // One decision applied across every picked row —
                              // the point of a bulk edit.
                              setPairs(
                                current.pairs.filter(p => p.role === role && pickedRows.some(r => sitesOf(r).includes(p.site))),
                                !on,
                              )
                            }
                          />
                        );
                      })}
                    </Dropdown>
                  )}
                </ToolbarAction>

                <ToolbarAction glyph={faTrashCan} label="Remove" disabled={pickedRows.length === 0} onClick={() => removeRows(pickedRows)} />
              </div>

              <FilterRow filters={RULE_FILTERS} perPage={false} />

              <span style={{ ...type.bodyBold, color: color.text, flexShrink: 0 }}>
                {rows.length} {rows.length === 1 ? 'Assignment' : 'Assignments'}
                {pickedRows.length > 0 && <span style={{ ...type.body, color: color.textMuted }}> {pickedRows.length} Selected</span>}
              </span>

              <TableSurface>
                <div style={{ flex: '1 0 0', minHeight: 0, overflowY: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
                    <thead>
                      <tr>
                        <th style={{ ...HEAD, width: 40 }}>
                          {pickedRows.length > 0 && pickedRows.length < rows.length ? (
                            <PartialCheckbox onChange={() => setPicked(new Set())} />
                          ) : (
                            <Checkbox
                              checked={rows.length > 0 && pickedRows.length === rows.length}
                              onChange={v => setPicked(v ? new Set(rows.map(r => rowKey(courseId, r))) : new Set())}
                            />
                          )}
                        </th>
                        <th style={{ ...HEAD, width: 210 }}>Assignment</th>
                        <th style={HEAD}>Roles</th>
                        <th style={{ ...HEAD, width: 150 }}>Site Status</th>
                        <th style={{ ...HEAD, width: 170 }}>Site Coordinator</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map(row => {
                        const k = rowKey(courseId, row);
                        const site = row.allSites ? undefined : siteRow(row.site);
                        return (
                          <tr key={k} title={row.duties.join(' · ')}>
                            <td style={{ ...CELL, width: 40 }}>
                              <Checkbox
                                checked={picked.has(k)}
                                onChange={v =>
                                  setPicked(prev => {
                                    const next = new Set(prev);
                                    if (v) next.add(k);
                                    else next.delete(k);
                                    return next;
                                  })
                                }
                              />
                            </td>
                            <td style={{ ...CELL, width: 210 }}>
                              <CellLink glyph={faBuilding} label={row.site} />
                            </td>
                            <td style={CELL}>
                              <RoleField roles={row.roles} candidates={candidatesFor(row)} onToggle={role => toggleRole(row, role)} />
                            </td>
                            {/* The study-wide row stands for no single site, so
                                it carries no site's status or coordinator. */}
                            <td style={{ ...CELL, width: 150 }}>
                              {site && (
                                <span
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    maxWidth: st.labelMaxWidth,
                                    padding: `0 ${st.paddingX}px`,
                                    borderRadius: st.radius,
                                    backgroundColor: STATUS_TONE[site.statusTone],
                                    color: color.text,
                                    ...type.status,
                                    textTransform: 'uppercase',
                                    whiteSpace: 'nowrap',
                                  }}
                                >
                                  {site.status}
                                </span>
                              )}
                            </td>
                            <td style={{ ...CELL, width: 170 }}>
                              {site &&
                                (site.coordinator ? (
                                  <CellLink glyph={faUser} label={site.coordinator} />
                                ) : (
                                  <Chip label={site.coordinatorCount ?? 0} theme="info" />
                                ))}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </TableSurface>
            </>
          ) : (
            <span style={{ ...type.body, color: color.textMuted }}>
              Nothing to propose — every course in the library already has an audience.
            </span>
          )}
        </div>
      </div>

      {/* dialog/footer — Cancel and the action, CENTRED. The DS puts nothing
          else on this row, so the cross-course total lives under the rail
          rather than stealing the space that centres them. */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: dlg.footerGap,
          padding: `${dlg.footerPaddingY}px ${dlg.footerPaddingX}px`,
          backgroundColor: dlg.footerBg,
          flexShrink: 0,
        }}
      >
        <DialogButton label="Cancel" onClick={onClose} />
        <DialogButton
          label={courseCount === 0 ? 'Apply' : `Apply to ${courseCount} ${courseCount === 1 ? 'course' : 'courses'}`}
          primary
          disabled={courseCount === 0}
          onClick={apply}
        />
      </div>
    </dialog>
  );
}

export default SuggestAssignmentDialog;
