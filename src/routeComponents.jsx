import React from 'react';
import SacredRecords from './components/SacredRecords';
import Oracle from './Oracle';
import DeepState from './components/DeepState';
import ManifestLab from './components/ManifestLab';
import VisionPortal from './components/VisionPortal';
import Sanctuary from './components/Sanctuary';
import Timeline from './components/Timeline';
import Affirmations from './components/Affirmations';
import Insights from './components/Insights';
import FocusLab from './components/FocusLab';
import SettingsPage from './components/SettingsPage';

/**
 * Route configuration map.
 * Replaces the deeply nested ternary chain in App.jsx for readability and maintainability.
 * Each entry maps an activeTab string to a render function.
 */
export const routeComponents = {
  Sanctuary: (props) => <Sanctuary {...props} />,
  'Quantum Lab': (props) => <ManifestLab {...props} />,
  'Deep State': (props) => <DeepState {...props} />,
  'Sacred Records': () => <SacredRecords />,
  Oracle: () => <Oracle />,
  'Vision Portal': () => <VisionPortal />,
  Timeline: () => <Timeline />,
  Affirmations: () => <Affirmations />,
  Insights: () => <Insights />,
  'Focus Lab': () => <FocusLab />,
  Settings: () => <SettingsPage />,
};

/**
 * Renders the active route component, or a fallback if not found.
 */
export function renderRoute(activeTab, routeProps) {
  const renderFn = routeComponents[activeTab];
  if (renderFn) {
    return renderFn(routeProps);
  }
  return <div>Page consolidating...</div>;
}
