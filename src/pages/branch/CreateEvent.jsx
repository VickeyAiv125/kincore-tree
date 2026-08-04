import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Loader2, Plus, Camera, Calendar as CalendarIcon, Clock, MapPin, 
    ChevronLeft, ChevronRight, Check, X, AlertCircle 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Notification from '../../components/common/Notification';

// --- Custom Sub-Components ---

const CustomCalendar = ({ selectedDate, onSelect, onClose }) => {
    const [viewDate, setViewDate] = useState(selectedDate ? new Date(selectedDate) : new Date());
    const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();

    const handlePrevMonth = () => setViewDate(new Date(year, month - 1, 1));
    const handleNextMonth = () => setViewDate(new Date(year, month + 1, 1));

    const days = [];
    const totalDays = daysInMonth(year, month);
    const startDay = firstDayOfMonth(year, month);

    for (let i = 0; i < startDay; i++) {
        days.push(<div key={`empty-${i}`} className="h-10 w-10" />);
    }

    for (let d = 1; d <= totalDays; d++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const isSelected = selectedDate === dateStr;
        const isToday = new Date().toISOString().split('T')[0] === dateStr;

        days.push(
            <motion.button
                key={d}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => {
                    e.stopPropagation();
                    onSelect(dateStr);
                    onClose();
                }}
                className={`h-10 w-10 rounded-xl text-xs font-bold flex items-center justify-center transition-all ${isSelected
                    ? 'bg-brand-orange text-white shadow-lg shadow-brand-orange/30'
                    : isToday
                        ? 'bg-orange-50 text-brand-orange border border-brand-orange/20'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-brand-darkBg'
                    }`}
            >
                {d}
            </motion.button>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            className="absolute z-50 mt-2 p-6 bg-white dark:bg-brand-darkCard rounded-[2.5rem] shadow-2xl border border-gray-100 dark:border-brand-darkBorder min-w-[320px] left-0 sm:left-auto"
        >
            <div className="flex items-center justify-between mb-6">
                <button onClick={(e) => { e.stopPropagation(); handlePrevMonth(); }} className="p-2 hover:bg-orange-50 dark:hover:bg-brand-orange/10 rounded-xl text-brand-orange transition-colors">
                    <ChevronLeft size={20} />
                </button>
                <h4 className="font-black text-gray-900 dark:text-brand-darkText tracking-tight">
                    {monthNames[month]} {year}
                </h4>
                <button onClick={(e) => { e.stopPropagation(); handleNextMonth(); }} className="p-2 hover:bg-orange-50 dark:hover:bg-brand-orange/10 rounded-xl text-brand-orange transition-colors">
                    <ChevronRight size={20} />
                </button>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
                    <div key={day} className="h-10 w-10 flex items-center justify-center text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        {day}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
                {days}
            </div>
        </motion.div>
    );
};

