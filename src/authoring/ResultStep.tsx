import { useEffect, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faXmark,
  faFilePdf,
  faEye,
  faCaretDown,
  faCaretRight,
  faCirclePlus,
  faMicrophone,
  faChevronDown,
  faGlobe,
  faPlus,
} from '@fortawesome/free-solid-svg-icons';
import { ChatMessage, RightPanelTab } from './types';
import { LANGUAGES, DEFAULT_SOURCE_DOC } from './mockData';
import { GENERATED_SLIDES, DOC_PAGES, SlideThumbnail, PageBlock } from './GeneratedSlideContent';
import { AuthoringButton } from './AuthoringButton';
import { ThemeSettingsPanel } from './ThemeSettingsPanel';
import { useMediaQuery } from './useMediaQuery';

export interface ResultStepProps {
  activeSlideId: string;
  onSelectSlide: (id: string) => void;
  rightTab: RightPanelTab;
  onChangeTab: (tab: RightPanelTab) => void;
  description: string;
  composedAt: string;
  chatMessages: ChatMessage[];
  onSendFollowUp: (text: string) => void;
  followUpPending: boolean;
  language: string;
  onChangeLanguage: (value: string) => void;
  objectives: string[];
  onChangeObjective: (index: number, value: string) => void;
  onAddObjective: () => void;
  onApply: () => void;
  onSaveDraft: () => void;
  onClose: () => void;
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

// Figma "Design Library | PROD | 1.0" — RightPanel/Section Header (Expanded,
// no icon/counter/edit variant): caret + SemiBold 16px label, bottom divider.
function SectionHeader({ label, expanded, onToggle }: { label: string; expanded: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 5,
        width: '100%',
        padding: '5px 15px',
        background: 'none',
        border: 'none',
        borderBottom: '1px solid #e5e5e5',
        cursor: 'pointer',
        textAlign: 'left',
      }}
    >
      <FontAwesomeIcon icon={expanded ? faCaretDown : faCaretRight} style={{ width: 15, height: 15, color: '#1f6aac', flexShrink: 0 }} />
      <span style={{ fontSize: 16, fontWeight: 600, lineHeight: '25px', color: '#1f6aac' }}>{label}</span>
    </button>
  );
}

function ScopeBarTab({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: '1 0 0',
        padding: '5px 15px',
        border: 'none',
        cursor: 'pointer',
        fontSize: 14,
        fontFamily: "'Open Sans', sans-serif",
        backgroundColor: active ? '#5391c6' : '#edf5fb',
        color: active ? 'white' : '#100040',
      }}
    >
      {label}
    </button>
  );
}

