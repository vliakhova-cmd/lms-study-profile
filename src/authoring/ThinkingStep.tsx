import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faWandMagicSparkles } from '@fortawesome/free-solid-svg-icons';

export interface ThinkingStepProps {
  onCancel: () => void;
}

const TWINKLE_STARS = [
  { top: -6, left: 40, size: 11, color: '#e6d9f5', delay: 0 },
  { top: 30, left: -14, size: 8, color: '#b48ddb', delay: 0.5 },
  { top: 44, left: 46, size: 9, color: '#7349aa', delay: 1 },
];

// A four-pointed sparkle glyph (not FontAwesome's 5-point star).
function FourPointStar({ size, color, style }: { size: number; color: string; style?: React.CSSProperties }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} style={style}>
      <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.582a.5.5 0 0 1 0 .962L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
    </svg>
  );
}

export function ThinkingStep({ onCancel }: ThinkingStepProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', fontFamily: "'Open Sans', sans-serif" }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px 30px 14px 30px' }}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 600, color: '#100040', lineHeight: '30px' }}>
          AI Course Authoring
        </h2>
        <button onClick={onCancel} aria-label="Close" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}>
          <FontAwesomeIcon icon={faXmark} style={{ width: 18, height: 18, color: '#1f6aac' }} />
        </button>
      </div>
      <div style={{ height: 1, backgroundColor: '#e5e5e5', width: '100%' }} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 15, alignItems: 'center', justifyContent: 'center', height: 450, padding: 30 }}>
        <div style={{ position: 'relative', width: 64, height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(115,73,170,0.35) 0%, rgba(115,73,170,0) 70%)',
              animation: 'ai-course-authoring-glow 1.6s ease-in-out infinite',
            }}
          />
          {TWINKLE_STARS.map((star, i) => (
            <FourPointStar
              key={i}
              size={star.size}
              color={star.color}
              style={{
                position: 'absolute',
                top: star.top,
                left: star.left,
                animation: `ai-course-authoring-twinkle 1.8s ease-in-out ${star.delay}s infinite`,
              }}
            />
          ))}
          <FontAwesomeIcon
            icon={faWandMagicSparkles}
            style={{ width: 32, height: 32, color: '#7349aa', position: 'relative' }}
          />
        </div>
        <p style={{ margin: 0, fontSize: 20, fontWeight: 600, color: 'black' }}>Thinking...</p>
      </div>

      <style>{`
        @keyframes ai-course-authoring-glow {
          0%, 100% { transform: scale(0.85); opacity: 0.5; }
          50% { transform: scale(1.3); opacity: 1; }
        }
        @keyframes ai-course-authoring-twinkle {
          0%, 100% { opacity: 0; transform: scale(0.4) rotate(0deg); }
          50% { opacity: 1; transform: scale(1) rotate(20deg); }
        }
      `}</style>
    </div>
  );
}

export default ThinkingStep;
