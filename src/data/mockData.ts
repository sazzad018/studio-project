export type Client = {
  id: string;
  name: string;
  company: string;
  email?: string;
  phone?: string;
  facebook?: string;
  totalBudget: number;
  projects: Project[];
};

export type Project = {
  id: string;
  title: string;
  category?: string;
  status: 'Planning' | 'Shooting' | 'Editing' | 'Completed';
  budget: number;
  clientAdvance: number;
  modelPayment: number;
  extraExpenses: number;
  models: string[]; // model IDs
  contentLog: string[];
  thumbnailUrl?: string;
  script?: string;
  scripts?: { id: string; title: string; content: string; }[];
  messages?: { id: string; senderName: string; content: string; timestamp: string; }[];
  recommendationLink?: string;
  videoDuration?: string;
  formats?: string[];
  contentType?: string;
  framework?: string;
  contentWriterId?: string;
  editorId?: string;
  link?: string;
  startDate?: string;
  endDate?: string;
  priority?: 'Urgent' | 'Normal';
};

export type Model = {
  id: string;
  name: string;
  category: string;
  hourlyRate: number;
  projects: string[]; // project IDs
  imageUrl: string;
  phone?: string;
  email?: string;
  facebook?: string;
  portfolioLinks?: string[];
  portfolioImages?: string[];
};

export type Content = {
  id: string;
  title: string;
  category: string;
  imageUrl: string;
  projectId: string;
};

export type ScheduleEvent = {
  id: string;
  title: string;
  date: string;
  type: 'Shoot' | 'Meeting' | 'Deadline';
  models: string[];
  crew: string[];
  projectId?: string;
};

export type InvoiceItem = {
  id: string;
  description: string;
  quantity: number;
  rate: number;
};

export type Invoice = {
  id: string;
  clientId: string;
  projectId: string;
  invoiceNumber: string;
  date: string;
  dueDate: string;
  items: InvoiceItem[];
  subtotal: number;
  taxRate: number;
  discount: number;
  total: number;
  status: 'Paid' | 'Unpaid' | 'Overdue';
  notes?: string;
};

export const mockModels: Model[] = [];
export const mockCategories: string[] = [];
export const mockClients: Client[] = [];
export const mockContent: Content[] = [];
export const mockSchedule: ScheduleEvent[] = [];
