import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEvent } from '../../context/EventContext';
import {
    Calendar,
    Users,
    Clock,
    MapPin,
    Link as LinkIcon,
    User,
    Image as ImageIcon,
    ChevronDown,
    Bell,
    CheckCircle2,
    Plus,
    X
} from 'lucide-react';

const Tab = ({ label, active, onClick }) => (
    <button
        onClick={onClick}
        className={`pb-4 text-sm font-bold transition-all px-2 whitespace-nowrap ${active ? 'text-gray-900 dark:text-brand-darkText border-b-2 border-brand-orange' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400'}`}
    >
        {label}
    </button>
);

const InputField = ({ label, placeholder, type = "text", icon: Icon, value, onChange, error }) => (
    <div className="space-y-1.5 mb-5 text-left">
        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            {label}
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

const TextArea = ({ label, placeholder, value, onChange, rows = 3 }) => (
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
    </div>
);

const SelectField = ({ label, options, value, onChange, icon: Icon }) => (
    <div className="space-y-1.5 mb-5 text-left">
        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            {label}
        </label>
        <div className="relative">
            {Icon && (
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Icon className="h-4 w-4 text-gray-400" />
                </div>
            )}
            <select
                value={value}
                onChange={onChange}
                className={`block w-full ${Icon ? 'pl-11' : 'px-4'} py-3 bg-[#F3F4F6]/50 dark:bg-brand-darkBg/50 border border-transparent rounded-xl focus:ring-2 focus:ring-brand-orange/20 text-gray-900 dark:text-brand-darkText font-medium transition-all text-sm appearance-none cursor-pointer`}
            >
                {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                <ChevronDown className="h-4 w-4 text-gray-400" />
            </div>
        </div>
    </div>
);

const CheckboxItem = ({ label, checked, onChange }) => (
    <div className="flex items-center space-x-4 py-4 px-5 bg-[#F3F4F6]/30 dark:bg-brand-darkBg/30 rounded-2xl cursor-pointer group hover:bg-white dark:hover:bg-brand-darkCard border border-transparent hover:border-gray-100 dark:hover:border-brand-darkBorder transition-all" onClick={onChange}>
        <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${checked ? 'bg-brand-orange shadow-md shadow-brand-orange/20' : 'bg-gray-100 dark:bg-brand-darkBg border border-gray-200 dark:border-brand-darkBorder'}`}>
            {checked && <CheckCircle2 className="w-4 h-4 text-white" />}
        </div>
        <span className={`text-sm font-bold ${checked ? 'text-gray-900 dark:text-brand-darkText' : 'text-gray-500 dark:text-gray-400'}`}>{label}</span>
    </div>
);

const ToggleSwitch = ({ label, subtext, enabled, onToggle }) => (
    <div className="flex items-center justify-between py-5 bg-[#F3F4F6]/20 dark:bg-brand-darkBg/20 px-6 rounded-2xl mb-6">
        <div className="text-left">
            <p className="text-sm font-extrabold text-gray-900 dark:text-brand-darkText">{label}</p>
            {subtext && <p className="text-[11px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-tight mt-0.5">{subtext}</p>}
        </div>
        <button
            onClick={onToggle}
            className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${enabled ? 'bg-brand-orange' : 'bg-gray-200 dark:bg-gray-700'}`}
        >
            <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'} shadow-sm`} />
        </button>
    </div>
);

const CreateEvent = () => {
    const navigate = useNavigate();
    const { eventData, updateEventData, resetEventData } = useEvent();
    const [activeTab, setActiveTab] = useState('Basic Info');
    const [statusModal, setStatusModal] = useState({ show: false, type: 'success', title: '', message: '' });
    const [membersList, setMembersList] = useState([]);

    // Ritual Local States
    const [newStep, setNewStep] = useState({ title: '', description: '', time: '', role: '主持' });
    const [newOffering, setNewOffering] = useState('');

    useEffect(() => {
        const fetchMembersList = async () => {
            try {
                const baseUrl = import.meta.env.VITE_API_BASE_URL || `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}`;
                const token = localStorage.getItem('token');
                const user = JSON.parse(localStorage.getItem('user') || '{}');
                let familyId = localStorage.getItem('selected_family_id') || user?.family_id || user?.family_space_id || 'DEFAULT_FAMILY_ID';
                if (familyId === 'undefined' || familyId === 'null') familyId = 'DEFAULT_FAMILY_ID';
                if (!token || familyId === 'DEFAULT_FAMILY_ID') return;

                const endpoint = `${baseUrl}/families/${familyId}/members?t=${Date.now()}`;
                const response = await fetch(endpoint, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await response.json();
                if (response.ok) {
                    const names = data.map(m => m.name || `${m.first_name || ''} ${m.last_name || ''}`.trim() || 'User');
                    setMembersList(names);
                    
                    // Also populate Secret Santa participants if not already set
                    if (eventData.secretSantaData.participants.length === 0) {
                        const participants = data.map(m => ({
                            id: m.user_id || m.id,
                            name: m.name || `${m.first_name || ''} ${m.last_name || ''}`.trim() || 'User',
                            selected: true
                        })).filter(p => p.id); // Only users can participate in Secret Santa
                        updateEventData({ secretSantaData: { ...eventData.secretSantaData, participants } });
                    }
                }
            } catch (err) {
                console.error('Failed to fetch members list:', err);
            }
        };
        fetchMembersList();
    }, []);

    const toggleInviteMethod = (method) => {
        updateEventData({
            inviteMethods: { ...eventData.inviteMethods, [method]: !eventData.inviteMethods[method] }
        });
    };

    const toggleReminder = (time) => {
        const item = `${time} before`;
        const newReminders = eventData.reminders.includes(item)
            ? eventData.reminders.filter(r => r !== item)
            : [...eventData.reminders, item];
        updateEventData({ reminders: newReminders });
    };

    const addStep = () => {
        if (!newStep.title) return;
        updateEventData({ workflowSteps: [...eventData.workflowSteps, { ...newStep, id: Date.now() }] });
        setNewStep({ title: '', description: '', time: '', role: '主持' });
    };

    const removeStep = (id) => {
        updateEventData({ workflowSteps: eventData.workflowSteps.filter(s => s.id !== id) });
    };

    const addOffering = () => {
        if (!newOffering) return;
        updateEventData({ offerings: [...eventData.offerings, newOffering] });
        setNewOffering('');
    };

    const removeOffering = (index) => {
        updateEventData({ offerings: eventData.offerings.filter((_, i) => i !== index) });
    };

    const handleCreateEvent = async () => {
        try {
            const baseUrl = import.meta.env.VITE_API_BASE_URL || `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}`;
            const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
            let familyId = localStorage.getItem('selected_family_id') || storedUser?.family_id || storedUser?.family_space_id || 'DEFAULT_FAMILY_ID';
            if (familyId === 'undefined' || familyId === 'null') familyId = 'DEFAULT_FAMILY_ID';

            const body = new FormData();
            body.append('family_space_id', familyId);
            body.append('title', eventData.title);
            body.append('event_type', eventData.type);
            body.append('description', eventData.description || '');
            if (eventData.startDate) body.append('start_date', eventData.startDate);
            if (eventData.endDate) body.append('end_date', eventData.endDate);
            if (eventData.eventTime || eventData.time) body.append('event_time', eventData.eventTime || eventData.time);
            if (eventData.rsvpDeadline) body.append('rsvp_deadline', eventData.rsvpDeadline);
            body.append('location', eventData.locationType === 'physical' ? (eventData.address || '') : (eventData.meetingLink || ''));
            if (eventData.capacity) body.append('max_participants', eventData.capacity);
            body.append('request_rsvp', String(eventData.requestRsvp !== false));
            body.append('send_reminders', String(
                eventData.sendReminders === true ||
                (Array.isArray(eventData.reminders) && eventData.reminders.length > 0) ||
                !!eventData.inviteMethods?.notification
            ));
            body.append('include_gift_exchange', String(!!eventData.isSecretSanta || !!eventData.includeGiftExchange));
            if (eventData.invitedUserIds?.length) {
                body.append('invited_user_ids', JSON.stringify(eventData.invitedUserIds));
            }
            // Dynamic Features
            body.append('is_secret_santa', eventData.isSecretSanta);
            if (eventData.isSecretSanta) {
                body.append('secret_santa_data', JSON.stringify({
                    ...eventData.secretSantaData,
                    participants: eventData.secretSantaData.participants.filter(p => p.selected)
                }));
            }

            // Tab 2: Invite Scope
            body.append('audience', eventData.audience);
            body.append('invite_methods', JSON.stringify(eventData.inviteMethods));
            body.append('reminders', JSON.stringify(eventData.reminders));
            body.append('guests_allowed', eventData.guestsAllowed || 0);

            // Tab 3: Ritual Protocols
            body.append('workflow_steps', JSON.stringify(eventData.workflowSteps));
            body.append('offerings', JSON.stringify(eventData.offerings));
            body.append('dress_code', eventData.dressCode);
            body.append('etiquette_notes', eventData.etiquetteNotes);
            body.append('visibility', eventData.visibility);

            if (eventData.coverFile) {
                body.append('cover_photo', eventData.coverFile);
            }

            const response = await fetch(`${baseUrl}/families/${familyId}/events`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || 'Failed to create event');
            }

            setStatusModal({
                show: true,
                type: 'success',
                title: 'Event Created',
                message: 'Your family event has been successfully scheduled and published.'
            });
            resetEventData();
        } catch (err) {
            console.error(err);
            setStatusModal({
                show: true,
                type: 'error',
                title: 'Creation Failed',
                message: err.message || 'Error creating event'
            });
        }
    };

    const closeStatusModal = () => {
        const isSuccess = statusModal.type === 'success';
        setStatusModal({ ...statusModal, show: false });
        if (isSuccess) navigate('/events');
    };

    return (
        <div className="flex flex-col max-w-4xl mx-auto w-full min-h-[calc(100vh-100px)]">
            <header className="mb-10 text-left">
                <h2 className="text-gray-900 dark:text-brand-darkText text-sm font-bold opacity-30 dark:opacity-40 mb-2 uppercase tracking-widest">Kinecore Events</h2>
                <h1 className="text-3xl font-extrabold text-gray-900 dark:text-brand-darkText">Create New Family Event</h1>
            </header>

            {/* Tabs */}
            <div className="flex overflow-x-auto no-scrollbar space-x-8 border-b border-gray-100 dark:border-brand-darkBorder mb-10">
                {['Basic Info', 'Invite Scope', 'Ritual Protocols'].map(tab => (
                    <Tab
                        key={tab}
                        label={tab}
                        active={activeTab === tab}
                        onClick={() => setActiveTab(tab)}
                    />
                ))}
            </div>

            {/* Content Area */}
            <div className="bg-white dark:bg-brand-darkCard rounded-3xl border border-gray-100 dark:border-brand-darkBorder shadow-sm p-8 flex-1 mb-8 animate-fadeIn">

                {activeTab === 'Basic Info' && (
                    <div className="space-y-6">
                        <InputField
                            label="Event Title"
                            placeholder="Enter a descriptive title"
                            value={eventData.title}
                            onChange={e => updateEventData({ title: e.target.value })}
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <SelectField
                                label="Event Type"
                                options={['Family Reunion', 'Memorial', 'Wedding', 'Birthday', 'Clan Meeting', 'Festival', 'Milestone Ritual (Birth/Wedding)', 'Celebration of Life', 'Monthly Board Meeting', 'Annual General Meeting', 'Migration Commemoration', 'Social Gathering', 'Other']}
                                value={eventData.type}
                                onChange={e => updateEventData({ type: e.target.value })}
                            />
                            <InputField
                                label="RSVP Deadline"
                                type="date"
                                value={eventData.rsvpDeadline}
                                onChange={e => updateEventData({ rsvpDeadline: e.target.value })}
                            />
                        </div>
                        <TextArea
                            label="Description"
                            placeholder="Provide details about the event..."
                            value={eventData.description}
                            onChange={e => updateEventData({ description: e.target.value })}
                            rows={4}
                        />

                        <label className="bg-[#F3F4F6]/30 dark:bg-brand-darkBg/30 rounded-2xl p-6 border border-dashed border-gray-200 dark:border-brand-darkBorder text-center cursor-pointer hover:bg-gray-100 dark:hover:bg-brand-darkBg/50 transition-colors block">
                            <input type="file" className="hidden" accept="image/*" onChange={(e) => updateEventData({ coverFile: e.target.files[0] })} />
                            {eventData.coverFile ? (
                                <p className="text-sm font-bold text-brand-orange">{eventData.coverFile.name}</p>
                            ) : (
                                <>
                                    <ImageIcon className="mx-auto h-8 w-8 text-gray-300 mb-2" />
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Upload Cover Image</p>
                                </>
                            )}
                        </label>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InputField label="Start Date/Time" type="datetime-local" value={eventData.startDate} onChange={e => updateEventData({ startDate: e.target.value })} />
                            <InputField label="End Date/Time" type="datetime-local" value={eventData.endDate} onChange={e => updateEventData({ endDate: e.target.value })} />
                        </div>

                        <div className="pt-6 border-t border-gray-50 dark:border-brand-darkBorder">
                            <div className="flex bg-gray-100 dark:bg-brand-darkBg p-1 rounded-xl w-fit mb-4">
                                <button onClick={() => updateEventData({ locationType: 'physical' })} className={`px-6 py-2 text-xs font-bold rounded-lg transition-all ${eventData.locationType === 'physical' ? 'bg-white shadow-sm text-brand-orange' : 'text-gray-400'}`}>Physical</button>
                                <button onClick={() => updateEventData({ locationType: 'online' })} className={`px-6 py-2 text-xs font-bold rounded-lg transition-all ${eventData.locationType === 'online' ? 'bg-white shadow-sm text-brand-orange' : 'text-gray-400'}`}>Online</button>
                            </div>
                            {eventData.locationType === 'physical' ? (
                                <>
                                    <InputField label="Physical Address" icon={MapPin} placeholder="Enter venue address" value={eventData.address} onChange={e => updateEventData({ address: e.target.value })} />
                                </>
                            ) : (
                                <InputField label="Meeting Link" icon={LinkIcon} placeholder="https://zoom.us/..." value={eventData.meetingLink} onChange={e => updateEventData({ meetingLink: e.target.value })} />
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                            <InputField label="Capacity (Optional)" placeholder="Unlimited" value={eventData.capacity} onChange={e => updateEventData({ capacity: e.target.value })} />
                            <SelectField label="Visibility" options={['Private (invited only)', 'Family visible']} value={eventData.visibility} onChange={e => updateEventData({ visibility: e.target.value })} />
                        </div>

                        <div className="pt-6 border-t border-gray-50 dark:border-brand-darkBorder">
                            <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Event Features</h3>
                            <CheckboxItem
                                label="Secret Santa / Gift Exchange"
                                checked={eventData.isSecretSanta}
                                onChange={() => updateEventData({ isSecretSanta: !eventData.isSecretSanta })}
                            />
                        </div>

                        <div className="pt-6 border-t border-gray-50 dark:border-brand-darkBorder">
                            <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Event Roles</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <SelectField
                                    label="Primary Contact Person"
                                    options={['Me (Admin)', ...membersList]}
                                    value={eventData.contactPerson || 'Me (Admin)'}
                                    onChange={e => updateEventData({ contactPerson: e.target.value })}
                                    icon={User}
                                />
                                <InputField
                                    label="Contact Phone/Email"
                                    placeholder="For RSVP inquiries..."
                                    value={eventData.contactInfo || ''}
                                    onChange={e => updateEventData({ contactInfo: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="flex items-center space-x-3 bg-gray-50 dark:bg-brand-darkBg/50 p-4 rounded-2xl">
                            <div className="w-10 h-10 rounded-full bg-brand-orange/10 flex items-center justify-center text-brand-orange"><User size={20} /></div>
                            <div className="text-left">
                                <p className="text-sm font-bold text-gray-900 dark:text-brand-darkText">Current Family Admin</p>
                                <p className="text-[10px] text-gray-500 font-medium uppercase tracking-tight">Organizer (Read-only)</p>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'Invite Scope' && (
                    <div className="space-y-10">
                        <div>
                            <h3 className="text-lg font-extrabold text-gray-900 dark:text-brand-darkText mb-6 text-left">Select Audience</h3>
                            <div className="grid grid-cols-1 gap-3">
                                <CheckboxItem label="Entire Family (Global)" checked={eventData.audience === 'Entire family'} onChange={() => updateEventData({ audience: 'Entire family' })} />
                                <CheckboxItem label="Specific Branches Only" checked={eventData.audience === 'Branches'} onChange={() => updateEventData({ audience: 'Branches' })} />
                                <CheckboxItem label="Specific Households Only" checked={eventData.audience === 'Households'} onChange={() => updateEventData({ audience: 'Households' })} />
                                <CheckboxItem label="Individual Invitees (Custom List)" checked={eventData.audience === 'Custom'} onChange={() => updateEventData({ audience: 'Custom' })} />
                            </div>
                        </div>

                        <div className="pt-10 border-t border-gray-50 dark:border-brand-darkBorder">
                            <h3 className="text-lg font-extrabold text-gray-900 dark:text-brand-darkText mb-6 text-left">Invite Delivery</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <CheckboxItem label="In-app Notification" checked={eventData.inviteMethods.notification} onChange={() => toggleInviteMethod('notification')} />
                                <CheckboxItem label="Email Invitation" checked={eventData.inviteMethods.email} onChange={() => toggleInviteMethod('email')} />
                            </div>
                        </div>

                        <div className="pt-10 border-t border-gray-50 dark:border-brand-darkBorder">
                            <h3 className="text-lg font-extrabold text-gray-900 dark:text-brand-darkText mb-6 text-left text-left">RSVP Options</h3>
                            <div className="bg-[#F3F4F6]/30 dark:bg-brand-darkBg/30 rounded-2xl p-6 mb-6 flex space-x-4">
                                {['Yes', 'No', 'Maybe'].map(opt => (
                                    <div key={opt} className="flex flex-col items-center gap-2">
                                        <div className="px-5 py-2 bg-white dark:bg-brand-darkBg rounded-xl border border-gray-100 dark:border-brand-darkBorder text-sm font-bold text-gray-800 dark:text-brand-darkText shadow-sm">{opt}</div>
                                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none">Option</p>
                                    </div>
                                ))}
                            </div>
                            <InputField label="Guests Allowed per Invitee" placeholder="0" type="number" value={eventData.guestsAllowed} onChange={e => updateEventData({ guestsAllowed: e.target.value })} />
                        </div>

                        <div className="pt-10 border-t border-gray-50 dark:border-brand-darkBorder">
                            <h3 className="text-lg font-extrabold text-gray-900 dark:text-brand-darkText mb-6 text-left">Reminder Schedule</h3>
                            <div className="flex flex-wrap gap-3">
                                {['7d', '3d', '1d'].map(time => (
                                    <button
                                        key={time}
                                        onClick={() => toggleReminder(time)}
                                        className={`px-6 py-3 rounded-2xl text-sm font-bold transition-all ${eventData.reminders.includes(`${time} before`) ? 'bg-brand-orange text-white' : 'bg-gray-100 text-gray-400'}`}
                                    >
                                        {time} before
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'Ritual Protocols' && (
                    <div className="space-y-10">
                        <SelectField
                            label="Ritual Template"
                            options={['None', 'Wedding', 'Ancestral Worship', 'New Birth Celebration']}
                            value={eventData.ritualTemplate}
                            onChange={e => updateEventData({ ritualTemplate: e.target.value })}
                        />

                        <div className="pt-10 border-t border-gray-50 dark:border-brand-darkBorder">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-lg font-extrabold text-gray-900 dark:text-brand-darkText">Workflow Steps</h3>
                                <button className="text-brand-orange text-xs font-bold" onClick={() => { }}>View Timeline</button>
                            </div>
                            <div className="space-y-4 mb-8">
                                {eventData.workflowSteps.map((step) => (
                                    <div key={step.id} className="p-5 bg-gray-50 dark:bg-brand-darkBg/50 rounded-[2rem] border border-gray-100 relative text-left">
                                        <button onClick={() => removeStep(step.id)} className="absolute top-4 right-4 text-gray-300 hover:text-red-400"><X size={16} /></button>
                                        <div className="flex items-center space-x-2 mb-2">
                                            <h4 className="text-base font-extrabold text-gray-900 dark:text-brand-darkText">{step.title}</h4>
                                            <span className="text-[10px] font-black bg-brand-orange/10 text-brand-orange px-2 py-0.5 rounded uppercase">{step.time}</span>
                                        </div>
                                        <p className="text-sm text-gray-500 font-medium mb-4">{step.description}</p>
                                        <div className="flex items-center space-x-2 text-[11px] font-bold text-gray-400 uppercase tracking-widest"><User size={12} /> {step.role}</div>
                                    </div>
                                ))}
                            </div>

                            <div className="p-6 bg-orange-50/30 dark:bg-brand-orange/5 border border-dashed border-brand-orange/30 rounded-[2rem] text-left">
                                <InputField label="Step Title" placeholder="Next step name..." value={newStep.title} onChange={e => setNewStep({ ...newStep, title: e.target.value })} />
                                <div className="grid grid-cols-2 gap-4">
                                    <InputField label="Time" type="time" value={newStep.time} onChange={e => setNewStep({ ...newStep, time: e.target.value })} />
                                    <SelectField label="Role" options={['主持', '司仪', '祭拜负责人', '摄影', '后勤']} value={newStep.role} onChange={e => setNewStep({ ...newStep, role: e.target.value })} />
                                </div>
                                <button onClick={addStep} className="w-full mt-4 py-3 bg-brand-orange text-white rounded-xl font-bold">Add Step</button>
                            </div>
                        </div>

                        <div className="pt-10 border-t border-gray-50 dark:border-brand-darkBorder grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InputField label="Dress Code" placeholder="Formal / Traditional" value={eventData.dressCode} onChange={e => updateEventData({ dressCode: e.target.value })} />
                            <TextArea label="Etiquette Notes" placeholder="Special rules..." value={eventData.etiquetteNotes} onChange={e => updateEventData({ etiquetteNotes: e.target.value })} />
                        </div>

                        <ToggleSwitch label="Media Policy" subtext="Allow recording and photography" enabled={eventData.recordingAllowed} onToggle={() => updateEventData({ recordingAllowed: !eventData.recordingAllowed })} />

                        <div className="pt-10 border-t border-gray-50 dark:border-brand-darkBorder">
                            <h3 className="text-lg font-extrabold text-gray-900 dark:text-brand-darkText mb-6 text-left">Offerings Checklist</h3>
                            <div className="flex space-x-3 mb-6">
                                <input value={newOffering} onChange={e => setNewOffering(e.target.value)} className="flex-1 px-5 py-3.5 bg-gray-50 rounded-2xl outline-none text-sm font-bold" placeholder="Add item..." />
                                <button onClick={addOffering} className="p-3.5 bg-brand-orange text-white rounded-2xl"><Plus size={24} /></button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {eventData.offerings.map((o, i) => (
                                    <div key={i} className="flex items-center space-x-2 bg-gray-50 px-4 py-2 rounded-xl border border-gray-100 text-xs font-bold text-gray-700">
                                        <span>{o}</span>
                                        <button onClick={() => removeOffering(i)} className="text-gray-300 hover:text-red-400"><X size={14} /></button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Secret Santa Setup (Conditionally rendered inside the content area) */}
                {eventData.isSecretSanta && (
                    <div className="mt-10 pt-10 border-t-2 border-dashed border-gray-100 dark:border-brand-darkBorder animate-fadeIn space-y-8">
                        <div className="flex items-center space-x-3 mb-2">
                            <div className="w-10 h-10 rounded-full bg-brand-orange/10 flex items-center justify-center text-brand-orange">
                                <Users size={20} />
                            </div>
                            <h2 className="text-xl font-extrabold text-gray-900 dark:text-brand-darkText">Gift Exchange Details</h2>
                        </div>

                        <div className="space-y-6">
                            <InputField
                                label="Exchange Name"
                                placeholder="e.g., Mehta Family Christmas 2026"
                                value={eventData.secretSantaData.exchangeName}
                                onChange={e => updateEventData({ secretSantaData: { ...eventData.secretSantaData, exchangeName: e.target.value } })}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <InputField
                                    label="Event Date"
                                    type="date"
                                    value={eventData.secretSantaData.eventDate}
                                    onChange={e => updateEventData({ secretSantaData: { ...eventData.secretSantaData, eventDate: e.target.value } })}
                                />
                                <InputField
                                    label="Gift Deadline"
                                    type="date"
                                    value={eventData.secretSantaData.giftDeadline}
                                    onChange={e => updateEventData({ secretSantaData: { ...eventData.secretSantaData, giftDeadline: e.target.value } })}
                                />
                            </div>

                            <TextArea
                                label="Description"
                                placeholder="Tell everyone about the exchange..."
                                value={eventData.secretSantaData.description}
                                onChange={e => updateEventData({ secretSantaData: { ...eventData.secretSantaData, description: e.target.value } })}
                            />
                        </div>

                        <div className="pt-8 border-t border-gray-50 dark:border-brand-darkBorder">
                            <h3 className="text-lg font-extrabold text-gray-900 dark:text-brand-darkText mb-6 text-left">Participants</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {eventData.secretSantaData.participants.map(p => (
                                    <CheckboxItem
                                        key={p.id}
                                        label={p.name}
                                        checked={p.selected}
                                        onChange={() => {
                                            const newParticipants = eventData.secretSantaData.participants.map(item =>
                                                item.id === p.id ? { ...item, selected: !item.selected } : item
                                            );
                                            updateEventData({ secretSantaData: { ...eventData.secretSantaData, participants: newParticipants } });
                                        }}
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="pt-8 border-t border-gray-50 dark:border-brand-darkBorder">
                            <h3 className="text-lg font-extrabold text-gray-900 dark:text-brand-darkText mb-6 text-left">Gift Rules</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <InputField
                                    label="Min Budget"
                                    placeholder="0"
                                    type="number"
                                    value={eventData.secretSantaData.budgetMin}
                                    onChange={e => updateEventData({ secretSantaData: { ...eventData.secretSantaData, budgetMin: e.target.value } })}
                                />
                                <InputField
                                    label="Max Budget"
                                    placeholder="1000"
                                    type="number"
                                    value={eventData.secretSantaData.budgetMax}
                                    onChange={e => updateEventData({ secretSantaData: { ...eventData.secretSantaData, budgetMax: e.target.value } })}
                                />
                            </div>
                            <TextArea
                                label="Notes / Instructions"
                                placeholder="Any special rules or wishlist items?"
                                value={eventData.secretSantaData.notes}
                                onChange={e => updateEventData({ secretSantaData: { ...eventData.secretSantaData, notes: e.target.value } })}
                            />
                            <div className="mt-4">
                                <ToggleSwitch
                                    label="Anonymous Mode"
                                    subtext="Keep pairings identity secret until the event"
                                    enabled={eventData.secretSantaData.anonymousMode}
                                    onToggle={() => updateEventData({ secretSantaData: { ...eventData.secretSantaData, anonymousMode: !eventData.secretSantaData.anonymousMode } })}
                                />
                            </div>
                        </div>

                        <div className="pt-10 flex justify-end">
                            <button
                                onClick={() => navigate('/events/secret-santa/preview')}
                                className="px-12 py-4 bg-brand-orange text-white rounded-2xl font-bold uppercase text-sm tracking-widest shadow-lg shadow-brand-orange/20 hover:bg-orange-600 transition-all flex items-center"
                            >
                                Next: Preview Pairings
                                <Plus size={18} className="ml-2 rotate-45" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Global Actions */}
            <div className="fixed bottom-0 left-0 right-0 sm:static bg-white/90 dark:bg-brand-darkCard/90 backdrop-blur-md sm:bg-transparent border-t border-gray-100 sm:border-none p-4 flex flex-col-reverse sm:flex-row justify-end gap-3 z-30">
                <button onClick={() => navigate('/events')} className="w-full sm:w-auto px-10 py-4 rounded-2xl font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 transition-all uppercase text-sm tracking-widest">Cancel</button>
                <button onClick={handleCreateEvent} className="w-full sm:w-auto px-12 py-4 rounded-2xl font-bold text-white bg-brand-orange shadow-lg shadow-brand-orange/25 hover:bg-orange-600 transition-all uppercase text-sm tracking-widest">Create Event</button>
            </div>

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
                                <X className="w-10 h-10" strokeWidth={3} />
                            )}
                        </div>
                        <h3 className="text-xl font-black text-gray-900 dark:text-brand-darkText text-center mb-2 uppercase tracking-tight">
                            {statusModal.title}
                        </h3>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 text-center mb-8 leading-relaxed px-4">
                            {statusModal.message}
                        </p>
                        <button
                            onClick={closeStatusModal}
                            className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-lg active:scale-95 ${
                                statusModal.type === 'success'
                                    ? 'bg-brand-orange text-white shadow-brand-orange/25 hover:bg-orange-600'
                                    : 'bg-gray-900 dark:bg-brand-darkBorder text-white hover:bg-black'
                            }`}
                        >
                            {statusModal.type === 'success' ? 'Continue' : 'Try Again'}
                        </button>
                    </div>
                </div>
            )}

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                .animate-fadeIn { animation: fadeIn 0.3s ease-out forwards; }
            `}} />
        </div>
    );
};

export default CreateEvent;
