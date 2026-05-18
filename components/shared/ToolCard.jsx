import { useState } from 'react';

const F = {
  sans: "'Plus Jakarta Sans', sans-serif",
};

// Stagger delay by index (cycles 0–5)
const STAGGER_DELAYS = [0, 0.05, 0.1, 0.15, 0.2, 0.25];

export default function ToolCard({ tool, theme, onClick, isActive, index = 0 }) {
  const [hovered, setHovered] = useState(false);
  const delay = STAGGER_DELAYS[index % STAGGER_DELAYS.length];

  const cardStyle = {
    background:    isActive
      ? theme.colorLight
      : hovered ? '#1E293B' : '#0F172A',
    border:        `1px solid ${
      isActive
        ? theme.color
        : hovered
          ? `${theme.color}66`
          : 'rgba(255,255,255,0.06)'
    }`,
    borderRadius:  12,
    padding:       20,
    cursor:        'pointer',
    transition:    'background 0.2s, border-color 0.2s, transform 0.2s, box-shadow 0.2s',
    transform:     hovered && !isActive ? 'translateY(-2px)' : 'none',
    boxShadow:     hovered
      ? `0 8px 24px rgba(0,0,0,0.24), 0 0 0 1px ${theme.color}22`
      : isActive
        ? `0 0 0 1px ${theme.color}44`
        : 'none',
    animation:     `fadeUp 0.5s ease ${delay}s both`,
    minWidth:      0,
    userSelect:    'none',
  };

  const iconWrapStyle = {
    width:        32,
    height:       32,
    borderRadius: 8,
    background:   isActive ? `${theme.color}30` : `${theme.color}22`,
    display:      'flex',
    alignItems:   'center',
    justifyContent: 'center',
    fontSize:     16,
    flexShrink:   0,
    transition:   'background 0.2s',
  };

  return (
    <div
      style={cardStyle}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      role="button"
      tabIndex={0}
      onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && onClick?.()}
      aria-pressed={isActive}
    >
      {/* Icon */}
      <div style={iconWrapStyle}>
        <span role="img" aria-hidden="true">{tool.icon}</span>
      </div>

      {/* Name */}
      <div style={{
        fontFamily:  F.sans,
        fontSize:    15,
        fontWeight:  600,
        color:       isActive ? '#F8FAFC' : hovered ? '#F1F5F9' : '#E2E8F0',
        marginTop:   12,
        lineHeight:  1.3,
        transition:  'color 0.15s',
      }}>
        {tool.name}
      </div>

      {/* Description — 2-line clamp */}
      <div style={{
        fontFamily:        F.sans,
        fontSize:          13,
        color:             '#64748B',
        marginTop:         4,
        lineHeight:        1.5,
        display:           '-webkit-box',
        WebkitLineClamp:   2,
        WebkitBoxOrient:   'vertical',
        overflow:          'hidden',
        textOverflow:      'ellipsis',
      }}>
        {tool.description}
      </div>
    </div>
  );
}
