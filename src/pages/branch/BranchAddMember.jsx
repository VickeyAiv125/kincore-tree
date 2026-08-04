import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
    Loader2,
    Heart,
    Skull,
    CalendarDays
} from 'lucide-react';

const InputField = ({ label, placeholder, type = "text", icon: Icon, value, onChange, error, required = false }) => (
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
        
        if (val.length < 2) {
            setResults([]);
            return;
        }

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
                    <p className="p-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50 dark:border-brand-darkBorder mb-2">
                        {searching ? 'Searching Family Space...' : (results.length > 0 ? 'Search Results' : 'No results found')}
                    </p>
                    {results.map(person => (
                        <button
                            key={person.id}
                            onClick={() => { onSelect(person); setIsFocused(false); }}
                            className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-brand-darkBg rounded-xl transition-colors flex items-center space-x-3"
                        >
                            <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-brand-orange/10 flex items-center justify-center text-brand-orange overflow-hidden">
                                {person.avatar ? <img src={person.avatar} className="w-full h-full object-cover" /> : <User size={14} />}
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm font-bold text-gray-700 dark:text-brand-darkText">{person.name}</span>
                                <span className="text-[10px] font-bold text-gray-400 uppercase">{person.birthDate ? new Date(person.birthDate).getFullYear() : 'Unknown Year'} • {person.gender}</span>
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

const BranchAddMember = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('new'); // 'existing' or 'new'
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [notification, setNotification] = useState({ message: '', type: 'success' });
    const fileInputRef = useRef(null);

    const [formData, setFormData] = useState({
        fullName: '',
        chineseName: '',
        gender: 'Male',
        birthDate: '',
        deathDate: '',
        isLiving: true,
        bio: '',
        privacyMode: 'private',
        fatherId: null,
        motherId: null,
        spouseId: null,
        personId: null, // For 'existing' flow
        targetPerson: null,
        relationshipType: 'Child',
        avatarUrl: null
    });

    const handlePhotoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        try {
            const token = localStorage.getItem('token');
            const baseUrl = import.meta.env.VITE_API_BASE_URL || `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}`;
            const body = new FormData();
            body.append('photo', file);

            const response = await fetch(`${baseUrl}/admin/branch/upload-photo`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body
            });

            if (!response.ok) throw new Error('Photo upload failed');
            const data = await response.json();
            setFormData(prev => ({ ...prev, avatarUrl: data.url }));
            setNotification({ message: 'Member photo uploaded successfully!', type: 'success' });
        } catch (err) {
            setNotification({ message: 'Error uploading photo: ' + err.message, type: 'error' });
        } finally {
            setUploading(false);
        }
    };

    const handleAddMember = async () => {
        if (activeTab === 'new' && !formData.fullName) {
            setNotification({ message: 'Full Name is required for new members', type: 'error' });
            return;
        }
        if (activeTab === 'existing' && !formData.personId) {
            setNotification({ message: 'Please select an existing person', type: 'error' });
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const user = JSON.parse(localStorage.getItem('user'));
            const branchId = user?.branch_id || '6b8eb992-571f-4637-b031-a56007560cad';
            const baseUrl = import.meta.env.VITE_API_BASE_URL || `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}`;

            const payload = {
                ...formData,
                targetPersonId: formData.targetPerson?.id
            };

            const response = await fetch(`${baseUrl}/admin/branch/members/${branchId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) throw new Error('Failed to add member');

            setNotification({ message: 'Member registered successfully!', type: 'success' });
            setTimeout(() => navigate('/branch/members'), 1500);
        } catch (err) {
            console.error('>>> [ADD_MEMBER_ERROR]', err);
            setNotification({ message: 'Error adding member: ' + err.message, type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col min-h-[calc(100vh-100px)] max-w-2xl mx-auto w-full px-4 sm:px-0">
            <Notification 
                message={notification.message} 
                type={notification.type} 
                onClose={() => setNotification({ message: '', type: 'success' })} 
            />

            <header className="mb-10 text-left pt-6">
                <h2 className="text-gray-900 dark:text-brand-darkText text-sm font-bold opacity-30 dark:opacity-40 mb-1 uppercase tracking-widest">Branch Admin</h2>
                <h1 className="text-3xl font-extrabold text-gray-900 dark:text-brand-darkText leading-tight">Registry New Member</h1>
            </header>

            {/* Tab Navigation */}
            <div className="flex space-x-1 bg-gray-100 dark:bg-brand-darkBg p-1.5 rounded-2xl mb-8">
                <button
                    onClick={() => setActiveTab('new')}
                    className={`flex-1 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'new' ? 'bg-white dark:bg-brand-darkCard text-brand-orange shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    Create New Profile
                </button>
                <button
                    onClick={() => setActiveTab('existing')}
                    className={`flex-1 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'existing' ? 'bg-white dark:bg-brand-darkCard text-brand-orange shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    Map Existing Person
                </button>
            </div>

            <div className="bg-white dark:bg-brand-darkCard rounded-3xl border border-gray-100 dark:border-brand-darkBorder shadow-sm p-6 sm:p-10 flex-1 space-y-12 mb-8 text-left">
                
                {activeTab === 'existing' ? (
                    <section className="animate-fadeIn">
                        <div className="flex items-center space-x-3 mb-8">
                            <div className="w-10 h-10 bg-orange-50 dark:bg-brand-orange/10 rounded-xl flex items-center justify-center text-brand-orange">
                                <Search size={20} />
                            </div>
                            <h3 className="text-lg font-extrabold text-gray-900 dark:text-brand-darkText tracking-tight">Search Person</h3>
                        </div>
                        <SearchSelect
                            label="Select Person from Tree"
                            placeholder="Type name to search..."
                            selectedValue={formData.personId ? { name: formData.fullName } : null}
                            onSelect={(p) => setFormData({ ...formData, personId: p?.id, fullName: p?.name })}
                        />
                        <p className="text-xs font-bold text-gray-400 leading-relaxed mt-4 bg-gray-50 dark:bg-brand-darkBg/50 p-4 rounded-2xl border border-gray-100 dark:border-brand-darkBorder">
                            <Info size={14} className="inline mr-2 text-brand-orange" />
                            This will map an existing person from the global family tree into your branch's registry.
                        </p>
                    </section>
                ) : (
                    <section className="animate-fadeIn">
                        <div className="flex items-center space-x-3 mb-8">
                            <div className="w-10 h-10 bg-orange-50 dark:bg-brand-orange/10 rounded-xl flex items-center justify-center text-brand-orange">
                                <UserPlus size={20} />
                            </div>
                            <h3 className="text-lg font-extrabold text-gray-900 dark:text-brand-darkText tracking-tight">Personal Details</h3>
                        </div>

                        <div className="space-y-8">
                            {/* Photo Upload for New Member */}
                            <div className="flex items-center gap-6 p-6 border-2 border-dashed border-gray-200 dark:border-brand-darkBorder rounded-3xl bg-gray-50/30 dark:bg-brand-darkBg/20 hover:bg-gray-50 dark:hover:bg-brand-darkBg/40 transition-all cursor-pointer group" onClick={() => fileInputRef.current.click()}>
                                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                                <div className="w-24 h-24 rounded-2xl overflow-hidden border-4 border-white dark:border-brand-darkCard shadow-md shrink-0 bg-gray-100 flex items-center justify-center relative">
                                    {uploading ? (
                                        <div className="absolute inset-0 bg-white/60 dark:bg-brand-darkCard/60 flex items-center justify-center z-10"><Loader2 className="animate-spin text-brand-orange" size={24} /></div>
                                    ) : null}
                                    {formData.avatarUrl ? (
                                        <img src={formData.avatarUrl} className="w-full h-full object-cover" />
                                    ) : (
                                        <Camera className="text-gray-300 group-hover:text-brand-orange transition-colors" size={32} />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Profile Photo</h4>
                                    <p className="text-xs font-bold text-gray-600 dark:text-brand-darkText">{formData.avatarUrl ? 'Click to change' : 'Upload member photo'}</p>
                                    <p className="text-[10px] text-gray-400 font-medium mt-1">S3 Secure Storage Enabled</p>
                                </div>
                            </div>

                            <InputField
                                label="Full Name"
                                placeholder="Enter member's full name"
                                required
                                value={formData.fullName}
                                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                            />

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-1.5 text-left">
                                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Gender</label>
                                    <div className="relative">
                                        <select
                                            value={formData.gender}
                                            onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                            className="block w-full px-4 py-3.5 bg-[#F3F4F6]/50 dark:bg-brand-darkBg/50 border border-transparent rounded-2xl focus:ring-2 focus:ring-brand-orange/20 text-gray-900 dark:text-brand-darkText font-medium transition-all text-sm appearance-none"
                                        >
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                            <option value="Other">Other</option>
                                        </select>
                                        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                                            <ChevronDown className="h-4 w-4 text-gray-400" />
                                        </div>
                                    </div>
                                </div>
                                <InputField
                                    label="Birth Year"
                                    placeholder="e.g. 1990"
                                    value={formData.birthDate}
                                    onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                                />
                            </div>

                            {/* Life Status Toggle */}
                            <div className="flex bg-gray-100 dark:bg-brand-darkBg p-1.5 rounded-2xl w-full">
                                <button
                                    onClick={() => setFormData({ ...formData, isLiving: true })}
                                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest ${formData.isLiving ? 'bg-white dark:bg-brand-darkCard shadow-sm text-green-500' : 'text-gray-400'}`}
                                >
                                    <Heart size={14} fill={formData.isLiving ? "currentColor" : "none"} /> Living
                                </button>
                                <button
                                    onClick={() => setFormData({ ...formData, isLiving: false })}
                                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest ${!formData.isLiving ? 'bg-white dark:bg-brand-darkCard shadow-sm text-red-500' : 'text-gray-400'}`}
                                >
                                    <Skull size={14} fill={!formData.isLiving ? "currentColor" : "none"} /> Deceased
                                </button>
                            </div>

                            {!formData.isLiving && (
                                <InputField
                                    label="Death Year"
                                    placeholder="e.g. 2010"
                                    value={formData.deathDate}
                                    onChange={(e) => setFormData({ ...formData, deathDate: e.target.value })}
                                />
                            )}
                        </div>
                    </section>
                )}

                {/* Section: Lineage (Common to both) */}
                <section className="pt-10 border-t border-gray-100 dark:border-brand-darkBorder">
                    <div className="flex items-center space-x-3 mb-8">
                        <div className="w-10 h-10 bg-orange-50 dark:bg-brand-orange/10 rounded-xl flex items-center justify-center text-brand-orange">
                            <Link2 size={20} />
                        </div>
                        <h3 className="text-lg font-extrabold text-gray-900 dark:text-brand-darkText tracking-tight">Family Lineage</h3>
                    </div>

                    <div className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                            <SearchSelect
                                label="Father"
                                placeholder="Search father..."
                                selectedValue={formData.fatherId ? { name: 'Father Selected' } : null} // Simple placeholder
                                onSelect={(p) => setFormData({ ...formData, fatherId: p?.id })}
                            />
                            <SearchSelect
                                label="Mother"
                                placeholder="Search mother..."
                                selectedValue={formData.motherId ? { name: 'Mother Selected' } : null}
                                onSelect={(p) => setFormData({ ...formData, motherId: p?.id })}
                            />
                        </div>
                        <SearchSelect
                            label="Spouse (Optional)"
                            placeholder="Search spouse..."
                            selectedValue={formData.spouseId ? { name: 'Spouse Selected' } : null}
                            onSelect={(p) => setFormData({ ...formData, spouseId: p?.id })}
                        />

                        <div className="p-6 bg-gray-50 dark:bg-brand-darkBg/50 rounded-3xl border border-gray-100 dark:border-brand-darkBorder">
                            <div className="flex items-center space-x-3 mb-4">
                                <Users size={18} className="text-brand-orange" />
                                <h4 className="text-xs font-black text-gray-900 dark:text-brand-darkText uppercase tracking-widest">Connect to Tree</h4>
                            </div>
                            <SearchSelect
                                label="Relate to Member"
                                placeholder="Select person to link to..."
                                selectedValue={formData.targetPerson}
                                onSelect={(p) => setFormData({ ...formData, targetPerson: p })}
                            />
                            <div className="space-y-1.5 mt-6 text-left">
                                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Relationship to this Person</label>
                                <div className="relative">
                                    <select
                                        value={formData.relationshipType}
                                        onChange={(e) => setFormData({ ...formData, relationshipType: e.target.value })}
                                        className="block w-full px-4 py-3.5 bg-white dark:bg-brand-darkCard border border-gray-200 dark:border-brand-darkBorder rounded-2xl focus:ring-2 focus:ring-brand-orange/20 text-gray-900 dark:text-brand-darkText font-medium transition-all text-sm appearance-none"
                                    >
                                        <option value="Child">This member is their Child</option>
                                        <option value="Parent">This member is their Parent</option>
                                        <option value="Spouse">This member is their Spouse</option>
                                    </select>
                                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                                        <ChevronDown className="h-4 w-4 text-gray-400" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            {/* Sticky Actions */}
            <div className="sticky bottom-0 left-0 right-0 sm:static bg-white/90 dark:bg-brand-darkCard/90 backdrop-blur-md sm:bg-transparent border-t border-gray-100 dark:border-brand-darkBorder sm:border-none p-4 mt-8 flex flex-col-reverse sm:flex-row justify-end gap-3 z-30 mb-10">
                <button
                    onClick={() => navigate('/branch/members')}
                    className="w-full sm:w-auto px-10 py-4 rounded-2xl font-black text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-brand-darkBg hover:bg-gray-200 dark:hover:bg-brand-darkBorder transition-all uppercase text-xs tracking-widest"
                >
                    Cancel
                </button>
                <button
                    onClick={handleAddMember}
                    disabled={loading || uploading}
                    className="w-full sm:w-auto px-12 py-4 rounded-2xl font-black text-white bg-brand-orange shadow-lg shadow-brand-orange/25 hover:bg-orange-600 active:scale-95 transition-all uppercase text-xs tracking-widest flex items-center justify-center disabled:opacity-50"
                >
                    {loading ? 'Adding...' : 'Registry Member'} <Save size={16} className="ml-2" />
                </button>
            </div>
        </div>
    );
};

export default BranchAddMember;
