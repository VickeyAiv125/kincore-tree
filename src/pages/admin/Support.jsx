import React, { useCallback, useEffect, useState } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const getAuth = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const familyId = localStorage.getItem('selected_family_id') || user?.family_id || user?.family_space_id;
    const token = localStorage.getItem('token');
    return { user, familyId, token };
};

const SupportCard = ({ icon, title, description, onClick, badge }) => (
    <button
        type="button"
        onClick={onClick}
        className="text-left bg-white dark:bg-brand-darkCard rounded-3xl border border-gray-100 dark:border-brand-darkBorder p-8 flex flex-col items-start transition-all hover:shadow-md dark:hover:shadow-brand-orange/5 cursor-pointer group w-full"
    >
        <div className="w-12 h-12 bg-orange-50 dark:bg-brand-orange/10 rounded-2xl flex items-center justify-center text-brand-orange mb-6 group-hover:bg-brand-orange group-hover:text-white transition-colors">
            {icon}
        </div>
        <div className="flex items-center gap-2 mb-2">
            <h4 className="text-sm font-extrabold text-gray-900 dark:text-brand-darkText">{title}</h4>
            {badge && (
                <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-orange-50 text-brand-orange dark:bg-brand-orange/10">
                    {badge}
                </span>
            )}
        </div>
        <p className="text-xs font-medium text-gray-400 dark:text-gray-500 leading-relaxed">{description}</p>
    </button>
);

const FAQItem = ({ question, answer }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="mb-4">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full bg-orange-50 dark:bg-brand-orange/10 rounded-2xl p-6 flex items-center justify-between cursor-pointer hover:bg-orange-100 dark:hover:bg-brand-orange/20 transition-colors text-left"
            >
                <span className="text-sm font-bold text-gray-800 dark:text-brand-darkText pr-4">{question}</span>
                <svg
                    className={`w-5 h-5 text-gray-400 dark:text-gray-500 transform transition-transform shrink-0 ${isOpen ? 'rotate-180' : ''}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>
            {isOpen && (
                <div className="px-6 py-4 text-xs font-medium text-gray-500 dark:text-gray-400 leading-relaxed text-left whitespace-pre-line">
                    {answer}
                </div>
            )}
        </div>
    );
};

const StatusBadge = ({ status }) => {
    const key = String(status || 'open').toLowerCase();
    const styles = {
        open: 'bg-orange-50 text-brand-orange',
        in_progress: 'bg-amber-50 text-amber-600',
        resolved: 'bg-emerald-50 text-emerald-600',
        closed: 'bg-gray-100 text-gray-500'
    };
    return (
        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${styles[key] || styles.open}`}>
            {status || 'open'}
        </span>
    );
};

const ModalShell = ({ title, subtitle, onClose, children, wide }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div className={`bg-white dark:bg-brand-darkCard rounded-3xl p-8 w-full shadow-2xl relative max-h-[90vh] overflow-y-auto ${wide ? 'max-w-3xl' : 'max-w-lg'}`}>
            <button
                type="button"
                onClick={onClose}
                className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <h2 className="text-2xl font-extrabold text-gray-900 dark:text-brand-darkText mb-1 pr-10">{title}</h2>
            {subtitle && <p className="text-xs text-gray-500 mb-6 font-medium">{subtitle}</p>}
            {children}
        </div>
    </div>
);

