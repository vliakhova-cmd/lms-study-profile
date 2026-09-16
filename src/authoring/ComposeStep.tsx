import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faFilePdf,
  faXmark,
  faCirclePlus,
  faMicrophone,
  faChevronDown,
  faPlus,
  faGlobe,
  faFolderOpen,
  faArrowUpFromBracket,
} from '@fortawesome/free-solid-svg-icons';
import { LessonType } from './types';
import { LANGUAGES } from './mockData';
import { CONTENT_ROWS } from './contentLibraryData';
import { LessonTypeTags } from './LessonTypeTags';
import { AuthoringButton } from './AuthoringButton';

// Same "escape the clip, close on outside click" pattern as CreateCourseMenu
// and MoreActionsMenu — this button sits inside a scrollable modal body, so
// the dropdown is positioned `fixed` from the trigger's live coordinates.
function AttachMenu({ onSelectFromLibrary, onUploadNew }: { onSelectFromLibrary: () => void; onUploadNew: () => void }) {
  const [open, setOpen] = useState(false);
  const [menuPos, setMenuPos] = useState<{ top: number; left: number } | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [open]);

  useLayoutEffect(() => {
    if (!open || !btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    setMenuPos({ top: rect.bottom + 5, left: rect.left });
  }, [open]);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        ref={btnRef}
        type="button"
        aria-label="Attach"
        onClick={() => setOpen(o => !o)}
        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '3.5px', display: 'flex' }}
      >
        <FontAwesomeIcon icon={faCirclePlus} style={{ width: 15, height: 15, color: '#1f6aac' }} />
      </button>

      {open && menuPos && (
        <div
          style={{
            position: 'fixed',
            top: menuPos.top,
            left: menuPos.left,
            backgroundColor: 'white',
            borderRadius: 4,
            boxShadow: '0px 1px 3px rgba(0,0,0,0.22)',
            padding: 5,
            minWidth: 200,
            zIndex: 50,
          }}
        >
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onSelectFromLibrary();
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              width: '100%',
              padding: 5,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              borderRadius: 2,
              textAlign: 'left',
            }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#f7f7f7')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <FontAwesomeIcon icon={faFolderOpen} style={{ width: 15, height: 15, color: '#1f6aac' }} />
            <span style={{ fontSize: 14, color: '#100040', fontFamily: "'Open Sans', sans-serif" }}>Select from Library</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onUploadNew();
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              width: '100%',
              padding: 5,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              borderRadius: 2,
              textAlign: 'left',
            }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#f7f7f7')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <FontAwesomeIcon icon={faArrowUpFromBracket} style={{ width: 15, height: 15, color: '#1f6aac' }} />
            <span style={{ fontSize: 14, color: '#100040', fontFamily: "'Open Sans', sans-serif" }}>Upload New</span>
          </button>
        </div>
      )}
    </div>
  );
}

// "Buttons/Action button" style — same hover treatment as ToolbarAction in
// ContentLibraryLauncher.tsx: transparent at rest, solid #053c80 + white
// icon/text on hover.
function AddObjectiveButton({ onClick }: { onClick: () => void }) {
  const [hover, setHover] = useState(false);

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'flex',
        alignSelf: 'flex-start',
        alignItems: 'center',
        gap: 5,
        padding: 1,
        borderRadius: 4,
        backgroundColor: hover ? '#053c80' : 'transparent',
        border: 'none',
        cursor: 'pointer',
        transition: 'background-color 100ms',
      }}
    >
      <FontAwesomeIcon icon={faPlus} style={{ width: 13, height: 13, color: hover ? 'white' : '#1f6aac' }} />
      <span style={{ fontSize: 14, fontWeight: 600, color: hover ? 'white' : '#1f6aac' }}>Add</span>
    </button>
  );
}

/**
 * The system's documents, for the "Select from Library" side of the source
 * field. A modal on top of a modal, so it takes the same fixed overlay and
 * closes on Escape or the scrim.
 */
