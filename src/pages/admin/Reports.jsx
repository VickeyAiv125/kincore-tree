import React, { useState, useEffect } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}`;

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

const ConfigModal = ({ isOpen, onClose, reportTitle, onGenerate }) => {
    const [selectedScope, setSelectedScope] = useState('entire_tree');
    const [scopeValue, setScopeValue] = useState('');
    const [depth, setDepth] = useState(5);
    
    const [branches, setBranches] = useState([]);
    const [persons, setPersons] = useState([]);
    const [loadingData, setLoadingData] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setSelectedScope('entire_tree');
            setScopeValue('');
            setDepth(5);
            fetchSelectionData();
        }
    }, [isOpen]);

    const fetchSelectionData = async () => {
        try {
            setLoadingData(true);
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            let familyId = localStorage.getItem('selected_family_id') || user?.family_id || user?.family_space_id || 'DEFAULT_FAMILY_ID';
            if (familyId === 'undefined' || familyId === 'null') familyId = 'DEFAULT_FAMILY_ID';
            const token = localStorage.getItem('token');

            if (!familyId || familyId === 'DEFAULT_FAMILY_ID') return;

            // Fetch Branches
            const branchRes = await fetch(`${API_BASE}/family-admin/${familyId}/branches`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (branchRes.ok) {
                const bData = await branchRes.json();
                setBranches(bData.branches || []);
            }

            // Fetch Persons
            const personsRes = await fetch(`${API_BASE}/family-admin/${familyId}/persons`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (personsRes.ok) {
                const pData = await personsRes.json();
                setPersons(pData.persons || []);
            }
        } catch (err) {
            console.error('Error fetching selection data for reports:', err);
        } finally {
            setLoadingData(false);
        }
    };

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
                        <div className="grid grid-cols-1 gap-3">
                            {[
                                { id: 'entire_tree', title: 'Entire Clan Tree', desc: 'full clan/family report' },
                                { id: 'specific_branch', title: 'Specific Branch', desc: 'one branch report' },
                                { id: 'selected_persons', title: 'Selected Persons', desc: 'manually selected people report' },
                                { id: 'household', title: 'Household', desc: 'one immediate family/household unit report' }
                            ].map((scope) => (
                                <div key={scope.id} className="flex flex-col gap-2 p-4 bg-gray-50 dark:bg-brand-darkBg rounded-2xl border-2 border-transparent hover:border-brand-orange/20 transition-all">
                                    <label className="flex items-start gap-3 cursor-pointer">
                                        <input 
                                            type="radio" 
                                            name="scope" 
                                            className="accent-brand-orange mt-1" 
                                            checked={selectedScope === scope.id}
                                            onChange={() => { setSelectedScope(scope.id); setScopeValue(''); }}
                                        />
                                        <div className="flex flex-col">
                                            <span className="text-xs font-bold text-gray-700 dark:text-brand-darkText">{scope.title}</span>
                                            <span className="text-[10px] font-medium text-gray-400 dark:text-gray-500 mt-0.5">{scope.desc}</span>
                                        </div>
                                    </label>
                                    
                                    {selectedScope === scope.id && scope.id !== 'entire_tree' && (
                                        <div className="mt-2 ml-7">
                                            {loadingData ? (
                                                <p className="text-[10px] text-gray-400">Loading options...</p>
                                            ) : (
                                                <select 
                                                    className="w-full bg-white dark:bg-brand-darkCard border border-gray-200 dark:border-brand-darkBorder rounded-xl px-3 py-2 text-xs text-gray-700 dark:text-brand-darkText focus:outline-none focus:ring-1 focus:ring-brand-orange"
                                                    value={scopeValue}
                                                    onChange={(e) => setScopeValue(e.target.value)}
                                                >
                                                    <option value="">Select {scope.title.split(' ')[1]}</option>
                                                    {scope.id === 'specific_branch' && branches.map(b => (
                                                        <option key={b.id} value={b.id}>{b.name || b.branch_name}</option>
                                                    ))}
                                                    {(scope.id === 'selected_persons' || scope.id === 'household') && persons.map(p => (
                                                        <option key={p.id} value={p.id}>{p.full_name || `${p.first_name} ${p.last_name}`}</option>
                                                    ))}
                                                </select>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Depth Section */}
                    <div className="space-y-4">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Generation Depth</p>
                        <input 
                            type="range" min="1" max="10" 
                            className="w-full h-2 bg-gray-200 dark:bg-brand-darkBorder rounded-lg appearance-none cursor-pointer accent-brand-orange" 
                            value={depth}
                            onChange={(e) => setDepth(parseInt(e.target.value))}
                        />
                        <div className="flex justify-between text-[10px] font-extrabold text-gray-400 uppercase tracking-widest px-1">
                            <span>1 Gen</span>
                            <span className="text-brand-orange">{depth} Gen</span>
                            <span>10 Gen</span>
                        </div>
                    </div>

                    {/* Configuration Options Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                        {/* INCLUDE Section */}
                        <div className="space-y-4">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Include</p>
                            <div className="space-y-3">
                                {[
                                    { label: 'Spouses', key: 'spouses', default: true },
                                    { label: 'Adopted children', key: 'adopted', default: true },
                                    { label: 'Step-relations', key: 'step', default: true }
                                ].map((item) => (
                                    <label key={item.key} className="flex items-center justify-between cursor-pointer group">
                                        <span className="text-[11px] font-bold text-gray-400 group-hover:text-gray-300 transition-colors">{item.label}</span>
                                        <div className={`w-10 h-5 rounded-full relative transition-colors ${item.default ? 'bg-brand-orange' : 'bg-gray-700'}`}>
                                            <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${item.default ? 'right-1' : 'left-1'}`}></div>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* PRIVACY Section */}
                        <div className="space-y-4">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Privacy Controls</p>
                            <div className="space-y-3">
                                {[
                                    { label: 'Hide minors', key: 'minors', default: false },
                                    { label: 'Hide living', key: 'living', default: false },
                                    { label: 'Hide contact info', key: 'contact', default: false }
                                ].map((item) => (
                                    <label key={item.key} className="flex items-center justify-between cursor-pointer group">
                                        <span className="text-[11px] font-bold text-gray-400 group-hover:text-gray-300 transition-colors">{item.label}</span>
                                        <div className={`w-10 h-5 rounded-full relative transition-colors ${item.default ? 'bg-brand-orange' : 'bg-gray-700'}`}>
                                            <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${item.default ? 'right-1' : 'left-1'}`}></div>
                                        </div>
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
                    <button 
                        onClick={() => onGenerate(reportTitle, { scope: selectedScope, scopeValue, depth })}
                        disabled={selectedScope !== 'entire_tree' && !scopeValue}
                        className="flex-[2] px-8 py-4 bg-brand-orange text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-brand-orange/20 hover:bg-orange-600 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Start Generation
                    </button>
                </div>
            </div>
        </div>
    );
};

const ExportRow = ({ name, date, status, url }) => (
    <tr className="border-b border-gray-50 dark:border-brand-darkBorder last:border-none transition-colors">
        <td className="py-6 px-4 text-xs font-medium text-gray-400 dark:text-gray-500">{name}</td>
        <td className="py-6 px-4 text-xs font-bold text-gray-400 dark:text-gray-600 uppercase tracking-widest">
            {new Date(date).toLocaleDateString()}
        </td>
        <td className="py-6 px-4">
            <span className="bg-orange-100 dark:bg-brand-orange/10 text-brand-orange px-8 py-2 rounded-2xl text-[10px] font-extrabold uppercase tracking-widest">
                {status}
            </span>
        </td>
        <td className="py-6 px-4 text-[10px] font-extrabold text-gray-900 dark:text-brand-darkText uppercase tracking-widest">
            {url ? (
                <a href={url} target="_blank" rel="noopener noreferrer" className="hover:underline">Download</a>
            ) : (
                <span className="opacity-30">N/A</span>
            )}
        </td>
    </tr>
);

const Reports = () => {
    const [configModal, setConfigModal] = useState({ open: false, title: '' });
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [statusModal, setStatusModal] = useState({ show: false, type: 'success', title: '', message: '' });

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            setLoading(true);
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            let familyId = localStorage.getItem('selected_family_id') || user?.family_id || user?.family_space_id || 'DEFAULT_FAMILY_ID';
            if (familyId === 'undefined' || familyId === 'null') familyId = 'DEFAULT_FAMILY_ID';
            const token = localStorage.getItem('token');

            if (!familyId || familyId === 'DEFAULT_FAMILY_ID' && !user?.family_id) {
                setError('No family space identified');
                setLoading(false);
                return;
            }

            const response = await fetch(`${API_BASE}/family-admin/${familyId}/reports`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('Failed to fetch reports');
            const data = await response.json();
            setReports(data.reports || []);
        } catch (err) {
            console.error('Error fetching reports:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleGenerate = async (title, config) => {
        try {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            let familyId = localStorage.getItem('selected_family_id') || user?.family_id || user?.family_space_id || 'DEFAULT_FAMILY_ID';
            if (familyId === 'undefined' || familyId === 'null') familyId = 'DEFAULT_FAMILY_ID';
            const token = localStorage.getItem('token');

            const response = await fetch(`${API_BASE}/family-admin/${familyId}/reports`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    report_type: title.toLowerCase().replace(' ', '_'),
                    config: config || { scope: 'entire_tree', depth: 5 }
                })
            });

            if (!response.ok) throw new Error('Failed to initiate generation');
            setStatusModal({
                show: true,
                type: 'success',
                title: 'Generation Started',
                message: 'Your report is being compiled and will appear in the archive soon.'
            });
            setConfigModal({ open: false, title: '' });
            fetchReports();
        } catch (err) {
            setStatusModal({
                show: true,
                type: 'error',
                title: 'Generation Failed',
                message: err.message || 'Error generating report'
            });
        }
    };

    const openConfig = (title) => setConfigModal({ open: true, title });
    const closeConfig = () => setConfigModal({ open: false, title: '' });

    return (
        <div className="flex flex-col text-left">
            <header className="mb-10 sm:mb-12">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-brand-darkText mb-8 sm:mb-12 leading-tight">Reports & Exports</h1>

                <div className="bg-white dark:bg-brand-darkCard rounded-[2.5rem] border border-gray-100 dark:border-brand-darkBorder shadow-sm overflow-hidden mb-16 transition-colors">
                    <ReportCard
                        title="Descendant PDF Generator"
                        description="Generate a PDF document detailing all descendants in the family tree with customizable depth."
                        buttonLabel="Generate"
                        image="https://placehold.co/400x300/f97316/white?text=PDF+Report"
                        onClick={() => openConfig('Descendant Report')}
                    />
                    <ReportCard
                        title="Ancestor Report"
                        description="Trace the lineage backwards to find all direct ancestors for any selected person."
                        buttonLabel="Generate"
                        image="https://placehold.co/400x300/f97316/white?text=Ancestor+Report"
                        onClick={() => openConfig('Ancestor Report')}
                    />
                    <ReportCard
                        title="Album & Book Builder"
                        description="Combine reports, photos, and stories into a formatted PDF book with a custom cover."
                        buttonLabel="Configure Book"
                        image="https://placehold.co/400x300/f97316/white?text=Album+Builder"
                        onClick={() => openConfig('Album & Book Builder')}
                    />
                    <ReportCard
                        title="Branch Growth Report"
                        description="Analyze core metrics and growth trends for specific branches over time."
                        buttonLabel="View Stats"
                        image="https://placehold.co/400x300/f97316/white?text=Growth+Report"
                        onClick={() => openConfig('Branch Growth Report')}
                    />
                </div>

                <h3 className="text-xl font-bold text-gray-800 dark:text-brand-darkText mb-8 sm:mb-10">Recent Exports</h3>
                <div className="bg-white dark:bg-brand-darkCard rounded-3xl border border-gray-100 dark:border-brand-darkBorder shadow-sm overflow-hidden p-6 md:p-8 transition-colors">
                    {loading ? (
                        <div className="py-20 text-center">
                            <div className="w-10 h-10 border-4 border-brand-orange border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Fetching Archive...</p>
                        </div>
                    ) : error ? (
                        <div className="py-20 text-center">
                            <p className="text-red-500 font-bold">{error}</p>
                            <button onClick={fetchReports} className="mt-4 text-brand-orange font-bold underline">Retry</button>
                        </div>
                    ) : (
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
                                <tbody className="divide-y divide-gray-50 dark:divide-brand-darkBorder/30">
                                    {reports.map((r, i) => (
                                        <ExportRow key={r.id || i} name={r.report_type} date={r.created_at} status={r.status} url={r.file_url} />
                                    ))}
                                    {reports.length === 0 && (
                                        <tr>
                                            <td colSpan="4" className="py-20 text-center text-gray-400 font-bold uppercase tracking-widest text-xs">No generated reports found</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </header>
            <ConfigModal
                isOpen={configModal.open}
                onClose={closeConfig}
                reportTitle={configModal.title}
                onGenerate={handleGenerate}
            />

            {/* Feedback Modal */}
            {statusModal.show && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-brand-darkCard rounded-[2.5rem] p-8 max-w-sm w-full shadow-2xl border border-gray-100 dark:border-brand-darkBorder animate-in zoom-in duration-300">
                        <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 ${
                            statusModal.type === 'success' 
                                ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500' 
                                : 'bg-rose-50 dark:bg-rose-500/10 text-rose-500'
                        }`}>
                            {statusModal.type === 'success' ? (
                                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                            ) : (
                                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            )}
                        </div>
                        <h3 className="text-xl font-black text-gray-900 dark:text-brand-darkText text-center mb-2 uppercase tracking-tight">
                            {statusModal.title}
                        </h3>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 text-center mb-8 leading-relaxed px-4">
                            {statusModal.message}
                        </p>
                        <button
                            onClick={() => setStatusModal({ ...statusModal, show: false })}
                            className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-lg active:scale-95 ${
                                statusModal.type === 'success'
                                    ? 'bg-brand-orange text-white shadow-brand-orange/25 hover:bg-orange-600'
                                    : 'bg-gray-900 dark:bg-brand-darkBorder text-white hover:bg-black'
                            }`}
                        >
                            Continue
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Reports;
