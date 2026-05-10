import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { DollarSign, Plus, Save, TrendingUp } from 'lucide-react';
import { api } from '../../services/api';

const initialMockProfitVelocity: any[] = [];

export default function AgencyProfitView() {
  const [injectionForm, setInjectionForm] = useState({
    date: '',
    segment: '',
    amount: ''
  });

  const [usdRates, setUsdRates] = useState({
    buyRate: 130,
    chargeRate: 145
  });
  const [profitVelocity, setProfitVelocity] = useState(initialMockProfitVelocity);
  const [vipClients, setVipClients] = useState<any[]>([]);
  const [isEditingRates, setIsEditingRates] = useState(false);

  useEffect(() => {
    api.getFromStore('agencyProfitData').then(data => {
      if (data) {
        if (data.usdRates) setUsdRates(data.usdRates);
        if (data.profitVelocity) setProfitVelocity(data.profitVelocity);
      }
    }).catch(console.error);

    // Step 1: Get basic client list to get all IDs
    api.getFromStore('vipClientsData').then(async (clientList: any) => {
      if (clientList && Array.isArray(clientList)) {
        // Step 2: For each client, fetch their detailed record (which has adHistory)
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
      }
    }).catch(console.error);
  }, []);

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

  const saveData = (rates: any, velocity: any) => {
    api.saveToStore('agencyProfitData', { usdRates: rates, profitVelocity: velocity }).catch(console.error);
  };

  const handleInject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!injectionForm.amount || !injectionForm.date) return;
    
    const dayMatch = injectionForm.date.split('-');
    const dayStr = dayMatch.length === 3 ? dayMatch[2] : '00';
    
    const newVelocity = [...profitVelocity, { day: dayStr, profit: Number(injectionForm.amount) }];
    
    // Keep only last 15 entries for velocity chart to prevent overcrowding
    if (newVelocity.length > 15) {
      newVelocity.shift();
    }
    
    setProfitVelocity(newVelocity);
    saveData(usdRates, newVelocity);
    
    alert("Profit record added manually.");
    setInjectionForm({ date: '', segment: '', amount: '' });
  };

  return (
    <div className="space-y-6">
      
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-indigo-600 rounded-2xl shadow-sm border border-indigo-700 p-6 text-white relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-4 opacity-20">
            <DollarSign size={64} />
          </div>
          <h3 className="text-sm font-bold text-indigo-200 uppercase tracking-wider mb-2">Total Net Profit</h3>
          <p className="text-3xl font-black mb-1">৳{totalNetProfit.toLocaleString()}</p>
          <p className="text-sm font-medium text-indigo-200">USD: <span className="font-bold text-white">${(totalNetProfit / (usdRates.buyRate || 1)).toFixed(2)}</span></p>
        </div>
        
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Currency Margin</h3>
          <p className="text-2xl font-black text-gray-900 mb-1">৳{currencyMargin.toLocaleString()}</p>
          <div className="flex items-center text-sm font-medium text-green-600">
            <TrendingUp size={16} className="mr-1" /> +0% this month
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Service Markup</h3>
          <p className="text-2xl font-black text-gray-900 mb-1">৳{serviceMarkup.toLocaleString()}</p>
          <div className="flex items-center text-sm font-medium text-green-600">
            <TrendingUp size={16} className="mr-1" /> +0% this month
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col justify-center relative">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">USD Rates</h3>
            <button 
              onClick={() => {
                if (isEditingRates) {
                  saveData(usdRates, profitVelocity);
                }
                setIsEditingRates(!isEditingRates);
              }}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-2 py-1 rounded-md"
            >
              {isEditingRates ? 'Save' : 'Edit'}
            </button>
          </div>
          
          {isEditingRates ? (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Buy Rate (৳)</label>
                <input 
                  type="number" 
                  value={usdRates.buyRate}
                  onChange={e => setUsdRates({...usdRates, buyRate: Number(e.target.value)})}
                  className="w-full px-2 py-1.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:border-indigo-500 outline-none font-bold text-gray-800"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Charge Rate (৳)</label>
                <input 
                  type="number" 
                  value={usdRates.chargeRate}
                  onChange={e => setUsdRates({...usdRates, chargeRate: Number(e.target.value)})}
                  className="w-full px-2 py-1.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:border-indigo-500 outline-none font-bold text-indigo-600"
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Buy Rate</p>
                <p className="text-xl font-black text-gray-800">৳{usdRates.buyRate}</p>
              </div>
              <div className="border-l border-gray-100 pl-4">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Charge Rate</p>
                <p className="text-xl font-black text-indigo-600">৳{usdRates.chargeRate}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profit Velocity Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-extrabold text-gray-800 mb-6 flex items-center">
            Profit Velocity <span className="text-sm font-medium text-gray-400 ml-2">(Last 15 Days)</span>
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={profitVelocity} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} />
                <RechartsTooltip 
                  cursor={{fill: '#F3F4F6'}}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                />
                <Bar dataKey="profit" name="Net Profit (৳)" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Manual Injection Form */}
        <div className="bg-gray-50 rounded-2xl border border-gray-200 p-6">
          <h3 className="text-lg font-extrabold text-gray-800 mb-6 flex items-center">
            <Plus className="mr-2 text-indigo-600" /> Manual Injection
          </h3>
          <form onSubmit={handleInject} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Ledger Date</label>
              <input 
                type="date"
                required
                value={injectionForm.date}
                onChange={e => setInjectionForm({...injectionForm, date: e.target.value})}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Portfolio Segment</label>
              <select 
                required
                value={injectionForm.segment}
                onChange={e => setInjectionForm({...injectionForm, segment: e.target.value})}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 outline-none appearance-none"
              >
                <option value="">Select Segment...</option>
                <option value="fb_ads">Facebook Ads</option>
                <option value="web_dev">Web Development</option>
                <option value="consultancy">Consultancy</option>
                <option value="other">Other / Adjustment</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Net Profit Amount (৳)</label>
              <input 
                type="number"
                required
                placeholder="e.g. 5000"
                value={injectionForm.amount}
                onChange={e => setInjectionForm({...injectionForm, amount: e.target.value})}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 outline-none"
              />
            </div>

            {/* Benchmark Indicator */}
            {injectionForm.amount && (
              <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl mt-4 text-sm text-indigo-800 font-medium flex items-start">
                <span className="mr-2">💡</span>
                Adding ৳{Number(injectionForm.amount).toLocaleString()} will increase total net profit by { ((Number(injectionForm.amount) / 425500) * 100).toFixed(1) }%.
              </div>
            )}

            <button 
              type="submit"
              className="w-full mt-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl transition-colors flex justify-center items-center"
            >
              <Save size={18} className="mr-2" /> Save Ledger Entry
            </button>
          </form>
        </div>
      </div>

    </div>
  );
}
