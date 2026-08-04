import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, Calendar, Briefcase, FileText, Eye, MapPin, X, ArrowLeft, Plus, BookOpen, GraduationCap, Map, Heart } from 'lucide-react';

const API = import.meta.env.VITE_API_BASE_URL || `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}`;

const FormSection = ({ title, children }) => (
    <div className="bg-white dark:bg-brand-darkCard rounded-3xl border border-gray-100 dark:border-brand-darkBorder p-8 mb-8 shadow-sm transition-colors text-left">
        <h3 className="text-xl font-extrabold text-gray-900 dark:text-brand-darkText mb-8">{title}</h3>
        <div className="space-y-6">
            {children}
        </div>
    </div>
);

const PremiumInput = ({ label, placeholder, icon: Icon, type = "text", value, onChange, name }) => (
    <div className="space-y-2">
        <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] ml-1">{label}</label>
        <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white dark:bg-brand-darkCard rounded-2xl shadow-sm flex items-center justify-center group-focus-within:scale-110 transition-transform z-10">
                <Icon size={22} className="text-brand-orange" />
            </div>
            {type === "textarea" ? (
                <textarea
                    rows="4"
                    name={name}
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    className="w-full bg-gray-50 dark:bg-brand-darkBg/50 border-none rounded-[1.5rem] py-5 pl-[4.5rem] pr-8 text-sm font-bold text-gray-700 dark:text-brand-darkText outline-none focus:ring-4 focus:ring-brand-orange/5 transition-all resize-none"
                />
            ) : (
                <input
                    type={type}
                    name={name}
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    className="w-full bg-gray-50 dark:bg-brand-darkBg/50 border-none rounded-[1.5rem] py-5 pl-[4.5rem] pr-8 text-sm font-bold text-gray-700 dark:text-brand-darkText outline-none focus:ring-4 focus:ring-brand-orange/5 transition-all"
                />
            )}
        </div>
    </div>
);

const AddChild = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { target_person_id, target_name } = location.state || {};

    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        gender: 'Male',
        is_alive: true,
        date_of_birth: '',
        place_of_birth: '',
        anniversary_date: '',
        current_location: '',
        school_college: '',
        qualification: '',
        study_location: ''
    });

    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSave = async () => {
        if (!target_person_id) {
            alert('No parent selected. Please go back to the tree and select a member.');
            return;
        }

        if (!formData.first_name || !formData.last_name) {
            alert('Please enter first and last name.');
            return;
        }

        setLoading(true);
        try {
            const family_space_id = localStorage.getItem('selected_family_id') || JSON.parse(localStorage.getItem('user'))?.family_id;
            
            const res = await fetch(`${API}/clantree/add-child`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    ...formData,
                    family_space_id,
                    target_person_id
                })
            });

            if (!res.ok) throw new Error('Failed to add child');

            navigate('/owner/family-tree');
        } catch (err) {
            console.error(err);
            alert('Error adding child: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto text-left">
            <header className="mb-10 flex items-center justify-between">
                <div>
                    <h2 className="text-brand-orange text-[10px] font-black uppercase tracking-widest mb-1">Add Lineage to {target_name || 'Member'}</h2>
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-brand-darkText leading-tight">Add Child</h1>
                </div>
                <button onClick={() => navigate(-1)} className="p-4 bg-gray-50 dark:bg-brand-darkBg/50 rounded-2xl text-gray-400 hover:text-brand-orange transition-colors">
                    <X size={24} />
                </button>
            </header>

            <FormSection title="Basic Information">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <PremiumInput label="First Name" name="first_name" icon={User} placeholder="Enter first name" value={formData.first_name} onChange={handleChange} />
                    <PremiumInput label="Last Name" name="last_name" icon={User} placeholder="Enter last name" value={formData.last_name} onChange={handleChange} />
                </div>

                <div>
                    <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-4 ml-1">Gender Identity</label>
                    <div className="flex space-x-4">
                        {['Male', 'Female', 'Other'].map((g) => (
                            <button
                                key={g}
                                type="button"
                                onClick={() => setFormData(p => ({ ...p, gender: g }))}
                                className={`px-10 py-4 rounded-2xl text-xs font-black transition-all ${formData.gender === g ? 'bg-brand-orange text-white' : 'bg-gray-50 dark:bg-brand-darkBg text-gray-400 hover:bg-orange-50 dark:hover:bg-brand-orange/10 hover:text-brand-orange'}`}
                            >
                                {g}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex items-center justify-between p-6 bg-orange-50/30 dark:bg-brand-orange/5 rounded-[2rem] border border-orange-100/50 dark:border-brand-darkBorder transition-colors">
                    <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-white dark:bg-brand-darkCard rounded-2xl flex items-center justify-center shadow-sm">
                            <Eye className="text-brand-orange" size={20} />
                        </div>
                        <div>
                            <p className="text-sm font-black text-gray-900 dark:text-brand-darkText uppercase tracking-tight">Living Status</p>
                            <p className="text-[10px] font-bold text-gray-400 uppercase">Is the person still alive?</p>
                        </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" name="is_alive" className="sr-only peer" checked={formData.is_alive} onChange={handleChange} />
                        <div className="w-14 h-7 bg-gray-200 dark:bg-brand-darkBg peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-orange"></div>
                    </label>
                </div>

                <PremiumInput label="Date of Birth" name="date_of_birth" icon={Calendar} placeholder="MM/DD/YYYY" value={formData.date_of_birth} onChange={handleChange} />
            </FormSection>

            <FormSection title="Educational & Location Details">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <PremiumInput label="Place of Birth" name="place_of_birth" icon={MapPin} placeholder="Enter city, country" value={formData.place_of_birth} onChange={handleChange} />
                    <PremiumInput label="Anniversary Date" name="anniversary_date" icon={Calendar} placeholder="MM/DD/YYYY" value={formData.anniversary_date} onChange={handleChange} />
                </div>

                <PremiumInput label="Current Location" name="current_location" icon={Map} placeholder="Enter current address" value={formData.current_location} onChange={handleChange} />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <PremiumInput label="School & College" name="school_college" icon={BookOpen} placeholder="Enter school or college name" value={formData.school_college} onChange={handleChange} />
                    <PremiumInput label="Qualification" name="qualification" icon={GraduationCap} placeholder="Enter highest qualification" value={formData.qualification} onChange={handleChange} />
                </div>

                <PremiumInput label="Study Location" name="study_location" icon={MapPin} placeholder="Enter study location" value={formData.study_location} onChange={handleChange} />
            </FormSection>

            <div className="flex flex-col sm:flex-row gap-4 mt-12 mb-20 justify-end">
                <button
                    onClick={() => navigate(-1)}
                    className="w-full sm:w-auto px-10 py-4 rounded-2xl font-bold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-brand-darkBg hover:bg-gray-200 dark:hover:bg-brand-darkBorder transition-all uppercase text-sm tracking-widest"
                >
                    Cancel
                </button>
                <button
                    onClick={handleSave}
                    disabled={loading}
                    className="w-full sm:w-auto px-12 py-4 rounded-2xl font-bold text-white bg-brand-orange shadow-lg shadow-brand-orange/25 hover:bg-orange-600 active:scale-95 transition-all uppercase text-sm tracking-widest flex items-center justify-center disabled:opacity-50"
                >
                    {loading ? 'Adding...' : 'Save & Add Child'}
                </button>
            </div>
        </div>
    );
};

export default AddChild;
