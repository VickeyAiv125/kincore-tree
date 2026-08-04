import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCouncil } from '../../context/CouncilContext';
import {
    Plus,
    Search,
    Filter,
    MoreVertical,
    Users,
    GitBranch,
    Zap,
    LayoutGrid,
    ArrowUpDown,
    CheckCircle2
} from 'lucide-react';

const ActivityBadge = ({ level }) => {
    const colors = {
        'High': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
        'Medium': 'bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400',
        'Low': 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400'
    };
    return (
        <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-tighter ${colors[level] || 'bg-gray-100 text-gray-600'}`}>
            {level} Activity
        </span>
    );
};

const BranchCard = ({ name, leader, members, activity, color, emblem, avatar, ...props }) => {
    const navigate = useNavigate();
    return (
        <div
            onClick={() => navigate(`/council/branches/edit/${props.id}`)}
            className="group flex flex-col bg-white dark:bg-brand-darkCard border border-gray-100 dark:border-brand-darkBorder rounded-[2.5rem] p-6 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all cursor-pointer relative overflow-hidden h-full"
        >
            <div className={`aspect-video w-full rounded-2xl flex items-center justify-center mb-6 overflow-hidden transition-colors ${color} dark:bg-brand-darkBg/50`}>
                {emblem ? (
                    (emblem.startsWith('http') || emblem.startsWith('/') || emblem.includes('.')) ? (
                        <img src={emblem} alt={name} className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-500" />
                    ) : (
                        <span className="text-4xl">{emblem}</span>
                    )
                ) : null}
            </div>

            <button className="absolute top-4 right-4 p-2 text-gray-300 hover:text-brand-orange transition-colors z-10">
                <MoreVertical className="w-5 h-5" />
            </button>

            <div className="space-y-4">
                <div>
                    <div className="flex items-center justify-between mb-1">
                        <h3 className="text-lg font-black text-gray-900 dark:text-brand-darkText tracking-tight">The {name} Branch</h3>
                        <ActivityBadge level={activity} />
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="w-5 h-5 rounded-full overflow-hidden ring-2 ring-gray-100 dark:ring-brand-darkBorder">
                            <img src={avatar} alt={leader} className="w-full h-full object-cover" />
                        </div>
                        <p className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-tight">Leader: <span className="text-gray-700 dark:text-gray-300">{leader}</span></p>
                    </div>
                </div>

                <div className="pt-4 border-t border-gray-50 dark:border-brand-darkBorder grid grid-cols-3 gap-2">
                    <div className="flex flex-col items-center justify-center p-2 bg-gray-50 dark:bg-brand-darkBg rounded-xl">
                        <Users className="w-3.5 h-3.5 text-gray-400 mb-1" />
                        <span className="text-[10px] font-black text-gray-700 dark:text-gray-300">{members}</span>
                        <span className="text-[8px] font-bold text-gray-400 uppercase">Members</span>
                    </div>
                    <div className="flex flex-col items-center justify-center p-2 bg-gray-50 dark:bg-brand-darkBg rounded-xl">
                        <LayoutGrid className="w-3.5 h-3.5 text-gray-400 mb-1" />
                        <span className="text-[10px] font-black text-gray-700 dark:text-gray-300">{props.households || 0}</span>
                        <span className="text-[8px] font-bold text-gray-400 uppercase">Houses</span>
                    </div>
                    <div className="flex flex-col items-center justify-center p-2 bg-gray-50 dark:bg-brand-darkBg rounded-xl">
                        <GitBranch className="w-3.5 h-3.5 text-gray-400 mb-1" />
                        <span className="text-[10px] font-black text-gray-700 dark:text-gray-300">{props.generations || 0}</span>
                        <span className="text-[8px] font-bold text-gray-400 uppercase">Gens</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

const CouncilBranches = () => {
    const navigate = useNavigate();
    const { selectedFamilyId, selectedFamily } = useCouncil();
    const [branches, setBranches] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchBranches = useCallback(async () => {
        if (!selectedFamilyId) return;
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const baseUrl = import.meta.env.VITE_API_BASE_URL || `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}`;
            const res = await fetch(`${baseUrl}/admin/council/branches?familySpaceId=${selectedFamilyId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                const formatted = (data || []).map(b => ({
                    id: b.id,
                    name: b.name,
                    leader: b.leader_name || 'Not Assigned',
                    members: b.members_count || 0,
                    households: b.households_count || 0,
                    generations: b.generations_count || 1,
                    activity: b.activity_level || 'Medium',
                    color: b.color || 'bg-gray-50/50',
                    emblem: b.emblem_url,
                    avatar: b.leader_avatar_url || 'https://i.pravatar.cc/150?u=' + b.id
                }));
                setBranches(formatted);
            }
        } catch (err) {
            console.error('Error fetching branches:', err);
        } finally {
            setLoading(false);
        }
    }, [selectedFamilyId]);

    useEffect(() => {
        fetchBranches();
    }, [fetchBranches]);

    const filteredBranches = branches.filter(b => 
        (b.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (b.leader || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="max-w-7xl mx-auto text-left py-6 px-4 sm:px-6 lg:px-8 pb-32">
            <header className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div>
                    <h1 className="text-[32px] font-black text-gray-900 dark:text-brand-darkText leading-tight mb-3">
                        {selectedFamily ? `${selectedFamily.name} Branches` : 'Family Branches'}
                    </h1>
                    <div className="flex items-center space-x-2">
                        <GitBranch className="w-4 h-4 text-brand-orange" />
                        <p className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-tighter">
                            Monitoring {filteredBranches.length} Active Lineages Globally
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => navigate('/council/branches/create')}
                    className="bg-brand-orange text-white px-8 py-4 rounded-2xl font-black text-sm shadow-xl shadow-brand-orange/20 hover:bg-orange-600 transition-all active:scale-95 flex items-center space-x-3 w-fit"
                >
                    <Plus className="w-5 h-5" />
                    <span>Create New Branch</span>
                </button>
            </header>

            <div className="mb-10 flex flex-col sm:flex-row items-center justify-between gap-6 px-2">
                <div className="relative w-full sm:w-[380px] group">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search branches..."
                        className="w-full bg-white dark:bg-brand-darkCard border border-gray-100 dark:border-brand-darkBorder rounded-xl py-3.5 px-12 text-xs font-bold text-gray-800 dark:text-brand-darkText outline-none focus:ring-4 focus:ring-brand-orange/5 transition-all"
                    />
                    <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-orange transition-colors" />
                </div>
                <div className="flex items-center space-x-3">
                    <button className="flex items-center space-x-2 px-4 py-2.5 rounded-xl border border-gray-100 dark:border-brand-darkBorder text-xs font-black text-gray-400 hover:text-brand-orange transition-colors">
                        <ArrowUpDown className="w-3.5 h-3.5" />
                        <span>Sort By Activity</span>
                    </button>
                    <button className="p-2.5 rounded-xl border border-gray-100 dark:border-brand-darkBorder text-gray-400 hover:text-brand-orange transition-colors">
                        <LayoutGrid className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-12 text-gray-400">Loading branches...</div>
            ) : filteredBranches.length === 0 ? (
                <div className="text-center py-12 text-gray-400">No branches found for this family space.</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {filteredBranches.map((branch, idx) => (
                        <BranchCard key={idx} {...branch} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default CouncilBranches;
