import React, { useState, useEffect, useMemo, useRef } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}`;

const AssetCard = ({ id, url, type, visibility, created_at, metadata, tags = [], events = [], onTag, onLinkEvent, onDelete }) => {
    const year = metadata?.year || new Date(created_at).getFullYear();
    const title = metadata?.title || metadata?.original_name || 'Untitled Record';
    const persons = tags.map(t => t.person?.full_name || 'Unknown Person');

    return (
        <div className="bg-white dark:bg-brand-darkCard rounded-3xl border border-gray-100 dark:border-brand-darkBorder shadow-sm overflow-hidden flex flex-col group hover:shadow-xl dark:hover:shadow-brand-orange/5 transition-all cursor-pointer border-b-4 border-b-transparent hover:border-b-brand-orange">
            <div className="aspect-square overflow-hidden relative">
                {type === 'video' ? (
                    <div className="w-full h-full bg-black flex items-center justify-center">
                        <svg className="w-12 h-12 text-white/50" fill="currentColor" viewBox="0 0 20 20"><path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.333-5.89a1.5 1.5 0 000-2.538L6.3 2.841z" /></svg>
                    </div>
                ) : type === 'document' ? (
                    <div className="w-full h-full bg-gray-100 dark:bg-brand-darkBg flex items-center justify-center">
                        <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2-2z" /></svg>
                    </div>
                ) : (
                    <img src={url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={title || "Asset"} />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                    <h4 className="text-xs font-bold text-white leading-tight mb-2 truncate">{title}</h4>
                    <div className="flex gap-2">
                        <button 
                            onClick={(e) => { e.stopPropagation(); onLinkEvent({ id, title, metadata }); }}
                            className="bg-white/20 hover:bg-white/40 backdrop-blur-md text-white text-[8px] font-black px-2 py-1 rounded uppercase tracking-widest transition-colors flex items-center gap-1"
                        >
                            <svg className="w-2 h-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                            {metadata?.event_id ? (events.find(e => e.id === metadata.event_id)?.title || 'Linked to Event') : 'Link to Event'}
                        </button>
                    </div>
                </div>
                {/* Visibility Badge */}
                <div className="absolute top-4 left-4 z-10">
                    <span className={`px-3 py-1 rounded-full text-[7px] font-black uppercase tracking-widest shadow-sm ${
                        visibility?.toLowerCase() === 'public' ? 'bg-green-500 text-white' :
                        visibility?.toLowerCase() === 'family' ? 'bg-brand-orange text-white' :
                        'bg-blue-500 text-white'
                    }`}>
                        {visibility || 'Family'}
                    </span>
                </div>

                {tags.length > 0 && (
                    <div className="absolute top-4 right-4 flex -space-x-2">
                        {tags.slice(0, 3).map((tag, i) => (
                            <div key={i} className="w-6 h-6 rounded-full border-2 border-white dark:border-brand-darkCard bg-orange-50 overflow-hidden shadow-sm">
                                <img src={tag.person?.avatar_url || `https://ui-avatars.com/api/?name=${tag.person?.full_name}&background=random`} alt={tag.person?.full_name} className="w-full h-full object-cover" />
                            </div>
                        ))}
                        {tags.length > 3 && (
                            <div className="w-6 h-6 rounded-full border-2 border-white dark:border-brand-darkCard bg-gray-900 flex items-center justify-center text-[8px] font-black text-white">
                                +{tags.length - 3}
                            </div>
                        )}
                    </div>
                )}
            </div>
            <div className="p-4 flex justify-between items-center">
                <div className="text-left flex-1 min-w-0 mr-2">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-[9px] font-black text-brand-orange uppercase tracking-widest leading-none shrink-0">{year}</span>
                    </div>
                    <h4 className="text-[11px] font-bold text-gray-900 dark:text-brand-darkText truncate uppercase tracking-tighter">{title || "Untitled Record"}</h4>
                </div>
                <div className="flex items-center space-x-2 shrink-0">
                    <button
                        onClick={(e) => { e.stopPropagation(); onTag({ id, title, tags }); }}
                        className="w-8 h-8 rounded-xl bg-gray-50 dark:bg-brand-darkBg flex items-center justify-center text-gray-400 hover:text-brand-orange hover:bg-brand-active transition-colors"
                        title="Tag Persons"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 7h.01M7 3h10a2 2 0 012 2v14a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2z" /></svg>
                    </button>
                </div>
            </div>
        </div>
    );
};

