import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_BASE_URL || `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}`;

const OverviewCard = ({ title, value, subtext, image }) => (
    <div className="bg-white dark:bg-brand-darkCard rounded-3xl border border-gray-100 dark:border-brand-darkBorder shadow-sm overflow-hidden flex flex-col md:flex-row items-center p-6 mb-6 transition-colors">
        <div className="w-full md:w-1/2 h-48 rounded-2xl overflow-hidden mb-4 md:mb-0 md:mr-8 bg-gray-50 dark:bg-brand-darkBg flex items-center justify-center">
            <img src={image} alt={title} className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 text-left">
            <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">{title}</p>
            <h3 className="text-3xl font-extrabold text-gray-900 dark:text-brand-darkText mb-1">{value}</h3>
            <p className="text-sm font-medium text-gray-400 dark:text-gray-500">{subtext}</p>
        </div>
    </div>
);

const EventListItem = ({ id, title, type, date, icon, isOnline, rsvpCount, location, contact, avatars, onDetails, onRSVP, showRSVPOptions, onStatusSelect }) => (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-6 border-b border-gray-50 dark:border-brand-darkBorder last:border-none transition-colors group">
        <div className="flex items-start space-x-4 flex-1">
            <div className="w-14 h-14 bg-orange-50 dark:bg-brand-orange/10 rounded-2xl flex items-center justify-center text-brand-orange shrink-0 group-hover:scale-110 transition-transform">
                {icon || <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
            </div>
            <div className="text-left">
                <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-black text-gray-900 dark:text-brand-darkText tracking-tight">{title}</h4>
                    {isOnline && (
                        <span className="bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">Online</span>
                    )}
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                    <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">{type || 'Event'}</p>
                    <span className="text-[10px] text-gray-300">•</span>
                    <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">{date}</p>
                    <span className="text-[10px] text-gray-300">•</span>
                    <p className="text-[10px] font-bold text-brand-orange uppercase tracking-widest">{location || 'TBA'}</p>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-4">
                    {avatars && avatars.length > 0 && (
                        <div className="flex -space-x-2">
                            {avatars.slice(0, 4).map((member, i) => (
                                <div key={i} title={member.name} className="w-6 h-6 rounded-full border-2 border-white dark:border-brand-darkCard bg-gray-100 overflow-hidden shadow-sm flex items-center justify-center">
                                    {member.avatar_url ? (
                                        <img src={member.avatar_url} alt={member.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-brand-orange/10 text-brand-orange text-[8px] font-black uppercase">
                                            {member.name ? member.name[0] : '?'}
                                        </div>
                                    )}
                                </div>
                            ))}
                            {avatars.length > 4 && (
                                <div className="w-6 h-6 rounded-full border-2 border-white dark:border-brand-darkCard bg-brand-orange text-white text-[8px] font-black flex items-center justify-center shadow-sm z-10">
                                    +{avatars.length - 4}
                                </div>
                            )}
                        </div>
                    )}
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-tighter shrink-0">{rsvpCount || 0} Attending</span>
                    {contact && (
                        <div className="flex items-center space-x-2 text-[9px] font-black text-brand-orange uppercase tracking-tighter">
                            <span className="text-gray-300">•</span>
                            <span>Contact: {contact}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center gap-3 w-full sm:w-auto relative">
            <button 
                onClick={() => onDetails(id)}
                className="flex-1 sm:flex-none px-6 py-2 bg-gray-50 dark:bg-brand-darkBg text-gray-400 dark:text-gray-500 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-gray-100 transition-colors"
            >
                Details
            </button>
            {showRSVPOptions ? (
                <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-4 duration-300">
                    <button onClick={() => onStatusSelect(id, 'going')} className="px-4 py-2 bg-emerald-500 text-white rounded-xl font-bold text-[8px] uppercase tracking-widest shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-all">Going</button>
                    <button onClick={() => onStatusSelect(id, 'maybe')} className="px-4 py-2 bg-blue-500 text-white rounded-xl font-bold text-[8px] uppercase tracking-widest shadow-lg shadow-blue-500/20 hover:bg-blue-600 transition-all">Maybe</button>
                    <button onClick={() => onStatusSelect(id, 'declined')} className="px-4 py-2 bg-rose-500 text-white rounded-xl font-bold text-[8px] uppercase tracking-widest shadow-lg shadow-rose-500/20 hover:bg-rose-600 transition-all">No</button>
                </div>
            ) : (
                <button 
                    onClick={() => onRSVP(id)}
                    className="flex-1 sm:flex-none px-6 py-2 bg-brand-orange text-white rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-lg shadow-brand-orange/10 hover:bg-orange-600 transition-all"
                >
                    RSVP Now
                </button>
            )}
        </div>
    </div>
);

const EventsEngagement = () => {
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [stats, setStats] = useState({ totalMembers: 0, participationRate: 0 });
    const [statusModal, setStatusModal] = useState({ show: false, type: 'success', title: '', message: '' });
    const [activeRSVPId, setActiveRSVPId] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            let familyId = localStorage.getItem('selected_family_id') || user?.family_id || user?.family_space_id || 'DEFAULT_FAMILY_ID';
            if (familyId === 'undefined' || familyId === 'null') familyId = 'DEFAULT_FAMILY_ID';
            const token = localStorage.getItem('token');

            if (!familyId || (familyId === 'DEFAULT_FAMILY_ID' && !user?.family_id)) {
                setError('No family space identified');
                setLoading(false);
                return;
            }

            // 1. Fetch Events
            const eventRes = await fetch(`${API_BASE}/families/${familyId}/events`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const eventData = eventRes.ok ? await eventRes.json() : [];
            setEvents(eventData || []);

            // 2. Fetch Dashboard for Member Count
            const dashRes = await fetch(`${API_BASE}/families/${familyId}/dashboard`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const dashData = dashRes.ok ? await dashRes.json() : null;
            
            const totalMembers = dashData?.stats?.total_members || 1;
            const totalEvents = eventData.length || 1;
            const totalRSVPs = eventData.reduce((acc, e) => acc + (e.going_count || 0), 0);
            
            const pRate = Math.round((totalRSVPs / (totalMembers * totalEvents)) * 100);

            setStats({
                totalMembers,
                participationRate: pRate || 0
            });

        } catch (err) {
            console.error('Error fetching engagement data:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleRSVP = async (eventId, status) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE}/events/rsvp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    event_id: eventId,
                    status: status
                })
            });

            if (!response.ok) throw new Error('Failed to submit RSVP');

            setActiveRSVPId(null);
            setStatusModal({
                show: true,
                type: 'success',
                title: 'RSVP Confirmed',
                message: `Your status has been updated to "${status.toUpperCase()}" for this event.`
            });
            fetchData(); // Refresh counts
        } catch (err) {
            setStatusModal({
                show: true,
                type: 'error',
                title: 'RSVP Failed',
                message: err.message
            });
        }
    };

    const handleDetails = (id) => {
        navigate(`/admin/events/${id}`);
    };

    return (
        <div className="flex flex-col">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8">
                <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-brand-darkText leading-tight">Events & Engagement Overview</h1>
                <button
                    onClick={() => navigate('/events/create')}
                    className="w-full sm:w-auto bg-brand-orange text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-brand-orange/20 hover:bg-orange-600 transform active:scale-95 transition-all text-sm"
                >
                    Create New Event
                </button>
            </header>

            <section className="mb-10">
                <h2 className="text-xl font-bold text-gray-800 dark:text-brand-darkText mb-6">Overview</h2>
                <div className="grid grid-cols-1 gap-6">
                    <OverviewCard
                        title="RSVP Stats"
                        value={events.reduce((acc, e) => acc + (e.going_count || 0), 0)}
                        subtext="Total RSVPs Across All Events"
                        image="https://placehold.co/600x400/f97316/white?text=RSVP+Stats"
                    />
                    <OverviewCard
                        title="Upcoming Gatherings"
                        value={events.filter(e => new Date(e.start_date) >= new Date()).length}
                        subtext="Reunions & Events Scheduled"
                        image="https://placehold.co/600x400/f97316/white?text=Upcoming+Events"
                    />
                    <OverviewCard
                        title="Global Participation Rate"
                        value={`${stats.participationRate}%`}
                        subtext="Average Family Participation"
                        image="https://placehold.co/600x400/f97316/white?text=Participation"
                    />
                </div>
            </section>

            <section>
                <h2 className="text-xl font-bold text-gray-800 dark:text-brand-darkText mb-6">Upcoming Events</h2>
                <div className="bg-white dark:bg-brand-darkCard rounded-3xl border border-gray-100 dark:border-brand-darkBorder shadow-sm p-6 transition-colors">
                    {loading ? (
                        <div className="py-20 text-center">
                            <div className="w-10 h-10 border-4 border-brand-orange border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Syncing Calendar...</p>
                        </div>
                    ) : error ? (
                        <div className="py-20 text-center">
                            <p className="text-red-500 font-bold">{error}</p>
                            <button onClick={fetchEvents} className="mt-4 text-brand-orange font-bold underline">Retry</button>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-50 dark:divide-brand-darkBorder/30">
                            {events.map((event) => (
                                <EventListItem 
                                    key={event.id} 
                                    id={event.id}
                                    title={event.title}
                                    type={event.event_type}
                                    date={event.date || new Date(event.start_date).toLocaleDateString()}
                                    location={event.location}
                                    isOnline={event.location_type === 'online'}
                                    rsvpCount={event.going_count || 0}
                                    avatars={event.members}
                                    contact={event.hosted_by}
                                    onDetails={handleDetails}
                                    onRSVP={() => setActiveRSVPId(event.id)}
                                    showRSVPOptions={activeRSVPId === event.id}
                                    onStatusSelect={handleRSVP}
                                />
                            ))}
                            {events.length === 0 && (
                                <div className="py-20 text-center text-gray-400 font-bold uppercase tracking-widest text-xs">
                                    No upcoming events found
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </section>

            {/* Feedback Modal */}
            {statusModal.show && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
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

export default EventsEngagement;
