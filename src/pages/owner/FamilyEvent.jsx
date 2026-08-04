import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Calendar,
    MapPin,
    Users,
    Bell,
    Search,
    Filter,
    ChevronDown,
    Share2,
    CalendarPlus,
    MoreVertical,
    CheckCircle2,
    XCircle,
    HelpCircle,
    Plus,
    Clock,
    Lock,
    AlertTriangle,
    Info
} from 'lucide-react';

const RSVPStatus = ({ status }) => {
    const configs = {
        'Accepted': { color: 'bg-emerald-500', icon: CheckCircle2, text: 'Attending' },
        'Declined': { color: 'bg-rose-500', icon: XCircle, text: 'Not Attending' },
        'Maybe': { color: 'bg-amber-500', icon: HelpCircle, text: 'Tentative' },
        'Pending': { color: 'bg-gray-400', icon: Clock, text: 'Pending' }
    };

    const config = configs[status] || configs['Pending'];
    const Icon = config.icon;

    return (
        <div className={`flex items-center space-x-2 ${config.color} text-white px-4 py-1.5 rounded-full shadow-lg shadow-${config.color.split('-')[1]}-500/20`}>
            <Icon size={14} strokeWidth={3} />
            <span className="text-[10px] font-black uppercase tracking-widest">{config.text}</span>
        </div>
    );
};

