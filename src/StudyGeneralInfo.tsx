import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faCircleInfo, faEarthAmericas } from '@fortawesome/free-solid-svg-icons';
import { Dashlet, Field } from './dashlet';
import { Chip } from './tableKit';
import { color, type, icon } from './tokens';

// The study's General Info — GL | PROD | 2.7, node 30271:36586, rebuilt on this
// project's DS 2.0 chrome: the site profile's dashlet and read-only Field
// rather than 2.7's own inputs.
//
// The values are the ones the rest of the prototype already states. 123456 is
// the study number the eTMF's generated document names carry
// (123456_DOA_0982_v1.0), and Jenny Wilson owns the DOA Log Template there, so
// the study she owns is this one.

const STUDY = {
  number: '123456',
  name: 'Bivivid',
  owners: ['Jenny Wilson', 'Robert Fox'],
  businessUnit: 'Surgical',
  phase: 'Phase III',
  therapeuticArea: 'Cardiology',
  country: 'USA',
  certificateCcEmail: 'training@bivivid.example',
  description:
    'Multi-site cardiology study. Site training is delegated through each site’s DOA log: the duties it delegates decide which courses that site’s personnel are enrolled in.',
};

/** An info-circle carrying its note as a tooltip, as the site's info does. */
function InfoHint({ note }: { note: string }) {
  return (
    <FontAwesomeIcon
      icon={faCircleInfo}
      title={note}
      tabIndex={0}
      style={{ width: icon.s, height: icon.s, color: color.primary, flexShrink: 0, cursor: 'help' }}
    />
  );
}

/** A field whose value is a set of chips rather than text. */
function ChipField({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5, minWidth: 0 }}>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, ...type.captionRegular, color: color.textMuted }}>
        {label}
        {hint && <InfoHint note={hint} />}
      </span>
      <span
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 5,
          flexWrap: 'wrap',
          minHeight: 30,
          padding: '0 8px',
          backgroundColor: color.pageBg,
          borderBottom: `1px solid ${color.border}`,
          borderRadius: '5px 5px 0 0',
        }}
      >
        {children}
      </span>
    </div>
  );
}

export function StudyGeneralInfo() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 15, minHeight: 0, overflowY: 'auto' }}>
      <Dashlet title="General Info">
        {/* Two columns while there is room, one when there is not — a grid
            rather than wrapping flex, so the columns keep their own top edge
            instead of the left one stretching to fill the row. */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 30, alignItems: 'start' }}>
          {/* Left — what the study IS */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 15, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 15, flexWrap: 'wrap' }}>
              <Field label="Study Number" value={STUDY.number} width={130} />
              <div style={{ flex: '1 1 240px', minWidth: 200 }}>
                <Field label="Study Name" value={STUDY.name} />
              </div>
            </div>

            {/* Owners are people, so they are chips rather than a joined string */}
            <ChipField label="Study Owner">
              {STUDY.owners.map(owner => (
                <Chip key={owner} glyph={faUser} label={owner} theme="info" />
              ))}
            </ChipField>

            <Field label="Business Unit" value={STUDY.businessUnit} />

            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 15, flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 200px', minWidth: 160 }}>
                <Field label="Phase" value={STUDY.phase} />
              </div>
              <div style={{ flex: '1 1 200px', minWidth: 160 }}>
                <Field label="Therapeutic Area" value={STUDY.therapeuticArea} />
              </div>
            </div>
          </div>

          {/* Right — where it runs and who hears about its certificates */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 15, minWidth: 0 }}>
            <ChipField label="Country">
              <Chip glyph={faEarthAmericas} label={STUDY.country} theme="info" />
            </ChipField>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, ...type.captionRegular, color: color.textMuted }}>
                Certificate CC Email
                <InfoHint note="Every training certificate this study issues is copied to this address." />
              </span>
              <span
                title={STUDY.certificateCcEmail}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  height: 30,
                  padding: '0 8px',
                  backgroundColor: color.pageBg,
                  borderBottom: `1px solid ${color.border}`,
                  borderRadius: '5px 5px 0 0',
                  ...type.body,
                  color: color.text,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {STUDY.certificateCcEmail}
              </span>
            </div>

            {/* Description is the one multi-line field — it keeps its height */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <span style={{ ...type.captionRegular, color: color.textMuted }}>Description</span>
              <span
                style={{
                  display: 'block',
                  minHeight: 90,
                  padding: '5px 8px',
                  backgroundColor: color.pageBg,
                  borderBottom: `1px solid ${color.border}`,
                  borderRadius: '5px 5px 0 0',
                  ...type.body,
                  color: color.text,
                }}
              >
                {STUDY.description}
              </span>
            </div>
          </div>
        </div>
      </Dashlet>
    </div>
  );
}

export default StudyGeneralInfo;
