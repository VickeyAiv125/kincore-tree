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

const cityOf = (location) => String(location || '').split(',')[0].trim();

const MigrationMapWebview = () => {
    const { familySpaceId } = useParams();
    const [searchParams] = useSearchParams();
    const [migrationPoints, setMigrationPoints] = useState([]);
    const [stories, setStories] = useState([]);
    const [selectedId, setSelectedId] = useState(null);
    const [storyOpen, setStoryOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [query, setQuery] = useState('');
    const [branch, setBranch] = useState('all');
    const [zoom, setZoom] = useState(1);

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
                year: year || '',
                branches: point.branches || []
            });
        };
        ordered.forEach((point) => {
            const year = yearOf(point);
            pushStop(point.from_location, year, point);
            pushStop(point.to_location, year, point);
        });
        return list;
    }, [migrationPoints]);

    const needle = query.trim().toLowerCase();
    const visibleStops = stops.filter((stop) => {
        if (branch === 'paternal' && Array.isArray(stop.branches) && stop.branches.length > 0) {
            const paternal = stop.branches.some((item) => /paternal|father/i.test(String(item)));
            if (!paternal) return false;
        }
        if (!needle) return true;
        return `${stop.location} ${stop.year}`.toLowerCase().includes(needle);
    });

    const selected = stories.find((story) => story.id === selectedId) || stories[0] || null;
    const years = stories.map((story) => Number(story.year)).filter((year) => !Number.isNaN(year) && year > 0);
    const dataMin = years.length ? Math.min(...years) : 1850;
    const dataMax = years.length ? Math.max(...years) : new Date().getUTCFullYear();
    const trackMin = Math.min(1850, dataMin);
    const trackMax = Math.max(new Date().getUTCFullYear(), dataMax);
    const selectedYear = Number(selected?.year) || dataMin;
    const thumb = trackMax === trackMin ? 50 : ((selectedYear - trackMin) / (trackMax - trackMin)) * 100;

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

    const imageFor = (stop) => {
        const match = stories.find((story) => story.image && Number(story.year) === Number(stop.year));
        if (match?.image) return match.image;
        if (selected?.image && selected.source === 'migration' && stop.pointId === selected.id) return selected.image;
        return null;
    };

    if (error) {
        return (
            <div className="flex h-screen items-center justify-center bg-[#F6F3EF] p-4 text-center">
                <p className="text-xs font-semibold text-red-500">{error}</p>
            </div>
        );
    }

    const width = 360;
    const height = 230;
    const placed = (visibleStops.length ? visibleStops : stops).map((stop, index, list) => {
        const span = Math.max(list.length - 1, 1);
        const x = list.length === 1 ? width / 2 : 78 + (index * (width - 156)) / span;
        const y = index % 2 === 0 ? 118 : 78;
        return { ...stop, x, y, arrival: index === 0 };
    });
    const ticks = [
        { label: trackMin, at: 0 },
        { label: Math.round(trackMin + (trackMax - trackMin) * 0.25), at: 25 },
        { label: Math.round(trackMin + (trackMax - trackMin) * 0.5), at: 50 },
        { label: Math.round(trackMin + (trackMax - trackMin) * 0.75), at: 75 },
        { label: 'Now', at: 100 }
    ];

    return (
        <div className="min-h-screen bg-[#F4F1EC] px-4 pb-6 pt-3 text-[#1C1C1E]">
            <label className="flex items-center gap-2 rounded-full bg-white px-4 py-2.5 shadow-sm">
                <svg viewBox="0 0 24 24" className="h-4 w-4 text-[#B0A8A0]" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="7" />
                    <path d="M20 20l-3.5-3.5" strokeLinecap="round" />
                </svg>
                <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search places or people..."
                    className="w-full bg-transparent text-[13px] outline-none placeholder:text-[#C2B8B0]"
                />
            </label>

            <div className="relative mt-3">
                <div className="flex items-center gap-2 pr-14">
                    <button
                        type="button"
                        onClick={() => setBranch('all')}
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-semibold ${
                            branch === 'all' ? 'bg-[#FF6A2B] text-white' : 'bg-white text-[#6F6A78] shadow-sm'
                        }`}
                    >
                        <span className="text-[13px]">☺</span> All Branches
                    </button>
                    <button
                        type="button"
                        onClick={() => setBranch('paternal')}
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-semibold ${
                            branch === 'paternal' ? 'bg-[#FF6A2B] text-white' : 'bg-white text-[#6F6A78] shadow-sm'
                        }`}
                    >
                        <span className="text-[13px]">☺</span> Paternal
                    </button>
                    <button type="button" className="grid h-8 w-8 place-items-center rounded-full bg-white text-[#6F6A78] shadow-sm" aria-label="People">
                        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
                            <circle cx="12" cy="8" r="3" />
                            <path d="M5 19c1.4-3 3.8-4.5 7-4.5S17.6 16 19 19" strokeLinecap="round" />
                        </svg>
                    </button>
                </div>

                <div className="absolute right-0 top-0 z-10 flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm">
                    <button type="button" onClick={() => setZoom((value) => Math.min(1.6, value + 0.15))} className="grid h-9 w-9 place-items-center text-lg text-[#FF6A2B]" aria-label="Zoom in">+</button>
                    <button type="button" onClick={() => setZoom((value) => Math.max(0.8, value - 0.15))} className="grid h-9 w-9 place-items-center border-t border-[#F1EBE6] text-lg text-[#FF6A2B]" aria-label="Zoom out">−</button>
                </div>
                <button
                    type="button"
                    onClick={() => setZoom(1)}
                    className="absolute right-0 top-[86px] z-10 grid h-9 w-9 place-items-center rounded-full bg-white text-[#FF6A2B] shadow-sm"
                    aria-label="Reset map"
                >
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <circle cx="12" cy="12" r="3" />
                        <path d="M12 3v3M12 18v3M3 12h3M18 12h3" strokeLinecap="round" />
                    </svg>
                </button>

                <div className="relative mt-2 h-[250px] overflow-hidden">
                    {loading ? (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#FF6A2B] border-t-transparent" />
                        </div>
                    ) : placed.length === 0 ? (
                        <div className="absolute inset-0 flex items-center justify-center px-6 text-center">
                            <p className="text-[12px] font-semibold text-[#9A96A3]">No migration stops yet</p>
                        </div>
                    ) : (
                        <div className="h-full w-full origin-center" style={{ transform: `scale(${zoom})` }}>
                            <svg className="absolute inset-0 h-full w-full" viewBox={`0 0 ${width} ${height}`} xmlns="http://www.w3.org/2000/svg">
                                {placed.slice(1).map((stop, index) => {
                                    const from = placed[index];
                                    const midX = (from.x + stop.x) / 2;
                                    const midY = Math.min(from.y, stop.y) - 48;
                                    return (
                                        <path
                                            key={`route-${stop.id}`}
                                            d={`M ${from.x} ${from.y} Q ${midX} ${midY} ${stop.x} ${stop.y}`}
                                            fill="none"
                                            stroke="#FF8A5B"
                                            strokeWidth="2"
                                            strokeDasharray="1.2 5"
                                            strokeLinecap="round"
                                        />
                                    );
                                })}
                            </svg>
                            {placed.map((stop) => {
                                const photo = imageFor(stop);
                                return (
                                    <button
                                        key={stop.id}
                                        type="button"
                                        onClick={() => chooseYear(stop.year)}
                                        className="absolute -translate-x-1/2 -translate-y-1/2 text-center"
                                        style={{ left: `${(stop.x / width) * 100}%`, top: `${(stop.y / height) * 100}%` }}
                                    >
                                        <span className="relative mx-auto grid h-14 w-14 place-items-center overflow-hidden rounded-full border-[3px] border-[#FF6A2B] bg-[#FFE8DC] shadow-sm">
                                            {photo ? (
                                                <img src={photo} alt="" className="h-full w-full object-cover" />
                                            ) : (
                                                <span className="text-[13px] font-bold text-[#FF6A2B]">{initials(cityOf(stop.location))}</span>
                                            )}
                                            {stop.arrival && (
                                                <span className="absolute -bottom-1 rounded-full bg-[#FFF1EA] px-1.5 py-[1px] text-[8px] font-bold text-[#FF6A2B]">
                                                    Arrival
                                                </span>
                                            )}
                                        </span>
                                        <span className="mt-1 block max-w-[92px] truncate rounded-full bg-white/90 px-1.5 py-0.5 text-[10px] font-semibold text-[#6F6A78]">
                                            {cityOf(stop.location)}{stop.year ? `, ${stop.year}` : ''}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {!loading && selected && (
                <div className="mt-1">
                    <div className="mb-1 flex items-end justify-between">
                        <p className="text-[28px] font-bold leading-none text-[#FF6A2B]">{selectedYear}</p>
                        <p className="text-[10px] font-semibold tracking-[0.18em] text-[#C2B8B0]">TIMELINE</p>
                    </div>
                    <div className="relative pt-7">
                        <span
                            className="absolute top-0 -translate-x-1/2 rounded-full bg-white px-2 py-0.5 text-[10px] font-bold text-[#1C1C1E] shadow-sm"
                            style={{ left: `${thumb}%` }}
                        >
                            {selectedYear}
                        </span>
                        <input
                            aria-label="Migration timeline"
                            type="range"
                            min={trackMin}
                            max={trackMax}
                            value={Math.min(Math.max(selectedYear, trackMin), trackMax)}
                            onChange={(event) => chooseYear(event.target.value)}
                            className="w-full accent-[#FF6A2B]"
                        />
                        <div className="mt-1 flex justify-between text-[10px] font-medium text-[#B0A8A0]">
                            {ticks.map((tick) => (
                                <span key={`${tick.label}-${tick.at}`}>{tick.label}</span>
                            ))}
                        </div>
                    </div>

                    <article className="mt-3 flex gap-3 rounded-[22px] bg-white p-3 shadow-[0_8px_24px_rgba(80,40,20,0.06)]">
                        <div className="h-[84px] w-[84px] shrink-0 overflow-hidden rounded-2xl bg-[#F3E6DE]">
                            {selected.image ? (
                                <img src={selected.image} alt="" className="h-full w-full object-cover" />
                            ) : (
                                <div className="grid h-full w-full place-items-center text-sm font-bold text-[#FF6A2B]">
                                    {initials(selected.person_name || selected.location || selected.title)}
                                </div>
                            )}
                        </div>
                        <div className="min-w-0 flex-1">
                            {selected.location ? (
                                <p className="text-[10px] font-bold tracking-wide text-[#FF6A2B]">📍 {selected.location.toUpperCase()}</p>
                            ) : null}
                            <h2 className="mt-0.5 text-[16px] font-bold leading-tight">{selected.title}</h2>
                            <p className="mt-1 text-[12px] text-[#8A8492]">
                                {selected.year || 'Profile'}{selected.person_name ? ` • ${selected.person_name}` : ''}
                            </p>
                            {selected.body ? (
                                <div className="mt-2 flex justify-end">
                                    <button
                                        type="button"
                                        onClick={() => setStoryOpen((open) => !open)}
                                        className="rounded-full bg-[#FFF1EA] px-3 py-1 text-[12px] font-semibold text-[#FF6A2B]"
                                    >
                                        {storyOpen ? 'Hide story' : 'Read Story →'}
                                    </button>
                                </div>
                            ) : null}
                        </div>
                    </article>
                    {storyOpen && selected.body ? (
                        <p className="mt-2 px-1 text-[13px] leading-5 text-[#4E4854] whitespace-pre-wrap">{selected.body}</p>
                    ) : null}
                </div>
            )}
        </div>
    );
};

export default MigrationMapWebview;
