import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBusiness } from '../../context/BusinessContext';
import {
    Building2,
    LayoutDashboard,
    Users,
    CreditCard,
    CheckCircle2,
    Upload,
    X,
    Search,
    ArrowRight,
    ArrowLeft,
    ShieldCheck,
    Globe,
    Mail,
    Phone,
    MapPin,
    AlertCircle
} from 'lucide-react';

const StepIndicator = ({ currentStep }) => {
    const steps = ['Branding', 'Summary', 'Staff', 'Billing', 'Active'];
    return (
        <div className="flex items-center justify-between mb-12 max-w-xl mx-auto w-full px-4">
            {steps.map((step, idx) => (
                <div key={step} className="flex flex-col items-center relative group">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all z-10 ${idx + 1 <= currentStep ? 'bg-brand-orange text-white shadow-lg shadow-brand-orange/20' : 'bg-gray-100 dark:bg-brand-darkBg text-gray-400 dark:text-gray-500'}`}>
                        {idx + 1 < currentStep ? <CheckCircle2 size={18} /> : idx + 1}
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-widest mt-3 transition-colors ${idx + 1 <= currentStep ? 'text-brand-orange' : 'text-gray-400 dark:text-gray-600'}`}>
                        {step}
                    </span>
                    {idx < steps.length - 1 && (
                        <div className={`absolute top-5 left-10 w-full h-[2px] -z-0 ${idx + 1 < currentStep ? 'bg-brand-orange' : 'bg-gray-100 dark:bg-brand-darkBg'}`} style={{ width: 'calc(100% * 2.5)' }} />
                    )}
                </div>
            ))}
        </div>
    );
};

