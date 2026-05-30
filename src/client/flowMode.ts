export type FlowMode = 'finance' | 'planner';

export interface FlowModeInfo {
  mode: FlowMode;
  label: string;
  description: string;
}

export const FLOW_MODES: FlowModeInfo[] = [
  { mode: 'finance', label: 'Finance', description: 'Banking & financial services demo' },
  { mode: 'planner', label: 'Planner', description: 'Task planning & workflow demo' },
];

export const DEFAULT_FLOW_MODE: FlowMode = 'finance';

export function isValidFlowMode(mode: string): mode is FlowMode {
  return mode === 'finance' || mode === 'planner';
}
