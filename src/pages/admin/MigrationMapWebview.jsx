import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const yearOf = (point) => {
    if (point.date_type === 'Exact Date' && point.date_value) {
        return new Date(point.date_value).getUTCFullYear();
    }
    if (point.date_type === 'Date Range' && point.date_range_start) {
        return new Date(point.date_range_start).getUTCFullYear();
    }
    if (point.date_type === 'Approximate' && point.approximate_period) {
        const year = Number(String(point.approximate_period).slice(0, 4));
        return Number.isNaN(year) ? '' : year;
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
    const [stories, setStories] = useState([]);
    const [selectedId, setSelectedId] = useState(null);
    const [storyOpen, setStoryOpen] = useState(false);
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
                const headers = { Authorization: `Bearer ${token || ''}` };
                const response = await fetch(`${API_BASE}/families/${familySpaceId}/migration-map`, { headers });
                if (!response.ok) {
                    const errData = await response.json().catch(() => ({}));
                    throw new Error(errData.error || 'Failed to fetch migration map');
                }
                const data = await response.json();
                const nextStories = Array.isArray(data.stories) ? data.stories : [];
                setMigrationPoints(data.migration_data || []);
                setStories(nextStories);
                setSelectedId(nextStories[0]?.id || null);
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
                pointId: point.id,
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

    const selected = stories.find((story) => story.id === selectedId) || stories[0] || null;
    const years = stories.map((story) => Number(story.year)).filter((year) => !Number.isNaN(year) && year > 0);
    const minYear = years.length ? Math.min(...years) : 1850;
    const maxYear = Math.max(new Date().getUTCFullYear(), ...(years.length ? years : [minYear]));
    const selectedYear = Number(selected?.year) || minYear;

    const chooseYear = (year) => {
        const target = Number(year);
        const nearest = stories.reduce((best, story) => {
            const storyYear = Number(story.year);
            if (!storyYear) return best;
            if (!best) return story;
            return Math.abs(storyYear - target) < Math.abs(Number(best.year) - target) ? story : best;
        }, null);
        if (nearest) {
            setSelectedId(nearest.id);
            setStoryOpen(false);
        }
    };

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
        const active = selected?.source === 'migration' && stop.pointId === selected.id;
        return { ...stop, x, y, arrival: index === 0, active };
    });

    return (
        <div className="bg-[#F6F3EF]">
            <div className="relative h-[96px] bg-[#F6F3EF]">
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
                            <g key={stop.id} opacity={selected?.source === 'migration' && !stop.active ? 0.45 : 1}>
                                <circle cx={stop.x} cy={stop.y} r="22" fill="#FFE8DC" />
                                <circle cx={stop.x} cy={stop.y} r="16" fill="#FFFFFF" stroke="#FF6A2B" strokeWidth="2" />
                                <text x={stop.x} y={stop.y + 4} textAnchor="middle" fill="#FF6A2B" fontSize="9" fontWeight="700">
                                    {initials(stop.location)}
                                </text>
                                <text x={stop.x} y={stop.y + 40} textAnchor="middle" fill="#6F6A78" fontSize="8" fontWeight="600">
                                    {stop.location}{stop.year ? `, ${stop.year}` : ''}
                                </text>
                                {stop.arrival && (
                                    <g>
                                        <rect x={stop.x - 22} y={stop.y + 46} width="44" height="14" rx="7" fill="#FFF1EA" />
                                        <text x={stop.x} y={stop.y + 56} textAnchor="middle" fill="#FF6A2B" fontSize="7" fontWeight="700">
                                            Arrival
                                        </text>
                                    </g>
                                )}
                            </g>
                        ))}
                    </svg>
                )}
            </div>

            {!loading && stories.length > 0 && (
                <div className="px-3 pb-3">
                    <div className="flex items-center justify-between">
                        <p className="text-[15px] leading-none font-bold text-[#FF6A2B]">{selectedYear}</p>
                        <p className="text-[10px] font-semibold tracking-[0.16em] text-[#B0ABB6]">TIMELINE</p>
                    </div>
                    <input
                        aria-label="Migration timeline"
                        type="range"
                        min={minYear}
                        max={maxYear}
                        value={Math.min(Math.max(selectedYear, minYear), maxYear)}
                        onChange={(event) => chooseYear(event.target.value)}
                        className="w-full accent-[#FF6A2B]"
                    />
                    <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
                        {stories.map((story) => {
                            const active = story.id === selected?.id;
                            return (
                                <button
                                    key={story.id}
                                    type="button"
                                    onClick={() => {
                                        setSelectedId(story.id);
                                        setStoryOpen(false);
                                    }}
                                    className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-semibold ${
                                        active ? 'bg-[#FF6A2B] text-white' : 'bg-white text-[#6F6A78]'
                                    }`}
                                >
                                    {story.year || 'Story'}
                                </button>
                            );
                        })}
                    </div>

                    {selected && (
                        <article className="mt-2 rounded-2xl bg-white p-2.5 shadow-sm flex gap-2.5">
                            <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-[#F3E6DE] flex items-center justify-center">
                                {selected.image ? (
                                    <img src={selected.image} alt="" className="h-full w-full object-cover" />
                                ) : (
                                    <span className="text-sm font-bold text-[#FF6A2B]">{initials(selected.person_name || selected.location || selected.title)}</span>
                                )}
                            </div>
                            <div className="min-w-0 flex-1">
                                {selected.location ? (
                                    <p className="text-[10px] font-bold tracking-wide text-[#FF6A2B]">📍 {selected.location.toUpperCase()}</p>
                                ) : null}
                                <h2 className="mt-0.5 text-[15px] font-bold leading-tight text-[#1F1B24]">{selected.title}</h2>
                                <p className="mt-1 text-[12px] text-[#8A8492]">
                                    {selected.year || 'Profile'}{selected.person_name ? ` • ${selected.person_name}` : ''}
                                </p>
                                {storyOpen && selected.body ? (
                                    <p className="mt-2 text-[13px] leading-5 text-[#4E4854] whitespace-pre-wrap">{selected.body}</p>
                                ) : null}
                                {selected.body ? (
                                    <button
                                        type="button"
                                        onClick={() => setStoryOpen((open) => !open)}
                                        className="mt-2 rounded-full bg-[#FFF1EA] px-3 py-1 text-[12px] font-semibold text-[#FF6A2B]"
                                    >
                                        {storyOpen ? 'Hide story' : 'Read Story →'}
                                    </button>
                                ) : null}
                            </div>
                        </article>
                    )}
                </div>
            )}
        </div>
    );
};

export default MigrationMapWebview;
