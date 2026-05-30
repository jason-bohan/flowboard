import type { CSSProperties } from 'react';
import { useFlowMode } from './FlowModeProvider.js';
import { FLOW_MODES } from './flowMode.js';

const MODE_COLORS: Record<string, { bg: string; accent: string; label: string }> = {
  finance: { bg: '#c0392b', accent: '#e74c3c', label: 'Finance' },
  planner: { bg: '#1a6b8a', accent: '#2a9fd6', label: 'Planner' },
};

const styles: Record<string, CSSProperties> = {
  wrapper: {
    display: 'flex',
    gap: 4,
    marginLeft: 'auto',
  },
  btn: {
    border: '1px solid #30363d',
    borderRadius: 6,
    padding: '6px 14px',
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
    background: 'transparent',
    color: '#8b949e',
    transition: 'all 0.15s',
  },
  btnActive: (bg: string, accent: string): CSSProperties => ({
    border: `1px solid ${accent}`,
    background: bg,
    color: '#fff',
    boxShadow: `0 0 0 1px ${accent}`,
  }),
};

export default function FlowModeSelector() {
  const { mode, setMode } = useFlowMode();

  return (
    <div style={styles.wrapper}>
      {FLOW_MODES.map((fm) => {
        const colors = MODE_COLORS[fm.mode];
        const active = mode === fm.mode;
        return (
          <button
            key={fm.mode}
            style={active ? styles.btnActive(colors.bg, colors.accent) : styles.btn}
            onClick={() => setMode(fm.mode)}
            title={fm.description}
          >
            {colors.label}
          </button>
        );
      })}
    </div>
  );
}
