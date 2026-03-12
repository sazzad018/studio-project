import React, { useState, useRef } from 'react';
import { useData } from '../context/DataContext';
import { FileText, Plus, Trash2, Printer, Download, Save, CheckCircle } from 'lucide-react';

type InvoiceItem = {
  id: string;
  description: string;
  quantity: number;
  rate: number;
};

export default function InvoiceSystem() {
  const { clients, addInvoice, invoices } = useData();
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [invoiceDate, setInvoiceDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState<string>('');
  const [invoiceNumber, setInvoiceNumber] = useState<string>(`INV-${Math.floor(Math.random() * 10000)}`);
  
  const [items, setItems] = useState<InvoiceItem[]>([
    { id: '1', description: '', quantity: 1, rate: 0 }
  ]);
  
  const [taxRate, setTaxRate] = useState<number>(0);
  const [discount, setDiscount] = useState<number>(0);
  const [logoUrl, setLogoUrl] = useState<string>(() => localStorage.getItem('invoiceLogo') || '');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'create' | 'saved'>('create');

  const selectedClient = clients.find(c => c.id === selectedClientId);
  const selectedProject = selectedClient?.projects.find(p => p.id === selectedProjectId);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setLogoUrl(result);
        localStorage.setItem('invoiceLogo', result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddItem = () => {
    setItems([...items, { id: Date.now().toString(), description: '', quantity: 1, rate: 0 }]);
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const handleItemChange = (id: string, field: keyof InvoiceItem, value: string | number) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
  const taxAmount = subtotal * (taxRate / 100);
  const total = subtotal + taxAmount - discount;

  const handlePrint = () => {
    window.print();
  };

  const handleViewInvoice = (inv: any) => {
    setSelectedClientId(inv.clientId);
    setSelectedProjectId(inv.projectId || '');
    setInvoiceNumber(inv.invoiceNumber);
    setInvoiceDate(inv.date);
    setDueDate(inv.dueDate || '');
    setItems(inv.items || []);
    setTaxRate(inv.taxRate || 0);
    setDiscount(inv.discount || 0);
    setActiveTab('create');
  };

  const handleDownloadPDF = (inv: any) => {
    handleViewInvoice(inv);
    setTimeout(() => {
      window.print();
    }, 100);
  };

  const handleSaveInvoice = async () => {
    if (!selectedClientId) {
      alert('অনুগ্রহ করে একজন ক্লায়েন্ট নির্বাচন করুন');
      return;
    }

    setIsSaving(true);
    try {
      await addInvoice({
        clientId: selectedClientId,
        projectId: selectedProjectId,
        invoiceNumber,
        date: invoiceDate,
        dueDate,
        items,
        subtotal,
        taxRate,
        discount,
        total,
        status: 'Unpaid'
      });
      
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      
      // Reset for next invoice
      setInvoiceNumber(`INV-${Math.floor(Math.random() * 10000)}`);
    } catch (error) {
      console.error('Failed to save invoice', error);
      alert('ইনভয়েস সেভ করতে সমস্যা হয়েছে');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:hidden">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <FileText className="mr-3 text-indigo-600" />
          ইনভয়েস জেনারেটর
        </h1>
        
        <div className="flex items-center bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('create')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'create' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            নতুন ইনভয়েস
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'saved' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            সংরক্ষিত ইনভয়েস ({invoices.length})
          </button>
        </div>
      </div>

      {activeTab === 'saved' ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden print:hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-900">সংরক্ষিত ইনভয়েস তালিকা</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="py-3 px-6 text-sm font-semibold text-gray-700">ইনভয়েস নম্বর</th>
                  <th className="py-3 px-6 text-sm font-semibold text-gray-700">ক্লায়েন্ট</th>
                  <th className="py-3 px-6 text-sm font-semibold text-gray-700">তারিখ</th>
                  <th className="py-3 px-6 text-sm font-semibold text-gray-700">মোট (৳)</th>
                  <th className="py-3 px-6 text-sm font-semibold text-gray-700">স্ট্যাটাস</th>
                  <th className="py-3 px-6 text-sm font-semibold text-gray-700 text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody>
                {invoices.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-500">
                      কোনো ইনভয়েস সংরক্ষিত নেই
                    </td>
                  </tr>
                ) : (
                  invoices.map((inv) => {
                    const client = clients.find(c => c.id === inv.clientId);
                    return (
                      <tr key={inv.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-6 font-medium text-gray-900">#{inv.invoiceNumber}</td>
                        <td className="py-3 px-6 text-gray-600">{client?.name || 'অজানা ক্লায়েন্ট'}</td>
                        <td className="py-3 px-6 text-gray-600">{new Date(inv.date).toLocaleDateString('bn-BD')}</td>
                        <td className="py-3 px-6 font-medium text-gray-900">{inv.total.toLocaleString('bn-BD')}</td>
                        <td className="py-3 px-6">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            inv.status === 'Paid' ? 'bg-green-100 text-green-800' : 
                            inv.status === 'Overdue' ? 'bg-red-100 text-red-800' : 
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {inv.status}
                          </span>
                        </td>
                        <td className="py-3 px-6 text-right">
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => handleViewInvoice(inv)}
                              title="বিস্তারিত দেখুন"
                              className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                            >
                              <FileText size={18} />
                            </button>
                            <button 
                              onClick={() => handleDownloadPDF(inv)}
                              title="পিডিএফ ডাউনলোড"
                              className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                            >
                              <Download size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Settings Panel (Hidden when printing) */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 print:hidden lg:col-span-1 h-fit">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold text-gray-900">ইনভয়েস সেটিংস</h2>
              <div className="flex gap-2">
                <button 
                  onClick={handleSaveInvoice}
                  disabled={isSaving || !selectedClientId}
                  className={`px-3 py-1.5 rounded-lg flex items-center text-sm font-medium transition-colors ${
                    saveSuccess 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed'
                  }`}
                >
                  {saveSuccess ? (
                    <><CheckCircle size={16} className="mr-1" /> সেভ হয়েছে</>
                  ) : (
                    <><Save size={16} className="mr-1" /> {isSaving ? 'সেভ হচ্ছে...' : 'সেভ করুন'}</>
                  )}
                </button>
                <button 
                  onClick={handlePrint}
                  className="bg-gray-900 text-white px-3 py-1.5 rounded-lg flex items-center text-sm font-medium hover:bg-gray-800 transition-colors"
                >
                  <Printer size={16} className="mr-1" /> প্রিন্ট
                </button>
              </div>
            </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ক্লায়েন্ট নির্বাচন করুন</label>
              <select 
                value={selectedClientId}
                onChange={(e) => {
                  setSelectedClientId(e.target.value);
                  setSelectedProjectId('');
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">ক্লায়েন্ট নির্বাচন করুন</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>{client.name} ({client.company})</option>
                ))}
              </select>
            </div>

            {selectedClient && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">প্রজেক্ট নির্বাচন করুন (ঐচ্ছিক)</label>
                <select 
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">প্রজেক্ট নির্বাচন করুন</option>
                  {selectedClient.projects.map(project => (
                    <option key={project.id} value={project.id}>{project.title}</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ইনভয়েস নম্বর</label>
              <input 
                type="text" 
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">তারিখ</label>
                <input 
                  type="date" 
                  value={invoiceDate}
                  onChange={(e) => setInvoiceDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">মেয়াদ (Due Date)</label>
                <input 
                  type="date" 
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ভ্যাট/ট্যাক্স (%)</label>
                <input 
                  type="number" 
                  value={taxRate}
                  onChange={(e) => setTaxRate(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ডিসকাউন্ট (৳)</label>
                <input 
                  type="number" 
                  value={discount}
                  onChange={(e) => setDiscount(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">কোম্পানির লোগো</label>
              <input 
                type="file" 
                accept="image/*"
                onChange={handleLogoUpload}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              />
              {logoUrl && (
                <button 
                  onClick={() => {
                    setLogoUrl('');
                    localStorage.removeItem('invoiceLogo');
                  }}
                  className="mt-2 text-xs text-red-600 hover:text-red-800"
                >
                  লোগো মুছুন
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Invoice Preview */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 lg:col-span-2 print:col-span-3 print:shadow-none print:border-none print:p-0" id="invoice-preview">
          
          {/* Header */}
          <div className="flex justify-between items-start border-b border-gray-200 pb-6 mb-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">INVOICE</h2>
              <p className="text-gray-500 mt-1">#{invoiceNumber}</p>
            </div>
            <div className="text-right">
              {logoUrl ? (
                <img src={logoUrl} alt="Company Logo" className="h-12 object-contain ml-auto mb-2" />
              ) : (
                <h3 className="font-bold text-gray-900 text-xl">স্টুডিও প্রো</h3>
              )}
              <p className="text-gray-600 text-sm mt-1">১২৩ স্টুডিও রোড, ঢাকা</p>
              <p className="text-gray-600 text-sm">contact@studiopro.com</p>
              <p className="text-gray-600 text-sm">+880 1234 567890</p>
            </div>
          </div>

          {/* Client & Dates */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <p className="text-sm text-gray-500 font-medium mb-1">প্রাপক:</p>
              {selectedClient ? (
                <>
                  <p className="font-bold text-gray-900">{selectedClient.name}</p>
                  <p className="text-gray-600">{selectedClient.company}</p>
                  {selectedClient.email && <p className="text-gray-600 text-sm">{selectedClient.email}</p>}
                  {selectedClient.phone && <p className="text-gray-600 text-sm">{selectedClient.phone}</p>}
                </>
              ) : (
                <p className="text-gray-400 italic">ক্লায়েন্ট নির্বাচন করুন</p>
              )}
            </div>
            <div className="text-right">
              <div className="mb-2">
                <p className="text-sm text-gray-500 font-medium inline-block mr-2">তারিখ:</p>
                <p className="font-medium text-gray-900 inline-block">{invoiceDate ? new Date(invoiceDate).toLocaleDateString('bn-BD') : '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium inline-block mr-2">মেয়াদ:</p>
                <p className="font-medium text-gray-900 inline-block">{dueDate ? new Date(dueDate).toLocaleDateString('bn-BD') : '-'}</p>
              </div>
            </div>
          </div>

          {/* Project Info */}
          {selectedProject && (
            <div className="mb-6 bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500 font-medium mb-1">প্রজেক্ট:</p>
              <p className="font-bold text-gray-900">{selectedProject.title}</p>
            </div>
          )}

          {/* Items Table */}
          <div className="mb-8">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="py-3 text-sm font-semibold text-gray-700">বিবরণ</th>
                  <th className="py-3 text-sm font-semibold text-gray-700 text-center w-24">পরিমাণ</th>
                  <th className="py-3 text-sm font-semibold text-gray-700 text-right w-32">রেট (৳)</th>
                  <th className="py-3 text-sm font-semibold text-gray-700 text-right w-32">মোট (৳)</th>
                  <th className="py-3 w-10 print:hidden"></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={item.id} className="border-b border-gray-100 align-top">
                    <td className="py-3 pr-4">
                      <textarea 
                        value={item.description}
                        onChange={(e) => {
                          e.target.style.height = 'auto';
                          e.target.style.height = e.target.scrollHeight + 'px';
                          handleItemChange(item.id, 'description', e.target.value);
                        }}
                        onFocus={(e) => {
                          e.target.style.height = 'auto';
                          e.target.style.height = e.target.scrollHeight + 'px';
                        }}
                        placeholder="কাজের বিবরণ..."
                        className="w-full bg-transparent border-none focus:ring-0 p-0 text-gray-900 resize-none overflow-hidden"
                        rows={1}
                        style={{ minHeight: '24px' }}
                      />
                    </td>
                    <td className="py-3 text-center">
                      <input 
                        type="number" 
                        value={item.quantity}
                        onChange={(e) => handleItemChange(item.id, 'quantity', Number(e.target.value))}
                        className="w-full bg-transparent border-none focus:ring-0 p-0 text-center text-gray-900"
                        min="1"
                      />
                    </td>
                    <td className="py-3 text-right">
                      <input 
                        type="number" 
                        value={item.rate}
                        onChange={(e) => handleItemChange(item.id, 'rate', Number(e.target.value))}
                        className="w-full bg-transparent border-none focus:ring-0 p-0 text-right text-gray-900"
                        min="0"
                      />
                    </td>
                    <td className="py-3 text-right font-medium text-gray-900">
                      {(item.quantity * item.rate).toLocaleString('bn-BD')}
                    </td>
                    <td className="py-3 text-right print:hidden">
                      <button 
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-red-400 hover:text-red-600"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            <button 
              onClick={handleAddItem}
              className="mt-4 text-sm text-indigo-600 font-medium flex items-center hover:text-indigo-800 print:hidden"
            >
              <Plus size={16} className="mr-1" /> নতুন আইটেম যোগ করুন
            </button>
          </div>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-64 space-y-3">
              <div className="flex justify-between text-gray-600">
                <span>সাবটোটাল:</span>
                <span>৳ {subtotal.toLocaleString('bn-BD')}</span>
              </div>
              {taxRate > 0 && (
                <div className="flex justify-between text-gray-600">
                  <span>ভ্যাট/ট্যাক্স ({taxRate}%):</span>
                  <span>৳ {taxAmount.toLocaleString('bn-BD')}</span>
                </div>
              )}
              {discount > 0 && (
                <div className="flex justify-between text-gray-600">
                  <span>ডিসকাউন্ট:</span>
                  <span className="text-red-600">- ৳ {discount.toLocaleString('bn-BD')}</span>
                </div>
              )}
              <div className="flex justify-between text-xl font-bold text-gray-900 border-t border-gray-200 pt-3">
                <span>সর্বমোট:</span>
                <span>৳ {total.toLocaleString('bn-BD')}</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-16 pt-8 border-t border-gray-200 text-center text-gray-500 text-sm">
            <p>আমাদের সাথে কাজ করার জন্য ধন্যবাদ!</p>
          </div>

        </div>
      </div>
      )}
    </div>
  );
}
