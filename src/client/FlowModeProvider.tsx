import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { FlowMode } from './flowMode.js';
import { DEFAULT_FLOW_MODE } from './flowMode.js';

interface FlowModeContextValue {
  mode: FlowMode;
  loading: boolean;
  setMode: (mode: FlowMode) => Promise<void>;
}

const FlowModeContext = createContext<FlowModeContextValue>({
  mode: DEFAULT_FLOW_MODE,
  loading: true,
  setMode: async () => {},
});

export function FlowModeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<FlowMode>(DEFAULT_FLOW_MODE);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/flow-mode')
      .then((r) => r.json())
      .then((data) => {
        if (data.mode === 'finance' || data.mode === 'planner') {
          setModeState(data.mode);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const setMode = async (newMode: FlowMode) => {
    await fetch('/api/flow-mode', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode: newMode }),
    });
    setModeState(newMode);
  };

  return (
    <FlowModeContext.Provider value={{ mode, loading, setMode }}>
      {children}
    </FlowModeContext.Provider>
  );
}

export function useFlowMode() {
  return useContext(FlowModeContext);
}
