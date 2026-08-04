import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Notification from '../../components/common/Notification';
import { User, Calendar, Briefcase, FileText, Eye, Shield, MapPin, X, ArrowLeft, Plus, Mail, GitBranch, ArrowRight } from 'lucide-react';

const FormSection = ({ title, children }) => (
    <div className="bg-white dark:bg-brand-darkCard rounded-3xl border border-gray-100 dark:border-brand-darkBorder p-8 mb-8 shadow-sm transition-colors text-left">
        <h3 className="text-xl font-extrabold text-gray-900 dark:text-brand-darkText mb-8 uppercase tracking-tight">{title}</h3>
        <div className="space-y-6">
            {children}
        </div>
    </div>
);

const PremiumInput = ({ label, placeholder, icon: Icon, type = "text", value, onChange, disabled }) => (
    <div className="space-y-2 mb-4">
        <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] ml-1">{label}</label>
        <div className="relative group">
            <div className={`absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white dark:bg-brand-darkCard rounded-2xl shadow-sm flex items-center justify-center transition-transform z-10 ${!disabled && 'group-focus-within:scale-110'}`}>
                <Icon size={22} className="text-brand-orange" />
            </div>
            {type === "textarea" ? (
                <textarea
                    rows="4"
                    placeholder={placeholder}
                    value={value || ""}
                    onChange={onChange}
                    disabled={disabled}
                    className="w-full bg-gray-50 dark:bg-brand-darkBg/50 border-none rounded-[1.5rem] py-5 pl-[4.5rem] pr-8 text-sm font-bold text-gray-700 dark:text-brand-darkText outline-none focus:ring-4 focus:ring-brand-orange/5 transition-all resize-none disabled:opacity-50"
                />
            ) : (
                <input
                    type={type}
                    placeholder={placeholder}
                    value={value || ""}
                    onChange={onChange}
                    disabled={disabled}
                    className="w-full bg-gray-50 dark:bg-brand-darkBg/50 border-none rounded-[1.5rem] py-5 pl-[4.5rem] pr-8 text-sm font-bold text-gray-700 dark:text-brand-darkText outline-none focus:ring-4 focus:ring-brand-orange/5 transition-all disabled:opacity-50"
                />
            )}
        </div>
    </div>
);

const SelectionButton = ({ label, active, onClick }) => (
    <button
        onClick={onClick}
        type="button"
        className={`px-6 py-4 rounded-2xl text-[10px] font-black transition-all uppercase tracking-widest ${active ? 'bg-brand-orange text-white shadow-lg shadow-brand-orange/30' : 'bg-gray-50 dark:bg-brand-darkBg text-gray-400 hover:bg-gray-100 dark:hover:bg-brand-darkBorder'}`}
    >
        {label}
    </button>
);

