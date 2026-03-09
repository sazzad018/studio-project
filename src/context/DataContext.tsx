import React, { createContext, useContext, useState, useEffect } from 'react';
import { Client, Model, Content, ScheduleEvent, Project, mockClients, mockModels, mockContent, mockSchedule, mockCategories } from '../data/mockData';
import { api } from '../services/api';
import { USE_MOCK_FALLBACK } from '../config';

type DataContextType = {
  clients: Client[];
  models: Model[];
  content: Content[];
  schedule: ScheduleEvent[];
  categories: string[];
  addClient: (client: Omit<Client, 'id' | 'projects'>) => Promise<void>;
  addProject: (clientId: string, project: Omit<Project, 'id'>) => Promise<void>;
  updateProject: (clientId: string, projectId: string, projectData: Partial<Project>, newClientId?: string) => Promise<void>;
  addModel: (model: Omit<Model, 'id'>) => Promise<void>;
  addContent: (contentItem: Omit<Content, 'id'>) => Promise<void>;
  addScheduleEvent: (event: Omit<ScheduleEvent, 'id'>) => Promise<void>;
  addCategory: (category: string) => Promise<void>;
};

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [clients, setClients] = useState<Client[]>(() => {
    const saved = localStorage.getItem('studio_clients');
    return saved ? JSON.parse(saved) : mockClients;
  });
  const [models, setModels] = useState<Model[]>(() => {
    const saved = localStorage.getItem('studio_models');
    return saved ? JSON.parse(saved) : mockModels;
  });
  const [content, setContent] = useState<Content[]>(() => {
    const saved = localStorage.getItem('studio_content');
    return saved ? JSON.parse(saved) : mockContent;
  });
  const [schedule, setSchedule] = useState<ScheduleEvent[]>(() => {
    const saved = localStorage.getItem('studio_schedule');
    return saved ? JSON.parse(saved) : mockSchedule;
  });
  const [categories, setCategories] = useState<string[]>(() => {
    const saved = localStorage.getItem('studio_categories');
    return saved ? JSON.parse(saved) : mockCategories;
  });

  useEffect(() => {
    localStorage.setItem('studio_clients', JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    localStorage.setItem('studio_models', JSON.stringify(models));
  }, [models]);

  useEffect(() => {
    localStorage.setItem('studio_content', JSON.stringify(content));
  }, [content]);

  useEffect(() => {
    localStorage.setItem('studio_schedule', JSON.stringify(schedule));
  }, [schedule]);

  useEffect(() => {
    localStorage.setItem('studio_categories', JSON.stringify(categories));
  }, [categories]);

  // Fetch initial data from API
  useEffect(() => {
    const loadData = async () => {
      try {
        const [apiClients, apiModels, apiContent, apiSchedule, apiCategories] = await Promise.all([
          api.getClients(),
          api.getModels(),
          api.getContent(),
          api.getSchedule(),
          api.getCategories()
        ]);
        
        setClients(apiClients);
        setModels(apiModels);
        setContent(apiContent);
        setSchedule(apiSchedule);
        setCategories(apiCategories);
      } catch (error) {
        console.warn('API connection failed. Using local/mock data.', error);
        // If USE_MOCK_FALLBACK is true, we just keep the initial state (localStorage/mock)
      }
    };

    loadData();
  }, []);

  const addClient = async (clientData: Omit<Client, 'id' | 'projects'>) => {
    try {
      const newClient = await api.addClient(clientData);
      setClients([...clients, newClient]);
    } catch (error) {
      if (USE_MOCK_FALLBACK) {
        const newClient: Client = {
          ...clientData,
          id: `c${Date.now()}`,
          projects: [],
        };
        setClients([...clients, newClient]);
      }
    }
  };

  const addProject = async (clientId: string, projectData: Omit<Project, 'id'>) => {
    try {
      const newProject = await api.addProject(clientId, projectData);
      
      setClients(clients.map(c => {
        if (c.id === clientId) {
          return { ...c, projects: [...c.projects, newProject] };
        }
        return c;
      }));

      // Sync models
      if (projectData.models && projectData.models.length > 0) {
        setModels(prevModels => prevModels.map(m => {
          if (projectData.models.includes(m.id)) {
            return { ...m, projects: [...m.projects, newProject.id] };
          }
          return m;
        }));
      }
    } catch (error) {
      if (USE_MOCK_FALLBACK) {
        const newProject: Project = {
          ...projectData,
          id: `p${Date.now()}`,
        };
        
        setClients(clients.map(c => {
          if (c.id === clientId) {
            return { ...c, projects: [...c.projects, newProject] };
          }
          return c;
        }));

        // Sync models
        if (projectData.models && projectData.models.length > 0) {
          setModels(prevModels => prevModels.map(m => {
            if (projectData.models.includes(m.id)) {
              return { ...m, projects: [...m.projects, newProject.id] };
            }
            return m;
          }));
        }
      }
    }
  };

  const updateProject = async (clientId: string, projectId: string, projectData: Partial<Project>, newClientId?: string) => {
    try {
      await api.updateProject(clientId, projectId, projectData, newClientId);
      // Proceed with local update if API succeeds
    } catch (error) {
      if (!USE_MOCK_FALLBACK) return;
    }

    // Find old models
    const client = clients.find(c => c.id === clientId);
    const project = client?.projects.find(p => p.id === projectId);
    const oldModels = project?.models || [];

    setClients(clients.map(c => {
      // If client changed, remove from old client and add to new client
      if (newClientId && newClientId !== clientId) {
        if (c.id === clientId) {
          return { ...c, projects: c.projects.filter(p => p.id !== projectId) };
        }
        if (c.id === newClientId && project) {
          return { ...c, projects: [...c.projects, { ...project, ...projectData }] };
        }
        return c;
      }

      // If client didn't change, just update the project in the current client
      if (c.id === clientId) {
        return {
          ...c,
          projects: c.projects.map(p => p.id === projectId ? { ...p, ...projectData } : p)
        };
      }
      return c;
    }));

    // Sync models
    if (projectData.models) {
      const newModels = projectData.models;
      setModels(prevModels => prevModels.map(m => {
        const wasInProject = oldModels.includes(m.id);
        const isInProject = newModels.includes(m.id);
        
        if (wasInProject && !isInProject) {
          return { ...m, projects: m.projects.filter(id => id !== projectId) };
        } else if (!wasInProject && isInProject) {
          return { ...m, projects: [...m.projects, projectId] };
        }
        return m;
      }));
    }
  };

  const addModel = async (modelData: Omit<Model, 'id'>) => {
    try {
      const newModel = await api.addModel(modelData);
      setModels([...models, newModel]);
    } catch (error) {
      if (USE_MOCK_FALLBACK) {
        const newModel: Model = {
          ...modelData,
          id: `m${Date.now()}`,
        };
        setModels([...models, newModel]);
      }
    }
  };

  const addContent = async (contentData: Omit<Content, 'id'>) => {
    try {
      const newContent = await api.addContent(contentData);
      setContent([...content, newContent]);
    } catch (error) {
      if (USE_MOCK_FALLBACK) {
        const newContent: Content = {
          ...contentData,
          id: `ct${Date.now()}`,
        };
        setContent([...content, newContent]);
      }
    }
  };

  const addScheduleEvent = async (eventData: Omit<ScheduleEvent, 'id'>) => {
    try {
      const newEvent = await api.addScheduleEvent(eventData);
      setSchedule([...schedule, newEvent]);
    } catch (error) {
      if (USE_MOCK_FALLBACK) {
        const newEvent: ScheduleEvent = {
          ...eventData,
          id: `s${Date.now()}`,
        };
        setSchedule([...schedule, newEvent]);
      }
    }
  };

  const addCategory = async (category: string) => {
    try {
      await api.addCategory(category);
      if (!categories.includes(category)) {
        setCategories([...categories, category]);
      }
    } catch (error) {
      if (USE_MOCK_FALLBACK) {
        if (!categories.includes(category)) {
          setCategories([...categories, category]);
        }
      }
    }
  };

  return (
    <DataContext.Provider value={{ clients, models, content, schedule, categories, addClient, addProject, updateProject, addModel, addContent, addScheduleEvent, addCategory }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within DataProvider');
  return context;
};
