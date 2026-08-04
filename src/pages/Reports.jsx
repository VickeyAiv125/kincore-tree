import React from 'react';

const ReportCard = ({ title, description, buttonLabel, image, onClick }) => (
    <div className="flex flex-col md:flex-row items-center justify-between p-8 group transition-colors border-b border-gray-50 dark:border-brand-darkBorder last:border-none">
        <div className="flex-1 text-left md:mr-8 mb-6 md:mb-0">
            <h4 className="text-sm font-extrabold text-gray-900 dark:text-brand-darkText mb-2 uppercase tracking-tight">{title}</h4>
            <p className="text-xs font-medium text-gray-400 dark:text-gray-500 mb-6 leading-relaxed max-w-sm">{description}</p>
            <button
                onClick={onClick}
                className="bg-orange-50 dark:bg-brand-orange/10 text-brand-orange px-8 py-2.5 rounded-2xl text-[10px] font-extrabold uppercase tracking-widest hover:bg-orange-100 dark:hover:bg-brand-orange/20 transition-colors"
            >
                {buttonLabel}
            </button>
        </div>
        <div className="w-full md:w-64 h-40 rounded-2xl overflow-hidden bg-gray-50 dark:bg-brand-darkBg flex items-center justify-center p-4 group-hover:shadow-md dark:group-hover:shadow-brand-orange/5 transition-all">
            <img src={image} alt={title} className="w-full h-full object-contain" />
        </div>
    </div>
);

