import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, UserCheck, Baby, Globe, MapPin, Trash2 } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}`;

const TimelineItem = ({ point, onDelete, branchesMap = {}, personsMap = {}, historyMap = {} }) => {
    // Determine the date display string
    let dateStr = 'Unknown Year';
    if (point.date_type === 'Exact Date' && point.date_value) {
        dateStr = new Date(point.date_value).getFullYear();
    } else if (point.date_type === 'Date Range' && point.date_range_start) {
        const startYr = new Date(point.date_range_start).getFullYear();
        const endYr = point.date_range_end ? new Date(point.date_range_end).getFullYear() : 'Present';
        dateStr = `${startYr} - ${endYr}`;
    } else if (point.date_type === 'Approximate' && point.approximate_period) {
        dateStr = point.approximate_period;
    }

    return (
        <div className="flex items-start space-x-6 relative pb-8 group">
            <div className="absolute left-[11px] top-6 bottom-0 w-0.5 bg-gray-100 dark:bg-brand-darkBorder group-last:hidden transition-colors" />
            <div className="z-10 w-6 h-6 rounded-full border-2 border-brand-orange bg-white dark:bg-brand-darkCard flex items-center justify-center p-1.5 transition-colors">
                <svg className="w-full h-full text-brand-orange" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            </div>
            <div className="text-left w-full bg-white dark:bg-brand-darkCard border border-gray-100 dark:border-brand-darkBorder p-5 rounded-2xl shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-2">
                    <div>
                        <span className="text-[10px] font-black text-brand-orange uppercase tracking-wider block mb-0.5">{dateStr}</span>
                        <h4 className="text-sm font-extrabold text-gray-900 dark:text-brand-darkText uppercase tracking-widest">{point.title || 'Migration Event'}</h4>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-[9px] font-black bg-orange-100 dark:bg-brand-orange/20 text-brand-orange px-2.5 py-1 rounded-lg uppercase tracking-wider">
                            {point.reason || 'Relocation'}
                        </span>
                        {onDelete && (
                            <button 
                                onClick={() => onDelete(point.id)}
                                className="text-gray-300 hover:text-red-500 transition-colors p-1.5 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg"
                                title="Delete Point"
                            >
                                <Trash2 size={14} />
                            </button>
                        )}
                    </div>
                </div>
                <div className="flex flex-wrap gap-x-6 gap-y-2 mb-3 pt-2 border-t border-dashed border-gray-50 dark:border-brand-darkBorder">
                    <div className="flex items-center space-x-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        <span>Origin:</span>
                        <span className="text-gray-600 dark:text-gray-300">{point.from_location}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        <span>Destination:</span>
                        <span className="text-gray-600 dark:text-gray-300">{point.to_location}</span>
                    </div>
                </div>
                <p className="text-xs text-gray-400 dark:text-gray-500 font-medium leading-relaxed mb-4">{point.description || 'Details of this family journey point.'}</p>
                
                {/* Media Attachments */}
                {point.media && Array.isArray(point.media) && point.media.length > 0 && (
                    <div className="mb-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {point.media.map((med, idx) => {
                            const url = typeof med === 'string' ? med : med.url;
                            const name = typeof med === 'string' ? `Attachment ${idx + 1}` : (med.name || `Attachment ${idx + 1}`);
                            const type = typeof med === 'string' ? 'image' : (med.type || 'image');
                            return (
                                <a
                                    key={idx}
                                    href={url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center space-x-2.5 p-2 bg-gray-50 dark:bg-brand-darkBg hover:bg-orange-50/50 dark:hover:bg-brand-orange/10 rounded-xl border border-gray-100 dark:border-brand-darkBorder transition-all group/media cursor-pointer"
                                >
                                    {type?.startsWith('image') ? (
                                        <img src={url} className="w-10 h-10 object-cover rounded-lg group-hover/media:scale-105 transition-transform" alt={name} />
                                    ) : (
                                        <div className="w-10 h-10 bg-orange-100 dark:bg-brand-orange/20 rounded-lg flex items-center justify-center text-brand-orange">
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2-2z" />
                                            </svg>
                                        </div>
                                    )}
                                    <span className="text-[10px] font-bold text-gray-600 dark:text-brand-darkText truncate max-w-[100px] uppercase tracking-wider">{name}</span>
                                </a>
                            );
                        })}
                    </div>
                )}
                
                {/* Linked Entities */}
                {(point.branches?.length > 0 || point.persons?.length > 0 || point.history_chapters?.length > 0) && (
                    <div className="flex flex-wrap gap-2 pt-3 border-t border-dashed border-gray-100 dark:border-brand-darkBorder">
                        {point.branches?.map(bid => branchesMap[bid] && (
                            <span key={bid} className="text-[9px] font-black bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded uppercase tracking-wider">
                                Branch: {branchesMap[bid]}
                            </span>
                        ))}
                        {point.persons?.map(pid => personsMap[pid] && (
                            <span key={pid} className="text-[9px] font-black bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded uppercase tracking-wider">
                                Person: {personsMap[pid]}
                            </span>
                        ))}
                        {point.history_chapters?.map(hid => historyMap[hid] && (
                            <span key={hid} className="text-[9px] font-black bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 px-2 py-0.5 rounded uppercase tracking-wider">
                                Chapter: {historyMap[hid]}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

const MigrationMap = () => {
    const navigate = useNavigate();
    const [migrationPoints, setMigrationPoints] = useState([]);
    const [branchesMap, setBranchesMap] = useState({});
    const [personsMap, setPersonsMap] = useState({});
    const [historyMap, setHistoryMap] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [statusModal, setStatusModal] = useState({ show: false, type: 'success', title: '', message: '' });

    useEffect(() => {
        fetchMigrationData();
    }, []);

    const fetchMigrationData = async () => {
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

            const [response, branchesRes, personsRes, historyRes] = await Promise.all([
                fetch(`${API_BASE}/family-admin/${familyId}/migration-map`, { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch(`${API_BASE}/family-admin/${familyId}/branches`, { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch(`${API_BASE}/family-admin/${familyId}/persons`, { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch(`${API_BASE}/history?family_space_id=${familyId}`, { headers: { 'Authorization': `Bearer ${token}` } })
            ]);

            if (branchesRes.ok) {
                const bData = await branchesRes.json();
                const map = {};
                (bData.branches || []).forEach(b => { map[b.id] = b.name; });
                setBranchesMap(map);
            }
            if (personsRes.ok) {
                const pData = await personsRes.json();
                const map = {};
                (pData.persons || []).forEach(p => { map[p.id] = p.full_name; });
                setPersonsMap(map);
            }
            if (historyRes.ok) {
                const hData = await historyRes.json();
                const map = {};
                (hData || []).forEach(h => { map[h.id] = h.title; });
                setHistoryMap(map);
            }

            if (!response.ok) throw new Error('Failed to fetch migration data');
            const data = await response.json();
            setMigrationPoints(data.migration_data || []);
        } catch (err) {
            console.error('Error fetching migration data:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (pointId) => {
        if (!confirm('Are you sure you want to delete this migration point?')) return;

        try {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const familyId = localStorage.getItem('selected_family_id') || user?.family_id || user?.family_space_id;
            const token = localStorage.getItem('token');

            const response = await fetch(`${API_BASE}/family-admin/${familyId}/migration-map/${pointId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('Failed to delete migration point');

            setStatusModal({
                show: true,
                type: 'success',
                title: 'Deleted Successfully',
                message: 'The migration point was removed.'
            });
            fetchMigrationData();
        } catch (err) {
            setStatusModal({
                show: true,
                type: 'error',
                title: 'Deletion Failed',
                message: err.message
            });
        }
    };

    // Calculate plotting coordinates in our 800x400 map box
    const getCoords = (lat, lng) => {
        // Map longitude [-180, 180] to [0, 800]
        const x = (parseFloat(lng) + 180) * (800 / 360);
        // Map latitude [-90, 90] to [400, 0] (y goes down in SVG)
        const y = (90 - parseFloat(lat)) * (400 / 180);
        return { x, y };
    };

    // Get nodes that have coordinates
    const plottedNodes = migrationPoints
        .map(p => {
            const fromValid = p.from_lat && p.from_lng;
            const toValid = p.to_lat && p.to_lng;
            return {
                ...p,
                fromPt: fromValid ? getCoords(p.from_lat, p.from_lng) : null,
                toPt: toValid ? getCoords(p.to_lat, p.to_lng) : null
            };
        })
        .filter(p => p.fromPt || p.toPt);

    return (
        <div className="flex flex-col text-left">
            <header className="mb-10 sm:mb-12">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-brand-darkText mb-4 leading-tight tracking-tighter italic">Migration Map & Journey</h1>
                <p className="text-sm font-medium text-gray-400 dark:text-gray-500 uppercase tracking-widest text-[10px]">Trace the ancestral movements across generations</p>
            </header>

            {/* Map Integration */}
            <section className="mb-16">
                <div className="relative w-full h-[400px] bg-gray-900 dark:bg-brand-darkCard rounded-[2.5rem] border border-gray-800 overflow-hidden group shadow-xl">
                    {/* Dark grid background */}
                    <div className="absolute inset-0 opacity-10 pointer-events-none grayscale contrast-125">
                        <div className="w-full h-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:25px_25px]"></div>
                    </div>

                    {/* Clean Simple World Outline Drawing in Map Background */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-30 select-none pointer-events-none">
                        <Globe size={180} className="text-white/10" />
                    </div>

                    <div className="absolute inset-0">
                        {loading ? (
                            <div className="absolute inset-0 flex items-center justify-center text-center">
                                <div>
                                    <div className="w-10 h-10 border-4 border-brand-orange border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                    <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Plotting Coordinates...</p>
                                </div>
                            </div>
                        ) : plottedNodes.length > 0 ? (
                            <svg className="w-full h-full p-8" viewBox="0 0 800 400" xmlns="http://www.w3.org/2000/svg">
                                {/* Defs for custom gradients and markers */}
                                <defs>
                                    <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                                        <path d="M 0 0 L 10 5 L 0 10 z" fill="#f97316" />
                                    </marker>
                                </defs>
                                
                                {/* Draw flight/migration path vectors */}
                                {plottedNodes.map((p, idx) => {
                                    if (p.fromPt && p.toPt) {
                                        // Draw smooth quadratic bezier curve between origin and destination
                                        const midX = (p.fromPt.x + p.toPt.x) / 2;
                                        const midY = Math.min(p.fromPt.y, p.toPt.y) - 60; // arch curvature
                                        return (
                                            <path
                                                key={`path-${idx}`}
                                                d={`M ${p.fromPt.x} ${p.fromPt.y} Q ${midX} ${midY} ${p.toPt.x} ${p.toPt.y}`}
                                                fill="none"
                                                stroke="#f97316"
                                                strokeWidth="2.5"
                                                strokeDasharray="6 4"
                                                markerEnd="url(#arrow)"
                                                className="opacity-80 hover:opacity-100 transition-opacity"
                                            />
                                        );
                                    }
                                    return null;
                                })}

                                {/* Draw location pins / nodes */}
                                {plottedNodes.map((p, idx) => (
                                    <g key={`nodes-${idx}`} className="group/node">
                                        {p.fromPt && (
                                            <>
                                                <circle cx={p.fromPt.x} cy={p.fromPt.y} r="10" fill="#f97316" className="opacity-25" />
                                                <circle cx={p.fromPt.x} cy={p.fromPt.y} r="5" fill="#f97316" />
                                                <text x={p.fromPt.x + 8} y={p.fromPt.y + 4} className="fill-gray-400 text-[8px] font-black uppercase tracking-widest pointer-events-none select-none">
                                                    {p.from_location.substring(0, 12)}
                                                </text>
                                            </>
                                        )}
                                        {p.toPt && (
                                            <>
                                                <circle cx={p.toPt.x} cy={p.toPt.y} r="12" fill="#ef4444" className="opacity-20" />
                                                <circle cx={p.toPt.x} cy={p.toPt.y} r="6" fill="#ef4444" />
                                                <text x={p.toPt.x + 8} y={p.toPt.y + 4} className="fill-white text-[8px] font-black uppercase tracking-widest pointer-events-none select-none">
                                                    {p.to_location.substring(0, 12)}
                                                </text>
                                            </>
                                        )}
                                    </g>
                                ))}
                            </svg>
                        ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
                                <Globe size={48} className="text-brand-orange/40 mb-4" />
                                <h3 className="text-xs font-black text-white uppercase tracking-[0.3em] mb-2">No Plot-ready Data</h3>
                                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest max-w-xs">Plotted nodes appear on the map when latitude & longitude coordinates are set.</p>
                            </div>
                        )}
                    </div>

                    <div className="absolute bottom-6 left-6 flex flex-col gap-2">
                        <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-4 py-2 rounded-xl border border-gray-800 shadow-xl">
                            <div className="w-2 h-2 rounded-full bg-brand-orange shadow-[0_0_8px_rgba(249,115,22,0.5)]"></div>
                            <span className="text-[9px] font-black text-brand-darkText uppercase tracking-widest">
                                {migrationPoints.length} Points Registered
                            </span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Timeline Section */}
            <section className="max-w-3xl">
                <h3 className="text-xl font-bold text-gray-800 dark:text-brand-darkText mb-8 flex items-center gap-2">
                    <MapPin size={20} className="text-brand-orange" />
                    Chronological Journey
                </h3>
                
                {loading ? (
                    <div className="space-y-8">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="animate-pulse flex gap-6">
                                <div className="w-6 h-6 bg-gray-100 dark:bg-brand-darkBg rounded-full"></div>
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 bg-gray-100 dark:bg-brand-darkBg rounded w-1/4"></div>
                                    <div className="h-3 bg-gray-50 dark:bg-brand-darkBg rounded w-1/2"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : migrationPoints.length > 0 ? (
                    <div className="space-y-4">
                        {migrationPoints.map((point) => (
                            <TimelineItem 
                                key={point.id}
                                point={point}
                                onDelete={handleDelete}
                                branchesMap={branchesMap}
                                personsMap={personsMap}
                                historyMap={historyMap}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="py-16 text-center bg-gray-50 dark:bg-brand-darkBg rounded-3xl border border-dashed border-gray-200 dark:border-brand-darkBorder">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">The journey is yet to be written.</p>
                    </div>
                )}

                <div className="mt-10 flex justify-end">
                    <button
                        onClick={() => navigate('/migration/add')}
                        className="w-full sm:w-auto bg-brand-orange text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-brand-orange/20 hover:bg-orange-600 active:scale-95 transition-all flex items-center justify-center space-x-2"
                    >
                        <span>Add Migration Point</span>
                    </button>
                </div>
            </section>

            {/* Custom Status Feedback Modal */}
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

export default MigrationMap;
