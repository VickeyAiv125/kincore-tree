import React from 'react';
import { useNavigate } from 'react-router-dom';

const MemberRow = ({ id, name, branch, role, status, lastLogin }) => {
    const navigate = useNavigate();
    const isActive = status === 'Active';
    return (
        <tr className="border-b border-gray-50 dark:border-brand-darkBorder last:border-none hover:bg-orange-50/10 dark:hover:bg-brand-orange/5 transition-colors">
            <td className="py-5 px-4 text-sm font-medium text-gray-800 dark:text-brand-darkText">{name}</td>
            <td className="py-5 px-4 text-sm font-medium text-gray-800 dark:text-brand-darkText">{branch || '-'}</td>
            <td className="py-5 px-4 text-sm font-medium text-gray-800 dark:text-brand-darkText">{role}</td>
            <td className="py-5 px-4">
                <span className={`px-8 py-2.5 rounded-xl text-[10px] font-extrabold uppercase tracking-widest inline-block w-32 text-center bg-orange-100/50 dark:bg-brand-orange/10 transition-colors ${isActive ? 'text-brand-orange' : 'text-gray-500 dark:text-gray-500'}`}>
                    {status}
                </span>
            </td>
            <td className="py-5 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">{lastLogin}</td>
            <td
                className="py-5 px-4 text-sm font-bold text-brand-orange hover:underline cursor-pointer text-center transition-all"
                onClick={() => navigate(`/owner/members/edit/${id}`)}
            >
                Edit
            </td>
        </tr>
    );
};

const GlobalMembers = () => {
    const navigate = useNavigate();
    const [members, setMembers] = React.useState([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchMembers = async () => {
            try {
                const baseUrl = import.meta.env.VITE_API_BASE_URL || `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}`;
                const userString = localStorage.getItem('user');
                if (!userString) return;
                const user = JSON.parse(userString);

                const familyId = localStorage.getItem('selected_family_id') || user?.family_id || user?.family_space_id;
                const token = localStorage.getItem('token');

                if (!token || !familyId) {
                    setLoading(false);
                    return;
                }

                const endpoint = `${baseUrl}/families/${familyId}/members?t=${Date.now()}`;
                const response = await fetch(endpoint, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await response.json();
                if (response.ok) {
                    const formatMemberName = (m) => {
                        const raw = m.name || m.full_name || `${m.first_name || ''} ${m.last_name || ''}`.trim() || m.email || 'Unknown';
                        if (raw.includes('@')) {
                            const prefix = raw.split('@')[0];
                            return prefix.charAt(0).toUpperCase() + prefix.slice(1);
                        }
                        return raw;
                    };
                    setMembers(data.map(m => ({
                        id: m.id,
                        name: formatMemberName(m),
                        branch: m.branch,
                        role: m.role || 'Member',
                        status: m.status || 'Active',
                        lastLogin: m.last_login ? new Date(m.last_login).toLocaleDateString() : 'Never'
                    })));
                }
            } catch (err) {
                console.error('Fetch error:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchMembers();
    }, []);

    return (
        <div className="flex flex-col text-left">
            <header className="mb-10 sm:mb-12">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-brand-darkText leading-tight mb-2">Global Members Management</h1>
                <p className="text-sm font-medium text-brand-orange">Manage all members across your entire lineage</p>
            </header>

            {/* Search Bar */}
            <div className="relative mb-8 max-w-full">
                <input
                    type="text"
                    placeholder="Search members"
                    className="w-full bg-orange-50/50 dark:bg-brand-orange/5 border-none rounded-2xl py-5 pl-12 pr-6 text-sm font-medium text-gray-600 dark:text-brand-darkText focus:ring-2 focus:ring-brand-orange/20 dark:focus:ring-brand-orange/40 transition-all placeholder-gray-400 dark:placeholder:text-gray-500"
                />
                <svg className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            </div>

            {/* Filter */}
            <div className="mb-10">
                <button className="flex items-center space-x-2 bg-orange-100/50 dark:bg-brand-orange/10 px-6 py-2.5 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-400 hover:bg-orange-100 dark:hover:bg-brand-orange/20 transition-all">
                    <span>Filter by Branch</span>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor font-bold"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
                </button>
            </div>

            {/* Members Table */}
            <div className="bg-white dark:bg-brand-darkCard rounded-3xl border border-orange-50 dark:border-brand-darkBorder shadow-sm overflow-hidden mb-8 transition-colors">
                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[800px]">
                        <thead>
                            <tr className="border-b border-gray-100 dark:border-brand-darkBorder text-[10px] font-extrabold text-gray-400 dark:text-gray-500 uppercase tracking-widest transition-colors">
                                <th className="py-6 px-4">Name</th>
                                <th className="py-6 px-4">Branch</th>
                                <th className="py-6 px-4">Family Role</th>
                                <th className="py-6 px-4">Status</th>
                                <th className="py-6 px-4">Last Login</th>
                                <th className="py-6 px-4 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {members.map((member, index) => (
                                <MemberRow key={index} {...member} />
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add New Member Button */}
            <div className="flex justify-end mb-16">
                <button
                    onClick={() => navigate('/owner/add-member')}
                    className="bg-brand-orange text-white px-10 py-3.5 rounded-2xl font-bold shadow-lg shadow-brand-orange/20 hover:bg-orange-600 transform transition-all active:scale-95 text-sm"
                >
                    Add New Member
                </button>
            </div>
        </div>
    );
};

export default GlobalMembers;
