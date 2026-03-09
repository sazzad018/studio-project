import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Star, Briefcase, DollarSign, User, Plus } from 'lucide-react';
import Modal from './Modal';

export default function Models() {
  const { models, clients, addModel } = useData();
  const [selectedModel, setSelectedModel] = useState(models[0] || null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newModel, setNewModel] = useState({ name: '', category: '', hourlyRate: 0, imageUrl: '', projects: [] as string[] });

  const handleAddModel = (e: React.FormEvent) => {
    e.preventDefault();
    addModel({
      ...newModel,
      imageUrl: newModel.imageUrl || `https://picsum.photos/seed/${newModel.name}/200/300`
    });
    setIsModalOpen(false);
    setNewModel({ name: '', category: '', hourlyRate: 0, imageUrl: '', projects: [] });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">মডেল-ভিত্তিক বিশ্লেষণ</h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-purple-700 transition-colors"
        >
          <Plus size={20} className="mr-2" /> নতুন মডেল
        </button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Model List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50">
            <h2 className="font-semibold text-gray-700">মডেল তালিকা</h2>
          </div>
          <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
            {models.map((model) => (
              <button
                key={model.id}
                onClick={() => setSelectedModel(model)}
                className={`w-full text-left p-4 hover:bg-gray-50 transition-colors flex items-center space-x-4 ${
                  selectedModel?.id === model.id ? 'bg-purple-50 border-l-4 border-purple-600' : ''
                }`}
              >
                <img src={model.imageUrl} alt={model.name} className="w-12 h-12 rounded-full object-cover border border-gray-200" />
                <div>
                  <h3 className="font-medium text-gray-900">{model.name}</h3>
                  <p className="text-sm text-gray-500">{model.category}</p>
                </div>
              </button>
            ))}
            {models.length === 0 && (
              <div className="p-4 text-center text-gray-500">কোনো মডেল নেই</div>
            )}
          </div>
        </div>

        {/* Model Details */}
        <div className="lg:col-span-2 space-y-6">
          {selectedModel ? (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6 mb-8">
                <img src={selectedModel.imageUrl} alt={selectedModel.name} className="w-32 h-32 rounded-xl object-cover border-4 border-white shadow-lg" />
                <div className="flex-1 text-center md:text-left">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">{selectedModel.name}</h2>
                  <div className="flex flex-wrap justify-center md:justify-start gap-3 text-sm">
                    <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full font-medium flex items-center">
                      <Star className="w-4 h-4 mr-1" /> {selectedModel.category}
                    </span>
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full font-medium flex items-center">
                      <DollarSign className="w-4 h-4 mr-1" /> ৳{selectedModel.hourlyRate.toLocaleString()}/ঘন্টা
                    </span>
                  </div>
                </div>
              </div>

              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center border-b pb-2">
                <Briefcase className="w-5 h-5 mr-2 text-purple-600" />
                প্রজেক্ট পরিচিতি
              </h3>
              
              <div className="space-y-4">
                {selectedModel.projects.map((projectId) => {
                  const client = clients.find(c => c.projects.some(p => p.id === projectId));
                  const project = client?.projects.find(p => p.id === projectId);
                  
                  if (!project || !client) return null;

                  return (
                    <div key={project.id} className="border border-gray-100 rounded-lg p-5 bg-gray-50 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-bold text-lg text-gray-900">{project.title}</h4>
                          <p className="text-sm text-gray-600 flex items-center mt-1">
                            <User className="w-4 h-4 mr-1 text-gray-400" />
                            ক্লায়েন্ট: <span className="font-medium ml-1">{client.name} ({client.company})</span>
                          </p>
                        </div>
                        <span className={`px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider ${
                          project.status === 'Completed' ? 'bg-green-100 text-green-800' :
                          project.status === 'Shooting' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {project.status}
                        </span>
                      </div>

                      {project.thumbnailUrl && (
                        <div className="mb-4">
                          <img 
                            src={project.thumbnailUrl} 
                            alt={project.title} 
                            className="w-full h-40 object-cover rounded-lg border border-gray-200"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      )}
                      
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <h5 className="text-sm font-semibold text-gray-700 mb-2">কাজের বিবরণী:</h5>
                        <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                          {project.contentLog.map((log, index) => (
                            <li key={index}>{log}</li>
                          ))}
                          {project.contentLog.length === 0 && <li>কোনো লগ নেই</li>}
                        </ul>
                      </div>
                    </div>
                  );
                })}
                {selectedModel.projects.length === 0 && (
                  <div className="text-center text-gray-500 py-4">কোনো প্রজেক্টে যুক্ত নেই</div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center text-gray-500">
              মডেল নির্বাচন করুন
            </div>
          )}
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="নতুন মডেল যোগ করুন">
        <form onSubmit={handleAddModel} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">নাম</label>
            <input required type="text" value={newModel.name} onChange={e => setNewModel({...newModel, name: e.target.value})} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ক্যাটাগরি</label>
            <input required type="text" value={newModel.category} onChange={e => setNewModel({...newModel, category: e.target.value})} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" placeholder="যেমন: Fashion, Commercial" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ঘণ্টাপ্রতি রেট</label>
            <input required type="number" value={newModel.hourlyRate} onChange={e => setNewModel({...newModel, hourlyRate: Number(e.target.value)})} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ছবির URL (ঐচ্ছিক)</label>
            <input type="url" value={newModel.imageUrl} onChange={e => setNewModel({...newModel, imageUrl: e.target.value})} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" placeholder="https://..." />
          </div>
          <button type="submit" className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors">যোগ করুন</button>
        </form>
      </Modal>
    </div>
  );
}
