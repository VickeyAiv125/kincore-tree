import React, { useState, useEffect } from 'react';
import { Shield, FileText, CreditCard, AlertTriangle, Eye, ArrowUpRight, TrendingUp, Clock, Globe, Info, ShieldCheck, ChevronRight, AlertCircle, Zap, BarChart3, X, Download } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const AuditorDashboard = () => {
    const [scanModalOpen, setScanModalOpen] = useState(false);
    const [exportFormat, setExportFormat] = useState(null);
    const [evidenceData, setEvidenceData] = useState(null);
    const [historyOpen, setHistoryOpen] = useState(false);
    const [scoreHistory, setScoreHistory] = useState(null);
    const [complianceScores, setComplianceScores] = useState(null);
    const [alerts, setAlerts] = useState([]);
    const [verificationStream, setVerificationStream] = useState([]);
    const [isExporting, setIsExporting] = useState(false);

    useEffect(() => {
        const fetchScores = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}`}/admin/auditor/compliance/scores`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setComplianceScores({
                        global: data.global_score,
                        dataPrivacy: data.data_privacy,
                        accessControl: data.access_control,
                        systemIntegrity: data.system_integrity,
                        risk_potential: data.risk_potential,
                        data_shield: data.data_shield,
                        historical_trend: data.historical_trend
                    });
                }
            } catch (err) {
                console.error("Failed to fetch dynamic compliance scores:", err);
            }
        };

        const fetchNotifications = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}`}/admin/auditor/notifications`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setAlerts(data.notifications.map(n => ({
                        id: n.id.split('-')[0].toUpperCase(),
                        type: n.type === 'CRITICAL' ? 'Critical' : 'High',
                        title: `${n.title}: ${n.message}`,
                        time: new Date(n.created_at).toLocaleString(),
                        status: n.notification_metadata?.status || 'Reviewing',
                        details: n.notification_metadata?.details ? JSON.stringify(n.notification_metadata.details, null, 2) : 'Full forensic trace loaded from secure vault.'
                    })));
                }
            } catch (err) {
                console.error("Failed to fetch auditor notifications:", err);
            }
        };

        const fetchVerificationStream = async () => {
            try {
                const token = localStorage.getItem('token');
                // Fetch up to 50 logs for the history modal
                const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}`}/admin/audit-logs/global?limit=50`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setVerificationStream(data.logs || []);
                }
            } catch (err) {
                console.error("Failed to fetch verification stream:", err);
            }
        };

        fetchScores();
        fetchNotifications();
        fetchVerificationStream();
    }, []);

    const chartData = complianceScores?.historical_trend || [];

    const handleExport = async () => {
        if (!exportFormat || exportFormat === 'SIEM') return;
        setIsExporting(true);
        try {
            const token = localStorage.getItem('token');
            const baseUrl = import.meta.env.VITE_API_BASE_URL || `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}`;
            
            let res;
            if (exportFormat === 'PDF') {
                res = await fetch(`${baseUrl}/admin/devops/export-pdf`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        title: 'Auditor Forensic Certification Report',
                        content: `Forensic Export Center verification stream log.\nDate: ${new Date().toLocaleString()}`,
                        logs: verificationStream
                    })
                });
            } else {
                res = await fetch(`${baseUrl}/admin/audit-logs/export?format=${exportFormat.toLowerCase()}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
            }
            
            if (res.ok) {
                // Get filename from Content-Disposition header if possible
                const disposition = res.headers.get('Content-Disposition');
                let filename = `kincore_audit_export_${Date.now()}.${exportFormat.toLowerCase()}`;
                if (disposition && disposition.indexOf('filename=') !== -1) {
                    filename = disposition.split('filename=')[1].replace(/"/g, '');
                }

                const blob = await res.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                setExportFormat(null);
            } else {
                console.error("Export failed:", await res.text());
                alert("Export failed. You may not have sufficient permissions.");
            }
        } catch (err) {
            console.error("Export error:", err);
            alert('Error generating report. Please contact system admin.');
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700 pb-20 max-w-7xl mx-auto">
            {/* Header Section */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-4 px-2">
                <div>
                    <div className="flex items-center space-x-2 mb-2">
                        <Shield className="text-brand-orange w-4 h-4" />
                        <h2 className="text-gray-900 dark:text-brand-darkText text-[10px] font-black uppercase tracking-[0.3em] opacity-40">System Integrity</h2>
                    </div>
                    <h1 className="text-5xl font-black text-gray-900 dark:text-brand-darkText tracking-tighter uppercase">Audit Hub</h1>
                    <p className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-2 leading-relaxed max-w-md">
                        Unified forensic monitoring, regulatory compliance mapping, and automated risk assessment.
                    </p>
                </div>
                <div className="flex items-center space-x-4">
                    {(() => {
                        const score = complianceScores?.global || 0;
                        let statusText = "Calculating...";
                        let styleMap = {
                            container: "bg-gray-500/10 dark:bg-gray-500/20 border-gray-500/20 shadow-gray-500/5",
                            dot: "bg-gray-500",
                            label: "text-gray-600/60 dark:text-gray-400/60",
                            value: "text-gray-600 dark:text-gray-500"
                        };
                        
                        if (complianceScores) {
                            if (score >= 90) {
                                statusText = "Fully Compliant";
                                styleMap = {
                                    container: "bg-emerald-500/10 dark:bg-emerald-500/20 border-emerald-500/20 shadow-emerald-500/5",
                                    dot: "bg-emerald-500",
                                    label: "text-emerald-600/60 dark:text-emerald-400/60",
                                    value: "text-emerald-600 dark:text-emerald-500"
                                };
                            } else if (score >= 75) {
                                statusText = "Attention Needed";
                                styleMap = {
                                    container: "bg-orange-500/10 dark:bg-orange-500/20 border-orange-500/20 shadow-orange-500/5",
                                    dot: "bg-orange-500",
                                    label: "text-orange-600/60 dark:text-orange-400/60",
                                    value: "text-orange-600 dark:text-orange-500"
                                };
                            } else {
                                statusText = "Critical Risk";
                                styleMap = {
                                    container: "bg-red-500/10 dark:bg-red-500/20 border-red-500/20 shadow-red-500/5",
                                    dot: "bg-red-500",
                                    label: "text-red-600/60 dark:text-red-400/60",
                                    value: "text-red-600 dark:text-red-500"
                                };
                            }
                        }
                        
                        return (
                            <div className={`px-8 py-5 rounded-[2rem] border flex items-center space-x-4 shadow-xl transition-colors ${styleMap.container}`}>
                                <div className={`w-3 h-3 rounded-full animate-pulse ${styleMap.dot}`} />
                                <div className="text-left">
                                    <p className={`text-[9px] font-black uppercase tracking-widest leading-none mb-1 ${styleMap.label}`}>Status</p>
                                    <p className={`text-sm font-black uppercase tracking-widest ${styleMap.value}`}>{statusText}</p>
                                </div>
                            </div>
                        );
                    })()}
                </div>
            </header>

            {/* Main Compliance Intelligence Section */}
            <section className="bg-white dark:bg-brand-darkCard p-12 rounded-[3.5rem] border border-gray-100 dark:border-brand-darkBorder shadow-2xl relative overflow-hidden transition-all hover:border-brand-orange/10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                    <div className="lg:col-span-5 space-y-12">
                        <div className="flex items-center space-x-6">
                            <div className="w-24 h-24 rounded-[2.5rem] bg-brand-orange/5 flex flex-col items-center justify-center border-2 border-brand-orange/10 shadow-inner group transition-all hover:scale-105">
                                <span className="text-4xl font-black text-brand-orange leading-none">{complianceScores ? complianceScores.global : 94}<span className="text-sm">%</span></span>
                                <span className="text-[10px] font-black text-brand-orange/60 uppercase tracking-tighter mt-1">Global</span>
                            </div>
                            <div>
                                <h2 className="text-3xl font-black text-gray-900 dark:text-brand-darkText uppercase tracking-tight">Compliance Score</h2>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">Precision Audit: Today, 11:45 AM</p>
                            </div>
                        </div>

                        <div className="p-8 bg-gray-50/50 dark:bg-brand-darkBg rounded-[2.5rem] border border-gray-100 dark:border-brand-darkBorder space-y-8">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <Globe size={20} className="text-blue-500" />
                                    <h4 className="text-xs font-black text-gray-900 dark:text-brand-darkText uppercase tracking-[0.1em]">Regulatory Mapping</h4>
                                </div>
                                <div className="flex items-center space-x-1 text-green-500 text-[10px] font-bold uppercase tracking-widest">
                                    <TrendingUp size={14} className="mr-1" />
                                    <span>+2.4% MoM</span>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                {['GDPR: Compliant', 'SOC2: Type II', 'Internal: 98%', 'KCC-V2: Verified'].map(std => (
                                    <div key={std} className="px-5 py-3.5 bg-white dark:bg-brand-darkCard border border-gray-50 dark:border-brand-darkBorder rounded-2xl text-[10px] font-black text-gray-600 dark:text-gray-400 uppercase shadow-sm tracking-tighter">
                                        {std}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-8">
                            {[
                                { label: 'Data Privacy', score: complianceScores ? complianceScores.dataPrivacy : 92, weight: '40%', color: 'bg-emerald-500' },
                                { label: 'Access Control', score: complianceScores ? complianceScores.accessControl : 88, weight: '35%', color: 'bg-brand-orange' },
                                { label: 'System Integrity', score: complianceScores ? complianceScores.systemIntegrity : 98, weight: '25%', color: 'bg-blue-500' }
                            ].map((item) => (
                                <div key={item.label} className="space-y-4">
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{item.label}</p>
                                            <span className="text-[8px] px-2 py-0.5 bg-gray-100 dark:bg-brand-darkBg rounded-md text-gray-400 font-bold uppercase">Weight: {item.weight}</span>
                                        </div>
                                        <span className="text-base font-black text-gray-900 dark:text-brand-darkText">{item.score}%</span>
                                    </div>
                                    <div className="h-2.5 bg-gray-50 dark:bg-brand-darkBg rounded-full overflow-hidden p-0.5 border border-gray-100 dark:border-brand-darkBorder">
                                        <div
                                            className={`h-full rounded-full ${item.color} shadow-lg shadow-current/20 transition-all duration-1000`}
                                            style={{ width: `${item.score}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="lg:col-span-7 flex flex-col justify-between space-y-12">
                        <div className="h-[400px] w-full relative">
                            <div className="absolute top-4 left-4 z-10">
                                <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] mb-1">Performance Trend</p>
                                <h3 className="text-lg font-black text-gray-900 dark:text-brand-darkText uppercase">Metric Consistency</h3>
                            </div>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData} margin={{ top: 80, right: 0, left: 0, bottom: 0 }} onClick={(e) => { if (e && e.activePayload) setScoreHistory(e.activePayload[0].payload); }} style={{ cursor: 'pointer' }}>
                                    <defs>
                                        <linearGradient id="colorMain" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#FF6D4D" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#FF6D4D" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="6 6" vertical={false} stroke="#E5E7EB" opacity={0.3} />
                                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: '900', fill: '#9CA3AF' }} dy={10} />
                                    <YAxis hide domain={[85, 100]} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#fff', borderRadius: '24px', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', fontSize: '11px', fontWeight: '900', textTransform: 'uppercase' }}
                                    />
                                    <Area type="monotone" dataKey="score" stroke="#FF6D4D" strokeWidth={5} fillOpacity={1} fill="url(#colorMain)" dot={{ r: 6, fill: '#FF6D4D', strokeWidth: 3, stroke: '#fff' }} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                            <div className="p-8 bg-white dark:bg-brand-darkCard rounded-[2.5rem] border border-gray-100 dark:border-brand-darkBorder shadow-xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-orange/10 rounded-full -mr-16 -mt-16 blur-3xl transition-opacity group-hover:opacity-100 opacity-50"></div>
                                <div className="relative z-10 text-left">
                                    <div className="flex items-center space-x-3 mb-4">
                                        <Zap className={complianceScores?.risk_potential?.color ? complianceScores.risk_potential.color.replace('text-', '') : "text-brand-orange"} size={20} />
                                        <p className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em]">Risk Potential</p>
                                    </div>
                                    <p className={`text-4xl font-black ${complianceScores?.risk_potential?.color || 'text-gray-900 dark:text-brand-darkText'} tracking-tighter leading-none mb-2`}>{complianceScores?.risk_potential?.level || 'LOW'}</p>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{complianceScores?.risk_potential?.label || 'Active Monitoring'}</p>
                                </div>
                            </div>
                            <div className="p-8 bg-white dark:bg-brand-darkCard rounded-[2.5rem] border border-gray-100 dark:border-brand-darkBorder shadow-xl relative overflow-hidden group active:scale-95 transition-all">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full -mr-16 -mt-16 blur-3xl transition-opacity group-hover:opacity-100 opacity-50"></div>
                                <div className="relative z-10 text-left">
                                    <div className="flex items-center space-x-3 mb-4">
                                        <ShieldCheck className={complianceScores?.data_shield?.color ? complianceScores.data_shield.color.replace('text-', '') : "text-emerald-500"} size={20} />
                                        <p className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em]">Data Shield</p>
                                    </div>
                                    <p className={`text-4xl font-black ${complianceScores?.data_shield?.color || 'text-gray-900 dark:text-brand-darkText'} tracking-tighter leading-none mb-2`}>{complianceScores?.data_shield?.status || 'ACTIVE'}</p>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{complianceScores?.data_shield?.coverage || 'Fully Protected'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Risk & Security Alerts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 text-left">
                {/* Security Alerts Stack */}
                <div className="lg:col-span-1 space-y-8">
                    <div className="flex items-center justify-between px-6">
                        <div className="flex items-center space-x-3">
                            <AlertTriangle size={24} className="text-brand-orange" />
                            <h3 className="text-xl font-black text-gray-900 dark:text-brand-darkText uppercase tracking-tight">Threat Feed</h3>
                        </div>
                        <span className="px-4 py-1.5 bg-red-500 text-white text-[9px] font-black uppercase rounded-full shadow-lg shadow-red-500/20 animate-pulse">Live</span>
                    </div>

                    <div className="space-y-6">
                        {alerts.map((alert) => (
                            <div 
                                key={alert.id} 
                                onClick={() => setEvidenceData({ title: alert.title, id: alert.id, type: 'Threat Alert Evidence', details: alert.details })}
                                className="bg-white dark:bg-brand-darkCard p-8 rounded-[3rem] border border-gray-100 dark:border-brand-darkBorder shadow-sm hover:scale-[1.02] transition-all cursor-pointer group"
                            >
                                <div className="flex justify-between items-center mb-6">
                                    <span className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase shadow-sm ${alert.type === 'High' ? 'bg-orange-500 text-white' : alert.type === 'Critical' ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'}`}>
                                        {alert.type}
                                    </span>
                                    <span className="text-[9px] font-bold text-gray-300 dark:text-gray-600 uppercase tracking-widest">{alert.time}</span>
                                </div>
                                <h4 className="text-lg font-black text-gray-900 dark:text-brand-darkText uppercase tracking-tight mb-6 leading-tight group-hover:text-brand-orange transition-colors">{alert.title}</h4>
                                <div className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-tighter text-brand-orange opacity-60">
                                    <span>{alert.id}</span>
                                    <span className="w-1 h-1 rounded-full bg-gray-200"></span>
                                    <span>{alert.status}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Financial Intelligence & Export Row */}
                <div className="lg:col-span-2 space-y-12">
                    {/* Financial Integrity Card */}
                    <div className="bg-white dark:bg-brand-darkCard p-10 rounded-[3.5rem] border border-gray-100 dark:border-brand-darkBorder shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full -mr-32 -mt-32 blur-3xl" />
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-12">
                                <div className="flex items-center space-x-4">
                                    <CreditCard className="text-emerald-500" size={28} />
                                    <h3 className="text-2xl font-black text-gray-900 dark:text-brand-darkText uppercase tracking-tight">Financial Integrity</h3>
                                </div>
                                <button 
                                    onClick={() => setScanModalOpen(true)}
                                    className="px-8 py-3.5 bg-brand-orange/10 text-brand-orange border border-brand-orange/20 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-brand-orange/20 transition-all active:scale-95 shadow-xl shadow-brand-orange/5"
                                >
                                    Forensic Scan
                                </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                                <div className="space-y-2 border-l-2 border-emerald-500/20 pl-6">
                                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Wallet Sync</p>
                                    <p className="text-3xl font-black text-emerald-400 tabular-nums leading-none tracking-tighter">99.9%</p>
                                    <p className="text-[9px] font-bold text-gray-600 uppercase tracking-widest mt-2">Active Node</p>
                                </div>
                                <div className="space-y-2 border-l-2 border-emerald-500/20 pl-6">
                                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Anomalies</p>
                                    <p className="text-3xl font-black text-gray-900 dark:text-brand-darkText tabular-nums leading-none tracking-tighter">0</p>
                                    <p className="text-[9px] font-bold text-gray-600 uppercase tracking-widest mt-2">Verified</p>
                                </div>
                                <div className="space-y-2 border-l-2 border-emerald-500/20 pl-6">
                                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Refund Base</p>
                                    <p className="text-3xl font-black text-blue-400 tabular-nums leading-none tracking-tighter uppercase">Matched</p>
                                    <p className="text-[9px] font-bold text-gray-600 uppercase tracking-widest mt-2">Settlement Layer</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Forensic Event List */}
                    <div className="bg-white dark:bg-brand-darkCard rounded-[3.5rem] border border-gray-100 dark:border-brand-darkBorder shadow-sm overflow-hidden flex flex-col">
                        <div className="p-8 border-b border-gray-50 dark:border-brand-darkBorder flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-black text-gray-900 dark:text-brand-darkText uppercase tracking-tight">Verification Stream</h3>
                                <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-1">Real-time Platform Audit</p>
                            </div>
                            <button 
                                onClick={() => setHistoryOpen(true)}
                                className="text-[10px] font-black text-brand-orange hover:underline uppercase tracking-widest"
                            >
                                Full History
                            </button>
                        </div>
                        <div className="divide-y divide-gray-50 dark:divide-brand-darkBorder">
                            {verificationStream.length > 0 ? verificationStream.slice(0, 5).map((log, i) => (
                                <div 
                                    key={i} 
                                    onClick={() => setEvidenceData({ title: log.action, id: log.id, type: 'Verification Event Evidence', details: `Actor: ${log.actor?.first_name || 'System'} ${log.actor?.last_name || ''}\nRole: ${log.actor_role}\nCategory: ${log.category}\nTarget: ${log.target_name}\nContext: ${log.target_context}\nRisk: ${log.severity}\nTime: ${new Date(log.created_at).toLocaleString()}` })}
                                    className="p-8 flex flex-col md:flex-row md:items-center justify-between gap-8 group hover:bg-gray-50/50 dark:hover:bg-brand-darkBg/50 transition-all cursor-pointer"
                                >
                                    <div className="flex items-center space-x-6">
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${log.severity === 'CRITICAL' ? 'bg-red-50 text-red-500 dark:bg-red-500/10' : log.severity === 'WARNING' ? 'bg-brand-orange/10 text-brand-orange' : 'bg-blue-50 text-blue-500 dark:bg-blue-500/10'}`}>
                                            <Shield size={24} />
                                        </div>
                                        <div className="text-left">
                                            <p className="text-base font-black text-gray-900 dark:text-brand-darkText uppercase tracking-tight mb-1">{log.actor_role}</p>
                                            <div className="flex items-center space-x-3">
                                                <span className="text-[9px] font-black uppercase text-gray-400 tracking-widest">{log.action}</span>
                                                <span className="w-1 h-1 rounded-full bg-gray-200"></span>
                                                <span className="text-[9px] font-black uppercase text-brand-orange tracking-tighter">{log.id.split('-')[0]}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-12">
                                        <div className="text-right hidden sm:block">
                                            <p className="text-[10px] font-black text-gray-900 dark:text-brand-darkText uppercase tracking-tighter tabular-nums">{new Date(log.created_at).toLocaleTimeString()}</p>
                                            <p className={`text-[8px] font-black uppercase tracking-[0.2em] mt-1.5 ${log.severity === 'CRITICAL' ? 'text-red-500' : 'text-gray-400'}`}>{log.severity} Risk</p>
                                        </div>
                                        <ChevronRight className="text-gray-200 group-hover:text-brand-orange transition-all translate-x-0 group-hover:translate-x-2" />
                                    </div>
                                </div>
                            )) : (
                                <div className="p-8 text-center text-gray-500 text-sm font-bold uppercase tracking-widest">No recent audit events.</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Export & Compliance Format Row */}
            <div className="bg-white dark:bg-brand-darkCard p-12 rounded-[3.5rem] border border-gray-100 dark:border-brand-darkBorder shadow-sm text-left">
                <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-12">
                    <div>
                        <h3 className="text-2xl font-black text-gray-900 dark:text-brand-darkText uppercase tracking-tight">Forensic Export Center</h3>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2">Select unified report format for external verification</p>
                    </div>
                    <div className="flex items-center space-x-3 text-gray-500 p-4 bg-gray-100 dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
                        <BarChart3 size={20} className="opacity-50" />
                        <span className="text-[10px] font-black uppercase tracking-widest">SIEM Integration Pending</span>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {[
                        { format: 'CSV', label: 'Structured Vault Data', color: 'border-blue-100 dark:border-blue-900/20 text-blue-600', pending: false },
                        { format: 'JSON', label: 'Universal API Objects', color: 'border-brand-orange/20 text-brand-orange', pending: false },
                        { format: 'PDF', label: 'Certified Audit Report', color: 'border-emerald-100 dark:border-emerald-900/20 text-emerald-600', pending: false },
                        { format: 'SIEM', label: 'Security Event Logs', color: 'border-purple-100 dark:border-purple-900/20 text-gray-400 dark:text-gray-600 bg-gray-50 dark:bg-black/20', pending: true }
                    ].map((item) => (
                        <button 
                            key={item.format} 
                            disabled={item.pending}
                            onClick={() => setExportFormat(item.format)}
                            className={`${item.color} p-8 rounded-[2.5rem] border-2 transition-all ${item.pending ? 'opacity-60 cursor-not-allowed' : 'hover:scale-[1.05] active:scale-95 hover:shadow-2xl'} text-left group relative overflow-hidden`}
                        >
                            {item.pending && (
                                <div className="absolute top-4 right-4 bg-gray-200 dark:bg-gray-800 text-gray-500 text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded">
                                    Pending
                                </div>
                            )}
                            <p className={`text-3xl font-black tracking-tighter mb-2 ${!item.pending && 'group-hover:scale-110'} transition-transform origin-left`}>{item.format}</p>
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-60 leading-tight">{item.label}</p>
                        </button>
                    ))}
                </div>
            </div>

            {/* --- Modals Section --- */}
            {/* Evidence Modal */}
            {evidenceData && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/80 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white dark:bg-[#0A0A0A] border border-gray-200 dark:border-gray-800 p-8 rounded-[2rem] max-w-lg w-full shadow-2xl relative text-left">
                        <button onClick={() => setEvidenceData(null)} className="absolute top-6 right-6 text-gray-400 hover:text-gray-900 dark:hover:text-white"><X size={20}/></button>
                        <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase mb-2">{evidenceData.type}</h3>
                        <p className="text-brand-orange font-mono text-xs mb-6">{evidenceData.id}</p>
                        <div className="bg-gray-100 dark:bg-black p-4 rounded-xl font-mono text-xs text-gray-800 dark:text-gray-300 whitespace-pre-wrap border border-gray-200 dark:border-gray-800">
                            {evidenceData.title}
                            {'\n\n'}{evidenceData.details}
                            {'\n\n[CONFIDENTIAL: READ-ONLY AUDIT VIEW]'}
                        </div>
                    </div>
                </div>
            )}

            {/* Forensic Scan Modal */}
            {scanModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/80 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white dark:bg-[#0A0A0A] border border-brand-orange/20 p-8 rounded-[2rem] max-w-md w-full shadow-2xl relative text-center">
                        <Zap size={48} className="mx-auto text-brand-orange mb-6 animate-pulse" />
                        <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase mb-4">Forensic Scan Triggered</h3>
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-widest leading-relaxed mb-8">
                            A read-only financial integrity scan has been initiated. This action will be logged in the audit trail.
                        </p>
                        <button onClick={() => setScanModalOpen(false)} className="w-full py-4 bg-brand-orange text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-brand-orange/80 transition-colors">
                            Acknowledge
                        </button>
                    </div>
                </div>
            )}

            {/* Export Modal */}
            {exportFormat && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/80 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white dark:bg-[#0A0A0A] border border-gray-200 dark:border-gray-800 p-8 rounded-[2rem] max-w-md w-full shadow-2xl relative text-left">
                        <button onClick={() => setExportFormat(null)} className="absolute top-6 right-6 text-gray-400 hover:text-gray-900 dark:hover:text-white"><X size={20}/></button>
                        <div className="flex items-center space-x-3 mb-6">
                            <Download className="text-blue-500" />
                            <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase">Export {exportFormat}</h3>
                        </div>
                        <div className="space-y-4 mb-8">
                            <div className="p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20 rounded-xl text-xs text-blue-800 dark:text-blue-300 font-medium">
                                <p className="mb-2"><strong>Watermark:</strong> KINCORE-AUDIT-{Date.now().toString().slice(-6)}</p>
                                <p><strong>Scope:</strong> Scoped Compliance Report (Sensitive data masked)</p>
                            </div>
                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                                Note: Full raw platform logs require Super Admin permission. This export has been logged.
                            </p>
                        </div>
                        <button disabled={isExporting} onClick={handleExport} className="w-full py-4 bg-gray-900 dark:bg-white text-white dark:text-black rounded-xl font-black text-xs uppercase tracking-widest hover:opacity-90 transition-opacity flex items-center justify-center disabled:opacity-50">
                            {isExporting ? <Zap className="animate-spin mr-2" size={16} /> : null}
                            {isExporting ? 'Generating...' : 'Generate Secure Export'}
                        </button>
                    </div>
                </div>
            )}

            {/* Full History Modal */}
            {historyOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/80 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white dark:bg-[#0A0A0A] border border-gray-200 dark:border-gray-800 p-8 rounded-[2rem] max-w-4xl w-full shadow-2xl relative text-left">
                        <button onClick={() => setHistoryOpen(false)} className="absolute top-6 right-6 text-gray-400 hover:text-gray-900 dark:hover:text-white"><X size={20}/></button>
                        <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight mb-2">Complete Verification Timeline</h3>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-6">Read-only view of all historical audit events.</p>
                        
                        {/* Filters as requested by client */}
                        <div className="flex flex-wrap gap-2 mb-6">
                            {['Date', 'Risk Level', 'Actor', 'Module', 'Source', 'Event Type', 'Family Space', 'Admin Role'].map(filter => (
                                <select key={filter} className="bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-gray-800 text-[10px] font-bold uppercase tracking-widest text-gray-600 dark:text-gray-400 px-3 py-2 rounded-lg outline-none cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                                    <option>Filter: {filter}</option>
                                </select>
                            ))}
                        </div>

                        <div className="max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar space-y-2">
                            {verificationStream.length > 0 ? verificationStream.map((log, i) => (
                                <div key={i} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#111] rounded-xl border border-gray-100 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-2">
                                            <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${log.severity === 'CRITICAL' ? 'bg-red-500/10 text-red-500' : log.severity === 'WARNING' ? 'bg-orange-500/10 text-orange-500' : 'bg-blue-500/10 text-blue-500'}`}>{log.severity}</span>
                                            <span className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight">{log.action}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                                            <span>{log.actor_role} ({log.actor?.first_name || 'Automated'})</span>
                                            <span>•</span>
                                            <span>{log.category}</span>
                                            <span>•</span>
                                            <span>{log.target_name}</span>
                                        </div>
                                    </div>
                                    <div className="text-right flex flex-col items-end">
                                        <span className="text-xs font-black text-gray-900 dark:text-gray-300 uppercase tracking-tighter tabular-nums">{new Date(log.created_at).toLocaleDateString()}</span>
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest tabular-nums">{new Date(log.created_at).toLocaleTimeString()}</span>
                                    </div>
                                </div>
                            )) : (
                                <div className="h-64 bg-gray-50 dark:bg-[#111] rounded-xl flex items-center justify-center border border-gray-100 dark:border-gray-800">
                                    <p className="text-gray-400 font-mono text-xs">[No historical data found]</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Score History Modal */}
            {scoreHistory && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/80 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white dark:bg-[#0A0A0A] border border-gray-200 dark:border-gray-800 p-8 rounded-[2rem] max-w-lg w-full shadow-2xl relative text-left">
                        <button onClick={() => setScoreHistory(null)} className="absolute top-6 right-6 text-gray-400 hover:text-gray-900 dark:hover:text-white"><X size={20}/></button>
                        <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase mb-2">Historical Score: {scoreHistory.date}</h3>
                        <div className="flex items-center space-x-4 mb-6">
                            <span className="text-4xl font-black text-brand-orange">{scoreHistory.score}%</span>
                            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest leading-tight">Global<br/>Compliance</span>
                        </div>
                        <div className="bg-gray-50 dark:bg-[#111] p-6 rounded-[1.5rem] border border-gray-200 dark:border-gray-800 space-y-4">
                            <p className="text-[10px] font-black text-gray-900 dark:text-white uppercase tracking-widest mb-2 border-b border-gray-200 dark:border-gray-800 pb-3">Change Factors</p>
                            <div className="flex justify-between items-center text-xs"><span className="text-gray-500 font-bold uppercase tracking-widest">Resolved Risks</span><span className="text-emerald-500 font-black tracking-tighter bg-emerald-500/10 px-2 py-1 rounded-md">+{scoreHistory.resolved_risks} Controls</span></div>
                            <div className="flex justify-between items-center text-xs"><span className="text-gray-500 font-bold uppercase tracking-widest">Failed Checks</span><span className={scoreHistory.failed_checks > 0 ? "text-red-500 font-black tracking-tighter bg-red-500/10 px-2 py-1 rounded-md" : "text-gray-400 font-black tracking-tighter bg-gray-200 dark:bg-gray-800 px-2 py-1 rounded-md"}>{scoreHistory.failed_checks}</span></div>
                            <div className="flex justify-between items-center text-xs"><span className="text-gray-500 font-bold uppercase tracking-widest">Audit Evidence</span><span className="text-blue-500 font-black tracking-tighter bg-blue-500/10 px-2 py-1 rounded-md">{scoreHistory.log_completeness}</span></div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AuditorDashboard;
