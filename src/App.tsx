import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ProjectList from './components/ProjectList';
import Clients from './components/Clients';
import Models from './components/Models';
import Scheduling from './components/Scheduling';
import ProjectDetails from './components/ProjectDetails';
import InvoiceSystem from './components/InvoiceSystem';
import DailyTasks from './components/DailyTasks';
import TermsConditions from './components/TermsConditions';
import { DataProvider } from './context/DataContext';

export default function App() {
  const [currentTab, setCurrentTab] = useState('dashboard');

  const renderContent = () => {
    if (currentTab.startsWith('project-details:')) {
      const [, clientId, projectId, source] = currentTab.split(':');
      return <ProjectDetails clientId={clientId} projectId={projectId} onBack={() => setCurrentTab(source || 'clients')} />;
    }

    switch (currentTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'projects':
        return <ProjectList onNavigate={(tab) => setCurrentTab(tab)} />;
      case 'clients':
        return <Clients onNavigate={(tab) => setCurrentTab(tab)} />;
      case 'models':
        return <Models />;
      case 'scheduling':
        return <Scheduling />;
      case 'invoice':
        return <InvoiceSystem />;
      case 'daily-tasks':
        return <DailyTasks />;
      case 'terms':
        return <TermsConditions />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <DataProvider>
      <div className="flex h-screen bg-gray-50 font-sans print:bg-white print:h-auto">
        <div className="print:hidden">
          <Sidebar currentTab={currentTab.split(':')[0]} setCurrentTab={setCurrentTab} />
        </div>
        <div className="flex-1 ml-64 print:ml-0 overflow-y-auto p-8 print:p-0 print:overflow-visible">
          <main className="max-w-7xl mx-auto print:max-w-none print:w-full">
            {renderContent()}
          </main>
        </div>
      </div>
    </DataProvider>
  );
}
