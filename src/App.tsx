import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ProjectList from './components/ProjectList';
import Clients from './components/Clients';
import Models from './components/Models';
import Scheduling from './components/Scheduling';
import ProjectDetails from './components/ProjectDetails';
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
      default:
        return <Dashboard />;
    }
  };

  return (
    <DataProvider>
      <div className="flex h-screen bg-gray-50 font-sans">
        <Sidebar currentTab={currentTab.split(':')[0]} setCurrentTab={setCurrentTab} />
        <div className="flex-1 ml-64 overflow-y-auto p-8">
          <main className="max-w-7xl mx-auto">
            {renderContent()}
          </main>
        </div>
      </div>
    </DataProvider>
  );
}
