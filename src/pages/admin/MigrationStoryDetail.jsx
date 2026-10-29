import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const MigrationStoryDetail = () => {
    const { familySpaceId, storyId } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { theme } = useTheme();
    const dark = theme === 'dark';

    const color = useMemo(() => (dark
        ? {
            page: '#12141C',
            text: '#F4F1EC',
            muted: '#A8A3B0',
            card: '#1C1E28',
            border: '#343846',
            quote: '#3A241C'
        }
        : {
            page: '#FFF9F1',
            text: '#1C1C1E',
            muted: '#6F6A78',
            card: '#FFFFFF',
            border: '#F1EBE6',
            quote: '#FFF1EA'
        }), [dark]);

    const [story, setStory] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const token = searchParams.get('token') || localStorage.getItem('token') || '';
    const querySuffix = token ? `?token=${encodeURIComponent(token)}` : '';

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                setError(null);
                const headers = { Authorization: `Bearer ${token}` };
                const res = await fetch(
                    `${API_BASE}/families/${familySpaceId}/migration-map/stories/${encodeURIComponent(storyId)}`,
                    { headers }
                );
                if (!res.ok) {
                    const errData = await res.json().catch(() => ({}));
                    throw new Error(errData.error || 'Failed to load story');
                }
                setStory(await res.json());
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        if (familySpaceId && storyId) load();
    }, [familySpaceId, storyId, token]);

    useEffect(() => {
        document.documentElement.style.backgroundColor = color.page;
        document.body.style.backgroundColor = color.page;
        return () => {
            document.documentElement.style.backgroundColor = '';
            document.body.style.backgroundColor = '';
        };
    }, [color.page]);

    const goBack = () => {
        navigate(`/migration-map/webview/${familySpaceId}${querySuffix}`);
    };

    const openStory = (id) => {
        navigate(`/migration-map/webview/${familySpaceId}/story/${encodeURIComponent(id)}${querySuffix}`);
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center" style={{ background: color.page, color: color.muted }}>
                <p className="text-sm font-semibold">Loading story…</p>
            </div>
        );
    }

    if (error || !story) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center gap-3 p-6" style={{ background: color.page }}>
                <p className="text-center text-sm font-semibold text-red-500">{error || 'Story not found'}</p>
                <button type="button" onClick={goBack} className="rounded-full bg-[#FF6A2B] px-4 py-2 text-sm font-semibold text-white">
                    Back to map
                </button>
            </div>
        );
    }

    const metaParts = [story.date_label, story.route_label].filter(Boolean);

    return (
        <div className="min-h-screen pb-10" style={{ background: color.page, color: color.text }}>
            <header className="sticky top-0 z-20 flex items-center justify-between px-4 py-3 backdrop-blur-md" style={{ background: `${color.page}ee` }}>
                <button type="button" onClick={goBack} className="grid h-10 w-10 place-items-center rounded-full" style={{ background: color.card }} aria-label="Back">
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 6l-6 6 6 6" /></svg>
                </button>
                <h1 className="text-[17px] font-bold">History Details</h1>
                <button type="button" className="grid h-10 w-10 place-items-center rounded-full opacity-40" style={{ background: color.card }} aria-label="Share" disabled>
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7M16 6l-4-4-4 4M12 2v14" /></svg>
                </button>
            </header>

            <div className="px-4">
                <div className="relative overflow-hidden rounded-[24px]" style={{ background: color.card }}>
                    {story.cover_image ? (
                        <img src={story.cover_image} alt="" className="h-[220px] w-full object-cover" />
                    ) : (
                        <div className="grid h-[220px] w-full place-items-center text-4xl font-bold text-[#FF6A2B] opacity-70">
                            {story.title?.slice(0, 2)?.toUpperCase() || '•'}
                        </div>
                    )}
                    <span className="absolute bottom-3 left-3 rounded-full bg-[#FF6A2B] px-3 py-1 text-[11px] font-bold text-white">
                        {story.badge || 'Migration Story'}
                    </span>
                </div>

                <h2 className="mt-5 text-[26px] font-bold leading-tight">{story.title}</h2>

                {metaParts.length ? (
                    <p className="mt-2 flex flex-wrap items-center gap-2 text-[13px]" style={{ color: color.muted }}>
                        {story.date_label ? (
                            <span className="inline-flex items-center gap-1">
                                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor" aria-hidden="true"><path d="M7 2a1 1 0 0 1 1 1v1h8V3a1 1 0 1 1 2 0v1h1.5A2.5 2.5 0 0 1 22 6.5v13A2.5 2.5 0 0 1 19.5 22h-15A2.5 2.5 0 0 1 2 19.5v-13A2.5 2.5 0 0 1 4.5 4H6V3a1 1 0 0 1 1-1Zm12.5 7H4.5v10.5c0 .28.22.5.5.5h15c.28 0 .5-.22.5-.5V9Z" /></svg>
                                {story.date_label}
                            </span>
                        ) : null}
                        {story.date_label && story.route_label ? <span>•</span> : null}
                        {story.route_label ? (
                            <span className="inline-flex items-center gap-1">
                                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor" aria-hidden="true"><path d="M12 2.5a7 7 0 0 0-7 7c0 5.1 6.1 11.3 6.4 11.6a.9.9 0 0 0 1.2 0C12.9 20.8 19 14.6 19 9.5a7 7 0 0 0-7-7Zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5Z" /></svg>
                                {story.route_label}
                            </span>
                        ) : null}
                    </p>
                ) : null}

                {story.author?.name ? (
                    <div className="mt-4 flex items-center gap-3 rounded-[20px] p-3" style={{ background: color.card, border: `1px solid ${color.border}` }}>
                        {story.author.avatar_url ? (
                            <img src={story.author.avatar_url} alt="" className="h-12 w-12 rounded-full object-cover" />
                        ) : (
                            <div className="grid h-12 w-12 place-items-center rounded-full bg-[#FF6A2B]/15 text-sm font-bold text-[#FF6A2B]">
                                {story.author.name.slice(0, 2).toUpperCase()}
                            </div>
                        )}
                        <div className="min-w-0 flex-1">
                            <p className="text-[14px] font-semibold">Added by {story.author.name}</p>
                            {story.author.subtitle ? (
                                <p className="text-[12px]" style={{ color: color.muted }}>{story.author.subtitle}</p>
                            ) : null}
                        </div>
                    </div>
                ) : null}

                <div className="mt-5 text-[15px] leading-7" style={{ color: color.text }}>
                    {story.body ? (
                        <p className="whitespace-pre-wrap">{story.body}</p>
                    ) : (
                        <p style={{ color: color.muted }}>No story text has been added for this migration yet. Ask your family admin to add a description or link a history chapter.</p>
                    )}
                </div>

                {Array.isArray(story.gallery) && story.gallery.length > 0 ? (
                    <section className="mt-8">
                        <div className="mb-3 flex items-center justify-between">
                            <h3 className="text-[18px] font-bold">Gallery</h3>
                        </div>
                        <div className="flex gap-3 overflow-x-auto pb-2">
                            {story.gallery.map((item) => (
                                <figure key={item.url} className="min-w-[140px] shrink-0">
                                    <img src={item.url} alt={item.name || ''} className="h-[120px] w-[140px] rounded-2xl object-cover" />
                                    {item.name ? (
                                        <figcaption className="mt-1 text-[11px] font-medium" style={{ color: color.muted }}>{item.name}</figcaption>
                                    ) : null}
                                </figure>
                            ))}
                        </div>
                    </section>
                ) : null}

                {story.next_story ? (
                    <section className="mt-8">
                        <h3 className="mb-3 text-[18px] font-bold">Next in History</h3>
                        <button
                            type="button"
                            onClick={() => openStory(story.next_story.id)}
                            className="flex w-full items-center gap-3 rounded-[20px] p-3 text-left"
                            style={{ background: color.card, border: `1px solid ${color.border}` }}
                        >
                            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[#FF6A2B]/15 text-xs font-bold text-[#FF6A2B]">
                                →
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-[15px] font-semibold">{story.next_story.title}</p>
                                {story.next_story.subtitle ? (
                                    <p className="text-[12px]" style={{ color: color.muted }}>{story.next_story.subtitle}</p>
                                ) : null}
                            </div>
                        </button>
                    </section>
                ) : null}
            </div>
        </div>
    );
};

export default MigrationStoryDetail;
