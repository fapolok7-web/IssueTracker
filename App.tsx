
import React, { useState } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import IssueEntry from './components/IssueEntry';
import IssueReports from './components/IssueReports';
import MonthlyEntry from './components/MonthlyEntry';
import MonthlyReports from './components/MonthlyReports';
import DowntimeEntry from './components/DowntimeEntry';
import DowntimeReports from './components/DowntimeReports';
import Settings from './components/Settings';
import { ViewType } from './types';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<ViewType>('Dashboard');

  const renderView = () => {
    switch (activeView) {
      case 'Dashboard': return <Dashboard />;
      case 'IssueEntry': return <IssueEntry />;
      case 'IssueReports': return <IssueReports />;
      case 'MonthlyEntry': return <MonthlyEntry />;
      case 'MonthlyReports': return <MonthlyReports />;
      case 'DowntimeEntry': return <DowntimeEntry />;
      case 'DowntimeReports': return <DowntimeReports />;
      case 'Settings': return <Settings />;
      default: return <Dashboard />;
    }
  };

  return (
    <Layout activeView={activeView} onNavigate={setActiveView}>
      {renderView()}
    </Layout>
  );
};

export default App;
