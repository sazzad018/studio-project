import React, { useState, useEffect } from 'react';
import { 
  DollarSign, TrendingUp, TrendingDown, Target, Users, AlertTriangle, 
  BarChart as BarChartIcon, Activity, Edit2
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, Legend
} from 'recharts';
import Modal from '../Modal';
import { api } from '../../services/api';

const mockSalesData: any[] = [];

const lowBalanceClients: any[] = [];

const defaultGoals = [
  { id: 'fb', title: 'Facebook Ads', target: 500000, current: 0, clientsSigned: 0, targetClients: 20, colorClass: 'bg-blue-500', colorLightClass: 'bg-blue-400' },
  { id: 'web', title: 'Web Dev', target: 800000, current: 0, clientsSigned: 0, targetClients: 5, colorClass: 'bg-indigo-500', colorLightClass: 'bg-indigo-400' },
  { id: 'lp', title: 'Landing Page', target: 200000, current: 0, clientsSigned: 0, targetClients: 15, colorClass: 'bg-emerald-500', colorLightClass: 'bg-emerald-400' },
  { id: 'consult', title: 'Consultancy', target: 150000, current: 0, clientsSigned: 0, targetClients: 10, colorClass: 'bg-amber-500', colorLightClass: 'bg-amber-400' },
];

const initialMockVipClients: any[] = [];

