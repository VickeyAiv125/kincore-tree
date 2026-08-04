import React, { useState, useEffect } from 'react';
import { ChevronDown, Database } from 'lucide-react';
import { Link } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const DEFAULT_NOTIFICATIONS = {
    email: true,
    push: true,
    events: true,
    governance: true,
    registry: true,
    claims: true,
    abuse: true,
    roles: true,
    subscription: true
};
const SettingGroup = ({ title, children }) => (
    <div className="mb-10">
        <h3 className="text-sm font-extrabold text-gray-900 dark:text-brand-darkText mb-6 uppercase tracking-wider">{title}</h3>
        <div className="space-y-6">
            {children}
        </div>
    </div>
);

const SettingInput = ({ label, placeholder, value, onChange, name }) => (
    <div className="flex flex-col space-y-2 w-full">
        <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">{label}</label>
        <input
            type="text"
            name={name}
            placeholder={placeholder}
            value={value || ''}
            onChange={onChange}
            className="bg-white dark:bg-brand-darkCard border border-gray-100 dark:border-brand-darkBorder rounded-2xl py-4 px-6 text-sm font-medium text-gray-600 dark:text-brand-darkText placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-brand-orange/20 transition-all shadow-sm"
        />
    </div>
);

const SelectField = ({ label, subtext, options, value, onChange, name }) => (
    <div className="flex items-center justify-between p-5 bg-white dark:bg-brand-darkCard border border-gray-100 dark:border-brand-darkBorder rounded-2xl shadow-sm transition-colors group hover:border-brand-orange/20">
        <div>
            <h4 className="text-xs font-black text-gray-900 dark:text-brand-darkText uppercase tracking-tighter">{label}</h4>
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">{subtext}</p>
        </div>
        <div className="relative">
            <select
                name={name}
                value={value}
                onChange={onChange}
                className="appearance-none bg-gray-50 dark:bg-brand-darkBg border border-gray-100 dark:border-brand-darkBorder rounded-xl py-2 pl-4 pr-10 text-[10px] font-black text-gray-600 dark:text-brand-darkText uppercase tracking-widest outline-none cursor-pointer hover:border-brand-orange/30 transition-all shadow-sm"
            >
                {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <ChevronDown size={14} className="text-gray-400" />
            </div>
        </div>
    </div>
);

const RadioButton = ({ label, subtext, active, onClick }) => (
    <div
        onClick={onClick}
        className={`flex items-center justify-between p-5 border rounded-2xl shadow-sm cursor-pointer transition-all group ${active ? 'bg-brand-orange/5 border-brand-orange/20 tracking-normal' : 'bg-white dark:bg-brand-darkCard border-gray-100 dark:border-brand-darkBorder hover:border-brand-orange/20'}`}
    >
        <div>
            <h4 className={`text-xs font-black uppercase tracking-tighter transition-colors ${active ? 'text-brand-orange' : 'text-gray-900 dark:text-brand-darkText'}`}>{label}</h4>
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">{subtext}</p>
        </div>
        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${active ? 'border-brand-orange bg-brand-orange/10' : 'border-gray-200 dark:border-brand-darkBorder'}`}>
            {active && <div className="w-2 h-2 bg-brand-orange rounded-full"></div>}
        </div>
    </div>
);

const Settings = () => {
    const [settings, setSettings] = useState({
        family_name: '',
        origin_location: '',
        description: '',
        registration_rules: 'Admins Only',
        default_visibility: 'Family Only',
        notifications: { ...DEFAULT_NOTIFICATIONS }
    });
    const [statusModal, setStatusModal] = useState({ show: false, type: 'success', title: '', message: '' });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const familyId = localStorage.getItem('selected_family_id') || user?.family_id || user?.family_space_id || 'DEFAULT_FAMILY_ID';
            const token = localStorage.getItem('token');

            if (!familyId) return;

            const response = await fetch(`${API_BASE}/family-admin/${familyId}/settings`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('Failed to fetch settings');
            const data = await response.json();
            if (data.settings) {
                setSettings({
                    family_name: data.settings.name || '',
                    origin_location: data.settings.origin_location || '',
                    description: data.settings.description || '',
                    logo_url: data.settings.logo_url || '',
                    registration_rules: data.settings.registration_rules || 'Admins Only',
                    default_visibility: data.settings.default_visibility || 'Family Only',
                    notifications: { ...DEFAULT_NOTIFICATIONS, ...(data.settings.notifications || {}) }
                });
            }
        } catch (err) {
            console.error('Error fetching settings:', err);
        } finally {
            setLoading(false);
        }
    };

    const toggleNotification = (key) => {
        setSettings((prev) => ({
            ...prev,
            notifications: {
                ...DEFAULT_NOTIFICATIONS,
                ...prev.notifications,
                [key]: !(prev.notifications?.[key] ?? DEFAULT_NOTIFICATIONS[key])
            }
        }));
    };

    const handleLogoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const familyId = localStorage.getItem('selected_family_id') || user?.family_id || user?.family_space_id || 'DEFAULT_FAMILY_ID';
            const token = localStorage.getItem('token');
            const formData = new FormData();
            formData.append('logo', file);

            const response = await fetch(`${API_BASE}/family-admin/${familyId}/settings/logo`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (!response.ok) throw new Error('Failed to upload logo');
            const data = await response.json();
            
            setSettings({ ...settings, logo_url: data.logo_url });
            setStatusModal({
                show: true,
                type: 'success',
                title: 'Logo Updated',
                message: 'Your family logo has been successfully updated across the platform.'
            });
        } catch (err) {
            console.error('Logo upload error:', err);
            setStatusModal({
                show: true,
                type: 'error',
                title: 'Upload Failed',
                message: err.message || 'We encountered an error while uploading your logo.'
            });
        }
    };

    const handleExportData = async () => {
        try {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const familyId = localStorage.getItem('selected_family_id') || user?.family_id || user?.family_space_id || 'DEFAULT_FAMILY_ID';
            const token = localStorage.getItem('token');
            
            window.open(`${API_BASE}/family-admin/${familyId}/settings/export?token=${token}`, '_blank');
        } catch (err) {
            console.error('Export error:', err);
            setStatusModal({
                show: true,
                type: 'error',
                title: 'Export Failed',
                message: 'Unable to initiate data export. Please try again later.'
            });
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const familyId = localStorage.getItem('selected_family_id') || user?.family_id || user?.family_space_id || 'DEFAULT_FAMILY_ID';
            const token = localStorage.getItem('token');

            const body = {
                ...settings,
                name: settings.family_name
            };
            delete body.family_name;

            const response = await fetch(`${API_BASE}/family-admin/${familyId}/settings`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(body)
            });

            if (!response.ok) throw new Error('Failed to save settings');
            setStatusModal({
                show: true,
                type: 'success',
                title: 'Settings Saved',
                message: 'All changes have been securely synchronized with our servers.'
            });
        } catch (err) {
            console.error('Save error:', err);
            setStatusModal({
                show: true,
                type: 'error',
                title: 'Save Error',
                message: err.message || 'We could not save your changes at this time.'
            });
        } finally {
            setSaving(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setSettings({ ...settings, [name]: value });
    };

    if (loading) {
        return (
            <div className="py-20 text-center">
                <div className="w-10 h-10 border-4 border-brand-orange border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Loading Settings...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col text-left">
            <header className="mb-10 sm:mb-16 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-brand-darkText leading-tight">Family & Platform Settings</h1>
            </header>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-x-20 gap-y-12">
                {/* Left Column */}
                <div className="space-y-12">
                    <SettingGroup title="Family Profile">
                        <div className="flex flex-col sm:flex-row gap-8 items-start mb-6">
                            <div 
                                className="w-24 h-24 rounded-3xl bg-gray-50 dark:bg-brand-darkBg border-2 border-dashed border-gray-200 dark:border-brand-darkBorder flex items-center justify-center relative group cursor-pointer overflow-hidden shrink-0 transition-colors"
                                onClick={() => document.getElementById('logo-upload').click()}
                            >
                                {settings.logo_url ? (
                                    <img src={settings.logo_url} alt="Logo" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-[10px] font-black text-gray-400 group-hover:text-brand-orange text-center px-4 uppercase tracking-widest leading-tight">Upload Logo</span>
                                )}
                                <input 
                                    id="logo-upload"
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleLogoUpload}
                                />
                            </div>
                            <div className="flex-1 w-full space-y-6">
                                <SettingInput 
                                    label="Family Name" 
                                    name="family_name"
                                    placeholder="The Harrison Family" 
                                    value={settings.family_name}
                                    onChange={handleChange}
                                />
                                <SettingInput 
                                    label="Origin Location" 
                                    name="origin_location"
                                    placeholder="Ellis Island, NY / Chicago, IL" 
                                    value={settings.origin_location}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                        <div className="flex flex-col space-y-2 w-full">
                            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Family Description</label>
                            <textarea
                                name="description"
                                value={settings.description}
                                onChange={handleChange}
                                className="bg-white dark:bg-brand-darkCard border border-gray-100 dark:border-brand-darkBorder rounded-2xl py-4 px-6 text-sm font-medium text-gray-600 dark:text-brand-darkText placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-brand-orange/20 transition-all shadow-sm min-h-[140px] resize-none"
                                placeholder="A brief history and vision for our family tree..."
                            />
                        </div>
                    </SettingGroup>
                </div>

                {/* Right Column */}
                <div className="space-y-12">
                    <SettingGroup title="Registration & Privacy">
                        <div className="space-y-4">
                            <SelectField
                                label="Registration Rules"
                                name="registration_rules"
                                subtext="Who can invite/add new members"
                                options={['Admins Only', 'All Members', 'Verified Only']}
                                value={settings.registration_rules}
                                onChange={handleChange}
                            />

                            <SelectField
                                label="Default Visibility"
                                name="default_visibility"
                                subtext="New content default access"
                                options={['Family Only', 'Branch Only', 'Public']}
                                value={settings.default_visibility}
                                onChange={handleChange}
                            />
                        </div>
                    </SettingGroup>

                    <SettingGroup title="Notification Channels">
                        <p className="text-xs text-gray-400 font-medium -mt-2 mb-4 leading-relaxed">
                            These family-level switches gate delivery. Per-action email/push and recipients are configured on{' '}
                            <Link to="/policies" className="text-brand-orange font-bold hover:underline">Policies</Link>.
                            In-app alerts appear in the header bell.
                        </p>
                        <div className="space-y-4">
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Delivery</p>
                            <RadioButton
                                label="Email"
                                subtext="Allow SMTP email when Policies enable Email for an action"
                                active={!!settings.notifications.email}
                                onClick={() => toggleNotification('email')}
                            />
                            <RadioButton
                                label="App / Push"
                                subtext="Allow in-app inbox (bell) when Policies enable Push"
                                active={!!settings.notifications.push}
                                onClick={() => toggleNotification('push')}
                            />

                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 pt-4">Alert categories</p>
                            <RadioButton
                                label="Event Reminders"
                                subtext="New events and event reminders"
                                active={!!settings.notifications.events}
                                onClick={() => toggleNotification('events')}
                            />
                            <RadioButton
                                label="Governance Updates"
                                subtext="Branch/group and membership governance changes"
                                active={!!settings.notifications.governance}
                                onClick={() => toggleNotification('governance')}
                            />
                            <RadioButton
                                label="Registry Updates"
                                subtext="New members, profile / lineage, and content registry alerts"
                                active={!!settings.notifications.registry}
                                onClick={() => toggleNotification('registry')}
                            />
                            <RadioButton
                                label="Claim Request Alerts"
                                subtext="Lineage claim submissions and resolutions"
                                active={!!settings.notifications.claims}
                                onClick={() => toggleNotification('claims')}
                            />
                            <RadioButton
                                label="Abuse Report Alerts"
                                subtext="Content moderation / abuse reports"
                                active={!!settings.notifications.abuse}
                                onClick={() => toggleNotification('abuse')}
                            />
                            <RadioButton
                                label="Role-change Alerts"
                                subtext="Role assignments and permission changes"
                                active={!!settings.notifications.roles}
                                onClick={() => toggleNotification('roles')}
                            />
                            <RadioButton
                                label="Subscription Alerts"
                                subtext="Plan changes, renewals, and purchases"
                                active={!!settings.notifications.subscription}
                                onClick={() => toggleNotification('subscription')}
                            />
                        </div>
                        <Link
                            to="/policies"
                            className="inline-flex mt-6 text-[10px] font-black uppercase tracking-widest text-brand-orange hover:underline"
                        >
                            Open Notification Policies →
                        </Link>
                    </SettingGroup>

                    <SettingGroup title="Data Management">
                        <button 
                            onClick={handleExportData}
                            className="w-full flex items-center gap-4 px-8 py-6 bg-gray-50 dark:bg-brand-darkBg text-gray-500 rounded-2xl hover:bg-gray-100 transition-all group"
                        >
                            <div className="w-10 h-10 rounded-xl bg-white dark:bg-brand-darkCard flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                <Database className="w-5 h-5 text-gray-400 group-hover:text-brand-orange transition-colors" />
                            </div>
                            <div className="text-left">
                                <p className="text-xs font-black text-gray-700 dark:text-brand-darkText uppercase tracking-tighter">Export Family Data</p>
                                <p className="text-[10px] font-bold text-gray-400 mt-0.5">Download full archive (JSON/CSV)</p>
                            </div>
                        </button>
                    </SettingGroup>
                </div>
            </div>

            <div className="mt-16 pt-12 border-t border-gray-100 dark:border-brand-darkBorder flex justify-end">
                <button 
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full sm:w-auto bg-brand-orange text-white px-12 py-4 rounded-2xl font-bold shadow-lg shadow-brand-orange/20 hover:bg-orange-600 transform transition-all active:scale-95 uppercase text-xs tracking-widest disabled:opacity-50"
                >
                    {saving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
            {/* Status Modal */}
            {statusModal.show && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
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
        </div>
    );
};

export default Settings;