const CustomTimePicker = ({ selectedTime, onSelect, onClose }) => {
    const [h, m] = selectedTime ? selectedTime.split(':') : ['12', '00'];
    const initialHour = parseInt(h);
    const [hour, setHour] = useState(initialHour % 12 || 12);
    const [minute, setMinute] = useState(parseInt(m));
    const [ampm, setAmpm] = useState(initialHour < 12 ? 'AM' : 'PM');

    const handleConfirm = (e) => {
        e.stopPropagation();
        let finalHour = hour % 12;
        if (ampm === 'PM') finalHour += 12;
        const timeStr = `${String(finalHour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
        onSelect(timeStr);
        onClose();
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            className="absolute z-50 mt-2 p-6 bg-white dark:bg-brand-darkCard rounded-[2.5rem] shadow-2xl border border-gray-100 dark:border-brand-darkBorder min-w-[280px] left-0 sm:left-auto"
        >
            <div className="flex justify-between items-center mb-6 px-2">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Select Time</span>
                <button onClick={(e) => { e.stopPropagation(); onClose(); }} className="text-gray-400 hover:text-brand-orange transition-colors">
                    <X size={16} />
                </button>
            </div>

            <div className="flex items-center justify-center space-x-4 mb-8">
                <div className="flex flex-col items-center">
                    <div className="h-[120px] overflow-y-auto scroll-hide flex flex-col items-center space-y-2 py-10 px-2 bg-gray-50 dark:bg-brand-darkBg/50 rounded-2xl border border-gray-100 dark:border-brand-darkBorder">
                        {Array.from({ length: 12 }, (_, i) => i + 1).map(h => (
                            <button
                                key={h}
                                onClick={(e) => { e.stopPropagation(); setHour(h); }}
                                className={`text-sm font-black w-8 h-8 rounded-lg flex items-center justify-center transition-all ${hour === h ? 'bg-brand-orange text-white' : 'text-gray-400'}`}
                            >
                                {String(h).padStart(2, '0')}
                            </button>
                        ))}
                    </div>
                    <span className="text-[8px] font-bold text-gray-400 uppercase mt-2">Hours</span>
                </div>

                <span className="text-2xl font-black text-gray-300 mb-6">:</span>

                <div className="flex flex-col items-center">
                    <div className="h-[120px] overflow-y-auto scroll-hide flex flex-col items-center space-y-2 py-10 px-2 bg-gray-50 dark:bg-brand-darkBg/50 rounded-2xl border border-gray-100 dark:border-brand-darkBorder">
                        {Array.from({ length: 60 }, (_, i) => i).map(m => (
                            <button
                                key={m}
                                onClick={(e) => { e.stopPropagation(); setMinute(m); }}
                                className={`text-sm font-black w-8 h-8 rounded-lg flex items-center justify-center transition-all ${minute === m ? 'bg-brand-orange text-white' : 'text-gray-400'}`}
                            >
                                {String(m).padStart(2, '0')}
                            </button>
                        ))}
                    </div>
                    <span className="text-[8px] font-bold text-gray-400 uppercase mt-2">Min</span>
                </div>

                <div className="flex flex-col space-y-1">
                    {['AM', 'PM'].map(val => (
                        <button
                            key={val}
                            onClick={(e) => { e.stopPropagation(); setAmpm(val); }}
                            className={`px-3 py-2 rounded-xl text-[10px] font-black transition-all ${ampm === val ? 'bg-brand-orange text-white' : 'bg-gray-50 dark:bg-brand-darkBg/50 text-gray-400'}`}
                        >
                            {val}
                        </button>
                    ))}
                </div>
            </div>

            <button
                onClick={handleConfirm}
                className="w-full bg-brand-orange text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-orange-600 transition-all shadow-lg shadow-brand-orange/20"
            >
                Confirm Time
            </button>
        </motion.div>
    );
};

// --- Main Component ---

const CreateEvent = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [notification, setNotification] = useState({ message: '', type: 'success' });
    const [members, setMembers] = useState([]);
    const [selectedMembers, setSelectedMembers] = useState([]);
    const [activePicker, setActivePicker] = useState(null);
    const fileInputRef = useRef(null);
    const pickerRef = useRef(null);

    const [formData, setFormData] = useState({
        title: '',
        location: '',
        description: '',
        startDate: '',
        endDate: '',
        time: '',
        coverUrl: null
    });

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (pickerRef.current && !pickerRef.current.contains(event.target)) {
                setActivePicker(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const fetchMembers = async () => {
            try {
                const user = JSON.parse(localStorage.getItem('user'));
                const token = localStorage.getItem('token');
                const branchId = user?.branch_id || '6b8eb992-571f-4637-b031-a56007560cad';
                const baseUrl = import.meta.env.VITE_API_BASE_URL || `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}`;

                const response = await fetch(`${baseUrl}/admin/branch/members/${branchId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await response.json();
                // Filter to only show members who have a userId (can RSVP)
                setMembers(data.filter(m => m.userId) || []);
            } catch (err) {
                console.error('>>> [FETCH_MEMBERS_ERROR]', err);
            }
        };
        fetchMembers();
    }, []);

    const handlePhotoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        try {
            const token = localStorage.getItem('token');
            const baseUrl = import.meta.env.VITE_API_BASE_URL || `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}`;
            const body = new FormData();
            body.append('photo', file);

            const response = await fetch(`${baseUrl}/admin/branch/upload-event-photo`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body
            });

            if (!response.ok) throw new Error('Photo upload failed');
            const data = await response.json();
            setFormData(prev => ({ ...prev, coverUrl: data.url }));
            setNotification({ message: 'Event cover photo uploaded!', type: 'success' });
        } catch (err) {
            setNotification({ message: 'Upload error: ' + err.message, type: 'error' });
        } finally {
            setUploading(false);
        }
    };

    const toggleMemberSelection = (userId) => {
        setSelectedMembers(prev => 
            prev.includes(userId) 
                ? prev.filter(id => id !== userId) 
                : [...prev, userId]
        );
    };

    const handleSubmit = async () => {
        if (!formData.title || !formData.startDate) {
            setNotification({ message: 'Title and Start Date are required', type: 'error' });
            return;
        }

        setLoading(true);
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const token = localStorage.getItem('token');
            const branchId = user?.branch_id || '6b8eb992-571f-4637-b031-a56007560cad';
            const baseUrl = import.meta.env.VITE_API_BASE_URL || `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}`;

            const payload = {
                title: formData.title,
                location: formData.location,
                description: formData.description,
                startDate: formData.startDate,
                endDate: formData.endDate || null,
                coverUrl: formData.coverUrl,
                eventTime: formData.time || null,
                invitedMembers: selectedMembers
            };

            const response = await fetch(`${baseUrl}/admin/branch/events/${branchId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || 'Failed to create event');
            }

            setNotification({ message: 'Event created successfully!', type: 'success' });
            setTimeout(() => navigate('/branch/events'), 1500);
        } catch (err) {
            setNotification({ message: 'Error: ' + err.message, type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const formatDisplayDate = (dateStr) => {
        if (!dateStr) return 'Select Date';
        const d = new Date(dateStr + 'T00:00:00');
        return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    const formatDisplayTime = (timeStr) => {
        if (!timeStr) return 'Select Time';
        const [h, m] = timeStr.split(':');
        const hour = parseInt(h) % 12 || 12;
        const ampm = parseInt(h) < 12 ? 'AM' : 'PM';
        return `${hour}:${m} ${ampm}`;
    };

    return (
        <div className="max-w-6xl mx-auto py-4 px-4 sm:px-0">
            <Notification 
                message={notification.message} 
                type={notification.type} 
                onClose={() => setNotification({ message: '', type: 'success' })} 
            />

            <header className="flex justify-between items-center mb-10">
                <h1 className="text-2xl sm:text-[32px] font-black text-gray-900 dark:text-brand-darkText leading-none transition-colors">Create Event</h1>
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-[#FFE5DE] dark:bg-brand-orange/20 flex items-center justify-center text-brand-orange transition-colors">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                    </div>
                </div>
            </header>

            <div 
                className="bg-white dark:bg-brand-darkBg border-2 border-dashed border-[#FFE5DE] dark:border-brand-orange/20 rounded-[2rem] p-8 sm:p-12 text-center mb-12 flex flex-col items-center justify-center bg-[#F9FAFB]/30 dark:bg-brand-orange/5 transition-colors relative cursor-pointer group min-h-[300px]"
                onClick={() => fileInputRef.current.click()}
            >
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                
                {formData.coverUrl ? (
                    <img src={formData.coverUrl} alt="Cover" className="absolute inset-0 w-full h-full object-cover rounded-[2rem]" />
                ) : (
                    <div className="w-16 h-16 bg-white dark:bg-brand-darkCard rounded-full flex items-center justify-center shadow-lg shadow-orange-100 dark:shadow-brand-orange/5 border border-orange-50 dark:border-brand-darkBorder mb-6 transition-colors">
                        {uploading ? <Loader2 className="w-8 h-8 text-brand-orange animate-spin" /> : <svg className="w-8 h-8 text-brand-orange" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
                    </div>
                )}
                
                {!formData.coverUrl && (
                    <>
                        <h2 className="text-xl font-black text-gray-900 dark:text-brand-darkText mb-2 transition-colors">Add Event Cover Photo</h2>
                        <p className="text-sm font-bold text-gray-400 dark:text-gray-500 mb-8 transition-colors">Upload PNG, JPG File Support</p>
                        <button className="bg-[#FFE5DE] dark:bg-brand-orange/20 text-brand-orange px-12 sm:px-16 py-4 rounded-2xl font-black text-sm hover:bg-[#FFD5CC] dark:hover:bg-brand-orange/30 transition-all active:scale-95 leading-none uppercase tracking-wider">
                            {uploading ? 'Uploading...' : 'Upload'}
                        </button>
                    </>
                )}
                
                {formData.coverUrl && (
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-[2rem]">
                        <Camera className="text-white" size={32} />
                    </div>
                )}
            </div>

            <div className="bg-white dark:bg-brand-darkCard border border-gray-100 dark:border-brand-darkBorder rounded-[2.5rem] p-8 sm:p-12 shadow-sm mb-12 transition-colors" ref={pickerRef}>
                <h3 className="text-xl font-bold text-gray-900 dark:text-brand-darkText mb-10 text-left transition-colors uppercase tracking-tight">Event Detail</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10">
                    <div className="text-left">
                        <label className="block text-[13px] font-black text-gray-900 dark:text-brand-darkText mb-4 ml-1 uppercase tracking-wide">Event Title</label>
                        <input 
                            type="text" 
                            placeholder="Add title" 
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full bg-white dark:bg-brand-darkBg border border-gray-100 dark:border-brand-darkBorder rounded-2xl py-5 px-6 text-sm font-bold text-gray-800 dark:text-brand-darkText outline-none focus:border-brand-orange/20 dark:focus:border-brand-orange/40 transition-all placeholder:text-gray-300 dark:placeholder:text-gray-600 shadow-sm" 
                        />
                    </div>
                    <div className="text-left">
                        <label className="block text-[13px] font-black text-gray-900 dark:text-brand-darkText mb-4 ml-1 uppercase tracking-wide">Location</label>
                        <div className="relative">
                            <input 
                                type="text" 
                                placeholder="Add location" 
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                className="w-full bg-white dark:bg-brand-darkBg border border-gray-100 dark:border-brand-darkBorder rounded-2xl py-5 pl-14 pr-6 text-sm font-bold text-gray-800 dark:text-brand-darkText outline-none focus:border-brand-orange/20 dark:focus:border-brand-orange/40 transition-all placeholder:text-gray-300 dark:placeholder:text-gray-600 shadow-sm" 
                            />
                            <MapPin className="w-6 h-6 absolute left-5 top-1/2 -translate-y-1/2 text-brand-orange" />
                        </div>
                    </div>
                    <div className="md:col-span-2 text-left">
                        <label className="block text-[13px] font-black text-gray-900 dark:text-brand-darkText mb-4 ml-1 uppercase tracking-wide">Description</label>
                        <textarea 
                            placeholder="Describe your event..." 
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full bg-white dark:bg-brand-darkBg border border-gray-100 dark:border-brand-darkBorder rounded-2xl py-6 px-6 text-sm font-bold text-gray-800 dark:text-brand-darkText outline-none focus:border-brand-orange/20 dark:focus:border-brand-orange/40 min-h-[160px] resize-none transition-all placeholder:text-gray-300 dark:placeholder:text-gray-600 shadow-sm" 
                        />
                    </div>
                    
                    <div className="text-left relative">
                        <label className="block text-[13px] font-black text-gray-900 dark:text-brand-darkText mb-4 ml-1 uppercase tracking-wide">Start Date</label>
                        <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setActivePicker(activePicker === 'startDate' ? null : 'startDate'); }}
                            className="w-full bg-white dark:bg-brand-darkBg border border-gray-100 dark:border-brand-darkBorder rounded-2xl py-5 px-14 text-sm font-bold text-gray-800 dark:text-brand-darkText outline-none focus:border-brand-orange/20 dark:focus:border-brand-orange/40 transition-all text-left shadow-sm relative"
                        >
                            <CalendarIcon className="w-6 h-6 absolute left-5 top-1/2 -translate-y-1/2 text-brand-orange" />
                            {formatDisplayDate(formData.startDate)}
                        </button>
                        <AnimatePresence>
                            {activePicker === 'startDate' && (
                                <CustomCalendar
                                    selectedDate={formData.startDate}
                                    onSelect={(v) => setFormData(prev => ({ ...prev, startDate: v }))}
                                    onClose={() => setActivePicker(null)}
                                />
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="text-left relative">
                        <label className="block text-[13px] font-black text-gray-900 dark:text-brand-darkText mb-4 ml-1 uppercase tracking-wide">End Date</label>
                        <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setActivePicker(activePicker === 'endDate' ? null : 'endDate'); }}
                            className="w-full bg-white dark:bg-brand-darkBg border border-gray-100 dark:border-brand-darkBorder rounded-2xl py-5 px-14 text-sm font-bold text-gray-800 dark:text-brand-darkText outline-none focus:border-brand-orange/20 dark:focus:border-brand-orange/40 transition-all text-left shadow-sm relative"
                        >
                            <CalendarIcon className="w-6 h-6 absolute left-5 top-1/2 -translate-y-1/2 text-brand-orange" />
                            {formatDisplayDate(formData.endDate)}
                        </button>
                        <AnimatePresence>
                            {activePicker === 'endDate' && (
                                <CustomCalendar
                                    selectedDate={formData.endDate}
                                    onSelect={(v) => setFormData(prev => ({ ...prev, endDate: v }))}
                                    onClose={() => setActivePicker(null)}
                                />
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="text-left relative">
                        <label className="block text-[13px] font-black text-gray-900 dark:text-brand-darkText mb-4 ml-1 uppercase tracking-wide">Time</label>
                        <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setActivePicker(activePicker === 'time' ? null : 'time'); }}
                            className="w-full bg-white dark:bg-brand-darkBg border border-gray-100 dark:border-brand-darkBorder rounded-2xl py-5 px-14 text-sm font-bold text-gray-800 dark:text-brand-darkText outline-none focus:border-brand-orange/20 dark:focus:border-brand-orange/40 transition-all text-left shadow-sm relative"
                        >
                            <Clock className="w-6 h-6 absolute left-5 top-1/2 -translate-y-1/2 text-brand-orange" />
                            {formatDisplayTime(formData.time)}
                        </button>
                        <AnimatePresence>
                            {activePicker === 'time' && (
                                <CustomTimePicker
                                    selectedTime={formData.time}
                                    onSelect={(v) => setFormData(prev => ({ ...prev, time: v }))}
                                    onClose={() => setActivePicker(null)}
                                />
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            <div className="text-left mb-16">
                <h3 className="text-xl font-bold text-gray-900 dark:text-brand-darkText mb-8 uppercase tracking-tight">Invite Family Member (Registered Users Only)</h3>
                <div className="flex items-start space-x-8 sm:space-x-12 overflow-x-auto pb-6 pt-4 px-1 custom-scrollbar">
                    <div 
                        className="flex flex-col items-center space-y-3 cursor-pointer group shrink-0"
                        onClick={() => setSelectedMembers(members.map(m => m.userId))}
                    >
                        <div className="w-14 h-14 bg-brand-orange rounded-full flex items-center justify-center text-white shadow-lg shadow-brand-orange/20 group-hover:scale-110 transition-transform">
                            <Plus className="w-6 h-6" strokeWidth={3} />
                        </div>
                        <span className="text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-tight transition-colors">Add All</span>
                    </div>
                    {members.map((member) => (
                        <div 
                            key={member.id} 
                            className="flex flex-col items-center space-y-3 shrink-0 cursor-pointer group"
                            onClick={() => toggleMemberSelection(member.userId)}
                        >
                            <div className={`w-14 h-14 rounded-full overflow-hidden border-2 transition-all p-0.5 ${selectedMembers.includes(member.userId) ? 'border-brand-orange scale-105 shadow-md shadow-brand-orange/10' : 'border-transparent group-hover:border-brand-orange/50'}`}>
                                {member.avatar ? (
                                    <img src={member.avatar} alt={member.name} className="w-full h-full object-cover rounded-full" />
                                ) : (
                                    <div className="w-full h-full bg-gray-100 dark:bg-brand-darkBg flex items-center justify-center text-brand-orange font-bold text-xs rounded-full uppercase">
                                        {member.name.split(' ').map(n => n[0]).join('')}
                                    </div>
                                )}
                            </div>
                            <span className={`text-[11px] font-black uppercase tracking-tight transition-colors ${selectedMembers.includes(member.userId) ? 'text-brand-orange' : 'text-gray-800 dark:text-brand-darkText group-hover:text-brand-orange'}`}>
                                {member.name.split(' ')[0]}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex justify-center pb-20">
                <button 
                    onClick={handleSubmit}
                    disabled={loading || uploading}
                    className="bg-brand-orange text-white px-20 sm:px-32 py-5 rounded-[2rem] font-black text-base shadow-2xl shadow-brand-orange/30 hover:bg-orange-600 transition-all active:scale-95 w-full sm:w-auto uppercase tracking-widest flex items-center justify-center gap-3 disabled:opacity-50"
                >
                    {loading && <Loader2 className="animate-spin" size={20} />}
                    {loading ? 'Creating...' : 'Create Event'}
                </button>
            </div>
        </div>
    );
};

export default CreateEvent;
