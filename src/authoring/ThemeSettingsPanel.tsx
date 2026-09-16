import { useEffect, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faUpload, faXmark, faImage } from '@fortawesome/free-solid-svg-icons';

// Functional replacement for the static Figma "Theme settings" mock — same
// layout (Logo, preset picker, Page Background, Header/Paragraph typography,
// Auto-color text), wired to real state and styled with this flow's own
// palette (#1f6aac / #100040 / #5d6982 / #e5e5e5, Open Sans).

const FONT_OPTIONS = ['Open Sans', 'Lora', 'Noto Sans', 'Merriweather', 'Georgia'];
const WEIGHT_OPTIONS = ['Regular', 'Medium', 'Semibold', 'Bold'];

interface ThemePreset {
  id: string;
  name: string;
  pageBg: string;
  headerFont: string;
  headerWeight: string;
  headerColor: string;
  paragraphFont: string;
  paragraphWeight: string;
  paragraphColor: string;
}

const THEME_PRESETS: ThemePreset[] = [
  {
    id: 'clean-blue',
    name: 'Clean Blue',
    pageBg: '#F6F4ED',
    headerFont: 'Lora',
    headerWeight: 'Medium',
    headerColor: '#0A0A3F',
    paragraphFont: 'Noto Sans',
    paragraphWeight: 'Regular',
    paragraphColor: '#272727',
  },
  {
    id: 'ocean',
    name: 'Ocean',
    pageBg: '#EDF5FB',
    headerFont: 'Open Sans',
    headerWeight: 'Semibold',
    headerColor: '#100040',
    paragraphFont: 'Open Sans',
    paragraphWeight: 'Regular',
    paragraphColor: '#5D6982',
  },
  {
    id: 'slate',
    name: 'Slate',
    pageBg: '#F5F5F5',
    headerFont: 'Georgia',
    headerWeight: 'Bold',
    headerColor: '#1F2D3D',
    paragraphFont: 'Noto Sans',
    paragraphWeight: 'Regular',
    paragraphColor: '#3C4858',
  },
  {
    id: 'warm-sand',
    name: 'Warm Sand',
    pageBg: '#FBF3E7',
    headerFont: 'Merriweather',
    headerWeight: 'Bold',
    headerColor: '#4A2E1F',
    paragraphFont: 'Lora',
    paragraphWeight: 'Regular',
    paragraphColor: '#5B4636',
  },
];

// Relative luminance → pick a readable dark or light text color for a given
// background hex, used when "Auto-color text" is on.
function contrastingColor(hex: string): string {
  const clean = hex.replace('#', '');
  if (clean.length !== 6) return '#100040';
  const r = parseInt(clean.slice(0, 2), 16) / 255;
  const g = parseInt(clean.slice(2, 4), 16) / 255;
  const b = parseInt(clean.slice(4, 6), 16) / 255;
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luminance > 0.6 ? '#100040' : '#FFFFFF';
}

function FieldLabel({ children }: { children: string }) {
  return <span style={{ fontSize: 12, fontWeight: 600, color: '#5d6982' }}>{children}</span>;
}

function Dropdown({ value, options, onChange, disabled }: { value: string; options: string[]; onChange: (v: string) => void; disabled?: boolean }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 5,
        padding: 5,
        backgroundColor: disabled ? '#fafafa' : 'white',
        border: '1px solid #e5e5e5',
        borderRadius: 4,
        opacity: disabled ? 0.6 : 1,
      }}
    >
      <select
        value={value}
        disabled={disabled}
        onChange={e => onChange(e.target.value)}
        style={{
          flex: '1 0 0',
          border: 'none',
          outline: 'none',
          background: 'transparent',
          appearance: 'none',
          fontSize: 14,
          color: '#100040',
          fontFamily: "'Open Sans', sans-serif",
          cursor: disabled ? 'not-allowed' : 'pointer',
        }}
      >
        {options.map(o => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
      <FontAwesomeIcon icon={faChevronDown} style={{ width: 11, height: 11, color: '#576581', flexShrink: 0 }} />
    </div>
  );
}

