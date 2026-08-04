import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, GitBranch, Layers, Shield, X, ArrowRight, ArrowLeft, Info, CheckCircle2 } from 'lucide-react';

const PremiumInput = ({ label, placeholder, icon: Icon, value, onChange, type = "text", error, required }) => (
    <div className="space-y-2 mb-8 text-left">
        <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] ml-1">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white dark:bg-brand-darkCard rounded-2xl shadow-sm flex items-center justify-center group-focus-within:scale-110 transition-transform z-10">
                <Icon size={22} className="text-brand-orange" />
            </div>
            <input
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                className={`w-full bg-gray-50 dark:bg-brand-darkBg/50 border-none rounded-[1.5rem] py-5 pl-[4.5rem] pr-8 text-sm font-bold text-gray-700 dark:text-brand-darkText outline-none focus:ring-4 ${error ? 'focus:ring-red-400/20 ring-1 ring-red-400' : 'focus:ring-brand-orange/5'} transition-all`}
            />
        </div>
        {error && <p className="text-[10px] font-bold text-red-500 uppercase tracking-tight ml-1">{error}</p>}
    </div>
);

const EditLineage = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: 'Owen Harper',
        branch: 'North',
        generation: '2nd',
        parentName: 'Arthur Harper',
        status: 'Active'
    });
    const [errors, setErrors] = useState({});

    const handleSave = () => {
        const newErrors = {};
        if (!formData.name) newErrors.name = 'Full name is required';
        if (!formData.branch) newErrors.branch = 'Branch is required';
        if (!formData.generation) newErrors.generation = 'Generation is required';
        if (!formData.parentName) newErrors.parentName = 'Parent name is required';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        alert('Lineage Updated Successfully!');
        navigate('/member-registry');
    };

    return (
        <div className="max-w-3xl mx-auto py-4">
            <header className="mb-10 flex items-center justify-between text-left">
                <div>
                    <h2 className="text-brand-orange text-[10px] font-black uppercase tracking-widest mb-1">Administrative Action</h2>
                    <h1 className="text-3xl font-extrabold text-gray-900 dark:text-brand-darkText">Edit Member Lineage</h1>
                </div>
                <button
                    onClick={() => navigate('/member-registry')}
                    className="p-4 bg-gray-50 dark:bg-brand-darkBg/50 rounded-2xl text-gray-400 hover:text-brand-orange transition-colors"
                >
                    <X size={24} />
                </button>
            </header>

            <div className="bg-white dark:bg-brand-darkCard rounded-[3rem] border border-gray-100 dark:border-brand-darkBorder shadow-sm p-10 space-y-12 mb-8">

                {/* Visual ID */}
                <div className="flex items-center space-x-6 pb-12 border-b border-gray-50 dark:border-brand-darkBorder">
                    <div className="w-24 h-24 rounded-[2rem] bg-orange-50 dark:bg-brand-orange/10 border-4 border-white dark:border-brand-darkBorder shadow-xl flex items-center justify-center overflow-hidden">
                        <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Owen" alt="Avatar" className="w-full h-full object-cover" />
                    </div>
                    <div className="text-left">
                        <h3 className="text-2xl font-black text-gray-900 dark:text-brand-darkText uppercase tracking-tight">{formData.name}</h3>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">ID: REG-7829-KINC</p>
                    </div>
                </div>

                {/* Form Fields */}
                <div className="space-y-2">
                    <PremiumInput
                        label="Member Name"
                        icon={User}
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        error={errors.name}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <PremiumInput
                            label="Ancestral Branch"
                            icon={GitBranch}
                            value={formData.branch}
                            onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                            required
                            error={errors.branch}
                        />
                        <PremiumInput
                            label="Ancestral Generation"
                            icon={Layers}
                            value={formData.generation}
                            onChange={(e) => setFormData({ ...formData, generation: e.target.value })}
                            required
                            error={errors.generation}
                        />
                    </div>

                    <PremiumInput
                        label="Official Parent Name"
                        icon={User}
                        value={formData.parentName}
                        onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                        required
                        error={errors.parentName}
                    />

                    <div className="space-y-4 mb-4 text-left">
                        <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] ml-1">Active Status</label>
                        <div className="flex flex-wrap gap-4">
                            {['Active', 'Inactive'].map(status => (
                                <button
                                    key={status}
                                    onClick={() => setFormData({ ...formData, status })}
                                    className={`flex-1 flex items-center justify-between px-6 py-4 rounded-2xl border transition-all ${formData.status === status ? 'border-brand-orange bg-orange-50 dark:bg-brand-orange/10' : 'border-gray-100 dark:border-brand-darkBorder bg-white dark:bg-brand-darkCard'}`}
                                >
                                    <span className={`text-sm font-black uppercase tracking-tight ${formData.status === status ? 'text-gray-900 dark:text-brand-darkText' : 'text-gray-400'}`}>{status}</span>
                                    {formData.status === status && <CheckCircle2 className="text-brand-orange" size={18} />}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="p-6 bg-orange-50/30 dark:bg-brand-orange/5 rounded-[2rem] border border-orange-100/50 dark:border-brand-darkBorder flex items-start space-x-4">
                        <Info className="text-brand-orange shrink-0 mt-1" size={20} />
                        <p className="text-xs font-bold text-gray-500 dark:text-gray-400 leading-relaxed text-left">
                            Editing these fields will update the administrative registry and clan tree hierarchy. Ensure you have primary source verification for lineage changes.
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mb-20 justify-end">
                <button
                    onClick={() => navigate('/member-registry')}
                    className="w-full sm:w-auto px-10 py-4 rounded-2xl font-bold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-brand-darkBg hover:bg-gray-200 dark:hover:bg-brand-darkBorder transition-all uppercase text-sm tracking-widest"
                >
                    Cancel
                </button>
                <button
                    onClick={handleSave}
                    className="w-full sm:w-auto px-14 py-4 rounded-2xl font-bold text-white bg-brand-orange shadow-lg shadow-brand-orange/25 hover:bg-orange-600 active:scale-95 transition-all uppercase text-sm tracking-widest flex items-center justify-center gap-2"
                >
                    Update Registry <ArrowRight size={18} />
                </button>
            </div>
        </div>
    );
};

export default EditLineage;
