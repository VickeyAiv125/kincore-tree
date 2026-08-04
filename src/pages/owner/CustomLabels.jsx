import React, { useState, useEffect } from 'react';
import Notification from '../../components/common/Notification';

const RoleRow = ({ systemRole = "", value = "", onChange }) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-10">
        <div>
            <label className="block text-xs font-black text-gray-900 dark:text-brand-darkText mb-3 ml-1">System Role</label>
            <div className="bg-[#F9FAFB] dark:bg-brand-darkBg border border-gray-100 dark:border-brand-darkBorder rounded-2xl p-4 h-[56px] flex items-center shadow-xs transition-colors">
                <input
                    type="text"
                    readOnly
                    value={systemRole}
                    className="w-full bg-transparent text-sm font-bold text-gray-400 dark:text-gray-500 outline-none"
                />
            </div>
        </div>
        <div>
            <label className="block text-xs font-black text-gray-900 dark:text-brand-darkText mb-3 ml-1">Custom Display Label</label>
            <div className="bg-white dark:bg-brand-darkCard border border-gray-100 dark:border-brand-darkBorder rounded-2xl p-4 h-[56px] flex items-center shadow-xs transition-all focus-within:ring-4 focus-within:ring-orange-50 dark:focus-within:ring-brand-orange/5 focus-within:border-brand-orange/20 dark:focus-within:border-brand-orange/40 group">
                <input
                    type="text"
                    placeholder="Add label"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full bg-transparent text-sm font-bold text-gray-800 dark:text-brand-darkText outline-none placeholder:text-gray-200 dark:placeholder:text-gray-600"
                />
            </div>
        </div>
    </div>
);

const CustomLabels = () => {
    const [labels, setLabels] = useState({
        owner: '',
        admin: '',
        branch_admin: '',
        member: ''
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [notification, setNotification] = useState({ message: '', type: 'success' });

    const systemRoles = [
        { key: 'owner', name: 'Family Owner' },
        { key: 'admin', name: 'Family Admin' },
        { key: 'branch_admin', name: 'Branch Admin' },
        { key: 'member', name: 'Member' }
    ];

    useEffect(() => {
        const fetchLabels = async () => {
            try {
                const user = JSON.parse(localStorage.getItem('user'));
                const token = localStorage.getItem('token');
                const baseUrl = import.meta.env.VITE_API_BASE_URL || `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}`;

                const response = await fetch(`${baseUrl}/families/${user.family_id}/custom-labels`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (response.ok) {
                    const data = await response.json();
                    const newLabels = { ...labels };
                    data.forEach(item => {
                        if (newLabels.hasOwnProperty(item.role_key)) {
                            newLabels[item.role_key] = item.custom_label;
                        }
                    });
                    setLabels(newLabels);
                }
            } catch (err) {
                console.error('Error fetching labels:', err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchLabels();
    }, []);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const token = localStorage.getItem('token');
            const baseUrl = import.meta.env.VITE_API_BASE_URL || `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}`;

            const payload = Object.keys(labels).map(key => ({
                role_key: key,
                custom_label: labels[key] || systemRoles.find(r => r.key === key).name
            }));

            const response = await fetch(`${baseUrl}/families/${user.family_id}/custom-labels`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ labels: payload })
            });

            if (response.ok) {
                setNotification({ message: 'Custom labels saved successfully!', type: 'success' });
            } else {
                throw new Error('Failed to save labels');
            }
        } catch (err) {
            setNotification({ message: 'Error saving labels.', type: 'error' });
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) return (
        <div className="flex items-center justify-center min-h-[40vh]">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-orange"></div>
        </div>
    );

    return (
        <div className="max-w-5xl mx-auto text-left py-4">
            <header className="mb-14 flex justify-between items-start">
                <div>
                    <h1 className="text-[32px] font-black text-gray-900 dark:text-brand-darkText leading-tight mb-3">Custom Role Labels</h1>
                    <p className="text-[11px] font-bold text-gray-400 dark:text-gray-500 leading-relaxed max-w-2xl">
                        Customize the display names for roles within your family governance platform. This allows you to use terms that resonate with your family's unique structure and traditions.
                    </p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-brand-orange text-white px-8 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-brand-orange/20 hover:bg-orange-600 transition-all active:scale-95 disabled:opacity-50"
                >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
            </header>

            <div className="space-y-4">
                {systemRoles.map(role => (
                    <RoleRow
                        key={role.key}
                        systemRole={role.name}
                        value={labels[role.key]}
                        onChange={(val) => setLabels(prev => ({ ...prev, [role.key]: val }))}
                    />
                ))}
            </div>

            <div className="mt-14 max-w-2xl">
                <p className="text-[10px] font-bold text-brand-orange leading-relaxed opacity-90">
                    Note: Custom display labels do not affect the underlying functional logic of the roles. They only change how the roles are displayed in the user interface.
                </p>
            </div>

            <Notification
                message={notification.message}
                type={notification.type}
                onClose={() => setNotification({ message: '', type: 'success' })}
            />
        </div>
    );
};

export default CustomLabels;
