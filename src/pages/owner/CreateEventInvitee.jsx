import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Notification from '../../components/common/Notification';
import {
    Calendar as CalendarIcon,
    Clock,
    MapPin,
    AlertCircle,
    ChevronLeft,
    ChevronRight,
    Check,
    X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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

    // Empty slots for start of month
    for (let i = 0; i < startDay; i++) {
        days.push(<div key={`empty-${i}`} className="h-10 w-10" />);
    }

    // Days of the month
    for (let d = 1; d <= totalDays; d++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const isSelected = selectedDate === dateStr;
        const isToday = new Date().toISOString().split('T')[0] === dateStr;

        days.push(
            <motion.button
                key={d}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
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
            className="absolute z-50 mt-2 p-6 bg-white dark:bg-brand-darkCard rounded-[2.5rem] shadow-2xl border border-gray-100 dark:border-brand-darkBorder min-w-[320px]"
        >
            <div className="flex items-center justify-between mb-6">
                <button onClick={handlePrevMonth} className="p-2 hover:bg-orange-50 dark:hover:bg-brand-orange/10 rounded-xl text-brand-orange transition-colors">
                    <ChevronLeft size={20} />
                </button>
                <h4 className="font-black text-gray-900 dark:text-brand-darkText tracking-tight">
                    {monthNames[month]} {year}
                </h4>
                <button onClick={handleNextMonth} className="p-2 hover:bg-orange-50 dark:hover:bg-brand-orange/10 rounded-xl text-brand-orange transition-colors">
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

    const handleConfirm = () => {
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
            className="absolute z-50 mt-2 p-6 bg-white dark:bg-brand-darkCard rounded-[2.5rem] shadow-2xl border border-gray-100 dark:border-brand-darkBorder min-w-[280px]"
        >
            <div className="flex justify-between items-center mb-6 px-2">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Select Time</span>
                <button onClick={onClose} className="text-gray-400 hover:text-brand-orange transition-colors">
                    <X size={16} />
                </button>
            </div>

            <div className="flex items-center justify-center space-x-4 mb-8">
                {/* Hours */}
                <div className="flex flex-col items-center">
                    <div className="h-[120px] overflow-y-auto scroll-hide flex flex-col items-center space-y-2 py-10 px-2 bg-gray-50 dark:bg-brand-darkBg/50 rounded-2xl border border-gray-100 dark:border-brand-darkBorder">
                        {Array.from({ length: 12 }, (_, i) => i + 1).map(h => (
                            <button
                                key={h}
                                onClick={() => setHour(h)}
                                className={`text-sm font-black w-8 h-8 rounded-lg flex items-center justify-center transition-all ${hour === h ? 'bg-brand-orange text-white' : 'text-gray-400'}`}
                            >
                                {String(h).padStart(2, '0')}
                            </button>
                        ))}
                    </div>
                    <span className="text-[8px] font-bold text-gray-400 uppercase mt-2">Hours</span>
                </div>

                <span className="text-2xl font-black text-gray-300 mb-6">:</span>

                {/* Minutes */}
                <div className="flex flex-col items-center">
                    <div className="h-[120px] overflow-y-auto scroll-hide flex flex-col items-center space-y-2 py-10 px-2 bg-gray-50 dark:bg-brand-darkBg/50 rounded-2xl border border-gray-100 dark:border-brand-darkBorder">
                        {Array.from({ length: 60 }, (_, i) => i).map(m => (
                            <button
                                key={m}
                                onClick={() => setMinute(m)}
                                className={`text-sm font-black w-8 h-8 rounded-lg flex items-center justify-center transition-all ${minute === m ? 'bg-brand-orange text-white' : 'text-gray-400'}`}
                            >
                                {String(m).padStart(2, '0')}
                            </button>
                        ))}
                    </div>
                    <span className="text-[8px] font-bold text-gray-400 uppercase mt-2">Min</span>
                </div>

                {/* AM/PM */}
                <div className="flex flex-col space-y-1">
                    {['AM', 'PM'].map(val => (
                        <button
                            key={val}
                            onClick={() => setAmpm(val)}
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

const CreateEventInvitee = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        location: '',
        description: '',
        startDate: '',
        endDate: '',
        time: ''
    });
    const [errors, setErrors] = useState({});
    const [activePicker, setActivePicker] = useState(null); // 'startDate', 'endDate', 'time' or null

    const [members, setMembers] = useState([]);
    const [selectedMembers, setSelectedMembers] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [coverFile, setCoverFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [notification, setNotification] = useState({ message: '', type: 'success' });

    const pickerRef = useRef(null);
    const fileInputRef = useRef(null);

    // Close picker when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (pickerRef.current && !pickerRef.current.contains(event.target)) {
                setActivePicker(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Date Validation
    useEffect(() => {
        if (formData.startDate && formData.endDate) {
            const start = new Date(formData.startDate);
            const end = new Date(formData.endDate);
            if (end < start) {
                setErrors(prev => ({ ...prev, endDate: 'End date cannot be earlier than start date' }));
            } else {
                setErrors(prev => {
                    const newErrors = { ...prev };
                    delete newErrors.endDate;
                    return newErrors;
                });
            }
        }
    }, [formData.startDate, formData.endDate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Fetch members for invitations
    useEffect(() => {
        const fetchMembers = async () => {
            try {
                const baseUrl = import.meta.env.VITE_API_BASE_URL || `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}`;
                const token = localStorage.getItem('token');
                const user = JSON.parse(localStorage.getItem('user'));

                // Use the family-specific members endpoint to get both account users and lineage persons
                const endpoint = `${baseUrl}/families/${user.family_id}/members?t=${Date.now()}`;

                const response = await fetch(endpoint, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await response.json();
                if (response.ok) {
                    setMembers(data.map(m => ({
                        id: m.id,
                        name: m.name || m.first_name || 'User',
                        img: m.avatar_url || m.img || `https://api.dicebear.com/7.x/avataaars/svg?seed=${m.id}`
                    })));
                }
            } catch (err) {
                console.error('Failed to fetch members:', err);
            }
        };
        fetchMembers();
    }, []);

    const toggleMember = (id) => {
        setSelectedMembers(prev =>
            prev.includes(id) ? prev.filter(mId => mId !== id) : [...prev, id]
        );
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setCoverFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleCreate = async () => {
        if (!formData.title || !formData.startDate) {
            alert('Please fill in required fields (Title, Start Date)');
            return;
        }

        setIsSubmitting(true);
        try {
            const baseUrl = import.meta.env.VITE_API_BASE_URL || `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}`;
            const user = JSON.parse(localStorage.getItem('user'));
            // Always use the family-scoped endpoint for the Owner panel
            const familyId = user.family_id || localStorage.getItem('currentFamilySpaceId') || localStorage.getItem('selected_family_id');
            const endpoint = `${baseUrl}/families/${familyId}/events`;

            const data = new FormData();
            data.append('title', formData.title);
            data.append('location', formData.location);
            data.append('description', formData.description);
            data.append('start_date', formData.startDate);
            data.append('end_date', formData.endDate);
            data.append('event_time', formData.time);
            data.append('family_space_id', user.family_id);
            data.append('event_type', 'gathering');
            data.append('invited_user_ids', JSON.stringify(selectedMembers));

            if (coverFile) {
                data.append('cover_image', coverFile);
            }

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
                body: data
            });

            if (response.ok) {
                setNotification({ message: 'Event Created Successfully!', type: 'success' });
                setTimeout(() => navigate('/owner/events'), 2000);
            } else {
                const err = await response.json();
                setNotification({ message: 'Error: ' + (err.error || 'Failed to create event'), type: 'error' });
            }
        } catch (err) {
            console.error('Create error:', err);
            setNotification({ message: 'Network error occurred', type: 'error' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const invitees = members;

    const formatDisplayDate = (dateStr) => {
        if (!dateStr) return 'Select Date';
        const d = new Date(dateStr + 'T00:00:00'); // Add T00:00:00 to ensure correct date parsing in all browsers
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
        <div className="max-w-4xl mx-auto text-left py-4 animate-in fade-in duration-500">
            <header className="flex justify-between items-center mb-10">
                <div className="space-y-1">
                    <h1 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-brand-darkText tracking-tight">Create Event</h1>
                    <p className="text-[10px] font-bold text-brand-orange uppercase tracking-widest leading-none opacity-80">Organize your next family gathering</p>
                </div>
                <div className="flex items-center space-x-6">
                    <button className="w-12 h-12 bg-orange-50 dark:bg-brand-orange/10 rounded-2xl flex items-center justify-center text-brand-orange transition-all hover:scale-105 active:scale-95 shadow-sm">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                    </button>
                    <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-orange-100 dark:border-brand-orange/30 shadow-sm transition-all hover:rotate-3">
                        <img src="https://i.pravatar.cc/150?u=owner" alt="Owner" className="w-full h-full object-cover" />
                    </div>
                </div>
            </header>

            {/* Upload Section */}
            <div
                onClick={() => fileInputRef.current?.click()}
                className="bg-white dark:bg-brand-darkCard rounded-[2.5rem] border-2 border-dashed border-orange-100 dark:border-brand-orange/20 p-12 mb-10 text-center flex flex-col items-center group hover:border-brand-orange/40 transition-all cursor-pointer relative overflow-hidden"
            >
                {previewUrl ? (
                    <img src={previewUrl} className="absolute inset-0 w-full h-full object-cover opacity-30" alt="Preview" />
                ) : (
                    <div className="w-20 h-20 bg-orange-50 dark:bg-brand-orange/5 rounded-[2rem] flex items-center justify-center text-brand-orange mb-6 transition-transform group-hover:scale-110 duration-300">
                        <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    </div>
                )}
                <h3 className="text-xl font-black text-gray-900 dark:text-brand-darkText mb-2 relative z-10">{previewUrl ? 'Change Event Photo' : 'Add Event Cover Photo'}</h3>
                <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-8 relative z-10">High Quality PNG or JPG supported</p>
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                />
                <button className="bg-brand-orange text-white px-12 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-brand-orange/20 hover:bg-orange-600 transition-all active:scale-95 relative z-10">
                    {coverFile ? coverFile.name : 'Browse Files'}
                </button>
            </div>

            {/* Form Section */}
            <div className="bg-white dark:bg-brand-darkCard rounded-[3rem] border border-gray-100 dark:border-brand-darkBorder p-8 sm:p-12 shadow-2xl shadow-gray-200/50 dark:shadow-none mb-10 transition-colors">
                <div className="flex items-center space-x-3 mb-10 pb-6 border-b border-gray-50 dark:border-brand-darkBorder">
                    <div className="p-3 bg-orange-50 dark:bg-brand-orange/10 rounded-2xl text-brand-orange">
                        <CalendarIcon size={24} />
                    </div>
                    <h3 className="text-xl font-black text-gray-900 dark:text-brand-darkText tracking-tight">Event Details</h3>
                </div>

                <div className="space-y-10" ref={pickerRef}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                        <div className="space-y-2">
                            <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] ml-1">Event Title</label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="Golden Wedding Anniversary"
                                className="w-full bg-gray-50 dark:bg-brand-darkBg/50 border-none rounded-[1.5rem] py-5 px-8 text-sm font-bold text-gray-700 dark:text-brand-darkText outline-none focus:ring-4 focus:ring-brand-orange/5 transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] ml-1">Location</label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white dark:bg-brand-darkCard rounded-2xl shadow-sm flex items-center justify-center group-focus-within:scale-110 transition-transform z-10">
                                    <MapPin size={22} className="text-brand-orange" />
                                </div>
                                <input
                                    type="text"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleChange}
                                    placeholder="Grand Ballroom, Plaza Hotel"
                                    className="w-full bg-gray-50 dark:bg-brand-darkBg/50 border-none rounded-[1.5rem] py-5 pl-[4.5rem] pr-8 text-sm font-bold text-gray-700 dark:text-brand-darkText outline-none focus:ring-4 focus:ring-brand-orange/5 transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] ml-1">Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows="4"
                            placeholder="Share some more details about the event..."
                            className="w-full bg-gray-50 dark:bg-brand-darkBg/50 border-none rounded-[1.5rem] py-6 px-8 text-sm font-bold text-gray-700 dark:text-brand-darkText outline-none focus:ring-4 focus:ring-brand-orange/5 resize-none transition-all"
                        ></textarea>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                        <div className="space-y-2 relative">
                            <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] ml-1">Start Date</label>
                            <button
                                onClick={() => setActivePicker(activePicker === 'startDate' ? null : 'startDate')}
                                className="w-full bg-gray-50 dark:bg-brand-darkBg/50 border-none rounded-[1.5rem] py-5 pl-[4.5rem] pr-8 text-sm font-bold text-gray-700 dark:text-brand-darkText outline-none focus:ring-4 focus:ring-brand-orange/5 transition-all flex items-center justify-start text-left relative overflow-hidden"
                            >
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white dark:bg-brand-darkCard rounded-2xl shadow-sm flex items-center justify-center pointer-events-none">
                                    <CalendarIcon size={22} className="text-brand-orange" />
                                </div>
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
                        <div className="space-y-2 relative">
                            <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] ml-1">End Date</label>
                            <button
                                onClick={() => setActivePicker(activePicker === 'endDate' ? null : 'endDate')}
                                className={`w-full ${errors.endDate ? 'bg-red-50/50 dark:bg-red-900/5 focus:ring-red-500/10' : 'bg-gray-50 dark:bg-brand-darkBg/50 focus:ring-brand-orange/5'} border-none rounded-[1.5rem] py-5 pl-[4.5rem] pr-8 text-sm font-bold text-gray-700 dark:text-brand-darkText outline-none transition-all flex items-center justify-start text-left relative overflow-hidden`}
                            >
                                <div className={`absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-2xl shadow-sm flex items-center justify-center pointer-events-none ${errors.endDate ? 'bg-red-50 text-red-500' : 'bg-white dark:bg-brand-darkCard text-brand-orange'}`}>
                                    {errors.endDate ? <AlertCircle size={22} /> : <CalendarIcon size={22} />}
                                </div>
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
                            {errors.endDate && (
                                <p className="flex items-center space-x-1.5 mt-2 text-[10px] font-black text-red-500 uppercase tracking-tight ml-1 animate-in slide-in-from-left-2">
                                    <AlertCircle size={12} />
                                    <span>{errors.endDate}</span>
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="w-full sm:w-1/2 space-y-2 relative">
                        <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] ml-1">Event Time</label>
                        <button
                            onClick={() => setActivePicker(activePicker === 'time' ? null : 'time')}
                            className="w-full bg-gray-50 dark:bg-brand-darkBg/50 border-none rounded-[1.5rem] py-5 pl-[4.5rem] pr-8 text-sm font-bold text-gray-700 dark:text-brand-darkText outline-none focus:ring-4 focus:ring-brand-orange/5 transition-all flex items-center justify-start text-left relative overflow-hidden"
                        >
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white dark:bg-brand-darkCard rounded-2xl shadow-sm flex items-center justify-center pointer-events-none">
                                <Clock size={22} className="text-brand-orange" />
                            </div>
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

            {/* Invite Section */}
            <div className="mb-12">
                <div className="flex items-center justify-between mb-8 ml-1">
                    <h3 className="text-xl font-black text-gray-900 dark:text-brand-darkText tracking-tight">Invite Members</h3>
                    <button className="text-[10px] font-black text-brand-orange uppercase tracking-[.25em] hover:underline transition-all">Select All</button>
                </div>
                <div className="flex items-start space-x-6 overflow-x-auto pb-6 -mx-2 px-2 scroll-hide">
                    <button className="flex flex-col items-center space-y-3 shrink-0 group">
                        <div className="w-20 h-20 bg-brand-orange rounded-[2.2rem] flex items-center justify-center text-white shadow-2xl shadow-brand-orange/40 group-hover:bg-orange-600 active:scale-90 transition-all">
                            <svg className="w-8 h-8 font-bold" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
                        </div>
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Add New</span>
                    </button>
                    {invitees.map((p, i) => (
                        <div
                            key={p.id || i}
                            onClick={() => toggleMember(p.id)}
                            className="flex flex-col items-center space-y-3 shrink-0 group cursor-pointer"
                        >
                            <div className={`w-20 h-20 rounded-[2.2rem] overflow-hidden border-2 transition-all duration-300 transform group-hover:-translate-y-1 ${selectedMembers.includes(p.id) ? 'border-brand-orange shadow-lg shadow-brand-orange/20' : 'border-orange-50 dark:border-brand-darkBorder shadow-sm'}`}>
                                <img src={p.img} alt={p.name} className={`w-full h-full object-cover transition-all duration-300 ${selectedMembers.includes(p.id) ? 'grayscale-0' : 'grayscale group-hover:grayscale-0'}`} />
                            </div>
                            <span className={`text-[10px] font-black tracking-tight text-center max-w-[80px] leading-tight transition-colors ${selectedMembers.includes(p.id) ? 'text-brand-orange' : 'text-gray-900 dark:text-brand-darkText group-hover:text-brand-orange'}`}>{p.name}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="mb-20">
                <button
                    onClick={handleCreate}
                    disabled={isSubmitting}
                    className={`w-full bg-brand-orange text-white py-6 rounded-[2rem] font-black shadow-2xl shadow-brand-orange/40 hover:bg-orange-600 transform transition-all active:scale-[0.98] text-xl tracking-tight flex items-center justify-center space-x-3 group ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                    <span>{isSubmitting ? 'Creating...' : 'Create Event'}</span>
                    <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center group-hover:translate-x-1 transition-transform">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
                    </div>
                </button>
            </div>
            <Notification
                message={notification.message}
                type={notification.type}
                onClose={() => setNotification({ message: '', type: 'success' })}
            />
        </div>
    );
};

export default CreateEventInvitee;