function ColorField({ value, onChange, disabled }: { value: string; onChange: (v: string) => void; disabled?: boolean }) {
  const colorInputRef = useRef<HTMLInputElement>(null);
  const [draft, setDraft] = useState(value);

  // Keep the text draft in sync when `value` changes from outside this field
  // (e.g. switching theme presets), not just from this field's own edits.
  useEffect(() => {
    setDraft(value);
  }, [value]);

  const commit = (v: string) => {
    const normalized = v.startsWith('#') ? v : `#${v}`;
    if (/^#[0-9A-Fa-f]{6}$/.test(normalized)) {
      onChange(normalized.toUpperCase());
    } else {
      setDraft(value);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: 5,
        backgroundColor: disabled ? '#fafafa' : 'white',
        border: '1px solid #e5e5e5',
        borderRadius: 4,
        opacity: disabled ? 0.6 : 1,
      }}
    >
      <button
        type="button"
        onClick={() => colorInputRef.current?.click()}
        disabled={disabled}
        aria-label="Pick color"
        style={{
          width: 22,
          height: 22,
          borderRadius: '50%',
          backgroundColor: value,
          border: '1px solid rgba(0,0,0,0.15)',
          padding: 0,
          flexShrink: 0,
          cursor: disabled ? 'not-allowed' : 'pointer',
        }}
      />
      <input
        ref={colorInputRef}
        type="color"
        value={value}
        disabled={disabled}
        onChange={e => {
          setDraft(e.target.value.toUpperCase());
          onChange(e.target.value.toUpperCase());
        }}
        style={{ position: 'absolute', width: 0, height: 0, opacity: 0, pointerEvents: 'none' }}
      />
      <input
        value={draft}
        disabled={disabled}
        onChange={e => setDraft(e.target.value)}
        onBlur={e => commit(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter') commit((e.target as HTMLInputElement).value);
        }}
        style={{
          flex: '1 0 0',
          minWidth: 0,
          border: 'none',
          outline: 'none',
          background: 'transparent',
          fontSize: 14,
          color: '#100040',
          fontFamily: "'Open Sans', sans-serif",
          textTransform: 'uppercase',
        }}
      />
    </div>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      style={{
        width: 34,
        height: 18,
        borderRadius: 9,
        border: 'none',
        padding: 2,
        display: 'flex',
        justifyContent: checked ? 'flex-end' : 'flex-start',
        backgroundColor: checked ? '#1f6aac' : '#d9d9df',
        cursor: 'pointer',
        transition: 'background-color 150ms',
        flexShrink: 0,
      }}
    >
      <div style={{ width: 14, height: 14, borderRadius: '50%', backgroundColor: 'white', boxShadow: '0px 1px 2px rgba(0,0,0,0.3)' }} />
    </button>
  );
}

