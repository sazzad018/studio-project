import React, { useState, useEffect } from 'react';
import { 
  Wallet, TrendingUp, Target, MessageSquare, BarChart3, 
  ListTodo, LifeBuoy, CreditCard, Copy, CheckCircle2, ChevronDown, DollarSign, Loader2
} from 'lucide-react';
import { api } from '../../services/api';

const emptyClientSkeleton = {
  id: '',
  name: 'Loading...',
  company: '...',
  balance: 0,
  adBudgetUsed: 0,
  salesGoal: { current: 0, max: 100 },
  settings: {
    walletBalance: true,
    historyLedger: true,
    messageReport: true,
    salesReport: true,
    profitLossReport: false,
    paymentMethods: true,
    allowTopUp: true,
    dollarRate: 145
  },
  messageReports: [],
  salesReports: [],
  tasks: [],
  paymentMethods: [],
  topUpRequests: []
};

export default function VipClientPortal({ clientId }: { clientId: string }) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [reportFilter, setReportFilter] = useState('Last 30 Days');
  const [client, setClient] = useState<any>(emptyClientSkeleton);
  const [loading, setLoading] = useState(true);
  const [topUpForm, setTopUpForm] = useState({ amount: '', note: '' });
  const [topUpScreenshot, setTopUpScreenshot] = useState<string | null>(null);
  const [isSubmittingTopUp, setIsSubmittingTopUp] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // Load basic info from the array
        const allClients = await api.getFromStore('vipClientsData');
        let baseInfo = {};
        if (allClients && Array.isArray(allClients)) {
          const found = allClients.find((c: any) => String(c.id) === String(clientId));
          if (found) baseInfo = found;
        }

        // Load detailed info
        const details = await api.getFromStore('vipClientDetails_' + clientId);
        
        setClient(prev => ({ ...prev, ...baseInfo, ...(details || {}) }));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [clientId]);

  // Simple copy to clipboard functionality
  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        alert("File size must be less than 2MB");
        e.target.value = '';
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setTopUpScreenshot(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTopUpRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topUpForm.amount) return;
    
    setIsSubmittingTopUp(true);
    try {
      const newRequest = {
        id: Date.now(),
        date: new Date().toISOString().split('T')[0],
        amount: Number(topUpForm.amount),
        note: topUpForm.note,
        status: 'pending',
        screenshot: topUpScreenshot
      };
      
      const updatedClient = {
        ...client,
        topUpRequests: [newRequest, ...(client.topUpRequests || [])]
      };
      
      await api.saveToStore('vipClientDetails_' + clientId, updatedClient);
      setClient(updatedClient);
      setTopUpForm({ amount: '', note: '' });
      setTopUpScreenshot(null);
      // Reset file input by ref if possible, but keeping it simple
      const fileInput = document.getElementById('screenshot_upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

      alert('Top-up request sent to admin successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to send request. Please try again.');
    } finally {
      setIsSubmittingTopUp(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Loader2 className="animate-spin text-indigo-600 mb-4" size={48} />
    </div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12 font-sans selection:bg-indigo-100">
      {/* Header */}
      <div className="bg-indigo-900 text-white pt-12 pb-24 px-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-[-10%] right-[-5%] w-96 h-96 rounded-full bg-white blur-3xl"></div>
          <div className="absolute bottom-[-20%] left-[-10%] w-64 h-64 rounded-full bg-indigo-400 blur-3xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row items-center md:items-start justify-between gap-6 text-center md:text-left">
          <div>
            <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-semibold tracking-wider uppercase mb-4 shadow-sm border border-white/10">
              Big Fish Portal
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold mb-3 tracking-tight">স্বাগতম, {client.name}</h1>
            <p className="text-indigo-200 text-lg md:text-xl font-medium">{client.company}</p>
          </div>
          <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-md border border-white/20 shadow-xl flex items-center gap-4">
             <div className="text-left">
                <p className="text-indigo-200 text-xs font-medium mb-1">Status</p>
                <p className="font-bold flex items-center text-sm"><CheckCircle2 className="w-4 h-4 mr-1.5 text-emerald-400" /> VIP Active</p>
             </div>
             <div className="w-px h-8 bg-white/20"></div>
             <button className="bg-white text-indigo-900 px-4 py-2 rounded-xl text-sm font-bold shadow-sm hover:bg-gray-50 transition-colors">
               Contact Admin
             </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-12 relative z-20">
        
        {/* Top Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          
          <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><Wallet size={64} className="text-indigo-500" /></div>
            <span className="text-xs text-gray-500 font-bold uppercase tracking-wider block mb-2">ওয়ালেট ব্যালান্স</span>
            {client.settings?.walletBalance ? (
              <span className="text-3xl font-black text-indigo-700 tracking-tight">৳{(client.balance || 0).toLocaleString()}</span>
            ) : (
              <span className="text-xl font-bold text-gray-400 italic">Wallet Balance Hidden</span>
            )}
          </div>
          
          <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><TrendingUp size={64} className="text-emerald-500" /></div>
            <span className="text-xs text-gray-500 font-bold uppercase tracking-wider block mb-2">মোট বিজ্ঞাপন ব্যয় (Total Spend)</span>
            <span className="text-3xl font-black text-gray-900 tracking-tight">৳{(client.adBudgetUsed || 0).toLocaleString()}</span>
          </div>
          
          <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><DollarSign size={64} className="text-amber-500" /></div>
            <span className="text-xs text-gray-500 font-bold uppercase tracking-wider block mb-2">
              বর্তমান ডলার রেট
            </span>
            <div className="flex items-baseline space-x-2">
              <span className="text-4xl font-black text-gray-900 tracking-tight">$1</span>
              <span className="text-2xl font-black text-gray-600">=</span>
              <span className="text-4xl font-black text-gray-900 tracking-tight">৳{client.settings?.dollarRate || 145}</span>
            </div>
            <p className="text-xs text-gray-400 mt-3 font-medium">ডলারের দাম পরিবর্তনশীল, যেকোনো সময় পরিবর্তন হতে পারে</p>
          </div>

        </div>

        {/* Global Filter Bar */}
        <div className="flex bg-white border border-gray-200 rounded-xl p-2 mb-8 items-center shadow-sm w-fit">
          <span className="text-sm font-bold text-gray-500 px-3">Date Range:</span>
          {['Last 30 Days', 'This Month', 'Custom Range'].map(filter => (
            <button
              key={filter}
              onClick={() => setReportFilter(filter)}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                reportFilter === filter ? 'bg-indigo-50 text-indigo-700' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              {filter} {filter === 'Custom Range' && <ChevronDown size={14} className="inline ml-1" />}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content Area (Lists & Reports) */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Message Report */}
            {client.settings?.messageReport && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-xl font-extrabold text-gray-900 mb-6 flex items-center">
                  <MessageSquare className="mr-2 text-indigo-500" /> Message Report
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-bold pb-2 bg-gray-50">
                        <th className="p-4 rounded-tl-xl">Period</th>
                        <th className="p-4 text-right">Ad Spend ($)</th>
                        <th className="p-4 text-right rounded-tr-xl">Messages Sent</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        const msgRows = (client.adHistory || []).filter((h: any) => (h.messageResults || 0) > 0);
                        return msgRows.length > 0 ? msgRows.map((h: any) => (
                          <tr key={h.id} className="border-b border-gray-50 text-sm font-medium text-gray-800 hover:bg-gray-50/50">
                            <td className="p-4 text-gray-500">{h.from} → {h.to}</td>
                            <td className="p-4 text-right font-bold text-gray-900">${Number(h.actualCost).toFixed(2)}</td>
                            <td className="p-4 text-right text-indigo-600 font-bold">{h.messageResults}</td>
                          </tr>
                        )) : (
                          <tr><td colSpan={3} className="p-6 text-center text-gray-500 font-medium">No messaging data yet.</td></tr>
                        );
                      })()}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Sales Report */}
            {client.settings?.salesReport && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-xl font-extrabold text-gray-900 mb-6 flex items-center">
                  <BarChart3 className="mr-2 text-indigo-500" /> Sales Report
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-bold pb-2 bg-gray-50">
                        <th className="p-4 rounded-tl-xl">Period</th>
                        <th className="p-4 text-right">Ad Spend ($)</th>
                        <th className="p-4 text-right">Sales Count</th>
                        <th className="p-4 text-right rounded-tr-xl">Wallet Effect (৳)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        const salesRows = (client.adHistory || []).filter((h: any) => (h.salesResults || 0) > 0);
                        return salesRows.length > 0 ? salesRows.map((h: any) => (
                          <tr key={h.id} className="border-b border-gray-50 text-sm font-medium text-gray-800 hover:bg-gray-50/50">
                            <td className="p-4 text-gray-500">{h.from} → {h.to}</td>
                            <td className="p-4 text-right font-bold text-gray-900">${Number(h.actualCost).toFixed(2)}</td>
                            <td className="p-4 text-right text-emerald-600 font-bold">{h.salesResults}</td>
                            <td className="p-4 text-right text-red-500">{Number(h.walletEffect).toLocaleString()}</td>
                          </tr>
                        )) : (
                          <tr><td colSpan={4} className="p-10 text-center text-gray-400 font-medium border border-dashed border-gray-200 bg-gray-50/50 rounded-xl mt-4">
                            No sales data yet. Sales records appear here when ad campaigns include sales results.
                          </td></tr>
                        );
                      })()}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Project Tasks & Milestones */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-xl font-extrabold text-gray-900 mb-6 flex items-center">
                <ListTodo className="mr-2 text-indigo-500" /> Project Tasks & Milestones
              </h3>
              
              {client.tasks && client.tasks.length > 0 ? (
                <div className="space-y-4">
                  {client.tasks.map((task: any) => (
                    <div key={task.id} className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex justify-between items-center">
                      <div>
                        <h4 className="font-bold text-gray-800">{task.title}</h4>
                        <p className="text-sm text-gray-500">{task.description}</p>
                      </div>
                      <span className="px-3 py-1 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-600">{task.status}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-10 text-center text-gray-400 font-medium border border-dashed border-gray-200 bg-gray-50/50 rounded-xl">
                  <ListTodo size={32} className="mx-auto mb-3 opacity-30" />
                  No tasks active
                </div>
              )}
            </div>

          </div>

          {/* Right Sidebar (Support & Payments) */}
          <div className="space-y-8">
            
            {/* Need Support? */}
            <div className="bg-gradient-to-br from-indigo-600 to-blue-600 rounded-2xl shadow-sm p-8 text-white text-center">
               <LifeBuoy size={48} className="mx-auto mb-4 text-indigo-200" />
               <h3 className="text-2xl font-black mb-2 tracking-tight">Need Support?</h3>
               <p className="text-sm text-indigo-100 mb-6 font-medium">Our team is available 24/7 to assist with your campaigns and queries.</p>
               <button className="w-full bg-white text-indigo-700 py-3 rounded-xl font-bold shadow-sm hover:bg-gray-50 transition-colors">
                 Open Support Ticket
               </button>
            </div>

            {/* Top Up Request */}
            {client.settings?.allowTopUp && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-extrabold text-gray-900 mb-4 flex items-center">
                  <Wallet className="mr-2 text-indigo-500" /> Top-Up Request
                </h3>
                <form className="space-y-4" onSubmit={handleTopUpRequest}>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Amount (৳)</label>
                    <input 
                      type="number"
                      required
                      value={topUpForm.amount}
                      onChange={e => setTopUpForm({...topUpForm, amount: e.target.value})}
                      placeholder="e.g. 50000"
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 outline-none font-bold text-gray-900 text-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Transaction ID / Note</label>
                    <textarea 
                      value={topUpForm.note}
                      onChange={e => setTopUpForm({...topUpForm, note: e.target.value})}
                      placeholder="Transaction ID or note..."
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 outline-none text-sm text-gray-700 resize-none h-20"
                    ></textarea>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Payment Screenshot</label>
                    <input 
                      id="screenshot_upload"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 outline-none text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-bold file:bg-indigo-100 file:text-indigo-700 hover:file:bg-indigo-200 transition-colors"
                    />
                    {topUpScreenshot && (
                      <div className="mt-2 text-xs text-emerald-600 font-bold flex items-center">
                        <CheckCircle2 size={14} className="mr-1" /> Screenshot attached
                      </div>
                    )}
                  </div>
                  <button disabled={isSubmittingTopUp} type="submit" className="w-full bg-indigo-600 text-white rounded-xl py-3 font-bold shadow-sm hover:bg-indigo-700 transition-colors disabled:opacity-50">
                    {isSubmittingTopUp ? 'Sending...' : 'Send Request'}
                  </button>
                </form>
              </div>
            )}

            {/* Payment Methods */}
            {client.settings?.paymentMethods && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-extrabold text-gray-900 mb-6 flex items-center">
                  <CreditCard className="mr-2 text-indigo-500" /> Payment Methods
                </h3>
                <div className="space-y-4">
                  {(client.paymentMethods || []).map((method: any, index: number) => (
                    <div key={index} className="bg-gray-50 border border-gray-200 rounded-xl p-4 hover:border-gray-300 transition-colors">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{method.type}</p>
                      <div className="flex justify-between items-center">
                        <span className="font-extrabold text-gray-900 text-lg tracking-widest font-mono">{method.number}</span>
                        <button 
                          onClick={() => handleCopy(method.number, index)}
                          className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-gray-600"
                          title="Copy account number"
                        >
                          {copiedIndex === index ? <CheckCircle2 size={18} className="text-emerald-500" /> : <Copy size={18} />}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>
      </div>
    </div>
  );
}
