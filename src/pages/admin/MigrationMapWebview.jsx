import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';

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
    const { theme } = useTheme();
    const dark = theme === 'dark';
    const color = dark
        ? {
            page: '#12141C',
            text: '#F4F1EC',
            muted: '#A8A3B0',
            faint: '#7E7886',
            card: '#1C1E28',
            chip: '#2A2D38',
            line: '#343846',
            soft: '#3A241C',
            photo: '#2A2430',
            story: '#D5D0D8'
        }
        : {
            page: '#F4F1EC',
            text: '#1C1C1E',
            muted: '#6F6A78',
            faint: '#B0A8A0',
            card: '#FFFFFF',
            chip: '#FFFFFF',
            line: '#F1EBE6',
            soft: '#FFF1EA',
            photo: '#F3E6DE',
            story: '#4E4854'
        };
    const [migrationPoints, setMigrationPoints] = useState([]);
    const [stories, setStories] = useState([]);
    const [selectedId, setSelectedId] = useState(null);
    const [storyOpen, setStoryOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [query, setQuery] = useState('');
    const [branch, setBranch] = useState('all');
    const [zoom, setZoom] = useState(1);
    const trackRef = useRef(null);

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

    useEffect(() => {
        const root = document.documentElement;
        root.style.colorScheme = dark ? 'dark' : 'light';
        root.style.backgroundColor = color.page;
        document.body.style.backgroundColor = color.page;
        return () => {
            root.style.colorScheme = '';
            root.style.backgroundColor = '';
            document.body.style.backgroundColor = '';
        };
    }, [dark, color.page]);

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
            <div className="flex h-screen items-center justify-center p-4 text-center" style={{ background: color.page }}>
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
    const yearSpan = Math.max(trackMax - trackMin, 1);
    const clampedThumb = Math.min(100, Math.max(0, thumb));
    const ticks = [
        { label: String(trackMin), at: 0 },
        ...[1900, 1950, 2000]
            .filter((year) => year > trackMin && year < trackMax)
            .map((year) => ({ label: String(year), at: ((year - trackMin) / yearSpan) * 100 })),
        { label: 'Now', at: 100 }
    ];
    const alongTrack = (percent) => `calc(11px + (100% - 22px) * ${percent / 100})`;
    const yearFromClientX = (clientX) => {
        const rect = trackRef.current?.getBoundingClientRect();
        if (!rect) return selectedYear;
        const pad = 11;
        const usable = Math.max(rect.width - pad * 2, 1);
        const ratio = Math.min(1, Math.max(0, (clientX - rect.left - pad) / usable));
        return Math.round(trackMin + ratio * yearSpan);
    };
    const scrubTimeline = (event) => {
        if (event.buttons === 0 && event.type === 'pointermove') return;
        chooseYear(yearFromClientX(event.clientX));
    };

    return (
        <div className="min-h-screen" style={{ background: color.page, color: color.text }}>
        <div className="mx-auto min-h-screen w-full max-w-[430px] px-4 pb-6 pt-3">
            <label className="flex items-center gap-2 rounded-full px-4 py-2.5 shadow-sm" style={{ background: color.card }}>
                <svg viewBox="0 0 24 24" className="h-4 w-4 text-[#B0A8A0]" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="7" />
                    <path d="M20 20l-3.5-3.5" strokeLinecap="round" />
                </svg>
                <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search places or people..."
                    className="w-full bg-transparent text-[13px] outline-none"
                    style={{ color: color.text }}
                />
            </label>

            <div className="relative mt-3">
                <div className="flex items-center gap-2 pr-14">
                    <button
                        type="button"
                        onClick={() => setBranch('all')}
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-semibold ${
                            branch === 'all' ? 'bg-[#FF6A2B] text-white' : 'shadow-sm'
                        }`}
                        style={branch === 'all' ? undefined : { background: color.chip, color: color.muted }}
                    >
                        <span className="text-[13px]">☺</span> All Branches
                    </button>
                    <button
                        type="button"
                        onClick={() => setBranch('paternal')}
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-semibold ${
                            branch === 'paternal' ? 'bg-[#FF6A2B] text-white' : 'shadow-sm'
                        }`}
                        style={branch === 'paternal' ? undefined : { background: color.chip, color: color.muted }}
                    >
                        <span className="text-[13px]">☺</span> Paternal
                    </button>
                    <button type="button" className="grid h-8 w-8 place-items-center rounded-full shadow-sm" style={{ background: color.chip, color: color.muted }} aria-label="People">
                        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
                            <circle cx="12" cy="8" r="3" />
                            <path d="M5 19c1.4-3 3.8-4.5 7-4.5S17.6 16 19 19" strokeLinecap="round" />
                        </svg>
                    </button>
                </div>

                <div className="absolute right-0 top-0 z-10 flex flex-col overflow-hidden rounded-2xl shadow-sm" style={{ background: color.card }}>
                    <button type="button" onClick={() => setZoom((value) => Math.min(1.6, value + 0.15))} className="grid h-9 w-9 place-items-center text-lg text-[#FF6A2B]" aria-label="Zoom in">+</button>
                    <button type="button" onClick={() => setZoom((value) => Math.max(0.8, value - 0.15))} className="grid h-9 w-9 place-items-center border-t text-lg text-[#FF6A2B]" style={{ borderColor: color.line }} aria-label="Zoom out">−</button>
                </div>
                <button
                    type="button"
                    onClick={() => setZoom(1)}
                    className="absolute right-0 top-[86px] z-10 grid h-9 w-9 place-items-center rounded-full text-[#FF6A2B] shadow-sm"
                    style={{ background: color.card }}
                    aria-label="Reset map"
                >
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <circle cx="12" cy="12" r="3" />
                        <path d="M12 3v3M12 18v3M3 12h3M18 12h3" strokeLinecap="round" />
                    </svg>
                </button>

                <div className="relative mx-auto mt-2 w-full overflow-hidden" style={{ aspectRatio: `${width} / ${height}` }}>
                    {loading ? (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#FF6A2B] border-t-transparent" />
                        </div>
                    ) : placed.length === 0 ? (
                        <div className="absolute inset-0 flex items-center justify-center px-6 text-center">
                            <p className="text-[12px] font-semibold" style={{ color: color.muted }}>No migration stops yet</p>
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
                                                <span className="absolute -bottom-1 rounded-full px-1.5 py-[1px] text-[8px] font-bold text-[#FF6A2B]" style={{ background: color.soft }}>
                                                    Arrival
                                                </span>
                                            )}
                                        </span>
                                        <span className="mt-1 block max-w-[92px] truncate rounded-full px-1.5 py-0.5 text-[10px] font-semibold" style={{ background: dark ? 'rgba(28,30,40,0.92)' : 'rgba(255,255,255,0.9)', color: color.muted }}>
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
                    <div className="flex items-center justify-between">
                        <p className="text-[13px] font-semibold leading-none text-[#FF6A2B]">{selectedYear}</p>
                        <p className="text-[13px] font-semibold leading-none tracking-[0.12em]" style={{ color: color.faint }}>TIMELINE</p>
                    </div>
                    <div className="relative pt-3.5">
                        <span
                            className="absolute top-0 z-20 -translate-x-1/2 rounded-full px-2 py-px text-[12px] font-bold leading-none shadow-[0_2px_8px_rgba(28,28,30,0.12)]"
                            style={{ left: alongTrack(clampedThumb), background: color.card, color: color.text }}
                        >
                            {selectedYear}
                        </span>
                        <div
                            ref={trackRef}
                            role="slider"
                            tabIndex={0}
                            aria-label="Migration timeline"
                            aria-valuemin={trackMin}
                            aria-valuemax={trackMax}
                            aria-valuenow={Math.min(Math.max(selectedYear, trackMin), trackMax)}
                            className="relative z-10 h-5 cursor-pointer touch-none outline-none"
                            onPointerDown={(event) => {
                                event.currentTarget.setPointerCapture(event.pointerId);
                                scrubTimeline(event);
                            }}
                            onPointerMove={scrubTimeline}
                            onKeyDown={(event) => {
                                if (event.key === 'ArrowRight' || event.key === 'ArrowUp') chooseYear(selectedYear + 1);
                                if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') chooseYear(selectedYear - 1);
                            }}
                        >
                            <div
                                className="absolute top-1 h-[7px] -translate-y-1/2 rounded-full"
                                style={{ left: 11, right: 11, background: dark ? '#3A3D4A' : '#E4E2EC' }}
                            >
                                <div
                                    className="h-full rounded-full"
                                    style={{ width: `${clampedThumb}%`, background: dark ? '#C4846A' : '#F0B0A0' }}
                                />
                            </div>
                            <span
                                className="absolute top-1 z-10 h-[22px] w-[22px] -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] shadow-[0_1px_4px_rgba(28,28,30,0.18)]"
                                style={{ left: alongTrack(clampedThumb), background: '#FF6A2B', borderColor: dark ? '#1C1E28' : '#FFFFFF' }}
                            />
                        </div>
                        <div className="relative -mt-2.5 h-4 text-[11px] font-medium" style={{ color: color.faint }}>
                            {ticks.map((tick) => (
                                <span
                                    key={`${tick.label}-${tick.at}`}
                                    className="absolute top-0"
                                    style={
                                        tick.at === 0
                                            ? { left: 0 }
                                            : tick.at === 100
                                                ? { right: 0 }
                                                : { left: alongTrack(tick.at), transform: 'translateX(-50%)' }
                                    }
                                >
                                    {tick.label}
                                </span>
                            ))}
                        </div>
                    </div>

                    <article className="mt-3 flex gap-3 rounded-[22px] p-3 shadow-[0_8px_24px_rgba(0,0,0,0.12)]" style={{ background: color.card }}>
                        <div className="h-[84px] w-[84px] shrink-0 overflow-hidden rounded-2xl" style={{ background: color.photo }}>
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
                                <p className="flex items-center gap-1 text-[11px] font-bold tracking-wide text-[#FF6A2B]">
                                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 shrink-0" fill="currentColor" aria-hidden="true">
                                        <path d="M12 2.5a7 7 0 0 0-7 7c0 5.1 6.1 11.3 6.4 11.6a.9.9 0 0 0 1.2 0C12.9 20.8 19 14.6 19 9.5a7 7 0 0 0-7-7Zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5Z" />
                                    </svg>
                                    {selected.location.toUpperCase()}
                                </p>
                            ) : null}
                            <h2 className="mt-0.5 text-[16px] font-bold leading-tight">{selected.title}</h2>
                            <p className="mt-1 text-[12px]" style={{ color: color.muted }}>
                                {selected.year || 'Profile'}{selected.person_name ? ` • ${selected.person_name}` : ''}
                            </p>
                            {selected.body ? (
                                <div className="mt-2 flex justify-end">
                                    <button
                                        type="button"
                                        onClick={() => setStoryOpen((open) => !open)}
                                        className="rounded-full px-3 py-1 text-[12px] font-semibold text-[#FF6A2B]"
                                        style={{ background: color.soft }}
                                    >
                                        {storyOpen ? 'Hide story' : 'Read Story →'}
                                    </button>
                                </div>
                            ) : null}
                        </div>
                    </article>
                    {storyOpen && selected.body ? (
                        <p className="mt-2 px-1 text-[13px] leading-5 whitespace-pre-wrap" style={{ color: color.story }}>{selected.body}</p>
                    ) : null}
                </div>
            )}
        </div>
        </div>
    );
};

export default MigrationMapWebview;
