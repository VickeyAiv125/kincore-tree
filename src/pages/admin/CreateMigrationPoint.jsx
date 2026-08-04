import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    MapPin,
    Calendar,
    Type,
    Link as LinkIcon,
    ArrowRight,
    Image as ImageIcon,
    Users,
    Tag,
    Globe,
    X,
    Plus,
    ChevronDown,
    Search
} from 'lucide-react';

const InputField = ({ label, placeholder, type = "text", icon: Icon, value, onChange, error, required = false }) => (
    <div className="space-y-1.5 mb-5 text-left">
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
                className={`block w-full ${Icon ? 'pl-11' : 'px-4'} py-3 bg-[#F3F4F6]/50 dark:bg-brand-darkBg/50 border ${error ? 'border-red-400' : 'border-transparent'} rounded-xl focus:ring-2 focus:ring-brand-orange/20 text-gray-900 dark:text-brand-darkText font-medium transition-all text-sm`}
                placeholder={placeholder}
            />
        </div>
        {error && <p className="text-[10px] font-bold text-red-500 uppercase tracking-tight">{error}</p>}
    </div>
);

const TextArea = ({ label, placeholder, value, onChange, rows = 3, helpText }) => (
    <div className="space-y-1.5 mb-5 text-left">
        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            {label}
        </label>
        <textarea
            value={value}
            onChange={onChange}
            rows={rows}
            className="block w-full px-4 py-3 bg-[#F3F4F6]/50 dark:bg-brand-darkBg/50 border border-transparent rounded-xl focus:ring-2 focus:ring-brand-orange/20 text-gray-900 dark:text-brand-darkText font-medium transition-all text-sm resize-none"
            placeholder={placeholder}
        />
        {helpText && <p className="text-[10px] text-gray-400 font-medium uppercase tracking-tight">{helpText}</p>}
    </div>
);

