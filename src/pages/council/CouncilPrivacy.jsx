import React, { useState, useEffect } from 'react';
import { useCouncil } from '../../context/CouncilContext';
import {
    Shield,
    Lock,
    Eye,
    Database,
    Info,
    ChevronRight,
    Save,
    Undo2,
    AlertTriangle,
    Globe,
    UserCheck,
    Users
} from 'lucide-react';

const PrivacySection = ({ title, icon: Icon, children }) => (
    <div className="bg-white dark:bg-brand-darkCard rounded-[2.5rem] border border-gray-100 dark:border-brand-darkBorder overflow-hidden shadow-sm mb-8 transition-colors">
        <div className="px-8 py-6 border-b border-gray-50 dark:border-brand-darkBg flex items-center space-x-4">
            <div className="w-10 h-10 rounded-2xl bg-orange-50 dark:bg-brand-orange/10 flex items-center justify-center text-brand-orange">
                <Icon size={20} strokeWidth={2.5} />
            </div>
            <h2 className="text-lg font-black text-gray-900 dark:text-brand-darkText uppercase tracking-widest">{title}</h2>
        </div>
        <div className="px-8 py-2">
            {children}
        </div>
    </div>
);

const PrivacyRow = ({ title, description, children, showAudit = true }) => (
    <div className="py-8 border-b border-gray-50 dark:border-brand-darkBg last:border-0 transition-colors">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="text-left flex-1">
                <div className="flex items-center space-x-2 mb-1.5">
                    <h3 className="text-sm font-black text-gray-900 dark:text-brand-darkText">{title}</h3>
                    <div className="group relative">
                        <Info size={14} className="text-gray-300 hover:text-brand-orange cursor-help transition-colors" />
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-3 bg-gray-900 text-white text-[10px] font-bold rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-xl z-50">
                            Setting determines how lineage data is processed across branches.
                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-gray-900"></div>
                        </div>
                    </div>
                </div>
                <p className="text-[11px] font-bold text-gray-400 dark:text-gray-500 max-w-[580px] leading-relaxed">{description}</p>
                {showAudit && (
                    <div className="flex items-center space-x-1.5 mt-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                        <span className="text-[9px] font-black text-gray-300 dark:text-gray-600 uppercase tracking-widest">Audit Tracked</span>
                    </div>
                )}
            </div>
            <div className="shrink-0">
                {children}
            </div>
        </div>
    </div>
);

const Toggle = ({ checked = false, onChange }) => (
    <label className="relative inline-flex items-center cursor-pointer group">
        <input type="checkbox" className="sr-only peer" checked={checked} onChange={onChange} />
        <div className="w-[60px] h-[32px] bg-gray-100 dark:bg-brand-darkBg rounded-full peer peer-checked:after:translate-x-[28px] peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:dark:bg-brand-darkText after:border-gray-200 dark:after:border-brand-darkBorder after:border after:rounded-full after:h-6 after:w-6 after:transition-all duration-300 peer-checked:bg-brand-orange dark:peer-checked:bg-brand-orange shadow-inner"></div>
    </label>
);

