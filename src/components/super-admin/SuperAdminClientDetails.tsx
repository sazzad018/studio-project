import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Wallet, TrendingUp, DollarSign, ExternalLink, 
  Plus, Minus, Settings, Shield, Ban, Calendar, Activity, 
  Save, AlertCircle, FileText, Edit2, Trash2
} from 'lucide-react';
import { api } from '../../services/api';

const initialMockClient = {
  id: 101,
  name: 'Tausif Ahmed',
  company: 'Global Traders',
  phone: '01712000001',
  website: 'https://globaltraders.com',
  fbPage: 'https://facebook.com/globaltraders',
  notes: 'Top tier VIP client, requires daily reporting.',
  balance: 0,
  adBudgetUsed: 0,
  agencyProfit: 0,
  ledger: [],
  adHistory: [],
  topUpRequests: [],
  settings: {
    walletBalance: true,
    historyLedger: true,
    messageReport: false,
    salesReport: true,
    profitLossReport: false,
    paymentMethods: true,
    allowTopUp: true,
    suspended: false,
    dollarRate: 145
  }
};
export default function SuperAdminClientDetails({ clientData, clientId, onBack, onUpdateClient }: { clientData: any, clientId: number, onBack: () => void, onUpdateClient: (data: any) => void }) {
  const [activeTab, setActiveTab] = useState('wallet');
  const [client, setClient] = useState({ ...initialMockClient, ...clientData, ledger: [], adHistory: [], topUpRequests: [] });
  const [viewImage, setViewImage] = useState<string | null>(null);
  const [editingAdRecord, setEditingAdRecord] = useState<any | null>(null);
  const [editingLedger, setEditingLedger] = useState<any | null>(null);

  useEffect(() => {
    // If clientData is passed, use it as base.
    if (clientData) {
      setClient(prev => ({ ...prev, ...clientData }));
    }
    
    // Fetch deep details (ledger, ad history, settings)
    api.getFromStore('vipClientDetails_' + clientId).then(data => {
      if (data) {
        setClient(prev => ({ ...prev, ...data, ...clientData })); // ensure base data like name/company from main list is not overwritten by old cached details
        setProfileForm({
          phone: data.phone || clientData?.phone || '', 
          website: data.website || clientData?.website || '', 
          fbPage: data.fbPage || clientData?.fbPage || '', 
          notes: data.notes || clientData?.notes || '', 
          ...(data.settings || initialMockClient.settings)
        });
      }
    }).catch(console.error);
  }, [clientId, clientData]);

  // forms
  const [walletForm, setWalletForm] = useState({ desc: '', date: '', amount: '' });
  const [adForm, setAdForm] = useState({ from: '', to: '', clientBill: '', actualCost: '', messageResults: '', salesResults: '', buyRate: '130', chargeRate: '145' });
  const [profileForm, setProfileForm] = useState({
    phone: client.phone || '', website: client.website || '', fbPage: client.fbPage || '', notes: client.notes || '', ...(client.settings || initialMockClient.settings)
  });

  const saveDetailsToDB = (updatedData: any) => {
    api.saveToStore('vipClientDetails_' + clientId, updatedData).catch(console.error);
  };

  const handleWalletSubmit = (type: 'add' | 'deduct') => {
    if (!walletForm.amount || !walletForm.desc) return;
    const amount = Number(walletForm.amount);
    const newBalance = type === 'add' ? client.balance + amount : client.balance - amount;
    
    const newLedger = {
      id: Date.now(),
      date: walletForm.date || new Date().toISOString().split('T')[0],
      desc: walletForm.desc,
      credit: type === 'add' ? amount : 0,
      debit: type === 'deduct' ? amount : 0,
      balance: newBalance
    };

    const updatedClient = {
      ...client,
      balance: newBalance,
      ledger: [newLedger, ...(client.ledger || [])]
    };

    setClient(updatedClient);
    saveDetailsToDB(updatedClient);
    onUpdateClient({ balance: newBalance });
    setWalletForm({ desc: '', date: '', amount: '' });
  };

  const handleApproveTopUp = (reqId: number, amount: number) => {
    if (!window.confirm("Are you sure you want to approve this top-up? It will add ৳" + amount + " to the client's wallet.")) return;

    const newBalance = (client.balance || 0) + amount;
    const newLedger = {
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      desc: 'Top-Up Request Approved',
      credit: amount,
      debit: 0,
      balance: newBalance
    };

    const updatedTopUps = (client.topUpRequests || []).map((req: any) => 
      req.id === reqId ? { ...req, status: 'approved' } : req
    );

    const updatedClient = {
      ...client,
      balance: newBalance,
      ledger: [newLedger, ...(client.ledger || [])],
      topUpRequests: updatedTopUps
    };

    setClient(updatedClient);
    saveDetailsToDB(updatedClient);
    onUpdateClient({ balance: newBalance });
    alert("Top-up approved and wallet updated successfully.");
  };

  const handleDeleteTopUp = (reqId: number) => {
    if (!window.confirm('Delete this top-up request? If it was approved, the balance will be reversed.')) return;
    const req = (client.topUpRequests || []).find((r: any) => r.id === reqId);
    if (!req) return;
    const balanceAdjust = req.status === 'approved' ? -req.amount : 0;
    const updatedTopUps = (client.topUpRequests || []).filter((r: any) => r.id !== reqId);
    const updatedLedger = req.status === 'approved'
      ? (client.ledger || []).filter((l: any) => !(l.credit === req.amount && l.desc === 'Top-Up Request Approved'))
      : client.ledger;
    const updatedClient = {
      ...client,
      balance: client.balance + balanceAdjust,
      topUpRequests: updatedTopUps,
      ledger: updatedLedger
    };
    setClient(updatedClient);
    saveDetailsToDB(updatedClient);
    onUpdateClient({ balance: updatedClient.balance });
    alert('Top-up request deleted.');
  };

  const handleEditLedger = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLedger) return;
    const updatedLedger = (client.ledger || []).map((l: any) =>
      l.id === editingLedger.id ? { ...editingLedger, credit: Number(editingLedger.credit), debit: Number(editingLedger.debit), balance: Number(editingLedger.balance) } : l
    );
    const updatedClient = { ...client, ledger: updatedLedger };
    setClient(updatedClient);
    saveDetailsToDB(updatedClient);
    setEditingLedger(null);
    alert('Ledger entry updated.');
  };

  const handleDeleteLedger = (logId: number) => {
    if (!window.confirm('Delete this ledger entry? This will not auto-adjust the wallet balance.')) return;
    const updatedLedger = (client.ledger || []).filter((l: any) => l.id !== logId);
    const updatedClient = { ...client, ledger: updatedLedger };
    setClient(updatedClient);
    saveDetailsToDB(updatedClient);
    alert('Ledger entry deleted.');
  };

  const handleEditAdRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAdRecord) return;

    const buyRate = Number(editingAdRecord.buyRate) || 130;
    const chargeRate = Number(editingAdRecord.chargeRate) || 145;
    const walletEffect = Number(editingAdRecord.clientBill) * chargeRate;
    const agencyCost = Number(editingAdRecord.actualCost) * buyRate;
    const profit = walletEffect - agencyCost;

    const updatedRecord = {
      ...editingAdRecord,
      clientBill: Number(editingAdRecord.clientBill),
      actualCost: Number(editingAdRecord.actualCost),
      messageResults: Number(editingAdRecord.messageResults) || 0,
      salesResults: Number(editingAdRecord.salesResults) || 0,
      profit,
      walletEffect: -walletEffect
    };

    const oldRecord = (client.adHistory || []).find((h: any) => h.id === editingAdRecord.id);
    const profitDiff = profit - (oldRecord?.profit || 0);
    const walletDiff = -walletEffect - (oldRecord?.walletEffect || 0);

    const updatedAdHistory = (client.adHistory || []).map((h: any) =>
      h.id === editingAdRecord.id ? updatedRecord : h
    );

    const updatedClient = {
      ...client,
      balance: client.balance + walletDiff,
      adBudgetUsed: (client.adBudgetUsed || 0) - walletDiff,
      agencyProfit: (client.agencyProfit || 0) + profitDiff,
      adHistory: updatedAdHistory
    };

    setClient(updatedClient);
    saveDetailsToDB(updatedClient);
    onUpdateClient({ balance: updatedClient.balance, totalSpent: updatedClient.adBudgetUsed });
    setEditingAdRecord(null);
    alert('Record updated successfully!');
  };

  const handleDeleteAdRecord = (recordId: number) => {
    if (!window.confirm('Are you sure you want to delete this record? The wallet and profit will be reversed.')) return;

    const record = (client.adHistory || []).find((h: any) => h.id === recordId);
    if (!record) return;

    const walletEffect = Math.abs(record.walletEffect);

    // Also remove matching ledger entry (Ad Deduction for this period)
    const matchDesc = `Ad Deduction (${record.from} to ${record.to})`;
    const updatedLedger = (client.ledger || []).filter((l: any) => l.desc !== matchDesc);

    const updatedAdHistory = (client.adHistory || []).filter((h: any) => h.id !== recordId);
    const updatedClient = {
      ...client,
      balance: client.balance + walletEffect,
      adBudgetUsed: Math.max(0, (client.adBudgetUsed || 0) - walletEffect),
      agencyProfit: Math.max(0, (client.agencyProfit || 0) - record.profit),
      adHistory: updatedAdHistory,
      ledger: updatedLedger
    };

    setClient(updatedClient);
    saveDetailsToDB(updatedClient);
    onUpdateClient({ balance: updatedClient.balance, totalSpent: updatedClient.adBudgetUsed });
    alert('Record deleted — wallet reversed and ledger entry removed.');
  };

  const adWalletEffect = (Number(adForm.clientBill) || 0) * (Number(adForm.chargeRate) || 145);
  const adAgencyCost = (Number(adForm.actualCost) || 0) * (Number(adForm.buyRate) || 130);
  const adProfit = adWalletEffect - adAgencyCost;

  const handleAdPerformanceSave = () => {
    if (!adForm.clientBill || !adForm.actualCost) return;
    
    const newAdRecord = {
      id: Date.now(),
      from: adForm.from,
      to: adForm.to,
      clientBill: Number(adForm.clientBill),
      actualCost: Number(adForm.actualCost),
      messageResults: Number(adForm.messageResults) || 0,
      salesResults: Number(adForm.salesResults) || 0,
      profit: adProfit,
      walletEffect: -adWalletEffect
    };

    const newBalance = client.balance - adWalletEffect;
    const newLedger = {
      id: Date.now(),
      date: adForm.to || new Date().toISOString().split('T')[0],
      desc: `Ad Deduction (${adForm.from} to ${adForm.to})`,
      credit: 0,
      debit: adWalletEffect,
      balance: newBalance
    };

    const updatedClient = {
      ...client,
      balance: newBalance,
      adBudgetUsed: (client.adBudgetUsed || 0) + adWalletEffect,
      agencyProfit: (client.agencyProfit || 0) + adProfit,
      adHistory: [newAdRecord, ...(client.adHistory || [])],
      ledger: [newLedger, ...(client.ledger || [])]
    };

    setClient(updatedClient);
    saveDetailsToDB(updatedClient);
    onUpdateClient({ balance: newBalance, totalSpent: updatedClient.adBudgetUsed });
    
    setAdForm({ from: '', to: '', clientBill: '', actualCost: '', messageResults: '', salesResults: '', buyRate: '', chargeRate: '' });
  };

  const handleProfileSave = () => {
    const updatedClient = {
      ...client,
      phone: profileForm.phone,
      website: profileForm.website,
      fbPage: profileForm.fbPage,
      notes: profileForm.notes,
      settings: {
        walletBalance: profileForm.walletBalance,
        historyLedger: profileForm.historyLedger,
        messageReport: profileForm.messageReport,
        salesReport: profileForm.salesReport,
        profitLossReport: profileForm.profitLossReport,
        paymentMethods: profileForm.paymentMethods,
        allowTopUp: profileForm.allowTopUp,
        suspended: profileForm.suspended,
        dollarRate: profileForm.dollarRate
      }
    };
    
    setClient(updatedClient);
    saveDetailsToDB(updatedClient);
    alert('Profile & Settings saved successfully.');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-200">
        <div className="flex items-center">
          <button onClick={onBack} className="p-2 mr-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors text-gray-600">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-2xl font-black text-gray-900">{client.name}</h2>
            <p className="text-sm font-medium text-gray-500">{client.company} <span className="mx-2">•</span> VIP Client</p>
          </div>
        </div>
        <button onClick={() => window.open(`/?vip-client=${clientId}`, '_blank')} className="flex items-center bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-xl text-sm font-bold hover:bg-gray-50 transition-colors shadow-sm">
          <ExternalLink size={16} className="mr-2" /> Switch to Client View
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-indigo-600 rounded-2xl shadow-sm border border-indigo-700 p-6 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-20"><Wallet size={64} /></div>
          <h3 className="text-sm font-bold text-indigo-200 uppercase tracking-wider mb-2">Current Wallet Balance</h3>
          <p className="text-3xl font-black mb-1">৳{client.balance.toLocaleString()}</p>
        </div>
        
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><Activity size={64} className="text-blue-500" /></div>
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Total Ad Budget Used</h3>
          <p className="text-3xl font-black text-gray-900">৳{(client.adBudgetUsed || 0).toLocaleString()}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><TrendingUp size={64} className="text-emerald-500" /></div>
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Agency Profit</h3>
          <p className="text-3xl font-black text-emerald-600">৳{(client.agencyProfit || 0).toLocaleString()}</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex overflow-x-auto bg-gray-100 p-1 rounded-2xl">
        {[
          { id: 'wallet', label: 'Wallet & Funds', icon: Wallet },
          { id: 'ad', label: 'Ad Performance', icon: Activity },
          { id: 'topup', label: 'Top-Up Requests', icon: DollarSign },
          { id: 'profile', label: 'Profile & Settings', icon: Settings },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center px-4 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === tab.id ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <tab.icon size={16} className="mr-2" /> {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        
        {/* WALLET & FUNDS */}
        {activeTab === 'wallet' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:col-span-1 h-fit">
              <h3 className="text-lg font-extrabold text-gray-800 mb-6">Manual Wallet Adjustment</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Reference Description</label>
                  <input type="text" value={walletForm.desc} onChange={e => setWalletForm({...walletForm, desc: e.target.value})} placeholder="e.g. Bkash transfer" className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Date</label>
                  <input type="date" value={walletForm.date} onChange={e => setWalletForm({...walletForm, date: e.target.value})} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Amount (৳)</label>
                  <input type="number" value={walletForm.amount} onChange={e => setWalletForm({...walletForm, amount: e.target.value})} placeholder="0.00" className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none font-bold text-lg" />
                </div>
                <div className="flex gap-3 pt-2">
                  <button onClick={() => handleWalletSubmit('add')} className="flex-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold py-3 px-4 rounded-xl transition-colors flex justify-center items-center">
                    <Plus size={18} className="mr-1" /> Add Funds
                  </button>
                  <button onClick={() => handleWalletSubmit('deduct')} className="flex-1 bg-red-50 text-red-700 hover:bg-red-100 font-bold py-3 px-4 rounded-xl transition-colors flex justify-center items-center">
                    <Minus size={18} className="mr-1" /> Deduct
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:col-span-2">
              <h3 className="text-lg font-extrabold text-gray-800 mb-6 flex items-center">
                <FileText className="mr-2 text-indigo-500" /> Ledger Table
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-bold pb-2">
                      <th className="p-3">Date</th>
                      <th className="p-3">Description</th>
                      <th className="p-3 text-right">Credit</th>
                      <th className="p-3 text-right">Debit</th>
                      <th className="p-3 text-right">Balance</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(client.ledger || []).map((log: any) => (
                      <tr key={log.id} className="border-b border-gray-50 text-sm font-medium text-gray-800 hover:bg-gray-50/50">
                        <td className="p-3 text-gray-500">{log.date}</td>
                        <td className="p-3">{log.desc}</td>
                        <td className="p-3 text-right text-emerald-600 font-bold">{log.credit > 0 ? `৳${log.credit.toLocaleString()}` : '-'}</td>
                        <td className="p-3 text-right text-red-600 font-bold">{log.debit > 0 ? `৳${log.debit.toLocaleString()}` : '-'}</td>
                        <td className="p-3 text-right font-black text-gray-900">৳{log.balance.toLocaleString()}</td>
                        <td className="p-3 text-right">
                          <div className="flex justify-end gap-2">
                            <button onClick={() => setEditingLedger({...log})} className="text-indigo-500 hover:text-indigo-700 bg-indigo-50 p-1.5 rounded-lg" title="Edit"><Edit2 size={14} /></button>
                            <button onClick={() => handleDeleteLedger(log.id)} className="text-red-500 hover:text-red-700 bg-red-50 p-1.5 rounded-lg" title="Delete"><Trash2 size={14} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {(!client.ledger || client.ledger.length === 0) && (
                      <tr>
                        <td colSpan={5} className="p-6 text-center text-gray-500 font-medium">No ledger records yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* AD PERFORMANCE */}
        {activeTab === 'ad' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-extrabold text-gray-800 mb-6">Ad Performance Log</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-2 grid grid-cols-2 gap-4">
                  <div><label className="block text-xs font-bold text-gray-500 mb-1">From Date</label><input type="date" value={adForm.from} onChange={e => setAdForm({...adForm, from: e.target.value})} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 outline-none" /></div>
                  <div><label className="block text-xs font-bold text-gray-500 mb-1">To Date</label><input type="date" value={adForm.to} onChange={e => setAdForm({...adForm, to: e.target.value})} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 outline-none" /></div>
                </div>
                <div><label className="block text-xs font-bold text-gray-500 mb-1">Client Bill ($)</label><input type="number" value={adForm.clientBill} onChange={e => setAdForm({...adForm, clientBill: e.target.value})} placeholder="0.00" className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 outline-none font-bold" /></div>
                <div><label className="block text-xs font-bold text-gray-500 mb-1">Actual Cost ($)</label><input type="number" value={adForm.actualCost} onChange={e => setAdForm({...adForm, actualCost: e.target.value})} placeholder="0.00" className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 outline-none font-bold" /></div>
                <div><label className="block text-xs font-bold text-gray-500 mb-1">Message Results</label><input type="number" value={adForm.messageResults} onChange={e => setAdForm({...adForm, messageResults: e.target.value})} placeholder="0" className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 outline-none" /></div>
                <div><label className="block text-xs font-bold text-gray-500 mb-1">Sales Results</label><input type="number" value={adForm.salesResults} onChange={e => setAdForm({...adForm, salesResults: e.target.value})} placeholder="0" className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 outline-none" /></div>
                <div><label className="block text-xs font-bold text-gray-500 mb-1">Buy Rate</label><input type="number" value={adForm.buyRate} onChange={e => setAdForm({...adForm, buyRate: e.target.value})} placeholder="0.00" className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 outline-none" /></div>
                <div><label className="block text-xs font-bold text-gray-500 mb-1">Charge Rate</label><input type="number" value={adForm.chargeRate} onChange={e => setAdForm({...adForm, chargeRate: e.target.value})} placeholder="0.00" className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 outline-none" /></div>
                
                <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3 flex flex-col justify-center">
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-indigo-800">Computed Profit:</span>
                    <span className="text-emerald-600">৳{adProfit > 0 ? adProfit.toLocaleString() : '0'}</span>
                  </div>
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-indigo-800">Wallet Effect:</span>
                    <span className="text-red-500">-৳{adWalletEffect > 0 ? adWalletEffect.toLocaleString() : '0'}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button onClick={handleAdPerformanceSave} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl transition-colors flex items-center">
                  <Minus size={18} className="mr-2" /> Deduct Wallet & Save Record
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-extrabold text-gray-800 mb-6 flex items-center">
                <Calendar className="mr-2 text-indigo-500" /> Ad Performance History
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-bold pb-2">
                      <th className="p-3">Period</th>
                      <th className="p-3 text-right">Client Bill</th>
                      <th className="p-3 text-right">Actual Cost</th>
                      <th className="p-3 text-right">Message</th>
                      <th className="p-3 text-right">Sales</th>
                      <th className="p-3 text-right">Agency Profit</th>
                      <th className="p-3 text-right">Wallet Effect</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(client.adHistory || []).map((hist: any) => (
                      <tr key={hist.id} className="border-b border-gray-50 text-sm font-medium text-gray-800 hover:bg-gray-50/50">
                        <td className="p-3 text-gray-500 w-1/5">{hist.from} to {hist.to}</td>
                        <td className="p-3 text-right font-bold text-gray-800">${hist.clientBill.toFixed(2)}</td>
                        <td className="p-3 text-right">${hist.actualCost.toFixed(2)}</td>
                        <td className="p-3 text-right">{hist.messageResults > 0 ? hist.messageResults : '-'}</td>
                        <td className="p-3 text-right">{hist.salesResults > 0 ? hist.salesResults : '-'}</td>
                        <td className="p-3 text-right text-emerald-600 font-bold">৳{hist.profit.toLocaleString()}</td>
                        <td className="p-3 text-right text-red-600">৳{hist.walletEffect.toLocaleString()}</td>
                        <td className="p-3 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => setEditingAdRecord({ ...hist, buyRate: 130, chargeRate: 145 })}
                              className="text-indigo-500 hover:text-indigo-700 bg-indigo-50 p-1.5 rounded-lg"
                              title="Edit"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              onClick={() => handleDeleteAdRecord(hist.id)}
                              className="text-red-500 hover:text-red-700 bg-red-50 p-1.5 rounded-lg"
                              title="Delete"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {(!client.adHistory || client.adHistory.length === 0) && (
                      <tr>
                        <td colSpan={8} className="p-6 text-center text-gray-500 font-medium">No ad performance records yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TOP-UP REQUESTS */}
        {activeTab === 'topup' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-extrabold text-gray-800 mb-6 flex items-center">
               <DollarSign className="mr-2 text-indigo-500" /> Request History
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-bold pb-2">
                    <th className="p-3">Date</th>
                    <th className="p-3">Amount & Note</th>
                    <th className="p-3 text-center">Screenshot</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(client.topUpRequests || []).map((req: any) => (
                    <tr key={req.id} className="border-b border-gray-50 text-sm font-medium text-gray-800 hover:bg-gray-50/50">
                      <td className="p-3 text-gray-500">{req.date}</td>
                      <td className="p-3">
                        <div className="font-bold text-gray-900 text-lg">৳{req.amount.toLocaleString()}</div>
                        {req.note && <div className="text-xs text-gray-500 mt-1 max-w-xs">{req.note}</div>}
                      </td>
                      <td className="p-3 text-center">
                        {req.screenshot ? (
                          <img 
                            src={req.screenshot} 
                            alt="Screenshot" 
                            className="w-16 h-16 object-cover rounded cursor-pointer mx-auto border border-gray-200 hover:border-indigo-400"
                            onClick={() => setViewImage(req.screenshot)}
                          />
                        ) : (
                          <span className="text-xs text-gray-400">None</span>
                        )}
                      </td>
                      <td className="p-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                          req.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {req.status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex justify-end gap-2">
                          {req.status === 'pending' && (
                            <button onClick={() => handleApproveTopUp(req.id, req.amount)} className="text-indigo-600 font-bold hover:text-indigo-800 text-sm bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100">Approve</button>
                          )}
                          <button onClick={() => handleDeleteTopUp(req.id)} className="text-red-500 hover:text-red-700 bg-red-50 p-1.5 rounded-lg" title="Delete"><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {(!client.topUpRequests || client.topUpRequests.length === 0) && (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-gray-500 font-medium">No top-up requests found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* PROFILE & SETTINGS */}
        {activeTab === 'profile' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-extrabold text-gray-800 mb-6 flex items-center">
                 <Shield className="mr-2 text-indigo-500" /> Client Profile
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Phone Number</label>
                  <input type="text" value={profileForm.phone} onChange={e => setProfileForm({...profileForm, phone: e.target.value})} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:border-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Website URL</label>
                  <input type="url" value={profileForm.website} onChange={e => setProfileForm({...profileForm, website: e.target.value})} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:border-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Facebook Page</label>
                  <input type="url" value={profileForm.fbPage} onChange={e => setProfileForm({...profileForm, fbPage: e.target.value})} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:border-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Admin Notes</label>
                  <textarea rows={3} value={profileForm.notes} onChange={e => setProfileForm({...profileForm, notes: e.target.value})} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:border-indigo-500 outline-none resize-none"></textarea>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-extrabold text-gray-800 mb-6 flex items-center">
                 <Settings className="mr-2 text-indigo-500" /> Portal Visibility
              </h3>
              <div className="space-y-3 mb-8">
                {[
                  { id: 'walletBalance', label: 'Wallet Balance' },
                  { id: 'historyLedger', label: 'History Ledger' },
                  { id: 'messageReport', label: 'Message Report' },
                  { id: 'salesReport', label: 'Sales Report' },
                  { id: 'profitLossReport', label: 'Profit/Loss Report' },
                  { id: 'paymentMethods', label: 'Payment Methods' },
                  { id: 'allowTopUp', label: 'Allow Top-up' },
                ].map(setting => (
                  <label key={setting.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                    <span className="text-sm font-bold text-gray-700">{setting.label}</span>
                    <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                      <input 
                        type="checkbox" 
                        name="toggle" 
                        id={setting.id} 
                        checked={profileForm[setting.id as keyof typeof profileForm] as boolean}
                        onChange={e => setProfileForm({...profileForm, [setting.id]: e.target.checked})}
                        className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer"
                        style={{ right: profileForm[setting.id as keyof typeof profileForm] ? '0' : 'auto', borderColor: profileForm[setting.id as keyof typeof profileForm] ? '#4F46E5' : '#D1D5DB' }}
                      />
                      <label htmlFor={setting.id} className="toggle-label block overflow-hidden h-5 rounded-full bg-gray-300 cursor-pointer" style={{ backgroundColor: profileForm[setting.id as keyof typeof profileForm] ? '#4F46E5' : '#D1D5DB' }}></label>
                    </div>
                  </label>
                ))}
                
                <div className="flex items-center justify-between p-3 bg-blue-50/50 border border-blue-100 rounded-xl">
                    <span className="text-sm font-bold text-blue-900">Dollar Rate (৳)</span>
                    <div className="flex items-center space-x-2">
                        <span className="text-sm font-bold text-blue-700">$1 = </span>
                        <input type="number" value={profileForm.dollarRate} onChange={e => setProfileForm({...profileForm, dollarRate: Number(e.target.value)})} className="w-20 px-3 py-1.5 bg-white border border-blue-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none font-bold text-blue-900 text-right" />
                    </div>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-6">
                <label className="flex items-center justify-between p-4 bg-red-50 border border-red-100 rounded-xl cursor-pointer">
                  <div className="flex items-center">
                    <Ban className="text-red-500 mr-3" size={20} />
                    <div>
                      <span className="text-sm font-bold text-red-900 block">Suspend Portal Access</span>
                      <span className="text-xs font-medium text-red-600">Block this client from logging in</span>
                    </div>
                  </div>
                  <div className="relative inline-block w-10 mr-2 align-middle select-none">
                      <input 
                        type="checkbox" 
                        checked={profileForm.suspended}
                        onChange={e => setProfileForm({...profileForm, suspended: e.target.checked})}
                        className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer"
                        style={{ right: profileForm.suspended ? '0' : 'auto', borderColor: profileForm.suspended ? '#EF4444' : '#D1D5DB' }}
                      />
                      <label className="toggle-label block overflow-hidden h-5 rounded-full cursor-pointer" style={{ backgroundColor: profileForm.suspended ? '#EF4444' : '#D1D5DB' }}></label>
                    </div>
                </label>
              </div>

              <div className="mt-8">
                <button onClick={handleProfileSave} className="w-full bg-gray-900 hover:bg-black text-white font-bold py-3 px-4 rounded-xl transition-colors flex justify-center items-center">
                  <Save size={18} className="mr-2" /> Save All Changes
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
      
      {/* Image Viewer Modal */}
      {viewImage && (
        <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4" onClick={() => setViewImage(null)}>
          <div className="relative max-w-4xl max-h-[90vh] w-full" onClick={e => e.stopPropagation()}>
            <button onClick={() => setViewImage(null)} className="absolute -top-12 right-0 text-white hover:text-gray-300 bg-white/10 rounded-full p-2">
               Close
            </button>
            <img src={viewImage} alt="Large View" className="w-full h-full object-contain rounded-xl" />
          </div>
        </div>
      )}

      {/* Edit Ad Record Modal */}
      {editingAdRecord && (
        <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4" onClick={() => setEditingAdRecord(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-extrabold text-gray-900 mb-5 flex items-center">
              <Edit2 size={18} className="mr-2 text-indigo-500" /> Edit Ad Performance Record
            </h3>
            <form onSubmit={handleEditAdRecord} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Period From</label>
                  <input type="date" value={editingAdRecord.from} onChange={e => setEditingAdRecord({...editingAdRecord, from: e.target.value})} className="w-full border border-gray-200 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-indigo-300 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Period To</label>
                  <input type="date" value={editingAdRecord.to} onChange={e => setEditingAdRecord({...editingAdRecord, to: e.target.value})} className="w-full border border-gray-200 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-indigo-300 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Client Bill ($)</label>
                  <input type="number" required value={editingAdRecord.clientBill} onChange={e => setEditingAdRecord({...editingAdRecord, clientBill: e.target.value})} className="w-full border border-gray-200 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-indigo-300 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Actual Cost ($)</label>
                  <input type="number" required value={editingAdRecord.actualCost} onChange={e => setEditingAdRecord({...editingAdRecord, actualCost: e.target.value})} className="w-full border border-gray-200 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-indigo-300 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Buy Rate (৳/$)</label>
                  <input type="number" value={editingAdRecord.buyRate} onChange={e => setEditingAdRecord({...editingAdRecord, buyRate: e.target.value})} className="w-full border border-gray-200 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-indigo-300 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Charge Rate (৳/$)</label>
                  <input type="number" value={editingAdRecord.chargeRate} onChange={e => setEditingAdRecord({...editingAdRecord, chargeRate: e.target.value})} className="w-full border border-gray-200 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-indigo-300 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Message Results</label>
                  <input type="number" value={editingAdRecord.messageResults} onChange={e => setEditingAdRecord({...editingAdRecord, messageResults: e.target.value})} className="w-full border border-gray-200 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-indigo-300 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Sales Results</label>
                  <input type="number" value={editingAdRecord.salesResults} onChange={e => setEditingAdRecord({...editingAdRecord, salesResults: e.target.value})} className="w-full border border-gray-200 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-indigo-300 text-sm" />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setEditingAdRecord(null)} className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors">Cancel</button>
                <button type="submit" className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md transition-colors">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Ledger Edit Modal */}
      {editingLedger && (
        <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4" onClick={() => setEditingLedger(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-extrabold text-gray-900 mb-5 flex items-center">
              <Edit2 size={18} className="mr-2 text-indigo-500" /> Edit Ledger Entry
            </h3>
            <form onSubmit={handleEditLedger} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Date</label>
                <input type="date" value={editingLedger.date} onChange={e => setEditingLedger({...editingLedger, date: e.target.value})} className="w-full border border-gray-200 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-indigo-300 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Description</label>
                <input type="text" value={editingLedger.desc} onChange={e => setEditingLedger({...editingLedger, desc: e.target.value})} className="w-full border border-gray-200 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-indigo-300 text-sm" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Credit (৳)</label>
                  <input type="number" value={editingLedger.credit} onChange={e => setEditingLedger({...editingLedger, credit: e.target.value})} className="w-full border border-gray-200 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-indigo-300 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Debit (৳)</label>
                  <input type="number" value={editingLedger.debit} onChange={e => setEditingLedger({...editingLedger, debit: e.target.value})} className="w-full border border-gray-200 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-indigo-300 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Balance (৳)</label>
                  <input type="number" value={editingLedger.balance} onChange={e => setEditingLedger({...editingLedger, balance: e.target.value})} className="w-full border border-gray-200 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-indigo-300 text-sm" />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setEditingLedger(null)} className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors">Cancel</button>
                <button type="submit" className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md transition-colors">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
