import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Briefcase, DollarSign, FileText, Users, Plus, Phone, Mail, Facebook } from 'lucide-react';
import Modal from './Modal';

export default function Clients({ onNavigate }: { onNavigate?: (tab: string) => void }) {
  const { clients, models, categories, addClient, addProject } = useData();
  const [selectedClient, setSelectedClient] = useState(clients[0] || null);
  
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [newClient, setNewClient] = useState({ name: '', company: '', email: '', phone: '', facebook: '', totalBudget: 0 });

  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [newProject, setNewProject] = useState({ 
    title: '', 
    category: categories[0] || '',
    status: 'Planning' as any, 
    budget: 0, 
    clientAdvance: 0,
    modelPayment: 0,
    extraExpenses: 0,
    models: [] as string[], 
    contentLog: [] as string[],
    thumbnailUrl: ''
  });

  const handleAddClient = (e: React.FormEvent) => {
    e.preventDefault();
    addClient(newClient);
    setIsClientModalOpen(false);
    setNewClient({ name: '', company: '', email: '', phone: '', facebook: '', totalBudget: 0 });
  };

  const handleAddProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedClient) {
      addProject(selectedClient.id, newProject);
      setIsProjectModalOpen(false);
      setNewProject({ title: '', category: categories[0] || '', status: 'Planning', budget: 0, clientAdvance: 0, modelPayment: 0, extraExpenses: 0, models: [], contentLog: [], thumbnailUrl: '' });
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setNewProject({ ...newProject, thumbnailUrl: base64String });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">ক্লায়েন্ট প্রোফাইল</h1>
        <button 
          onClick={() => setIsClientModalOpen(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-indigo-700 transition-colors"
        >
          <Plus size={20} className="mr-2" /> নতুন ক্লায়েন্ট
        </button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Client List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50">
            <h2 className="font-semibold text-gray-700">ক্লায়েন্ট তালিকা</h2>
          </div>
          <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
            {clients.map((client) => (
              <button
                key={client.id}
                onClick={() => setSelectedClient(client)}
                className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${
                  selectedClient?.id === client.id ? 'bg-blue-50 border-l-4 border-blue-600' : ''
                }`}
              >
                <h3 className="font-medium text-gray-900">{client.name}</h3>
                <p className="text-sm text-gray-500">{client.company}</p>
              </button>
            ))}
            {clients.length === 0 && (
              <div className="p-4 text-center text-gray-500">কোনো ক্লায়েন্ট নেই</div>
            )}
          </div>
        </div>

        {/* Client Details */}
        <div className="lg:col-span-2 space-y-6">
          {selectedClient ? (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedClient.name}</h2>
                  <p className="text-gray-500 mb-3">{selectedClient.company}</p>
                  <div className="space-y-1 text-sm text-gray-600">
                    {selectedClient.phone && (
                      <p className="flex items-center">
                        <Phone className="w-4 h-4 mr-2 text-gray-400" />
                        {selectedClient.phone}
                      </p>
                    )}
                    {selectedClient.email && (
                      <p className="flex items-center">
                        <Mail className="w-4 h-4 mr-2 text-gray-400" />
                        {selectedClient.email}
                      </p>
                    )}
                    {selectedClient.facebook && (
                      <p className="flex items-center">
                        <Facebook className="w-4 h-4 mr-2 text-gray-400" />
                        <a href={selectedClient.facebook} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                          ফেসবুক পেজ
                        </a>
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">মোট বাজেট</p>
                  <p className="text-xl font-bold text-emerald-600">৳{selectedClient.totalBudget.toLocaleString()}</p>
                </div>
              </div>

              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Briefcase className="w-5 h-5 mr-2 text-blue-600" />
                  প্রজেক্টসমূহ
                </h3>
                <button 
                  onClick={() => setIsProjectModalOpen(true)}
                  className="text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center"
                >
                  <Plus size={16} className="mr-1" /> নতুন প্রজেক্ট
                </button>
              </div>
              
              <div className="space-y-4">
                {(selectedClient.projects || []).map((project) => (
                  <div key={project.id} className="border border-gray-100 rounded-lg p-4 bg-gray-50">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-semibold text-gray-900">{project.title}</h4>
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${
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
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-500">মোট বাজেট</span>
                        <span className="text-sm font-medium text-gray-900">৳{(project.budget || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-500">অ্যাডভান্স</span>
                        <span className="text-sm font-medium text-emerald-600">৳{(project.clientAdvance || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-500">মডেল পেমেন্ট</span>
                        <span className="text-sm font-medium text-purple-600">৳{(project.modelPayment || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-500">অতিরিক্ত খরচ</span>
                        <span className="text-sm font-medium text-red-600">৳{(project.extraExpenses || 0).toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="mb-4">
                      <span className="text-xs text-gray-500 block mb-1">মডেল:</span>
                      <div className="flex flex-wrap gap-2">
                        {project.models.map(modelId => {
                          const model = models.find(m => m.id === modelId);
                          return model ? (
                            <span key={modelId} className="text-xs bg-gray-200 px-2 py-1 rounded text-gray-700">
                              {model.name}
                            </span>
                          ) : null;
                        })}
                      </div>
                    </div>

                    <div className="bg-white p-3 rounded border border-gray-100 mb-4">
                      <h5 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                        <FileText className="w-4 h-4 mr-2 text-gray-400" />
                        কনটেন্ট লগ
                      </h5>
                      <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                        {project.contentLog.map((log, index) => (
                          <li key={index}>{log}</li>
                        ))}
                        {project.contentLog.length === 0 && <li>কোনো লগ নেই</li>}
                      </ul>
                    </div>

                    <div className="flex justify-end">
                      <button
                        onClick={() => onNavigate?.(`project-details:${selectedClient.id}:${project.id}:clients`)}
                        className="text-sm bg-indigo-50 text-indigo-600 px-4 py-2 rounded-lg font-medium hover:bg-indigo-100 transition-colors"
                      >
                        বিস্তারিত দেখুন
                      </button>
                    </div>
                  </div>
                ))}
                {(!selectedClient.projects || selectedClient.projects.length === 0) && (
                  <div className="text-center text-gray-500 py-4">কোনো প্রজেক্ট নেই</div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center text-gray-500">
              ক্লায়েন্ট নির্বাচন করুন
            </div>
          )}
        </div>
      </div>

      <Modal isOpen={isClientModalOpen} onClose={() => setIsClientModalOpen(false)} title="নতুন ক্লায়েন্ট যোগ করুন">
        <form onSubmit={handleAddClient} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">নাম</label>
            <input required type="text" value={newClient.name} onChange={e => setNewClient({...newClient, name: e.target.value})} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">কোম্পানি</label>
            <input required type="text" value={newClient.company} onChange={e => setNewClient({...newClient, company: e.target.value})} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ফোন নাম্বার (ঐচ্ছিক)</label>
            <input type="tel" value={newClient.phone} onChange={e => setNewClient({...newClient, phone: e.target.value})} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ইমেইল (ঐচ্ছিক)</label>
            <input type="email" value={newClient.email} onChange={e => setNewClient({...newClient, email: e.target.value})} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ফেসবুক পেজ লিংক (ঐচ্ছিক)</label>
            <input type="url" value={newClient.facebook} onChange={e => setNewClient({...newClient, facebook: e.target.value})} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="https://facebook.com/..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">মোট বাজেট</label>
            <input required type="number" value={newClient.totalBudget} onChange={e => setNewClient({...newClient, totalBudget: Number(e.target.value)})} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
          </div>
          <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-colors">যোগ করুন</button>
        </form>
      </Modal>

      <Modal isOpen={isProjectModalOpen} onClose={() => setIsProjectModalOpen(false)} title="নতুন প্রজেক্ট যোগ করুন">
        <form onSubmit={handleAddProject} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">প্রজেক্টের নাম</label>
            <input required type="text" value={newProject.title} onChange={e => setNewProject({...newProject, title: e.target.value})} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ক্যাটাগরি</label>
            <select required value={newProject.category} onChange={e => setNewProject({...newProject, category: e.target.value})} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none">
              <option value="">নির্বাচন করুন</option>
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">স্ট্যাটাস</label>
            <select value={newProject.status} onChange={e => setNewProject({...newProject, status: e.target.value as any})} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none">
              <option value="Planning">Planning</option>
              <option value="Shooting">Shooting</option>
              <option value="Editing">Editing</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">প্রজেক্ট থাম্বনেইল (ঐচ্ছিক)</label>
            <input 
              type="file" 
              accept="image/*"
              onChange={handleImageUpload} 
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" 
            />
            {newProject.thumbnailUrl && (
              <div className="mt-2">
                <img src={newProject.thumbnailUrl} alt="Preview" className="h-32 w-full object-cover rounded-lg border border-gray-200" />
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">মোট বাজেট</label>
              <input required type="number" value={newProject.budget} onChange={e => setNewProject({...newProject, budget: Number(e.target.value)})} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">অ্যাডভান্স</label>
              <input type="number" value={newProject.clientAdvance} onChange={e => setNewProject({...newProject, clientAdvance: Number(e.target.value)})} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">মডেল পেমেন্ট</label>
              <input type="number" value={newProject.modelPayment} onChange={e => setNewProject({...newProject, modelPayment: Number(e.target.value)})} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">অতিরিক্ত খরচ</label>
              <input type="number" value={newProject.extraExpenses} onChange={e => setNewProject({...newProject, extraExpenses: Number(e.target.value)})} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">মডেল নির্বাচন করুন (একাধিক)</label>
            <select multiple value={newProject.models} onChange={e => setNewProject({...newProject, models: Array.from(e.target.selectedOptions, (option: HTMLOptionElement) => option.value)})} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none h-24">
              {models.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">কনটেন্ট লগ (কমা দিয়ে আলাদা করুন)</label>
            <input type="text" value={newProject.contentLog.join(', ')} onChange={e => setNewProject({...newProject, contentLog: e.target.value.split(',').map(s => s.trim()).filter(Boolean)})} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="যেমন: Photoshoot Day 1, Video Ad Draft" />
          </div>
          <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-colors">যোগ করুন</button>
        </form>
      </Modal>
    </div>
  );
}
