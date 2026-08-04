import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, Check, X, Target, Calendar as CalendarIcon, PieChart, Users, Globe, ExternalLink } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}`;

const Calendar = ({ month, year, onDateClick }) => {
    // month is 0-11
    const getDaysInMonth = (m, y) => new Date(y, m + 1, 0).getDate();
    const getFirstDayOfMonth = (m, y) => new Date(y, m, 1).getDay();

    const daysInMonth = getDaysInMonth(month, year);
    const firstDay = getFirstDayOfMonth(month, year);
    const weekdays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"];

    const blanks = Array.from({ length: firstDay });
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    return (
        <div className="flex-1 min-w-[280px]">
            <h4 className="text-center font-bold text-gray-800 dark:text-brand-darkText mb-6 transition-colors">{monthNames[month]} {year}</h4>
            <div className="grid grid-cols-7 gap-y-4 text-center">
                {weekdays.map((d, i) => <span key={`wd-${i}`} className="text-[10px] font-bold text-gray-400 dark:text-gray-500 transition-colors uppercase">{d}</span>)}
                
                {blanks.map((_, i) => <span key={`blank-${i}`} />)}
                
                {days.map((d) => (
                    <button 
                        key={d} 
                        onClick={() => onDateClick && onDateClick(d, monthNames[month], year)}
                        className="text-xs font-bold text-gray-700 dark:text-gray-300 hover:text-brand-orange hover:bg-orange-50 dark:hover:bg-brand-orange/20 rounded-full w-8 h-8 flex items-center justify-center mx-auto transition-colors"
                    >
                        {d}
                    </button>
                ))}
            </div>
        </div>
    );
};

const Ads = () => {
    const [showNewCampaign, setShowNewCampaign] = useState(false);
    const [pendingCampaigns, setPendingCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusModal, setStatusModal] = useState({ show: false, type: 'success', title: '', message: '' });

    const [users, setUsers] = useState([]);
    const [families, setFamilies] = useState([]);

    const [slotRates, setSlotRates] = useState({
        'SLOT-01': 50,
        'SLOT-02': 30,
        'SLOT-03': 20,
        'SLOT-04': 75
    });
    const [isUpdatingRates, setIsUpdatingRates] = useState(false);
    
    // Single Slot Update Modal
    const [selectedSlotForUpdate, setSelectedSlotForUpdate] = useState(null);
    const [updatingSingleRate, setUpdatingSingleRate] = useState(false);

    // Modal Form State
    const [formData, setFormData] = useState({
        name: '',
        placement: 'banner',
        start_date: '',
        end_date: '',
        region: 'Global',
        familyType: '',
        advertiser_id: '',
        budget: 50000,
        daily_kcc_rate: ''
    });

    // Calendar state
    const [calendarDate, setCalendarDate] = useState(new Date());

    useEffect(() => {
        fetchCampaigns();
        fetchUsersAndFamilies();
    }, []);

    const fetchUsersAndFamilies = async () => {
        try {
            const token = localStorage.getItem('token');
            const usersRes = await fetch(`${API_BASE}/admin/users`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (usersRes.ok) {
                const data = await usersRes.json();
                setUsers(data.users || []);
            }

            const familiesRes = await fetch(`${API_BASE}/admin/business/risk-assessment`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (familiesRes.ok) {
                const data = await familiesRes.json();
                setFamilies(data || []);
            }
        } catch (err) {
            console.error('Failed to fetch users or families', err);
        }
    };

    const fetchCampaigns = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE}/campaigns`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setPendingCampaigns(data.campaigns || []);
            }
        } catch (error) {
            console.error('Failed to fetch campaigns', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleDateClick = (day, month, year) => {
        const monthNum = new Date(`${month} 1, ${year}`).getMonth() + 1;
        const formattedDate = `${year}-${monthNum.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
        setFormData(prev => ({ ...prev, start_date: formattedDate }));
        setShowNewCampaign(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE}/campaigns`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    title: formData.name || 'New Campaign',
                    description: `Targeting: ${formData.familyType}`,
                    placement: formData.placement,
                    start_date: formData.start_date || new Date().toISOString(),
                    end_date: formData.end_date || new Date(Date.now() + 86400000).toISOString(),
                    target_audience: { region: formData.region, familyType: formData.familyType },
                    advertiser_id: formData.advertiser_id || undefined,
                    daily_kcc_rate: Number(formData.daily_kcc_rate) || 0
                })
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || 'Failed to create campaign');

            setStatusModal({
                show: true,
                type: 'success',
                title: 'Campaign Created',
                message: `Your campaign has been submitted. KCC coins are reserved. Transaction: ${data.campaign.kcc_transaction_id}`
            });
            
            setShowNewCampaign(false);
            setFormData({ name: '', placement: 'banner', start_date: '', end_date: '', region: 'Global', familyType: '', advertiser_id: '', budget: 50000 });
            fetchCampaigns();
        } catch (error) {
            setStatusModal({
                show: true,
                type: 'error',
                title: 'Creation Failed',
                message: error.message
            });
        }
    };

    const handleReview = async (id, action) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE}/campaigns/${id}/review`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ action, reason: 'Reviewed by admin' })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to review campaign');

            setStatusModal({
                show: true,
                type: 'success',
                title: 'Review Successful',
                message: data.message
            });
            fetchCampaigns();
        } catch (error) {
            setStatusModal({
                show: true,
                type: 'error',
                title: 'Review Failed',
                message: error.message
            });
        }
    };

    // Dynamic Calculations
    const totalKCCSpent = pendingCampaigns.reduce((acc, cp) => acc + (parseFloat(cp.total_cost_kcc) || 0), 0);
    const regions = [...new Set(pendingCampaigns.map(c => c.target_audience?.region).filter(Boolean))];
    const familyTypes = [...new Set(pendingCampaigns.map(c => c.target_audience?.familyType).filter(Boolean))];

    // Check if slots are occupied
    const isOccupied = (placementStr) => pendingCampaigns.some(cp => cp.placement === placementStr && cp.status === 'scheduled');

    const calculatedSlots = [
        { id: 'SLOT-01', pos: 'Global Header - Main', rate: slotRates['SLOT-01'], status: isOccupied('banner') ? 'Occupied' : 'Available', placementType: 'banner' },
        { id: 'SLOT-02', pos: 'Family Tree - Sidebar', rate: slotRates['SLOT-02'], status: isOccupied('sidebar') ? 'Occupied' : 'Available', placementType: 'sidebar' },
        { id: 'SLOT-03', pos: 'Member Registry - In-feed', rate: slotRates['SLOT-03'], status: isOccupied('feed') ? 'Occupied' : 'Available', placementType: 'feed' },
        { id: 'SLOT-04', pos: 'Events Page - Top Banner', rate: slotRates['SLOT-04'], status: isOccupied('events') ? 'Occupied' : 'Available', placementType: 'events' },
    ];

    const handlePrevMonth = () => setCalendarDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    const handleNextMonth = () => setCalendarDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    const handleMonthChange = (e) => setCalendarDate(prev => new Date(prev.getFullYear(), parseInt(e.target.value, 10), 1));
    const handleYearChange = (e) => setCalendarDate(prev => new Date(parseInt(e.target.value, 10), prev.getMonth(), 1));

    const handleUpdateRates = () => {
        setIsUpdatingRates(true);
        setTimeout(() => {
            setIsUpdatingRates(false);
            setStatusModal({
                show: true,
                type: 'success',
                title: 'Rates Updated',
                message: 'All ad slot pricing has been updated globally.'
            });
        }, 1500);
    };

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl pb-20 px-4 sm:px-0">
            <header className="flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-brand-darkText transition-colors">Advertising & Promotions Management</h1>
                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-1 font-medium transition-colors">Manage ad inventory, campaign approvals, and budget tracking.</p>
                </div>
                <button
                    onClick={() => setShowNewCampaign(true)}
                    className="flex items-center space-x-2 bg-brand-orange text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-brand-orange/20 hover:bg-orange-600 transition-all active:scale-95"
                >
                    <Plus size={18} />
                    <span>New Campaign</span>
                </button>
            </header>

            {/* Ad Slot Inventory */}
            <section className="space-y-6">
                <h2 className="text-xl font-bold text-gray-800 dark:text-brand-darkText leading-none transition-colors">Ad Slot Inventory</h2>
                <div className="bg-white dark:bg-brand-darkCard rounded-3xl border border-gray-100 dark:border-brand-darkBorder shadow-sm overflow-hidden transition-colors mt-8">
                    <div className="p-8 border-b border-gray-50 dark:border-brand-darkBorder flex justify-between items-center text-left">
                        <h3 className="text-sm font-black text-gray-900 dark:text-brand-darkText uppercase tracking-widest italic">Inventory Pricing & Placement</h3>
                        <button 
                            onClick={handleUpdateRates}
                            disabled={isUpdatingRates}
                            className="text-[10px] font-black text-brand-orange uppercase tracking-[0.2em] flex items-center space-x-2 disabled:opacity-50"
                        >
                            {isUpdatingRates ? (
                                <><div className="animate-spin rounded-full h-3 w-3 border-b-2 border-brand-orange"></div><span>Updating...</span></>
                            ) : (
                                <span>Update All Rates</span>
                            )}
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50/50 dark:bg-brand-darkBg/50 text-[10px] font-black text-gray-400 uppercase tracking-widest italic">
                                <tr>
                                    <th className="px-8 py-5">Slot ID</th>
                                    <th className="px-8 py-5">Placement Location</th>
                                    <th className="px-8 py-5">Rate (KCC/Day)</th>
                                    <th className="px-8 py-5">Current Status</th>
                                    <th className="px-8 py-5 text-right">Settings</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-brand-darkBorder">
                                {calculatedSlots.map((slot) => (
                                    <tr key={slot.id} className="hover:bg-gray-50/30 dark:hover:bg-brand-darkBg/30 transition-all">
                                        <td className="px-8 py-5 text-xs font-black text-gray-900 dark:text-brand-darkText">{slot.id}</td>
                                        <td className="px-8 py-5 text-xs font-bold text-gray-500 uppercase">{slot.pos}</td>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center space-x-2">
                                                <div className="w-20 bg-gray-50 dark:bg-brand-darkBg rounded-lg px-2 py-1.5 text-[10px] font-black text-brand-orange text-center">
                                                    {slot.rate}
                                                </div>
                                                <span className="text-[9px] font-bold text-gray-400">KCC</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${slot.status === 'Available' ? 'bg-emerald-50 text-emerald-500' : 'bg-orange-50 text-brand-orange'}`}>
                                                {slot.status}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <button 
                                                onClick={() => setSelectedSlotForUpdate(slot)} 
                                                className="text-gray-300 hover:text-brand-orange transition-colors"
                                            >
                                                <ExternalLink size={14} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            {/* Campaign Scheduler */}
            <section className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-brand-darkText leading-none transition-colors">Campaign Scheduler</h2>
                    
                    <div className="flex items-center space-x-2 bg-white dark:bg-brand-darkCard border border-gray-100 dark:border-brand-darkBorder rounded-xl p-1 shadow-sm">
                        <select 
                            value={calendarDate.getMonth()} 
                            onChange={handleMonthChange}
                            className="bg-transparent text-xs font-bold text-gray-700 dark:text-gray-300 outline-none px-2 py-1.5 cursor-pointer hover:text-brand-orange transition-colors"
                        >
                            {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map((m, i) => (
                                <option key={m} value={i} className="bg-white dark:bg-brand-darkCard">{m}</option>
                            ))}
                        </select>
                        <select 
                            value={calendarDate.getFullYear()} 
                            onChange={handleYearChange}
                            className="bg-transparent text-xs font-bold text-gray-700 dark:text-gray-300 outline-none px-2 py-1.5 cursor-pointer hover:text-brand-orange transition-colors border-l border-gray-100 dark:border-brand-darkBorder"
                        >
                            {Array.from({length: 10}, (_, i) => new Date().getFullYear() - 2 + i).map(y => (
                                <option key={y} value={y} className="bg-white dark:bg-brand-darkCard">{y}</option>
                            ))}
                        </select>
                    </div>
                </div>
                
                <div className="bg-white dark:bg-brand-darkCard rounded-3xl border border-gray-100 dark:border-brand-darkBorder shadow-sm p-6 sm:p-12 relative transition-colors">
                    <div className="absolute top-6 sm:top-12 left-6 sm:left-12 right-6 sm:right-12 flex justify-between items-center z-10">
                        <button onClick={handlePrevMonth} className="text-gray-400 dark:text-gray-600 hover:text-brand-orange dark:hover:text-brand-orange transition-colors"><ChevronLeft size={24} /></button>
                        <button onClick={handleNextMonth} className="text-gray-400 dark:text-gray-600 hover:text-brand-orange dark:hover:text-brand-orange transition-colors"><ChevronRight size={24} /></button>
                    </div>

                    <div className="flex flex-col md:flex-row gap-10 md:gap-20">
                        <Calendar 
                            month={calendarDate.getMonth()} 
                            year={calendarDate.getFullYear()} 
                            onDateClick={handleDateClick} 
                        />
                        <Calendar 
                            month={(calendarDate.getMonth() + 1) % 12} 
                            year={calendarDate.getFullYear() + Math.floor((calendarDate.getMonth() + 1) / 12)} 
                            onDateClick={handleDateClick} 
                        />
                    </div>
                </div>
            </section>

            {/* Approval Queue */}
            <section className="space-y-6">
                <h2 className="text-xl font-bold text-gray-800 dark:text-brand-darkText leading-none transition-colors">Approval Queue</h2>
                <div className="bg-white dark:bg-brand-darkCard rounded-3xl border border-gray-100 dark:border-brand-darkBorder shadow-sm overflow-hidden transition-colors">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-gray-50/30 dark:bg-brand-darkBg/50 border-b border-gray-100 dark:border-brand-darkBorder transition-colors">
                                    <th className="px-6 py-5 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Campaign ID</th>
                                    <th className="px-6 py-5 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Campaign Name</th>
                                    <th className="px-6 py-5 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Advertiser</th>
                                    <th className="px-6 py-5 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Budget Allocation</th>
                                    <th className="px-6 py-5 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest text-center">Status</th>
                                    <th className="px-6 py-5 text-xs font-bold text-brand-orange uppercase tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-brand-darkBorder">
                                {loading ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-10 text-center text-sm text-gray-500">Loading campaigns...</td>
                                    </tr>
                                ) : pendingCampaigns.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-10 text-center text-sm text-gray-500">No campaigns found.</td>
                                    </tr>
                                ) : pendingCampaigns.map((cp, idx) => (
                                    <tr key={cp.id} className="hover:bg-gray-50/50 dark:hover:bg-brand-darkBg transition-colors group">
                                        <td className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">{cp.id.substring(0,8)}</td>
                                        <td className="px-6 py-5 text-sm font-bold text-gray-800 dark:text-brand-darkText group-hover:text-brand-orange transition-colors">{cp.title}</td>
                                        <td className="px-6 py-5 text-xs font-bold text-gray-500 underline decoration-brand-orange/20 underline-offset-4">{users.find(u => u.id === cp.advertiser_id)?.name || 'Advertiser'}</td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center space-x-2">
                                                <span className="text-[10px] font-black text-brand-orange px-2 py-0.5 bg-brand-orange/10 rounded-lg">{cp.total_cost_kcc} KCC</span>
                                                <span className="text-[9px] font-bold text-gray-400 uppercase">Target: {cp.target_audience?.region || 'Global'} | {cp.target_audience?.familyType || 'All Families'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                                cp.status === 'scheduled' ? 'bg-emerald-50 text-emerald-500' :
                                                cp.status === 'rejected' ? 'bg-red-50 text-red-500' :
                                                'bg-yellow-50 text-yellow-500'
                                            }`}>
                                                {cp.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-right space-x-4">
                                            {cp.status === 'pending' && (
                                                <>
                                                    <button onClick={() => handleReview(cp.id, 'approve')} className="text-gray-400 hover:text-green-500 transition-colors"><Check size={20} /></button>
                                                    <button onClick={() => handleReview(cp.id, 'reject')} className="text-gray-400 hover:text-red-500 transition-colors"><X size={20} /></button>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            {/* New Campaign Modal */}
            {showNewCampaign && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setShowNewCampaign(false)} />
                    <div className="bg-white dark:bg-brand-darkCard w-full max-w-2xl overflow-hidden rounded-[2rem] shadow-2xl relative animate-in zoom-in-95 duration-200">
                        <div className="absolute top-0 left-0 w-full h-2 bg-brand-orange" />
                        <div className="p-10">
                            <div className="flex justify-between items-start mb-10">
                                <div>
                                    <h2 className="text-2xl font-black text-gray-900 dark:text-brand-darkText tracking-tight">Create Ad Campaign</h2>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Configure placement and targeting</p>
                                </div>
                                <button onClick={() => setShowNewCampaign(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-brand-darkBg rounded-xl transition-colors">
                                    <X size={24} className="text-gray-400" />
                                </button>
                            </div>

                            <form className="space-y-8" onSubmit={handleSubmit}>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Campaign Name</label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleFormChange}
                                            className="w-full px-5 py-3.5 bg-gray-50 dark:bg-brand-darkBg border border-gray-100 dark:border-brand-darkBorder rounded-2xl text-sm font-bold text-gray-900 dark:text-white outline-none focus:ring-4 focus:ring-brand-orange/10 transition-all"
                                            placeholder="Enter campaign name..."
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Advertiser (User)</label>
                                        <select
                                            name="advertiser_id"
                                            value={formData.advertiser_id}
                                            onChange={handleFormChange}
                                            className="w-full px-5 py-3.5 bg-gray-50 dark:bg-brand-darkBg border border-gray-100 dark:border-brand-darkBorder rounded-2xl text-sm font-bold text-gray-900 dark:text-white outline-none focus:ring-4 focus:ring-brand-orange/10 transition-all"
                                        >
                                            <option value="">Select Advertiser...</option>
                                            {users.map(u => (
                                                <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Placement Location</label>
                                        <select
                                            name="placement"
                                            value={formData.placement}
                                            onChange={handleFormChange}
                                            className="w-full px-5 py-3.5 bg-gray-50 dark:bg-brand-darkBg border border-gray-100 dark:border-brand-darkBorder rounded-2xl text-sm font-bold text-gray-900 dark:text-white outline-none focus:ring-4 focus:ring-brand-orange/10 transition-all"
                                        >
                                            <option value="banner">Global Header - Main</option>
                                            <option value="sidebar">Family Tree - Sidebar</option>
                                            <option value="feed">Member Registry - In-feed</option>
                                            <option value="events">Events Page - Top Banner</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2 flex items-center space-x-1">
                                            <Target size={12} className="text-brand-orange" />
                                            <span>Target Family Space</span>
                                        </label>
                                        <select
                                            name="familyType"
                                            value={formData.familyType}
                                            onChange={handleFormChange}
                                            className="w-full px-5 py-3.5 bg-gray-50 dark:bg-brand-darkBg border border-gray-100 dark:border-brand-darkBorder rounded-2xl text-sm font-bold text-gray-900 dark:text-white outline-none focus:ring-4 focus:ring-brand-orange/10 transition-all"
                                        >
                                            <option value="">Select Target Family...</option>
                                            {families.map(f => (
                                                <option key={f.id} value={f.name}>{f.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Target Region</label>
                                        <select
                                            name="region"
                                            value={formData.region}
                                            onChange={handleFormChange}
                                            className="w-full px-5 py-3.5 bg-gray-50 dark:bg-brand-darkBg border border-gray-100 dark:border-brand-darkBorder rounded-2xl text-sm font-bold text-gray-900 dark:text-white outline-none focus:ring-4 focus:ring-brand-orange/10 transition-all"
                                        >
                                            <option>Global</option>
                                            <option>North America</option>
                                            <option>Europe</option>
                                            <option>Asia Pacific</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Daily Rate (KCC/Day)</label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                name="daily_kcc_rate"
                                                value={formData.daily_kcc_rate}
                                                onChange={handleFormChange}
                                                className="w-full px-5 py-3.5 bg-gray-50 dark:bg-brand-darkBg border border-gray-100 dark:border-brand-darkBorder rounded-2xl text-sm font-bold text-gray-900 dark:text-white outline-none focus:ring-4 focus:ring-brand-orange/10 transition-all"
                                                placeholder="e.g. 50"
                                            />
                                            <div className="absolute right-5 top-1/2 -translate-y-1/2 text-xs font-black text-gray-400 uppercase tracking-widest">
                                                KCC
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Start Date</label>
                                        <input
                                            type="date"
                                            name="start_date"
                                            value={formData.start_date}
                                            onChange={handleFormChange}
                                            className="w-full px-5 py-3.5 bg-gray-50 dark:bg-brand-darkBg border border-gray-100 dark:border-brand-darkBorder rounded-2xl text-sm font-bold text-gray-900 dark:text-white outline-none focus:ring-4 focus:ring-brand-orange/10 transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">End Date</label>
                                        <input
                                            type="date"
                                            name="end_date"
                                            value={formData.end_date}
                                            onChange={handleFormChange}
                                            className="w-full px-5 py-3.5 bg-gray-50 dark:bg-brand-darkBg border border-gray-100 dark:border-brand-darkBorder rounded-2xl text-sm font-bold text-gray-900 dark:text-white outline-none focus:ring-4 focus:ring-brand-orange/10 transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="pt-6 flex space-x-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowNewCampaign(false)}
                                        className="flex-1 px-8 py-4 rounded-2xl font-black text-sm text-gray-500 uppercase tracking-widest hover:bg-gray-50 dark:hover:bg-brand-darkBg transition-all"
                                    >
                                        Draft Save
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-[2] bg-brand-orange text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-brand-orange/20 hover:scale-[1.02] active:scale-95 transition-all"
                                    >
                                        Submit for Approval
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Budget Tracker */}
            <section className="space-y-6">
                <h2 className="text-xl font-bold text-gray-800 dark:text-brand-darkText leading-none transition-colors">Budget Tracker</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                    <div className="bg-[#FFE8E2]/50 dark:bg-brand-orange/10 p-6 sm:p-8 rounded-3xl border border-[#FFE8E2] dark:border-brand-orange/20 transition-colors">
                        <p className="text-xs font-bold text-brand-orange uppercase">KCC Coin Spending</p>
                        <h4 className="text-3xl font-bold text-gray-800 dark:text-brand-darkText mt-2 transition-colors">{totalKCCSpent.toLocaleString()} KCC</h4>
                    </div>
                    <div className="bg-[#FFE8E2]/50 dark:bg-brand-orange/10 p-6 sm:p-8 rounded-3xl border border-[#FFE8E2] dark:border-brand-orange/20 transition-colors">
                        <p className="text-xs font-bold text-brand-orange uppercase">Credits Spending</p>
                        <h4 className="text-3xl font-bold text-gray-800 dark:text-brand-darkText mt-2 transition-colors">0 KCC</h4>
                    </div>
                </div>
            </section>

            {/* Targeting Governance */}
            <section className="space-y-8">
                <h2 className="text-xl font-bold text-gray-800 dark:text-brand-darkText leading-none transition-colors">Targeting Governance</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-8 sm:gap-y-12 gap-x-12 border-t border-gray-100 dark:border-brand-darkBorder pt-8 transition-colors">
                    <div>
                        <p className="text-xs font-bold text-brand-orange uppercase mb-4">Region</p>
                        <p className="text-sm font-semibold text-[#B28E86] dark:text-orange-900/60 transition-colors">{regions.length > 0 ? regions.join(', ') : 'None'}</p>
                    </div>
                    <div>
                        <p className="text-xs font-bold text-brand-orange uppercase mb-4">Language</p>
                        <p className="text-sm font-semibold text-[#B28E86] dark:text-orange-900/60 transition-colors">English, Spanish</p>
                    </div>
                    <div className="border-l border-gray-100 dark:border-brand-darkBorder pl-12 h-full hidden lg:block transition-colors"></div>
                    <div className="border-t border-gray-100 dark:border-brand-darkBorder md:border-t-0 lg:border-t lg:pt-8 md:pt-0 transition-colors">
                        <p className="text-xs font-bold text-brand-orange uppercase mb-4">Family Type</p>
                        <div className="space-y-1">
                            {familyTypes.length > 0 ? familyTypes.map(ft => (
                                <p key={ft} className="text-sm font-semibold text-[#B28E86] dark:text-orange-900/60 transition-colors">{ft}</p>
                            )) : <p className="text-sm font-semibold text-[#B28E86] dark:text-orange-900/60 transition-colors">None</p>}
                        </div>
                    </div>
                </div>
            </section>

            {/* Feedback Modal */}
            {statusModal.show && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-brand-darkCard rounded-[2.5rem] p-8 max-w-sm w-full shadow-2xl border border-gray-100 dark:border-brand-darkBorder animate-in zoom-in duration-300">
                        <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 ${
                            statusModal.type === 'success' 
                                ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500' 
                                : 'bg-rose-50 dark:bg-rose-500/10 text-rose-500'
                        }`}>
                            {statusModal.type === 'success' ? (
                                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                            ) : (
                                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            )}
                        </div>
                        <h3 className="text-xl font-black text-gray-900 dark:text-brand-darkText text-center mb-2 uppercase tracking-tight">
                            {statusModal.title}
                        </h3>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 text-center mb-8 leading-relaxed px-4">
                            {statusModal.message}
                        </p>
                        <button
                            onClick={() => setStatusModal({ ...statusModal, show: false })}
                            className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-lg active:scale-95 ${
                                statusModal.type === 'success'
                                    ? 'bg-brand-orange text-white shadow-brand-orange/25 hover:bg-orange-600'
                                    : 'bg-gray-900 dark:bg-brand-darkBorder text-white hover:bg-black'
                            }`}
                        >
                            Continue
                        </button>
                    </div>
                </div>
            )}
            {/* Single Slot Update Modal */}
            {selectedSlotForUpdate && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setSelectedSlotForUpdate(null)} />
                    <div className="bg-white dark:bg-brand-darkCard w-full max-w-md overflow-hidden rounded-[2rem] shadow-2xl relative animate-in zoom-in-95 duration-200">
                        <div className="absolute top-0 left-0 w-full h-2 bg-brand-orange" />
                        <div className="p-8">
                            <div className="flex justify-between items-start mb-8">
                                <div>
                                    <h2 className="text-xl font-black text-gray-900 dark:text-brand-darkText tracking-tight">Update Slot Pricing</h2>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">{selectedSlotForUpdate.pos}</p>
                                </div>
                                <button onClick={() => setSelectedSlotForUpdate(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-brand-darkBg rounded-xl transition-colors">
                                    <X size={20} className="text-gray-400" />
                                </button>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Daily Rate (KCC)</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={selectedSlotForUpdate.rate}
                                            onChange={(e) => setSelectedSlotForUpdate({ ...selectedSlotForUpdate, rate: Number(e.target.value) })}
                                            className="w-full px-5 py-4 bg-gray-50 dark:bg-brand-darkBg border border-gray-100 dark:border-brand-darkBorder rounded-2xl text-lg font-black text-gray-900 dark:text-white outline-none focus:ring-4 focus:ring-brand-orange/10 transition-all"
                                        />
                                        <div className="absolute right-5 top-1/2 -translate-y-1/2 text-xs font-black text-gray-400 uppercase tracking-widest">
                                            KCC
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => {
                                        setUpdatingSingleRate(true);
                                        setTimeout(() => {
                                            setSlotRates(prev => ({ ...prev, [selectedSlotForUpdate.id]: selectedSlotForUpdate.rate }));
                                            setUpdatingSingleRate(false);
                                            setSelectedSlotForUpdate(null);
                                            setStatusModal({
                                                show: true,
                                                type: 'success',
                                                title: 'Rate Updated',
                                                message: `${selectedSlotForUpdate.pos} rate updated successfully.`
                                            });
                                        }, 1000);
                                    }}
                                    disabled={updatingSingleRate}
                                    className="w-full bg-brand-orange text-white py-4 rounded-xl font-bold text-sm shadow-lg shadow-brand-orange/20 hover:bg-orange-600 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                                >
                                    {updatingSingleRate ? (
                                        <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div><span>Saving Changes...</span></>
                                    ) : (
                                        <span>Save New Rate</span>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Ads;