const MultiSelect = ({ label, placeholder, items = [], selectedItems = [], onAdd, onRemove }) => {
    const [search, setSearch] = useState('');
    const [isOpen, setIsOpen] = useState(false);

    const filtered = items.filter(item => {
        const name = (item.name || item.full_name || item.title || '').toLowerCase();
        return name.includes(search.toLowerCase()) && !selectedItems.some(sel => sel.id === item.id);
    });

    return (
        <div className="space-y-1.5 mb-5 text-left relative">
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {label}
            </label>
            <div className="relative mb-3">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                    type="text"
                    value={search}
                    onChange={(e) => {
                        setSearch(e.target.value);
                        setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                    onBlur={() => setTimeout(() => setIsOpen(false), 200)}
                    className="block w-full pl-11 py-3 bg-[#F3F4F6]/50 dark:bg-brand-darkBg/50 border border-transparent rounded-xl focus:ring-2 focus:ring-brand-orange/20 text-gray-900 dark:text-brand-darkText font-medium transition-all text-sm"
                    placeholder={placeholder}
                />
                {isOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-brand-darkCard border border-gray-100 dark:border-brand-darkBorder rounded-xl shadow-xl z-50 max-h-48 overflow-y-auto">
                        {filtered.map((item) => (
                            <button
                                key={item.id}
                                type="button"
                                onMouseDown={(e) => {
                                    // Use onMouseDown to prevent blur event from hiding drop-down before onClick fires
                                    e.preventDefault();
                                    onAdd(item);
                                    setSearch('');
                                    setIsOpen(false);
                                }}
                                className="w-full text-left px-4 py-2.5 text-xs font-bold text-gray-700 dark:text-brand-darkText hover:bg-brand-orange/10 transition-colors uppercase tracking-wider"
                            >
                                {item.name || item.full_name || item.title}
                            </button>
                        ))}
                        {filtered.length === 0 && (
                            <div className="px-4 py-2.5 text-xs text-gray-400 italic">No matches found</div>
                        )}
                    </div>
                )}
            </div>
            <div className="flex flex-wrap gap-2">
                {selectedItems.map((item) => (
                    <div key={item.id} className="flex items-center space-x-2 bg-white dark:bg-brand-darkCard px-3 py-1.5 rounded-lg border border-gray-100 dark:border-brand-darkBorder text-xs font-bold text-gray-700 dark:text-brand-darkText shadow-sm">
                        <span>{item.name || item.full_name || item.title}</span>
                        <button type="button" onClick={() => onRemove(item)} className="text-gray-300 hover:text-red-400 transition-colors">
                            <X size={14} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

const CreateMigrationPoint = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        fromLocation: '',
        toLocation: '',
        fromCoords: { lat: '', lng: '' },
        toCoords: { lat: '', lng: '' },
        reason: 'Relocation',
        isBranchMigration: false,
        dateType: 'Exact Date',
        dateValue: '',
        dateRange: { start: '', end: '' },
        approximatePeriod: '',
        description: '',
        media: [],
        branches: [],
        persons: [],
        historyChapters: [],
        tags: [],
        visibility: 'Family',
        sources: ''
    });

    const [errors, setErrors] = useState({});
    const [availableBranches, setAvailableBranches] = useState([]);
    const [availablePersons, setAvailablePersons] = useState([]);
    const [availableHistory, setAvailableHistory] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState(null);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = React.useRef(null);

    const handleGeocode = async (type) => {
        const query = type === 'from' ? formData.fromLocation : formData.toLocation;
        if (!query) return;

        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`);
            if (res.ok) {
                const data = await res.json();
                if (data && data.length > 0) {
                    const lat = parseFloat(data[0].lat).toFixed(4);
                    const lon = parseFloat(data[0].lon).toFixed(4);
                    if (type === 'from') {
                        setFormData(prev => ({
                            ...prev,
                            fromCoords: { lat: lat.toString(), lng: lon.toString() }
                        }));
                    } else {
                        setFormData(prev => ({
                            ...prev,
                            toCoords: { lat: lat.toString(), lng: lon.toString() }
                        }));
                    }
                }
            }
        } catch (err) {
            console.error('Geocoding error:', err);
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formDataPayload = new FormData();
        formDataPayload.append('file', file);
        formDataPayload.append('visibility', 'family');
        formDataPayload.append('title', file.name);

        try {
            setUploading(true);
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const familyId = localStorage.getItem('selected_family_id') || user?.family_id || user?.family_space_id || 'd8eefc0a-6497-4bf5-8077-f2b35a3ed5cd';
            const token = localStorage.getItem('token');
            const API_BASE = import.meta.env.VITE_API_BASE_URL || `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}`;

            const res = await fetch(`${API_BASE}/family-admin/${familyId}/media`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: formDataPayload
            });

            if (res.ok) {
                const responseData = await res.json();
                setFormData(prev => ({
                    ...prev,
                    media: [...prev.media, { name: file.name, url: responseData.media.url, type: responseData.media.type }]
                }));
            } else {
                const errData = await res.json();
                alert(`Upload failed: ${errData.error || 'Unknown error'}`);
            }
        } catch (err) {
            console.error('Upload error:', err);
            alert(`Upload error: ${err.message}`);
        } finally {
            setUploading(false);
        }
    };

    useEffect(() => {
        const fetchRelations = async () => {
            try {
                const user = JSON.parse(localStorage.getItem('user') || '{}');
                const familyId = localStorage.getItem('selected_family_id') || user?.family_id || user?.family_space_id || 'd8eefc0a-6497-4bf5-8077-f2b35a3ed5cd';
                const token = localStorage.getItem('token');
                const API_BASE = import.meta.env.VITE_API_BASE_URL || `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}`;

                const [branchesRes, personsRes, historyRes] = await Promise.all([
                    fetch(`${API_BASE}/family-admin/${familyId}/branches`, { headers: { 'Authorization': `Bearer ${token}` } }),
                    fetch(`${API_BASE}/family-admin/${familyId}/persons`, { headers: { 'Authorization': `Bearer ${token}` } }),
                    fetch(`${API_BASE}/history?family_space_id=${familyId}`, { headers: { 'Authorization': `Bearer ${token}` } })
                ]);

                if (branchesRes.ok) {
                    const data = await branchesRes.json();
                    setAvailableBranches(data.branches || []);
                }
                if (personsRes.ok) {
                    const data = await personsRes.json();
                    setAvailablePersons(data.persons || []);
                }
                if (historyRes.ok) {
                    const data = await historyRes.json();
                    setAvailableHistory(data || []);
                }
            } catch (err) {
                console.error('Failed to fetch relations:', err);
            }
        };

        fetchRelations();
    }, []);

    const handleAddMigration = async () => {
        const newErrors = {};
        if (!formData.title) newErrors.title = 'Title is required';
        if (!formData.fromLocation) newErrors.fromLocation = 'Start location is required';
        if (!formData.toLocation) newErrors.toLocation = 'Destination is required';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        try {
            setSubmitting(true);
            setSubmitError(null);

            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const familyId = localStorage.getItem('selected_family_id') || user?.family_id || user?.family_space_id || 'd8eefc0a-6497-4bf5-8077-f2b35a3ed5cd';
            const token = localStorage.getItem('token');
            const API_BASE = import.meta.env.VITE_API_BASE_URL || `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}`;

            const payload = {
                ...formData,
                branches: formData.branches.map(b => b.id),
                persons: formData.persons.map(p => p.id),
                historyChapters: formData.historyChapters.map(h => h.id)
            };

            const response = await fetch(`${API_BASE}/family-admin/${familyId}/migration-map`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || 'Failed to save migration point');
            }

            navigate('/migration');
        } catch (err) {
            console.error('Error saving migration point:', err);
            setSubmitError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const toggleTag = (tag) => {
        const tags = formData.tags.includes(tag)
            ? formData.tags.filter(t => t !== tag)
            : [...formData.tags, tag];
        setFormData({ ...formData, tags });
    };

    return (
        <div className="flex flex-col min-h-[calc(100vh-100px)] max-w-2xl mx-auto w-full">
            <header className="mb-10 text-left">
                <h2 className="text-gray-900 dark:text-brand-darkText text-sm font-bold opacity-30 dark:opacity-40 mb-1 uppercase tracking-widest">Migration Map</h2>
                <h1 className="text-3xl font-extrabold text-gray-900 dark:text-brand-darkText">Add Migration Point</h1>
            </header>

            {submitError && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-2xl uppercase tracking-wider text-left">
                    Error: {submitError}
                </div>
            )}

            <div className="bg-white dark:bg-brand-darkCard rounded-3xl border border-gray-100 dark:border-brand-darkBorder shadow-sm p-8 flex-1 space-y-8 mb-8">

                {/* Title and Locations */}
                <section className="space-y-6">
                    <InputField
                        label="Point Title"
                        placeholder="e.g. Grandma's Arrival in New York"
                        required
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        error={errors.title}
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-16 gap-y-10 relative p-8 bg-gray-50/50 dark:bg-brand-darkBg/50 rounded-3xl border border-gray-100 dark:border-brand-darkBorder">
                        <div className="space-y-6">
                            <div className="flex items-end justify-between gap-2">
                                <div className="flex-1">
                                    <InputField
                                        label="From Location"
                                        placeholder="Starting point"
                                        icon={MapPin}
                                        required
                                        value={formData.fromLocation}
                                        onChange={(e) => setFormData({ ...formData, fromLocation: e.target.value })}
                                        error={errors.fromLocation}
                                    />
                                </div>
                                {formData.fromLocation && (
                                    <button
                                        type="button"
                                        onClick={() => handleGeocode('from')}
                                        className="text-[10px] font-black text-brand-orange hover:text-orange-600 uppercase tracking-widest shrink-0 mb-5 hover:underline"
                                    >
                                        Get Coords
                                    </button>
                                )}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <InputField label="Latitude" placeholder="e.g. 40.7" value={formData.fromCoords.lat} onChange={(e) => setFormData({ ...formData, fromCoords: { ...formData.fromCoords, lat: e.target.value } })} />
                                <InputField label="Longitude" placeholder="e.g. -74.0" value={formData.fromCoords.lng} onChange={(e) => setFormData({ ...formData, fromCoords: { ...formData.fromCoords, lng: e.target.value } })} />
                            </div>
                        </div>

                        {/* Connection Arrow - Aligned with the first row of inputs */}
                        <div className="hidden sm:flex absolute left-1/2 top-[76px] -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white dark:bg-brand-darkCard items-center justify-center text-brand-orange z-20 border-4 border-gray-50 dark:border-brand-darkBg shadow-xl">
                            <ArrowRight size={20} strokeWidth={3} />
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-end justify-between gap-2">
                                <div className="flex-1">
                                    <InputField
                                        label="To Location"
                                        placeholder="Destination"
                                        icon={MapPin}
                                        required
                                        value={formData.toLocation}
                                        onChange={(e) => setFormData({ ...formData, toLocation: e.target.value })}
                                        error={errors.toLocation}
                                    />
                                </div>
                                {formData.toLocation && (
                                    <button
                                        type="button"
                                        onClick={() => handleGeocode('to')}
                                        className="text-[10px] font-black text-brand-orange hover:text-orange-600 uppercase tracking-widest shrink-0 mb-5 hover:underline"
                                    >
                                        Get Coords
                                    </button>
                                )}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <InputField label="Latitude" placeholder="e.g. 34.0" value={formData.toCoords.lat} onChange={(e) => setFormData({ ...formData, toCoords: { ...formData.toCoords, lat: e.target.value } })} />
                                <InputField label="Longitude" placeholder="e.g. -118.2" value={formData.toCoords.lng} onChange={(e) => setFormData({ ...formData, toCoords: { ...formData.toCoords, lng: e.target.value } })} />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2 text-left">
                            <label className="block text-xs font-black text-gray-500 uppercase tracking-[0.2em] mb-4">Reason for Migration</label>
                            <div className="relative">
                                <select
                                    className="w-full px-4 py-3 bg-[#F3F4F6]/50 dark:bg-brand-darkBg/50 border border-transparent rounded-xl focus:ring-2 focus:ring-brand-orange/20 text-gray-900 dark:text-brand-darkText font-bold text-xs uppercase tracking-widest appearance-none transition-all"
                                    value={formData.reason}
                                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                >
                                    <option value="Relocation">Relocation</option>
                                    <option value="Economic">Economic Opportunity</option>
                                    <option value="Education">Education</option>
                                    <option value="Conflict/War">Conflict / War</option>
                                    <option value="Famine">Famine / Natural Disaster</option>
                                    <option value="Personal">Personal Choice</option>
                                </select>
                                <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                            </div>
                        </div>
                        <div className="flex flex-col justify-center gap-3">
                            <label className="block text-xs font-black text-gray-500 uppercase tracking-[0.2em]">Scope of Journey</label>
                            <label className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-brand-darkBg rounded-2xl cursor-pointer border-2 border-transparent hover:border-brand-orange/20 transition-all">
                                <input
                                    type="checkbox"
                                    className="w-4 h-4 rounded-md border-gray-300 text-brand-orange focus:ring-brand-orange"
                                    checked={formData.isBranchMigration}
                                    onChange={(e) => setFormData({ ...formData, isBranchMigration: e.target.checked })}
                                />
                                <div className="flex flex-col">
                                    <span className="text-xs font-black text-gray-700 dark:text-brand-darkText uppercase tracking-widest leading-none mb-1">Apply to Whole Branch</span>
                                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">Propagate coordinates to all descendants</span>
                                </div>
                            </label>
                        </div>
                    </div>
                </section>

                {/* Date or Period */}
                <section className="pt-8 border-t border-gray-50 dark:border-brand-darkBorder text-left">
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Date or Period</label>
                    <div className="flex bg-gray-100 dark:bg-brand-darkBg p-1 rounded-xl w-fit mb-6">
                        {['Exact Date', 'Date Range', 'Approximate'].map(type => (
                            <button
                                key={type}
                                onClick={() => setFormData({ ...formData, dateType: type })}
                                className={`px-4 py-2 text-[10px] font-extrabold rounded-lg transition-all uppercase tracking-tight ${formData.dateType === type ? 'bg-white dark:bg-brand-darkCard shadow-sm text-brand-orange' : 'text-gray-400'}`}
                            >
                                {type}
                            </button>
                        ))}
                    </div>

                    {formData.dateType === 'Exact Date' && (
                        <InputField label="Migration Date" type="date" icon={Calendar} value={formData.dateValue} onChange={(e) => setFormData({ ...formData, dateValue: e.target.value })} />
                    )}
                    {formData.dateType === 'Date Range' && (
                        <div className="grid grid-cols-2 gap-4">
                            <InputField label="Start Date" type="date" value={formData.dateRange.start} onChange={(e) => setFormData({ ...formData, dateRange: { ...formData.dateRange, start: e.target.value } })} />
                            <InputField label="End Date" type="date" value={formData.dateRange.end} onChange={(e) => setFormData({ ...formData, dateRange: { ...formData.dateRange, end: e.target.value } })} />
                        </div>
                    )}
                    {formData.dateType === 'Approximate' && (
                        <InputField
                            label="Approximate Period"
                            placeholder="e.g. circa 1920s, Summer 1945"
                            value={formData.approximatePeriod}
                            onChange={(e) => setFormData({ ...formData, approximatePeriod: e.target.value })}
                        />
                    )}
                    <p className="text-[10px] text-gray-400 font-medium uppercase tracking-tight -mt-3">Approximate support allows documenting historical journeys with imprecise records.</p>
                </section>

                {/* Description and Media */}
                <section className="pt-8 border-t border-gray-50 dark:border-brand-darkBorder">
                    <TextArea
                        label="Story / Description"
                        placeholder="Tell the story of this migration..."
                        rows={5}
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />

                    <div className="space-y-1.5 mb-5 text-left pt-2">
                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Attach Media</label>
                        <div
                            onClick={() => !uploading && fileInputRef.current?.click()}
                            className="bg-[#F3F4F6]/30 dark:bg-brand-darkBg/30 rounded-2xl p-8 border border-dashed border-gray-200 dark:border-brand-darkBorder text-center cursor-pointer hover:bg-gray-100 dark:hover:bg-brand-darkBg/50 transition-all group relative"
                        >
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                onChange={handleFileUpload}
                            />
                            {uploading ? (
                                <div className="py-2">
                                    <div className="w-8 h-8 border-4 border-brand-orange border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest animate-pulse">Uploading file...</p>
                                </div>
                            ) : (
                                <>
                                    <ImageIcon className="mx-auto h-10 w-10 text-gray-300 group-hover:text-brand-orange transition-colors mb-2" />
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Upload Images, Documents, or Audio</p>
                                    <p className="text-[10px] text-gray-400 mt-1 uppercase font-bold tracking-tighter">JPG, PNG, PDF, MP3 up to 20MB</p>
                                </>
                            )}
                        </div>

                        {/* List of uploaded files */}
                        {formData.media && formData.media.length > 0 && (
                            <div className="mt-4 space-y-2">
                                {formData.media.map((item, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-brand-darkBg rounded-xl border border-gray-100 dark:border-brand-darkBorder">
                                        <div className="flex items-center space-x-3">
                                            {item.type?.startsWith('image') ? (
                                                <img src={item.url} className="w-10 h-10 object-cover rounded-lg" alt={item.name} />
                                            ) : (
                                                <div className="w-10 h-10 bg-orange-100 dark:bg-brand-orange/20 rounded-lg flex items-center justify-center text-brand-orange">
                                                    <ImageIcon className="w-5 h-5" />
                                                </div>
                                            )}
                                            <span className="text-xs font-bold text-gray-700 dark:text-brand-darkText truncate max-w-[200px]">{item.name}</span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setFormData({
                                                ...formData,
                                                media: formData.media.filter((_, idx) => idx !== index)
                                            })}
                                            className="text-gray-400 hover:text-red-500 transition-colors"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </section>

                {/* Linking and Tags */}
                <section className="pt-8 border-t border-gray-50 dark:border-brand-darkBorder space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <MultiSelect
                            label="Link to Branch"
                            placeholder="Search branches..."
                            items={availableBranches}
                            selectedItems={formData.branches}
                            onAdd={(val) => setFormData({ ...formData, branches: [...formData.branches, val] })}
                            onRemove={(val) => setFormData({ ...formData, branches: formData.branches.filter(b => b.id !== val.id) })}
                        />
                        <MultiSelect
                            label="Link to Person"
                            placeholder="Search persons..."
                            items={availablePersons}
                            selectedItems={formData.persons}
                            onAdd={(val) => setFormData({ ...formData, persons: [...formData.persons, val] })}
                            onRemove={(val) => setFormData({ ...formData, persons: formData.persons.filter(p => p.id !== val.id) })}
                        />
                        <MultiSelect
                            label="Link to History Chapter"
                            placeholder="Search history..."
                            items={availableHistory}
                            selectedItems={formData.historyChapters}
                            onAdd={(val) => setFormData({ ...formData, historyChapters: [...formData.historyChapters, val] })}
                            onRemove={(val) => setFormData({ ...formData, historyChapters: formData.historyChapters.filter(h => h.id !== val.id) })}
                        />
                    </div>

                    <div className="text-left space-y-3">
                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tags</label>
                        <div className="flex flex-wrap gap-2">
                            {['War', 'Business', 'Education', 'Relocation', 'Personal'].map(tag => (
                                <button
                                    key={tag}
                                    onClick={() => toggleTag(tag)}
                                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${formData.tags.includes(tag) ? 'bg-brand-orange border-brand-orange text-white shadow-md shadow-brand-orange/20' : 'bg-gray-50 dark:bg-brand-darkBg border-gray-100 dark:border-brand-darkBorder text-gray-400 hover:border-brand-orange'}`}
                                >
                                    {tag}
                                </button>
                            ))}
                            <div className="relative">
                                <Plus size={16} className="absolute left-3 top-2.5 text-gray-300" />
                                <input
                                    className="pl-9 pr-4 py-2 bg-gray-50 dark:bg-brand-darkBg border border-gray-100 dark:border-brand-darkBorder rounded-xl text-xs font-bold w-32 outline-none focus:border-brand-orange"
                                    placeholder="Custom..."
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter') {
                                            toggleTag(e.target.value);
                                            e.target.value = '';
                                        }
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Visibility and Sources */}
                <section className="pt-8 border-t border-gray-50 dark:border-brand-darkBorder text-left space-y-8">
                    <div className="space-y-4">
                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Visibility Setting</label>
                        <div className="flex flex-wrap gap-8">
                            {['Family', 'Branch', 'Public'].map(v => (
                                <label key={v} className="flex items-center space-x-3 cursor-pointer group">
                                    <div className="relative flex items-center justify-center">
                                        <input
                                            type="radio"
                                            name="visibility"
                                            className="sr-only"
                                            checked={formData.visibility === v}
                                            onChange={() => setFormData({ ...formData, visibility: v })}
                                        />
                                        <div className={`w-5 h-5 rounded-full border-2 transition-all ${formData.visibility === v ? 'border-brand-orange bg-brand-orange' : 'border-gray-200 dark:border-brand-darkBorder group-hover:border-brand-orange/50'}`}>
                                            {formData.visibility === v && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                                        </div>
                                    </div>
                                    <span className={`text-sm font-bold transition-colors ${formData.visibility === v ? 'text-gray-900 dark:text-brand-darkText' : 'text-gray-400 dark:text-gray-500'}`}>{v}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <TextArea
                        label="Sources / Citations"
                        placeholder="Add historical sources, references, or notes"
                        value={formData.sources}
                        onChange={(e) => setFormData({ ...formData, sources: e.target.value })}
                    />
                </section>
            </div>

            {/* Sticky Actions */}
            <div className="sticky bottom-0 left-0 right-0 sm:static bg-white/90 dark:bg-brand-darkCard/90 backdrop-blur-md sm:bg-transparent border-t border-gray-100 dark:border-brand-darkBorder sm:border-none p-4 mt-8 flex flex-col-reverse sm:flex-row justify-end gap-3 z-30">
                <button
                    disabled={submitting}
                    onClick={() => navigate('/migration')}
                    className="w-full sm:w-auto px-10 py-4 rounded-2xl font-bold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-brand-darkBg hover:bg-gray-200 dark:hover:bg-brand-darkBorder transition-all uppercase text-sm tracking-widest disabled:opacity-50"
                >
                    Cancel
                </button>
                <button
                    disabled={submitting}
                    onClick={handleAddMigration}
                    className="w-full sm:w-auto px-12 py-4 rounded-2xl font-bold text-white bg-brand-orange shadow-lg shadow-brand-orange/25 hover:bg-orange-600 active:scale-95 transition-all uppercase text-sm tracking-widest disabled:opacity-50"
                >
                    {submitting ? 'Adding...' : 'Add Migration Point'}
                </button>
            </div>
        </div>
    );
};

export default CreateMigrationPoint;
