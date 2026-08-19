import React, { useEffect, useRef, useState } from 'react';
import { Heart, User, X, ChevronLeft, Camera, Plus, Baby } from 'lucide-react';

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
const token = () => new URLSearchParams(window.location.search).get('token') || localStorage.getItem('token');

const ADD_CONFIG = {
    spouse: {
        title: 'Add Spouse',
        endpoint: '/clantree/add-member',
        relationship_type: 'spouse',
        defaultGender: 'Female',
    },
    parent: {
        title: 'Add Parent',
        endpoint: '/clantree/add-parent',
        defaultGender: 'Male',
    },
    member: {
        title: 'Add Member',
        endpoint: '/clantree/add-member',
        relationship_type: 'member',
        defaultGender: 'Other',
    },
    child: {
        title: 'Add Child',
        endpoint: '/clantree/add-child',
        defaultGender: 'Male',
    },
};

const GENDER_OPTIONS = {
    parent: [
        { value: 'Male', label: 'Father' },
        { value: 'Female', label: 'Mother' },
    ],
    default: [
        { value: 'Male', label: 'Male' },
        { value: 'Female', label: 'Female' },
        { value: 'Other', label: 'Other' },
    ],
};

const VISIBILITY_OPTIONS = [
    { value: 'public', label: 'Public' },
    { value: 'private', label: 'Private' },
];

const emptyForm = (addType) => ({
    first_name: '',
    last_name: '',
    email: '',
    gender: ADD_CONFIG[addType]?.defaultGender || 'Other',
    is_alive: true,
    date_of_birth: '',
    place_of_birth: '',
    anniversary_date: '',
    current_location: '',
    occupation: '',
    bio_notes: '',
    school_college: '',
    qualification: '',
    study_location: '',
    profile_visibility: 'public',
    hide_sensitive_details: false,
});

const getPersonName = (p) =>
    p?.full_name || `${p?.first_name || ''} ${p?.last_name || ''}`.trim() || 'Member';

const validateEmail = (email) => {
    const clean = email?.trim();
    if (!clean) return 'Email is required.';
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!regex.test(clean)) return 'Please enter a valid email address.';
    return null;
};

const uploadPersonPhoto = async (file, familySpaceId) => {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('family_space_id', familySpaceId);
    fd.append('visibility', 'family');

    const res = await fetch(`${API}/media/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token()}` },
        body: fd,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Photo upload failed');
    return data.media?.url || data.url || '';
};

const Field = ({ label, name, type = 'text', value, onChange, placeholder, required }) => (
    <div className="space-y-1.5">
        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{label}</label>
        <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            className="w-full bg-gray-50 dark:bg-brand-darkBg/50 border border-gray-100 dark:border-brand-darkBorder rounded-2xl py-3.5 px-4 text-sm font-semibold text-gray-800 dark:text-brand-darkText outline-none focus:ring-4 focus:ring-brand-orange/10"
        />
    </div>
);

const SelectField = ({ label, name, value, onChange, options }) => (
    <div className="space-y-1.5">
        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{label}</label>
        <select
            name={name}
            value={value}
            onChange={onChange}
            className="w-full bg-gray-50 dark:bg-brand-darkBg/50 border border-gray-100 dark:border-brand-darkBorder rounded-2xl py-3.5 px-4 text-sm font-semibold text-gray-800 dark:text-brand-darkText outline-none focus:ring-4 focus:ring-brand-orange/10"
        >
            {options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                    {opt.label}
                </option>
            ))}
        </select>
    </div>
);

const ToggleField = ({ label, description, name, checked, onChange }) => (
    <label className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-brand-darkBg/50 border border-gray-100 dark:border-brand-darkBorder cursor-pointer">
        <div>
            <p className="text-sm font-bold text-gray-800 dark:text-brand-darkText">{label}</p>
            {description && <p className="text-[10px] text-gray-400 mt-0.5">{description}</p>}
        </div>
        <input
            type="checkbox"
            name={name}
            checked={checked}
            onChange={onChange}
            className="w-5 h-5 rounded accent-brand-orange shrink-0"
        />
    </label>
);

