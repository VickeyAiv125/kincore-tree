import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, Calendar, Briefcase, FileText, Eye, Shield, MapPin, X, ArrowLeft, Plus, AlertCircle } from 'lucide-react';
import Notification from '../../components/common/Notification';

const FormSection = ({ title, children }) => (
    <div className="bg-white dark:bg-brand-darkCard rounded-3xl border border-gray-100 dark:border-brand-darkBorder p-8 mb-8 shadow-sm transition-colors text-left">
        <h3 className="text-xl font-extrabold text-gray-900 dark:text-brand-darkText mb-8">{title}</h3>
        <div className="space-y-6">
            {children}
        </div>
    </div>
);

const PremiumInput = ({ label, placeholder, icon: Icon, type = "text", value, onChange }) => (
    <div className="space-y-2">
        <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] ml-1">{label}</label>
        <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white dark:bg-brand-darkCard rounded-2xl shadow-sm flex items-center justify-center group-focus-within:scale-110 transition-transform z-10">
                <Icon size={22} className="text-brand-orange" />
            </div>
            {type === "textarea" ? (
                <textarea
                    rows="4"
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    className="w-full bg-gray-50 dark:bg-brand-darkBg/50 border-none rounded-[1.5rem] py-5 pl-[4.5rem] pr-8 text-sm font-bold text-gray-700 dark:text-brand-darkText outline-none focus:ring-4 focus:ring-brand-orange/5 transition-all resize-none"
                />
            ) : (
                <input
                    type={type}
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    className="w-full bg-gray-50 dark:bg-brand-darkBg/50 border-none rounded-[1.5rem] py-5 pl-[4.5rem] pr-8 text-sm font-bold text-gray-700 dark:text-brand-darkText outline-none focus:ring-4 focus:ring-brand-orange/5 transition-all"
                />
            )}
        </div>
    </div>
);

