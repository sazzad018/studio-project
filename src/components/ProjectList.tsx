import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Briefcase, DollarSign, Users, Plus, User, FileText, Edit2, LayoutGrid, List } from 'lucide-react';
import Modal from './Modal';

export default function ProjectList({ onNavigate }: { onNavigate?: (tab: string) => void }) {
  const { clients, models, categories, addProject, updateProject, addCategory } = useData();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const [newProject, setNewProject] = useState({ 
    clientId: clients[0]?.id || '', 
    title: '', 
    category: categories[0] || '',
    status: 'Planning' as any, 
    budget: 0, 
    clientAdvance: 0,
    modelPayment: 0,
    extraExpenses: 0,
    models: [] as string[], 
    contentLog: [] as string[],
    thumbnailUrl: '',
    script: '',
    link: ''
  });

  const allProjects = clients.flatMap(client => 
    (client.projects || []).map(project => ({ ...project, clientId: client.id, clientName: client.name, company: client.company }))
  );

  const filteredProjects = allProjects.filter(project => {
    if (selectedCategory === 'All') return true;
    return project.category === selectedCategory;
  });

  const handleAddProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (newProject.clientId) {
      const { clientId, ...projectData } = newProject;
      addProject(clientId, projectData);
      setIsModalOpen(false);
      setNewProject({ clientId: clients[0]?.id || '', title: '', category: categories[0] || '', status: 'Planning', budget: 0, clientAdvance: 0, modelPayment: 0, extraExpenses: 0, models: [], contentLog: [], thumbnailUrl: '', script: '', link: '' });
    }
  };

  const openEditModal = (project: any) => {
    setEditingProject({
      ...project,
      clientAdvance: project.clientAdvance || 0,
      modelPayment: project.modelPayment || 0,
      extraExpenses: project.extraExpenses || 0,
    });
    setIsEditModalOpen(true);
  };

  const handleEditProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProject) {
      const { clientId, id, clientName, company, newClientId, ...projectData } = editingProject;
      updateProject(clientId, id, projectData, newClientId);
      setIsEditModalOpen(false);
      setEditingProject(null);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        if (isEdit) {
          setEditingProject({ ...editingProject, thumbnailUrl: base64String });
        } else {
          setNewProject({ ...newProject, thumbnailUrl: base64String });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCategoryName.trim()) {
      addCategory(newCategoryName.trim());
      setNewCategoryName('');
      setIsCategoryModalOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">প্রজেক্ট লিস্ট</h1>
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => setIsCategoryModalOpen(true)}
            className="bg-white text-gray-700 border border-gray-300 px-4 py-2 rounded-lg flex items-center hover:bg-gray-50 transition-colors"
          >
            <Plus size={20} className="mr-2" /> নতুন ক্যাটাগরি
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} className="mr-2" /> নতুন প্রজেক্ট
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
        <div className="flex items-center space-x-2 overflow-x-auto scrollbar-hide">
          <span className="text-sm font-medium text-gray-500 mr-2 whitespace-nowrap">ক্যাটাগরি:</span>
          <button
            onClick={() => setSelectedCategory('All')}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              selectedCategory === 'All'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                selectedCategory === category
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
        
        <div className="flex items-center bg-gray-100 rounded-lg p-1 ml-4 flex-shrink-0">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-md transition-colors ${
              viewMode === 'grid' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
            title="গ্রিড ভিউ"
          >
            <LayoutGrid size={18} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-md transition-colors ${
              viewMode === 'list' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
            title="লিস্ট ভিউ"
          >
            <List size={18} />
          </button>
        </div>
      </div>

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <div key={project.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow relative group">
              <button 
                onClick={() => openEditModal(project)}
                className="absolute top-4 right-4 p-2 bg-gray-100 text-gray-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-blue-100 hover:text-blue-600"
                title="এডিট করুন"
              >
                <Edit2 size={16} />
              </button>

              <div className="flex justify-between items-start mb-4 pr-10">
                <div>
                  <h3 className="font-bold text-lg text-gray-900">{project.title}</h3>
                  <p className="text-sm text-gray-600 flex items-center mt-1">
                    <User className="w-4 h-4 mr-1 text-gray-400" />
                    {project.clientName} ({project.company})
                  </p>
                </div>
              </div>
              
              <div className="mb-4">
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

              <div className="grid grid-cols-2 gap-y-3 gap-x-4 mb-4 pt-4 border-t border-gray-100">
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500">মোট বাজেট</span>
                  <span className="text-sm font-semibold text-gray-900">৳{(project.budget || 0).toLocaleString()}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500">অ্যাডভান্স</span>
                  <span className="text-sm font-semibold text-emerald-600">৳{(project.clientAdvance || 0).toLocaleString()}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500">মডেল পেমেন্ট</span>
                  <span className="text-sm font-semibold text-purple-600">৳{(project.modelPayment || 0).toLocaleString()}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500">অতিরিক্ত খরচ</span>
                  <span className="text-sm font-semibold text-red-600">৳{(project.extraExpenses || 0).toLocaleString()}</span>
                </div>
              </div>

              <div className="bg-gray-50 p-3 rounded border border-gray-100 mb-4">
                <h5 className="text-xs font-medium text-gray-700 mb-2 flex items-center">
                  <FileText className="w-3 h-3 mr-1 text-gray-400" />
                  কনটেন্ট লগ ({(project.contentLog || []).length})
                </h5>
                <ul className="list-disc list-inside text-xs text-gray-600 space-y-1 truncate">
                  {(project.contentLog || []).slice(0, 2).map((log, index) => (
                    <li key={index} className="truncate">{log}</li>
                  ))}
                  {(project.contentLog || []).length > 2 && <li>...আরও {(project.contentLog || []).length - 2}টি</li>}
                  {(project.contentLog || []).length === 0 && <li>কোনো লগ নেই</li>}
                </ul>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => onNavigate?.(`project-details:${project.clientId}:${project.id}:projects`)}
                  className="text-sm bg-indigo-50 text-indigo-600 px-4 py-2 rounded-lg font-medium hover:bg-indigo-100 transition-colors"
                >
                  বিস্তারিত দেখুন
                </button>
              </div>
            </div>
          ))}
          {filteredProjects.length === 0 && (
            <div className="col-span-full text-center py-12 bg-white rounded-xl border border-gray-100">
              <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">কোনো প্রজেক্ট পাওয়া যায়নি</h3>
              <p className="text-gray-500 mt-1">নতুন প্রজেক্ট যোগ করুন অথবা অন্য ক্যাটাগরি নির্বাচন করুন।</p>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-sm">
                  <th className="p-4 font-medium">প্রজেক্টের নাম</th>
                  <th className="p-4 font-medium">ক্লায়েন্ট</th>
                  <th className="p-4 font-medium">স্ট্যাটাস</th>
                  <th className="p-4 font-medium">বাজেট</th>
                  <th className="p-4 font-medium text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProjects.map((project) => (
                  <tr key={project.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="p-4">
                      <div className="font-medium text-gray-900">{project.title}</div>
                      <div className="text-xs text-gray-500 mt-1">{project.category}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-gray-700">{project.clientName}</div>
                      <div className="text-xs text-gray-500">{project.company}</div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        project.status === 'Completed' ? 'bg-green-100 text-green-800' :
                        project.status === 'Shooting' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {project.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="text-sm font-semibold text-gray-900">৳{(project.budget || 0).toLocaleString()}</div>
                      <div className="text-xs text-gray-500 mt-1">অ্যাডভান্স: ৳{(project.clientAdvance || 0).toLocaleString()}</div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button 
                          onClick={() => openEditModal(project)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="এডিট করুন"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => onNavigate?.(`project-details:${project.clientId}:${project.id}:projects`)}
                          className="bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-indigo-100 transition-colors"
                        >
                          বিস্তারিত
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredProjects.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-gray-500">
                      কোনো প্রজেক্ট পাওয়া যায়নি
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Category Modal */}
      <Modal isOpen={isCategoryModalOpen} onClose={() => setIsCategoryModalOpen(false)} title="নতুন ক্যাটাগরি যোগ করুন">
        <form onSubmit={handleAddCategory} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ক্যাটাগরির নাম</label>
            <input 
              required 
              type="text" 
              value={newCategoryName} 
              onChange={e => setNewCategoryName(e.target.value)} 
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
              placeholder="যেমন: Wedding, Corporate..."
            />
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors">যোগ করুন</button>
        </form>
      </Modal>

      {/* Add Project Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="নতুন প্রজেক্ট যোগ করুন">
        <form onSubmit={handleAddProject} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ক্লায়েন্ট নির্বাচন করুন</label>
            <select required value={newProject.clientId} onChange={e => setNewProject({...newProject, clientId: e.target.value})} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
              <option value="" disabled>ক্লায়েন্ট নির্বাচন করুন</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name} ({c.company})</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">প্রজেক্টের নাম</label>
            <input required type="text" value={newProject.title} onChange={e => setNewProject({...newProject, title: e.target.value})} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ক্যাটাগরি</label>
            <select required value={newProject.category} onChange={e => setNewProject({...newProject, category: e.target.value})} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
              <option value="">নির্বাচন করুন</option>
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">স্ট্যাটাস</label>
            <select value={newProject.status} onChange={e => setNewProject({...newProject, status: e.target.value as any})} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
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
              onChange={(e) => handleImageUpload(e, false)} 
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" 
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
              <input required type="number" value={newProject.budget} onChange={e => setNewProject({...newProject, budget: Number(e.target.value)})} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">অ্যাডভান্স</label>
              <input type="number" value={newProject.clientAdvance} onChange={e => setNewProject({...newProject, clientAdvance: Number(e.target.value)})} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">মডেল পেমেন্ট</label>
              <input type="number" value={newProject.modelPayment} onChange={e => setNewProject({...newProject, modelPayment: Number(e.target.value)})} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">অতিরিক্ত খরচ</label>
              <input type="number" value={newProject.extraExpenses} onChange={e => setNewProject({...newProject, extraExpenses: Number(e.target.value)})} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">মডেল নির্বাচন করুন (একাধিক)</label>
            <select multiple value={newProject.models} onChange={e => setNewProject({...newProject, models: Array.from(e.target.selectedOptions, (option: HTMLOptionElement) => option.value)})} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none h-24">
              {models.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">কনটেন্ট লগ (কমা দিয়ে আলাদা করুন)</label>
            <input type="text" value={newProject.contentLog.join(', ')} onChange={e => setNewProject({...newProject, contentLog: e.target.value.split(',').map(s => s.trim()).filter(Boolean)})} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="যেমন: Photoshoot Day 1, Video Ad Draft" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ভিডিও স্ক্রিপ্ট (ঐচ্ছিক)</label>
            <textarea value={newProject.script || ''} onChange={e => setNewProject({...newProject, script: e.target.value})} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none h-24" placeholder="স্ক্রিপ্ট এখানে লিখুন..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">প্রজেক্ট লিঙ্ক (ঐচ্ছিক)</label>
            <input type="url" value={newProject.link || ''} onChange={e => setNewProject({...newProject, link: e.target.value})} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="https://..." />
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors">যোগ করুন</button>
        </form>
      </Modal>

      {/* Edit Project Modal */}
      {editingProject && (
        <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="প্রজেক্ট এডিট করুন">
          <form onSubmit={handleEditProject} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ক্লায়েন্ট পরিবর্তন করুন (ঐচ্ছিক)</label>
              <select value={editingProject.newClientId || editingProject.clientId} onChange={e => setEditingProject({...editingProject, newClientId: e.target.value})} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                {clients.map(c => <option key={c.id} value={c.id}>{c.name} ({c.company})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">প্রজেক্টের নাম</label>
              <input required type="text" value={editingProject.title} onChange={e => setEditingProject({...editingProject, title: e.target.value})} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ক্যাটাগরি</label>
              <select required value={editingProject.category || ''} onChange={e => setEditingProject({...editingProject, category: e.target.value})} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                <option value="">নির্বাচন করুন</option>
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">স্ট্যাটাস</label>
              <select value={editingProject.status} onChange={e => setEditingProject({...editingProject, status: e.target.value as any})} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
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
                onChange={(e) => handleImageUpload(e, true)} 
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" 
              />
              {editingProject.thumbnailUrl && (
                <div className="mt-2">
                  <img src={editingProject.thumbnailUrl} alt="Preview" className="h-32 w-full object-cover rounded-lg border border-gray-200" />
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">মোট বাজেট</label>
                <input required type="number" value={editingProject.budget} onChange={e => setEditingProject({...editingProject, budget: Number(e.target.value)})} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">অ্যাডভান্স</label>
                <input type="number" value={editingProject.clientAdvance} onChange={e => setEditingProject({...editingProject, clientAdvance: Number(e.target.value)})} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">মডেল পেমেন্ট</label>
                <input type="number" value={editingProject.modelPayment} onChange={e => setEditingProject({...editingProject, modelPayment: Number(e.target.value)})} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">অতিরিক্ত খরচ</label>
                <input type="number" value={editingProject.extraExpenses} onChange={e => setEditingProject({...editingProject, extraExpenses: Number(e.target.value)})} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">মডেল নির্বাচন করুন (একাধিক)</label>
              <select multiple value={editingProject.models} onChange={e => setEditingProject({...editingProject, models: Array.from(e.target.selectedOptions, (option: HTMLOptionElement) => option.value)})} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none h-24">
                {models.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">কনটেন্ট লগ (কমা দিয়ে আলাদা করুন)</label>
              <input type="text" value={editingProject.contentLog.join(', ')} onChange={e => setEditingProject({...editingProject, contentLog: e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean)})} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="যেমন: Photoshoot Day 1, Video Ad Draft" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ভিডিও স্ক্রিপ্ট (ঐচ্ছিক)</label>
              <textarea value={editingProject.script || ''} onChange={e => setEditingProject({...editingProject, script: e.target.value})} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none h-24" placeholder="স্ক্রিপ্ট এখানে লিখুন..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">প্রজেক্ট লিঙ্ক (ঐচ্ছিক)</label>
              <input type="url" value={editingProject.link || ''} onChange={e => setEditingProject({...editingProject, link: e.target.value})} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="https://..." />
            </div>
            <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors">সেভ করুন</button>
          </form>
        </Modal>
      )}
    </div>
  );
}