export function ThemeSettingsPanel() {
  const [presetId, setPresetId] = useState(THEME_PRESETS[0].id);
  const preset = THEME_PRESETS.find(p => p.id === presetId) ?? THEME_PRESETS[0];

  const [pageBg, setPageBg] = useState(preset.pageBg);
  const [pageBgImage, setPageBgImage] = useState<string | null>(null);
  const [headerFont, setHeaderFont] = useState(preset.headerFont);
  const [headerWeight, setHeaderWeight] = useState(preset.headerWeight);
  const [headerColor, setHeaderColor] = useState(preset.headerColor);
  const [paragraphFont, setParagraphFont] = useState(preset.paragraphFont);
  const [paragraphWeight, setParagraphWeight] = useState(preset.paragraphWeight);
  const [paragraphColor, setParagraphColor] = useState(preset.paragraphColor);
  const [autoColorText, setAutoColorText] = useState(false);
  const [logo, setLogo] = useState<string | null>(null);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const bgImageInputRef = useRef<HTMLInputElement>(null);

  const applyPreset = (id: string) => {
    setPresetId(id);
    const p = THEME_PRESETS.find(x => x.id === id) ?? THEME_PRESETS[0];
    setPageBg(p.pageBg);
    setPageBgImage(null);
    setHeaderFont(p.headerFont);
    setHeaderWeight(p.headerWeight);
    setHeaderColor(p.headerColor);
    setParagraphFont(p.paragraphFont);
    setParagraphWeight(p.paragraphWeight);
    setParagraphColor(p.paragraphColor);
  };

  const readFileAsDataUrl = (file: File, onLoad: (url: string) => void) => {
    const reader = new FileReader();
    reader.onload = () => onLoad(reader.result as string);
    reader.readAsDataURL(file);
  };

  const effectiveHeaderColor = autoColorText ? contrastingColor(pageBg) : headerColor;
  const effectiveParagraphColor = autoColorText ? contrastingColor(pageBg) : paragraphColor;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Logo */}
      <input
        ref={logoInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={e => {
          const file = e.target.files?.[0];
          if (file) readFileAsDataUrl(file, setLogo);
        }}
      />
      <button
        type="button"
        onClick={() => logoInputRef.current?.click()}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          width: '100%',
          padding: '10px 15px',
          backgroundColor: 'white',
          border: '1px solid #e5e5e5',
          borderRadius: 4,
          cursor: 'pointer',
        }}
      >
        {logo ? (
          <>
            <img src={logo} alt="Logo preview" style={{ height: 20, maxWidth: 80, objectFit: 'contain' }} />
            <span style={{ fontSize: 14, color: '#100040', fontFamily: "'Open Sans', sans-serif" }}>Logo</span>
            <span
              role="button"
              tabIndex={0}
              onClick={e => {
                e.stopPropagation();
                setLogo(null);
              }}
              style={{ display: 'flex', marginLeft: 4 }}
            >
              <FontAwesomeIcon icon={faXmark} style={{ width: 12, height: 12, color: '#576581' }} />
            </span>
          </>
        ) : (
          <>
            <FontAwesomeIcon icon={faUpload} style={{ width: 13, height: 13, color: '#1f6aac' }} />
            <span style={{ fontSize: 14, color: '#100040', fontFamily: "'Open Sans', sans-serif" }}>Logo</span>
          </>
        )}
      </button>

      {/* Preset picker */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: 10,
          backgroundColor: 'white',
          border: '1px solid #d2e5f6',
          borderRadius: 6,
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ fontSize: 10, color: '#5d6982' }}>Title</span>
            <div style={{ width: 16, height: 4, borderRadius: 2, backgroundColor: effectiveHeaderColor }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ fontSize: 10, color: '#5d6982' }}>body</span>
            <div style={{ width: 16, height: 4, borderRadius: 2, backgroundColor: effectiveParagraphColor }} />
          </div>
        </div>
        <div style={{ flex: '1 0 0', display: 'flex', alignItems: 'center', gap: 5, minWidth: 0 }}>
          <select
            value={presetId}
            onChange={e => applyPreset(e.target.value)}
            style={{
              flex: '1 0 0',
              border: 'none',
              outline: 'none',
              background: 'transparent',
              appearance: 'none',
              fontSize: 16,
              fontWeight: 600,
              color: '#100040',
              fontFamily: "'Open Sans', sans-serif",
              cursor: 'pointer',
            }}
          >
            {THEME_PRESETS.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <FontAwesomeIcon icon={faChevronDown} style={{ width: 11, height: 11, color: '#576581', flexShrink: 0 }} />
        </div>
      </div>

      {/* Page background */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        <FieldLabel>Page Background</FieldLabel>
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ flex: '1 0 0', minWidth: 0 }}>
            {pageBgImage ? (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: 5,
                  backgroundColor: 'white',
                  border: '1px solid #e5e5e5',
                  borderRadius: 4,
                }}
              >
                <img src={pageBgImage} alt="Background preview" style={{ width: 22, height: 22, borderRadius: 4, objectFit: 'cover', flexShrink: 0 }} />
                <span style={{ flex: '1 0 0', fontSize: 14, color: '#100040', fontFamily: "'Open Sans', sans-serif" }}>Custom image</span>
                <button
                  type="button"
                  onClick={() => setPageBgImage(null)}
                  aria-label="Remove background image"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}
                >
                  <FontAwesomeIcon icon={faXmark} style={{ width: 12, height: 12, color: '#576581' }} />
                </button>
              </div>
            ) : (
              <ColorField value={pageBg} onChange={setPageBg} />
            )}
          </div>
          <input
            ref={bgImageInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={e => {
              const file = e.target.files?.[0];
              if (file) readFileAsDataUrl(file, setPageBgImage);
            }}
          />
          <button
            type="button"
            onClick={() => bgImageInputRef.current?.click()}
            aria-label="Upload background image"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 32,
              height: 32,
              flexShrink: 0,
              backgroundColor: 'white',
              border: '1px solid #e5e5e5',
              borderRadius: 4,
              cursor: 'pointer',
            }}
          >
            <FontAwesomeIcon icon={faImage} style={{ width: 14, height: 14, color: '#1f6aac' }} />
          </button>
        </div>
      </div>

      {/* Header / Paragraph typography */}
      <div style={{ display: 'flex', gap: 15 }}>
        <div style={{ flex: '1 0 0', display: 'flex', flexDirection: 'column', gap: 8, minWidth: 0 }}>
          <FieldLabel>Header</FieldLabel>
          <Dropdown value={headerFont} options={FONT_OPTIONS} onChange={setHeaderFont} />
          <Dropdown value={headerWeight} options={WEIGHT_OPTIONS} onChange={setHeaderWeight} />
          <ColorField value={headerColor} onChange={setHeaderColor} disabled={autoColorText} />
        </div>
        <div style={{ flex: '1 0 0', display: 'flex', flexDirection: 'column', gap: 8, minWidth: 0 }}>
          <FieldLabel>Paragraph</FieldLabel>
          <Dropdown value={paragraphFont} options={FONT_OPTIONS} onChange={setParagraphFont} />
          <Dropdown value={paragraphWeight} options={WEIGHT_OPTIONS} onChange={setParagraphWeight} />
          <ColorField value={paragraphColor} onChange={setParagraphColor} disabled={autoColorText} />
        </div>
      </div>

      {/* Auto-color text */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <span style={{ fontSize: 14, color: '#100040', fontFamily: "'Open Sans', sans-serif" }}>Auto-color text</span>
          <span style={{ fontSize: 12, color: '#5d6982' }}>Picks readable header and paragraph colors from the page background.</span>
        </div>
        <Toggle checked={autoColorText} onChange={setAutoColorText} />
      </div>

      {/* Live preview */}
      <div
        style={{
          padding: 15,
          borderRadius: 6,
          border: '1px solid #e5e5e5',
          backgroundColor: pageBg,
          backgroundImage: pageBgImage ? `url(${pageBgImage})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <p
          style={{
            margin: '0 0 6px 0',
            fontSize: 16,
            fontFamily: `'${headerFont}', serif`,
            fontWeight: headerWeight === 'Bold' ? 700 : headerWeight === 'Semibold' ? 600 : headerWeight === 'Medium' ? 500 : 400,
            color: effectiveHeaderColor,
          }}
        >
          Preview heading
        </p>
        <p
          style={{
            margin: 0,
            fontSize: 13,
            lineHeight: '18px',
            fontFamily: `'${paragraphFont}', sans-serif`,
            fontWeight: paragraphWeight === 'Bold' ? 700 : paragraphWeight === 'Semibold' ? 600 : paragraphWeight === 'Medium' ? 500 : 400,
            color: effectiveParagraphColor,
          }}
        >
          This is how paragraph text will look with the selected theme.
        </p>
      </div>
    </div>
  );
}

export default ThemeSettingsPanel;
