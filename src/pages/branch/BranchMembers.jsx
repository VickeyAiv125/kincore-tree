import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Eye, Edit2, MoreHorizontal, ChevronDown, Trash2, Plus, Loader2 } from 'lucide-react';
import Notification from '../../components/common/Notification';

const StatusBadge = ({ status }) => {
    const isActive = status === 'Active';
    return (
        <span className={`px-4 sm:px-12 py-2 rounded-xl text-[13px] font-bold transition-all whitespace-nowrap ${isActive ? 'bg-[#FFE5DE] dark:bg-brand-orange/20 text-brand-orange' : 'bg-[#F9FAFB] dark:bg-brand-darkBg text-gray-400 dark:text-gray-500'}`}>
            {status}
        </span>
    );
};

const BranchMembers = () => {
    const navigate = useNavigate();
    const [members, setMembers] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [branchName, setBranchName] = React.useState('Loading Branch...');
    const [notification, setNotification] = React.useState({ message: '', type: 'success' });

    React.useEffect(() => {
        const fetchMembers = async () => {
            try {
                const user = JSON.parse(localStorage.getItem('user'));
                const token = localStorage.getItem('token');
                const branchId = user?.branch_id || '6b8eb992-571f-4637-b031-a56007560cad';
                const baseUrl = import.meta.env.VITE_API_BASE_URL || `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}`;

                const branchResp = await fetch(`${baseUrl}/admin/branch/stats/${branchId}?_t=${Date.now()}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const branchData = await branchResp.json();
                setBranchName(branchData?.branch_info?.name || 'Unknown Branch');

                const membersResp = await fetch(`${baseUrl}/admin/branch/members/${branchId}?_t=${Date.now()}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const membersData = await membersResp.json();
                setMembers(membersData);
                setLoading(false);
            } catch (err) {
                console.error('>>> [FETCH_MEMBERS_ERROR]', err);
                setLoading(false);
            }
        };
        fetchMembers();
    }, []);

    const handleDelete = async (memberId) => {
        if (!window.confirm('Are you sure you want to delete this member?')) return;
        try {
            const token = localStorage.getItem('token');
            const baseUrl = import.meta.env.VITE_API_BASE_URL || `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}`;
            const response = await fetch(`${baseUrl}/admin/branch/members/delete/${memberId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Failed to delete member');
            setMembers(members.filter(m => m.id !== memberId));
            setNotification({ message: 'Member deleted successfully', type: 'success' });
        } catch (err) {
            console.error('>>> [DELETE_MEMBER_ERROR]', err);
            setNotification({ message: 'Error deleting member: ' + err.message, type: 'error' });
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="animate-spin text-brand-orange" size={40} />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto text-left py-4 px-4 sm:px-0">
            <Notification 
                message={notification.message} 
                type={notification.type} 
                onClose={() => setNotification({ message: '', type: 'success' })} 
            />

            <header className="flex flex-col lg:flex-row justify-between lg:items-center gap-6 mb-12">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-brand-darkText leading-tight mb-2">Branch Members</h1>
                    <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest flex items-center gap-2">
                        <span className="text-brand-orange">{branchName}</span>
                        <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                        <span>{members.length} Total Relatives</span>
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch gap-4 w-full lg:w-auto">
                    <div className="relative group flex-1 sm:min-w-[320px]">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-orange transition-colors" size={16} />
                        <input
                            type="text"
                            placeholder="Search by name, ID or relation..."
                            className="w-full bg-white dark:bg-brand-darkCard border border-gray-100 dark:border-brand-darkBorder rounded-2xl py-3.5 pl-12 pr-6 text-sm font-bold text-gray-600 dark:text-brand-darkText placeholder-gray-400 transition-all focus:ring-2 focus:ring-brand-orange/10 focus:border-brand-orange shadow-xs"
                        />
                    </div>
                    <button className="bg-white dark:bg-brand-darkCard border border-gray-100 dark:border-brand-darkBorder px-6 py-3.5 rounded-2xl flex items-center justify-center gap-2 text-gray-500 hover:text-brand-orange transition-all shadow-xs group">
                        <Filter size={16} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Filters</span>
                    </button>
                    <button onClick={() => navigate('/branch/members/add')} className="bg-brand-orange text-white px-8 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-brand-orange/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2">
                        <Plus className="w-4 h-4" strokeWidth={3} /> Add Member
                    </button>
                </div>
            </header>

            <div className="bg-white dark:bg-brand-darkCard border border-gray-100 dark:border-brand-darkBorder rounded-[2rem] overflow-hidden shadow-sm transition-colors">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-50 dark:border-brand-darkBorder bg-gray-50/30 dark:bg-brand-darkBg/30">
                                <th className="px-6 sm:px-10 py-5 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Full Name</th>
                                <th className="px-6 sm:px-10 py-5 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest text-center">Gen</th>
                                <th className="px-6 sm:px-10 py-5 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Relationship</th>
                                <th className="px-6 sm:px-10 py-5 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">System Role</th>
                                <th className="px-6 sm:px-10 py-5 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest text-center">Status</th>
                                <th className="px-6 sm:px-10 py-5 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-brand-darkBorder">
                            {members.map((member, idx) => (
                                <tr key={member.id || idx} className="hover:bg-gray-50/30 dark:hover:bg-brand-darkBg transition-colors group border-b last:border-none border-gray-50 dark:border-brand-darkBorder">
                                    <td className="px-6 sm:px-10 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-brand-darkBg flex items-center justify-center font-black text-brand-orange text-xs overflow-hidden">
                                                {member.avatar ? <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" /> : member.name.split(' ').map(n => n[0]).join('')}
                                            </div>
                                            <span className="text-sm font-bold text-gray-800 dark:text-brand-darkText group-hover:text-brand-orange transition-colors leading-none">{member.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 sm:px-10 py-5 text-center">
                                        <span className="text-[11px] font-black text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-brand-darkBg px-2 py-1 rounded-lg">{member.generation || 'G1'}</span>
                                    </td>
                                    <td className="px-6 sm:px-10 py-5">
                                        <span className="text-xs font-bold text-gray-400 dark:text-gray-500">{member.relation || 'Member'}</span>
                                    </td>
                                    <td className="px-6 sm:px-10 py-5">
                                        <span className="text-[10px] font-black text-gray-500 dark:text-gray-500 uppercase tracking-widest">{member.role || 'Node'}</span>
                                    </td>
                                    <td className="px-6 sm:px-10 py-5 text-center">
                                        <StatusBadge status={member.status || 'Active'} />
                                    </td>
                                    <td className="px-6 sm:px-10 py-5">
                                        <div className="flex items-center justify-end gap-3">
                                            <button onClick={() => navigate(`/branch/members/view/${member.id}`)} className="w-9 h-9 rounded-xl bg-gray-50 dark:bg-brand-darkBg flex items-center justify-center text-gray-400 hover:text-brand-orange hover:bg-brand-orange/10 transition-all shadow-xs" title="View Profile">
                                                <Eye size={16} />
                                            </button>
                                            <button onClick={() => navigate(`/branch/members/edit/${member.id}`)} className="w-9 h-9 rounded-xl bg-gray-50 dark:bg-brand-darkBg flex items-center justify-center text-gray-400 hover:text-brand-orange hover:bg-brand-orange/10 transition-all shadow-xs" title="Edit Member">
                                                <Edit2 size={16} />
                                            </button>
                                            <button onClick={() => handleDelete(member.id)} className="w-9 h-9 rounded-xl bg-gray-50 dark:bg-brand-darkBg flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all shadow-xs" title="Delete Member">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {members.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="px-6 py-20 text-center text-gray-400 font-bold uppercase tracking-widest text-xs">No members found in this branch</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default BranchMembers;
