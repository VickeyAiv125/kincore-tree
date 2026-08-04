import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Notification from '../../components/common/Notification';
import {
    UserPlus,
    Search,
    User,
    Link2,
    Mail,
    Phone,
    ShieldCheck,
    ChevronDown,
    X,
    CheckCircle2,
    Info,
    ArrowRight,
    Users,
    Save,
    Camera,
    Skull,
    Heart,
    History,
    CalendarDays,
    Loader2,
    Upload
} from 'lucide-react';

const InputField = ({ label, placeholder, type = "text", icon: Icon, value, onChange, error, required = false, helperText }) => (
    <div className="space-y-1.5 mb-6 text-left">
        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <div className="relative">
            {Icon && (
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Icon className="h-4 w-4 text-gray-400" />
                </div>
            )}
            <input
                type={type}
                value={value}
                onChange={onChange}
                className={`block w-full ${Icon ? 'pl-11' : 'px-4'} py-3.5 bg-[#F3F4F6]/50 dark:bg-brand-darkBg/50 border ${error ? 'border-red-400' : 'border-transparent'} rounded-2xl focus:ring-2 focus:ring-brand-orange/20 text-gray-900 dark:text-brand-darkText font-medium transition-all text-sm`}
                placeholder={placeholder}
            />
        </div>
        {helperText && <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight mt-1">{helperText}</p>}
        {error && <p className="text-[10px] font-bold text-red-500 uppercase tracking-tight">{error}</p>}
    </div>
);

const SelectField = ({ label, options, value, onChange, icon: Icon, placeholder }) => (
    <div className="space-y-1.5 mb-6 text-left">
        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{label}</label>
        <div className="relative">
            {Icon && (
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Icon className="h-4 w-4 text-gray-400" />
                </div>
            )}
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className={`block w-full ${Icon ? 'pl-11' : 'px-4'} py-3.5 bg-[#F3F4F6]/50 dark:bg-brand-darkBg/50 border border-transparent rounded-2xl focus:ring-2 focus:ring-brand-orange/20 text-gray-900 dark:text-brand-darkText font-medium transition-all text-sm appearance-none`}
            >
                <option value="" disabled>{placeholder}</option>
                {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                <ChevronDown className="h-4 w-4 text-gray-400" />
            </div>
        </div>
    </div>
);

const SearchSelect = ({ label, placeholder, selectedValue, onSelect, required = false }) => {
    const [isFocused, setIsFocused] = useState(false);
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const searchTimeout = useRef(null);

    const handleSearch = async (val) => {
        setQuery(val);
        if (searchTimeout.current) clearTimeout(searchTimeout.current);
        if (val.length < 2) { setResults([]); return; }

        setSearching(true);
        searchTimeout.current = setTimeout(async () => {
            try {
                const token = localStorage.getItem('token');
                const baseUrl = import.meta.env.VITE_API_BASE_URL || `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}`;
                const user = JSON.parse(localStorage.getItem('user'));
                const branchId = user?.branch_id || '6b8eb992-571f-4637-b031-a56007560cad';

                const response = await fetch(`${baseUrl}/admin/branch/search?query=${val}&branchId=${branchId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await response.json();
                setResults(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error('>>> [SEARCH_ERROR]', err);
            } finally {
                setSearching(false);
            }
        }, 500);
    };

    return (
        <div className="space-y-1.5 mb-6 text-left relative">
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search className={`h-4 w-4 ${searching ? 'animate-pulse text-brand-orange' : 'text-gray-400'}`} />
                </div>
                <input
                    type="text"
                    value={selectedValue ? selectedValue.name : query}
                    onChange={(e) => !selectedValue && handleSearch(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                    className="block w-full pl-11 pr-10 py-3.5 bg-[#F3F4F6]/50 dark:bg-brand-darkBg/50 border border-transparent rounded-2xl focus:ring-2 focus:ring-brand-orange/20 text-gray-900 dark:text-brand-darkText font-medium transition-all text-sm"
                    placeholder={placeholder}
                    readOnly={!!selectedValue}
                />
                {selectedValue && (
                    <button 
                        onClick={() => { onSelect(null); setQuery(''); }}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-brand-orange hover:text-red-500 transition-colors"
                    >
                        <X size={16} />
                    </button>
                )}
            </div>
            {isFocused && query.length >= 2 && !selectedValue && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-brand-darkCard border border-gray-100 dark:border-brand-darkBorder rounded-2xl shadow-xl z-50 p-2 animate-fadeIn max-h-60 overflow-y-auto">
                    {results.map(person => (
                        <button
                            key={person.id}
                            onClick={() => { onSelect(person); setIsFocused(false); setQuery(''); }}
                            className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-brand-darkBg rounded-xl transition-colors flex items-center space-x-3"
                        >
                            <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-brand-orange/10 flex items-center justify-center text-brand-orange overflow-hidden">
                                {person.avatar ? <img src={person.avatar} className="w-full h-full object-cover" /> : <User size={14} />}
                            </div>
                            <span className="text-sm font-bold text-gray-700 dark:text-brand-darkText">{person.name}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

const BranchEditMember = () => {
    const navigate = useNavigate();
    const { memberId } = useParams();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [notification, setNotification] = useState({ message: '', type: 'success' });
    const fileInputRef = useRef(null);

    const [formData, setFormData] = useState({
        name: '',
        chineseName: '',
        gender: '',
        birthYear: '',
        deathYear: '',
        isLiving: true,
        father: null,
        mother: null,
        spouse: null,
        children: [],
        relationshipType: 'Direct Descent',
        biography: '',
        photo: null,
        email: '',
        phone: '',
        memberType: 'Member'
    });

    useEffect(() => {
        const fetchMember = async () => {
            try {
                const token = localStorage.getItem('token');
                const baseUrl = import.meta.env.VITE_API_BASE_URL || `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}`;
                const response = await fetch(`${baseUrl}/admin/branch/member/${memberId}?_t=${Date.now()}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const member = await response.json();
                if (member && !member.error) {
                    setFormData({
                        ...formData,
                        name: member.name,
                        chineseName: member.chineseName || '',
                        gender: member.gender ? member.gender.charAt(0).toUpperCase() + member.gender.slice(1).toLowerCase() : 'Male',
                        birthYear: member.dob !== '-' ? member.dob : '',
                        deathYear: member.dod || '',
                        isLiving: !member.dod,
                        biography: member.bio || '',
                        photo: member.avatar,
                        memberType: member.role,
                        father: member.father,
                        mother: member.mother,
                        spouse: member.spouse,
                        children: member.children || [],
                        email: member.email || '',
                        phone: member.phone || ''
                    });
                }
                setLoading(false);
            } catch (err) {
                setLoading(false);
            }
        };
        fetchMember();
    }, [memberId]);

    const handlePhotoChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        try {
            const token = localStorage.getItem('token');
            const baseUrl = import.meta.env.VITE_API_BASE_URL || `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}`;
            
            const body = new FormData();
            body.append('photo', file);
            body.append('memberId', memberId);

            const response = await fetch(`${baseUrl}/admin/branch/upload-photo`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body
            });

            if (!response.ok) throw new Error('Photo upload failed');
            const data = await response.json();
            setFormData(prev => ({ ...prev, photo: data.url }));
            setNotification({ message: 'Profile photo updated successfully!', type: 'success' });
        } catch (err) {
            setNotification({ message: 'Error uploading photo: ' + err.message, type: 'error' });
        } finally {
            setUploading(false);
        }
    };

    const handleUpdate = async () => {
        if (!formData.name) {
            setNotification({ message: 'Full Name is required', type: 'error' });
            return;
        }
        setSaving(true);
        try {
            const token = localStorage.getItem('token');
            const baseUrl = import.meta.env.VITE_API_BASE_URL || `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}`;
            const payload = {
                fullName: formData.name,
                chineseName: formData.chineseName,
                gender: formData.gender.toLowerCase(),
                birthDate: formData.birthYear ? `${formData.birthYear}-01-01` : null,
                deathDate: !formData.isLiving && formData.deathYear ? `${formData.deathYear}-01-01` : null,
                bio: formData.biography,
                email: formData.email,
                phone: formData.phone,
                fatherId: formData.father?.id,
                motherId: formData.mother?.id,
                spouseId: formData.spouse?.id,
                childrenIds: formData.children.map(c => c.id),
                avatarUrl: formData.photo
            };
            const response = await fetch(`${baseUrl}/admin/branch/members/update/${memberId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(payload)
            });
            if (!response.ok) throw new Error('Failed to update member');
            setNotification({ message: 'Member profile updated successfully!', type: 'success' });
            setTimeout(() => navigate('/branch/members'), 1500);
        } catch (err) {
            setNotification({ message: 'Error updating member: ' + err.message, type: 'error' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="animate-spin text-brand-orange" size={40} /></div>;

    return (
        <div className="flex flex-col min-h-[calc(100vh-100px)] max-w-2xl mx-auto w-full px-4 sm:px-0">
            <Notification 
                message={notification.message} 
                type={notification.type} 
                onClose={() => setNotification({ message: '', type: 'success' })} 
            />

            <header className="mb-10 text-left flex justify-between items-end pt-6">
                <div>
                    <h2 className="text-gray-900 dark:text-brand-darkText text-sm font-bold opacity-30 dark:opacity-40 mb-1 uppercase tracking-widest">Branch Admin</h2>
                    <h1 className="text-3xl font-extrabold text-gray-900 dark:text-brand-darkText leading-tight">Edit Member Profile</h1>
                </div>
                <button onClick={() => navigate('/branch/members')} className="p-3 bg-gray-50 dark:bg-brand-darkBg/50 rounded-2xl text-gray-400 hover:text-brand-orange transition-colors mb-1"><X size={20} /></button>
            </header>

            <div className="bg-white dark:bg-brand-darkCard rounded-3xl border border-gray-100 dark:border-brand-darkBorder shadow-sm p-6 sm:p-10 flex-1 space-y-12 mb-8 text-left">
                {/* Profile Basics */}
                <section>
                    <div className="flex items-center space-x-3 mb-8"><div className="w-10 h-10 bg-orange-50 dark:bg-brand-orange/10 rounded-xl flex items-center justify-center text-brand-orange"><User size={20} /></div><h3 className="text-lg font-extrabold text-gray-900 dark:text-brand-darkText tracking-tight">Profile Basics</h3></div>
                    <div className="space-y-8 animate-fadeIn">
                        {/* Photo Edit UI with S3 Upload */}
                        <div className="flex items-center gap-6 p-6 border-2 border-gray-50 dark:border-brand-darkBorder rounded-3xl bg-gray-50/30 dark:bg-brand-darkBg/20">
                            <div className="w-24 h-24 rounded-2xl overflow-hidden border-4 border-white dark:border-brand-darkCard shadow-md shrink-0 bg-gray-100 flex items-center justify-center relative">
                                {uploading ? (
                                    <div className="absolute inset-0 bg-white/60 dark:bg-brand-darkCard/60 flex items-center justify-center z-10"><Loader2 className="animate-spin text-brand-orange" size={24} /></div>
                                ) : null}
                                <img src={formData.photo || `https://ui-avatars.com/api/?name=${formData.name}&background=random`} alt={formData.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1">
                                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Profile Photo</h4>
                                <div className="flex gap-2">
                                    <input 
                                        type="file" 
                                        ref={fileInputRef} 
                                        className="hidden" 
                                        accept="image/*" 
                                        onChange={handlePhotoChange} 
                                    />
                                    <button 
                                        onClick={() => fileInputRef.current.click()}
                                        disabled={uploading}
                                        className="bg-brand-orange text-white px-5 py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-orange-600 transition-all flex items-center gap-2"
                                    >
                                        <Camera size={14} /> {uploading ? 'Uploading...' : 'Change'}
                                    </button>
                                    <button 
                                        onClick={() => setFormData({ ...formData, photo: null })}
                                        className="bg-gray-100 dark:bg-brand-darkBg text-gray-500 px-5 py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-gray-200 transition-all"
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>
                        </div>
                        <InputField label="Full Name" placeholder="Enter member's full name" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                        <div className="flex bg-gray-100 dark:bg-brand-darkBg p-1.5 rounded-2xl w-full">
                            <button onClick={() => setFormData({ ...formData, isLiving: true })} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest ${formData.isLiving ? 'bg-white dark:bg-brand-darkCard shadow-sm text-green-500' : 'text-gray-400'}`}><Heart size={14} fill={formData.isLiving ? "currentColor" : "none"} /> Living</button>
                            <button onClick={() => setFormData({ ...formData, isLiving: false })} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest ${!formData.isLiving ? 'bg-white dark:bg-brand-darkCard shadow-sm text-red-500' : 'text-gray-400'}`}><Skull size={14} fill={!formData.isLiving ? "currentColor" : "none"} /> Deceased</button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <SelectField label="Gender" options={['Male', 'Female', 'Non-binary', 'Other']} value={formData.gender} onChange={(val) => setFormData({ ...formData, gender: val })} placeholder="Select gender" />
                            <InputField label="Birth Year" placeholder="e.g. 1985" icon={CalendarDays} value={formData.birthYear} onChange={(e) => setFormData({ ...formData, birthYear: e.target.value })} />
                        </div>
                        {!formData.isLiving && <InputField label="Death Year" placeholder="e.g. 2015" icon={Skull} value={formData.deathYear} onChange={(e) => setFormData({ ...formData, deathYear: e.target.value })} />}
                    </div>
                </section>

                {/* Lineage Mapping */}
                <section className="pt-10 border-t border-gray-100 dark:border-brand-darkBorder">
                    <div className="flex items-center space-x-3 mb-8"><div className="w-10 h-10 bg-orange-50 dark:bg-brand-orange/10 rounded-xl flex items-center justify-center text-brand-orange"><History size={20} /></div><h3 className="text-lg font-extrabold text-gray-900 dark:text-brand-darkText tracking-tight">Lineage Mapping</h3></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                        <SearchSelect label="Father" placeholder="Search father..." selectedValue={formData.father} onSelect={(p) => setFormData({ ...formData, father: p })} />
                        <SearchSelect label="Mother" placeholder="Search mother..." selectedValue={formData.mother} onSelect={(p) => setFormData({ ...formData, mother: p })} />
                    </div>
                    <SearchSelect label="Spouse (Optional)" placeholder="Search spouse..." selectedValue={formData.spouse} onSelect={(p) => setFormData({ ...formData, spouse: p })} />
                    
                    <div className="space-y-4 text-left">
                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Children</label>
                        <div className="flex flex-wrap gap-3 mb-4">
                            {formData.children.map(child => (
                                <div key={child.id} className="flex items-center space-x-2 bg-gray-50 dark:bg-brand-darkBg/50 border border-gray-100 dark:border-brand-darkBorder px-4 py-2.5 rounded-xl group transition-all hover:border-brand-orange/30">
                                    <div className="w-6 h-6 rounded-lg bg-orange-100 dark:bg-brand-orange/10 flex items-center justify-center text-brand-orange text-[10px]"><User size={12} /></div>
                                    <span className="text-xs font-bold text-gray-700 dark:text-brand-darkText">{child.name}</span>
                                    <button onClick={() => setFormData({ ...formData, children: formData.children.filter(c => c.id !== child.id) })} className="text-gray-400 hover:text-red-500 transition-colors"><X size={14} /></button>
                                </div>
                            ))}
                        </div>
                        <SearchSelect label="Add Child" placeholder="Search and add a child..." selectedValue={null} onSelect={(p) => p && !formData.children.find(c => c.id === p.id) && setFormData({ ...formData, children: [...formData.children, p] })} />
                    </div>
                </section>

                {/* Relationship */}
                <section className="pt-10 border-t border-gray-100 dark:border-brand-darkBorder">
                    <div className="flex items-center space-x-3 mb-8"><div className="w-10 h-10 bg-orange-50 dark:bg-brand-orange/10 rounded-xl flex items-center justify-center text-brand-orange"><Link2 size={20} /></div><h3 className="text-lg font-extrabold text-gray-900 dark:text-brand-darkText tracking-tight">Relationship</h3></div>
                    <SelectField label="Relationship Type" options={['Direct Descent', 'Adopted', 'Step-child', 'Other']} value={formData.relationshipType} onChange={(val) => setFormData({ ...formData, relationshipType: val })} placeholder="Select relationship" />
                </section>

                {/* Biography */}
                <section className="pt-10 border-t border-gray-100 dark:border-brand-darkBorder">
                    <div className="flex items-center space-x-3 mb-8"><div className="w-10 h-10 bg-orange-50 dark:bg-brand-orange/10 rounded-xl flex items-center justify-center text-brand-orange"><History size={20} /></div><h3 className="text-lg font-extrabold text-gray-900 dark:text-brand-darkText tracking-tight">Biography & Notes</h3></div>
                    <div className="space-y-1.5 mb-6 text-left">
                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Historical Biography</label>
                        <textarea className="block w-full px-6 py-4 bg-[#F3F4F6]/50 dark:bg-brand-darkBg/50 border border-transparent rounded-3xl focus:ring-2 focus:ring-brand-orange/20 text-gray-900 dark:text-brand-darkText font-medium transition-all text-sm min-h-[150px] resize-none" placeholder="Arthur was a successful merchant..." value={formData.biography} onChange={(e) => setFormData({ ...formData, biography: e.target.value })} />
                    </div>
                </section>

                {/* Contact Information */}
                <section className="pt-10 border-t border-gray-100 dark:border-brand-darkBorder">
                    <div className="flex items-center space-x-3 mb-8"><div className="w-10 h-10 bg-orange-50 dark:bg-brand-orange/10 rounded-xl flex items-center justify-center text-brand-orange"><Mail size={20} /></div><h3 className="text-lg font-extrabold text-gray-900 dark:text-brand-darkText tracking-tight">Contact Information</h3></div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <InputField label="Email Address" placeholder="arthur.h@example.com" icon={Mail} value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                        <InputField label="Phone Number" placeholder="+1 (555) 123-4567" icon={Phone} value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                    </div>
                </section>

                {/* Member Status */}
                <section className="pt-10 border-t border-gray-100 dark:border-brand-darkBorder">
                    <div className="flex items-center space-x-3 mb-8"><div className="w-10 h-10 bg-orange-50 dark:bg-brand-orange/10 rounded-xl flex items-center justify-center text-brand-orange"><ShieldCheck size={20} /></div><h3 className="text-lg font-extrabold text-gray-900 dark:text-brand-darkText tracking-tight">Member Status</h3></div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className={`p-6 rounded-3xl border-2 text-left transition-all ${formData.memberType !== 'Member' ? 'border-brand-orange bg-orange-50/50 dark:bg-brand-orange/5' : 'border-gray-50 dark:border-brand-darkBorder'}`}>
                            <div className="flex items-center justify-between mb-3"><span className={`text-[13px] font-black uppercase tracking-tight ${formData.memberType !== 'Member' ? 'text-brand-orange' : 'text-gray-400'}`}>Verified User</span>{formData.memberType !== 'Member' && <CheckCircle2 className="w-4 h-4 text-brand-orange" />}</div>
                            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 leading-relaxed">Active family member with account access and profile management rights.</p>
                        </div>
                        <div className={`p-6 rounded-3xl border-2 text-left transition-all ${formData.memberType === 'Member' ? 'border-brand-orange bg-orange-50/50 dark:bg-brand-orange/5' : 'border-gray-50 dark:border-brand-darkBorder'}`}>
                            <div className="flex items-center justify-between mb-3"><span className={`text-[13px] font-black uppercase tracking-tight ${formData.memberType === 'Member' ? 'text-brand-orange' : 'text-gray-400'}`}>Family Member</span>{formData.memberType === 'Member' && <CheckCircle2 className="w-4 h-4 text-brand-orange" />}</div>
                            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 leading-relaxed">Lineage record maintained for historical and genealogical accuracy.</p>
                        </div>
                    </div>
                </section>
            </div>

            <div className="sticky bottom-0 left-0 right-0 sm:static bg-white/90 dark:bg-brand-darkCard/90 backdrop-blur-md sm:bg-transparent border-t border-gray-100 dark:border-brand-darkBorder sm:border-none p-4 mt-8 flex flex-col-reverse sm:flex-row justify-end gap-3 z-30 mb-10">
                <button onClick={() => navigate('/branch/members')} className="w-full sm:w-auto px-10 py-4 rounded-2xl font-black text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-brand-darkBg hover:bg-gray-200 dark:hover:bg-brand-darkBorder transition-all uppercase text-xs tracking-widest">Discard Changes</button>
                <button onClick={handleUpdate} disabled={saving || uploading} className="w-full sm:w-auto px-12 py-4 rounded-2xl font-black text-white bg-brand-orange shadow-lg shadow-brand-orange/25 hover:bg-orange-600 active:scale-95 transition-all uppercase text-xs tracking-widest flex items-center justify-center disabled:opacity-50">{saving ? 'Saving...' : 'Update Profile'} <Save size={16} className="ml-2" /></button>
            </div>
        </div>
    );
};

export default BranchEditMember;
