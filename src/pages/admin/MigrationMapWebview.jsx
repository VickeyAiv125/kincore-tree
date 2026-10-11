import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const yearOf = (point) => {
    if (point.date_type === 'Exact Date' && point.date_value) {
        return new Date(point.date_value).getFullYear();
    }
    if (point.date_type === 'Date Range' && point.date_range_start) {
        return new Date(point.date_range_start).getFullYear();
    }
    if (point.date_type === 'Approximate' && point.approximate_period) {
        return point.approximate_period;
    }
    return '';
};

const sortKey = (point) => {
    const raw = point.date_value || point.date_range_start || '';
    const time = Date.parse(raw);
    return Number.isNaN(time) ? 0 : time;
};

const initials = (label) => {
    const parts = String(label || '').trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return '•';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
};

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
                const token = searchParams.get('token') || localStorage.getItem('token');
                if (!familySpaceId) {
                    setError('No family space ID provided');
                    setLoading(false);
                    return;
                }
                const response = await fetch(`${API_BASE}/families/${familySpaceId}/migration-map`, {
                    headers: { Authorization: `Bearer ${token || ''}` }
                });
                if (!response.ok) {
                    const errData = await response.json().catch(() => ({}));
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

    const stops = useMemo(() => {
        const ordered = [...migrationPoints].sort((a, b) => sortKey(a) - sortKey(b));
        const list = [];
        const pushStop = (location, year, point) => {
            const name = String(location || '').trim();
            if (!name) return;
            const previous = list[list.length - 1];
            if (previous && previous.location.toLowerCase() === name.toLowerCase()) {
                if (!previous.year && year) previous.year = year;
                return;
            }
            list.push({
                id: `${point.id}-${list.length}`,
                location: name,
                year: year || ''
            });
        };
        ordered.forEach((point) => {
            const year = yearOf(point);
            pushStop(point.from_location, year, point);
            pushStop(point.to_location, year, point);
        });
        return list;
    }, [migrationPoints]);

    if (error) {
        return (
            <div className="w-full h-screen bg-[#F7F5F2] flex items-center justify-center p-4 text-center">
                <p className="text-xs font-semibold text-red-500">{error}</p>
            </div>
        );
    }

    const width = 360;
    const height = 210;
    const placed = stops.map((stop, index) => {
        const span = Math.max(stops.length - 1, 1);
        const x = stops.length === 1 ? width / 2 : 48 + (index * (width - 96)) / span;
        const y = index % 2 === 0 ? 78 : 118;
        return { ...stop, x, y, arrival: index === 0 };
    });

    return (
        <div className="relative w-full h-screen overflow-hidden bg-[#F6F3EF]">
            {loading ? (
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-[#FF6A2B] border-t-transparent rounded-full animate-spin" />
                </div>
            ) : placed.length === 0 ? (
                <div className="absolute inset-0 flex items-center justify-center px-6 text-center">
                    <p className="text-[11px] font-semibold text-[#9A96A3]">No migration stops yet</p>
                </div>
            ) : (
                <svg className="w-full h-full" viewBox={`0 0 ${width} ${height}`} xmlns="http://www.w3.org/2000/svg">
                    {placed.slice(1).map((stop, index) => {
                        const from = placed[index];
                        const midX = (from.x + stop.x) / 2;
                        const midY = Math.min(from.y, stop.y) - 36;
                        return (
                            <path
                                key={`route-${stop.id}`}
                                d={`M ${from.x} ${from.y} Q ${midX} ${midY} ${stop.x} ${stop.y}`}
                                fill="none"
                                stroke="#FF6A2B"
                                strokeWidth="2.2"
                                strokeDasharray="1.5 5"
                                strokeLinecap="round"
                            />
                        );
                    })}
                    {placed.map((stop) => (
                        <g key={stop.id}>
                            <circle cx={stop.x} cy={stop.y} r="22" fill="#FFE8DC" />
                            <circle cx={stop.x} cy={stop.y} r="16" fill="#FFFFFF" stroke="#FF6A2B" strokeWidth="2" />
                            <text
                                x={stop.x}
                                y={stop.y + 4}
                                textAnchor="middle"
                                fill="#FF6A2B"
                                fontSize="9"
                                fontWeight="700"
                            >
                                {initials(stop.location)}
                            </text>
                            <text
                                x={stop.x}
                                y={stop.y + 40}
                                textAnchor="middle"
                                fill="#6F6A78"
                                fontSize="8"
                                fontWeight="600"
                            >
                                {stop.location}{stop.year ? `, ${stop.year}` : ''}
                            </text>
                            {stop.arrival && (
                                <g>
                                    <rect x={stop.x - 22} y={stop.y + 46} width="44" height="14" rx="7" fill="#FFF1EA" />
                                    <text
                                        x={stop.x}
                                        y={stop.y + 56}
                                        textAnchor="middle"
                                        fill="#FF6A2B"
                                        fontSize="7"
                                        fontWeight="700"
                                    >
                                        Arrival
                                    </text>
                                </g>
                            )}
                        </g>
                    ))}
                </svg>
            )}
        </div>
    );
};

export default MigrationMapWebview;
