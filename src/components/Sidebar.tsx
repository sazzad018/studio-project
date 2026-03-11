import React from 'react';
import { LayoutDashboard, Users, Camera, Image as ImageIcon, Calendar, Briefcase, FileText } from 'lucide-react';

type SidebarProps = {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
};

export default function Sidebar({ currentTab, setCurrentTab }: SidebarProps) {
  const tabs = [
    { id: 'dashboard', label: 'ড্যাশবোর্ড', icon: LayoutDashboard },
    { id: 'projects', label: 'প্রজেক্ট লিস্ট', icon: Briefcase },
    { id: 'clients', label: 'ক্লায়েন্ট প্রোফাইল', icon: Users },
    { id: 'models', label: 'মডেল বিশ্লেষণ', icon: Camera },
    { id: 'scheduling', label: 'শিডিউলিং', icon: Calendar },
    { id: 'invoice', label: 'ইনভয়েস', icon: FileText },
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen fixed left-0 top-0 flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-indigo-600 flex items-center">
          <Camera className="mr-2" />
          স্টুডিও প্রো
        </h1>
      </div>
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setCurrentTab(tab.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-indigo-50 text-indigo-600 font-medium'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon size={20} className={isActive ? 'text-indigo-600' : 'text-gray-400'} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>
      <div className="p-4 border-t border-gray-200 text-sm text-gray-500 text-center">
        &copy; 2026 Studio Pro
      </div>
    </div>
  );
}
