import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Calendar,
    MapPin,
    Clock,
    Users,
    Share2,
    CheckCircle2,
    XCircle,
    HelpCircle,
    ArrowLeft,
    Facebook,
    Twitter,
    Linkedin,
    Mail,
    Copy,
    Info
} from 'lucide-react';

const PublicEventDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [rsvpStatus, setRsvpStatus] = useState(null); // 'going', 'maybe', 'not'
    const [counts, setCounts] = useState({ going: 45, maybe: 12, not: 5 });

    const event = {
        title: "Kincore Annual Family Reunion 2024",
        description: "Join us for a grand gathering of the Kincore family! This year's reunion will be held at the historic Heritage Manor, featuring a day full of storytelling, genealogy workshops, and family activities. We'll be celebrating our shared history and building new memories for the future generations.",
        longDescription: "The 2024 reunion is particularly special as we'll be unveiling the updated Kincore Family Tree, which now includes over five generations of our lineage. We have prepared special sessions for oral history recording, where elders can share their wisdom and personal stories. There will also be a dedicated kids' zone with fun historical games and prizes.\n\nLunch will be a grand family buffet featuring traditional recipes passed down through generations. Please bring your family portraits and any historical documents you'd like to share with the family archive.",
        date: "July 15, 2024",
        time: "10:00 AM - 6:00 PM",
        location: "Heritage Manor, Windsor, UK",
        host: "Windsor Branch Council",
        image: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=2069&auto=format&fit=crop",
        organizer: "Sarah Kincore-Windsor",
        category: "Milestone Gathering"
    };

    const handleRsvp = (status) => {
        if (rsvpStatus === status) {
            setRsvpStatus(null);
            setCounts(prev => ({ ...prev, [status]: prev[status] - 1 }));
        } else {
            if (rsvpStatus) {
                setCounts(prev => ({ ...prev, [rsvpStatus]: prev[rsvpStatus] - 1 }));
            }
            setRsvpStatus(status);
            setCounts(prev => ({ ...prev, [status]: prev[status] + 1 }));
        }
    };

    const shareOptions = [
        { icon: Facebook, color: 'text-blue-600', label: 'Facebook' },
        { icon: Twitter, color: 'text-blue-400', label: 'Twitter' },
        { icon: Linkedin, color: 'text-blue-700', label: 'LinkedIn' },
        { icon: Mail, color: 'text-gray-600', label: 'Email' },
    ];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-brand-darkBg pb-20">
            {/* Hero Section */}
            <div className="relative h-[60vh] min-h-[400px] w-full overflow-hidden">
                <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                <div className="absolute top-8 left-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-3 bg-white/10 backdrop-blur-md rounded-2xl text-white hover:bg-white/20 transition-all active:scale-95 group"
                    >
                        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    </button>
                </div>
                <div className="absolute bottom-12 left-0 right-0 max-w-7xl mx-auto px-8">
                    <div className="max-w-3xl space-y-4">
                        <span className="px-4 py-1.5 bg-brand-orange text-white text-[10px] font-black uppercase tracking-widest rounded-full">
                            {event.category}
                        </span>
                        <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-tight">
                            {event.title}
                        </h1>
                        <div className="flex flex-wrap items-center gap-6 text-white/80 font-bold text-sm">
                            <div className="flex items-center space-x-2">
                                <Calendar size={18} className="text-brand-orange" />
                                <span>{event.date}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Clock size={18} className="text-brand-orange" />
                                <span>{event.time}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <MapPin size={18} className="text-brand-orange" />
                                <span>{event.location}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="max-w-7xl mx-auto px-8 -mt-10 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Left Column: Details */}
                    <div className="lg:col-span-2 space-y-12">
                        <div className="bg-white dark:bg-brand-darkCard p-8 md:p-12 rounded-[3rem] border border-gray-100 dark:border-brand-darkBorder shadow-xl shadow-gray-200/50 dark:shadow-none text-left">
                            <div className="space-y-8">
                                <section>
                                    <h3 className="text-xl font-black text-gray-900 dark:text-brand-darkText uppercase tracking-tight mb-4">About the Event</h3>
                                    <p className="text-lg font-bold text-gray-700 dark:text-brand-darkText leading-relaxed">
                                        {event.description}
                                    </p>
                                    <div className="mt-6 space-y-4 text-gray-500 dark:text-gray-400 font-medium leading-relaxed whitespace-pre-line">
                                        {event.longDescription}
                                    </div>
                                </section>

                                <div className="pt-8 border-t border-gray-50 dark:border-brand-darkBorder grid grid-cols-1 sm:grid-cols-2 gap-8">
                                    <div className="flex items-center space-x-4">
                                        <div className="w-12 h-12 bg-orange-50 dark:bg-brand-orange/10 rounded-2xl flex items-center justify-center text-brand-orange">
                                            <Users size={24} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Organized By</p>
                                            <p className="text-sm font-black text-gray-900 dark:text-brand-darkText">{event.organizer}</p>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">{event.host}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-4">
                                        <div className="w-12 h-12 bg-blue-50 dark:bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500">
                                            <Info size={24} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Entry Requirements</p>
                                            <p className="text-sm font-black text-gray-900 dark:text-brand-darkText">Kincore Family Members Only</p>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">ID or Branch Verification Required</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Social Sharing */}
                        <div className="bg-white dark:bg-brand-darkCard p-10 rounded-[2.5rem] border border-gray-100 dark:border-brand-darkBorder shadow-sm text-left">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center space-x-3">
                                    <Share2 size={20} className="text-brand-orange" />
                                    <h4 className="text-sm font-black text-gray-900 dark:text-brand-darkText uppercase tracking-widest">Invite Fellow Kin</h4>
                                </div>
                                <button className="flex items-center space-x-2 px-4 py-2 bg-gray-50 dark:bg-brand-darkBg hover:bg-gray-100 rounded-xl transition-colors group">
                                    <Copy size={14} className="text-gray-400 group-hover:text-brand-orange" />
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest group-hover:text-gray-600">Copy Link</span>
                                </button>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                {shareOptions.map((option) => (
                                    <button
                                        key={option.label}
                                        className="flex flex-col items-center justify-center p-6 bg-gray-50 dark:bg-brand-darkBg rounded-[2rem] hover:scale-105 transition-all group"
                                    >
                                        <option.icon className={`w-6 h-6 ${option.color} mb-3`} />
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest group-hover:text-gray-900 dark:group-hover:text-brand-darkText">{option.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: RSVP */}
                    <div className="space-y-8">
                        <div className="bg-white dark:bg-brand-darkCard p-10 rounded-[3rem] border border-gray-100 dark:border-brand-darkBorder shadow-2xl shadow-orange-100/50 dark:shadow-none sticky top-8">
                            <div className="text-center mb-10">
                                <h4 className="text-2xl font-black text-gray-900 dark:text-brand-darkText tracking-tight mb-2">Are you attending?</h4>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Please RSVP by July 1st, 2024</p>
                            </div>

                            <div className="space-y-4">
                                <button
                                    onClick={() => handleRsvp('going')}
                                    className={`w-full py-5 px-8 rounded-2xl flex items-center justify-between transition-all group ${rsvpStatus === 'going' ? 'bg-brand-orange text-white shadow-xl shadow-brand-orange/30 scale-105' : 'bg-gray-50 dark:bg-brand-darkBg text-gray-900 dark:text-brand-darkText hover:bg-gray-100 active:scale-95'}`}
                                >
                                    <div className="flex items-center space-x-4 font-black uppercase text-xs tracking-widest">
                                        <CheckCircle2 size={20} className={rsvpStatus === 'going' ? 'text-white' : 'text-emerald-500'} />
                                        <span>I'm Attending</span>
                                    </div>
                                    <span className={`text-[10px] font-black ${rsvpStatus === 'going' ? 'text-white/70' : 'text-gray-400'}`}>{counts.going}</span>
                                </button>

                                <button
                                    onClick={() => handleRsvp('maybe')}
                                    className={`w-full py-5 px-8 rounded-2xl flex items-center justify-between transition-all group ${rsvpStatus === 'maybe' ? 'bg-emerald-500 text-white shadow-xl shadow-emerald-500/30 scale-105' : 'bg-gray-50 dark:bg-brand-darkBg text-gray-900 dark:text-brand-darkText hover:bg-gray-100 active:scale-95'}`}
                                >
                                    <div className="flex items-center space-x-4 font-black uppercase text-xs tracking-widest">
                                        <HelpCircle size={20} className={rsvpStatus === 'maybe' ? 'text-white' : 'text-blue-500'} />
                                        <span>Tentative / Maybe</span>
                                    </div>
                                    <span className={`text-[10px] font-black ${rsvpStatus === 'maybe' ? 'text-white/70' : 'text-gray-400'}`}>{counts.maybe}</span>
                                </button>

                                <button
                                    onClick={() => handleRsvp('not')}
                                    className={`w-full py-5 px-8 rounded-2xl flex items-center justify-between transition-all group ${rsvpStatus === 'not' ? 'bg-red-500 text-white shadow-xl shadow-red-500/30 scale-105' : 'bg-gray-50 dark:bg-brand-darkBg text-gray-900 dark:text-brand-darkText hover:bg-gray-100 active:scale-95'}`}
                                >
                                    <div className="flex items-center space-x-4 font-black uppercase text-xs tracking-widest">
                                        <XCircle size={20} className={rsvpStatus === 'not' ? 'text-white' : 'text-red-400'} />
                                        <span>Cannot Attend</span>
                                    </div>
                                    <span className={`text-[10px] font-black ${rsvpStatus === 'not' ? 'text-white/70' : 'text-gray-400'}`}>{counts.not}</span>
                                </button>
                            </div>

                            <div className="mt-10 pt-8 border-t border-gray-50 dark:border-brand-darkBorder text-center">
                                <div className="flex -space-x-3 justify-center mb-4">
                                    {[1, 2, 3, 4, 5].map(i => (
                                        <div key={i} className="w-10 h-10 rounded-full border-4 border-white dark:border-brand-darkCard bg-gray-200 overflow-hidden shadow-sm">
                                            <img src={`https://i.pravatar.cc/100?u=rsvp${i}`} alt="user" className="w-full h-full object-cover" />
                                        </div>
                                    ))}
                                    <div className="w-10 h-10 rounded-full border-4 border-white dark:border-brand-darkCard bg-brand-orange flex items-center justify-center text-[10px] font-black text-white shadow-sm">
                                        +40
                                    </div>
                                </div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Join Owen, Chloe, and 43 others</p>
                            </div>
                        </div>

                        {/* Additional Info Card */}
                        <div className="bg-emerald-500 p-8 rounded-[2.5rem] text-white text-left overflow-hidden relative group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
                            <h5 className="text-sm font-black uppercase tracking-widest mb-2">Travel & Housing</h5>
                            <p className="text-xs font-bold text-white/80 leading-relaxed mb-4">
                                Need assistance with travel or accommodation? Check our community-sourced guide for the Windsor area.
                            </p>
                            <button className="text-[10px] font-black uppercase tracking-[0.2em] flex items-center space-x-2 group">
                                <span>Learn More</span>
                                <ArrowLeft className="w-3 h-3 rotate-180 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PublicEventDetail;
