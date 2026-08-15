import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, Mail, X } from 'lucide-react';
import { getTreeWebviewContext, navigateAfterTreeFormSave } from '../../utils/treeWebviewNav';

const API = import.meta.env.VITE_API_BASE_URL || `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}`;

const PremiumInput = ({ label, placeholder, icon: Icon, type = 'text', value, onChange, name }) => (
    <div className="space-y-2">
        <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] ml-1">{label}</label>
        <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white dark:bg-brand-darkCard rounded-2xl shadow-sm flex items-center justify-center group-focus-within:scale-110 transition-transform z-10">
                <Icon size={22} className="text-brand-orange" />
            </div>
            <input
                type={type}
                name={name}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                className="w-full bg-gray-50 dark:bg-brand-darkBg/50 border-none rounded-[1.5rem] py-5 pl-[4.5rem] pr-8 text-sm font-bold text-gray-700 dark:text-brand-darkText outline-none focus:ring-4 focus:ring-brand-orange/5 transition-all"
            />
        </div>
    </div>
);

const AddTreeMember = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { target_person_id, target_name, relationship_type: initialRelationship } = location.state || {};
    const { isAppView, spaceId, token } = getTreeWebviewContext();

    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        gender: 'Other',
        relationship_type: initialRelationship || 'member'
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        if (!target_person_id) {
            alert('No family member selected. Go back to the tree and choose a person.');
            return;
        }
        if (!formData.first_name || !formData.last_name) {
            alert('Please enter first and last name.');
            return;
        }

        setLoading(true);
        try {
            const family_space_id = spaceId
                || localStorage.getItem('selected_family_id')
                || JSON.parse(localStorage.getItem('user') || '{}')?.family_id;

            const res = await fetch(`${API}/clantree/add-member`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    ...formData,
                    family_space_id,
                    target_person_id,
                    relationship_type: formData.relationship_type || 'member'
                })
            });

            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.error || data.message || 'Failed to add member');

            if (isAppView) {
                navigateAfterTreeFormSave(navigate, spaceId, token);
            } else {
                navigate('/owner/family-tree');
            }
        } catch (err) {
            console.error(err);
            alert(`Error adding member: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto text-left p-6 min-h-screen bg-[#F9FAFB] dark:bg-brand-darkBg">
            <header className="mb-10 flex items-center justify-between">
                <div>
                    <h2 className="text-brand-orange text-[10px] font-black uppercase tracking-widest mb-1">
                        Add member to {target_name || 'Member'}
                    </h2>
                    <h1 className="text-3xl font-extrabold text-gray-900 dark:text-brand-darkText">Add Member</h1>
                </div>
                <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="p-4 bg-gray-50 dark:bg-brand-darkBg/50 rounded-2xl text-gray-400 hover:text-brand-orange transition-colors"
                >
                    <X size={24} />
                </button>
            </header>

            <div className="bg-white dark:bg-brand-darkCard rounded-3xl border border-gray-100 dark:border-brand-darkBorder p-8 mb-8 shadow-sm space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <PremiumInput label="First Name" name="first_name" icon={User} placeholder="First name" value={formData.first_name} onChange={handleChange} />
                    <PremiumInput label="Last Name" name="last_name" icon={User} placeholder="Last name" value={formData.last_name} onChange={handleChange} />
                </div>
                <PremiumInput label="Email" name="email" type="email" icon={Mail} placeholder="member@email.com (optional)" value={formData.email} onChange={handleChange} />
                <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 ml-1">Relationship</label>
                    <select
                        name="relationship_type"
                        value={formData.relationship_type}
                        onChange={handleChange}
                        className="w-full bg-gray-50 dark:bg-brand-darkBg/50 border-none rounded-[1.5rem] py-4 px-6 text-sm font-bold text-gray-700 dark:text-brand-darkText outline-none focus:ring-4 focus:ring-brand-orange/5"
                    >
                        <option value="member">Member</option>
                        <option value="spouse">Spouse</option>
                        <option value="child">Child</option>
                        <option value="sibling">Sibling</option>
                    </select>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-end mb-20">
                <button type="button" onClick={() => navigate(-1)} className="px-10 py-4 rounded-2xl font-bold text-gray-500 bg-gray-100 uppercase text-sm tracking-widest">
                    Cancel
                </button>
                <button
                    type="button"
                    onClick={handleSave}
                    disabled={loading}
                    className="px-12 py-4 rounded-2xl font-bold text-white bg-brand-orange shadow-lg uppercase text-sm tracking-widest disabled:opacity-50"
                >
                    {loading ? 'Adding...' : 'Save Member'}
                </button>
            </div>
        </div>
    );
};

export default AddTreeMember;