function LibraryPickerDialog({ onPick, onCancel }: { onPick: (name: string) => void; onCancel: () => void }) {
  const [query, setQuery] = useState('');
  const shown = CONTENT_ROWS.filter(r => r.name.toLowerCase().includes(query.toLowerCase()));

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onCancel]);

  return (
    <div
      onClick={onCancel}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(11,21,40,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 60,
        padding: 20,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-label="Select a document"
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: 'min(560px, 100%)',
          maxHeight: '80vh',
          backgroundColor: 'white',
          borderRadius: 10,
          boxShadow: '0px 17px 45px rgba(11,21,40,0.2)',
          fontFamily: "'Open Sans', sans-serif",
          overflow: 'hidden',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px 20px' }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#100040' }}>Select from Library</h3>
          <button onClick={onCancel} aria-label="Close" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}>
            <FontAwesomeIcon icon={faXmark} style={{ width: 16, height: 16, color: '#1f6aac' }} />
          </button>
        </div>
        <div style={{ height: 1, backgroundColor: '#e5e5e5' }} />

        <div style={{ padding: '15px 20px 0' }}>
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search documents"
            autoFocus
            style={{
              width: '100%',
              padding: '7px 10px',
              border: '1px solid #e5e5e5',
              borderRadius: 4,
              outline: 'none',
              fontSize: 14,
              fontFamily: "'Open Sans', sans-serif",
              color: '#100040',
            }}
          />
        </div>

        <div style={{ flex: '1 1 auto', minHeight: 0, overflowY: 'auto', padding: '10px 20px 20px' }}>
          {shown.length === 0 && <p style={{ margin: '10px 0', fontSize: 14, color: '#5d6982' }}>No documents match “{query}”.</p>}
          {shown.map(row => (
            <button
              key={row.id}
              type="button"
              onClick={() => onPick(row.name)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                width: '100%',
                padding: 8,
                background: 'none',
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer',
                textAlign: 'left',
              }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#f7f7f7')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <FontAwesomeIcon icon={faFilePdf} style={{ width: 15, height: 15, color: '#d23c2d', flexShrink: 0 }} />
              <span style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                <span style={{ fontSize: 14, color: '#100040', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.name}</span>
                <span style={{ fontSize: 12, color: '#5d6982' }}>
                  v{row.version} · {row.type}
                </span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/** A flat icon+label action, used by the source field's two ways in. */
function SourceAction({ icon: glyph, label, onClick }: { icon: typeof faPlus; label: string; onClick: () => void }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        padding: '1px 3px',
        flexShrink: 0,
        whiteSpace: 'nowrap',
        borderRadius: 4,
        border: 'none',
        backgroundColor: hover ? '#053c80' : 'transparent',
        cursor: 'pointer',
        fontFamily: "'Open Sans', sans-serif",
        transition: 'background-color 100ms',
      }}
    >
      <FontAwesomeIcon icon={glyph} style={{ width: 13, height: 13, color: hover ? 'white' : '#1f6aac' }} />
      <span style={{ fontSize: 14, fontWeight: 600, color: hover ? 'white' : '#1f6aac' }}>{label}</span>
    </button>
  );
}

/**
 * Source document. Entered with a document already attached (drafting a course
 * from a study document), the field shows that document as a removable pill.
 * Entered empty — Create Course → AI Course Authoring — it offers the two ways
 * to supply one: pick from the documents already in the system, or upload a
 * new file.
 */
function SourceField({
  sourceDoc,
  onRemove,
  onSelectFromLibrary,
  onUpload,
}: {
  sourceDoc: string | null;
  onRemove: () => void;
  onSelectFromLibrary: () => void;
  onUpload: () => void;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5, width: '100%' }}>
      <span style={{ fontSize: 12, fontWeight: 600, color: '#5d6982' }}>
        Source document
        <span aria-hidden="true" style={{ color: '#d23c2d' }}> *</span>
        <span
          style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)', whiteSpace: 'nowrap' }}
        >
          (required)
        </span>
      </span>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          flexWrap: 'wrap',
          padding: 5,
          minHeight: 35,
          backgroundColor: 'white',
          // A required field that is still empty carries the error rule, so
          // the disabled Generate button has a visible reason.
          border: `1px solid ${sourceDoc ? '#e5e5e5' : '#d23c2d'}`,
          borderRadius: 4,
        }}
      >
        {sourceDoc ? (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              height: 25,
              padding: '2px 5px 3px 5px',
              backgroundColor: '#edf5fb',
              border: '1px solid #d2e5f6',
              borderRadius: 4,
              minWidth: 0,
            }}
          >
            <FontAwesomeIcon icon={faFilePdf} style={{ width: 13, height: 13, color: '#d23c2d', flexShrink: 0 }} />
            <span style={{ fontSize: 14, color: '#100040', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sourceDoc}</span>
            <button onClick={onRemove} aria-label="Remove source" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}>
              <FontAwesomeIcon icon={faXmark} style={{ width: 9, height: 9, color: '#576581' }} />
            </button>
          </span>
        ) : (
          <span style={{ fontSize: 14, color: '#5d6982', fontFamily: "'Open Sans', sans-serif" }}>Select or upload the document to generate from</span>
        )}

        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginLeft: 'auto' }}>
          <SourceAction icon={faFolderOpen} label={sourceDoc ? 'Replace' : 'Select from Library'} onClick={onSelectFromLibrary} />
          <SourceAction icon={faArrowUpFromBracket} label="Upload" onClick={onUpload} />
        </span>
      </div>
    </div>
  );
}

