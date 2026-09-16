import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons';

// Shown briefly after "Save as Draft" — distinct from ThinkingStep's magic-
// wand ("AI is generating") since this is a plain save/persist action.
export function SavingStep() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', fontFamily: "'Open Sans', sans-serif" }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px 30px 14px 30px' }}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 600, color: '#100040', lineHeight: '30px' }}>
          AI Course Authoring
        </h2>
      </div>
      <div style={{ height: 1, backgroundColor: '#e5e5e5', width: '100%' }} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 15, alignItems: 'center', justifyContent: 'center', height: 450, padding: 30 }}>
        <FontAwesomeIcon
          icon={faCircleNotch}
          spin
          style={{ width: 40, height: 40, color: '#1f6aac' }}
        />
        <p style={{ margin: 0, fontSize: 20, fontWeight: 600, color: '#100040' }}>Saving as draft...</p>
      </div>
    </div>
  );
}

export default SavingStep;
