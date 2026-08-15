import React, { useEffect, useState } from 'react';
import { Heart, User, Mail, X, ChevronLeft } from 'lucide-react';

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
};

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
    bio_notes: '',
});

const getPersonName = (p) =>
    p?.full_name || `${p?.first_name || ''} ${p?.last_name || ''}`.trim() || 'Member';

const Field = ({ label, name, type = 'text', value, onChange, placeholder }) => (
    <div className="space-y-1.5">
        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{label}</label>
        <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="w-full bg-gray-50 dark:bg-brand-darkBg/50 border border-gray-100 dark:border-brand-darkBorder rounded-2xl py-3.5 px-4 text-sm font-semibold text-gray-800 dark:text-brand-darkText outline-none focus:ring-4 focus:ring-brand-orange/10"
        />
    </div>
);

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
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (open && addType && step === 'form') {
            setForm(emptyForm(addType));
            setError('');
        }
    }, [open, addType, step]);

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

        setLoading(true);
        setError('');
        try {
            const body = {
                ...form,
                family_space_id: familySpaceId,
                target_person_id: person.id,
            };
            if (config?.relationship_type) {
                body.relationship_type = config.relationship_type;
            }
            if (addType === 'member' && body.bio_notes) {
                body.occupation = body.bio_notes;
            }

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
        }
    };

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
                            <div className="grid grid-cols-2 gap-3">
                                <Field label="First name *" name="first_name" value={form.first_name} onChange={handleChange} placeholder="First name" />
                                <Field label="Last name *" name="last_name" value={form.last_name} onChange={handleChange} placeholder="Last name" />
                            </div>
                            <Field label="Email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="email@example.com" />

                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Gender</label>
                                <div className="flex flex-wrap gap-2">
                                    {['Male', 'Female', 'Other'].map((g) => (
                                        <button
                                            key={g}
                                            type="button"
                                            onClick={() => setForm((p) => ({ ...p, gender: g }))}
                                            className={`px-4 py-2 rounded-xl text-xs font-black ${form.gender === g ? 'bg-brand-orange text-white' : 'bg-gray-100 dark:bg-brand-darkBg text-gray-500'}`}
                                        >
                                            {g}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {addType === 'parent' && (
                                <>
                                    <Field label="Date of birth" name="date_of_birth" value={form.date_of_birth} onChange={handleChange} placeholder="YYYY-MM-DD" />
                                    <Field label="Place of birth" name="place_of_birth" value={form.place_of_birth} onChange={handleChange} placeholder="City, country" />
                                    <Field label="Current location" name="current_location" value={form.current_location} onChange={handleChange} placeholder="Address" />
                                    <label className="flex items-center gap-3 text-sm font-semibold text-gray-600 dark:text-gray-300">
                                        <input type="checkbox" name="is_alive" checked={form.is_alive} onChange={handleChange} className="rounded" />
                                        Person is alive
                                    </label>
                                </>
                            )}

                            {addType === 'spouse' && (
                                <>
                                    <Field label="Marriage / anniversary date" name="anniversary_date" value={form.anniversary_date} onChange={handleChange} placeholder="YYYY-MM-DD" />
                                    <Field label="Place of marriage" name="place_of_birth" value={form.place_of_birth} onChange={handleChange} placeholder="City, country" />
                                    <Field label="Current location" name="current_location" value={form.current_location} onChange={handleChange} placeholder="Address" />
                                    <Field label="Notes" name="bio_notes" value={form.bio_notes} onChange={handleChange} placeholder="Optional notes" />
                                </>
                            )}

                            {addType === 'member' && (
                                <>
                                    <Field label="Date of birth" name="date_of_birth" value={form.date_of_birth} onChange={handleChange} placeholder="YYYY-MM-DD" />
                                    <Field label="Place of birth" name="place_of_birth" value={form.place_of_birth} onChange={handleChange} placeholder="City, country" />
                                    <Field label="Occupation" name="bio_notes" value={form.bio_notes} onChange={handleChange} placeholder="Occupation or notes" />
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
                            {loading ? 'Saving…' : 'Save'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TreeNodeAddModal;
