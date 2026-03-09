import React from 'react';
import { useData } from '../context/DataContext';
import { ArrowLeft, Calendar, DollarSign, FileText, Users, Briefcase, Camera, Link as LinkIcon, Video } from 'lucide-react';

type ProjectDetailsProps = {
  clientId: string;
  projectId: string;
  onBack: () => void;
};

export default function ProjectDetails({ clientId, projectId, onBack }: ProjectDetailsProps) {
  const { clients, models } = useData();

  const client = clients.find(c => c.id === clientId);
  const project = client?.projects?.find(p => p.id === projectId);

  if (!client || !project) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">প্রজেক্ট পাওয়া যায়নি।</p>
        <button onClick={onBack} className="text-indigo-600 hover:text-indigo-800 font-medium">
          ফিরে যান
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <button 
          onClick={onBack}
          className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-50 text-gray-600 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{project.title}</h1>
          <p className="text-gray-500 flex items-center mt-1">
            <Briefcase className="w-4 h-4 mr-1" />
            {client.name} ({client.company})
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">প্রজেক্ট ওভারভিউ</h2>
              <span className={`px-4 py-1.5 text-sm font-bold rounded-full uppercase tracking-wider ${
                project.status === 'Completed' ? 'bg-green-100 text-green-800' :
                project.status === 'Shooting' ? 'bg-blue-100 text-blue-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {project.status}
              </span>
            </div>

            {project.thumbnailUrl && (
              <div className="mb-6">
                <img 
                  src={project.thumbnailUrl} 
                  alt={project.title} 
                  className="w-full h-64 object-cover rounded-xl border border-gray-200"
                  referrerPolicy="no-referrer"
                />
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                <span className="text-xs text-gray-500 block mb-1">মোট বাজেট</span>
                <span className="text-lg font-bold text-gray-900">৳{(project.budget || 0).toLocaleString()}</span>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                <span className="text-xs text-gray-500 block mb-1">অ্যাডভান্স</span>
                <span className="text-lg font-bold text-emerald-600">৳{(project.clientAdvance || 0).toLocaleString()}</span>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                <span className="text-xs text-gray-500 block mb-1">মডেল পেমেন্ট</span>
                <span className="text-lg font-bold text-purple-600">৳{(project.modelPayment || 0).toLocaleString()}</span>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                <span className="text-xs text-gray-500 block mb-1">অতিরিক্ত খরচ</span>
                <span className="text-lg font-bold text-red-600">৳{(project.extraExpenses || 0).toLocaleString()}</span>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <Users className="w-5 h-5 mr-2 text-indigo-600" />
                মডেলসমূহ
              </h3>
              <div className="flex flex-wrap gap-3">
                {project.models.map(modelId => {
                  const model = models.find(m => m.id === modelId);
                  return model ? (
                    <div key={modelId} className="flex items-center bg-white border border-gray-200 px-3 py-2 rounded-lg shadow-sm">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold mr-3">
                        {model.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{model.name}</p>
                        <p className="text-xs text-gray-500">{model.category}</p>
                      </div>
                    </div>
                  ) : null;
                })}
                {project.models.length === 0 && (
                  <p className="text-sm text-gray-500">কোনো মডেল নির্বাচন করা হয়নি।</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-blue-600" />
              কনটেন্ট লগ
            </h3>
            <div className="space-y-3">
              {project.contentLog.map((log, index) => (
                <div key={index} className="flex items-start bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <div className="w-2 h-2 mt-1.5 rounded-full bg-blue-500 mr-3 flex-shrink-0"></div>
                  <p className="text-sm text-gray-700">{log}</p>
                </div>
              ))}
              {project.contentLog.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">কোনো কনটেন্ট লগ নেই।</p>
              )}
            </div>
          </div>

          {(project.script || project.link) && (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-6">
              {project.script && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <Video className="w-5 h-5 mr-2 text-purple-600" />
                    ভিডিও স্ক্রিপ্ট
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 whitespace-pre-wrap text-sm text-gray-700">
                    {project.script}
                  </div>
                </div>
              )}

              {project.link && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <LinkIcon className="w-5 h-5 mr-2 text-emerald-600" />
                    প্রজেক্ট লিঙ্ক
                  </h3>
                  <a 
                    href={project.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center p-3 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-100 hover:bg-emerald-100 transition-colors text-sm font-medium break-all"
                  >
                    <LinkIcon className="w-4 h-4 mr-2 flex-shrink-0" />
                    {project.link}
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