export interface ComposeStepProps {
  sourceDoc: string | null;
  onPickSource: (name: string) => void;
  onRemoveSource: () => void;
  description: string;
  onChangeDescription: (value: string) => void;
  lessonType: LessonType;
  onChangeLessonType: (type: LessonType) => void;
  language: string;
  onChangeLanguage: (value: string) => void;
  objectives: string[];
  onChangeObjective: (index: number, value: string) => void;
  onAddObjective: () => void;
  onCancel: () => void;
  onGenerate: () => void;
}

export function ComposeStep({
  sourceDoc,
  onPickSource,
  onRemoveSource,
  description,
  onChangeDescription,
  lessonType,
  onChangeLessonType,
  language,
  onChangeLanguage,
  objectives,
  onChangeObjective,
  onAddObjective,
  onCancel,
  onGenerate,
}: ComposeStepProps) {
  // The source field and the prompt box's "+" are two ways into the same two
  // actions, so the picker and the file input live here rather than in either.
  const [picking, setPicking] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const openUpload = () => fileRef.current?.click();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', flex: '1 1 auto', minHeight: 0, fontFamily: "'Open Sans', sans-serif" }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px 30px 14px 30px' }}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 600, color: '#100040', lineHeight: '30px' }}>
          AI Course Authoring
        </h2>
        <button onClick={onCancel} aria-label="Close" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}>
          <FontAwesomeIcon icon={faXmark} style={{ width: 18, height: 18, color: '#1f6aac' }} />
        </button>
      </div>
      <div style={{ height: 1, backgroundColor: '#e5e5e5', width: '100%' }} />

      {/* Content */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 30, padding: 30, width: '100%', flex: '1 1 auto', minHeight: 0, overflowY: 'auto' }}>
        {/* The course is generated FROM the source document, so it leads the
            form as its own required field rather than sitting inside the
            prompt box, which is optional guidance. */}
        <SourceField
          sourceDoc={sourceDoc}
          onRemove={onRemoveSource}
          onSelectFromLibrary={() => setPicking(true)}
          onUpload={openUpload}
        />

        {/* Prompt box */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 30,
            padding: 15,
            width: '100%',
            backgroundColor: '#fafafa',
            border: '1px solid #ededed',
            borderRadius: 10,
          }}
        >
          <textarea
            value={description}
            onChange={e => onChangeDescription(e.target.value)}
            placeholder="Describe your lesson, audience and goals..."
            rows={3}
            style={{
              width: '100%',
              border: 'none',
              outline: 'none',
              resize: 'none',
              background: 'transparent',
              fontFamily: "'Open Sans', sans-serif",
              fontSize: 14,
              lineHeight: '20px',
              color: '#0b1528',
            }}
          />

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <AttachMenu onSelectFromLibrary={() => setPicking(true)} onUploadNew={openUpload} />
            <button
              type="button"
              aria-label="Voice input"
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '3.5px', display: 'flex' }}
            >
              <FontAwesomeIcon icon={faMicrophone} style={{ width: 15, height: 15, color: '#1f6aac' }} />
            </button>
          </div>
        </div>

        <LessonTypeTags selected={lessonType} onSelect={onChangeLessonType} />

        {/* Language dropdown */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5, width: 190 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#5d6982' }}>Language</span>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              padding: 5,
              width: '100%',
              backgroundColor: 'white',
              border: '1px solid #e5e5e5',
              borderRadius: 4,
            }}
          >
            <FontAwesomeIcon icon={faGlobe} style={{ width: 15, height: 15, color: '#1f6aac', flexShrink: 0 }} />
            <select
              value={language}
              onChange={e => onChangeLanguage(e.target.value)}
              style={{
                flex: '1 0 0',
                border: 'none',
                outline: 'none',
                background: 'transparent',
                appearance: 'none',
                fontSize: 14,
                color: '#100040',
                fontFamily: "'Open Sans', sans-serif",
                cursor: 'pointer',
              }}
            >
              {LANGUAGES.map(l => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
            <FontAwesomeIcon icon={faChevronDown} style={{ width: 11, height: 11, color: '#576581', flexShrink: 0 }} />
          </div>
        </div>

        {/* Objectives */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#5d6982' }}>Objectives</span>
            <p style={{ margin: 0, fontSize: 12, color: '#5d6982', lineHeight: '15px' }}>
              Clear objectives help us structure the course content in the most effective way.
            </p>
          </div>

          {objectives.length > 0 && (
            <div
              style={{
                width: '100%',
                backgroundColor: 'white',
                border: '1px solid #e5e5e5',
                borderRadius: 4,
                padding: 5,
              }}
            >
              <ol style={{ margin: 0, paddingLeft: 21, listStyleType: 'decimal', fontSize: 14, lineHeight: '20px', color: '#5d6982', fontFamily: "'Open Sans', sans-serif" }}>
                {objectives.map((obj, i) => (
                  <li key={i} style={{ marginBottom: i === objectives.length - 1 ? 0 : 8 }}>
                    <input
                      autoFocus={i === objectives.length - 1 && obj === ''}
                      value={obj}
                      onChange={e => onChangeObjective(i, e.target.value)}
                      placeholder="Type an objective..."
                      style={{
                        width: '100%',
                        border: 'none',
                        outline: 'none',
                        background: 'transparent',
                        fontSize: 14,
                        lineHeight: '20px',
                        color: '#100040',
                        fontFamily: "'Open Sans', sans-serif",
                      }}
                    />
                  </li>
                ))}
              </ol>
            </div>
          )}

          <AddObjectiveButton onClick={onAddObjective} />
        </div>
      </div>

      {/* Footer */}
      <div style={{ borderTop: '1px solid #ededed', width: '100%' }}>
        <div
          style={{
            display: 'flex',
            gap: 15,
            alignItems: 'center',
            justifyContent: 'center',
            padding: '15px 0',
            backgroundColor: '#fafafa',
          }}
        >
          <AuthoringButton variant="outline" onClick={onCancel}>Cancel</AuthoringButton>
          {/* Nothing to generate from until a source document is supplied. */}
          <AuthoringButton variant="primary" onClick={onGenerate} disabled={!sourceDoc}>
            Generate Preview
          </AuthoringButton>
        </div>
      </div>

      {/* The file never leaves the browser — the prototype only takes its name. */}
      <input
        ref={fileRef}
        type="file"
        accept=".pdf,.doc,.docx,.ppt,.pptx,.txt"
        onChange={e => {
          const file = e.target.files?.[0];
          if (file) onPickSource(file.name);
          e.target.value = '';
        }}
        style={{ display: 'none' }}
      />

      {picking && (
        <LibraryPickerDialog
          onPick={name => {
            onPickSource(name);
            setPicking(false);
          }}
          onCancel={() => setPicking(false)}
        />
      )}
    </div>
  );
}

export default ComposeStep;
