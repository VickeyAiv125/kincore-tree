import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Bell, ShieldCheck, UserCheck, Calendar } from 'lucide-react';
import { useEvent } from '../../context/EventContext';

const SecretSantaLocked = () => {
    const navigate = useNavigate();
    const { eventData } = useEvent();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const adminName = `${user.first_name || 'Family'} ${user.last_name || 'Admin'}`.trim();
    const currentDate = new Date().toLocaleDateString('en-GB');

    const participants = eventData.secretSantaData.participants.filter(p => p.selected);

    return (
        <div className="flex flex-col max-w-4xl mx-auto w-full min-h-[calc(100vh-100px)]">
            <header className="mb-10 text-left">
                <h2 className="text-gray-900 dark:text-brand-darkText text-sm font-bold opacity-30 dark:opacity-40 mb-2 uppercase tracking-widest">Secret Santa / Gift Exchange</h2>
                <h1 className="text-3xl font-extrabold text-gray-900 dark:text-brand-darkText">Exchange Locked</h1>
            </header>

            <div className="space-y-8 flex-1 mb-8">
                {/* Confirmation Card */}
                <div className="bg-white dark:bg-brand-darkCard rounded-3xl border border-gray-100 dark:border-brand-darkBorder shadow-sm p-10 text-center animate-fadeIn">
                    <div className="w-20 h-20 bg-green-50 dark:bg-green-900/10 rounded-full flex items-center justify-center mx-auto mb-6 text-green-500 shadow-lg shadow-green-100 dark:shadow-none">
                        <Lock size={32} />
                    </div>
                    <h2 className="text-2xl font-black text-gray-900 dark:text-brand-darkText mb-3 uppercase tracking-tight">This exchange has been locked</h2>
                    <p className="text-sm font-bold text-gray-400 dark:text-gray-500 max-w-sm mx-auto uppercase tracking-wide">No changes can be made after locking. Participants have been notified of their assignments.</p>

                    <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-6 pt-10 border-t border-gray-50 dark:border-brand-darkBorder text-left">
                        <div className="space-y-1">
                            <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Created by</p>
                            <div className="flex items-center space-x-2">
                                <ShieldCheck size={14} className="text-brand-orange" />
                                <span className="text-xs font-extrabold text-gray-800 dark:text-brand-darkText uppercase">{adminName}</span>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Locked by</p>
                            <div className="flex items-center space-x-2">
                                <UserCheck size={14} className="text-blue-500" />
                                <span className="text-xs font-extrabold text-gray-800 dark:text-brand-darkText uppercase">{adminName}</span>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Locked on</p>
                            <div className="flex items-center space-x-2">
                                <Calendar size={14} className="text-gray-400" />
                                <span className="text-xs font-extrabold text-gray-800 dark:text-brand-darkText uppercase">{currentDate}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Admin Tracking Table */}
                <div className="bg-white dark:bg-brand-darkCard rounded-3xl border border-gray-100 dark:border-brand-darkBorder shadow-sm overflow-hidden">
                    <div className="p-8 border-b border-gray-50 dark:border-brand-darkBorder flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-extrabold text-gray-900 dark:text-brand-darkText mb-1 uppercase tracking-tight">Admin Tracking View</h3>
                            <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Monitor participant status</p>
                        </div>
                        <button className="flex items-center space-x-2 px-6 py-3 bg-brand-orange/10 text-brand-orange rounded-xl text-xs font-extrabold uppercase tracking-widest hover:bg-brand-orange/20 transition-all">
                            <Bell size={14} />
                            <span>Send Reminder</span>
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-[#F3F4F6]/30 dark:bg-brand-darkBg/30">
                                <tr>
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Participant Name</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-brand-darkBorder">
                                {participants.length > 0 ? participants.map((p, i) => (
                                    <tr key={i} className="hover:bg-gray-50/50 dark:hover:bg-brand-darkCard/50 transition-colors">
                                        <td className="px-8 py-5">
                                            <span className="text-sm font-extrabold text-gray-800 dark:text-brand-darkText">{p.name}</span>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center space-x-2">
                                                <div className={`w-2 h-2 rounded-full bg-gray-300`} />
                                                <span className={`text-[11px] font-black uppercase tracking-widest text-gray-400`}>
                                                    Not Viewed
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="2" className="px-8 py-10 text-center text-gray-400 text-xs font-bold uppercase tracking-widest">
                                            No participants in this exchange
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div className="fixed bottom-0 left-0 right-0 sm:static bg-white/90 dark:bg-brand-darkCard/90 backdrop-blur-md sm:bg-transparent border-t border-gray-100 sm:border-none p-4 flex justify-end z-30">
                <button
                    onClick={() => navigate('/events')}
                    className="w-full sm:w-auto px-12 py-4 rounded-2xl font-bold text-white bg-brand-orange shadow-lg shadow-brand-orange/25 hover:bg-orange-600 transition-all uppercase text-sm tracking-widest"
                >
                    Return to Events
                </button>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                .animate-fadeIn { animation: fadeIn 0.3s ease-out forwards; }
            `}} />
        </div>
    );
};

export default SecretSantaLocked;
