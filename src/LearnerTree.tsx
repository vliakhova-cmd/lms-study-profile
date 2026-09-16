import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faMagnifyingGlass,
  faAngleDown,
  faAngleRight,
  faUser,
  faBook,
  faListCheck,
  IconDefinition,
} from '@fortawesome/free-solid-svg-icons';
import { LEARNERS, DEFAULT_EXPANDED, DEFAULT_SELECTED } from './learnerData';
import { color, type, tree } from './tokens';

// Navigation tree — DS - Advanced | IN PROGRESS | 2.0, "Navigation /
// Type=Expanded" (node 86:202599 → 86:202600) and its Tree/Row (86:202604).
//
// A Tree/Row is two segments, and getting the split wrong is what makes a tree
// look hand-drawn:
//   · the ROW carries the indent (tree-list/item/level-{0,,2}-padding-left-x —
//     0 / 15 / 30) and holds a "Carret Wrapped" slot that is always 24px wide,
//     whether or not the row has children, so every label lines up
//   · the CONTAINER is everything after the caret — icon, name, counter — and
//     it alone carries padding-left 5 / padding-right 15, the 5px inner gap,
//     the radius and the selected fill
// Both icons are Icons/solid/s (15) centered in a 20px box, never a bare 20px
// glyph, and the row is a fixed 35 high — it must not shrink when the list
// overflows.
//
// The "View By" control that the DS puts in Tree/Heading lives in the page
// header on this screen (see StudyProfilePage), so the heading here is just
// the Search field.

/** An icon container — tree-list/item/icon-size (20) around an Icons/solid/s glyph (15) */
function TreeGlyph({ glyph, color: glyphColor }: { glyph: IconDefinition; color: string }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: tree.iconBox,
        height: tree.iconBox,
        flexShrink: 0,
      }}
    >
      <FontAwesomeIcon icon={glyph} style={{ width: tree.glyph, height: tree.glyph, color: glyphColor }} />
    </span>
  );
}

interface TreeRowProps {
  /** 0 → no indent, 1 → 15, 2 → 30 */
  depth: number;
  icon: IconDefinition;
  label: string;
  count: number;
  hasChildren?: boolean;
  isOpen?: boolean;
  onToggle?: () => void;
  selected?: boolean;
  onSelect?: () => void;
}

function TreeRow({ depth, icon: glyph, label, count, hasChildren, isOpen, onToggle, selected = false, onSelect }: TreeRowProps) {
  const [hover, setHover] = useState(false);
  const bg = selected ? color.treeSelectedBg : hover ? 'rgba(208,229,246,0.45)' : 'transparent';

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: tree.outerGap,
        height: tree.rowHeight,
        // A row keeps its height when the list overflows its panel.
        flexShrink: 0,
        paddingLeft: tree.level0PaddingLeft + depth * tree.levelStep,
        overflow: 'hidden',
      }}
    >
      {/* Carret Wrapped — the slot is reserved even on childless rows */}
      <div style={{ display: 'flex', alignItems: 'center', width: tree.caretWidth, flexShrink: 0 }}>
        {hasChildren && (
          // Button/Flat primary — padding 1/2, radius 5, 15px glyph in a 20px box
          <button
            type="button"
            aria-label={isOpen ? 'Collapse' : 'Expand'}
            onClick={e => {
              e.stopPropagation();
              onToggle?.();
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: tree.caretWidth,
              height: tree.caretHeight,
              padding: '1px 2px',
              border: '1px solid transparent',
              borderRadius: tree.radius,
              background: 'transparent',
              color: color.primary,
              cursor: 'pointer',
            }}
          >
            <TreeGlyph glyph={isOpen ? faAngleDown : faAngleRight} color={color.primary} />
          </button>
        )}
      </div>

      {/* Container */}
      <button
        type="button"
        onClick={onSelect}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: tree.innerGap,
          flex: '1 0 0',
          minWidth: 0,
          height: '100%',
          paddingLeft: tree.itemPaddingLeft,
          paddingRight: tree.itemPaddingRight,
          border: 'none',
          borderRadius: tree.radius,
          backgroundColor: bg,
          cursor: 'pointer',
          textAlign: 'left',
          font: 'inherit',
          transition: 'background-color 100ms',
        }}
      >
        <TreeGlyph glyph={glyph} color={color.iconFaint} />
        <span
          title={label}
          style={{
            flex: '1 0 0',
            minWidth: 0,
            // An expanded parent goes Body/Semibold, like the open folder rows
            // in the frame; everything else stays Body/Regular.
            ...(hasChildren && isOpen ? type.bodySemibold : type.body),
            color: color.text,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {label}
        </span>
        {/* Counter — Body/Bold */}
        <span style={{ flexShrink: 0, ...type.bodyBold, color: color.text }}>{count}</span>
      </button>
    </div>
  );
}

export function LearnerTree() {
  const [expanded, setExpanded] = useState<Set<string>>(new Set(DEFAULT_EXPANDED));
  const [selected, setSelected] = useState(DEFAULT_SELECTED);
  const [query, setQuery] = useState('');

  const toggle = (id: string) =>
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const visible = LEARNERS.filter(l => l.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: color.panelBg,
        display: 'flex',
        flexDirection: 'column',
        fontFamily: type.body.fontFamily,
      }}
    >
      {/* Tree/Heading — navigation-tree/top/{padding-x,padding-y-top,gap} */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: tree.topGap, padding: `${tree.topPaddingX}px ${tree.topPaddingX}px 0`, flexShrink: 0 }}>
        {/* Search — field/input: 30 high, padding-x 5, gap 5, radius 5/0, bottom rule only */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            height: 30,
            padding: '0 5px',
            backgroundColor: color.pageBg,
            borderBottom: `1px solid ${color.border}`,
            borderRadius: '5px 5px 0 0',
          }}
        >
          <TreeGlyph glyph={faMagnifyingGlass} color={color.iconMuted} />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search"
            style={{ flex: '1 0 0', minWidth: 0, border: 'none', outline: 'none', background: 'transparent', ...type.body, color: color.text }}
          />
        </div>
      </div>

      {/* navigation-tree/tree-body-padding-top-y 15; rows sit 15 in from the edge */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          paddingTop: tree.bodyPaddingTop,
          paddingLeft: tree.bodyPaddingLeft,
          overflowY: 'auto',
        }}
      >
        {visible.map(learner => {
          const isOpen = expanded.has(learner.id);
          return (
            <div key={learner.id} style={{ display: 'contents' }}>
              {/* Level 0 — the learner */}
              <TreeRow
                depth={0}
                icon={faUser}
                label={learner.name}
                count={learner.count}
                hasChildren
                isOpen={isOpen}
                onToggle={() => toggle(learner.id)}
                onSelect={() => toggle(learner.id)}
              />
              {/* Level 1 — Courses and Learning Plans, under every learner */}
              {isOpen &&
                learner.children.map(child => (
                  <TreeRow
                    key={child.id}
                    depth={1}
                    icon={child.label === 'Courses' ? faBook : faListCheck}
                    label={child.label}
                    count={child.count}
                    selected={selected === child.id}
                    onSelect={() => setSelected(child.id)}
                  />
                ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default LearnerTree;
