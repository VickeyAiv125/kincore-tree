import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    Calendar, 
    MapPin, 
    Clock, 
    Users, 
    ArrowLeft,
    Tag,
    User,
    Info,
    CheckCircle2
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}`;

const EventDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchEventDetails = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`${API_BASE}/families/events/${id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (!response.ok) throw new Error('Failed to fetch event details');
                const data = await response.json();
                setEvent(data);
            } catch (err) {
                console.error('Error:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchEventDetails();
    }, [id]);

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <div className="w-12 h-12 border-4 border-brand-orange border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Loading Event Details...</p>
        </div>
    );

    if (error || !event) return (
        <div className="flex flex-col items-center justify-center min-h-screen p-8">
            <p className="text-red-500 font-bold mb-4">{error || 'Event not found'}</p>
            <button onClick={() => navigate(-1)} className="text-brand-orange font-bold underline flex items-center gap-2">
                <ArrowLeft size={16} /> Go Back
            </button>
        </div>
    );

    return (
        <div className="flex flex-col max-w-4xl mx-auto w-full pb-20">
            {/* Header */}
            <header className="flex items-center justify-between mb-8">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center space-x-2 text-gray-500 hover:text-brand-orange transition-colors font-bold text-xs uppercase tracking-widest"
                >
                    <ArrowLeft size={18} />
                    <span>Back to Events</span>
                </button>
                <div className="flex items-center space-x-2 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
                    <CheckCircle2 size={12} />
                    <span>{event.status || 'Active'}</span>
                </div>
            </header>

            {/* Content Card */}
            <div className="bg-white dark:bg-brand-darkCard rounded-[3rem] border border-gray-100 dark:border-brand-darkBorder shadow-xl overflow-hidden transition-colors">
                {/* Banner Image Area */}
                <div className="h-64 md:h-80 w-full overflow-hidden relative bg-gray-100 dark:bg-brand-darkBg flex items-center justify-center">
                    {event.image_url ? (
                        <>
                            <img
                                src={event.image_url}
                                alt={event.title}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center opacity-20">
                            <Tag size={48} className="text-gray-400 mb-2" />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">No Cover Image</span>
                        </div>
                    )}
                    
                    <div className="absolute bottom-8 left-8 right-8 text-left">
                        <span className="inline-block px-3 py-1 bg-brand-orange text-white text-[8px] font-black uppercase tracking-[0.2em] rounded-full mb-3 shadow-lg shadow-brand-orange/20">
                            {event.event_type || 'Family Event'}
                        </span>
                        <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight drop-shadow-md">
                            {event.title}
                        </h1>
                    </div>
                </div>

                <div className="p-8 md:p-12 space-y-10 text-left">
                    {/* Meta Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-orange-50 dark:bg-brand-orange/10 rounded-2xl flex items-center justify-center text-brand-orange shrink-0">
                                <Calendar size={20} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Date</p>
                                <p className="text-xs font-bold text-gray-900 dark:text-brand-darkText">{event.date || new Date(event.start_date).toLocaleDateString()}</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-orange-50 dark:bg-brand-orange/10 rounded-2xl flex items-center justify-center text-brand-orange shrink-0">
                                <Clock size={20} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Time</p>
                                <p className="text-xs font-bold text-gray-900 dark:text-brand-darkText">{event.time || 'TBA'}</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-orange-50 dark:bg-brand-orange/10 rounded-2xl flex items-center justify-center text-brand-orange shrink-0">
                                <MapPin size={20} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Location</p>
                                <p className="text-xs font-bold text-gray-900 dark:text-brand-darkText">{event.location || 'Not Specified'}</p>
                            </div>
                        </div>
                    </div>

                    {/* About Section */}
                    <div className="pt-10 border-t border-gray-50 dark:border-brand-darkBorder/30">
                        <div className="flex items-center space-x-3 mb-6">
                            <div className="w-8 h-8 bg-gray-50 dark:bg-brand-darkBg rounded-xl flex items-center justify-center text-gray-400">
                                <Info size={16} />
                            </div>
                            <h3 className="text-sm font-black text-gray-900 dark:text-brand-darkText uppercase tracking-widest">About the Event</h3>
                        </div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-line">
                            {event.description || 'No description provided for this event.'}
                        </p>
                    </div>

                    {/* Organizer Section */}
                    <div className="pt-10 border-t border-gray-50 dark:border-brand-darkBorder/30 flex flex-wrap gap-12">
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gray-50 dark:bg-brand-darkBg rounded-2xl flex items-center justify-center text-gray-400 overflow-hidden border border-gray-100 dark:border-brand-darkBorder">
                                {event.host_avatar ? (
                                    <img src={event.host_avatar} alt="host" className="w-full h-full object-cover" />
                                ) : (
                                    <User size={20} />
                                )}
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Hosted By</p>
                                <p className="text-xs font-bold text-gray-900 dark:text-brand-darkText">{event.hosted_by || 'Family Admin'}</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gray-50 dark:bg-brand-darkBg rounded-2xl flex items-center justify-center text-gray-400 shrink-0 border border-gray-100 dark:border-brand-darkBorder">
                                <Users size={20} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Total RSVPs</p>
                                <p className="text-xs font-bold text-gray-900 dark:text-brand-darkText">{event.going_count || 0} Attending</p>
                            </div>
                        </div>
                    </div>

                    {/* Ritual & Workflow Section (Dynamic) */}
                    {(event.workflow_steps?.length > 0 || event.dress_code || event.offerings?.length > 0) && (
                        <div className="pt-12 border-t border-gray-50 dark:border-brand-darkBorder/30 space-y-12">
                            {/* Workflow Timeline */}
                            {event.workflow_steps?.length > 0 && (
                                <div>
                                    <div className="flex items-center space-x-3 mb-8">
                                        <div className="w-8 h-8 bg-brand-orange/10 rounded-xl flex items-center justify-center text-brand-orange">
                                            <Clock size={16} />
                                        </div>
                                        <h3 className="text-sm font-black text-gray-900 dark:text-brand-darkText uppercase tracking-widest">Ritual Timeline</h3>
                                    </div>
                                    <div className="space-y-6 pl-4 border-l-2 border-dashed border-gray-100 dark:border-brand-darkBorder/50 ml-4">
                                        {event.workflow_steps.map((step, i) => (
                                            <div key={i} className="relative">
                                                <div className="absolute -left-[25px] top-0 w-4 h-4 rounded-full bg-brand-orange border-4 border-white dark:border-brand-darkCard shadow-sm" />
                                                <div className="bg-gray-50 dark:bg-brand-darkBg/50 p-5 rounded-3xl border border-gray-100 dark:border-brand-darkBorder/30">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <h4 className="text-sm font-extrabold text-gray-900 dark:text-brand-darkText">{step.title}</h4>
                                                        <span className="text-[9px] font-black bg-brand-orange/10 text-brand-orange px-2 py-0.5 rounded uppercase tracking-widest">{step.time}</span>
                                                    </div>
                                                    <p className="text-xs text-gray-500 font-medium mb-3">{step.description}</p>
                                                    <div className="flex items-center text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                                        <User size={10} className="mr-1" /> {step.role}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Requirements Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {event.dress_code && (
                                    <div className="bg-orange-50/30 dark:bg-brand-orange/5 p-6 rounded-[2rem] border border-brand-orange/10">
                                        <p className="text-[10px] font-black text-brand-orange uppercase tracking-widest mb-3">Dress Code</p>
                                        <p className="text-sm font-bold text-gray-900 dark:text-brand-darkText">{event.dress_code}</p>
                                    </div>
                                )}
                                {event.offerings?.length > 0 && (
                                    <div className="bg-emerald-50/30 dark:bg-emerald-500/5 p-6 rounded-[2rem] border border-emerald-500/10">
                                        <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-3">Offerings Checklist</p>
                                        <div className="flex flex-wrap gap-2">
                                            {event.offerings.map((item, i) => (
                                                <span key={i} className="px-3 py-1 bg-white dark:bg-brand-darkBg rounded-lg text-[10px] font-bold text-gray-700 dark:text-gray-300 border border-emerald-100 dark:border-emerald-900/30">{item}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {event.etiquette_notes && (
                                <div className="p-6 bg-gray-50 dark:bg-brand-darkBg/50 rounded-[2rem] border border-gray-100 dark:border-brand-darkBorder/30">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Etiquette & Notes</p>
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 leading-relaxed italic">"{event.etiquette_notes}"</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Invite Scope Details (Metadata) */}
                    <div className="pt-12 border-t border-gray-50 dark:border-brand-darkBorder/30">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="p-4 bg-gray-50/50 dark:bg-brand-darkBg/30 rounded-2xl">
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Audience</p>
                                <p className="text-[11px] font-bold text-gray-700 dark:text-brand-darkText capitalize">{event.audience || 'Entire Family'}</p>
                            </div>
                            <div className="p-4 bg-gray-50/50 dark:bg-brand-darkBg/30 rounded-2xl">
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Guests Allowed</p>
                                <p className="text-[11px] font-bold text-gray-700 dark:text-brand-darkText">{event.guests_allowed || 0} Per Invitee</p>
                            </div>
                            <div className="p-4 bg-gray-50/50 dark:bg-brand-darkBg/30 rounded-2xl">
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Reminders</p>
                                <div className="flex flex-wrap gap-1 mt-1">
                                    {(event.reminders || ['1d before']).map((r, i) => (
                                        <span key={i} className="px-2 py-0.5 bg-brand-orange/10 text-brand-orange rounded text-[8px] font-black uppercase">{r}</span>
                                    ))}
                                </div>
                            </div>
                            <div className="p-4 bg-gray-50/50 dark:bg-brand-darkBg/30 rounded-2xl">
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Visibility</p>
                                <p className="text-[11px] font-bold text-gray-700 dark:text-brand-darkText">{event.visibility || 'Family visible'}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EventDetails;