export function ResultStep({
  activeSlideId,
  onSelectSlide,
  rightTab,
  onChangeTab,
  description,
  composedAt,
  chatMessages,
  onSendFollowUp,
  followUpPending,
  language,
  onChangeLanguage,
  objectives,
  onChangeObjective,
  onAddObjective,
  onApply,
  onSaveDraft,
  onClose,
}: ResultStepProps) {
  const [followUpText, setFollowUpText] = useState('');
  const [previewMode, setPreviewMode] = useState(false);
  const [generalExpanded, setGeneralExpanded] = useState(true);
  const [themeExpanded, setThemeExpanded] = useState(true);
  const isWide = useMediaQuery('(min-width: 1024px)');
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const submitFollowUp = () => {
    const text = followUpText.trim();
    if (!text) return;
    onSendFollowUp(text);
    setFollowUpText('');
  };

  // The center panel is one continuously scrollable document — as the user
  // scrolls past each page, sync the left-side thumbnail highlight to match
  // whichever page is currently at the top of the viewport.
  useEffect(() => {
    const root = scrollContainerRef.current;
    if (!root) return;
    const observer = new IntersectionObserver(
      entries => {
        const visible = entries.filter(e => e.isIntersecting);
        if (visible.length === 0) return;
        const topMost = visible.reduce((a, b) => (a.boundingClientRect.top < b.boundingClientRect.top ? a : b));
        const id = topMost.target.getAttribute('data-page-id');
        if (id) onSelectSlide(id);
      },
      { root, rootMargin: '0px 0px -70% 0px', threshold: 0 }
    );
    Object.values(pageRefs.current).forEach(el => el && observer.observe(el));
    return () => observer.disconnect();
    // Re-run when previewMode toggles: that swaps in a whole new scroll
    // container + page elements, so the observer needs to re-attach to them.
  }, [onSelectSlide, previewMode]);

  const scrollToPage = (id: string) => {
    onSelectSlide(id);
    pageRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', fontFamily: "'Open Sans', sans-serif" }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px 30px 14px 30px' }}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 600, color: '#100040', lineHeight: '30px' }}>
          AI Course Authoring
        </h2>
        <div style={{ display: 'flex', gap: 15, alignItems: 'center' }}>
          {previewMode ? (
            <AuthoringButton variant="secondary" onClick={() => setPreviewMode(false)}>Exit Preview</AuthoringButton>
          ) : (
            <>
              <AuthoringButton variant="secondary" onClick={() => setPreviewMode(true)}>Preview</AuthoringButton>
              <AuthoringButton variant="primary" onClick={onSaveDraft}>Save as Draft</AuthoringButton>
            </>
          )}
          <button onClick={onClose} aria-label="Close" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}>
            <FontAwesomeIcon icon={faXmark} style={{ width: 18, height: 18, color: '#1f6aac' }} />
          </button>
        </div>
      </div>
      <div style={{ height: 1, backgroundColor: '#e5e5e5', width: '100%' }} />

      {previewMode && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            padding: '8px 30px',
            backgroundColor: '#100040',
            flexShrink: 0,
          }}
        >
          <FontAwesomeIcon icon={faEye} style={{ width: 13, height: 13, color: 'white' }} />
          <span style={{ fontSize: 13, fontWeight: 600, color: 'white', letterSpacing: '0.02em' }}>
            PREVIEW MODE — this is what learners will see
          </span>
        </div>
      )}

      {/* Body */}
      {previewMode ? (
        // Preview mode: no thumbnail rail, no Edit/Settings panel — the
        // document fills the full width and height of the modal, exactly
        // like what a learner would see.
        <div
          ref={scrollContainerRef}
          style={{
            flex: '1 0 0',
            minHeight: 0,
            width: '100%',
            overflowY: 'auto',
            display: 'flex',
            justifyContent: 'center',
            backgroundColor: '#f5f5f5',
            padding: 30,
          }}
        >
          <div style={{ width: '100%', maxWidth: 900, display: 'flex', flexDirection: 'column', gap: 20 }}>
            {DOC_PAGES.map(page => (
              <div key={page.id} ref={el => (pageRefs.current[page.id] = el)} data-page-id={page.id}>
                <PageBlock page={page} />
              </div>
            ))}
          </div>
        </div>
      ) : (
      <div style={{ display: 'flex', flexDirection: isWide ? 'row' : 'column', flex: '1 0 0', minHeight: 0, width: '100%', overflowY: isWide ? 'hidden' : 'auto' }}>
        {/* Left: slide list */}
        <div
          style={{
            display: 'flex',
            flexDirection: isWide ? 'column' : 'row',
            gap: 15,
            width: isWide ? 300 : '100%',
            padding: 15,
            borderRight: isWide ? '1px solid #e5e5e5' : 'none',
            borderBottom: isWide ? 'none' : '1px solid #e5e5e5',
            overflowY: isWide ? 'auto' : 'visible',
            overflowX: isWide ? 'visible' : 'auto',
            flexShrink: 0,
          }}
        >
          {GENERATED_SLIDES.map((slide, index) => {
            const active = slide.id === activeSlideId;
            return (
              <div key={slide.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                <button
                  onClick={() => scrollToPage(slide.id)}
                  title={slide.label}
                  style={{
                    display: 'block',
                    width: isWide ? '100%' : 130,
                    height: 120,
                    padding: 0,
                    flexShrink: 0,
                    border: active ? `3px solid ${slide.accent}4d` : '1px solid #e5e5e5',
                    borderRadius: 5,
                    overflow: 'hidden',
                    cursor: 'pointer',
                    boxShadow: active ? '0px 14px 27px -2px rgba(0,0,0,0.17)' : '0px 4px 4px rgba(0,0,0,0.08)',
                  }}
                >
                  <SlideThumbnail slide={slide} active={active} />
                </button>
                <span style={{ fontSize: 12, color: '#5d6982', fontFamily: "'Open Sans', sans-serif" }}>{index + 1}</span>
              </div>
            );
          })}
        </div>

        {/* Center: the whole document, scrollable — sidebar highlight tracks
            whichever page is currently in view (see the IntersectionObserver
            effect above), rather than showing one page at a time. */}
        <div
          ref={scrollContainerRef}
          style={{
            flex: '1 0 0',
            minWidth: 0,
            padding: isWide ? 30 : 15,
            overflowY: isWide ? 'auto' : 'visible',
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <div style={{ width: '100%', maxWidth: 700, display: 'flex', flexDirection: 'column', gap: 20 }}>
            {DOC_PAGES.map(page => (
              <div key={page.id} ref={el => (pageRefs.current[page.id] = el)} data-page-id={page.id}>
                <PageBlock page={page} />
              </div>
            ))}
          </div>
        </div>

        {/* Right: Edit / Settings */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            width: isWide ? 300 : '100%',
            minHeight: isWide ? undefined : 400,
            borderLeft: isWide ? '1px solid #e5e5e5' : 'none',
            borderTop: isWide ? 'none' : '1px solid #e5e5e5',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', height: 30, margin: 15, border: '1px solid #d2e5f6', borderRadius: 4, overflow: 'hidden' }}>
            <ScopeBarTab label="Edit" active={rightTab === 'edit'} onClick={() => onChangeTab('edit')} />
            <ScopeBarTab label="Settings" active={rightTab === 'settings'} onClick={() => onChangeTab('settings')} />
          </div>

          {rightTab === 'edit' ? (
            <div style={{ display: 'flex', flexDirection: 'column', flex: '1 0 0', minHeight: 0 }}>
              <div style={{ flex: '1 0 0', minHeight: 0, overflowY: 'auto', padding: '0 15px', display: 'flex', flexDirection: 'column', gap: 15 }}>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-end',
                    gap: 5,
                    padding: 10,
                    minWidth: 0,
                    backgroundColor: 'rgba(115,73,170,0.1)',
                    borderRadius: '10px 2px 10px 10px',
                  }}
                >
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 5,
                      height: 25,
                      minWidth: 0,
                      maxWidth: '100%',
                      padding: '2px 5px 3px 5px',
                      backgroundColor: '#edf5fb',
                      border: '1px solid #d2e5f6',
                      borderRadius: 4,
                    }}
                  >
                    <FontAwesomeIcon icon={faFilePdf} style={{ width: 13, height: 13, color: '#d23c2d', flexShrink: 0 }} />
                    <span
                      style={{
                        fontSize: 14,
                        color: '#100040',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {DEFAULT_SOURCE_DOC}
                    </span>
                  </div>
                  {description && (
                    <p style={{ margin: 0, fontSize: 14, color: '#0b1528', textAlign: 'right' }}>{description}</p>
                  )}
                  <span style={{ fontSize: 12, color: '#576581' }}>{composedAt}</span>
                </div>

                {chatMessages.map(msg => (
                  <div
                    key={msg.id}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: msg.from === 'user' ? 'flex-end' : 'flex-start',
                      gap: 5,
                    }}
                  >
                    {msg.from === 'user' ? (
                      <div
                        style={{
                          padding: 10,
                          backgroundColor: 'rgba(115,73,170,0.1)',
                          borderRadius: '10px 2px 10px 10px',
                          maxWidth: '90%',
                        }}
                      >
                        <p style={{ margin: 0, fontSize: 14, color: '#0b1528' }}>{msg.text}</p>
                      </div>
                    ) : (
                      msg.text.split('\n\n').map((para, i) => (
                        <p key={i} style={{ margin: 0, fontSize: 14, color: '#0b1528', lineHeight: '20px' }}>
                          {para}
                        </p>
                      ))
                    )}
                    <span style={{ fontSize: 12, color: '#576581' }}>{msg.timestamp}</span>
                  </div>
                ))}

                {followUpPending && (
                  <p style={{ margin: 0, fontSize: 14, color: '#576581', fontStyle: 'italic' }}>Updating…</p>
                )}
              </div>

              <div style={{ padding: 15 }}>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 15,
                    padding: 15,
                    backgroundColor: '#fafafa',
                    border: '1px solid #ededed',
                    borderRadius: 10,
                  }}
                >
                  <textarea
                    value={followUpText}
                    onChange={e => setFollowUpText(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        submitFollowUp();
                      }
                    }}
                    placeholder="Change anything or add something new"
                    rows={2}
                    style={{
                      width: '100%',
                      border: 'none',
                      outline: 'none',
                      resize: 'none',
                      background: 'transparent',
                      fontFamily: "'Open Sans', sans-serif",
                      fontSize: 14,
                      color: '#0b1528',
                    }}
                  />
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <FontAwesomeIcon icon={faCirclePlus} style={{ width: 15, height: 15, color: '#1f6aac' }} />
                    <button
                      onClick={submitFollowUp}
                      aria-label="Send"
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}
                    >
                      <FontAwesomeIcon icon={faMicrophone} style={{ width: 15, height: 15, color: '#1f6aac' }} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', flex: '1 0 0', minHeight: 0 }}>
              <div style={{ flex: '1 0 0', minHeight: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
                <section>
                  <SectionHeader label="General" expanded={generalExpanded} onToggle={() => setGeneralExpanded(v => !v)} />
                  {generalExpanded && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 30, padding: 15 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 5, width: '100%' }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#5d6982' }}>Language</span>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 5,
                          padding: 5,
                          backgroundColor: 'white',
                          border: '1px solid #e5e5e5',
                          borderRadius: 4,
                        }}
                      >
                        <FontAwesomeIcon icon={faGlobe} style={{ width: 15, height: 15, color: '#1f6aac', flexShrink: 0 }} />
                        <select
                          value={language}
                          onChange={e => onChangeLanguage(e.target.value)}
                          style={{ flex: '1 0 0', border: 'none', outline: 'none', background: 'transparent', appearance: 'none', fontSize: 14, color: '#100040', fontFamily: "'Open Sans', sans-serif", cursor: 'pointer' }}
                        >
                          {LANGUAGES.map(l => (
                            <option key={l} value={l}>{l}</option>
                          ))}
                        </select>
                        <FontAwesomeIcon icon={faChevronDown} style={{ width: 11, height: 11, color: '#576581', flexShrink: 0 }} />
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: '#5d6982' }}>Objectives</span>
                        <p style={{ margin: 0, fontSize: 12, color: '#5d6982', lineHeight: '15px' }}>
                          Clear objectives help us structure the course content in the most effective way.
                        </p>
                      </div>

                      {objectives.length > 0 && (
                        <div style={{ width: '100%', backgroundColor: 'white', border: '1px solid #e5e5e5', borderRadius: 4, padding: 5 }}>
                          <ol style={{ margin: 0, paddingLeft: 21, listStyleType: 'decimal', fontSize: 14, lineHeight: '20px', color: '#5d6982', fontFamily: "'Open Sans', sans-serif" }}>
                            {objectives.map((obj, i) => (
                              <li key={i} style={{ marginBottom: i === objectives.length - 1 ? 0 : 8 }}>
                                <input
                                  value={obj}
                                  onChange={e => onChangeObjective(i, e.target.value)}
                                  placeholder="Type an objective..."
                                  style={{ width: '100%', border: 'none', outline: 'none', background: 'transparent', fontSize: 14, lineHeight: '20px', color: '#100040', fontFamily: "'Open Sans', sans-serif" }}
                                />
                              </li>
                            ))}
                          </ol>
                        </div>
                      )}

                      <AddObjectiveButton onClick={onAddObjective} />
                    </div>
                  </div>
                  )}
                </section>

                <section>
                  <SectionHeader label="Theme" expanded={themeExpanded} onToggle={() => setThemeExpanded(v => !v)} />
                  {themeExpanded && (
                    <div style={{ padding: 15 }}>
                      <ThemeSettingsPanel />
                    </div>
                  )}
                </section>
              </div>

              <div style={{ padding: 15, backgroundColor: '#edf5fb', borderTop: '1px solid #e5e5e5' }}>
                <AuthoringButton variant="primary" onClick={onApply} style={{ width: '100%' }}>
                  Apply Changes
                </AuthoringButton>
              </div>
            </div>
          )}
        </div>
      </div>
      )}
    </div>
  );
}

export default ResultStep;