const CouncilPrivacy = () => {
    const { selectedFamilyId } = useCouncil();
    const [isDirty, setIsDirty] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    
    const [settings, setSettings] = useState({
        lineageVisibility: true,
        autoApproveCousins: false,
        sensitiveDataRedaction: true,
        postMortemAccess: true,
        globalIndexing: false
    });

    const [originalSettings, setOriginalSettings] = useState({});

    useEffect(() => {
        const fetchSettings = async () => {
            if (!selectedFamilyId) return;
            setLoading(true);
            try {
                const token = localStorage.getItem('token');
                const baseUrl = import.meta.env.VITE_API_BASE_URL || `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}`;
                const res = await fetch(`${baseUrl}/admin/council/privacy?familySpaceId=${selectedFamilyId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setSettings(data);
                    setOriginalSettings(data);
                    setIsDirty(false);
                }
            } catch (err) {
                console.error('Failed to fetch privacy settings:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, [selectedFamilyId]);

    const handleSave = async () => {
        if (!selectedFamilyId) return;
        setSaving(true);
        try {
            const token = localStorage.getItem('token');
            const baseUrl = import.meta.env.VITE_API_BASE_URL || `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}`;
            const res = await fetch(`${baseUrl}/admin/council/privacy?familySpaceId=${selectedFamilyId}`, {
                method: 'PUT',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(settings)
            });
            if (res.ok) {
                setOriginalSettings(settings);
                setIsDirty(false);
            } else {
                console.error('Failed to save settings');
            }
        } catch (err) {
            console.error('Failed to save privacy settings:', err);
        } finally {
            setSaving(false);
        }
    };

    const handleDiscard = () => {
        setSettings(originalSettings);
        setIsDirty(false);
    };

    const handleToggle = (key) => (e) => {
        setSettings(prev => ({ ...prev, [key]: e.target.checked }));
        setIsDirty(true);
    };

    if (loading) {
        return <div className="p-20 text-center font-black animate-pulse text-brand-orange uppercase tracking-widest">Loading Vault...</div>;
    }

    return (
        <div className="w-full lg:max-w-6xl mx-auto px-4 lg:px-0 text-left py-10 relative pb-40">
            <header className="mb-14 flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 dark:text-brand-darkText leading-none mb-4 tracking-tight">Privacy Vault</h1>
                    <div className="flex items-center space-x-2">
                        <Shield size={14} className="text-brand-orange" />
                        <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">Council-Grade Encryption Active</p>
                    </div>
                </div>
                <div className="hidden lg:flex items-center space-x-3 text-[10px] font-black text-gray-300 uppercase tracking-widest">
                    <span>Last Updated: 2 min ago</span>
                </div>
            </header>

            <div className="grid gap-4">
                <PrivacySection title="Core Accessibility" icon={Lock}>
                    <PrivacyRow
                        title="Lineage Visibility"
                        description="Controls if the family tree is searchable by members outside your verified lineage. When off, tree is invitation-only."
                    >
                        <Toggle checked={settings.lineageVisibility} onChange={handleToggle('lineageVisibility')} />
                    </PrivacyRow>
                    <PrivacyRow
                        title="Auto-Approval for Cousins"
                        description="Automatically approve member claims if a 1st or 2nd degree relative already exists in the tree."
                    >
                        <Toggle checked={settings.autoApproveCousins} onChange={handleToggle('autoApproveCousins')} />
                    </PrivacyRow>
                </PrivacySection>

                <PrivacySection title="Data & Inheritance" icon={Database}>
                    <PrivacyRow
                        title="Sensitive Data Redaction"
                        description="Mask specific fields (Birth DNA, exact location) for all members regardless of their permission level."
                    >
                        <Toggle checked={settings.sensitiveDataRedaction} onChange={handleToggle('sensitiveDataRedaction')} />
                    </PrivacyRow>
                    <PrivacyRow
                        title="Post-Mortem Access"
                        description="Automatically release private records to verified descendants after a member is marked deceased."
                    >
                        <Toggle checked={settings.postMortemAccess} onChange={handleToggle('postMortemAccess')} />
                    </PrivacyRow>
                </PrivacySection>

                <PrivacySection title="External Sync" icon={Globe}>
                    <PrivacyRow
                        title="Kincore Global Indexing"
                        description="Allow the family surname to appear in global Kincore search results for potential reconnection."
                    >
                        <Toggle checked={settings.globalIndexing} onChange={handleToggle('globalIndexing')} />
                    </PrivacyRow>
                    <PrivacyRow
                        title="Third-Party API Access"
                        description="Enable integration with external genealogical databases for automated record matching."
                    >
                        <button className="flex items-center space-x-3 px-6 py-3 bg-gray-50 dark:bg-brand-darkBg text-gray-900 dark:text-brand-darkText rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-orange-50 dark:hover:bg-brand-orange/10 transition-all border border-gray-100 dark:border-brand-darkBorder">
                            <span>Configure</span>
                            <ChevronRight size={14} strokeWidth={3} />
                        </button>
                    </PrivacyRow>
                </PrivacySection>
            </div>

            {/* Sticky Save Bar */}
            <div className={`fixed bottom-12 left-1/2 -translate-x-1/2 w-full max-w-4xl px-8 z-50 transition-all duration-500 ${isDirty ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'}`}>
                <div className="bg-gray-900/95 dark:bg-brand-darkCard/95 backdrop-blur-xl border border-white/10 dark:border-brand-darkBorder rounded-[2.5rem] p-4 flex items-center justify-between shadow-2xl shadow-brand-orange/20">
                    <div className="flex items-center space-x-4 ml-6">
                        <div className="w-10 h-10 rounded-2xl bg-brand-orange/20 flex items-center justify-center text-brand-orange">
                            <AlertTriangle size={20} strokeWidth={2.5} />
                        </div>
                        <div>
                            <p className="text-sm font-black text-white leading-none mb-1">Unsaved Privacy Changes</p>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Changes affect family-wide data access</p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-3">
                        <button
                            onClick={handleDiscard}
                            disabled={saving}
                            className="px-8 py-4 rounded-2xl text-xs font-black text-gray-400 hover:text-white uppercase tracking-widest transition-colors flex items-center space-x-2 disabled:opacity-50"
                        >
                            <Undo2 size={16} strokeWidth={3} />
                            <span>Discard</span>
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="bg-brand-orange text-white px-10 py-5 rounded-3xl font-black text-sm shadow-xl shadow-brand-orange/30 hover:bg-orange-600 transition-all active:scale-95 flex items-center space-x-3 disabled:opacity-50"
                        >
                            <Save size={18} strokeWidth={3} />
                            <span>{saving ? 'Saving...' : 'Apply Changes'}</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CouncilPrivacy;