const EventLinkModal = ({ isOpen, onClose, asset, events = [], onLink }) => {
    if (!isOpen || !asset) return null;

    const selectedEvent = events.find(e => e.id === asset.metadata?.event_id);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative bg-white dark:bg-brand-darkCard w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100 dark:border-brand-darkBorder p-8 sm:p-10 animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h3 className="text-lg font-black text-gray-900 dark:text-brand-darkText uppercase tracking-tighter">Link to Event</h3>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Associate "{asset.title || 'this asset'}" with an event</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <div className="space-y-3 max-h-80 overflow-y-auto no-scrollbar">
                    {events.length > 0 ? (
                        events.map((event) => (
                            <button
                                key={event.id}
                                onClick={() => onLink(asset.id, event.id)}
                                className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all border ${
                                    asset.metadata?.event_id === event.id 
                                        ? 'bg-orange-50 dark:bg-brand-orange/10 border-brand-orange/50 text-brand-orange' 
                                        : 'bg-gray-50 dark:bg-brand-darkBg border-transparent text-gray-700 dark:text-brand-darkText hover:border-gray-200'
                                }`}
                            >
                                <div className="text-left">
                                    <div className="text-xs font-bold uppercase tracking-tight">{event.title || 'Untitled Event'}</div>
                                    <div className="text-[9px] font-medium opacity-50">{event.start_date ? new Date(event.start_date).toLocaleDateString() : 'No Date'} {event.location ? `• ${event.location}` : ''}</div>
                                </div>
                                {asset.metadata?.event_id === event.id && (
                                    <svg className="w-5 h-5 text-brand-orange" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                                )}
                            </button>
                        ))
                    ) : (
                        <div className="py-10 text-center">
                            <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">No family events found</p>
                        </div>
                    )}
                </div>

                <div className="flex gap-4 pt-8">
                    <button onClick={onClose} className="flex-1 px-8 py-4 bg-gray-100 dark:bg-brand-darkBg text-gray-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-200 transition-colors">Close</button>
                </div>
            </div>
        </div>
    );
};

const TaggingModal = ({ isOpen, onClose, asset, allPersons = [], onToggleTag }) => {
    const [search, setSearch] = useState('');
    if (!isOpen || !asset) return null;

    const taggedIds = new Set(asset.tags?.map(t => t.person?.id));
    const filteredPersons = allPersons.filter(p => 
        p.full_name?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative bg-white dark:bg-brand-darkCard w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100 dark:border-brand-darkBorder p-8 sm:p-10 animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h3 className="text-lg font-black text-gray-900 dark:text-brand-darkText uppercase tracking-tighter">Person Tagging</h3>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Link family members to "{asset.title}"</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <div className="space-y-6">
                    <div className="relative">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-brand-darkBg border border-transparent rounded-2xl focus:ring-2 focus:ring-brand-orange/20 text-gray-900 dark:text-brand-darkText font-bold text-xs transition-all"
                            placeholder="Search family members..."
                        />
                        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </div>

                    <div className="space-y-2 max-h-64 overflow-y-auto no-scrollbar">
                        {filteredPersons.length > 0 ? (
                            filteredPersons.map((person) => (
                                <label key={person.id} className="flex items-center gap-4 p-4 hover:bg-orange-50 dark:hover:bg-brand-orange/5 rounded-2xl cursor-pointer transition-colors group">
                                    <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-brand-orange/20 overflow-hidden shrink-0">
                                        <img src={person.avatar_url || `https://ui-avatars.com/api/?name=${person.full_name}&background=random`} alt={person.full_name} className="w-full h-full object-cover" />
                                    </div>
                                    <span className="flex-1 text-xs font-bold text-gray-700 dark:text-brand-darkText">{person.full_name}</span>
                                    <input 
                                        type="checkbox" 
                                        checked={taggedIds.has(person.id)}
                                        onChange={() => onToggleTag(asset.id, person.id, taggedIds.has(person.id))}
                                        className="w-5 h-5 accent-brand-orange rounded-md border-gray-300" 
                                    />
                                </label>
                            ))
                        ) : (
                            <div className="py-10 text-center">
                                <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">No family members found</p>
                            </div>
                        )}
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button onClick={onClose} className="flex-1 px-8 py-4 bg-gray-100 dark:bg-brand-darkBg text-gray-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-200 transition-colors">Close</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const MediaRepository = () => {
    const [taggingModal, setTaggingModal] = useState({ open: false, asset: null });
    const [eventModal, setEventModal] = useState({ open: false, asset: null });
    const [media, setMedia] = useState([]);
    const [persons, setPersons] = useState([]);
    const [stats, setStats] = useState(null);
    const [statusModal, setStatusModal] = useState({ show: false, type: 'success', title: '', message: '' });
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [visibility, setVisibility] = useState('Family');
    const [sortBy, setSortBy] = useState('newest');
    const [uploading, setUploading] = useState(false);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [uploadForm, setUploadForm] = useState({
        title: '',
        location: '',
        visibility: 'Family',
        event_id: '',
        event_title: ''
    });
    const [events, setEvents] = useState([]);
    const [showEventList, setShowEventList] = useState(false);
    const fileInputRef = useRef(null);

    const familyId = useMemo(() => {
        try {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            return localStorage.getItem('selected_family_id') || user?.family_id || user?.family_space_id || 'd8eefc0a-6497-4bf5-8077-f2b35a3ed5cd';
        } catch {
            return localStorage.getItem('selected_family_id') || 'd8eefc0a-6497-4bf5-8077-f2b35a3ed5cd';
        }
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const [mediaRes, dashRes, personsRes, eventsRes] = await Promise.all([
                fetch(`${API_BASE}/family-admin/${familyId}/media`, { headers: { Authorization: `Bearer ${token}` } }),
                fetch(`${API_BASE}/family-admin/${familyId}/dashboard`, { headers: { Authorization: `Bearer ${token}` } }),
                fetch(`${API_BASE}/family-admin/${familyId}/persons`, { headers: { Authorization: `Bearer ${token}` } }),
                fetch(`${API_BASE}/family-admin/${familyId}/events`, { headers: { Authorization: `Bearer ${token}` } })
            ]);

            const mediaData = await mediaRes.json();
            const dashData = await dashRes.json();
            const personsData = await personsRes.json();
            const eventsData = await eventsRes.json();

            console.log('>>> FETCH DATA SUCCESS:', {
                mediaCount: (mediaData.media || []).length,
                personsCount: (personsData || []).length,
                eventsCount: (eventsData || []).length
            });

            if (mediaRes.ok) setMedia(mediaData.media || []);
            if (dashRes.ok) setStats(dashData.stats || null);
            if (personsRes.ok) setPersons(personsData.persons || []);
            if (eventsRes.ok) setEvents(eventsData || []);
        } catch (err) {
            console.error('>>> FETCH DATA ERROR:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [familyId]);

    const handleUpload = async (file) => {
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);
        formData.append('visibility', uploadForm.visibility.toLowerCase());
        formData.append('title', uploadForm.title);
        formData.append('location', uploadForm.location);
        formData.append('event_id', uploadForm.event_id);

        try {
            setUploading(true);
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE}/family-admin/${familyId}/media`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: formData
            });

            if (res.ok) {
                fetchData();
                setShowUploadModal(false);
                setUploadForm({ title: '', location: '', visibility: 'Family', event_id: '', event_title: '' });
                setStatusModal({
                    show: true,
                    type: 'success',
                    title: 'Upload Successful',
                    message: 'Your asset has been securely uploaded and is now available in the repository.'
                });
            } else {
                const data = await res.json();
                setStatusModal({
                    show: true,
                    type: 'error',
                    title: 'Upload Failed',
                    message: (data.error || 'We encountered an error while uploading your file.') + ` (Space ID: ${familyId})`
                });
            }
        } catch (err) {
            setStatusModal({
                show: true,
                type: 'error',
                title: 'Upload Failed',
                message: err.message
            });
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this asset?')) return;
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE}/family-admin/${familyId}/media/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                fetchData();
                setStatusModal({
                    show: true,
                    type: 'success',
                    title: 'Asset Deleted',
                    message: 'the media asset has been permanently removed from the repository.'
                });
            }
        } catch (err) {
            setStatusModal({
                show: true,
                type: 'error',
                title: 'Deletion Failed',
                message: err.message
            });
        }
    };

    const handleToggleTag = async (mediaId, personId, isTagged) => {
        // Optimistic Update
        const previousMedia = [...media];
        const updatedMedia = media.map(m => {
            if (m.id === mediaId) {
                const newTags = isTagged 
                    ? m.tags.filter(t => t.person?.id !== personId)
                    : [...(m.tags || []), { person: persons.find(p => p.id === personId) }];
                return { ...m, tags: newTags };
            }
            return m;
        });
        
        setMedia(updatedMedia);
        if (taggingModal.asset?.id === mediaId) {
            const currentAsset = updatedMedia.find(m => m.id === mediaId);
            setTaggingModal(prev => ({
                ...prev,
                asset: currentAsset
            }));
        }

        try {
            const token = localStorage.getItem('token');
            const method = isTagged ? 'DELETE' : 'POST';
            const url = isTagged 
                ? `${API_BASE}/family-admin/${familyId}/media/${mediaId}/tags/${personId}`
                : `${API_BASE}/family-admin/${familyId}/media/${mediaId}/tags`;
            
            const res = await fetch(url, {
                method,
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: isTagged ? null : JSON.stringify({ personId })
            });

            if (!res.ok) throw new Error('Failed to update tag on server');
        } catch (err) {
            // Rollback on error
            setMedia(previousMedia);
            if (taggingModal.asset?.id === mediaId) {
                const prevAsset = previousMedia.find(m => m.id === mediaId);
                setTaggingModal(prev => ({
                    ...prev,
                    asset: prevAsset
                }));
            }

            setStatusModal({
                show: true,
                type: 'error',
                title: 'Tagging Failed',
                message: err.message
            });
        }
    };

    const handleLinkEvent = async (mediaId, eventId) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE}/family-admin/${familyId}/media/${mediaId}/link-event`, {
                method: 'POST',
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ eventId })
            });

            if (res.ok) {
                const updatedMedia = media.map(m => {
                    if (m.id === mediaId) {
                        return { ...m, metadata: { ...m.metadata, event_id: eventId } };
                    }
                    return m;
                });
                setMedia(updatedMedia);
                setEventModal({ open: false, asset: null });
                setStatusModal({
                    show: true,
                    type: 'success',
                    title: 'Linked Successfully',
                    message: 'Asset has been successfully linked to the family event.'
                });
            }
        } catch (err) {
            setStatusModal({
                show: true,
                type: 'error',
                title: 'Linking Failed',
                message: err.message
            });
        }
    };

    const storageUsed = stats?.storage_used || 0;
    const storageLimit = (stats?.storage_limit_gb || 200) * 1024 * 1024 * 1024;
    const storagePercent = Math.min(100, Math.round((storageUsed / storageLimit) * 100)) || 0;
    const storageUsedGB = (storageUsed / (1024 * 1024 * 1024)).toFixed(1);

    const filteredMedia = media
        .filter(m => {
            const matchesVisibility = m.visibility?.toLowerCase() === visibility.toLowerCase();
            const matchesSearch = !search || 
                m.metadata?.title?.toLowerCase().includes(search.toLowerCase()) ||
                m.metadata?.location?.toLowerCase().includes(search.toLowerCase()) ||
                m.tags?.some(t => t.person?.full_name?.toLowerCase().includes(search.toLowerCase()));
            return matchesVisibility && matchesSearch;
        })
        .sort((a, b) => {
            if (sortBy === 'newest') return new Date(b.created_at) - new Date(a.created_at);
            if (sortBy === 'oldest') return new Date(a.created_at) - new Date(b.created_at);
            if (sortBy === 'alpha') return (a.metadata?.title || '').localeCompare(b.metadata?.title || '');
            return 0;
        });

    return (
        <div className="flex flex-col">
            <header className="mb-10 text-left">
                <h2 className="text-gray-900 dark:text-brand-darkText text-sm font-bold opacity-30 dark:opacity-40 mb-2 uppercase tracking-widest">Kinecore</h2>
                <h1 className="text-4xl font-extrabold text-gray-900 dark:text-brand-darkText mb-8">Media Repository Assets Grid</h1>

                {/* Storage Usage */}
                <div className="mb-10">
                    <h3 className="text-sm font-extrabold text-gray-900 dark:text-brand-darkText mb-4">Storage Usage</h3>
                    <div className="flex justify-between items-end mb-2">
                        <p className="text-sm font-bold text-gray-800 dark:text-brand-darkText">{storageUsedGB} GB of {stats?.storage_limit_gb || 200} GB used</p>
                        <p className="text-xs font-extrabold text-gray-900 dark:text-brand-darkText opacity-60">{storagePercent}%</p>
                    </div>
                    <div className="w-full h-3 bg-gray-100 dark:bg-brand-darkBg rounded-full overflow-hidden transition-colors">
                        <div className="h-full bg-brand-dark dark:bg-brand-orange rounded-full transition-all duration-1000" style={{ width: `${storagePercent}%` }}></div>
                    </div>
                </div>

                <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-6 flex-1">
                        <div className="flex items-center">
                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mr-4 shrink-0">Visibility</h3>
                            <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar pb-2 sm:pb-0">
                                {['Public', 'Family', 'Branch'].map(v => (
                                    <button 
                                        key={v}
                                        onClick={() => setVisibility(v)}
                                        className={`${visibility === v ? 'bg-orange-100 dark:bg-brand-orange/20 text-brand-orange' : 'bg-orange-50/50 dark:bg-brand-orange/5 text-brand-orange/60'} px-6 py-2 rounded-xl text-xs font-bold shadow-sm whitespace-nowrap transition-all`}
                                    >
                                        {v}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center relative flex-1 max-w-md">
                            <svg className="absolute left-4 w-4 h-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search by character, year, or location..."
                                className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-brand-darkBg border border-transparent rounded-2xl focus:ring-2 focus:ring-brand-orange/20 text-xs font-bold text-gray-900 dark:text-brand-darkText transition-all"
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-start gap-4">
                        <div className="flex items-center space-x-4 sm:mr-6 text-gray-400 dark:text-gray-500 relative cursor-pointer group">
                            <div className="flex flex-col items-center">
                                <svg className="w-5 h-5 group-hover:text-brand-orange transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
                                <span className="text-[7px] font-black uppercase mt-1 tracking-tighter group-hover:text-brand-orange">Filter</span>
                            </div>
                            <select 
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                title="Sort Assets"
                            >
                                <option value="newest">Newest First</option>
                                <option value="oldest">Oldest First</option>
                                <option value="alpha">Alphabetical</option>
                            </select>
                        </div>
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            className="hidden" 
                            onChange={(e) => {
                                if (e.target.files[0]) {
                                    setShowUploadModal(true);
                                }
                            }}
                            accept="image/*,video/*,application/pdf"
                        />
                        <button 
                            onClick={() => fileInputRef.current.click()}
                            className="bg-brand-orange text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-brand-orange/20 hover:bg-orange-600 flex items-center space-x-2 text-sm shrink-0"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
                            <span>Upload</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Upload Modal */}
            {showUploadModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-brand-darkBg rounded-[2rem] w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="p-8">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-brand-darkText">Upload Asset</h3>
                                <button onClick={() => setShowUploadModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Asset Title</label>
                                    <input 
                                        type="text"
                                        placeholder="e.g. Grandma's Garden 1950"
                                        value={uploadForm.title}
                                        onChange={(e) => setUploadForm(prev => ({ ...prev, title: e.target.value }))}
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-brand-dark/50 border border-transparent rounded-xl focus:ring-2 focus:ring-brand-orange/20 text-xs font-bold text-gray-900 dark:text-brand-darkText outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Location</label>
                                    <input 
                                        type="text"
                                        placeholder="e.g. Chicago, IL"
                                        value={uploadForm.location}
                                        onChange={(e) => setUploadForm(prev => ({ ...prev, location: e.target.value }))}
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-brand-dark/50 border border-transparent rounded-xl focus:ring-2 focus:ring-brand-orange/20 text-xs font-bold text-gray-900 dark:text-brand-darkText outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Visibility</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {['Public', 'Family', 'Branch'].map(v => (
                                            <button
                                                key={v}
                                                type="button"
                                                onClick={() => setUploadForm(prev => ({ ...prev, visibility: v }))}
                                                className={`py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${uploadForm.visibility === v ? 'bg-brand-orange text-white' : 'bg-gray-100 dark:bg-brand-dark text-gray-400 hover:bg-gray-200'}`}
                                            >
                                                {v}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="relative">
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Link to Event</label>
                                    <button 
                                        type="button"
                                        onClick={() => setShowEventList(!showEventList)}
                                        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-brand-dark/50 border border-transparent rounded-xl text-xs font-bold text-gray-900 dark:text-brand-darkText hover:bg-gray-100 transition-all"
                                    >
                                        <span className={uploadForm.event_title ? "text-brand-orange" : "text-gray-400"}>
                                            {uploadForm.event_title || "Select Family Event"}
                                        </span>
                                        <svg className={`w-4 h-4 transition-transform ${showEventList ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                    </button>

                                    {showEventList && (
                                        <div className="absolute z-10 bottom-full left-0 right-0 mb-2 bg-white dark:bg-brand-darkCard rounded-2xl shadow-xl border border-gray-100 dark:border-brand-darkBorder overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200">
                                            <div className="max-h-48 overflow-y-auto no-scrollbar">
                                                {events.length > 0 ? (
                                                    events.map(event => (
                                                        <button
                                                            key={event.id}
                                                            type="button"
                                                            onClick={() => {
                                                                setUploadForm(prev => ({ ...prev, event_id: event.id, event_title: event.title }));
                                                                setShowEventList(false);
                                                            }}
                                                            className="w-full text-left px-4 py-3 text-xs font-bold text-gray-700 dark:text-brand-darkText hover:bg-orange-50 dark:hover:bg-brand-orange/5 transition-colors border-b border-gray-50 dark:border-brand-darkBorder last:border-0"
                                                        >
                                                            {event.title}
                                                        </button>
                                                    ))
                                                ) : (
                                                    <div className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">No events found</div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <button 
                                    disabled={uploading}
                                    onClick={() => handleUpload(fileInputRef.current.files[0])}
                                    className="w-full bg-brand-orange text-white py-4 rounded-2xl font-bold shadow-lg shadow-brand-orange/20 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all mt-4 flex items-center justify-center space-x-2"
                                >
                                    {uploading ? (
                                        <>
                                            <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                            <span>Uploading...</span>
                                        </>
                                    ) : (
                                        <span>Confirm Upload</span>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Grid */}
            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {loading ? (
                    [...Array(10)].map((_, i) => (
                        <div key={i} className="aspect-square bg-gray-50 dark:bg-brand-darkBg animate-pulse rounded-3xl" />
                    ))
                ) : filteredMedia.length > 0 ? (
                    filteredMedia.map((asset) => (
                        <AssetCard
                            key={asset.id}
                            {...asset}
                            events={events}
                            onTag={(a) => setTaggingModal({ open: true, asset: a })}
                            onLinkEvent={(asset) => setEventModal({ open: true, asset })}
                            onDelete={handleDelete}
                        />
                    ))
                ) : (
                    <div className="col-span-full py-20 text-center">
                        <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">No assets found in this category</p>
                    </div>
                )}
            </div>

            <TaggingModal 
                isOpen={taggingModal.open}
                onClose={() => setTaggingModal({ open: false, asset: null })}
                asset={taggingModal.asset}
                allPersons={persons}
                onToggleTag={handleToggleTag}
            />

            <EventLinkModal 
                isOpen={eventModal.open}
                onClose={() => setEventModal({ open: false, asset: null })}
                asset={eventModal.asset}
                events={events}
                onLink={handleLinkEvent}
            />

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

export default MediaRepository;
