import { FlowModeProvider, useFlowMode } from './FlowModeProvider.js';
import FinanceDashboard from './FinanceDashboard.js';
import PlannerDashboard from './PlannerDashboard.js';

function DashboardSwitcher() {
  const { mode, loading } = useFlowMode();

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0e17', color: '#9ca3af', padding: 32, fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
        Loading…
      </div>
    );
  }

  return mode === 'finance' ? <FinanceDashboard /> : <PlannerDashboard />;
}

export default function App() {
  return (
    <FlowModeProvider>
      <DashboardSwitcher />
    </FlowModeProvider>
  );
}