const AddMember = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [saving, setSaving] = React.useState(false);
    const fileInputRef = React.useRef(null);
    const [preview, setPreview] = React.useState(null);
    const [modalError, setModalError] = React.useState(null);

    // Form State
    const [formData, setFormData] = React.useState({
        first_name: '',
        last_name: '',
        gender: 'Other',
        is_alive: true,
        birth_date: '',
        place_of_birth: '',
        bio: '',
        avatar: null
    });

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({ ...formData, avatar: file });
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async () => {
        if (!formData.first_name) {
            setModalError('First Name is required');
            return;
        }

        setSaving(true);
        try {
            const baseUrl = import.meta.env.VITE_API_BASE_URL || `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}`;
            const user = JSON.parse(localStorage.getItem('user'));
            const token = localStorage.getItem('token');

            const body = new FormData();
            body.append('first_name', formData.first_name);
            body.append('last_name', formData.last_name);
            body.append('gender', formData.gender);
            body.append('is_alive', formData.is_alive);
            body.append('birth_date', formData.birth_date);
            body.append('place_of_birth', formData.place_of_birth);
            body.append('bio', formData.bio);
            
            const currentFamilySpaceId = localStorage.getItem('currentFamilySpaceId');
            const familyIdToSend = (currentFamilySpaceId && currentFamilySpaceId !== 'null' && currentFamilySpaceId !== 'undefined')
                ? currentFamilySpaceId
                : user?.family_id;
            if (familyIdToSend) {
                body.append('family_id', familyIdToSend);
            }

            if (location.state?.parentId) body.append('parentId', location.state.parentId);
            if (location.state?.relType) body.append('relType', location.state.relType);
            if (formData.avatar) body.append('avatar', formData.avatar);

            const response = await fetch(`${baseUrl}/families/members`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                    // 'Content-Type': 'multipart/form-data' is handle by fetch
                },
                body
            });

            if (response.ok) {
                const returnUrl = location.state?.returnTo || '/owner/members';
                navigate(returnUrl);
            } else {
                const err = await response.json();
                setModalError(err.error || 'Failed to add member');
            }
        } catch (err) {
            console.error('Error adding member:', err);
            setModalError('An unexpected error occurred while adding member.');
        } finally {
            setSaving(false);
        }
    };

    // Dynamically set title based on navigation state
    const title = location.state?.title || "Add New Member";
    const returnUrl = location.state?.returnTo || '/owner/members';

    return (
        <div className="max-w-4xl mx-auto text-left">
            <header className="mb-10 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(returnUrl)} className="p-3 bg-gray-50 dark:bg-brand-darkBg/50 rounded-xl text-gray-400 hover:text-brand-orange transition-colors">
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <h2 className="text-brand-orange text-[10px] font-black uppercase tracking-widest mb-1">Owner Admin</h2>
                        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-brand-darkText leading-tight">{title}</h1>
                    </div>
                </div>
                <button onClick={() => navigate(returnUrl)} className="p-4 bg-gray-50 dark:bg-brand-darkBg/50 rounded-2xl text-gray-400 hover:text-brand-orange transition-colors">
                    <X size={24} />
                </button>
            </header>

            <FormSection title="Basic Information">
                <div className="flex flex-col items-center mb-10">
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileChange}
                    />
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className="w-32 h-32 rounded-[2.5rem] bg-orange-50 dark:bg-brand-orange/10 border-4 border-dashed border-gray-200 dark:border-brand-darkBorder shadow-inner flex items-center justify-center relative overflow-hidden group cursor-pointer transition-all hover:scale-105"
                    >
                        {preview ? (
                            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                            <Plus className="w-10 h-10 text-gray-300 group-hover:text-brand-orange transition-colors" />
                        )}
                        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center" />
                    </div>
                    <p className="mt-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Upload Profile photo</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <PremiumInput
                        label="First Name"
                        icon={User}
                        placeholder="Enter first name"
                        value={formData.first_name}
                        onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    />
                    <PremiumInput
                        label="Last Name"
                        icon={User}
                        placeholder="Enter last name"
                        value={formData.last_name}
                        onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    />
                </div>

                <div>
                    <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-4 ml-1">Gender Identity</label>
                    <div className="flex space-x-4">
                        {['Female', 'Male', 'Other'].map((gender) => (
                            <button
                                key={gender}
                                onClick={() => setFormData({ ...formData, gender })}
                                className={`px-10 py-4 rounded-2xl text-xs font-black transition-all ${formData.gender === gender ? 'bg-brand-orange text-white' : 'bg-gray-50 dark:bg-brand-darkBg text-gray-400 hover:bg-orange-50 dark:hover:bg-brand-orange/10 hover:text-brand-orange'}`}
                            >
                                {gender}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex items-center justify-between p-6 bg-orange-50/30 dark:bg-brand-orange/5 rounded-[2rem] border border-orange-100/50 dark:border-brand-darkBorder transition-colors">
                    <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-white dark:bg-brand-darkCard rounded-2xl flex items-center justify-center shadow-sm">
                            <Eye className="text-brand-orange" size={20} />
                        </div>
                        <div>
                            <p className="text-sm font-black text-gray-900 dark:text-brand-darkText uppercase tracking-tight">Living Status</p>
                            <p className="text-[10px] font-bold text-gray-400 uppercase">Is the person still alive?</p>
                        </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={formData.is_alive}
                            onChange={(e) => setFormData({ ...formData, is_alive: e.target.checked })}
                        />
                        <div className="w-14 h-7 bg-gray-200 dark:bg-brand-darkBg peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-orange"></div>
                    </label>
                </div>

                <PremiumInput
                    label="Date of Birth"
                    icon={Calendar}
                    type="date"
                    placeholder="MM/DD/YYYY"
                    value={formData.birth_date}
                    onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                />
            </FormSection>

            <FormSection title="Additional Details">
                <PremiumInput
                    label="Place of Birth"
                    icon={MapPin}
                    placeholder="Enter city, country"
                    value={formData.place_of_birth}
                    onChange={(e) => setFormData({ ...formData, place_of_birth: e.target.value })}
                />
                <PremiumInput
                    label="Biography / Personal Notes"
                    icon={FileText}
                    type="textarea"
                    placeholder="Add any historical notes or details..."
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                />
            </FormSection>

            {modalError && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white dark:bg-brand-darkCard rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-gray-100 dark:border-brand-darkBorder text-center transform transition-all">
                        <div className="w-14 h-14 bg-red-100 dark:bg-red-500/10 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <AlertCircle size={28} />
                        </div>
                        <h3 className="text-xl font-black text-gray-900 dark:text-brand-darkText mb-2">Notice</h3>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-6">{modalError}</p>
                        <button
                            onClick={() => setModalError(null)}
                            className="w-full py-3.5 px-6 rounded-2xl font-bold text-white bg-brand-orange hover:bg-orange-600 transition-all uppercase tracking-wider text-xs shadow-lg shadow-brand-orange/20"
                        >
                            OK
                        </button>
                    </div>
                </div>
            )}

            <Notification
                message={modalError}
                type="error"
                onClose={() => setModalError(null)}
            />

            <div className="flex flex-col sm:flex-row gap-4 mt-12 mb-20 justify-end">
                <button
                    onClick={() => navigate(returnUrl)}
                    disabled={saving}
                    className="w-full sm:w-auto px-10 py-4 rounded-2xl font-bold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-brand-darkBg hover:bg-gray-200 dark:hover:bg-brand-darkBorder transition-all uppercase text-sm tracking-widest disabled:opacity-50"
                >
                    Cancel
                </button>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full sm:w-auto px-12 py-4 rounded-2xl font-bold text-white bg-brand-orange shadow-lg shadow-brand-orange/25 hover:bg-orange-600 active:scale-95 transition-all uppercase text-sm tracking-widest flex items-center justify-center disabled:opacity-50"
                >
                    {saving ? 'Adding...' : 'Save & Add Member'}
                </button>
            </div>
        </div>
    );
};

export default AddMember;
