import React from 'react';
import { Users, Camera, Image as ImageIcon, Calendar, DollarSign, TrendingDown, TrendingUp } from 'lucide-react';
import { useData } from '../context/DataContext';

export default function Dashboard() {
  const { clients, content, schedule } = useData();
  
  const totalProjects = clients.reduce((acc, client) => acc + (client.projects?.length || 0), 0);
  const activeProjects = clients.reduce(
    (acc, client) => acc + (client.projects?.filter((p) => p.status !== 'Completed').length || 0),
    0
  );

  const allProjects = clients.flatMap(c => c.projects || []);
  const totalProjectValue = allProjects.reduce((sum, p) => sum + (p.budget || 0), 0);
  const totalExpenses = allProjects.reduce((sum, p) => sum + (p.modelPayment || 0) + (p.extraExpenses || 0), 0);
  const totalRevenue = totalProjectValue - totalExpenses;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">ড্যাশবোর্ড ওভারভিউ</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">মোট ক্লায়েন্ট</p>
            <p className="text-2xl font-semibold text-gray-900">{clients.length}</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
            <Camera size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">অ্যাক্টিভ প্রজেক্ট</p>
            <p className="text-2xl font-semibold text-gray-900">{activeProjects} / {totalProjects}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
            <ImageIcon size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">মোট কনটেন্ট</p>
            <p className="text-2xl font-semibold text-gray-900">{content.length}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="p-3 bg-orange-50 text-orange-600 rounded-lg">
            <Calendar size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">আসন্ন ইভেন্ট</p>
            <p className="text-2xl font-semibold text-gray-900">{schedule.length}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
            <DollarSign size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">মোট কত টাকার প্রোজেক্ট</p>
            <p className="text-2xl font-semibold text-gray-900">৳{totalProjectValue.toLocaleString('bn-BD')}</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="p-3 bg-red-50 text-red-600 rounded-lg">
            <TrendingDown size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">মোট এক্সপেন্স</p>
            <p className="text-2xl font-semibold text-gray-900">৳{totalExpenses.toLocaleString('bn-BD')}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="p-3 bg-green-50 text-green-600 rounded-lg">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">রেভিনিউ</p>
            <p className="text-2xl font-semibold text-gray-900">৳{totalRevenue.toLocaleString('bn-BD')}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">সাম্প্রতিক প্রজেক্টসমূহ</h2>
          <div className="space-y-4">
            {clients.flatMap(c => c.projects || []).slice(0, 3).map((project) => (
              <div key={project.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900">{project.title}</h3>
                  <p className="text-sm text-gray-500">বাজেট: ৳{project.budget.toLocaleString()}</p>
                </div>
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                  project.status === 'Completed' ? 'bg-green-100 text-green-800' :
                  project.status === 'Shooting' ? 'bg-blue-100 text-blue-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {project.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">আসন্ন শিডিউল</h2>
          <div className="space-y-4">
            {schedule.slice(0, 3).map((event) => (
              <div key={event.id} className="flex justify-between items-center p-4 border border-gray-100 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="bg-orange-50 text-orange-600 p-2 rounded-lg text-center min-w-[60px]">
                    <p className="text-xs font-bold uppercase">{new Date(event.date).toLocaleString('bn-BD', { month: 'short' })}</p>
                    <p className="text-lg font-bold">{new Date(event.date).getDate()}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{event.title}</h3>
                    <p className="text-sm text-gray-500">{event.type}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
