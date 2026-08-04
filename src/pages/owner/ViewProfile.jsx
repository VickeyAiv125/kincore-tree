import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Shield, GitBranch, Layers, Activity, Calendar, MapPin, X, ArrowLeft, Mail, Phone, Info } from 'lucide-react';

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

const ViewProfile = () => {
    const navigate = useNavigate();

    return (
        <div className="max-w-4xl mx-auto py-4">
            <header className="mb-10 flex items-center justify-between text-left">
                <div>
                    <h2 className="text-brand-orange text-[10px] font-black uppercase tracking-widest mb-1">Member Registry</h2>
                    <h1 className="text-3xl font-extrabold text-gray-900 dark:text-brand-darkText">Member Profile</h1>
                </div>
                <button
                    onClick={() => navigate('/member-registry')}
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
                        <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Owen" alt="Avatar" className="w-full h-full object-cover" />
                    </div>

                    <div className="flex-1 text-center md:text-left pt-2">
                        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                            <h2 className="text-4xl font-black text-gray-900 dark:text-brand-darkText tracking-tight">Owen Harper</h2>
                            <span className="bg-brand-orange text-white px-6 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest w-fit mx-auto md:mx-0">
                                Active Member
                            </span>
                        </div>
                        <div className="flex flex-wrap justify-center md:justify-start gap-3 mb-8">
                            <div className="flex items-center space-x-2 bg-gray-50 dark:bg-brand-darkBg px-4 py-2 rounded-xl text-xs font-bold text-gray-500 dark:text-gray-400">
                                <Mail size={14} className="text-brand-orange" />
                                <span>owen.harper@example.com</span>
                            </div>
                            <div className="flex items-center space-x-2 bg-gray-50 dark:bg-brand-darkBg px-4 py-2 rounded-xl text-xs font-bold text-gray-500 dark:text-gray-400">
                                <Phone size={14} className="text-brand-orange" />
                                <span>+44 7700 900077</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <StatCard icon={GitBranch} label="Branch" value="North" />
                            <StatCard icon={Layers} label="Generation" value="2nd Gen" />
                            <StatCard icon={Calendar} label="Member Since" value="2022" />
                            <StatCard icon={Activity} label="Last Active" value="Today" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-20">
                <InfoSection title="Ancestry Data">
                    <DetailRow label="Parent Name" value="Arthur Harper" icon={User} />
                    <DetailRow label="Lineage Root" value="The Great Harper Clan" icon={GitBranch} />
                    <DetailRow label="Claim Status" value="Verified" icon={Shield} />
                    <DetailRow label="Authority" value="Standard" icon={Shield} />
                </InfoSection>

                <InfoSection title="Personal Detail">
                    <DetailRow label="Date of Birth" value="May 12, 1990" icon={Calendar} />
                    <DetailRow label="Place of Birth" value="London, UK" icon={MapPin} />
                    <DetailRow label="Occupation" value="Digital Architect" icon={Info} />
                    <DetailRow label="Visibility" value="Family Only" icon={Eye} />
                </InfoSection>
            </div>

        </div>
    );
};

const Eye = ({ size, className }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
        <circle cx="12" cy="12" r="3" />
    </svg>
);

export default ViewProfile;
