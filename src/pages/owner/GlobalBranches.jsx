import React from 'react';
import { useNavigate } from 'react-router-dom';

const BranchCard = (props) => {
    const { id, emblem, name, leader, members, households, generations, bgColor = 'bg-white' } = props;
    const navigate = useNavigate();
    return (
        <div
            className="flex flex-col items-start text-left group cursor-pointer"
            onClick={() => navigate(`/owner/branches/edit/${id}`)}
        >
            <div className={`w-full aspect-square ${bgColor} dark:bg-brand-darkCard rounded-[2rem] border border-gray-100 dark:border-brand-darkBorder shadow-sm flex items-center justify-center p-8 mb-6 transition-all group-hover:shadow-md dark:group-hover:shadow-brand-orange/5 group-hover:-translate-y-1 overflow-hidden`}>
                <div className="w-full h-full flex items-center justify-center text-4xl">
                    {emblem && (emblem.startsWith('http') || emblem.startsWith('/') || emblem.includes('.')) ? (
                        <img src={emblem} alt={name} className="w-full h-full object-cover" />
                    ) : (
                        emblem || '🌲'
                    )}
                </div>
            </div>
            <h3 className="text-xl font-extrabold text-gray-900 dark:text-brand-darkText mb-1">{name}</h3>
            <div className="flex justify-between items-center w-full">
                <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Leader: {leader}</p>
                    <div className="flex flex-wrap gap-x-2 gap-y-1">
                        <span className="text-[9px] font-black text-brand-orange uppercase tracking-tighter bg-orange-50 dark:bg-brand-orange/10 px-1.5 py-0.5 rounded">{members} Mem</span>
                        <span className="text-[9px] font-black text-blue-500 uppercase tracking-tighter bg-blue-50 dark:bg-blue-500/10 px-1.5 py-0.5 rounded">{households} HH</span>
                        <span className="text-[9px] font-black text-green-600 uppercase tracking-tighter bg-green-50 dark:bg-green-600/10 px-1.5 py-0.5 rounded">{generations} Gen</span>
                    </div>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity text-brand-orange font-black text-[10px] uppercase">Edit</div>
            </div>
        </div>
    );
};

const GlobalBranches = () => {
    const navigate = useNavigate();
    const [branches, setBranches] = React.useState([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchBranches = async () => {
            try {
                const baseUrl = import.meta.env.VITE_API_BASE_URL || `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}`;
                const user = JSON.parse(localStorage.getItem('user'));
                const familyId = user?.family_id || 'DEFAULT_FAMILY_ID';

                const response = await fetch(`${baseUrl}/branches/${familyId}`, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                });
                const data = await response.json();
                if (response.ok) {
                    setBranches(data);
                }
            } catch (err) {
                console.error('Failed to fetch branches:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchBranches();
    }, []);

    if (loading) return <div className="p-20 text-center font-black animate-pulse text-brand-orange">Loading branches...</div>;

    return (
        <div className="flex flex-col text-left">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-12">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-brand-darkText leading-tight">Global Branches Management</h1>
                <button
                    onClick={() => navigate('/owner/branches/create')}
                    className="bg-orange-50 dark:bg-brand-orange/10 text-brand-orange px-8 py-3 rounded-xl font-bold hover:bg-orange-100 dark:hover:bg-brand-orange/20 transition-all"
                >
                    Create New Branch
                </button>
            </header>

            {branches.length === 0 ? (
                <div className="bg-white dark:bg-brand-darkCard rounded-[3rem] p-20 text-center border-2 border-dashed border-gray-100 dark:border-brand-darkBorder">
                    <p className="text-xl font-black text-gray-400 uppercase tracking-widest mb-4">No Branches Found</p>
                    <p className="text-xs font-bold text-gray-400 mb-8 max-w-sm mx-auto">Start organizing your lineage by creating your first family branch.</p>
                    <button
                        onClick={() => navigate('/owner/branches/create')}
                        className="text-brand-orange font-black text-sm uppercase tracking-widest hover:scale-105 transition-transform"
                    >
                        + Create Your First Branch
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-x-8 gap-y-12">
                    {branches.map((branch) => (
                        <BranchCard
                            key={branch.id}
                            id={branch.id}
                            name={branch.name}
                            leader={branch.leader_name || 'No Head Set'}
                            members={branch.member_count || 0}
                            households={branch.household_count || 0}
                            generations={branch.generation_count || 0}
                            emblem={branch.emblem || '🌲'}
                            bgColor="bg-white"
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default GlobalBranches;