const NewFamilySpace = () => {
    const navigate = useNavigate();
    const { spaceData, updateSpaceData, resetSpaceData } = useBusiness();
    const [step, setStep] = useState(1);
    const [logoPreview, setLogoPreview] = useState(null);
    const [validationError, setValidationError] = useState('');
    const [modalConfig, setModalConfig] = useState({ isOpen: false, type: 'success', title: '', message: '' });

    const handleLogoUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoPreview(reader.result);
                updateSpaceData({ logo: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    const nextStep = () => {
        setValidationError('');
        if (step === 1) {
            if (!spaceData.name || !spaceData.name.trim()) {
                setValidationError('Family Space Name is required.');
                return;
            }
            if (!spaceData.owner_id) {
                setValidationError('Assigning an Owner (Family Head) is required.');
                return;
            }
        }
        if (step === 2) {
            if (!spaceData.complianceConfirmed) {
                setValidationError('You must confirm compliance policies to proceed.');
                return;
            }
        }
        setStep(prev => Math.min(prev + 1, 5));
    };

    const prevStep = () => {
        setValidationError('');
        setStep(prev => Math.max(prev - 1, 1));
    };

    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                    <div className="space-y-8 animate-fadeIn">
                        <section className="space-y-6">
                            <div className="flex items-center space-x-3 mb-4">
                                <div className="p-2.5 bg-orange-50 dark:bg-brand-orange/10 rounded-xl text-brand-orange">
                                    <Building2 size={20} />
                                </div>
                                <h3 className="text-lg font-extrabold text-gray-900 dark:text-brand-darkText">Core Branding</h3>
                            </div>

                            <div className="space-y-1.5 text-left">
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest">Family Space Name *</label>
                                <input
                                    type="text"
                                    value={spaceData.name}
                                    onChange={(e) => updateSpaceData({ name: e.target.value })}
                                    className="w-full px-5 py-4 bg-gray-50 dark:bg-brand-darkBg border-none rounded-2xl text-sm font-bold text-gray-900 dark:text-brand-darkText focus:ring-2 focus:ring-brand-orange/20"
                                    placeholder="e.g. Windsor Global Enterprises"
                                />
                            </div>

                            <div className="space-y-1.5 text-left">
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest">Description</label>
                                <textarea
                                    rows={4}
                                    value={spaceData.description}
                                    onChange={(e) => updateSpaceData({ description: e.target.value })}
                                    className="w-full px-5 py-4 bg-gray-50 dark:bg-brand-darkBg border-none rounded-2xl text-sm font-bold text-gray-900 dark:text-brand-darkText focus:ring-2 focus:ring-brand-orange/20 resize-none"
                                    placeholder="What does this Family Space do?"
                                />
                            </div>

                            <div className="space-y-1.5 text-left">
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest">Assign Owner (Family Head) *</label>
                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                    <input
                                        type="text"
                                        placeholder="Search by name or email..."
                                        className="w-full pl-12 pr-5 py-4 bg-gray-50 dark:bg-brand-darkBg border-none rounded-2xl text-sm font-bold text-gray-900 dark:text-brand-darkText focus:ring-2 focus:ring-brand-orange/20"
                                        onChange={(e) => fetchUsers(e.target.value)}
                                    />
                                    {users.length > 0 && (
                                        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-brand-darkCard border border-gray-100 dark:border-brand-darkBorder rounded-2xl shadow-xl z-50 overflow-hidden max-h-48 overflow-y-auto">
                                            {users.map(u => (
                                                <div 
                                                    key={u.id} 
                                                    onClick={() => {
                                                        updateSpaceData({ owner_id: u.id, owner_name: `${u.first_name} ${u.last_name}` });
                                                        setUsers([]);
                                                    }}
                                                    className="p-4 hover:bg-orange-50 dark:hover:bg-brand-orange/5 cursor-pointer border-b border-gray-50 dark:border-brand-darkBorder last:border-none transition-colors"
                                                >
                                                    <p className="text-xs font-black text-gray-900 dark:text-brand-darkText">{u.first_name} {u.last_name}</p>
                                                    <p className="text-[10px] text-gray-400 font-bold uppercase">{u.email}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                {spaceData.owner_name && (
                                    <p className="mt-2 text-[10px] font-black text-brand-orange uppercase tracking-widest">Selected Owner: {spaceData.owner_name}</p>
                                )}
                            </div>

                            <div className="space-y-1.5 text-left">
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest">Family Space Logo</label>
                                <div className="flex items-center space-x-6 bg-gray-50 dark:bg-brand-darkBg p-6 rounded-3xl border-2 border-dashed border-gray-100 dark:border-brand-darkBorder">
                                    <div className="w-24 h-24 rounded-2xl bg-white dark:bg-brand-darkCard border border-gray-100 dark:border-brand-darkBorder flex items-center justify-center overflow-hidden flex-shrink-0">
                                        {logoPreview || spaceData.logo ? (
                                            <img src={logoPreview || spaceData.logo} alt="Logo" className="w-full h-full object-contain" />
                                        ) : (
                                            <Building2 size={32} className="text-gray-200" />
                                        )}
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase leading-tight">Recommended: Square PNG/SVG, max 2MB</p>
                                        <div className="flex space-x-3">
                                            <label className="cursor-pointer px-4 py-2 bg-white dark:bg-brand-darkCard border border-gray-200 dark:border-brand-darkBorder rounded-xl text-[10px] font-bold text-gray-700 dark:text-brand-darkText hover:bg-gray-50 transition-all">
                                                <span>Upload Logo</span>
                                                <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                                            </label>
                                            {(logoPreview || spaceData.logo) && (
                                                <button onClick={() => { setLogoPreview(null); updateSpaceData({ logo: null }); }} className="text-[10px] font-bold text-red-500 uppercase hover:underline">Remove</button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section section className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-left">
                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest">Category</label>
                                <select
                                    value={spaceData.category}
                                    onChange={(e) => updateSpaceData({ category: e.target.value })}
                                    className="w-full px-5 py-4 bg-gray-50 dark:bg-brand-darkBg border-none rounded-2xl text-sm font-bold text-gray-900 dark:text-brand-darkText focus:ring-2 focus:ring-brand-orange/20"
                                >
                                    <option value="">Select Category</option>
                                    <option value="Technology">Technology</option>
                                    <option value="Retail">Retail</option>
                                    <option value="Services">Services</option>
                                    <option value="Non-Profit">Non-Profit</option>
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest text-left">Country/Region</label>
                                <div className="relative">
                                    <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        value={spaceData.region}
                                        onChange={(e) => updateSpaceData({ region: e.target.value })}
                                        className="w-full pl-12 pr-5 py-4 bg-gray-50 dark:bg-brand-darkBg border-none rounded-2xl text-sm font-bold text-gray-900 dark:text-brand-darkText focus:ring-2 focus:ring-brand-orange/20"
                                        placeholder="e.g. London, UK"
                                    />
                                </div>
                            </div>
                        </section>
                    </div>
                );
            case 2:
                return (
                    <div className="space-y-8 animate-fadeIn text-left">
                        <section className="bg-orange-50/30 dark:bg-brand-orange/5 p-8 rounded-[2.5rem] border border-orange-100 dark:border-brand-orange/10">
                            <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-6 sm:space-y-0 sm:space-x-8">
                                <div className="w-32 h-32 rounded-3xl bg-white dark:bg-brand-darkCard border border-gray-100 dark:border-brand-darkBorder shadow-sm flex items-center justify-center flex-shrink-0 overflow-hidden">
                                    {spaceData.logo ? <img src={spaceData.logo} alt="Logo" className="w-full h-full object-contain" /> : <Building2 size={40} className="text-brand-orange/20" />}
                                </div>
                                <div className="flex-1 space-y-4 text-center sm:text-left">
                                    <div>
                                        <h2 className="text-2xl font-black text-gray-900 dark:text-brand-darkText tracking-tight">{spaceData.name || 'New Family Space'}</h2>
                                        <p className="text-xs font-black text-brand-orange uppercase tracking-widest mt-1">{spaceData.category || 'No Category'}</p>
                                    </div>
                                    <p className="text-sm font-bold text-gray-500 dark:text-gray-400 leading-relaxed max-w-lg">
                                        {spaceData.description || 'No description provided for this Family Space.'}
                                    </p>
                                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4">
                                        <div className="flex items-center space-x-2 text-[11px] font-bold text-gray-400 uppercase tracking-tight">
                                            <MapPin size={14} className="text-brand-orange" />
                                            <span>{spaceData.region || 'Not set'}</span>
                                        </div>
                                        <div className="flex items-center space-x-2 text-[11px] font-bold text-gray-400 uppercase tracking-tight">
                                            <ShieldCheck size={14} className="text-brand-orange" />
                                            <span>{spaceData.visibility}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="bg-white dark:bg-brand-darkCard p-6 rounded-3xl border border-gray-100 dark:border-brand-darkBorder space-y-4">
                                <div className="flex items-center space-x-3 text-brand-orange">
                                    <Mail size={16} />
                                    <span className="text-[11px] font-black uppercase tracking-widest">Contact Info</span>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-bold text-gray-400 uppercase">Email</p>
                                    <input
                                        type="email"
                                        value={spaceData.contactEmail}
                                        onChange={(e) => updateSpaceData({ contactEmail: e.target.value })}
                                        className="w-full px-3 py-2 bg-gray-50 dark:bg-brand-darkBg border border-gray-100 dark:border-brand-darkBorder rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-brand-orange/20 transition-all text-gray-900 dark:text-brand-darkText"
                                        placeholder="contact@email.com"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-bold text-gray-400 uppercase">Phone</p>
                                    <input
                                        type="tel"
                                        value={spaceData.contactPhone}
                                        onChange={(e) => updateSpaceData({ contactPhone: e.target.value })}
                                        className="w-full px-3 py-2 bg-gray-50 dark:bg-brand-darkBg border border-gray-100 dark:border-brand-darkBorder rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-brand-orange/20 transition-all text-gray-900 dark:text-brand-darkText"
                                        placeholder="+1 234 567 890"
                                    />
                                </div>
                            </div>
                            <div className="bg-white dark:bg-brand-darkCard p-6 rounded-3xl border border-gray-100 dark:border-brand-darkBorder flex flex-col justify-center">
                                <label className="flex items-center space-x-3 cursor-pointer group mb-1">
                                    <input
                                        type="checkbox"
                                        className="sr-only"
                                        checked={spaceData.complianceConfirmed}
                                        onChange={() => {
                                            setValidationError('');
                                            updateSpaceData({ complianceConfirmed: !spaceData.complianceConfirmed });
                                        }}
                                    />
                                    <div className={`w-6 h-6 rounded-lg border-2 transition-all flex items-center justify-center ${spaceData.complianceConfirmed ? 'border-brand-orange bg-brand-orange shadow-lg shadow-brand-orange/20' : 'border-gray-200 dark:border-brand-darkBorder'}`}>
                                        {spaceData.complianceConfirmed && <CheckCircle2 size={14} className="text-white" />}
                                    </div>
                                    <span className="text-xs font-black text-gray-900 dark:text-brand-darkText uppercase tracking-tight">Compliance Confirmed <span className="text-red-500">*</span></span>
                                </label>
                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest pl-9">I confirm this Family Space complies with all policies.</p>
                            </div>
                        </section>
                    </div>
                );
            case 3:
                return (
                    <div className="space-y-8 animate-fadeIn text-left">
                        <section className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2.5 bg-orange-50 dark:bg-brand-orange/10 rounded-xl text-brand-orange">
                                        <Users size={20} />
                                    </div>
                                    <h3 className="text-lg font-extrabold text-gray-900 dark:text-brand-darkText tracking-tight">Staff Invitations</h3>
                                </div>
                                <button
                                    onClick={() => updateSpaceData({ staff: [] })}
                                    className="text-[10px] font-black text-brand-orange uppercase tracking-widest hover:underline"
                                >
                                    Clear All
                                </button>
                            </div>

                            <div className="bg-gray-50 dark:bg-brand-darkBg p-6 rounded-[2rem] border-2 border-dashed border-gray-200 dark:border-brand-darkBorder">
                                <div className="relative mb-6">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="text"
                                        placeholder="Search users to invite..."
                                        className="w-full pl-12 pr-4 py-4 bg-white dark:bg-brand-darkCard border-none rounded-2xl text-sm font-bold text-gray-900 dark:text-brand-darkText shadow-sm focus:ring-2 focus:ring-brand-orange/20"
                                        onChange={(e) => fetchUsers(e.target.value, true)}
                                    />
                                    {staffSearchUsers.length > 0 && (
                                        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-brand-darkCard border border-gray-100 dark:border-brand-darkBorder rounded-2xl shadow-xl z-50 overflow-hidden max-h-48 overflow-y-auto">
                                            {staffSearchUsers.map(u => (
                                                <div 
                                                    key={u.id} 
                                                    onClick={() => {
                                                        const exists = spaceData.staff.some(s => s.id === u.id);
                                                        if (!exists) {
                                                            const newStaff = { id: u.id, name: `${u.first_name} ${u.last_name}`, role: 'Admin' };
                                                            updateSpaceData({ staff: [...(spaceData.staff || []), newStaff] });
                                                        }
                                                        setStaffSearchUsers([]);
                                                    }}
                                                    className="p-4 hover:bg-orange-50 dark:hover:bg-brand-orange/5 cursor-pointer border-b border-gray-50 dark:border-brand-darkBorder last:border-none transition-colors"
                                                >
                                                    <p className="text-xs font-black text-gray-900 dark:text-brand-darkText">{u.first_name} {u.last_name}</p>
                                                    <p className="text-[10px] text-gray-400 font-bold uppercase">{u.email}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-3">
                                    {(spaceData.staff || []).map(member => (
                                        <div key={member.id} className="flex items-center justify-between p-4 bg-white dark:bg-brand-darkCard rounded-2xl shadow-sm group hover:scale-[1.01] transition-all">
                                            <div className="flex items-center space-x-4">
                                                <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-brand-orange/10 flex items-center justify-center text-brand-orange font-black text-xs">
                                                    {member.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-gray-900 dark:text-brand-darkText">{member.name}</p>
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Added Staff</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <select
                                                    value={member.role}
                                                    onChange={(e) => {
                                                        const updatedStaff = spaceData.staff.map(s => s.id === member.id ? { ...s, role: e.target.value } : s);
                                                        updateSpaceData({ staff: updatedStaff });
                                                    }}
                                                    className="text-[10px] font-black uppercase tracking-widest bg-gray-50 dark:bg-brand-darkBg px-3 py-1.5 rounded-lg border-none focus:ring-1 focus:ring-brand-orange/20 outline-none"
                                                >
                                                    <option>Admin</option>
                                                    <option>Manager</option>
                                                    <option>Editor</option>
                                                </select>
                                                <button
                                                    onClick={() => {
                                                        const updatedStaff = spaceData.staff.filter(s => s.id !== member.id);
                                                        updateSpaceData({ staff: updatedStaff });
                                                    }}
                                                    className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                                                >
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    {(!spaceData.staff || spaceData.staff.length === 0) && (
                                        <div className="py-8 text-center">
                                            <Users size={32} className="mx-auto text-gray-200 mb-2" />
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest leading-relaxed">
                                                No staff invited yet.<br />Use the search bar above to add members.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </section>
                    </div>
                );
            case 4:
                return (
                    <div className="space-y-8 animate-fadeIn text-left">
                        <section className="bg-brand-orange/5 p-8 rounded-[2.5rem] border border-brand-orange/10 text-center space-y-6">
                            <div className="w-20 h-20 bg-brand-orange text-white rounded-3xl mx-auto flex items-center justify-center shadow-xl shadow-brand-orange/30">
                                <CreditCard size={40} />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-2xl font-black text-gray-900 dark:text-brand-darkText tracking-tight">Family Space Credits & Billing</h3>
                                <p className="text-sm font-bold text-gray-500 dark:text-gray-400 max-w-sm mx-auto leading-relaxed">
                                    Configure the initial subscription tier for this Family Space.
                                </p>
                            </div>

                            <div className="pt-4 border-t border-gray-100 dark:border-brand-darkBorder/50 max-w-md mx-auto grid grid-cols-3 gap-4">
                                {[
                                    { id: 'free', name: 'Free', bytes: 524288000, desc: '500 MB' },
                                    { id: 'standard', name: 'Standard', bytes: 5368709120, desc: '5 GB' },
                                    { id: 'premium', name: 'Premium', bytes: 53687091200, desc: '50 GB' }
                                ].map(plan => (
                                    <button
                                        key={plan.id}
                                        onClick={() => updateSpaceData({ 
                                            subscription_tier: plan.id, 
                                            storage_quota_bytes: plan.bytes 
                                        })}
                                        className={`p-4 rounded-2xl border-2 text-center transition-all ${
                                            (spaceData.subscription_tier || 'free') === plan.id 
                                            ? 'border-brand-orange bg-white shadow-md' 
                                            : 'border-transparent bg-white/50 hover:bg-white hover:border-gray-200'
                                        }`}
                                    >
                                        <h4 className="text-sm font-black text-gray-900 uppercase tracking-tight mb-1">{plan.name}</h4>
                                        <p className="text-[10px] font-bold text-brand-orange uppercase">{plan.desc}</p>
                                    </button>
                                ))}
                            </div>
                        </section>

                        <div className="bg-gray-50 dark:bg-brand-darkBg p-6 rounded-3xl border border-gray-100 dark:border-brand-darkBorder flex items-start space-x-4">
                            <div className="p-2 bg-blue-50 dark:bg-blue-900/10 rounded-xl text-blue-500">
                                <AlertCircle size={20} />
                            </div>
                            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 leading-relaxed">
                                Tip: Most Family Spaces start with a <span className="text-gray-900 dark:text-brand-darkText">Standard Plan</span> and adjust their storage quotas after publication.
                            </p>
                        </div>
                    </div>
                );
            case 5:
                return (
                    <div className="space-y-8 animate-fadeIn text-center">
                        <div className="py-12 px-8 space-y-6">
                            <div className="relative inline-block">
                                <div className="absolute inset-0 bg-green-400 blur-2xl opacity-20 animate-pulse" />
                                <div className="w-24 h-24 bg-green-500 text-white rounded-[2rem] flex items-center justify-center relative shadow-2xl shadow-green-500/30">
                                    <Globe size={48} />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <h2 className="text-3xl font-black text-gray-900 dark:text-brand-darkText tracking-tight">Ready to Publish?</h2>
                                <p className="text-sm font-bold text-gray-500 dark:text-gray-400 max-w-md mx-auto leading-relaxed">
                                    Your Family Space "{spaceData.name}" is fully configured. Publishing it will make it {spaceData.visibility === 'Listed on marketplace' ? 'active on the global marketplace' : 'visible to your internal team'}.
                                </p>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-brand-darkCard p-8 rounded-[2.5rem] border border-gray-100 dark:border-brand-darkBorder text-left space-y-8 shadow-sm">
                            <h4 className="text-[10px] font-black text-brand-orange uppercase tracking-[.25em] mb-4">Final Visibility Settings</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {['Private (internal only)', 'Listed on marketplace'].map(option => (
                                    <button
                                        key={option}
                                        onClick={() => updateSpaceData({ visibility: option })}
                                        className={`p-6 rounded-3xl border-2 text-left transition-all ${spaceData.visibility === option ? 'border-brand-orange bg-orange-50/50 dark:bg-brand-orange/5' : 'border-gray-50 dark:border-brand-darkBorder hover:border-gray-200'}`}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <span className={`text-[11px] font-black uppercase tracking-tight ${spaceData.visibility === option ? 'text-brand-orange' : 'text-gray-400'}`}>{option}</span>
                                            {spaceData.visibility === option && <CheckCircle2 className="w-4 h-4 text-brand-orange" />}
                                        </div>
                                        <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase leading-relaxed">{option === 'Private (internal only)' ? 'Visible only to staff members.' : 'Open to everyone in the ecosystem.'}</p>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    const [users, setUsers] = useState([]);
    const [staffSearchUsers, setStaffSearchUsers] = useState([]);

    const handleCreate = async () => {
        setValidationError('');
        if (!spaceData.name || !spaceData.name.trim()) {
            setValidationError('Family Space Name is required.');
            setStep(1);
            return;
        }
        if (!spaceData.owner_id) {
            setValidationError('Assigning an Owner (Family Head) is required.');
            setStep(1);
            return;
        }
        if (!spaceData.complianceConfirmed) {
            setValidationError('You must confirm compliance policies.');
            setStep(2);
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/admin/business/spaces`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: spaceData.name,
                    description: spaceData.description,
                    owner_id: spaceData.owner_id,
                    category: spaceData.category,
                    region: spaceData.region,
                    contact_email: spaceData.contactEmail,
                    contact_phone: spaceData.contactPhone,
                    visibility: spaceData.visibility,
                    staff: spaceData.staff, // [{ id, role }]
                    subscription_tier: spaceData.subscription_tier || 'free',
                    storage_quota_bytes: spaceData.storage_quota_bytes || 524288000
                })
            });

            if (response.ok) {
                setModalConfig({
                    isOpen: true,
                    type: 'success',
                    title: 'Published!',
                    message: 'Family Space has been created and published successfully.'
                });
            } else {
                const err = await response.json();
                setModalConfig({
                    isOpen: true,
                    type: 'error',
                    title: 'Creation Failed',
                    message: err.error || 'Failed to create the Family Space.'
                });
            }
        } catch (err) {
            console.error('Failed to create space:', err);
            setModalConfig({
                isOpen: true,
                type: 'error',
                title: 'Server Error',
                message: 'A network or server error occurred.'
            });
        }
    };

    const fetchUsers = async (query, isStaff = false) => {
        if (!query) return;
        const token = localStorage.getItem('token');
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}`}/admin/users?search=${query}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (isStaff) {
            setStaffSearchUsers(data.users || []);
        } else {
            setUsers(data.users || []);
        }
    };

    const FeedbackModal = () => {
        if (!modalConfig.isOpen) return null;
        return (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
                <div className="bg-white dark:bg-brand-darkCard rounded-[2.5rem] border border-gray-100 dark:border-brand-darkBorder p-8 max-w-sm w-full mx-4 text-center space-y-6 shadow-2xl animate-in zoom-in-95 duration-200">
                    <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center bg-gray-50 dark:bg-brand-darkBg">
                        {modalConfig.type === 'success' ? (
                            <CheckCircle2 className="w-8 h-8 text-green-500" />
                        ) : (
                            <AlertCircle className="w-8 h-8 text-red-500" />
                        )}
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-xl font-black text-gray-900 dark:text-brand-darkText uppercase tracking-tight italic">
                            {modalConfig.title}
                        </h3>
                        <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide leading-relaxed">
                            {modalConfig.message}
                        </p>
                    </div>
                    <button
                        onClick={() => {
                            const wasSuccess = modalConfig.type === 'success';
                            setModalConfig(prev => ({ ...prev, isOpen: false }));
                            if (wasSuccess) {
                                resetSpaceData();
                                navigate('/business/family-spaces');
                            }
                        }}
                        className={`w-full py-4 rounded-[2rem] font-black text-white text-xs uppercase tracking-widest transition-all active:scale-95 shadow-lg ${
                            modalConfig.type === 'success'
                                ? 'bg-green-500 shadow-green-500/20 hover:bg-green-600'
                                : 'bg-red-500 shadow-red-500/20 hover:bg-red-600'
                        }`}
                    >
                        Dismiss
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="flex flex-col min-h-[calc(100vh-100px)] max-w-2xl mx-auto w-full pb-20">
            <header className="mb-10 text-left">
                <div className="flex items-center space-x-2 mb-1">
                    <h2 className="text-gray-900 dark:text-brand-darkText text-sm font-bold opacity-30 dark:opacity-40 uppercase tracking-widest leading-none">Business Hub</h2>
                    <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700" />
                    <h2 className="text-gray-900 dark:text-brand-darkText text-sm font-bold opacity-30 dark:opacity-40 uppercase tracking-widest leading-none">Family Space</h2>
                </div>
                <h1 className="text-3xl font-extrabold text-gray-900 dark:text-brand-darkText flex items-center tracking-tight">
                    {step === 5 ? 'Release to Marketplace' : 'New Family Space'}
                </h1>
            </header>

            <StepIndicator currentStep={step} />

            <div className="bg-white dark:bg-brand-darkCard rounded-[3rem] border border-gray-100 dark:border-brand-darkBorder shadow-sm p-8 sm:p-12 flex-1 mb-8 overflow-hidden">
                {renderStep()}
            </div>

            {validationError && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 text-red-500 rounded-2xl flex items-center space-x-3 text-xs font-bold uppercase tracking-wider animate-in slide-in-from-bottom-2 duration-300">
                    <AlertCircle size={16} className="flex-shrink-0" />
                    <span>{validationError}</span>
                </div>
            )}

            {/* Actions */}
            <div className="sticky bottom-0 left-0 right-0 sm:static bg-white/90 dark:bg-brand-darkCard/90 backdrop-blur-md sm:bg-transparent border-t border-gray-100 dark:border-brand-darkBorder sm:border-none p-4 mt-2 flex flex-col-reverse sm:flex-row justify-end gap-3 z-30">
                {step > 1 && (
                    <button
                        onClick={prevStep}
                        className="w-full sm:w-auto px-10 py-4 rounded-[2rem] font-bold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-brand-darkBg hover:bg-gray-200 dark:hover:bg-brand-darkBorder transition-all uppercase text-xs tracking-widest flex items-center justify-center"
                    >
                        <ArrowLeft size={16} className="mr-2" /> Back
                    </button>
                )}
                <button
                    onClick={() => navigate('/business/family-spaces')}
                    className="w-full sm:w-auto px-10 py-4 rounded-[2rem] font-bold text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-brand-darkBg hover:bg-gray-100 dark:hover:bg-brand-darkBorder transition-all uppercase text-xs tracking-widest"
                >
                    Cancel
                </button>
                <button
                    onClick={step === 5 ? handleCreate : nextStep}
                    className="w-full sm:w-auto px-12 py-4 rounded-[2rem] font-black text-white bg-brand-orange shadow-xl shadow-brand-orange/30 hover:bg-orange-600 active:scale-95 transition-all uppercase text-xs tracking-widest flex items-center justify-center group"
                >
                    {step === 5 ? 'Publish & Activate' : 'Continue'} <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </button>
            </div>

            <FeedbackModal />
        </div>
    );
};

export default NewFamilySpace;
