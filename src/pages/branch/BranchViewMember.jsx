import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { User, Shield, GitBranch, Layers, Activity, Calendar, MapPin, X, ArrowLeft, Mail, Phone, Info, Loader2 } from 'lucide-react';

const StatCard = ({ icon: Icon, label, value }) => (
    <div className="bg-gray-50 dark:bg-brand-darkBg/50 p-6 rounded-[2rem] border border-transparent hover:border-orange-100 dark:hover:border-brand-orange/10 transition-all group">
        <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-white dark:bg-brand-darkCard rounded-2xl flex items-center justify-center text-brand-orange shadow-sm group-hover:scale-110 transition-transform">
                <Icon size={20} />
            </div>
            <div className="text-left">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">{label}</p>
                <p className="text-sm font-black text-gray-900 dark:text-brand-darkText uppercase tracking-tight">{value}</p>
            </div>
        </div>
    </div>
);

const InfoSection = ({ title, children }) => (
    <div className="bg-white dark:bg-brand-darkCard rounded-[2.5rem] border border-gray-100 dark:border-brand-darkBorder p-8 shadow-sm text-left">
        <h3 className="text-lg font-black text-gray-900 dark:text-brand-darkText uppercase tracking-tight mb-8 flex items-center">
            <div className="w-1 h-6 bg-brand-orange rounded-full mr-3" />
            {title}
        </h3>
        <div className="space-y-6">
            {children}
        </div>
    </div>
);

const DetailRow = ({ label, value, icon: Icon }) => (
    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-brand-darkBg/30 rounded-2xl group transition-colors hover:bg-orange-50/50 dark:hover:bg-brand-orange/5">
        <div className="flex items-center space-x-4">
            {Icon && (
                <div className="w-10 h-10 bg-white dark:bg-brand-darkCard rounded-xl flex items-center justify-center text-brand-orange shadow-sm">
                    <Icon size={18} />
                </div>
            )}
            <span className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">{label}</span>
        </div>
        <span className="text-sm font-bold text-gray-700 dark:text-brand-darkText">{value}</span>
    </div>
);

const BranchViewMember = () => {
    const navigate = useNavigate();
    const { memberId } = useParams();
    const [member, setMember] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMember = async () => {
            try {
                const token = localStorage.getItem('token');
                const baseUrl = import.meta.env.VITE_API_BASE_URL || `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}`;
                
                const response = await fetch(`${baseUrl}/admin/branch/member/${memberId}?_t=${Date.now()}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await response.json();
                setMember(data);
                setLoading(false);
            } catch (err) {
                console.error('>>> [FETCH_MEMBER_ERROR]', err);
                setLoading(false);
            }
        };
        fetchMember();
    }, [memberId]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="animate-spin text-brand-orange" size={40} />
            </div>
        );
    }

    if (!member || member.error) return <div className="p-20 text-center font-bold uppercase tracking-widest text-gray-400">Member not found</div>;

    return (
        <div className="max-w-4xl mx-auto py-4">
            <header className="mb-10 flex items-center justify-between text-left">
                <div>
                    <h2 className="text-brand-orange text-[10px] font-black uppercase tracking-widest mb-1">Branch Manager</h2>
                    <h1 className="text-3xl font-extrabold text-gray-900 dark:text-brand-darkText">View Profile</h1>
                </div>
                <button
                    onClick={() => navigate('/branch/members')}
                    className="flex items-center space-x-2 bg-gray-50 dark:bg-brand-darkBg/50 text-gray-500 dark:text-gray-400 px-6 py-3 rounded-2xl font-bold hover:text-brand-orange transition-all uppercase text-xs tracking-widest"
                >
                    <ArrowLeft size={16} />
                    <span>Back Registry</span>
                </button>
            </header>

            {/* Profile Overview Card */}
            <div className="bg-white dark:bg-brand-darkCard rounded-[3rem] border border-gray-100 dark:border-brand-darkBorder shadow-sm p-10 mb-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-orange/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />

                <div className="flex flex-col md:flex-row items-center md:items-start md:space-x-10 relative z-10">
                    <div className="w-40 h-40 rounded-[3rem] bg-orange-50 dark:bg-brand-orange/10 border-4 border-white dark:border-brand-darkBorder shadow-xl flex items-center justify-center overflow-hidden mb-6 md:mb-0">
                        <img src={member.avatar || `https://ui-avatars.com/api/?name=${member.name}&background=random`} alt="Avatar" className="w-full h-full object-cover" />
                    </div>

                    <div className="flex-1 text-center md:text-left pt-2">
                        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                            <h2 className="text-4xl font-black text-gray-900 dark:text-brand-darkText tracking-tight">{member.name}</h2>
                            <span className={`px-6 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest w-fit mx-auto md:mx-0 ${member.status === 'Active' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                                {member.status}
                            </span>
                        </div>
                        <div className="flex flex-wrap justify-center md:justify-start gap-3 mb-8">
                            <div className="flex items-center space-x-2 bg-gray-50 dark:bg-brand-darkBg px-4 py-2 rounded-xl text-xs font-bold text-gray-500 dark:text-gray-400">
                                <Shield size={14} className="text-brand-orange" />
                                <span>{member.role} Status</span>
                            </div>
                            <div className="flex items-center space-x-2 bg-gray-50 dark:bg-brand-darkBg px-4 py-2 rounded-xl text-xs font-bold text-gray-500 dark:text-gray-400">
                                <GitBranch size={14} className="text-brand-orange" />
                                <span>{member.relation}</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <StatCard icon={GitBranch} label="Branch" value="Current" />
                            <StatCard icon={Layers} label="Generation" value={member.generation} />
                            <StatCard icon={Calendar} label="Birth Year" value={member.dob} />
                            <StatCard icon={Activity} label="Children" value={member.childrenCount} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-20">
                <InfoSection title="Ancestry Data">
                    <DetailRow label="Gender" value={member.gender} icon={User} />
                    <DetailRow label="Location" value={member.location} icon={MapPin} />
                    <DetailRow label="Relation Type" value={member.relation} icon={GitBranch} />
                    <DetailRow label="Claim Status" value={member.role === 'Member' ? 'Unverified' : 'Verified'} icon={Shield} />
                </InfoSection>

                <InfoSection title="Personal Detail">
                    <DetailRow label="Birth Year" value={member.dob} icon={Calendar} />
                    <DetailRow label="Death Year" value={member.dod || 'N/A'} icon={Calendar} />
                    <DetailRow label="Bio" value={member.bio || 'No biography available'} icon={Info} />
                </InfoSection>
            </div>

        </div>
    );
};

export default BranchViewMember;
