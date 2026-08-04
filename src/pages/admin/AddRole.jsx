import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronDown, X } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const AddRole = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedRole, setSelectedRole] = useState('');
    const [notes, setNotes] = useState('');
    const [showUserDropdown, setShowUserDropdown] = useState(false);
    const [showRoleDropdown, setShowRoleDropdown] = useState(false);
    const [errors, setErrors] = useState({});
    const [members, setMembers] = useState([]);
    const [assignableRoles, setAssignableRoles] = useState([]);
    const [actorRole, setActorRole] = useState('');
    const [canManage, setCanManage] = useState(false);
    const [loadingMembers, setLoadingMembers] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [statusModal, setStatusModal] = useState({ show: false, type: 'success', title: '', message: '' });

    const userDropdownRef = useRef(null);
    const roleDropdownRef = useRef(null);

    const getFamilyId = () => {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        let familyId = localStorage.getItem('selected_family_id') || user?.family_id || user?.family_space_id;
        if (!familyId || familyId === 'undefined' || familyId === 'null') familyId = null;
        return { familyId, token: localStorage.getItem('token'), user };
    };

    useEffect(() => {
        fetchMembers();
        fetchPolicy();
    }, []);

    const fetchPolicy = async () => {
        try {
            const { familyId, token } = getFamilyId();
            if (!familyId || !token) return;
            const response = await fetch(`${API_BASE}/families/${familyId}/role-policy`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Failed to load role policy');
            const data = await response.json();
            setActorRole(data.actor_role || '');
            setCanManage(Boolean(data.can_manage_roles));
            setAssignableRoles(data.assignable_roles || []);
        } catch (err) {
            console.error(err);
            setCanManage(false);
            setAssignableRoles([]);
        }
    };

    const fetchMembers = async () => {
        try {
            setLoadingMembers(true);
            const { familyId, token } = getFamilyId();
            if (!familyId) return;

            const response = await fetch(`${API_BASE}/families/${familyId}/members`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('Failed to fetch members');
            const data = await response.json();
            setMembers(data || []);
        } catch (err) {
            console.error('Error fetching members:', err);
        } finally {
            setLoadingMembers(false);
        }
    };

    const filteredUsers = members.filter((user) =>
        (user.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (user.email || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
                setShowUserDropdown(false);
            }
            if (roleDropdownRef.current && !roleDropdownRef.current.contains(event.target)) {
                setShowRoleDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const validateForm = () => {
        const newErrors = {};
        if (!selectedUser) newErrors.user = 'Please select a user';
        if (!selectedRole) newErrors.role = 'Please select a role';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        try {
            setSubmitting(true);
            const { familyId, token } = getFamilyId();
            const targetId = selectedUser.user_id || selectedUser.id;

            const response = await fetch(`${API_BASE}/families/${familyId}/members/${targetId}/role`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ role: selectedRole, notes: notes || undefined })
            });

            const errData = await response.json().catch(() => ({}));
            if (!response.ok) throw new Error(errData.error || 'Failed to update role');

            setStatusModal({
                show: true,
                type: 'success',
                title: 'Role Assigned',
                message: `Successfully assigned ${selectedRole} to ${selectedUser.name}.`
            });
        } catch (err) {
            setStatusModal({
                show: true,
                type: 'error',
                title: 'Access Denied',
                message: err.message
            });
        } finally {
            setSubmitting(false);
        }
    };

    const closeStatusModal = () => {
        const isSuccess = statusModal.type === 'success';
        setStatusModal({ ...statusModal, show: false });
        if (isSuccess) navigate('/governance');
    };

    const roleLabel = (role) => role.label || role.key || role;

    return (
        <div className="min-h-screen bg-[#F3F4F6] dark:bg-brand-darkBg p-4 sm:p-6 lg:p-8">
            <div className="max-w-3xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-extrabold text-gray-900 dark:text-brand-darkText mb-2">
                        Assign Family Role
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Family Owner can assign all family roles. Family Admin can only assign operational roles
                        allowed by Owner delegations. Ownership transfer is a separate action.
                    </p>
                    {actorRole && (
                        <p className="mt-2 text-xs font-bold uppercase tracking-widest text-brand-orange">
                            Acting as: {actorRole}
                        </p>
                    )}
                </div>

                {!canManage && (
                    <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
                        You do not have permission to assign roles in this family space.
                    </div>
                )}

                <div className="bg-white dark:bg-brand-darkCard rounded-2xl border border-gray-100 dark:border-brand-darkBorder shadow-sm p-6 sm:p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-gray-800 dark:text-brand-darkText">
                                Search User
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Search className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onFocus={() => setShowUserDropdown(true)}
                                    className="block w-full pl-12 pr-4 py-4 bg-[#F3F4F6]/50 dark:bg-brand-darkBg/50 border-none rounded-2xl focus:ring-2 focus:ring-brand-orange/20 placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-brand-darkText font-medium transition-all"
                                    placeholder={loadingMembers ? 'Loading members...' : 'Search user'}
                                />
                            </div>
                        </div>

                        <div className="space-y-2" ref={userDropdownRef}>
                            <label className="block text-sm font-bold text-gray-800 dark:text-brand-darkText">
                                Select User <span className="text-brand-orange">*</span>
                            </label>
                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={() => setShowUserDropdown(!showUserDropdown)}
                                    className={`w-full flex items-center justify-between px-4 py-4 bg-[#F3F4F6]/50 dark:bg-brand-darkBg/50 border ${errors.user ? 'border-red-300' : 'border-transparent'} rounded-2xl text-left`}
                                >
                                    <span className={`font-medium ${selectedUser ? 'text-gray-900 dark:text-brand-darkText' : 'text-gray-400'}`}>
                                        {selectedUser ? `${selectedUser.name}${selectedUser.role ? ` (${selectedUser.role})` : ''}` : 'Choose a user'}
                                    </span>
                                    <ChevronDown className={`h-5 w-5 text-gray-400 ${showUserDropdown ? 'rotate-180' : ''}`} />
                                </button>
                                {showUserDropdown && (
                                    <div className="absolute z-10 w-full mt-2 bg-white dark:bg-brand-darkCard border border-gray-100 dark:border-brand-darkBorder rounded-2xl shadow-lg max-h-64 overflow-y-auto">
                                        {filteredUsers.length > 0 ? (
                                            <ul className="py-2">
                                                {filteredUsers.map((user) => (
                                                    <li
                                                        key={user.user_id || user.id}
                                                        onClick={() => {
                                                            setSelectedUser(user);
                                                            setShowUserDropdown(false);
                                                            setSearchQuery('');
                                                            setErrors({ ...errors, user: '' });
                                                        }}
                                                        className="px-4 py-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-brand-darkBorder/30"
                                                    >
                                                        <div className="font-medium text-gray-900 dark:text-brand-darkText">{user.name}</div>
                                                        <div className="text-sm text-gray-500">{user.email} · {user.role || 'member'}</div>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <div className="px-4 py-8 text-center text-gray-500">No users found</div>
                                        )}
                                    </div>
                                )}
                            </div>
                            {errors.user && <p className="text-sm text-red-500 mt-1">{errors.user}</p>}
                        </div>

                        <div className="space-y-2" ref={roleDropdownRef}>
                            <label className="block text-sm font-bold text-gray-800 dark:text-brand-darkText">
                                Select Role <span className="text-brand-orange">*</span>
                            </label>
                            <div className="relative">
                                <button
                                    type="button"
                                    disabled={!canManage || assignableRoles.length === 0}
                                    onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                                    className={`w-full flex items-center justify-between px-4 py-4 bg-[#F3F4F6]/50 dark:bg-brand-darkBg/50 border ${errors.role ? 'border-red-300' : 'border-transparent'} rounded-2xl text-left disabled:opacity-50`}
                                >
                                    <span className={`font-medium ${selectedRole ? 'text-gray-900 dark:text-brand-darkText' : 'text-gray-400'}`}>
                                        {selectedRole
                                            ? roleLabel(assignableRoles.find((r) => r.key === selectedRole) || { key: selectedRole })
                                            : 'Choose a role'}
                                    </span>
                                    <ChevronDown className={`h-5 w-5 text-gray-400 ${showRoleDropdown ? 'rotate-180' : ''}`} />
                                </button>
                                {showRoleDropdown && (
                                    <div className="absolute z-10 w-full mt-2 bg-white dark:bg-brand-darkCard border border-gray-100 dark:border-brand-darkBorder rounded-2xl shadow-lg">
                                        <ul className="py-2">
                                            {assignableRoles.map((role) => (
                                                <li
                                                    key={role.key}
                                                    onClick={() => {
                                                        setSelectedRole(role.key);
                                                        setShowRoleDropdown(false);
                                                        setErrors({ ...errors, role: '' });
                                                    }}
                                                    className={`px-4 py-3 cursor-pointer ${selectedRole === role.key ? 'bg-brand-orange/10 font-medium' : 'hover:bg-gray-50 dark:hover:bg-brand-darkBorder/30'} text-gray-900 dark:text-brand-darkText`}
                                                >
                                                    {roleLabel(role)}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                            {errors.role && <p className="text-sm text-red-500 mt-1">{errors.role}</p>}
                            {canManage && assignableRoles.length === 0 && (
                                <p className="text-xs text-amber-600 font-medium">
                                    No roles are currently assignable under Owner delegations.
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-gray-800 dark:text-brand-darkText">Notes (optional)</label>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                rows={3}
                                className="w-full rounded-2xl bg-[#F3F4F6]/50 dark:bg-brand-darkBg/50 border-none p-4 text-sm font-medium text-gray-900 dark:text-brand-darkText"
                                placeholder="Reason for role change (stored in audit log)"
                            />
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 pt-4">
                            <button
                                type="button"
                                onClick={() => navigate('/governance')}
                                className="flex-1 px-6 py-4 border-2 border-gray-200 dark:border-brand-darkBorder text-gray-700 dark:text-brand-darkText font-bold rounded-2xl"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={submitting || !canManage}
                                className="flex-1 px-6 py-4 bg-brand-orange text-white font-bold rounded-2xl disabled:opacity-50"
                            >
                                {submitting ? 'Updating...' : 'Assign Role'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {statusModal.show && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-brand-darkCard rounded-[2.5rem] p-8 max-w-sm w-full shadow-2xl border border-gray-100 dark:border-brand-darkBorder">
                        <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 ${statusModal.type === 'success' ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'}`}>
                            {statusModal.type === 'success' ? (
                                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                            ) : (
                                <X className="w-10 h-10" strokeWidth={3} />
                            )}
                        </div>
                        <h3 className="text-xl font-black text-center mb-2">{statusModal.title}</h3>
                        <p className="text-sm text-gray-500 text-center mb-8">{statusModal.message}</p>
                        <button
                            onClick={closeStatusModal}
                            className="w-full py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] bg-brand-orange text-white"
                        >
                            {statusModal.type === 'success' ? 'Continue' : 'Try Again'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AddRole;
