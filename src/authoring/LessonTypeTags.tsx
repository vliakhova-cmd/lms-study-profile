import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileLines, faVideo, faMagnifyingGlass, faListCheck } from '@fortawesome/free-solid-svg-icons';
import { LessonType } from './types';
import { LESSON_TYPES } from './mockData';

const ICONS: Record<LessonType, typeof faFileLines> = {
  document: faFileLines,
  video: faVideo,
  analysis: faMagnifyingGlass,
  assessment: faListCheck,
};

export interface LessonTypeTagsProps {
  selected: LessonType;
  onSelect: (type: LessonType) => void;
}

export function LessonTypeTags({ selected, onSelect }: LessonTypeTagsProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5, alignItems: 'flex-start', width: '100%' }}>
      <span style={{ fontSize: 12, fontWeight: 600, color: '#5d6982', fontFamily: "'Open Sans', sans-serif" }}>
        Lesson Type
      </span>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {LESSON_TYPES.map(lt => {
          const isOn = selected === lt.id;
          return (
            <button
              key={lt.id}
              type="button"
              onClick={() => onSelect(lt.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                padding: '5px 10px',
                borderRadius: 100,
                cursor: 'pointer',
                border: `1px solid ${lt.border}`,
                backgroundColor: isOn ? lt.color : lt.bg,
                fontFamily: "'Open Sans', sans-serif",
              }}
            >
              <FontAwesomeIcon icon={ICONS[lt.id]} style={{ width: 13, height: 13, color: isOn ? 'white' : lt.color }} />
              <span style={{ fontSize: 14, color: isOn ? 'white' : '#100040' }}>{lt.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default LessonTypeTags;
