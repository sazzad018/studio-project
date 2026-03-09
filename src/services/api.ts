import { API_BASE_URL } from '../config';
import { Client, Model, Content, ScheduleEvent, Project } from '../data/mockData';

// Helper function for API calls
async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`API Call failed for ${endpoint}:`, error);
    throw error;
  }
}

export const api = {
  // GET Requests (আপনার PHP ফাইলগুলো ডাটাবেজ থেকে ডাটা এনে JSON ফরম্যাটে রিটার্ন করবে)
  getClients: () => fetchApi<Client[]>('/get_clients.php'),
  getModels: () => fetchApi<Model[]>('/get_models.php'),
  getContent: () => fetchApi<Content[]>('/get_content.php'),
  getSchedule: () => fetchApi<ScheduleEvent[]>('/get_schedule.php'),
  getCategories: () => fetchApi<string[]>('/get_categories.php'),

  // POST Requests (আপনার PHP ফাইলগুলো JSON ডাটা রিসিভ করে ডাটাবেজে সেভ করবে)
  addClient: (data: Omit<Client, 'id' | 'projects'>) => 
    fetchApi<Client>('/add_client.php', { method: 'POST', body: JSON.stringify(data) }),
    
  addProject: (clientId: string, data: Omit<Project, 'id'>) => 
    fetchApi<Project>('/add_project.php', { method: 'POST', body: JSON.stringify({ clientId, ...data }) }),
    
  updateProject: (clientId: string, projectId: string, data: Partial<Project>, newClientId?: string) => 
    fetchApi<Project>('/update_project.php', { method: 'POST', body: JSON.stringify({ clientId, projectId, newClientId, ...data }) }),
    
  addModel: (data: Omit<Model, 'id'>) => 
    fetchApi<Model>('/add_model.php', { method: 'POST', body: JSON.stringify(data) }),
    
  addContent: (data: Omit<Content, 'id'>) => 
    fetchApi<Content>('/add_content.php', { method: 'POST', body: JSON.stringify(data) }),
    
  addScheduleEvent: (data: Omit<ScheduleEvent, 'id'>) => 
    fetchApi<ScheduleEvent>('/add_schedule.php', { method: 'POST', body: JSON.stringify(data) }),
    
  addCategory: (category: string) => 
    fetchApi<{success: boolean}>('/add_category.php', { method: 'POST', body: JSON.stringify({ category }) }),
};