const StatusBadge = ({ label, active, onClick }) => {
    const styles = {
        active: 'bg-green-50 text-green-500 border-green-100',
        suspended: 'bg-red-50 text-red-500 border-red-100',
        pending: 'bg-orange-50 text-orange-500 border-orange-100',
        claimed: 'bg-blue-50 text-blue-500 border-blue-100',
        unclaimed: 'bg-gray-100 text-gray-400 border-gray-200'
    };

    const styleKey = label?.toLowerCase().includes('pending') ? 'pending' :
        label?.toLowerCase().includes('suspended') ? 'suspended' :
            label?.toLowerCase().includes('active') ? 'active' :
                label?.toLowerCase().includes('claimed') && !label?.toLowerCase().includes('un') ? 'claimed' : 'unclaimed';

    return (
        <button
            onClick={onClick}
            type="button"
            className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all ${active ? styles[styleKey] : 'bg-gray-50 text-gray-400 border-transparent opacity-60 hover:opacity-100'}`}
        >
            {label}
        </button>
    );
};

const EditMember = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = React.useState(true);
    const [updating, setUpdating] = React.useState(false);
    const [branches, setBranches] = React.useState([]);
    const [allMembers, setAllMembers] = React.useState([]);
    const [visibility, setVisibility] = React.useState('Family Only');
    const [privacy, setPrivacy] = React.useState({
        hideBirthDate: false,
        hideLocation: false,
        hideLivingStatus: false,
        protectAsMinor: false
    });
    const [notification, setNotification] = React.useState({ message: '', type: 'success' });
    const [relData, setRelData] = React.useState({
        fatherId: null,
        motherId: null,
        spouseId: null
    });

    const fileInputRef = React.useRef(null);
    const [preview, setPreview] = React.useState(null);
    const [assignableRoleKeys, setAssignableRoleKeys] = React.useState(['member', 'editor', 'branch-admin', 'family-admin']);
    const [canManageRoles, setCanManageRoles] = React.useState(true);

    const [formData, setFormData] = React.useState({
        first_name: '',
        last_name: '',
        gender: 'Male',
        role: 'member',
        status: 'active',
        isLiving: true,
        birth_date: '',
        place_of_birth: '',
        bio: '',
        avatar_url: '',
        email: '',
        branch_id: '',
        relatives: null,
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

    const togglePrivacy = (key) => {
        setPrivacy(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const fetchData = async () => {
        try {
            const baseUrl = import.meta.env.VITE_API_BASE_URL || `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}`;
            const token = localStorage.getItem('token');

            if (!token) {
                navigate('/');
                return;
            }

            const activeFamilyId = localStorage.getItem('selected_family_id') || JSON.parse(localStorage.getItem('user'))?.family_id;

            const mRes = await fetch(`${baseUrl}/families/${activeFamilyId}/members/single/${id}?t=${Date.now()}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache'
                }
            });

            const mData = await mRes.json();

            if (mRes.ok) {
                const [fname, ...lname] = (mData.full_name || '').split(' ');
                setFormData({
                    ...mData,
                    first_name: fname || '',
                    last_name: lname.join(' ') || '',
                    gender: mData.gender ? (mData.gender.toLowerCase().charAt(0).toUpperCase() + mData.gender.toLowerCase().slice(1)) : 'Male',
                    role: (mData.role || mData.pending_role || 'member').toLowerCase(),
                    isLiving: mData.is_alive,
                    birth_date: mData.birth_date ? mData.birth_date.split('T')[0] : '',
                    bio: mData.bio || '',
                    email: mData.email || '',
                    branch_id: (typeof mData.branch_id === 'object' ? mData.branch_id?.id : mData.branch_id) || '',
                    relatives: mData.relationships,
                    avatar: null
                });

                if (mData.privacy_mode) setVisibility(mData.privacy_mode === 'family' ? 'Family Only' : mData.privacy_mode.charAt(0).toUpperCase() + mData.privacy_mode.slice(1));
                setPrivacy({
                    hideBirthDate: mData.hide_birth_date || false,
                    hideLocation: mData.hide_location || false,
                    hideLivingStatus: mData.hide_living_status || false,
                    protectAsMinor: mData.protect_as_minor || false
                });

                const activeFamilyId = mData.family_space_id || localStorage.getItem('selected_family_id') || JSON.parse(localStorage.getItem('user'))?.family_id;

                if (activeFamilyId) {
                    const bRes = await fetch(`${baseUrl}/branches/${activeFamilyId}`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    const bData = await bRes.json();
                    if (bRes.ok) setBranches(Array.isArray(bData) ? bData : []);

                    // Fetch all members for relationship selection
                    const famRes = await fetch(`${baseUrl}/families/${activeFamilyId}/members`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    const famData = await famRes.json();
                    if (famRes.ok) {
                        setAllMembers(Array.isArray(famData) ? famData.filter(m => m.id !== id) : []);
                    }
                }

                // Pre-fill relation IDs
                let parents = mData.relationships?.parents || [];
                let fatherId = null;
                let motherId = null;

                const males = parents.filter(p => p.gender?.toLowerCase() === 'male');
                const females = parents.filter(p => p.gender?.toLowerCase() === 'female');
                const others = parents.filter(p => !p.gender || ['female', 'male'].indexOf(p.gender.toLowerCase()) === -1);

                if (males.length) fatherId = males.shift().id;
                if (females.length) motherId = females.shift().id;

                if (!fatherId && others.length) fatherId = others.shift().id;
                if (!motherId && others.length) motherId = others.shift().id;

                setRelData({
                    fatherId: fatherId || null,
                    motherId: motherId || null,
                    spouseId: mData.relationships?.spouse?.id || null
                });
            }
        } catch (err) {
            console.error('Fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        if (id) fetchData();
        (async () => {
            try {
                const user = JSON.parse(localStorage.getItem('user') || '{}');
                const familyId = localStorage.getItem('selected_family_id') || user?.family_id;
                const token = localStorage.getItem('token');
                if (!familyId || !token) return;
                const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
                const res = await fetch(`${baseUrl}/families/${familyId}/role-policy`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (!res.ok) return;
                const data = await res.json();
                setCanManageRoles(Boolean(data.can_manage_roles));
                const keys = (data.assignable_roles || []).map((r) => r.key);
                // Owner edit UI also shows current role options they can assign
                if (keys.length) setAssignableRoleKeys(keys);
                else if (!data.can_manage_roles) setAssignableRoleKeys([]);
            } catch (err) {
                console.error('role-policy fetch failed', err);
            }
        })();
    }, [id]);

    const handleUpdate = async (e) => {
        if (e) e.preventDefault();
        if (formData.email && formData.email.trim() !== '') {
            const emailClean = formData.email.trim();
            const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            const invalidEndings = ['.cor', '.con', '.cm', '.cmo', '.gmai.com'];
            if (!emailRegex.test(emailClean) || invalidEndings.some(ending => emailClean.toLowerCase().endsWith(ending))) {
                setNotification({ message: 'Invalid email format detected (e.g., ending in .cor). Please enter a valid email address.', type: 'error' });
                return;
            }
        }

        const currentNormRole = (formData.role || 'member').toLowerCase().trim();
        const isBranchAdminRole = currentNormRole === 'branch-admin' || currentNormRole === 'branch admin' || currentNormRole === 'branch_admin' || currentNormRole === 'manager';
        if (isBranchAdminRole && (!formData.branch_id || formData.branch_id.trim() === '')) {
            setNotification({ message: 'Branch Assignment is mandatory when assigning the Branch Admin role. Please select a branch.', type: 'error' });
            return;
        }

        setUpdating(true);
        try {
            const baseUrl = import.meta.env.VITE_API_BASE_URL || `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}`;
            const body = new FormData();
            body.append('first_name', formData.first_name);
            body.append('last_name', formData.last_name);
            body.append('gender', formData.gender);
            body.append('role', formData.role);
            body.append('status', formData.status);
            body.append('is_alive', formData.isLiving);
            body.append('date_of_birth', formData.birth_date);
            body.append('place_of_birth', formData.place_of_birth);
            body.append('bio_notes', formData.bio);
            body.append('email', formData.email);
            body.append('branch_id', formData.branch_id || '');
            body.append('visibility', visibility);
            body.append('hideBirthDate', privacy.hideBirthDate);
            body.append('hideLocation', privacy.hideLocation);
            body.append('hideLivingStatus', privacy.hideLivingStatus);
            body.append('protect_as_minor', privacy.protectAsMinor);

            const activeFamilyId = formData.family_space_id || localStorage.getItem('selected_family_id') || JSON.parse(localStorage.getItem('user'))?.family_id;
            body.append('family_id', activeFamilyId);
            
            if (formData.avatar) {
                body.append('avatar', formData.avatar);
            }

            const response = await fetch(`${baseUrl}/families/${activeFamilyId}/members/${id}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                    // 'Content-Type': 'multipart/form-data' handled by fetch
                },
                body
            });

            const resData = await response.json();
            if (!response.ok) {
                throw new Error(resData.error || 'Failed to update profile');
            }

            // 2. Update Relationships
            const relRes = await fetch(`${baseUrl}/families/members/relationships`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    targetId: id,
                    fatherId: relData.fatherId,
                    motherId: relData.motherId,
                    spouseId: relData.spouseId
                })
            });

            if (!relRes.ok) {
                const errData = await relRes.json();
                throw new Error(errData.error || 'Failed to update relationships');
            }

            if (resData.inviteWarning) {
                setNotification({ message: `Profile updated, BUT invite email failed: ${resData.inviteWarning}`, type: 'error' });
                return;
            }

            setNotification({ message: 'Profile and relationships updated successfully!', type: 'success' });
            setTimeout(() => navigate('/owner/members'), 2000);
        } catch (err) {
            console.error(err);
            setNotification({ message: err.message, type: 'error' });
        } finally {
            setUpdating(false);
        }
    };

    if (loading) return (
        <div className="flex-1 flex items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-orange"></div>
        </div>
    );

    const isOwner = formData.role === 'owner';

    return (
        <div className="pb-20">
            <Notification
                message={notification.message}
                type={notification.type}
                onClose={() => setNotification({ message: '', type: 'success' })}
            />

            <div className="flex-1 max-w-5xl mx-auto px-6 pt-8">
                <header className="mb-10 flex items-center justify-between">
                    <div>
                        <h2 className="text-brand-orange text-[10px] font-black uppercase tracking-widest mb-1">Owner Admin</h2>
                        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-brand-darkText leading-tight">Edit Member Profile</h1>
                    </div>
                    <button onClick={() => navigate('/owner/members')} className="p-4 bg-gray-50 dark:bg-brand-darkBg/50 rounded-2xl text-gray-400 hover:text-brand-orange transition-colors">
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
                            className="w-32 h-32 rounded-[2.5rem] bg-orange-50 dark:bg-brand-orange/10 border-4 border-white dark:border-brand-darkBorder shadow-xl flex items-center justify-center relative overflow-hidden group cursor-pointer transition-all hover:scale-105"
                        >
                            <img src={preview || formData.avatar_url || "https://api.dicebear.com/7.x/avataaars/svg?seed=Arthur"} alt="Avatar" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Plus className="text-white" size={24} />
                            </div>
                        </div>
                        <p className="mt-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Profile Identity</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                        <PremiumInput
                            label="First Name"
                            icon={User}
                            value={formData.first_name}
                            onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                        />
                        <PremiumInput
                            label="Last Name"
                            icon={User}
                            value={formData.last_name}
                            onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-4 ml-1">Gender Identity</label>
                        <div className="flex space-x-4">
                            {['Female', 'Male', 'Other'].map((g) => (
                                <SelectionButton
                                    key={g}
                                    label={g}
                                    active={g === formData.gender}
                                    onClick={() => setFormData({ ...formData, gender: g })}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center justify-between p-6 bg-orange-50/30 dark:bg-brand-orange/5 rounded-[2rem] border border-orange-100/50 dark:border-brand-darkBorder transition-colors">
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-white dark:bg-brand-darkCard rounded-2xl flex items-center justify-center shadow-sm">
                                <Eye className="text-brand-orange" size={20} />
                            </div>
                            <div>
                                <p className="text-sm font-black text-gray-900 dark:text-brand-darkText uppercase tracking-tight">Living Status {formData.isLiving ? '(Living)' : '(Deceased)'}</p>
                                <p className="text-[10px] font-bold text-gray-400 uppercase">Is the person still alive?</p>
                            </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={formData.isLiving}
                                onChange={() => setFormData({ ...formData, isLiving: !formData.isLiving })}
                            />
                            <div className="w-14 h-7 bg-gray-200 dark:bg-brand-darkBg peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-orange"></div>
                        </label>
                    </div>

                    <PremiumInput
                        label="Date of Birth"
                        icon={Calendar}
                        type="date"
                        value={formData.birth_date}
                        onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                    />
                </FormSection>

                <FormSection title="Relationship Setup">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] ml-1">Father</label>
                            <div className="relative">
                                {relData.fatherId ? (
                                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-brand-darkBg/50 border border-gray-100 dark:border-brand-darkBorder rounded-2xl group transition-all">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 rounded-xl overflow-hidden shadow-sm">
                                                <img src={allMembers.find(m => m.id === relData.fatherId)?.avatar_url || "https://i.pravatar.cc/150?u=father"} alt="Father" className="w-full h-full object-cover" />
                                            </div>
                                            <span className="text-sm font-bold text-gray-700 dark:text-brand-darkText">{allMembers.find(m => m.id === relData.fatherId)?.name}</span>
                                        </div>
                                        <button onClick={() => setRelData({ ...relData, fatherId: null })} className="p-2 hover:bg-gray-100 dark:hover:bg-brand-darkBorder rounded-lg text-gray-400 hover:text-red-500 transition-all">
                                            <X size={14} />
                                        </button>
                                    </div>
                                ) : (
                                    <select
                                        className="w-full bg-gray-50 dark:bg-brand-darkBg/50 border border-dashed border-gray-200 dark:border-brand-darkBorder rounded-2xl p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest outline-none focus:ring-2 focus:ring-brand-orange/20 cursor-pointer appearance-none text-center"
                                        value={relData.fatherId || ""}
                                        onChange={(e) => setRelData({ ...relData, fatherId: e.target.value || null })}
                                    >
                                        <option value="">+ LINK FATHER</option>
                                        {allMembers.filter(m => {
                                            const g = m.gender?.toLowerCase();
                                            return (g === 'male' || g === 'other' || !g) && m.id !== relData.motherId;
                                        }).map(m => (
                                            <option key={m.id} value={m.id}>{m.name}</option>
                                        ))}
                                    </select>
                                )}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] ml-1">Mother</label>
                            <div className="relative">
                                {relData.motherId ? (
                                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-brand-darkBg/50 border border-gray-100 dark:border-brand-darkBorder rounded-2xl group transition-all">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 rounded-xl overflow-hidden shadow-sm">
                                                <img src={allMembers.find(m => m.id === relData.motherId)?.avatar_url || "https://i.pravatar.cc/150?u=mother"} alt="Mother" className="w-full h-full object-cover" />
                                            </div>
                                            <span className="text-sm font-bold text-gray-700 dark:text-brand-darkText">{allMembers.find(m => m.id === relData.motherId)?.name}</span>
                                        </div>
                                        <button onClick={() => setRelData({ ...relData, motherId: null })} className="p-2 hover:bg-gray-100 dark:hover:bg-brand-darkBorder rounded-lg text-gray-400 hover:text-red-500 transition-all">
                                            <X size={14} />
                                        </button>
                                    </div>
                                ) : (
                                    <select
                                        className="w-full bg-gray-50 dark:bg-brand-darkBg/50 border border-dashed border-gray-200 dark:border-brand-darkBorder rounded-2xl p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest outline-none focus:ring-2 focus:ring-brand-orange/20 cursor-pointer appearance-none text-center"
                                        value={relData.motherId || ""}
                                        onChange={(e) => setRelData({ ...relData, motherId: e.target.value || null })}
                                    >
                                        <option value="">+ LINK MOTHER</option>
                                        {allMembers.filter(m => {
                                            const g = m.gender?.toLowerCase();
                                            return (g === 'female' || g === 'other' || !g) && m.id !== relData.fatherId;
                                        }).map(m => (
                                            <option key={m.id} value={m.id}>{m.name}</option>
                                        ))}
                                    </select>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4 pt-4">
                        <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] ml-1">Current Spouse</label>
                        {relData.spouseId ? (
                            <div className="p-6 bg-brand-active/30 dark:bg-brand-orange/5 border border-brand-orange/10 rounded-[2rem] flex items-center justify-between group">
                                <div className="flex items-center space-x-4">
                                    <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-md">
                                        <img src={allMembers.find(m => m.id === relData.spouseId)?.avatar_url || "https://i.pravatar.cc/150?u=spouse"} alt="Spouse" className="w-full h-full object-cover" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-gray-900 dark:text-brand-darkText uppercase tracking-tight">{allMembers.find(m => m.id === relData.spouseId)?.name}</p>
                                        <p className="text-[10px] font-bold text-gray-500 uppercase">Spouse (Linked)</p>
                                    </div>
                                </div>
                                <button onClick={() => setRelData({ ...relData, spouseId: null })} className="text-gray-400 hover:text-red-500 p-3 rounded-2xl transition-all">
                                    <X size={20} />
                                </button>
                            </div>
                        ) : (
                            <div className="relative">
                                <select
                                    className="w-full bg-gray-50 dark:bg-brand-darkBg/50 border border-dashed border-gray-200 dark:border-brand-darkBorder rounded-[2rem] p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest outline-none focus:ring-2 focus:ring-brand-orange/20 cursor-pointer appearance-none text-center"
                                    value={relData.spouseId || ""}
                                    onChange={(e) => setRelData({ ...relData, spouseId: e.target.value || null })}
                                >
                                    <option value="">+ LINK SPOUSE</option>
                                    {allMembers.map(m => (
                                        <option key={m.id} value={m.id}>{m.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>

                    <div className="space-y-4 pt-4">
                        <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] ml-1">Children ({formData.relatives?.children?.length || 0})</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {formData.relatives?.children?.map((child) => (
                                <div key={child.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-brand-darkBg/50 border border-gray-100 dark:border-brand-darkBorder rounded-2xl group hover:border-brand-orange/30 transition-all cursor-pointer" onClick={() => navigate(`/owner/members/edit/${child.id}`)}>
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 rounded-xl overflow-hidden">
                                            <img src={child.avatar_url || "https://i.pravatar.cc/150?u=child"} alt="Child" className="w-full h-full object-cover" />
                                        </div>
                                        <span className="text-sm font-bold text-gray-700 dark:text-brand-darkText">{child.name}</span>
                                    </div>
                                    <ArrowRight size={16} className="text-gray-300 group-hover:text-brand-orange" />
                                </div>
                            ))}
                            <div className="flex items-center justify-between p-4 bg-gray-100 dark:bg-brand-darkBg/80 border border-dashed border-gray-200 dark:border-brand-darkBorder rounded-2xl cursor-pointer hover:border-brand-orange transition-all" onClick={() => navigate('/owner/add-member', { state: { returnTo: `/owner/members/edit/${id}`, parentId: id, relType: 'child' } })}>
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                    <Plus size={14} /> Add Child
                                </span>
                            </div>
                        </div>
                    </div>
                </FormSection>

                <FormSection title="Additional Details">
                    <PremiumInput
                        label="Place of Birth"
                        icon={MapPin}
                        value={formData.place_of_birth}
                        onChange={(e) => setFormData({ ...formData, place_of_birth: e.target.value })}
                    />
                    <PremiumInput
                        label="Biography / Personal Notes"
                        icon={FileText}
                        type="textarea"
                        value={formData.bio}
                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    />
                </FormSection>

                <FormSection title="Governance & Access">
                    <div className="space-y-8">
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-4 ml-1">System Role</label>
                            {!canManageRoles && (
                                <p className="text-xs text-amber-600 font-bold mb-3">You cannot change roles with your current permissions.</p>
                            )}
                            <div className="flex flex-wrap gap-4">
                                {[
                                    { label: 'Member', value: 'member' },
                                    { label: 'Editor', value: 'editor' },
                                    { label: 'Branch Admin', value: 'branch-admin' },
                                    { label: 'Co-Admin', value: 'co-admin' },
                                    { label: 'Family Admin', value: 'family-admin' }
                                ].filter((r) => assignableRoleKeys.includes(r.value) || (formData.role || '').toLowerCase().includes(r.value.split('-')[0])).map((r) => {
                                    const currentRole = (formData.role || 'member').toLowerCase().trim();
                                    const isActive = r.value === 'member' ? (currentRole === 'member' || currentRole === '') :
                                                     r.value === 'editor' ? (currentRole === 'editor' || currentRole === 'council' || currentRole === 'council-admin') :
                                                     r.value === 'branch-admin' ? (currentRole === 'branch-admin' || currentRole === 'branch admin' || currentRole === 'manager') :
                                                     r.value === 'co-admin' ? currentRole === 'co-admin' :
                                                     (currentRole === 'family-admin' || currentRole === 'family admin' || currentRole === 'admin');
                                    const disabled = !canManageRoles || !assignableRoleKeys.includes(r.value);
                                    return (
                                        <SelectionButton
                                            key={r.value}
                                            label={r.label}
                                            active={isActive}
                                            onClick={() => {
                                                if (disabled) return;
                                                setFormData({ ...formData, role: r.value });
                                            }}
                                        />
                                    );
                                })}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-4 ml-1">
                                    Branch Assignment
                                    {((formData.role || '').toLowerCase().includes('branch') || (formData.role || '') === 'manager') && (
                                        <span className="text-red-500 ml-1">(Mandatory for Branch Admin)</span>
                                    )}
                                </label>
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white dark:bg-brand-darkCard rounded-2xl shadow-sm flex items-center justify-center z-10">
                                        <GitBranch size={22} className="text-brand-orange" />
                                    </div>
                                    <select
                                        value={formData.branch_id || ""}
                                        onChange={(e) => setFormData({ ...formData, branch_id: e.target.value })}
                                        className={`w-full bg-gray-50 dark:bg-brand-darkBg/50 border rounded-[1.5rem] py-5 pl-[4.5rem] pr-8 text-sm font-bold text-gray-700 dark:text-brand-darkText outline-none focus:ring-4 focus:ring-brand-orange/5 transition-all appearance-none cursor-pointer disabled:opacity-50 ${
                                            ((formData.role || '').toLowerCase().includes('branch') || (formData.role || '') === 'manager') && !formData.branch_id
                                                ? 'border-red-400 dark:border-red-500'
                                                : 'border-transparent'
                                        }`}
                                    >
                                        <option value="">Select Branch Assignment...</option>
                                        {branches.map(b => (
                                            <option key={b.id} value={b.id}>{b.name}</option>
                                        ))}
                                    </select>
                                </div>
                                {((formData.role || '').toLowerCase().includes('branch') || (formData.role || '') === 'manager') && !formData.branch_id && (
                                    <p className="text-xs font-bold text-red-500 mt-2 ml-1">
                                        ⚠️ Please select a branch assignment for Branch Admin.
                                    </p>
                                )}
                            </div>
                            <div>
                                <PremiumInput
                                    label="Member Email"
                                    icon={Mail}
                                    placeholder="email@example.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                                {formData.email && formData.email.trim() !== '' && (
                                    (() => {
                                        const emailClean = formData.email.trim();
                                        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
                                        const invalidEndings = ['.cor', '.con', '.cm', '.cmo', '.gmai.com'];
                                        const isInvalid = !emailRegex.test(emailClean) || invalidEndings.some(ending => emailClean.toLowerCase().endsWith(ending));
                                        return isInvalid ? (
                                            <p className="text-xs font-bold text-red-500 mt-2 ml-1">
                                                ⚠️ Invalid email address detected (check domain ending like .com)
                                            </p>
                                        ) : null;
                                    })()
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-4">
                            <div className="space-y-4">
                                <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] ml-1">Account Status</label>
                                <div className="flex items-center space-x-3">
                                    {['Active', 'Suspended', 'Pending'].map(s => (
                                        <StatusBadge
                                            key={s}
                                            label={s}
                                            active={s.toLowerCase() === (formData.status || '').toLowerCase()}
                                            onClick={() => setFormData({ ...formData, status: s.toLowerCase() })}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </FormSection>

                <FormSection title="Privacy Overrides">
                    <div className="space-y-6">
                        <div className="flex items-center justify-between p-6 bg-gray-50 dark:bg-brand-darkBg/50 rounded-[2rem] transition-colors">
                            <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 bg-white dark:bg-brand-darkCard rounded-2xl flex items-center justify-center shadow-sm">
                                    <Shield className="text-brand-orange" size={20} />
                                </div>
                                <div>
                                    <p className="text-sm font-black text-gray-900 dark:text-brand-darkText uppercase tracking-tight">Profile Visibility</p>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase">Who can see this profile</p>
                                </div>
                            </div>
                            <div className="flex space-x-2">
                                {['Public', 'Family Only', 'Private'].map(scope => (
                                    <button
                                        key={scope}
                                        onClick={() => setVisibility(scope)}
                                        className={`px-4 py-2 rounded-xl text-[9px] font-black transition-all uppercase tracking-widest ${scope === visibility ? 'bg-brand-orange text-white' : 'bg-white dark:bg-brand-darkCard text-gray-400'}`}
                                    >
                                        {scope}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {[
                                { label: 'Hide Birth Date', key: 'hideBirthDate' },
                                { label: 'Hide Location', key: 'hideLocation' },
                                { label: 'Hide Living Status', key: 'hideLivingStatus' },
                                { label: 'Protect as Minor', key: 'protectAsMinor' }
                            ].map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between p-5 bg-gray-50/50 dark:bg-brand-darkBg/30 rounded-2xl border border-gray-100 dark:border-brand-darkBorder">
                                    <span className="text-[11px] font-black text-gray-700 dark:text-brand-darkText uppercase tracking-tight">{item.label}</span>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={privacy[item.key]}
                                            onChange={() => togglePrivacy(item.key)}
                                        />
                                        <div className="w-10 h-5 bg-gray-200 dark:bg-brand-darkBg peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-orange"></div>
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>
                </FormSection>

                <div className="flex flex-col sm:flex-row gap-4 mt-12 mb-20 justify-end">
                    <button
                        onClick={() => navigate('/owner/members')}
                        disabled={updating}
                        className="w-full sm:w-auto px-10 py-4 rounded-2xl font-bold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-brand-darkBg hover:bg-gray-200 dark:hover:bg-brand-darkBorder transition-all uppercase text-sm tracking-widest disabled:opacity-50"
                    >
                        Discard Changes
                    </button>
                    <button
                        onClick={handleUpdate}
                        disabled={updating}
                        className="w-full sm:w-auto px-12 py-4 rounded-2xl font-bold text-white bg-brand-orange shadow-lg shadow-brand-orange/25 hover:bg-orange-600 active:scale-95 transition-all uppercase text-sm tracking-widest flex items-center justify-center disabled:opacity-50"
                    >
                        {updating ? 'Updating...' : 'Update Profile'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditMember;