const ConfigModal = ({ isOpen, onClose, reportTitle }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative bg-white dark:bg-brand-darkCard w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100 dark:border-brand-darkBorder p-8 sm:p-10 animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-center mb-8">
                    <h3 className="text-lg font-black text-gray-900 dark:text-brand-darkText uppercase tracking-tighter">Configure: {reportTitle}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <div className="space-y-8 max-h-[60vh] overflow-y-auto pr-4 no-scrollbar">
                    {/* Scope Section */}
                    <div className="space-y-4">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Report Scope</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {['Entire ClanTree', 'Specific Branch', 'Selected Persons', 'Household'].map((scope) => (
                                <label key={scope} className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-brand-darkBg rounded-2xl cursor-pointer border-2 border-transparent hover:border-brand-orange/20 transition-all">
                                    <input type="radio" name="scope" className="accent-brand-orange" defaultChecked={scope === 'Entire ClanTree'} />
                                    <span className="text-xs font-bold text-gray-700 dark:text-brand-darkText">{scope}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Depth Section */}
                    <div className="space-y-4">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Generation Depth</p>
                        <input type="range" min="1" max="10" className="w-full h-2 bg-gray-200 dark:bg-brand-darkBorder rounded-lg appearance-none cursor-pointer accent-brand-orange" />
                        <div className="flex justify-between text-[10px] font-extrabold text-gray-400 uppercase tracking-widest px-1">
                            <span>1 Gen</span>
                            <span>5 Gen</span>
                            <span>10 Gen</span>
                        </div>
                    </div>

                    {/* Settings Section */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Include</p>
                            <div className="space-y-3">
                                {['Spouses', 'Adopted children', 'Step-relations'].map((item) => (
                                    <label key={item} className="flex items-center gap-3 cursor-pointer group">
                                        <div className="relative">
                                            <input type="checkbox" className="sr-only peer" defaultChecked />
                                            <div className="w-10 h-6 bg-gray-200 dark:bg-brand-darkBorder rounded-full peer peer-checked:bg-brand-orange transition-colors"></div>
                                            <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-all peer-checked:translate-x-4"></div>
                                        </div>
                                        <span className="text-[11px] font-bold text-gray-600 dark:text-gray-400 group-hover:text-gray-900 transition-colors">{item}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-4">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Privacy Controls</p>
                            <div className="space-y-3">
                                {['Hide minors', 'Hide living', 'Hide contact info'].map((item) => (
                                    <label key={item} className="flex items-center gap-3 cursor-pointer group">
                                        <div className="relative">
                                            <input type="checkbox" className="sr-only peer" />
                                            <div className="w-10 h-6 bg-gray-200 dark:bg-brand-darkBorder rounded-full peer peer-checked:bg-brand-orange transition-colors"></div>
                                            <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-all peer-checked:translate-x-4"></div>
                                        </div>
                                        <span className="text-[11px] font-bold text-gray-600 dark:text-gray-400 group-hover:text-gray-900 transition-colors">{item}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-10 flex gap-4">
                    <button onClick={onClose} className="flex-1 px-8 py-4 bg-gray-100 dark:bg-brand-darkBorder text-gray-500 dark:text-gray-400 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-200 transition-colors">
                        Cancel
                    </button>
                    <button className="flex-[2] px-8 py-4 bg-brand-orange text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-brand-orange/20 hover:bg-orange-600 transition-all active:scale-95">
                        Start Generation
                    </button>
                </div>
            </div>
        </div>
    );
};

const ExportRow = ({ name, date, status }) => (
    <tr className="border-b border-gray-50 dark:border-brand-darkBorder last:border-none transition-colors">
        <td className="py-6 px-4 text-xs font-medium text-gray-400 dark:text-gray-500">{name}</td>
        <td className="py-6 px-4 text-xs font-bold text-gray-400 dark:text-gray-600 uppercase tracking-widest">{date}</td>
        <td className="py-6 px-4">
            <span className="bg-orange-100 dark:bg-brand-orange/10 text-brand-orange px-8 py-2 rounded-2xl text-[10px] font-extrabold uppercase tracking-widest">
                {status}
            </span>
        </td>
        <td className="py-6 px-4 text-[10px] font-extrabold text-gray-900 dark:text-brand-darkText uppercase tracking-widest cursor-pointer hover:underline">
            Download
        </td>
    </tr>
);

const Reports = () => {
    const [configModal, setConfigModal] = React.useState({ open: false, title: '' });

    const openConfig = (title) => setConfigModal({ open: true, title });
    const closeConfig = () => setConfigModal({ open: false, title: '' });

    const exports = [
        { name: 'Ancestor Report - Samuel Harrison', date: '2024-03-01', status: 'Completed' },
        { name: 'Descendant Tree - Carter Family', date: '2024-01-15', status: 'Completed' },
        { name: 'Branch Growth - Carter - Ethan\'s Branch', date: '2024-01-10', status: 'Completed' },
        { name: 'Financial Audit - Carter Family', date: '2023-12-20', status: 'Completed' },
    ];

    return (
        <div className="flex flex-col text-left">
            <header className="mb-10 sm:mb-12">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-brand-darkText mb-8 sm:mb-12 leading-tight">Reports & Exports</h1>

                <div className="bg-white dark:bg-brand-darkCard rounded-[2.5rem] border border-gray-100 dark:border-brand-darkBorder shadow-sm overflow-hidden mb-16 transition-colors">
                    <ReportCard
                        title="Descendant PDF Generator"
                        description="Generate a PDF document detailing all descendants in the family tree with customizable depth."
                        buttonLabel="Generate"
                        image="file:///C:/Users/uvdsg/.gemini/antigravity/brain/6332a07c-dddc-4f49-b611-f36a751f27be/family_tree_minimal_1_1770179753799.png"
                        onClick={() => openConfig('Descendant Report')}
                    />
                    <ReportCard
                        title="Ancestor Report"
                        description="Trace the lineage backwards to find all direct ancestors for any selected person."
                        buttonLabel="Generate"
                        image="file:///C:/Users/uvdsg/.gemini/antigravity/brain/6332a07c-dddc-4f49-b611-f36a751f27be/family_tree_detailed_1_1770179768087.png"
                        onClick={() => openConfig('Ancestor Report')}
                    />
                    <ReportCard
                        title="Album & Book Builder"
                        description="Combine reports, photos, and stories into a formatted PDF book with a custom cover."
                        buttonLabel="Configure Book"
                        image="file:///C:/Users/uvdsg/.gemini/antigravity/brain/6332a07c-dddc-4f49-b611-f36a751f27be/family_portraits_grid_1770179154905.png"
                        onClick={() => openConfig('Album Builder')}
                    />
                    <ReportCard
                        title="Branch Growth Report"
                        description="Analyze core metrics and growth trends for specific branches over time."
                        buttonLabel="View Stats"
                        image="file:///C:/Users/uvdsg/.gemini/antigravity/brain/6332a07c-dddc-4f49-b611-f36a751f27be/family_tree_minimal_1_1770179753799.png"
                        onClick={() => openConfig('Branch Growth Report')}
                    />
                </div>

                <h3 className="text-xl font-bold text-gray-800 dark:text-brand-darkText mb-8 sm:mb-10">Recent Exports</h3>
                <div className="bg-white dark:bg-brand-darkCard rounded-3xl border border-gray-100 dark:border-brand-darkBorder shadow-sm overflow-hidden p-6 md:p-8 transition-colors">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left min-w-[700px]">
                            <thead>
                                <tr className="border-b border-gray-100 dark:border-brand-darkBorder text-[10px] font-extrabold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                                    <th className="pb-6 px-4">Document Name</th>
                                    <th className="pb-6 px-4">Date</th>
                                    <th className="pb-6 px-4">Status</th>
                                    <th className="pb-6 px-4">Download</th>
                                </tr>
                            </thead>
                            <tbody>
                                {exports.map((e, i) => (
                                    <ExportRow key={i} {...e} />
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                <ConfigModal
                    isOpen={configModal.open}
                    onClose={closeConfig}
                    reportTitle={configModal.title}
                />
            </header>
        </div>
    );
};

export default Reports;
