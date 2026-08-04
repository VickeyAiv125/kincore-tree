import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Globe } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}`;

const MigrationMapWebview = () => {
    const { familySpaceId } = useParams();
    const [searchParams] = useSearchParams();
    const [migrationPoints, setMigrationPoints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchWebviewData = async () => {
            try {
                setLoading(true);
                // Read token from query string first, then fallback to local storage
                const token = searchParams.get('token') || localStorage.getItem('token');
                
                if (!familySpaceId) {
                    setError('No family space ID provided');
                    setLoading(false);
                    return;
                }

                // Call the member/public route to fetch migration map
                const response = await fetch(`${API_BASE}/families/${familySpaceId}/migration-map`, {
                    headers: { 'Authorization': `Bearer ${token || ''}` }
                });

                if (!response.ok) {
                    const errData = await response.json();
                    throw new Error(errData.error || 'Failed to fetch migration map');
                }

                const data = await response.json();
                setMigrationPoints(data.migration_data || []);
            } catch (err) {
                console.error('Error in migration map webview:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchWebviewData();
    }, [familySpaceId, searchParams]);

    const getCoords = (lat, lng) => {
        const x = (parseFloat(lng) + 180) * (800 / 360);
        const y = (90 - parseFloat(lat)) * (400 / 180);
        return { x, y };
    };

    const getDateStr = (point) => {
        if (point.date_type === 'Exact Date' && point.date_value) {
            return new Date(point.date_value).getFullYear();
        } else if (point.date_type === 'Date Range' && point.date_range_start) {
            const startYr = new Date(point.date_range_start).getFullYear();
            const endYr = point.date_range_end ? new Date(point.date_range_end).getFullYear() : 'Present';
            return `${startYr} - ${endYr}`;
        } else if (point.date_type === 'Approximate' && point.approximate_period) {
            return point.approximate_period;
        }
        return '';
    };

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

    if (error) {
        return (
            <div className="w-full h-screen bg-gray-900 dark:bg-brand-darkCard flex items-center justify-center p-4 text-center">
                <div className="max-w-xs bg-gray-800/80 p-6 rounded-2xl border border-red-500/30 shadow-sm">
                    <p className="text-xs font-bold text-red-400 uppercase tracking-widest mb-2">Failed to Load Map</p>
                    <p className="text-[11px] font-medium text-gray-400 leading-relaxed">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="relative w-full h-screen bg-gray-900 dark:bg-brand-darkCard overflow-hidden select-none">
            {/* Title Heading */}
            <div className="absolute top-6 left-6 z-30 text-left pointer-events-none">
                <h1 className="text-2xl font-black text-white tracking-tight drop-shadow-md">Migration Map</h1>
            </div>

            {/* Background Grid */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
                <div className="w-full h-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]"></div>
            </div>

            <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
                <Globe size={120} className="text-white/10" />
            </div>

            <div className="absolute inset-0">
                {loading ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-6 h-6 border-2 border-brand-orange border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : plottedNodes.length > 0 ? (
                    <svg className="w-full h-full p-4" viewBox="0 0 800 400" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <marker id="arrow-webview" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                                <path d="M 0 0 L 10 5 L 0 10 z" fill="#f97316" />
                            </marker>
                        </defs>
                        
                        {plottedNodes.map((p, idx) => {
                            if (p.fromPt && p.toPt) {
                                const midX = (p.fromPt.x + p.toPt.x) / 2;
                                const midY = Math.min(p.fromPt.y, p.toPt.y) - 60;
                                const dateStr = getDateStr(p);
                                return (
                                    <g key={`path-${idx}`}>
                                        <path
                                            d={`M ${p.fromPt.x} ${p.fromPt.y} Q ${midX} ${midY} ${p.toPt.x} ${p.toPt.y}`}
                                            fill="none"
                                            stroke="#f97316"
                                            strokeWidth="3.5"
                                            strokeDasharray="8 6"
                                            markerEnd="url(#arrow-webview)"
                                        />
                                        <text
                                            x={midX}
                                            y={midY - 8}
                                            textAnchor="middle"
                                            paintOrder="stroke fill"
                                            stroke="#111827"
                                            strokeWidth="3.5"
                                            className="fill-white text-[11px] font-black uppercase tracking-widest pointer-events-none select-none drop-shadow-md"
                                        >
                                            {p.title || 'Migration'} {dateStr ? `• ${dateStr}` : ''}
                                        </text>
                                    </g>
                                );
                            }
                            return null;
                        })}

                        {plottedNodes.map((p, idx) => (
                            <g key={`nodes-${idx}`}>
                                {p.fromPt && (
                                    <>
                                        <circle cx={p.fromPt.x} cy={p.fromPt.y} r="8" fill="#f97316" className="opacity-20" />
                                        <circle cx={p.fromPt.x} cy={p.fromPt.y} r="4" fill="#f97316" />
                                        {p.from_location && (
                                            <text
                                                x={p.fromPt.x}
                                                y={p.fromPt.y + 16}
                                                textAnchor="middle"
                                                paintOrder="stroke fill"
                                                stroke="#111827"
                                                strokeWidth="3"
                                                className="fill-brand-orange text-[9px] font-extrabold uppercase tracking-wider pointer-events-none select-none"
                                            >
                                                {p.from_location}
                                            </text>
                                        )}
                                    </>
                                )}
                                {p.toPt && (
                                    <>
                                        <circle cx={p.toPt.x} cy={p.toPt.y} r="10" fill="#ef4444" className="opacity-20" />
                                        <circle cx={p.toPt.x} cy={p.toPt.y} r="5" fill="#ef4444" />
                                        {p.to_location && (
                                            <text
                                                x={p.toPt.x}
                                                y={p.toPt.y + 18}
                                                textAnchor="middle"
                                                paintOrder="stroke fill"
                                                stroke="#111827"
                                                strokeWidth="3"
                                                className="fill-red-400 text-[9px] font-extrabold uppercase tracking-wider pointer-events-none select-none"
                                            >
                                                {p.to_location}
                                            </text>
                                        )}
                                    </>
                                )}
                            </g>
                        ))}
                    </svg>
                ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                        <Globe size={32} className="text-brand-orange/40 mb-2" />
                        <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">No Map Coordinates Set</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MigrationMapWebview;