const EventCard = ({ id, title, date, time, location, status: initialStatus, attendees, bannerUrl, type, branch, goingCount, maybeCount, declinedCount, onDelete, showConfirm, showAlert }) => {
    const navigate = useNavigate();
    const [status, setStatus] = useState(initialStatus);
    const [showMenu, setShowMenu] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const menuRef = React.useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setShowMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleDelete = () => {
        showConfirm('Are you sure you want to delete this event? This cannot be undone.', async () => {
            setDeleting(true);
            try {
                const baseUrl = import.meta.env.VITE_API_BASE_URL || `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}`;
                const response = await fetch(`${baseUrl}/families/events/${id}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                });
                if (response.ok) {
                    onDelete && onDelete(id);
                    showAlert('Event deleted successfully.', 'success', 'Success');
                } else {
                    const err = await response.json();
                    showAlert('Failed to delete: ' + (err.error || 'Unknown error'), 'error', 'Error');
                }
            } catch (e) {
                showAlert('Network error occurred', 'error', 'Error');
            } finally {
                setDeleting(false);
                setShowMenu(false);
            }
        });
    };

    return (
        <div className="bg-white dark:bg-brand-darkCard rounded-[2.5rem] border border-gray-100 dark:border-brand-darkBorder overflow-hidden shadow-sm hover:shadow-xl dark:hover:shadow-brand-orange/5 transition-all group mb-8 text-left">
            <div className="h-64 relative overflow-hidden bg-gray-50 dark:bg-brand-darkBg/50">
                {bannerUrl && (
                    <img src={bannerUrl} alt={title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity"></div>

                {/* Top Actions */}
                <div className="absolute top-6 right-6 flex space-x-3 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                    <button className="w-10 h-10 bg-white/20 backdrop-blur-md text-white rounded-2xl flex items-center justify-center hover:bg-white/40 transition-colors" title="Share Event">
                        <Share2 size={18} />
                    </button>
                    <button className="w-10 h-10 bg-white/20 backdrop-blur-md text-white rounded-2xl flex items-center justify-center hover:bg-white/40 transition-colors" title="Sync to Calendar">
                        <CalendarPlus size={18} />
                    </button>
                    <div className="relative" ref={menuRef}>
                        <button
                            onClick={() => setShowMenu(!showMenu)}
                            className="w-10 h-10 bg-white/20 backdrop-blur-md text-white rounded-2xl flex items-center justify-center hover:bg-white/40 transition-colors"
                        >
                            <MoreVertical size={18} />
                        </button>

                        {showMenu && (
                            <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-brand-darkCard rounded-2xl shadow-2xl border border-gray-100 dark:border-brand-darkBorder py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        navigate(`/owner/events/edit/${id}`);
                                        setShowMenu(false);
                                    }}
                                    className="w-full text-left px-4 py-3 text-xs font-black text-gray-700 dark:text-brand-darkText hover:bg-orange-50 dark:hover:bg-brand-orange/10 flex items-center space-x-3 uppercase tracking-widest transition-colors"
                                >
                                    <Clock size={14} className="text-brand-orange" />
                                    <span>Edit Event</span>
                                </button>
                                <button
                                    className="w-full text-left px-4 py-3 text-xs font-black text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 flex items-center space-x-3 uppercase tracking-widest transition-colors disabled:opacity-50"
                                    onClick={(e) => { e.stopPropagation(); handleDelete(); }}
                                    disabled={deleting}
                                >
                                    <XCircle size={14} />
                                    <span>Delete Event</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Status Overlay */}
                <div className="absolute top-6 left-6">
                    <RSVPStatus status={status} />
                </div>

                {/* Banner Info */}
                <div className="absolute bottom-6 left-8 right-8">
                    <div className="flex items-center space-x-3 mb-2">
                        <span className="px-3 py-1 bg-brand-orange text-white text-[9px] font-black uppercase tracking-[0.2em] rounded-lg shadow-lg">
                            {type}
                        </span>
                        <span className="text-[10px] font-bold text-white/80 uppercase tracking-widest">
                            {branch}
                        </span>
                    </div>
                    <h3 className="text-2xl font-black text-white leading-tight drop-shadow-md">{title}</h3>
                </div>
            </div>

            <div className="p-8 flex flex-col lg:flex-row justify-between items-center gap-8">
                <div className="flex items-center space-x-12">
                    <div className="space-y-4">
                        <div className="flex items-center space-x-3 text-sm font-bold text-gray-700 dark:text-gray-300">
                            <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-brand-orange/10 flex items-center justify-center text-brand-orange">
                                <Calendar size={18} strokeWidth={2.5} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter leading-none mb-1">Schedule</p>
                                <p className="text-sm font-black text-gray-900 dark:text-brand-darkText">{date} • {time}</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3 text-sm font-bold text-gray-700 dark:text-gray-300">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-500">
                                <MapPin size={18} strokeWidth={2.5} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter leading-none mb-1">Venue</p>
                                <p className="text-sm font-black text-gray-900 dark:text-brand-darkText">{location}</p>
                            </div>
                        </div>
                    </div>

                    <div className="h-12 w-[1px] bg-gray-100 dark:bg-brand-darkBorder hidden md:block"></div>

                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Lineage Participating</p>
                        <div className="flex -space-x-2.5 overflow-hidden p-1">
                            {attendees.slice(0, 4).map((a, i) => (
                                <img
                                    key={i}
                                    className="inline-block h-10 w-10 rounded-2xl ring-4 ring-white dark:ring-brand-darkCard border border-gray-100 dark:border-brand-darkBorder object-cover hover:scale-110 transition-transform cursor-pointer"
                                    src={a}
                                    alt="Attendee"
                                />
                            ))}
                            {attendees.length > 4 && (
                                <div className="w-10 h-10 rounded-2xl bg-gray-50 dark:bg-brand-darkBg flex items-center justify-center text-[10px] font-black text-gray-400 border border-dashed border-gray-200 dark:border-brand-darkBorder ring-4 ring-white dark:ring-brand-darkCard">
                                    +{attendees.length - 4}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center space-x-3 bg-gray-50 dark:bg-brand-darkBg p-2 rounded-[2rem] border border-gray-100 dark:border-brand-darkBorder">
                    <button
                        onClick={() => setStatus('Accepted')}
                        className={`px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 flex flex-col items-center gap-1 ${status === 'Accepted' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'text-gray-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10'}`}
                    >
                        <div className="flex items-center space-x-2">
                            <CheckCircle2 size={14} strokeWidth={3} />
                            <span>Going</span>
                        </div>
                        <span className={`text-[9px] ${status === 'Accepted' ? 'text-white/80' : 'text-emerald-500/60'}`}>{goingCount} Joined</span>
                    </button>
                    <button
                        onClick={() => setStatus('Maybe')}
                        className={`px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 flex flex-col items-center gap-1 ${status === 'Maybe' ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' : 'text-gray-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10'}`}
                    >
                        <div className="flex items-center space-x-2">
                            <HelpCircle size={14} strokeWidth={3} />
                            <span>Maybe</span>
                        </div>
                        <span className={`text-[9px] ${status === 'Maybe' ? 'text-white/80' : 'text-amber-500/60'}`}>{maybeCount} Tentative</span>
                    </button>
                    <button
                        onClick={() => setStatus('Declined')}
                        className={`px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 flex flex-col items-center gap-1 ${status === 'Declined' ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20' : 'text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10'}`}
                    >
                        <div className="flex items-center space-x-2">
                            <XCircle size={14} strokeWidth={3} />
                            <span>Decline</span>
                        </div>
                        <span className={`text-[9px] ${status === 'Declined' ? 'text-white/80' : 'text-rose-500/60'}`}>{declinedCount} Declined</span>
                    </button>
                </div>
            </div>
        </div >
    );
};

const FamilyEvent = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [events, setEvents] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

    // Custom Modal state & helper functions
    const [modal, setModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        type: 'info', // 'info' | 'confirm' | 'success' | 'error'
        onConfirm: null,
        confirmText: 'Continue',
        cancelText: 'Cancel'
    });

    const showAlert = (message, type = 'info', title = 'System Message') => {
        setModal({
            isOpen: true,
            title,
            message,
            type,
            confirmText: 'OK',
            onConfirm: () => setModal(prev => ({ ...prev, isOpen: false }))
        });
    };

    const showConfirm = (message, onConfirm, title = 'Are you sure?') => {
        setModal({
            isOpen: true,
            title,
            message,
            type: 'confirm',
            confirmText: 'Confirm',
            cancelText: 'Cancel',
            onConfirm: () => {
                setModal(prev => ({ ...prev, isOpen: false }));
                onConfirm();
            }
        });
    };

    const handleProposeEvent = () => {
        if (location.pathname.startsWith('/council')) {
            navigate('/council/events/create');
        } else if (location.pathname.startsWith('/branch')) {
            navigate('/branch/create-event');
        } else {
            navigate('/owner/events/create');
        }
    };

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const baseUrl = import.meta.env.VITE_API_BASE_URL || `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}`;
                const storedUser = JSON.parse(localStorage.getItem('user'));
                // Always use the family-scoped endpoint for the Owner panel
                const familyId = storedUser.family_id || localStorage.getItem('currentFamilySpaceId') || localStorage.getItem('selected_family_id');
                const endpoint = `${baseUrl}/families/${familyId}/events?t=${Date.now()}`;

                const response = await fetch(endpoint, {
                    cache: 'no-store',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                const data = await response.json();

                if (response.ok) {
                    const normalized = data.map(ev => {
                        // Map database status to UI keys (Accepted/Declined/Maybe/Pending)
                        let uiStatus = 'Pending';
                        if (ev.status?.toLowerCase() === 'going' || ev.status?.toLowerCase() === 'accepted') uiStatus = 'Accepted';
                        else if (ev.status?.toLowerCase() === 'declined') uiStatus = 'Declined';
                        else if (ev.status?.toLowerCase() === 'maybe') uiStatus = 'Maybe';

                        return {
                            id: ev.id,
                            title: ev.title,
                            date: ev.date,
                            time: ev.time,
                            location: ev.location || 'TBA',
                            status: uiStatus,
                            type: ev.event_type || 'Gathering',
                            branch: ev.family?.name || ev.branch_name || 'Global Council',
                            attendees: ev.members && ev.members.length > 0 ? ev.members : [],
                            goingCount: ev.going_count || 0,
                            maybeCount: ev.maybe_count || 0,
                            declinedCount: ev.declined_count || 0,
                            bannerUrl: ev.image_url || ev.cover_photo_url || null
                        };
                    });
                    setEvents(normalized);
                }
            } catch (err) {
                console.error('Failed to fetch events:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchEvents();
    }, []);

    const filteredEvents = events.filter(e =>
        e.title.toLowerCase().includes(search.toLowerCase()) ||
        e.location.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="max-w-6xl mx-auto flex flex-col text-left mb-12">
            <header className="flex justify-between items-center mb-16">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 dark:text-brand-darkText leading-none mb-4">Event Registry</h1>
                    <div className="flex items-center space-x-6">
                        <div className="flex items-center space-x-2">
                            <Users size={14} className="text-brand-orange" />
                            <span className="text-[10px] font-black text-brand-orange uppercase tracking-[0.2em]">{events.length} Active Events</span>
                        </div>
                        <div className="w-1.5 h-1.5 rounded-full bg-gray-200 dark:bg-brand-darkBorder"></div>
                        <div className="flex items-center space-x-2">
                            <Bell size={14} className="text-gray-400" />
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">0 Requests</span>
                        </div>
                    </div>
                </div>

                <button
                    onClick={handleProposeEvent}
                    className="group bg-brand-orange text-white px-10 py-5 rounded-[2rem] font-black text-sm shadow-xl shadow-brand-orange/20 hover:bg-orange-600 transition-all active:scale-95 flex items-center space-x-4"
                >
                    <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Plus size={20} strokeWidth={3} />
                    </div>
                    <span>Propose Event</span>
                </button>
            </header>

            {/* Advanced Filters */}
            <div className="flex flex-col lg:flex-row gap-6 mb-12">
                <div className="relative flex-1 group">
                    <input
                        type="text"
                        placeholder="Search events by name or location..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-white dark:bg-brand-darkCard border border-gray-100 dark:border-brand-darkBorder rounded-3xl py-6 px-16 text-sm font-bold text-gray-800 dark:text-brand-darkText outline-none shadow-sm focus:ring-8 focus:ring-brand-orange/5 transition-all dark:placeholder:text-gray-600"
                    />
                    <Search className="w-6 h-6 absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-brand-orange transition-colors" />
                </div>

                <div className="flex items-center space-x-4">
                    <div className="bg-white dark:bg-brand-darkCard border border-gray-100 dark:border-brand-darkBorder rounded-3xl flex items-center p-1.5 shadow-sm">
                        <button className="flex items-center space-x-3 px-6 py-4.5 rounded-2xl text-[10px] font-black text-gray-400 uppercase tracking-widest hover:bg-orange-50 dark:hover:bg-brand-darkBg transition-all">
                            <Filter size={16} />
                            <span>Type</span>
                            <ChevronDown size={14} strokeWidth={3} />
                        </button>
                        <div className="w-[1px] h-8 bg-gray-50 dark:bg-brand-darkBorder mx-1"></div>
                        <button className="flex items-center space-x-3 px-6 py-4.5 rounded-2xl text-[10px] font-black text-gray-400 uppercase tracking-widest hover:bg-orange-50 dark:hover:bg-brand-darkBg transition-all">
                            <Users size={16} />
                            <span>Branch</span>
                            <ChevronDown size={14} strokeWidth={3} />
                        </button>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                {loading ? (
                    <p className="text-center py-20 text-gray-400 italic font-bold uppercase tracking-widest">Loading registry...</p>
                ) : filteredEvents.length > 0 ? (
                    filteredEvents.map((event, index) => (
                        <EventCard
                            key={event.id || index}
                            {...event}
                            onDelete={(deletedId) => setEvents(prev => prev.filter(e => e.id !== deletedId))}
                            showConfirm={showConfirm}
                            showAlert={showAlert}
                        />
                    ))
                ) : (
                    <p className="text-center py-20 text-gray-400 italic font-bold uppercase tracking-widest">No events found in this category.</p>
                )}
            </div>

            <div className="mt-16 flex flex-col items-center">
                <div className="bg-white/50 dark:bg-brand-darkCard/50 backdrop-blur-md px-10 py-6 rounded-[2rem] border border-gray-100 dark:border-brand-darkBorder shadow-sm text-center">
                    <p className="text-sm font-black text-gray-300 dark:text-gray-600 uppercase tracking-[0.3em]">End of Registry</p>
                </div>
            </div>

            {/* Custom Confirmation/Alert Modal */}
            {modal.isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-brand-darkCard rounded-[2.5rem] border border-gray-150 dark:border-brand-darkBorder p-8 max-w-md w-full shadow-2xl relative text-center transform scale-100 transition-all duration-300">
                        <div className={`w-16 h-16 rounded-3xl mx-auto flex items-center justify-center mb-6 shadow-sm ${
                            modal.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500' :
                            modal.type === 'error' ? 'bg-rose-50 dark:bg-rose-500/10 text-rose-500' :
                            modal.type === 'confirm' ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-500' :
                            'bg-blue-50 dark:bg-blue-500/10 text-blue-500'
                        }`}>
                            {modal.type === 'success' && <CheckCircle2 className="w-8 h-8" />}
                            {modal.type === 'error' && <Lock className="w-8 h-8" />}
                            {modal.type === 'confirm' && <AlertTriangle className="w-8 h-8" />}
                            {modal.type === 'info' && <Info className="w-8 h-8" />}
                        </div>
                        <h3 className="text-xl font-extrabold text-gray-900 dark:text-brand-darkText mb-3">
                            {modal.title}
                        </h3>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
                            {modal.message}
                        </p>
                        <div className="flex gap-4">
                            {modal.type === 'confirm' && (
                                <button
                                    onClick={() => setModal(prev => ({ ...prev, isOpen: false }))}
                                    className="flex-1 py-4 bg-gray-100 dark:bg-brand-darkBg text-gray-600 dark:text-brand-darkText rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-gray-250 dark:hover:bg-brand-darkBorder transition-all active:scale-95"
                                >
                                    {modal.cancelText}
                                </button>
                            )}
                            <button 
                                onClick={modal.onConfirm}
                                className="flex-1 py-4 bg-brand-orange text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-orange-600 transition-all active:scale-95 shadow-lg shadow-brand-orange/20"
                            >
                                {modal.confirmText}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FamilyEvent;
