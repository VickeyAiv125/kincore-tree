import React, { useState, useEffect } from 'react';
import { AlertTriangle, Clock, CheckCircle2, MessageSquare, Plus, Filter, Search, ShieldAlert, Loader2, ChevronDown, Check } from 'lucide-react';

const SeverityBadge = ({ severity }) => {
    const colors = {
        critical: 'bg-red-600 text-white shadow-lg shadow-red-600/20',
        high: 'bg-red-500 text-white shadow-lg shadow-red-500/20',
        medium: 'bg-orange-500 text-white shadow-lg shadow-orange-500/20',
        low: 'bg-yellow-500 text-white shadow-lg shadow-yellow-500/20',
        P1: 'bg-red-500 text-white shadow-lg shadow-red-500/20',
        P2: 'bg-orange-500 text-white shadow-lg shadow-orange-500/20',
        P3: 'bg-yellow-500 text-white shadow-lg shadow-yellow-500/20',
    };
    const label = severity === 'critical' ? 'P1' : (severity === 'high' ? 'P2' : (severity === 'medium' ? 'P3' : (severity === 'low' ? 'P4' : severity)));
    return (
        <span className={`${colors[severity] || 'bg-gray-500 text-white'} px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest`}>
            {label}
        </span>
    );
};

const StatusBadge = ({ status }) => {
    const colors = {
        open: 'bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400',
        investigating: 'bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400',
        identified: 'bg-orange-50 dark:bg-orange-950/20 text-orange-600 dark:text-orange-400',
        monitoring: 'bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400',
        resolved: 'bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400',
        Investigating: 'bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400',
        Resolved: 'bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400',
    };
    return (
        <span className={`${colors[status] || 'bg-gray-50 text-gray-500'} px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest`}>
            {status}
        </span>
    );
};