const GenderPicker = ({ addType, value, onChange }) => {
    const options = addType === 'parent' ? GENDER_OPTIONS.parent : GENDER_OPTIONS.default;
    return (
        <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Gender</label>
            <div className="flex flex-wrap gap-2">
                {options.map((opt) => (
                    <button
                        key={opt.value}
                        type="button"
                        onClick={() => onChange(opt.value)}
                        className={`px-4 py-2 rounded-xl text-xs font-black ${value === opt.value ? 'bg-brand-orange text-white' : 'bg-gray-100 dark:bg-brand-darkBg text-gray-500'}`}
                    >
                        {opt.label}
                    </button>
                ))}
            </div>
        </div>
    );
};

const PhotoPicker = ({ preview, fileName, inputRef, onPick, onClear }) => (
    <div className="space-y-2">
        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Photo</label>
        <div className="flex items-center gap-4">
            <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="w-20 h-20 rounded-2xl bg-orange-50 dark:bg-brand-orange/10 border-2 border-dashed border-orange-200 dark:border-brand-orange/30 flex items-center justify-center overflow-hidden shrink-0 relative group"
            >
                {preview ? (
                    <>
                        <img src={preview} alt="Selected" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity flex items-center justify-center">
                            <Plus className="text-white" size={20} />
                        </div>
                    </>
                ) : (
                    <Camera className="text-brand-orange" size={24} />
                )}
            </button>
            <div className="flex-1 min-w-0">
                <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    className="text-sm font-bold text-brand-orange"
                >
                    {preview ? 'Change photo' : 'Choose from device'}
                </button>
                <p className="text-[10px] text-gray-400 mt-1 truncate">
                    {fileName || 'JPG, PNG, WEBP or GIF'}
                </p>
                {preview && (
                    <button type="button" onClick={onClear} className="text-[10px] font-bold text-gray-400 mt-1 underline">
                        Remove photo
                    </button>
                )}
            </div>
        </div>
        <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={onPick}
        />
    </div>
);

const appendIfPresent = (body, key, value) => {
    if (value === '' || value === null || value === undefined) return;
    body[key] = value;
};

const buildSubmitBody = (addType, form, familySpaceId, personId, avatarUrl) => {
    const body = {
        family_space_id: familySpaceId,
        target_person_id: personId,
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        email: form.email.trim(),
        gender: form.gender,
        is_alive: form.is_alive,
    };

    appendIfPresent(body, 'avatar_url', avatarUrl);

    if (addType === 'parent') {
        appendIfPresent(body, 'date_of_birth', form.date_of_birth);
        appendIfPresent(body, 'place_of_birth', form.place_of_birth);
        appendIfPresent(body, 'anniversary_date', form.anniversary_date);
        appendIfPresent(body, 'current_location', form.current_location);
        return body;
    }

    if (addType === 'child') {
        appendIfPresent(body, 'date_of_birth', form.date_of_birth);
        appendIfPresent(body, 'place_of_birth', form.place_of_birth);
        appendIfPresent(body, 'anniversary_date', form.anniversary_date);
        appendIfPresent(body, 'current_location', form.current_location);
        appendIfPresent(body, 'school_college', form.school_college?.trim());
        appendIfPresent(body, 'qualification', form.qualification?.trim());
        appendIfPresent(body, 'study_location', form.study_location?.trim());
        return body;
    }

    body.relationship_type = ADD_CONFIG[addType].relationship_type;
    appendIfPresent(body, 'date_of_birth', form.date_of_birth);
    appendIfPresent(body, 'anniversary_date', form.anniversary_date);
    appendIfPresent(body, 'place_of_birth', form.place_of_birth);
    appendIfPresent(body, 'occupation', form.occupation?.trim());
    appendIfPresent(body, 'bio_notes', form.bio_notes?.trim());
    body.profile_visibility = form.profile_visibility;
    body.hide_sensitive_details = form.hide_sensitive_details;

    return body;
};

