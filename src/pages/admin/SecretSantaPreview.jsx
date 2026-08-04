import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, ChevronLeft, Shuffle, Filter } from 'lucide-react';
import { useEvent } from '../../context/EventContext';

const SecretSantaPreview = () => {
    const navigate = useNavigate();
    const { eventData, updateEventData } = useEvent();
    const [pairings, setPairings] = React.useState([]);

    const generatePairings = React.useCallback(() => {
        const participants = eventData.secretSantaData.participants.filter(p => p.selected);
        if (participants.length < 2) return;

        const shuffled = [...participants].sort(() => Math.random() - 0.5);
        const newPairings = shuffled.map((p, i) => ({
            giver_id: p.id,
            from: p.name,
            receiver_id: shuffled[(i + 1) % shuffled.length].id,
            to: shuffled[(i + 1) % shuffled.length].name
        }));
        setPairings(newPairings);
    }, [eventData.secretSantaData.participants]);

    React.useEffect(() => {
        if (eventData.secretSantaData.pairings?.length > 0) {
            setPairings(eventData.secretSantaData.pairings);
        } else {
            generatePairings();
        }
    }, [generatePairings, eventData.secretSantaData.pairings]);

    const handleConfirmAndLock = () => {
        updateEventData({
            secretSantaData: {
                ...eventData.secretSantaData,
                pairings,
                isLocked: true
            }
        });
        navigate('/events/secret-santa/locked');
    };

    return (
        <div className="flex flex-col max-w-4xl mx-auto w-full min-h-[calc(100vh-100px)]">
            <header className="mb-10 text-left">
                <h2 className="text-gray-900 dark:text-brand-darkText text-sm font-bold opacity-30 dark:opacity-40 mb-2 uppercase tracking-widest">Secret Santa / Gift Exchange</h2>
                <h1 className="text-3xl font-extrabold text-gray-900 dark:text-brand-darkText">Preview Gift Assignments</h1>
            </header>

            <div className="bg-white dark:bg-brand-darkCard rounded-3xl border border-gray-100 dark:border-brand-darkBorder shadow-sm p-8 flex-1 mb-8">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-lg font-extrabold text-gray-900 dark:text-brand-darkText">Current Pairings</h3>
                    <div className="flex space-x-3">
                        <button className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-brand-darkBg rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-200 transition-all uppercase tracking-widest cursor-not-allowed">
                            <Filter size={14} />
                            <span>Exclude Pairings</span>
                        </button>
                        <button 
                            onClick={generatePairings}
                            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-brand-darkBg rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-200 transition-all uppercase tracking-widest hover:text-brand-orange"
                        >
                            <Shuffle size={14} />
                            <span>Re-shuffle</span>
                        </button>
                    </div>
                </div>

                <div className="space-y-4">
                    {pairings.length > 0 ? pairings.map((pairing, index) => (
                        <div key={index} className="flex items-center justify-between p-5 bg-gray-50/50 dark:bg-brand-darkBg/30 rounded-2xl border border-gray-100 dark:border-brand-darkBorder transition-all hover:bg-white dark:hover:bg-brand-darkBg/50 group">
                            <div className="flex items-center space-x-4">
                                <div className="w-10 h-10 rounded-full bg-brand-orange/10 flex items-center justify-center text-brand-orange font-bold">
                                    {pairing.from[0]}
                                </div>
                                <span className="text-sm font-extrabold text-gray-900 dark:text-brand-darkText">{pairing.from}</span>
                            </div>

                            <div className="flex-1 flex items-center justify-center">
                                <div className="h-px bg-gray-200 dark:bg-brand-darkBorder flex-1 mx-4 relative">
                                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 border-t-2 border-r-2 border-gray-300 dark:border-gray-600 rotate-45" />
                                </div>
                            </div>

                            <div className="flex items-center space-x-4">
                                <span className="text-sm font-extrabold text-gray-900 dark:text-brand-darkText text-right">{pairing.to}</span>
                                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 font-bold">
                                    {pairing.to[0]}
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div className="py-20 text-center">
                            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">No participants selected for the exchange</p>
                        </div>
                    )}
                </div>

                <div className="mt-10 p-6 bg-blue-50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-900/20 text-left">
                    <p className="text-sm font-bold text-blue-800 dark:text-blue-400 mb-1">Pairing Logic</p>
                    <p className="text-xs text-blue-600 dark:text-blue-500 font-medium">Assignments are randomized based on selected participants. Admin can manually exclude specific pairings if needed.</p>
                </div>
            </div>

            <div className="fixed bottom-0 left-0 right-0 sm:static bg-white/90 dark:bg-brand-darkCard/90 backdrop-blur-md sm:bg-transparent border-t border-gray-100 sm:border-none p-4 flex flex-col-reverse sm:flex-row justify-end gap-3 z-30">
                <button
                    onClick={() => navigate('/events/create')}
                    className="w-full sm:w-auto px-10 py-4 rounded-2xl font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 transition-all uppercase text-sm tracking-widest flex items-center justify-center"
                >
                    <ChevronLeft size={18} className="mr-2" />
                    Back
                </button>
                <button
                    onClick={handleConfirmAndLock}
                    className="w-full sm:w-auto px-12 py-4 rounded-2xl font-bold text-white bg-brand-orange shadow-lg shadow-brand-orange/25 hover:bg-orange-600 transition-all uppercase text-sm tracking-widest"
                >
                    Confirm & Lock Exchange
                </button>
            </div>
        </div>
    );
};

export default SecretSantaPreview;