const IncidentManagement = () => {
    const [incidents, setIncidents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [auditComms, setAuditComms] = useState([]);

    // Active Comms MVP State
    const [commsOwner, setCommsOwner] = useState('DevOps');
    const [commsBackup, setCommsBackup] = useState('DevOps');
    const [commsNextUpdate, setCommsNextUpdate] = useState('30');
    const [commsBanner, setCommsBanner] = useState(false);
    const [checkedSteps, setCheckedSteps] = useState({});
    const [commsNote, setCommsNote] = useState('');
    const [isPublishingNote, setIsPublishingNote] = useState(false);
    const [isPublishingBanner, setIsPublishingBanner] = useState(false);
    const [isBannerSent, setIsBannerSent] = useState(false);
    const [isAssigning, setIsAssigning] = useState(false);

    const handleAssignOwnership = async () => {
        setIsAssigning(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}`}/admin/devops/incidents/assign-owner`, {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    primaryRole: commsOwner,
                    backupRole: commsBackup
                })
            });
            if (res.ok) {

                // Add to comms feed
                setAuditComms(prev => [{
                    action: 'OWNER_ASSIGNED',
                    details: { message: `Assigned Primary: ${commsOwner}, Backup: ${commsBackup}` },
                    created_at: new Date().toISOString(),
                    users: { email: 'System' }
                }, ...prev].slice(0, 5));
            }
        } catch (err) {
            console.error('Failed to assign ownership:', err);
        } finally {
            setIsAssigning(false);
        }
    };

    const handlePublishBanner = async () => {
        setIsPublishingBanner(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}`}/admin/devops/incidents/publish-banner`, {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    nextUpdateMins: commsNextUpdate,
                    isPublished: true
                })
            });
            if (res.ok) {
                setIsBannerSent(true);
                setTimeout(() => setIsBannerSent(false), 3000);
            }
        } catch (err) {
            console.error('Failed to publish banner:', err);
        } finally {
            setIsPublishingBanner(false);
        }
    };

    const handlePublishNote = async () => {
        if (!commsNote) return;
        setIsPublishingNote(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}`}/admin/devops/incidents/note`, {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ note: commsNote })
            });
            if (res.ok) {
                // Instantly show it in the UI and clear the input
                setAuditComms(prev => [{
                    action: 'INCIDENT_NOTE',
                    details: commsNote,
                    created_at: new Date().toISOString(),
                    users: { email: commsOwner }
                }, ...prev].slice(0, 5));
                setCommsNote('');
            }
        } catch (err) {
            console.error('Failed to publish note:', err);
        } finally {
            setIsPublishingNote(false);
        }
    };

    // Search and Filter State
    const [showSearch, setShowSearch] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showFilter, setShowFilter] = useState(false);
    const [filterSeverity, setFilterSeverity] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [openDropdownId, setOpenDropdownId] = useState(null);

    const fetchIncidents = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}`}/admin/devops/incidents`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) setIncidents(data || []);

            const auditRes = await fetch(`${import.meta.env.VITE_API_BASE_URL || `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}`}/admin/audit-logs`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const auditData = await auditRes.json();
            if (auditRes.ok) {
                const allowedActions = ['INCIDENT_UPDATED', 'INCIDENT_CREATED', 'OWNER_ASSIGNED', 'INCIDENT_NOTE', 'APP_BANNER_PUBLISHED'];
                const comms = auditData.filter(a => allowedActions.includes(a.action)).slice(0, 5);
                setAuditComms(comms);
            }

            const ownerRes = await fetch(`${import.meta.env.VITE_API_BASE_URL || `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}`}/admin/devops/incidents/owner-config`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (ownerRes.ok) {
                const ownerData = await ownerRes.json();
                setCommsOwner(ownerData.primary_owner);
                setCommsBackup(ownerData.backup_owner);
            }
        } catch (err) {
            console.error('Failed to fetch incident data:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchIncidents();
        const interval = setInterval(fetchIncidents, 30000);
        return () => clearInterval(interval);
    }, []);

    const [selectedIncident, setSelectedIncident] = useState(null);
    const [isDeclaring, setIsDeclaring] = useState(false);
    const [isSOPOpen, setIsSOPOpen] = useState(false);
    const [declareData, setDeclareData] = useState({ title: '', severity: 'high', affected: 'all', status: 'open' });

    const handleDeclare = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}`}/admin/devops/incidents`, {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    title: declareData.title,
                    severity: declareData.severity,
                    affected: [declareData.affected],
                    status: declareData.status
                })
            });
            if (res.ok) {
                fetchIncidents();
                setIsDeclaring(false);
                setDeclareData({ title: '', severity: 'high', affected: 'all', status: 'open' });
            }
        } catch (err) {
            console.error('Failed to declare incident:', err);
        }
    };

    const handleStatusChange = async (id, newStatus) => {
        try {
            const token = localStorage.getItem('token');
            let res;
            if (newStatus === 'resolved') {
                res = await fetch(`${import.meta.env.VITE_API_BASE_URL || `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}`}/admin/devops/incidents/${id}/resolve`, {
                    method: 'PATCH',
                    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify({ resolution: 'Resolved from feed' })
                });
            } else {
                res = await fetch(`${import.meta.env.VITE_API_BASE_URL || `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}`}/admin/devops/incidents/${id}`, {
                    method: 'PATCH',
                    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status: newStatus })
                });
            }
            if (res.ok) {
                fetchIncidents();
            }
        } catch (err) {
            console.error('Failed to update status:', err);
        }
    };

    const handleResolve = async (id, resolution) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}`}/admin/devops/incidents/${id}/resolve`, {
                method: 'PATCH',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ resolution })
            });
            if (res.ok) {
                fetchIncidents();
                setSelectedIncident(null);
            }
        } catch (err) {
            console.error('Failed to resolve incident:', err);
        }
    };

    const filteredIncidents = incidents.filter(inc => {
        const matchesSearch = inc.title?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesSeverity = filterSeverity === 'all' || inc.severity === filterSeverity;
        const matchesStatus = filterStatus === 'all' || inc.status === filterStatus;
        return matchesSearch && matchesSeverity && matchesStatus;
    });

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 text-left">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center space-x-2 mb-1">
                        <h2 className="text-gray-900 dark:text-brand-darkText text-sm font-bold opacity-30 dark:opacity-40 uppercase tracking-widest leading-none">Emergency</h2>
                        <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700" />
                        <h2 className="text-gray-900 dark:text-brand-darkText text-sm font-bold opacity-30 dark:opacity-40 uppercase tracking-widest leading-none">Response</h2>
                    </div>
                    <h1 className="text-3xl font-extrabold text-gray-900 dark:text-brand-darkText tracking-tight italic">Incident Management</h1>
                </div>
                <button
                    onClick={() => setIsDeclaring(true)}
                    className="flex items-center space-x-2 bg-red-500 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-red-500/25 hover:bg-red-600 transition-all active:scale-95"
                >
                    <Plus size={18} />
                    <span>Declare Incident</span>
                </button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Active Incidents List */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-brand-darkCard rounded-[2.5rem] border border-gray-100 dark:border-brand-darkBorder shadow-sm overflow-hidden">
                        <div className="p-8 border-b border-gray-50 dark:border-brand-darkBorder flex items-center justify-between">
                            <h3 className="text-lg font-black text-gray-900 dark:text-brand-darkText tracking-tight uppercase">Incident Feed</h3>
                            <div className="flex items-center space-x-2">
                                <button onClick={() => setShowFilter(!showFilter)} className={`p-2 transition-colors ${showFilter ? 'text-brand-orange' : 'text-gray-400 hover:text-brand-orange'}`}><Filter size={20} /></button>
                                <button onClick={() => setShowSearch(!showSearch)} className={`p-2 transition-colors ${showSearch ? 'text-brand-orange' : 'text-gray-400 hover:text-brand-orange'}`}><Search size={20} /></button>
                            </div>
                        </div>
                        
                        {/* Filter & Search Panel */}
                        {(showSearch || showFilter) && (
                            <div className="px-8 py-4 bg-gray-50 dark:bg-brand-darkBg flex flex-col sm:flex-row gap-4 items-center animate-in fade-in slide-in-from-top-2 duration-300">
                                {showSearch && (
                                    <input 
                                        type="text"
                                        placeholder="Search incident title..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="flex-1 w-full px-4 py-2.5 bg-white dark:bg-brand-darkCard rounded-xl border border-gray-100 dark:border-brand-darkBorder text-sm font-bold text-gray-900 dark:text-brand-darkText outline-none focus:border-brand-orange transition-colors"
                                    />
                                )}
                                {showFilter && (
                                    <div className="flex gap-4 w-full sm:w-auto">
                                        <select 
                                            value={filterSeverity} 
                                            onChange={(e) => setFilterSeverity(e.target.value)}
                                            className="px-4 py-2.5 bg-white dark:bg-brand-darkCard rounded-xl border border-gray-100 dark:border-brand-darkBorder text-xs font-black uppercase tracking-widest text-gray-600 dark:text-gray-300 outline-none focus:border-brand-orange transition-colors"
                                        >
                                            <option value="all">All Severities</option>
                                            <option value="critical">Critical (P1)</option>
                                            <option value="high">High (P2)</option>
                                            <option value="medium">Medium (P3)</option>
                                        </select>
                                        <select 
                                            value={filterStatus} 
                                            onChange={(e) => setFilterStatus(e.target.value)}
                                            className="px-4 py-2.5 bg-white dark:bg-brand-darkCard rounded-xl border border-gray-100 dark:border-brand-darkBorder text-xs font-black uppercase tracking-widest text-gray-600 dark:text-gray-300 outline-none focus:border-brand-orange transition-colors"
                                        >
                                            <option value="all">All Statuses</option>
                                            <option value="open">Open</option>
                                            <option value="resolved">Resolved</option>
                                        </select>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="divide-y divide-gray-50 dark:divide-brand-darkBorder">
                            {loading && incidents.length === 0 ? (
                                <div className="p-20 flex flex-col items-center justify-center space-y-4">
                                    <Loader2 className="w-10 h-10 text-red-500 animate-spin" />
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Scanning Network Segments...</p>
                                </div>
                            ) : filteredIncidents.length > 0 ? (
                                filteredIncidents.map((inc) => (
                                    <div
                                        key={inc.id}
                                        onClick={() => setSelectedIncident(inc)}
                                        className="p-8 hover:bg-gray-50/50 dark:hover:bg-brand-darkBg/50 transition-colors cursor-pointer group"
                                    >
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                                            <div className="flex items-center space-x-3">
                                                <SeverityBadge severity={inc.severity} />
                                                <h4 className="text-lg font-bold text-gray-900 dark:text-brand-darkText group-hover:text-red-500 transition-colors">{inc.title}</h4>
                                            </div>
                                            <div className="relative" onClick={(e) => e.stopPropagation()}>
                                                <button
                                                    onClick={() => setOpenDropdownId(openDropdownId === inc.id ? null : inc.id)}
                                                    className={`${
                                                        (inc.status === 'open' || inc.status === 'investigating')
                                                            ? 'bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400' 
                                                            : 'bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400'
                                                    } px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer hover:opacity-80 transition-opacity flex items-center space-x-2`}
                                                >
                                                    <span>{inc.status === 'investigating' ? 'OPEN' : inc.status}</span>
                                                    <ChevronDown size={12} className={`transition-transform duration-200 ${openDropdownId === inc.id ? 'rotate-180' : ''}`} />
                                                </button>
                                                
                                                {openDropdownId === inc.id && (
                                                    <>
                                                        <div className="fixed inset-0 z-40" onClick={() => setOpenDropdownId(null)} />
                                                        <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-brand-darkCard border border-gray-100 dark:border-brand-darkBorder rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                                            <button
                                                                onClick={() => {
                                                                    handleStatusChange(inc.id, 'open');
                                                                    setOpenDropdownId(null);
                                                                }}
                                                                className="w-full text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors border-b border-gray-50 dark:border-brand-darkBorder"
                                                            >
                                                                Open
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    handleStatusChange(inc.id, 'resolved');
                                                                    setOpenDropdownId(null);
                                                                }}
                                                                className="w-full text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-950/20 transition-colors"
                                                            >
                                                                Resolved
                                                            </button>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-6">
                                            <div className="flex items-center space-x-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                                <Clock size={14} />
                                                <span>Started {new Date(inc.created_at).toLocaleString()}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {(inc.affected_services || []).map(service => (
                                                    <span key={service} className="px-2 py-1 bg-gray-100 dark:bg-brand-darkBg text-gray-500 dark:text-gray-400 text-[10px] font-bold rounded-lg uppercase">{service}</span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-20 text-center flex flex-col items-center">
                                    <div className="w-16 h-16 bg-green-50 dark:bg-green-950/20 rounded-full flex items-center justify-center text-green-500 mb-4">
                                        <CheckCircle2 size={32} />
                                    </div>
                                    <p className="text-sm font-black text-gray-900 dark:text-brand-darkText uppercase tracking-widest">All Systems Operational</p>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase mt-2 tracking-tighter italic">No incidents recorded in the last 24 hours.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Response Tools & Notes */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-brand-darkCard p-8 rounded-[2.5rem] border border-gray-100 dark:border-brand-darkBorder shadow-sm">
                        <div className="flex items-center space-x-3 mb-6">
                            <MessageSquare size={24} className="text-brand-orange" />
                            <h3 className="text-lg font-black text-gray-900 dark:text-brand-darkText uppercase tracking-tight">Active Comms</h3>
                        </div>
                        <div className="space-y-6">
                            {auditComms.length > 0 ? (
                                auditComms.map((audit, idx) => (
                                    <div key={idx} className="p-4 bg-gray-50 dark:bg-brand-darkBg rounded-2xl space-y-2 border-l-4 border-red-500">
                                        <p className="text-[10px] font-black text-red-500 uppercase tracking-widest">{audit.action.replace(/_/g, ' ')}</p>
                                        <p className="text-xs font-bold text-gray-600 dark:text-gray-400 leading-relaxed italic">
                                            {audit.details?.message || (typeof audit.details === 'string' ? audit.details : JSON.stringify(audit.details))}
                                        </p>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase">{new Date(audit.created_at).toLocaleTimeString()} - {audit.users?.email || 'System'}</p>
                                    </div>
                                ))
                            ) : (
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic text-center py-4">No recent emergency updates.</p>
                            )}
                            <div className="space-y-4 pt-4 border-t border-gray-50 dark:border-brand-darkBorder">
                                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Incident Owner</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest pl-1">Primary Owner</label>
                                        <select value={commsOwner} onChange={(e) => setCommsOwner(e.target.value)} className="w-full px-4 py-3 bg-gray-50 dark:bg-brand-darkBg border border-gray-100 dark:border-brand-darkBorder rounded-xl text-xs font-bold text-gray-900 dark:text-brand-darkText outline-none focus:border-brand-orange">
                                            <option value="DevOps">DevOps</option>
                                            <option value="Auditor">Auditor</option>
                                            <option value="Business Admin">Business Admin</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest pl-1">Backup Owner</label>
                                        <select value={commsBackup} onChange={(e) => setCommsBackup(e.target.value)} className="w-full px-4 py-3 bg-gray-50 dark:bg-brand-darkBg border border-gray-100 dark:border-brand-darkBorder rounded-xl text-xs font-bold text-gray-900 dark:text-brand-darkText outline-none focus:border-brand-orange">
                                            <option value="DevOps">DevOps</option>
                                            <option value="Auditor">Auditor</option>
                                            <option value="Business Admin">Business Admin</option>
                                        </select>
                                    </div>
                                </div>
                                <button 
                                    onClick={handleAssignOwnership}
                                    disabled={isAssigning}
                                    className="w-full mt-2 py-3 bg-gray-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest disabled:opacity-50 hover:bg-brand-orange transition-all flex justify-center items-center"
                                >
                                    {isAssigning ? <Loader2 size={14} className="animate-spin" /> : 'Update Ownership'}
                                </button>
                            </div>
                            <div className="space-y-4 pt-4 border-t border-gray-50 dark:border-brand-darkBorder">
                                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Status & Announcements</h4>
                                <div className="grid grid-cols-2 gap-4 items-end">
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest pl-1">Next Update In (Mins)</label>
                                        <input type="number" value={commsNextUpdate} onChange={(e) => setCommsNextUpdate(e.target.value)} className="w-full px-4 py-3 bg-gray-50 dark:bg-brand-darkBg border border-gray-100 dark:border-brand-darkBorder rounded-xl text-xs font-bold text-gray-900 dark:text-brand-darkText outline-none focus:border-brand-orange" />
                                    </div>
                                    <button 
                                        onClick={handlePublishBanner}
                                        disabled={isPublishingBanner || isBannerSent}
                                        className={`w-full py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center ${isBannerSent ? 'bg-green-50 dark:bg-green-950/20 text-green-500 border border-green-500' : 'bg-gray-900 text-white hover:bg-brand-orange'} disabled:opacity-50`}
                                    >
                                        {isPublishingBanner ? <Loader2 size={14} className="animate-spin" /> : (isBannerSent ? 'Alert Sent to Admin!' : 'Publish App Banner')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-brand-darkCard p-8 rounded-[2.5rem] border border-gray-100 dark:border-brand-darkBorder shadow-sm text-left">
                        <div className="flex items-center space-x-3 mb-6">
                            <ShieldAlert size={20} className="text-brand-orange" />
                            <h4 className="text-lg font-black text-gray-900 dark:text-brand-darkText uppercase tracking-tight">Internal Notes</h4>
                        </div>
                        <div className="space-y-4">
                            <textarea 
                                value={commsNote}
                                onChange={(e) => setCommsNote(e.target.value)}
                                placeholder="Add private notes or response commands..."
                                className="w-full h-24 px-4 py-3 bg-gray-50 dark:bg-brand-darkBg border border-gray-100 dark:border-brand-darkBorder rounded-2xl text-xs font-bold text-gray-900 dark:text-brand-darkText outline-none focus:border-brand-orange resize-none"
                            />
                            <button 
                                disabled={!commsNote || isPublishingNote}
                                onClick={handlePublishNote}
                                className="w-full py-4 bg-gray-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest disabled:opacity-50 hover:bg-brand-orange transition-all flex justify-center items-center"
                            >
                                {isPublishingNote ? <Loader2 size={16} className="animate-spin" /> : 'Append to Active Comms'}
                            </button>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-brand-darkCard p-10 rounded-[3rem] border border-gray-100 dark:border-brand-darkBorder shadow-sm text-left">
                        <div className="flex items-center space-x-3 mb-6">
                            <ShieldAlert size={28} className="text-brand-orange" />
                            <h4 className="text-xl font-black text-gray-900 dark:text-brand-darkText uppercase tracking-tight">Emergency Protocols</h4>
                        </div>
                        <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase leading-relaxed mb-8">
                            Follow severity-base checklists for P1/P2 incidents. Automate status updates every 15 minutes.
                        </p>
                        <button onClick={() => setIsSOPOpen(true)} className="w-full py-5 bg-brand-orange text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-brand-orange/25 hover:opacity-90 transition-all active:scale-95">
                            View Standard Procedures
                        </button>
                    </div>
                </div>
            </div>

            {/* Declaration Modal */}
            {isDeclaring && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-brand-darkCard w-full max-w-lg rounded-[3rem] border border-gray-100 dark:border-brand-darkBorder shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-10 border-b border-gray-50 dark:border-brand-darkBorder">
                            <h3 className="text-xl font-black text-gray-900 dark:text-brand-darkText uppercase tracking-tight italic">Declare Emergency</h3>
                            <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mt-1">This will alert the on-call team and update status page</p>
                        </div>
                        <div className="p-10 space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Incident Title</label>
                                <input
                                    type="text"
                                    value={declareData.title}
                                    onChange={(e) => setDeclareData({...declareData, title: e.target.value})}
                                    placeholder="e.g. Gateway Timeout Error"
                                    className="w-full px-6 py-4 bg-gray-50 dark:bg-brand-darkBg border-none rounded-2xl text-sm font-bold text-gray-900 dark:text-brand-darkText outline-none focus:ring-4 focus:ring-red-500/10"
                                />
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Severity</label>
                                    <select 
                                        value={declareData.severity}
                                        onChange={(e) => setDeclareData({...declareData, severity: e.target.value})}
                                        className="w-full px-6 py-4 bg-gray-50 dark:bg-brand-darkBg border-none rounded-2xl text-sm font-bold text-gray-900 dark:text-brand-darkText outline-none"
                                    >
                                        <option value="critical">P1 (Critical Outage)</option>
                                        <option value="high">P2 (Major Degraded)</option>
                                        <option value="medium">P3 (Minor Issue)</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Status</label>
                                    <select 
                                        value={declareData.status}
                                        onChange={(e) => setDeclareData({...declareData, status: e.target.value})}
                                        className="w-full px-6 py-4 bg-gray-50 dark:bg-brand-darkBg border-none rounded-2xl text-sm font-bold text-gray-900 dark:text-brand-darkText outline-none"
                                    >
                                        <option value="open">Open</option>
                                        <option value="resolved">Resolved</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Affected</label>
                                    <select 
                                        value={declareData.affected}
                                        onChange={(e) => setDeclareData({...declareData, affected: e.target.value})}
                                        className="w-full px-6 py-4 bg-gray-50 dark:bg-brand-darkBg border-none rounded-2xl text-sm font-bold text-gray-900 dark:text-brand-darkText outline-none"
                                    >
                                        <option value="all">All Systems</option>
                                        <option value="database">Database (PostgreSQL)</option>
                                        <option value="api">Backend API</option>
                                        <option value="storage">Storage/CDN</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex space-x-4 pt-4">
                                <button onClick={handleDeclare} className="flex-1 py-5 bg-red-500 text-white rounded-2xl font-black text-[12px] uppercase tracking-widest shadow-xl shadow-red-500/25">Initialize Protocol</button>
                                <button onClick={() => setIsDeclaring(false)} className="flex-1 py-5 bg-gray-50 dark:bg-brand-darkBg text-gray-400 rounded-2xl font-black text-[12px] uppercase tracking-widest hover:text-brand-orange transition-all">Cancel</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Dynamic SOP Modal */}
            {isSOPOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-brand-darkCard w-full max-w-xl rounded-[3rem] border border-gray-100 dark:border-brand-darkBorder shadow-2xl overflow-hidden transition-colors text-left">
                        <div className="p-10 border-b border-gray-50 dark:border-brand-darkBorder flex justify-between items-center text-left">
                            <div>
                                <h3 className="text-xl font-black text-gray-900 dark:text-brand-darkText uppercase tracking-tight italic">Standard Procedures</h3>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Incident Response Protocols V4.2</p>
                            </div>
                            <button onClick={() => setIsSOPOpen(false)} className="p-3 bg-gray-50 dark:bg-brand-darkBg text-gray-400 rounded-2xl hover:text-brand-orange transition-colors">
                                <Plus size={20} className="rotate-45" />
                            </button>
                        </div>
                        <div className="p-10 space-y-6 text-left max-h-[60vh] overflow-y-auto no-scrollbar">
                            {(() => {
                                const protocols = [];
                                const services = selectedIncident?.affected_services || [];
                                const severity = selectedIncident?.severity || 'P3';

                                if (services.includes('api')) {
                                    protocols.push({ title: 'API Gateway Check', steps: ['Check rate limit thresholds', 'Review Nginx/Gateway access logs', 'Verify internal network routing'] });
                                }
                                if (services.includes('database')) {
                                    protocols.push({ title: 'Database Check', steps: ['Review active connection limits', 'Check long-running queries', 'Scale read replicas if needed'] });
                                }
                                if (services.includes('storage')) {
                                    protocols.push({ title: 'Storage & CDN Check', steps: ['Verify S3/bucket permissions', 'Clear CDN edge cache', 'Check bandwidth throttling'] });
                                }
                                if (services.includes('auth')) {
                                    protocols.push({ title: 'Auth Service Check', steps: ['Verify JWT Key integrity', 'Check Redis Session Cache status', 'Review login failure rates in logs'] });
                                }

                                // Fallback to severity if no specific service protocols matched
                                if (protocols.length === 0) {
                                    if (severity === 'critical') {
                                        protocols.push({ title: 'P1: Critical Outage', steps: ['Notify C-Level via PagerDuty', 'Initialize War Room (Zoom)', 'Set Status Page to "Down"'] });
                                    } else if (severity === 'high') {
                                        protocols.push({ title: 'P2: High Latency', steps: ['Scale DB Resources (Auto)', 'Check Cache Shards', 'Update Ops Channel'] });
                                    } else {
                                        protocols.push({ title: 'P3: Single Service Error', steps: ['Review Sentry Logs', 'Check App Rollout Status', 'Deploy Patch if needed'] });
                                    }
                                }

                                return protocols.map((sop, i) => (
                                    <div key={i} className="p-6 bg-gray-50 dark:bg-brand-darkBg rounded-3xl space-y-4 border border-gray-100 dark:border-brand-darkBorder text-left">
                                        <h4 className="text-sm font-black text-gray-900 dark:text-orange-500 uppercase tracking-widest">{sop.title}</h4>
                                        <ul className="space-y-3">
                                            {sop.steps.map((step, idx) => {
                                                const stepKey = `${i}-${idx}`;
                                                const isChecked = checkedSteps[stepKey];
                                                return (
                                                    <li 
                                                        key={idx} 
                                                        className={`flex items-start space-x-3 text-xs font-bold group cursor-pointer transition-colors ${isChecked ? 'text-gray-400 dark:text-gray-600 line-through' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
                                                        onClick={() => setCheckedSteps(prev => ({...prev, [stepKey]: !prev[stepKey]}))}
                                                    >
                                                        <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${isChecked ? 'bg-brand-orange border-brand-orange text-white' : 'border-gray-300 dark:border-gray-600 group-hover:border-brand-orange text-transparent'}`}>
                                                            <Check size={10} strokeWidth={4} />
                                                        </div>
                                                        <span>{step}</span>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    </div>
                                ));
                            })()}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default IncidentManagement;