const TreeNodeAddModal = ({
    open,
    person,
    step,
    addType,
    familySpaceId,
    onClose,
    onSelectType,
    onBack,
    onSuccess,
}) => {
    const [form, setForm] = useState(emptyForm('member'));
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState('');
    const [avatarFileName, setAvatarFileName] = useState('');
    const [loading, setLoading] = useState(false);
    const [loadingLabel, setLoadingLabel] = useState('Save');
    const [error, setError] = useState('');
    const fileInputRef = useRef(null);

    const resetPhoto = () => {
        if (avatarPreview) URL.revokeObjectURL(avatarPreview);
        setAvatarFile(null);
        setAvatarPreview('');
        setAvatarFileName('');
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    useEffect(() => {
        if (open && addType && step === 'form') {
            setForm(emptyForm(addType));
            resetPhoto();
            setError('');
        }
    }, [open, addType, step]);

    useEffect(() => () => {
        if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    }, [avatarPreview]);

    if (!open || !person) return null;

    const personName = getPersonName(person);
    const config = addType ? ADD_CONFIG[addType] : null;

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handlePhotoPick = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            setError('Please select an image file.');
            return;
        }
        if (avatarPreview) URL.revokeObjectURL(avatarPreview);
        setAvatarFile(file);
        setAvatarPreview(URL.createObjectURL(file));
        setAvatarFileName(file.name);
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!familySpaceId || !person?.id) {
            setError('Family space or target person is missing.');
            return;
        }
        if (!form.first_name?.trim() || !form.last_name?.trim()) {
            setError('First name and last name are required.');
            return;
        }

        const emailError = validateEmail(form.email);
        if (emailError) {
            setError(emailError);
            return;
        }

        setLoading(true);
        setLoadingLabel('Save');
        setError('');
        try {
            let avatarUrl = '';
            if (avatarFile) {
                setLoadingLabel('Uploading photo…');
                avatarUrl = await uploadPersonPhoto(avatarFile, familySpaceId);
            }

            setLoadingLabel('Saving…');
            const body = buildSubmitBody(addType, form, familySpaceId, person.id, avatarUrl);

            const res = await fetch(`${API}${config.endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token()}`,
                },
                body: JSON.stringify(body),
            });

            const data = await res.json().catch(() => ({}));
            if (res.status === 202) {
                onSuccess?.(data.message || 'Request sent for approval.');
                return;
            }
            if (!res.ok) {
                throw new Error(data.error || data.message || 'Failed to save');
            }
            onSuccess?.('Member added successfully.');
        } catch (err) {
            setError(err.message || 'Failed to save');
        } finally {
            setLoading(false);
            setLoadingLabel('Save');
        }
    };

    const privacyFields = addType === 'spouse' || addType === 'member';

    return (
        <div className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div
                className="bg-white dark:bg-brand-darkCard rounded-[2rem] border border-gray-100 dark:border-brand-darkBorder w-full max-w-md max-h-[90vh] overflow-hidden shadow-2xl flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-brand-darkBorder">
                    <div>
                        {step === 'form' && (
                            <button
                                type="button"
                                onClick={onBack}
                                className="flex items-center text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1"
                            >
                                <ChevronLeft size={14} className="mr-1" />
                                Back
                            </button>
                        )}
                        <h3 className="text-lg font-extrabold text-gray-900 dark:text-brand-darkText">
                            {step === 'menu' ? 'Add to tree' : config?.title}
                        </h3>
                        <p className="text-xs text-gray-400 mt-0.5">For {personName}</p>
                    </div>
                    <button type="button" onClick={onClose} className="p-2 rounded-xl text-gray-400 hover:text-brand-orange">
                        <X size={22} />
                    </button>
                </div>

                <div className="overflow-y-auto flex-1 px-6 py-5">
                    {step === 'menu' && (
                        <div className="grid grid-cols-1 gap-3">
                            <button
                                type="button"
                                onClick={() => onSelectType('spouse')}
                                className="flex items-center gap-4 p-4 rounded-2xl bg-pink-50 dark:bg-pink-500/10 border border-pink-100 dark:border-pink-500/20 text-left hover:scale-[1.01] transition-transform"
                            >
                                <div className="w-10 h-10 rounded-xl bg-pink-500 text-white flex items-center justify-center">
                                    <Heart size={18} />
                                </div>
                                <div>
                                    <p className="text-sm font-black text-gray-900 dark:text-brand-darkText">Add Spouse</p>
                                    <p className="text-[10px] text-gray-400">Link as life partner</p>
                                </div>
                            </button>
                            <button
                                type="button"
                                onClick={() => onSelectType('parent')}
                                className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-brand-darkBg border border-gray-100 dark:border-brand-darkBorder text-left hover:scale-[1.01] transition-transform"
                            >
                                <div className="w-10 h-10 rounded-xl bg-gray-900 text-white flex items-center justify-center">
                                    <User size={18} />
                                </div>
                                <div>
                                    <p className="text-sm font-black text-gray-900 dark:text-brand-darkText">Add Parent</p>
                                    <p className="text-[10px] text-gray-400">Add mother or father</p>
                                </div>
                            </button>
                            <button
                                type="button"
                                onClick={() => onSelectType('child')}
                                className="flex items-center gap-4 p-4 rounded-2xl bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 text-left hover:scale-[1.01] transition-transform"
                            >
                                <div className="w-10 h-10 rounded-xl bg-blue-500 text-white flex items-center justify-center">
                                    <Baby size={18} />
                                </div>
                                <div>
                                    <p className="text-sm font-black text-gray-900 dark:text-brand-darkText">Add Child</p>
                                    <p className="text-[10px] text-gray-400">Add son or daughter</p>
                                </div>
                            </button>
                            <button
                                type="button"
                                onClick={() => onSelectType('member')}
                                className="flex items-center gap-4 p-4 rounded-2xl bg-orange-50 dark:bg-brand-orange/10 border border-orange-100 dark:border-brand-orange/20 text-left hover:scale-[1.01] transition-transform"
                            >
                                <div className="w-10 h-10 rounded-xl bg-brand-orange text-white flex items-center justify-center">
                                    <User size={18} />
                                </div>
                                <div>
                                    <p className="text-sm font-black text-gray-900 dark:text-brand-darkText">Add Member</p>
                                    <p className="text-[10px] text-gray-400">Add related family member</p>
                                </div>
                            </button>
                        </div>
                    )}

                    {step === 'form' && config && (
                        <form id="tree-add-form" onSubmit={handleSubmit} className="space-y-4">
                            <PhotoPicker
                                preview={avatarPreview}
                                fileName={avatarFileName}
                                inputRef={fileInputRef}
                                onPick={handlePhotoPick}
                                onClear={resetPhoto}
                            />

                            <div className="grid grid-cols-2 gap-3">
                                <Field label="First name *" name="first_name" value={form.first_name} onChange={handleChange} placeholder="First name" required />
                                <Field label="Last name *" name="last_name" value={form.last_name} onChange={handleChange} placeholder="Last name" required />
                            </div>
                            <Field
                                label="Email *"
                                name="email"
                                type="email"
                                value={form.email}
                                onChange={handleChange}
                                placeholder="email@example.com"
                                required
                            />

                            <GenderPicker
                                addType={addType}
                                value={form.gender}
                                onChange={(gender) => setForm((p) => ({ ...p, gender }))}
                            />

                            <ToggleField
                                label="Person is alive"
                                description="Uncheck if deceased"
                                name="is_alive"
                                checked={form.is_alive}
                                onChange={handleChange}
                            />

                            {addType === 'parent' && (
                                <>
                                    <div className="grid grid-cols-2 gap-3">
                                        <Field label="Date of birth" name="date_of_birth" type="date" value={form.date_of_birth} onChange={handleChange} />
                                        <Field label="Anniversary date" name="anniversary_date" type="date" value={form.anniversary_date} onChange={handleChange} />
                                    </div>
                                    <Field label="Place of birth" name="place_of_birth" value={form.place_of_birth} onChange={handleChange} placeholder="City, country" />
                                    <Field label="Current location" name="current_location" value={form.current_location} onChange={handleChange} placeholder="Current address" />
                                </>
                            )}

                            {addType === 'spouse' && (
                                <>
                                    <div className="grid grid-cols-2 gap-3">
                                        <Field label="Date of birth" name="date_of_birth" type="date" value={form.date_of_birth} onChange={handleChange} />
                                        <Field label="Marriage date" name="anniversary_date" type="date" value={form.anniversary_date} onChange={handleChange} />
                                    </div>
                                    <Field label="Place of marriage" name="place_of_birth" value={form.place_of_birth} onChange={handleChange} placeholder="City, country" />
                                    <Field label="Occupation" name="occupation" value={form.occupation} onChange={handleChange} placeholder="Occupation (optional)" />
                                    <Field label="Notes / bio" name="bio_notes" value={form.bio_notes} onChange={handleChange} placeholder="Optional notes" />
                                </>
                            )}

                            {addType === 'child' && (
                                <>
                                    <Field label="Date of birth" name="date_of_birth" type="date" value={form.date_of_birth} onChange={handleChange} />
                                    <div className="grid grid-cols-2 gap-3">
                                        <Field label="Place of birth" name="place_of_birth" value={form.place_of_birth} onChange={handleChange} placeholder="City, country" />
                                        <Field label="Anniversary date" name="anniversary_date" type="date" value={form.anniversary_date} onChange={handleChange} />
                                    </div>
                                    <Field label="Current location" name="current_location" value={form.current_location} onChange={handleChange} placeholder="Current address" />
                                    <Field label="School / college" name="school_college" value={form.school_college} onChange={handleChange} placeholder="School or college name" />
                                    <div className="grid grid-cols-2 gap-3">
                                        <Field label="Qualification" name="qualification" value={form.qualification} onChange={handleChange} placeholder="Highest qualification" />
                                        <Field label="Study location" name="study_location" value={form.study_location} onChange={handleChange} placeholder="Study location" />
                                    </div>
                                </>
                            )}

                            {addType === 'member' && (
                                <>
                                    <div className="grid grid-cols-2 gap-3">
                                        <Field label="Date of birth" name="date_of_birth" type="date" value={form.date_of_birth} onChange={handleChange} />
                                        <Field label="Anniversary date" name="anniversary_date" type="date" value={form.anniversary_date} onChange={handleChange} />
                                    </div>
                                    <Field label="Place of birth" name="place_of_birth" value={form.place_of_birth} onChange={handleChange} placeholder="City, country" />
                                    <Field label="Occupation" name="occupation" value={form.occupation} onChange={handleChange} placeholder="Occupation (optional)" />
                                    <Field label="Notes / bio" name="bio_notes" value={form.bio_notes} onChange={handleChange} placeholder="Optional notes" />
                                </>
                            )}

                            {privacyFields && (
                                <>
                                    <SelectField
                                        label="Profile visibility"
                                        name="profile_visibility"
                                        value={form.profile_visibility}
                                        onChange={handleChange}
                                        options={VISIBILITY_OPTIONS}
                                    />
                                    <ToggleField
                                        label="Hide sensitive details"
                                        description="Hide private information from other members"
                                        name="hide_sensitive_details"
                                        checked={form.hide_sensitive_details}
                                        onChange={handleChange}
                                    />
                                </>
                            )}

                            {error && (
                                <p className="text-sm font-semibold text-red-500 bg-red-50 dark:bg-red-500/10 rounded-xl px-4 py-3">{error}</p>
                            )}
                        </form>
                    )}
                </div>

                {step === 'form' && (
                    <div className="px-6 py-4 border-t border-gray-100 dark:border-brand-darkBorder flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3.5 rounded-2xl font-bold text-gray-500 bg-gray-100 dark:bg-brand-darkBg text-sm uppercase tracking-wider"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            form="tree-add-form"
                            disabled={loading}
                            className="flex-1 py-3.5 rounded-2xl font-bold text-white bg-brand-orange text-sm uppercase tracking-wider disabled:opacity-50"
                        >
                            {loading ? loadingLabel : 'Save'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TreeNodeAddModal;
