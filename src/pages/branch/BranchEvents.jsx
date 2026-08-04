import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, User, Clock, CalendarPlus, ChevronDown, CheckCircle2, XCircle, HelpCircle, Loader2, Info, Phone, Mail, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Notification from '../../components/common/Notification';

const RSVPButton = ({ currentRSVP, onRSVP, isUpdating }) => {
    const configs = {
        'Join Now': { icon: CalendarPlus, label: 'RSVP Now', color: 'bg-brand-orange text-white' },
        'attending': { icon: CheckCircle2, label: 'Attending', color: 'bg-green-500 text-white' },
        'going': { icon: CheckCircle2, label: 'Attending', color: 'bg-green-500 text-white' },
        'not attended': { icon: XCircle, label: 'Declined', color: 'bg-red-500 text-white' },
        'no': { icon: XCircle, label: 'Declined', color: 'bg-red-500 text-white' },
        'maybe': { icon: HelpCircle, label: 'Maybe', color: 'bg-orange-400 text-white' },
    };

    const displayStatus = currentRSVP?.toLowerCase() || 'Join Now';
    const config = configs[displayStatus] || configs['Join Now'];
    const Icon = config.icon;

    return (
        <div className="relative group">
            <button 
                disabled={isUpdating}
                className={`px-8 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-lg transition-all active:scale-95 disabled:opacity-50 ${config.color}`}
            >
                {isUpdating ? <Loader2 size={14} className="animate-spin" /> : <Icon size={14} />} 
                {config.label} <ChevronDown size={14} className="opacity-50" />
            </button>
            {!isUpdating && (
                <div className="absolute bottom-full right-0 mb-2 invisible group-hover:visible bg-white dark:bg-brand-darkCard border border-gray-100 dark:border-brand-darkBorder rounded-2xl shadow-xl p-2 z-50 min-w-[160px] animate-fadeIn">
                    {[
                        { val: 'going', label: 'Attending' },
                        { val: 'no', label: 'Not Attending' },
                        { val: 'maybe', label: 'Maybe' }
                    ].map(opt => (
                        <button
                            key={opt.val}
                            onClick={() => onRSVP(opt.val)}
                            className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-brand-darkBg rounded-xl transition-colors text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-brand-orange"
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

const EventCard = ({ id, title, type, date, time, location, rsvpStatus, banner, description, organizer, organizer_email, organizer_phone, attendees = [], goingCount = 0, isShared, onStatusUpdate }) => {
    const [isUpdating, setIsUpdating] = useState(false);

    const handleRSVP = async (newStatus) => {
        setIsUpdating(true);
        try {
            const token = localStorage.getItem('token');
            const baseUrl = import.meta.env.VITE_API_BASE_URL || `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}`;
            
            const response = await fetch(`${baseUrl}/admin/branch/events/rsvp/${id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (response.ok) {
                onStatusUpdate();
            }
        } catch (err) {
            console.error('RSVP Update Error:', err);
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div className="bg-white dark:bg-brand-darkCard rounded-[3rem] overflow-hidden border border-gray-100 dark:border-brand-darkBorder shadow-sm transition-all hover:shadow-xl dark:hover:shadow-brand-orange/5 group flex flex-col xl:flex-row mb-8 text-left">
            <div className="xl:w-[400px] h-[400px] xl:h-auto overflow-hidden relative shrink-0 bg-gray-100 dark:bg-brand-darkBg flex items-center justify-center">
                {banner ? (
                    <img src={banner} alt={title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                ) : (
                    <div className="flex flex-col items-center gap-2 text-gray-300">
                        <Calendar size={48} strokeWidth={1} />
                        <span className="text-[10px] font-black uppercase tracking-widest">No Cover Image</span>
                    </div>
                )}
                <div className="absolute top-6 left-6 flex flex-col gap-2">
                    <span className="bg-gray-900/80 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-white shadow-sm">
                        {type || 'Registry Event'}
                    </span>
                    {isShared && (
                        <span className="bg-brand-orange/90 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-white shadow-sm flex items-center gap-1.5">
                            <Globe size={10} /> Family Wide
                        </span>
                    )}
                </div>
            </div>

            <div className="p-10 flex-1 flex flex-col justify-between">
                <div>
                    <h3 className="text-[28px] font-black text-brand-orange mb-4 leading-tight">{title}</h3>
                    <p className="text-xs font-bold text-gray-400 dark:text-gray-500 mb-8 leading-relaxed max-w-2xl">{description}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 mb-10">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-2xl bg-orange-50 dark:bg-brand-orange/10 flex items-center justify-center text-brand-orange">
                                <Clock size={18} />
                            </div>
                            <span className="text-xs font-black text-gray-700 dark:text-brand-darkText">{date} • {time}</span>
                        </div>
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-2xl bg-orange-50 dark:bg-brand-orange/10 flex items-center justify-center text-brand-orange">
                                <MapPin size={18} />
                            </div>
                            <span className="text-xs font-black text-gray-700 dark:text-brand-darkText">{location}</span>
                        </div>
                    </div>

                    <div className="bg-gray-50/50 dark:bg-brand-darkBg/50 border border-gray-100 dark:border-brand-darkBorder/50 rounded-[2rem] p-8 mb-8 relative">
                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                            <User size={12} className="text-brand-orange" /> Event Organizer & Contact
                        </h4>
                        <div className="flex flex-wrap items-center gap-x-12 gap-y-6">
                            <div className="flex items-center gap-4">
                                <div className="flex flex-col border-r border-gray-200 dark:border-brand-darkBorder pr-6">
                                    <span className="text-sm font-black text-gray-900 dark:text-brand-darkText">{organizer}</span>
                                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tight">Main Host</span>
                                </div>
                                <span className="text-xs font-bold text-gray-700 dark:text-brand-darkText ml-2">{organizer}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-500">
                                <Phone size={14} className="text-brand-orange" />
                                <span className="text-xs font-bold">{organizer_phone || '-'}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-500">
                                <Mail size={14} className="text-brand-orange" />
                                <span className="text-xs font-bold">{organizer_email || '-'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-8 pt-8 border-t border-gray-50 dark:border-brand-darkBorder">
                    <div className="flex -space-x-3 items-center">
                        <div className="flex -space-x-3">
                            {attendees.slice(0, 5).map((avatar, i) => (
                                <div key={i} className="w-[38px] h-[38px] rounded-full border-4 border-white dark:border-brand-darkCard overflow-hidden shadow-sm">
                                    <img src={avatar || `https://i.pravatar.cc/100?u=${i}`} alt="attendee" className="w-full h-full object-cover" />
                                </div>
                            ))}
                        </div>
                        <span className="ml-6 text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            <User size={12} className="text-gray-400" />
                            +{goingCount} Attending the event
                        </span>
                    </div>

                    <div className="flex items-center gap-3">
                        <button className="p-4 rounded-2xl bg-gray-900 text-white hover:bg-black transition-all shadow-lg">
                            <CalendarPlus size={20} />
                        </button>
                        <RSVPButton
                            currentRSVP={rsvpStatus}
                            onRSVP={handleRSVP}
                            isUpdating={isUpdating}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

const BranchEvents = () => {
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState({ message: '', type: 'success' });

    const fetchEvents = async () => {
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const token = localStorage.getItem('token');
            const branchId = user?.branch_id || '6b8eb992-571f-4637-b031-a56007560cad';
            const baseUrl = import.meta.env.VITE_API_BASE_URL || `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}`;

            const response = await fetch(`${baseUrl}/admin/branch/events/${branchId}?_t=${Date.now()}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            
            const formatted = data.map(ev => ({
                id: ev.id,
                title: ev.title,
                type: 'Registry Event',
                date: new Date(ev.start_date).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' }),
                time: ev.event_time || new Date(ev.start_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                location: ev.location || 'Ancestral Grounds',
                rsvpStatus: ev.user_rsvp_status || 'Join Now',
                banner: ev.cover_image,
                description: ev.description || 'A gathering of family and lineage to share history and strengthen bonds.',
                organizer: ev.organizer_name || 'Branch Lead',
                organizer_email: ev.organizer_email,
                organizer_phone: ev.organizer_phone,
                isShared: ev.family_space_id !== null,
                attendees: ev.attendees || [],
                goingCount: ev.going_count || 0
            }));
            
            setEvents(formatted);
            setLoading(false);
        } catch (err) {
            console.error('>>> [FETCH_EVENTS_ERROR]', err);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="animate-spin text-brand-orange" size={40} />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto text-left py-4 px-4 sm:px-0">
            <Notification 
                message={notification.message} 
                type={notification.type} 
                onClose={() => setNotification({ message: '', type: 'success' })} 
            />
            <header className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-12 space-y-6 xl:space-y-0 pt-6">
                <div>
                    <h2 className="text-gray-900 dark:text-brand-darkText text-sm font-bold opacity-30 dark:opacity-40 mb-1 uppercase tracking-widest leading-none">Lineage Gatherings</h2>
                    <h1 className="text-3xl sm:text-[40px] font-black text-gray-900 dark:text-brand-darkText leading-none transition-colors">Branch Events</h1>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full xl:w-auto">
                    <div className="relative w-full sm:w-80">
                        <input type="text" placeholder="Search lineage events..." className="w-full bg-white dark:bg-brand-darkCard border border-gray-100 dark:border-brand-darkBorder rounded-xl py-4.5 px-12 text-sm font-bold text-gray-800 dark:text-brand-darkText outline-none focus:border-brand-orange/20 dark:focus:border-brand-orange/40 transition-all placeholder:text-gray-400 dark:placeholder:text-gray-600 shadow-xs" />
                        <Calendar className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-brand-orange" />
                    </div>
                    <button onClick={() => navigate('/branch/create-event')} className="bg-brand-orange text-white px-12 py-4.5 rounded-xl font-black text-xs shadow-xl shadow-brand-orange/20 hover:bg-orange-600 transition-all active:scale-95 leading-none w-full sm:w-fit text-center uppercase tracking-[0.1em]">
                        Add Event
                    </button>
                </div>
            </header>

            <div className="space-y-12 pb-20">
                {events.map((event) => (
                    <EventCard 
                        key={event.id} 
                        {...event} 
                        onStatusUpdate={() => {
                            setNotification({ message: 'RSVP updated!', type: 'success' });
                            fetchEvents();
                        }}
                    />
                ))}
                
                {events.length === 0 && (
                    <div className="py-24 text-center border-2 border-dashed border-gray-100 dark:border-brand-darkBorder rounded-[3rem] bg-gray-50/30 dark:bg-brand-darkBg/10">
                        <div className="w-16 h-16 bg-white dark:bg-brand-darkCard rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                            <Info className="text-gray-300" size={32} />
                        </div>
                        <h3 className="text-lg font-black text-gray-900 dark:text-brand-darkText uppercase tracking-tight mb-2">No Active Events</h3>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Start a new family gathering to strengthen your branch ties.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BranchEvents;