const Support = () => {
    const [knowledge, setKnowledge] = useState(null);
    const [tickets, setTickets] = useState([]);
    const [loadingKnowledge, setLoadingKnowledge] = useState(true);
    const [loadingTickets, setLoadingTickets] = useState(true);
    const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
    const [guideOpen, setGuideOpen] = useState(false);
    const [videosOpen, setVideosOpen] = useState(false);
    const [activeVideo, setActiveVideo] = useState(null);
    const [activeTicket, setActiveTicket] = useState(null);
    const [ticketDetail, setTicketDetail] = useState(null);
    const [loadingDetail, setLoadingDetail] = useState(false);
    const [replyText, setReplyText] = useState('');
    const [isReplying, setIsReplying] = useState(false);
    const [ticketData, setTicketData] = useState({ category: 'Technical Issue', title: '', description: '', attachment_url: '' });
    const [attachmentName, setAttachmentName] = useState('');
    const [uploading, setUploading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [statusMessage, setStatusMessage] = useState(null);

    const loadKnowledge = useCallback(async () => {
        const { familyId, token } = getAuth();
        if (!familyId || !token) {
            setLoadingKnowledge(false);
            return;
        }
        try {
            setLoadingKnowledge(true);
            const res = await fetch(`${API_BASE}/family-admin/${familyId}/support/knowledge`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) setKnowledge(data.knowledge);
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingKnowledge(false);
        }
    }, []);

    const loadTickets = useCallback(async () => {
        const { familyId, token } = getAuth();
        if (!familyId || !token) {
            setLoadingTickets(false);
            return;
        }
        try {
            setLoadingTickets(true);
            const res = await fetch(`${API_BASE}/family-admin/${familyId}/support-tickets`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) setTickets(data.tickets || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingTickets(false);
        }
    }, []);

    useEffect(() => {
        loadKnowledge();
        loadTickets();
    }, [loadKnowledge, loadTickets]);

    const openTicketThread = async (ticket) => {
        const { familyId, token } = getAuth();
        setActiveTicket(ticket);
        setTicketDetail(null);
        setReplyText('');
        setLoadingDetail(true);
        try {
            const res = await fetch(`${API_BASE}/family-admin/${familyId}/support-tickets/${ticket.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to load ticket');
            setTicketDetail(data);
        } catch (err) {
            setStatusMessage({ type: 'error', text: err.message });
        } finally {
            setLoadingDetail(false);
        }
    };

    const sendReply = async (e) => {
        e.preventDefault();
        if (!activeTicket || !replyText.trim()) return;
        const { familyId, token } = getAuth();
        setIsReplying(true);
        try {
            const res = await fetch(`${API_BASE}/family-admin/${familyId}/support-tickets/${activeTicket.id}/reply`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ message: replyText.trim() })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to send reply');
            setReplyText('');
            await openTicketThread(activeTicket);
            loadTickets();
        } catch (err) {
            setStatusMessage({ type: 'error', text: err.message });
        } finally {
            setIsReplying(false);
        }
    };

    const handleAttachment = async (file) => {
        if (!file) return;
        const { familyId, token } = getAuth();
        setUploading(true);
        setStatusMessage(null);
        try {
            const form = new FormData();
            form.append('file', file);
            const res = await fetch(`${API_BASE}/family-admin/${familyId}/support-attachments`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: form
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Upload failed');
            setTicketData((prev) => ({ ...prev, attachment_url: data.attachment_url }));
            setAttachmentName(file.name);
        } catch (err) {
            setStatusMessage({ type: 'error', text: err.message });
        } finally {
            setUploading(false);
        }
    };

    const handleTicketSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setStatusMessage(null);
        try {
            const { familyId, token } = getAuth();
            const response = await fetch(`${API_BASE}/family-admin/${familyId}/support-tickets`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(ticketData)
            });
            const data = await response.json().catch(() => ({}));
            if (!response.ok) throw new Error(data.error || 'Failed to submit support ticket.');

            setStatusMessage({ type: 'success', text: 'Ticket submitted successfully! Platform support will review it shortly.' });
            loadTickets();
            setTimeout(() => {
                setIsTicketModalOpen(false);
                setTicketData({ category: 'Technical Issue', title: '', description: '', attachment_url: '' });
                setAttachmentName('');
                setStatusMessage(null);
            }, 1800);
        } catch (err) {
            setStatusMessage({ type: 'error', text: err.message });
        } finally {
            setIsSubmitting(false);
        }
    };

    const faqs = knowledge?.faqs || [];
    const contact = knowledge?.contact || {};
    const guide = knowledge?.admin_guide || {};
    const videos = knowledge?.video_tutorials || [];

    return (
        <div className="flex flex-col text-left">
            <header className="mb-10 sm:mb-12">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-brand-darkText leading-tight">Help & Support Center</h1>
                <p className="text-sm text-gray-400 mt-2 font-medium">Guides, tutorials, FAQs, and direct support with the platform team.</p>
            </header>

            <section className="mb-10 rounded-3xl border border-gray-100 dark:border-brand-darkBorder bg-gradient-to-br from-orange-50/80 to-white dark:from-brand-orange/10 dark:to-brand-darkCard p-6 sm:p-8">
                <h3 className="text-sm font-black uppercase tracking-widest text-brand-orange mb-4">Support contact</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Email</p>
                        <a href={`mailto:${contact.email || 'support@kincore.com'}`} className="font-bold text-gray-800 dark:text-brand-darkText hover:text-brand-orange">
                            {contact.email || 'support@kincore.com'}
                        </a>
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Phone</p>
                        <a href={`tel:${String(contact.phone || '').replace(/[^\d+]/g, '')}`} className="font-bold text-gray-800 dark:text-brand-darkText hover:text-brand-orange">
                            {contact.phone || '—'}
                        </a>
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Hours</p>
                        <p className="font-bold text-gray-800 dark:text-brand-darkText">{contact.hours || '—'}</p>
                        {contact.response_sla && <p className="text-xs text-gray-400 mt-1">{contact.response_sla}</p>}
                    </div>
                </div>
            </section>

            <section className="mb-12 sm:mb-16">
                <h3 className="text-xl font-bold text-gray-800 dark:text-brand-darkText mb-8 border-b-2 border-brand-orange inline-block pb-1">Knowledge Base</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <SupportCard
                        title="Admin Guide"
                        description="Step-by-step playbook for running your family space."
                        onClick={() => setGuideOpen(true)}
                        icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>}
                    />
                    <SupportCard
                        title="Video Tutorials"
                        description="Short walkthroughs for admin workflows."
                        badge={`${videos.filter((v) => !v.coming_soon).length} videos`}
                        onClick={() => setVideosOpen(true)}
                        icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>}
                    />
                    <SupportCard
                        title="Submit a Support Ticket"
                        description="Open a ticket for platform administrators."
                        onClick={() => { setStatusMessage(null); setIsTicketModalOpen(true); }}
                        icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg>}
                    />
                </div>
            </section>

            <section className="mb-12 sm:mb-16">
                <div className="flex items-center justify-between mb-8 gap-4 flex-wrap">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-brand-darkText border-b-2 border-brand-orange inline-block pb-1">My Tickets</h3>
                    <button
                        type="button"
                        onClick={loadTickets}
                        className="text-[10px] font-black uppercase tracking-widest text-brand-orange hover:underline"
                    >
                        Refresh
                    </button>
                </div>
                <div className="bg-white dark:bg-brand-darkCard rounded-3xl border border-gray-100 dark:border-brand-darkBorder overflow-hidden">
                    {loadingTickets ? (
                        <p className="p-8 text-sm text-gray-400 font-medium">Loading tickets…</p>
                    ) : tickets.length === 0 ? (
                        <p className="p-8 text-sm text-gray-400 font-medium text-center">No tickets yet. Submit one from Knowledge Base when you need help.</p>
                    ) : (
                        <ul className="divide-y divide-gray-50 dark:divide-brand-darkBorder">
                            {tickets.map((t) => (
                                <li key={t.id}>
                                    <button
                                        type="button"
                                        onClick={() => openTicketThread(t)}
                                        className="w-full text-left px-6 py-5 hover:bg-orange-50/40 dark:hover:bg-brand-orange/5 transition-colors flex flex-col sm:flex-row sm:items-center gap-3 justify-between"
                                    >
                                        <div>
                                            <p className="text-sm font-bold text-gray-800 dark:text-brand-darkText">{t.subject}</p>
                                            <p className="text-[11px] text-gray-400 mt-1">
                                                {t.category} · {t.created_at ? new Date(t.created_at).toLocaleString() : ''}
                                            </p>
                                        </div>
                                        <StatusBadge status={t.status} />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </section>

            <section>
                <h3 className="text-xl font-bold text-gray-800 dark:text-brand-darkText mb-8 border-b-2 border-brand-orange inline-block pb-1">Frequently Asked Questions</h3>
                <div className="max-w-4xl">
                    {loadingKnowledge ? (
                        <p className="text-sm text-gray-400">Loading FAQs…</p>
                    ) : faqs.length === 0 ? (
                        <p className="text-sm text-gray-400">No FAQs published yet.</p>
                    ) : (
                        faqs.map((faq) => (
                            <FAQItem key={faq.id || faq.question} question={faq.question} answer={faq.answer} />
                        ))
                    )}
                </div>
            </section>

            {guideOpen && (
                <ModalShell
                    wide
                    title={guide.title || 'Admin Guide'}
                    subtitle={guide.subtitle}
                    onClose={() => setGuideOpen(false)}
                >
                    <div className="space-y-6">
                        {(guide.sections || []).map((section) => (
                            <article key={section.id || section.title} className="border-b border-gray-50 dark:border-brand-darkBorder pb-5 last:border-none">
                                <h4 className="text-sm font-extrabold text-gray-900 dark:text-brand-darkText mb-2">{section.title}</h4>
                                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-relaxed whitespace-pre-line">{section.body}</p>
                            </article>
                        ))}
                    </div>
                </ModalShell>
            )}

            {videosOpen && (
                <ModalShell
                    wide
                    title="Video Tutorials"
                    subtitle="Click a lesson to play it here."
                    onClose={() => { setVideosOpen(false); setActiveVideo(null); }}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        {videos.map((video) => (
                            <button
                                key={video.id || video.title}
                                type="button"
                                disabled={video.coming_soon || !video.youtube_id}
                                onClick={() => setActiveVideo(video)}
                                className={`text-left rounded-2xl border p-4 transition-all ${
                                    activeVideo?.id === video.id
                                        ? 'border-brand-orange bg-orange-50/50 dark:bg-brand-orange/10'
                                        : 'border-gray-100 dark:border-brand-darkBorder hover:border-brand-orange/40'
                                } ${video.coming_soon ? 'opacity-60 cursor-not-allowed' : ''}`}
                            >
                                <div className="flex items-center justify-between gap-2 mb-2">
                                    <h4 className="text-sm font-bold text-gray-800 dark:text-brand-darkText">{video.title}</h4>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{video.duration}</span>
                                </div>
                                <p className="text-[11px] text-gray-400 leading-relaxed">{video.description}</p>
                                {video.coming_soon && (
                                    <span className="inline-block mt-3 text-[9px] font-black uppercase tracking-widest text-brand-orange">Coming soon</span>
                                )}
                            </button>
                        ))}
                    </div>
                    {activeVideo?.youtube_id && (
                        <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black">
                            <iframe
                                title={activeVideo.title}
                                src={`https://www.youtube.com/embed/${activeVideo.youtube_id}`}
                                className="w-full h-full"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                        </div>
                    )}
                </ModalShell>
            )}

            {activeTicket && (
                <ModalShell
                    wide
                    title={ticketDetail?.subject || activeTicket.subject}
                    subtitle={`${activeTicket.category || ''} · Ticket ${String(activeTicket.id).slice(0, 8)}`}
                    onClose={() => { setActiveTicket(null); setTicketDetail(null); setReplyText(''); }}
                >
                    <div className="flex items-center gap-3 mb-6">
                        <StatusBadge status={ticketDetail?.status || activeTicket.status} />
                        {ticketDetail?.attachment_url && (
                            <a
                                href={ticketDetail.attachment_url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[10px] font-black uppercase tracking-widest text-brand-orange hover:underline"
                            >
                                View attachment
                            </a>
                        )}
                    </div>

                    {loadingDetail ? (
                        <p className="text-sm text-gray-400">Loading conversation…</p>
                    ) : (
                        <>
                            <div className="space-y-3 max-h-[40vh] overflow-y-auto mb-6 pr-1">
                                {(ticketDetail?.messages || []).length === 0 && (
                                    <div className="rounded-2xl bg-gray-50 dark:bg-brand-darkBg p-4 text-xs text-gray-500">
                                        {ticketDetail?.description || 'No messages yet.'}
                                    </div>
                                )}
                                {(ticketDetail?.messages || []).map((m) => {
                                    const mine = m.sender_id === getAuth().user?.id;
                                    const name = `${m.sender?.first_name || ''} ${m.sender?.last_name || ''}`.trim() || (mine ? 'You' : 'Support');
                                    return (
                                        <div
                                            key={m.id}
                                            className={`rounded-2xl p-4 text-xs leading-relaxed ${
                                                mine
                                                    ? 'bg-orange-50 dark:bg-brand-orange/10 text-gray-700 dark:text-brand-darkText ml-6'
                                                    : 'bg-gray-50 dark:bg-brand-darkBg text-gray-600 dark:text-gray-300 mr-6'
                                            }`}
                                        >
                                            <div className="flex justify-between gap-3 mb-2">
                                                <span className="font-bold">{name}</span>
                                                <span className="text-[10px] text-gray-400">{m.created_at ? new Date(m.created_at).toLocaleString() : ''}</span>
                                            </div>
                                            <p className="whitespace-pre-wrap">{m.message}</p>
                                        </div>
                                    );
                                })}
                            </div>

                            {String(ticketDetail?.status || '').toLowerCase() !== 'closed' ? (
                                <form onSubmit={sendReply} className="space-y-3">
                                    <textarea
                                        value={replyText}
                                        onChange={(e) => setReplyText(e.target.value)}
                                        rows={3}
                                        required
                                        placeholder="Write a reply to platform support…"
                                        className="w-full bg-gray-50 dark:bg-brand-darkBg border border-gray-100 dark:border-brand-darkBorder rounded-xl py-3 px-4 text-sm font-medium outline-none focus:border-brand-orange/50 resize-none"
                                    />
                                    <button
                                        type="submit"
                                        disabled={isReplying || !replyText.trim()}
                                        className="w-full bg-brand-orange text-white py-3 rounded-xl font-bold uppercase text-xs tracking-widest hover:bg-orange-600 disabled:opacity-50"
                                    >
                                        {isReplying ? 'Sending…' : 'Send Reply'}
                                    </button>
                                </form>
                            ) : (
                                <p className="text-xs text-gray-400 font-medium">This ticket is closed. Open a new ticket if you still need help.</p>
                            )}
                        </>
                    )}
                </ModalShell>
            )}

            {isTicketModalOpen && (
                <ModalShell
                    title="Submit Support Ticket"
                    subtitle="Platform support will review your issue and respond shortly."
                    onClose={() => setIsTicketModalOpen(false)}
                >
                    {statusMessage && (
                        <div className={`p-4 rounded-xl mb-6 text-sm font-bold ${statusMessage.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                            {statusMessage.text}
                        </div>
                    )}

                    <form onSubmit={handleTicketSubmit} className="space-y-5">
                        <div>
                            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Category</label>
                            <select
                                value={ticketData.category}
                                onChange={(e) => setTicketData({ ...ticketData, category: e.target.value })}
                                className="w-full bg-gray-50 dark:bg-brand-darkBg border border-gray-100 dark:border-brand-darkBorder rounded-xl py-3 px-4 text-sm font-medium outline-none focus:border-brand-orange/50"
                            >
                                <option>Technical Issue</option>
                                <option>Billing & Subscription</option>
                                <option>Feature Request</option>
                                <option>Account Security</option>
                                <option>Other</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Title / Subject</label>
                            <input
                                required
                                type="text"
                                value={ticketData.title}
                                onChange={(e) => setTicketData({ ...ticketData, title: e.target.value })}
                                placeholder="Brief summary of the issue..."
                                className="w-full bg-gray-50 dark:bg-brand-darkBg border border-gray-100 dark:border-brand-darkBorder rounded-xl py-3 px-4 text-sm font-medium outline-none focus:border-brand-orange/50"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Description</label>
                            <textarea
                                required
                                rows={4}
                                value={ticketData.description}
                                onChange={(e) => setTicketData({ ...ticketData, description: e.target.value })}
                                placeholder="Provide details about what you need help with..."
                                className="w-full bg-gray-50 dark:bg-brand-darkBg border border-gray-100 dark:border-brand-darkBorder rounded-xl py-3 px-4 text-sm font-medium outline-none focus:border-brand-orange/50 resize-none"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Attachment</label>
                            <input
                                type="file"
                                accept="image/*,.pdf,.png,.jpg,.jpeg,.webp,.gif,.mp4,.mov"
                                onChange={(e) => handleAttachment(e.target.files?.[0])}
                                className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-[10px] file:font-black file:uppercase file:tracking-widest file:bg-orange-50 file:text-brand-orange hover:file:bg-orange-100"
                            />
                            {uploading && <p className="text-[11px] text-gray-400 mt-2">Uploading…</p>}
                            {attachmentName && !uploading && (
                                <p className="text-[11px] text-emerald-600 mt-2 font-bold">Attached: {attachmentName}</p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting || uploading}
                            className="w-full bg-brand-orange text-white py-4 rounded-xl font-bold uppercase text-xs tracking-widest hover:bg-orange-600 active:scale-95 transition-all disabled:opacity-50"
                        >
                            {isSubmitting ? 'Submitting...' : 'Submit Ticket'}
                        </button>
                    </form>
                </ModalShell>
            )}
        </div>
    );
};

export default Support;