export default function SuperAdminDashboardView() {
  const [timeRange, setTimeRange] = useState('30days');
  const [goals, setGoals] = useState(defaultGoals);
  const [editingGoal, setEditingGoal] = useState<any>(null);
  const [vipClients, setVipClients] = useState<any[]>([]);
  const [generalClients, setGeneralClients] = useState<any[]>([]);
  const [usdRates, setUsdRates] = useState({ buyRate: 130, chargeRate: 145 });

  useEffect(() => {
    api.getFromStore('monthlyGoals').then(data => {
      if (data && Array.isArray(data)) {
        setGoals(data);
      }
    }).catch(console.error);

    api.getFromStore('vipClientsData').then(async (clientList: any) => {
      if (clientList && Array.isArray(clientList)) {
        const detailedClients = await Promise.all(
          clientList.map(async (c: any) => {
            try {
              const detail = await api.getFromStore('vipClientDetails_' + c.id);
              return detail ? { ...c, ...detail } : c;
            } catch {
              return c;
            }
          })
        );
        setVipClients(detailedClients);
      } else {
        setVipClients(initialMockVipClients);
      }
    }).catch(console.error);

    api.getFromStore('agencyProfitData').then(data => {
      if (data && data.usdRates) {
        setUsdRates(data.usdRates);
      }
    }).catch(console.error);

    const savedGeneral = localStorage.getItem('generalClientsData');
    if (savedGeneral) {
      try {
        setGeneralClients(JSON.parse(savedGeneral));
      } catch (e) {
        console.error("Failed to parse general clients", e);
      }
    }
  }, []);

  const allClientsWithReminders = [...vipClients, ...generalClients].filter(c => c.reminder || (c.updateNote && c.updateNote.trim() !== ''));

  const saveGoals = (newGoals: any) => {
    setGoals(newGoals);
    api.saveToStore('monthlyGoals', newGoals).catch(console.error);
  };

  const handleUpdateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGoal) return;
    const newGoals = goals.map(g => g.id === editingGoal.id ? editingGoal : g);
    saveGoals(newGoals);
    setEditingGoal(null);
  };

  const totalNetProfit = vipClients.reduce((acc, client) => {
    return acc + (client.adHistory || []).reduce((sum: number, record: any) => sum + (Number(record.profit) || 0), 0);
  }, 0);

  const currencyMargin = vipClients.reduce((acc, client) => {
    return acc + (client.adHistory || []).reduce((sum: number, record: any) => {
      const cost = Number(record.actualCost) || 0;
      return sum + (cost * (usdRates.chargeRate - usdRates.buyRate));
    }, 0);
  }, 0);

  const serviceMarkup = vipClients.reduce((acc, client) => {
    return acc + (client.adHistory || []).reduce((sum: number, record: any) => {
      const bill = Number(record.clientBill) || 0;
      const cost = Number(record.actualCost) || 0;
      return sum + ((bill - cost) * usdRates.chargeRate);
    }, 0);
  }, 0);

  // Date helpers for flow cards
  const now = new Date();
  const weekAgo = new Date(now); weekAgo.setDate(now.getDate() - 7);
  const halfYearAgo = new Date(now); halfYearAgo.setMonth(now.getMonth() - 6);

  const allLedgerEntries = vipClients.flatMap(client => (client.ledger || []));

  const weeklyDeposit = allLedgerEntries
    .filter((e: any) => e.credit > 0 && new Date(e.date) >= weekAgo)
    .reduce((s: number, e: any) => s + Number(e.credit), 0);
  const weeklySpent = allLedgerEntries
    .filter((e: any) => e.debit > 0 && new Date(e.date) >= weekAgo)
    .reduce((s: number, e: any) => s + Number(e.debit), 0);

  const halfYearDeposit = allLedgerEntries
    .filter((e: any) => e.credit > 0 && new Date(e.date) >= halfYearAgo)
    .reduce((s: number, e: any) => s + Number(e.credit), 0);
  const halfYearSpent = allLedgerEntries
    .filter((e: any) => e.debit > 0 && new Date(e.date) >= halfYearAgo)
    .reduce((s: number, e: any) => s + Number(e.debit), 0);

  const lifetimeDeposit = allLedgerEntries
    .filter((e: any) => e.credit > 0)
    .reduce((s: number, e: any) => s + Number(e.credit), 0);
  const lifetimeSpent = allLedgerEntries
    .filter((e: any) => e.debit > 0)
    .reduce((s: number, e: any) => s + Number(e.debit), 0);


  return (
    <div className="space-y-6">
      {/* Low Balance Alerts */}
      {lowBalanceClients.length > 0 && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl shadow-sm mb-6 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <div className="flex items-center text-red-800 font-bold mb-2">
              <AlertTriangle className="mr-2 h-5 w-5" />
              Low Balance Alerts
            </div>
            <div className="space-y-1">
              {lowBalanceClients.map(client => (
                <div key={client.id} className="text-sm text-red-700">
                  <span className="font-semibold">{client.name}</span> has a balance of ৳{client.balance.toLocaleString()} (Threshold: ৳{client.threshold.toLocaleString()})
                </div>
              ))}
            </div>
          </div>
          <button className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition shrink-0">
            Top-up Reminder
          </button>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        <div className="xl:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Activity size={64} className="text-blue-500" />
            </div>
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Weekly Flow</h3>
            <div className="flex justify-between items-end mb-2">
              <div>
                <p className="text-xs text-gray-400 mb-1">Deposit</p>
                <p className="text-2xl font-black text-gray-800">৳{weeklyDeposit.toLocaleString()}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400 mb-1">Spent</p>
                <p className="text-2xl font-black text-indigo-600">৳{weeklySpent.toLocaleString()}</p>
              </div>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5 mt-4">
              <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${weeklyDeposit > 0 ? Math.min(100, (weeklySpent / weeklyDeposit) * 100) : 0}%` }}></div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <TrendingUp size={64} className="text-green-500" />
            </div>
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Half-Yearly Flow</h3>
            <div className="flex justify-between items-end mb-2">
              <div>
                <p className="text-xs text-gray-400 mb-1">Deposit</p>
                <p className="text-2xl font-black text-gray-800">৳{halfYearDeposit.toLocaleString()}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400 mb-1">Spent</p>
                <p className="text-2xl font-black text-green-600">৳{halfYearSpent.toLocaleString()}</p>
              </div>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5 mt-4">
              <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${halfYearDeposit > 0 ? Math.min(100, (halfYearSpent / halfYearDeposit) * 100) : 0}%` }}></div>
            </div>
          </div>

          <div className="bg-gray-900 rounded-2xl shadow-sm p-6 relative overflow-hidden group text-white">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <DollarSign size={64} className="text-amber-500" />
            </div>
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Lifetime Agency Value</h3>
            <div className="flex justify-between items-end mb-2">
              <div>
                <p className="text-xs text-gray-400 mb-1">Deposit</p>
                <p className="text-2xl font-black text-white">৳{lifetimeDeposit.toLocaleString()}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400 mb-1">Spent</p>
                <p className="text-2xl font-black text-amber-500">৳{lifetimeSpent.toLocaleString()}</p>
              </div>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-1.5 mt-4">
              <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: `${lifetimeDeposit > 0 ? Math.min(100, (lifetimeSpent / lifetimeDeposit) * 100) : 0}%` }}></div>
            </div>
          </div>
        </div>

        {/* VIP Reminders Panel */}
        <div className="bg-white rounded-2xl shadow-sm border border-indigo-100 p-6 flex flex-col h-full xl:row-span-2 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
          <h3 className="text-lg font-extrabold text-gray-800 mb-4 flex items-center">
            <AlertTriangle className="mr-2 text-indigo-500 h-5 w-5" /> 
            Client Reminders & Updates
          </h3>
          
          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            {allClientsWithReminders.length === 0 ? (
              <p className="text-sm text-gray-500 italic">No particular reminders at the moment.</p>
            ) : (
              allClientsWithReminders.map(client => (
                <div key={client.id} className="bg-gray-50 rounded-xl p-4 border border-gray-100 hover:border-indigo-200 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-gray-900 text-sm">{client.name}</h4>
                    {client.lastUpdate && <span className="text-[10px] text-gray-400">{new Date(client.lastUpdate).toLocaleDateString()}</span>}
                  </div>
                  
                  {client.reminder && (
                    <div className="mb-2">
                      <span className="inline-block bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded mr-2 mb-1">Action</span>
                      <p className="text-xs text-gray-700 font-medium">{client.reminder}</p>
                    </div>
                  )}
                  
                  {client.updateNote && (
                    <div>
                      <span className="inline-block bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded mr-2 mb-1">Last Talk</span>
                      <p className="text-xs text-gray-600 italic">"{client.updateNote}"</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Agency Revenue Intel */}
        <div className="xl:col-span-3 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-extrabold text-gray-800 mb-6 flex items-center">
            <Target className="mr-2 text-indigo-500" /> Agency Revenue Intel
          </h3>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-indigo-50/50 rounded-xl p-4 border border-indigo-100">
              <p className="text-xs font-bold text-indigo-600 uppercase mb-1">Currency Arbitrage</p>
              <p className="text-xl font-black text-gray-900">৳{currencyMargin.toLocaleString()}</p>
            </div>
            <div className="bg-emerald-50/50 rounded-xl p-4 border border-emerald-100">
              <p className="text-xs font-bold text-emerald-600 uppercase mb-1">Service Markup</p>
              <p className="text-xl font-black text-gray-900">৳{serviceMarkup.toLocaleString()}</p>
            </div>
          </div>
          <div className="border-t border-gray-100 pt-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-bold text-gray-500">Monthly Net Profit (Local)</span>
              <span className="text-2xl font-black text-gray-900">৳{totalNetProfit.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold text-gray-500">Monthly Net Profit (USD)</span>
              <span className="text-xl font-black text-green-600">${(totalNetProfit / (usdRates.buyRate || 1)).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Sales Intelligence Chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-extrabold text-gray-800 flex items-center">
              <BarChartIcon className="mr-2 text-blue-500" /> Sales Intelligence
            </h3>
            <select 
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="text-sm bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 font-medium text-gray-700 outline-none"
            >
              <option value="30days">30 Days</option>
              <option value="6months">6 Months</option>
              <option value="lifetime">Lifetime</option>
            </select>
          </div>
          <div className="h-64 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockSalesData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} dy={10} />
                <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} dx={-10} />
                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} dx={10} />
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}
                />
                <Area yAxisId="left" type="monotone" dataKey="revenue" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" name="Revenue (৳)" />
                <Line yAxisId="right" type="monotone" dataKey="sales" stroke="#10b981" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} name="Sales Count" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      </div>

      {/* Monthly Goal Tracker */}
      <div>
        <h3 className="text-xl font-extrabold text-gray-800 mb-6">Monthly Goal Tracker</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {goals.map((goal, idx) => (
            <div key={goal.id || idx} className="group bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all relative">
              <button 
                onClick={() => setEditingGoal(goal)}
                className="absolute top-4 right-4 p-1.5 text-gray-400 opacity-0 group-hover:opacity-100 bg-gray-50 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition-all"
                title="লক্ষ্য আপডেট করুন"
              >
                <Edit2 size={16} />
              </button>
              <h4 className="text-sm font-bold text-gray-600 mb-4 pr-8">{goal.title}</h4>
              
              <div className="mb-4">
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-gray-500">Revenue</span>
                  <span className="font-bold text-gray-900">৳{Number(goal.current).toLocaleString()} / ৳{Number(goal.target).toLocaleString()}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${goal.current >= goal.target ? 'bg-green-500' : goal.colorClass}`} 
                    style={{ width: `${Math.min(100, (goal.current / goal.target) * 100)}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-gray-500">Clients Signed</span>
                  <span className="font-bold text-gray-900">{goal.clientsSigned} / {goal.targetClients}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${goal.clientsSigned >= goal.targetClients ? 'bg-green-400' : goal.colorLightClass}`} 
                    style={{ width: `${Math.min(100, (goal.clientsSigned / goal.targetClients) * 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Modal isOpen={!!editingGoal} onClose={() => setEditingGoal(null)} title={`${editingGoal?.title} - লক্ষ্য পরিবর্তন`}>
        {editingGoal && (
          <form onSubmit={handleUpdateGoal} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">বর্তমান রেভিনিউ (Current)</label>
                <input 
                  type="number" 
                  required
                  value={editingGoal.current} 
                  onChange={e => setEditingGoal({...editingGoal, current: Number(e.target.value)})} 
                  className="w-full border-gray-300 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-indigo-500 border bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">রেভিনিউ টার্গেট (Target)</label>
                <input 
                  type="number" 
                  required
                  value={editingGoal.target} 
                  onChange={e => setEditingGoal({...editingGoal, target: Number(e.target.value)})} 
                  className="w-full border-gray-300 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-indigo-500 border bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">বর্তমান ক্লায়েন্ট (Signed)</label>
                <input 
                  type="number" 
                  required
                  value={editingGoal.clientsSigned} 
                  onChange={e => setEditingGoal({...editingGoal, clientsSigned: Number(e.target.value)})} 
                  className="w-full border-gray-300 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-indigo-500 border bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">ক্লায়েন্ট টার্গেট (Target Clients)</label>
                <input 
                  type="number" 
                  required
                  value={editingGoal.targetClients} 
                  onChange={e => setEditingGoal({...editingGoal, targetClients: Number(e.target.value)})} 
                  className="w-full border-gray-300 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-indigo-500 border bg-white"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <button 
                type="button" 
                onClick={() => setEditingGoal(null)} 
                className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors"
              >
                বাতিল
              </button>
              <button 
                type="submit" 
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md transition-transform transform hover:-translate-y-0.5"
              >
                সেভ করুন
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
