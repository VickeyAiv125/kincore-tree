import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCouncil } from '../../context/CouncilContext';
import {
    Search,
    Filter,
    UserPlus,
    MoreHorizontal,
    ChevronDown,
    X,
    Mail,
    Calendar,
    Clock,
    Shield,
    Users as UsersIcon,
    ArrowUpDown,
    CheckCircle2,
    GitBranch
} from 'lucide-react';

const StatusPill = ({ status }) => {
    const isActive = status === 'Active' || status === 'active';
    return (
        <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase transition-colors flex items-center space-x-1.5 ${isActive ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-gray-100 dark:bg-brand-darkBg text-gray-400 dark:text-gray-500'}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-gray-400'}`}></span>
            <span>{status || 'Active'}</span>
        </span>
    );
};

const CouncilMembers = () => {
    const navigate = useNavigate();
    const { selectedFamilyId, selectedFamily } = useCouncil();
    const [searchQuery, setSearchQuery] = useState('');
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedRole, setSelectedRole] = useState('All Roles');
    const [selectedBranch, setSelectedBranch] = useState('All Branches');

    const fetchMembers = useCallback(async () => {
        if (!selectedFamilyId) return;
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const baseUrl = import.meta.env.VITE_API_BASE_URL || `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}`;
            const res = await fetch(`${baseUrl}/families/${selectedFamilyId}/members`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                const mappedMembers = (data || []).map(m => ({
                    id: m.id,
                    name: m.name,
                    email: m.email || '',
                    avatar: m.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.name || 'Member')}&background=random`,
                    branch: m.branch,
                    role: m.role,
                    status: m.status,
                    joined: m.joined_at ? new Date(m.joined_at).toLocaleDateString() : 'N/A',
                    addedBy: m.added_by || 'System',
                    lastLogin: m.last_login ? new Date(m.last_login).toLocaleDateString() : 'Never',
                    exactLogin: m.last_login ? new Date(m.last_login).toLocaleString() : 'Never'
                }));
                setMembers(mappedMembers);
            }
        } catch (err) {
            console.error('Error fetching members:', err);
        } finally {
            setLoading(false);
        }
    }, [selectedFamilyId]);

    useEffect(() => {
        fetchMembers();
    }, [fetchMembers]);

    // Extract unique roles and branches
    const roles = ['All Roles', ...Array.from(new Set(members.map(m => m.role).filter(Boolean)))];
    const branches = ['All Branches', ...Array.from(new Set(members.map(m => m.branch).filter(Boolean)))];

    const filteredMembers = members.filter(m => {
        const nameMatch = (m.name || '').toLowerCase().includes(searchQuery.toLowerCase());
        const emailMatch = (m.email || '').toLowerCase().includes(searchQuery.toLowerCase());
        const roleMatch = (m.role || '').toLowerCase().includes(searchQuery.toLowerCase());
        const branchMatch = (m.branch || '').toLowerCase().includes(searchQuery.toLowerCase());
        const queryMatch = nameMatch || emailMatch || roleMatch || branchMatch;

        const matchesRole = selectedRole === 'All Roles' || m.role === selectedRole;
        const matchesBranch = selectedBranch === 'All Branches' || m.branch === selectedBranch;

        return queryMatch && matchesRole && matchesBranch;
    });

    return (
        <div className="max-w-7xl mx-auto text-left py-6 px-4 sm:px-6 lg:px-8 pb-32">
            <header className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div>
                    <h1 className="text-[32px] font-black text-gray-900 dark:text-brand-darkText leading-tight mb-3">
                        {selectedFamily ? `${selectedFamily.name} Members` : 'All Members'}
                    </h1>
                    <div className="flex items-center space-x-2">
                        <UsersIcon className="w-4 h-4 text-brand-orange" />
                        <p className="text-sm font-bold text-gray-400 dark:text-gray-500">Manage members across all biological and adopted branches</p>
                    </div>
                </div>
                <button
                    onClick={() => navigate('/council/members/add')}
                    className="bg-brand-orange text-white px-8 py-4 rounded-2xl font-black text-sm shadow-xl shadow-brand-orange/20 hover:bg-orange-600 transition-all active:scale-95 flex items-center space-x-3 w-fit"
                >
                    <UserPlus className="w-5 h-5" />
                    <span>Add New Member</span>
                </button>
            </header>

            <div className="mb-8 flex flex-col xl:flex-row items-center justify-between gap-6">
                <div className="relative w-full xl:max-w-[540px] group">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by name, branch, role or email..."
                        className="w-full bg-white dark:bg-brand-darkCard border border-gray-100 dark:border-brand-darkBorder rounded-2xl py-5 px-14 text-[13px] font-bold text-gray-800 dark:text-brand-darkText outline-none placeholder:text-gray-400 dark:placeholder:text-gray-600 transition-all focus:ring-4 focus:ring-brand-orange/5 focus:border-brand-orange/20 shadow-sm"
                    />
                    <Search className="w-5 h-5 absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-orange transition-colors" />
                    {searchQuery && (
                        <button onClick={() => setSearchQuery('')} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>

                <div className="flex flex-wrap items-center gap-4 w-full xl:w-auto">
                    <div className="flex items-center space-x-2 bg-white dark:bg-brand-darkCard border border-gray-100 dark:border-brand-darkBorder p-2 rounded-xl shadow-sm">
                        <select
                            value={selectedRole}
                            onChange={(e) => setSelectedRole(e.target.value)}
                            className="bg-gray-50 dark:bg-brand-darkBg px-4 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest text-gray-600 dark:text-gray-300 outline-none cursor-pointer hover:bg-gray-100 transition-colors"
                        >
                            {roles.map(r => (
                                <option key={r} value={r}>{r}</option>
                            ))}
                        </select>
                        <select
                            value={selectedBranch}
                            onChange={(e) => setSelectedBranch(e.target.value)}
                            className="bg-[#FFE5DE]/40 dark:bg-brand-orange/10 px-4 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest text-brand-orange outline-none cursor-pointer hover:bg-brand-orange/10 transition-colors"
                        >
                            {branches.map(b => (
                                <option key={b} value={b}>{b}</option>
                            ))}
                        </select>
                        <button
                            onClick={() => { setSearchQuery(''); setSelectedRole('All Roles'); setSelectedBranch('All Branches'); }}
                            className="flex items-center space-x-2 px-4 py-2.5 rounded-lg text-xs font-black text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <X className="w-3.5 h-3.5" />
                            <span>Reset</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-brand-darkCard border border-gray-100 dark:border-brand-darkBorder rounded-[2.5rem] overflow-hidden shadow-sm transition-colors">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-[#F9FAFB]/50 dark:bg-brand-darkBg/50 border-b border-gray-100 dark:border-brand-darkBorder transition-colors">
                            <tr>
                                <th className="px-6 py-5 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">Member Info</th>
                                <th className="px-6 py-5 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">Branch / Role</th>
                                <th className="px-6 py-5 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">Status</th>
                                <th className="px-6 py-5 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] hidden lg:table-cell">Join Date</th>
                                <th className="px-6 py-5 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] hidden xl:table-cell">Added By</th>
                                <th className="px-6 py-5 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] w-[180px]">Last Active</th>
                                <th className="px-6 py-5 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-brand-darkBorder">
                            {filteredMembers.map((member, idx) => (
                                <tr
                                    key={idx}
                                    onClick={() => navigate('/governance/view-profile')}
                                    className="hover:bg-gray-50/50 dark:hover:bg-brand-darkBg transition-all group cursor-pointer"
                                >
                                    <td className="px-6 py-5">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-sm ring-2 ring-gray-100 dark:ring-brand-darkBorder">
                                                <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-gray-800 dark:text-brand-darkText">{member.name}</p>
                                                <div className="flex items-center space-x-2 text-[11px] font-bold text-gray-400">
                                                    <Mail className="w-3 h-3" />
                                                    <span>{member.email}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="space-y-1">
                                            <div className="flex items-center space-x-2">
                                                <GitBranch className="w-3 h-3 text-brand-orange/60" />
                                                <span className="text-[13px] font-bold text-gray-600 dark:text-gray-300">{member.branch}</span>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Shield className="w-3 h-3 text-gray-300" />
                                                <span className="text-[11px] font-bold text-gray-400">{member.role}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <StatusPill status={member.status} />
                                    </td>
                                    <td className="px-6 py-5 hidden lg:table-cell">
                                        <div className="flex items-center space-x-2 text-gray-500">
                                            <Calendar className="w-3.5 h-3.5 opacity-50" />
                                            <span className="text-xs font-bold">{member.joined}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 hidden xl:table-cell">
                                        <div className="flex items-center space-x-2 text-gray-500">
                                            <UsersIcon className="w-3.5 h-3.5 opacity-50" />
                                            <span className="text-xs font-bold">{member.addedBy}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-gray-400 group-hover:text-brand-orange transition-colors group/time">
                                        <div className="flex items-center space-x-2">
                                            <Clock className="w-3.5 h-3.5" />
                                            <span className="text-xs font-black uppercase tracking-tight" title={member.exactLogin}>{member.lastLogin}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <button className="p-2 hover:bg-gray-100 dark:hover:bg-brand-darkBg rounded-xl transition-all text-gray-400 hover:text-brand-orange">
                                            <MoreHorizontal className="w-5 h-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="mt-12 flex items-center justify-between px-4">
                <p className="text-xs font-bold text-gray-400 dark:text-gray-500">Showing 10 of 125 active members</p>
                <div className="flex items-center space-x-2">
                    <button className="px-4 py-2 border border-gray-100 dark:border-brand-darkBorder rounded-xl text-[11px] font-black uppercase tracking-widest text-gray-400 hover:bg-gray-50 transition-colors">Previous</button>
                    <button className="px-4 py-2 bg-brand-orange text-white rounded-xl text-[11px] font-black uppercase tracking-widest shadow-lg shadow-brand-orange/10 hover:bg-orange-600 transition-all">Next</button>
                </div>
            </div>
        </div>
    );
};

export default CouncilMembers;
