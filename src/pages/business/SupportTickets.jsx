import React, { useState, useEffect, useCallback } from 'react';
import { Search, ChevronRight, ChevronDown, CheckCircle, ShieldAlert, Clock, Loader2 } from 'lucide-react';
const API_BASE = import.meta.env.VITE_API_BASE_URL || `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}`;

const Badge = ({ children }) => {
    const variants = {
        open: 'bg-[#FFE8E2] dark:bg-brand-orange/20 text-[#FF6D4D] dark:text-brand-orange',
        in_progress: 'bg-yellow-50 dark:bg-yellow-900/10 text-yellow-500',
        resolved: 'bg-green-50 dark:bg-green-900/10 text-green-500',
        closed: 'bg-gray-100 dark:bg-brand-darkBg text-gray-400 dark:text-gray-500'
    };
    
    const key = (children || '').toLowerCase();
    
    return (
        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-colors ${variants[key] || variants.closed}`}>
            {children}
        </span>
    );
};

const SupportTickets = () => {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const [expandedTicket, setExpandedTicket] = useState(null);
    const [ticketDetails, setTicketDetails] = useState({});
    const [replyText, setReplyText] = useState('');
    const [isReplying, setIsReplying] = useState(false);

    const fetchTickets = useCallback(async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE}/admin/support/tickets`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) {
                setTickets(data);
            }
        } catch (err) {
            console.error('Error fetching tickets:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTickets();
    }, [fetchTickets]);

    const loadTicketDetail = async (id) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE}/admin/support/tickets/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) {
                setTicketDetails((prev) => ({ ...prev, [id]: data }));
            }
        } catch (err) {
            console.error('Failed to load ticket detail:', err);
        }
    };

    const toggleExpand = (id) => {
        const next = expandedTicket === id ? null : id;
        setExpandedTicket(next);
        setReplyText('');
        if (next) loadTicketDetail(next);
    };

    const handleUpdateStatus = async (id, status) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE}/admin/support/tickets/${id}/reply`, {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ message: `Status updated to ${status}`, is_internal: true, status })
            });
            
            if (response.ok) {
                fetchTickets();
                if (expandedTicket === id) loadTicketDetail(id);
            }
        } catch (err) {
            console.error('Failed to update status:', err);
        }
    };

    const handleReply = async (id) => {
        if (!replyText.trim()) return;
        setIsReplying(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE}/admin/support/tickets/${id}/reply`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ message: replyText.trim(), is_internal: false, status: 'in_progress' })
            });
            if (response.ok) {
                setReplyText('');
                fetchTickets();
                loadTicketDetail(id);
            }
        } catch (err) {
            console.error('Failed to reply:', err);
        } finally {
            setIsReplying(false);
        }
    };

    const filteredTickets = tickets.filter(t => 
        (filterStatus === 'All' || (t.status && t.status.toLowerCase() === filterStatus.toLowerCase())) &&
        ((t.subject && t.subject.toLowerCase().includes(searchQuery.toLowerCase())) || 
         (t.category && t.category.toLowerCase().includes(searchQuery.toLowerCase())))
    );

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl pb-20 px-4 sm:px-0">
            <header>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-brand-darkText transition-colors">Support Tickets</h1>
            </header>

            <section className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-brand-darkText leading-none transition-colors">Active Tickets</h2>
                    <div className="flex items-center space-x-3">
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-orange transition-colors" size={16} />
                            <input
                                type="text"
                                placeholder="Search Title or Category..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 pr-4 py-2 bg-white dark:bg-brand-darkCard border border-gray-100 dark:border-brand-darkBorder rounded-xl text-xs font-bold text-gray-900 dark:text-brand-darkText shadow-sm focus:ring-2 focus:ring-brand-orange/10 outline-none transition-all w-60"
                            />
                        </div>
                        <div className="flex bg-gray-50 dark:bg-brand-darkBg p-1 rounded-xl border border-gray-100 dark:border-brand-darkBorder">
                            {['All', 'Open', 'Resolved', 'Closed'].map((status) => (
                                <button
                                    key={status}
                                    onClick={() => setFilterStatus(status)}
                                    className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${filterStatus === status ? 'bg-white dark:bg-brand-darkCard text-brand-orange shadow-sm' : 'text-gray-400'}`}
                                >
                                    {status}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-brand-darkCard rounded-3xl border border-gray-100 dark:border-brand-darkBorder shadow-sm overflow-hidden transition-colors">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-gray-50/30 dark:bg-brand-darkBg/50 border-b border-gray-100 dark:border-brand-darkBorder transition-colors">
                                    <th className="px-6 py-5 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Ticket ID</th>
                                    <th className="px-6 py-5 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Category</th>
                                    <th className="px-6 py-5 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Subject / Title</th>
                                    <th className="px-6 py-5 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Submitted By</th>
                                    <th className="px-6 py-5 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider text-center">Status</th>
                                    <th className="px-6 py-5 text-xs font-bold text-brand-orange uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-brand-darkBorder relative min-h-[200px]">
                                {loading && (
                                    <div className="absolute inset-0 bg-white/50 dark:bg-brand-darkCard/50 flex items-center justify-center z-10">
                                        <Loader2 className="animate-spin text-brand-orange" size={32} />
                                    </div>
                                )}
                                {filteredTickets.map((ticket) => (
                                    <React.Fragment key={ticket.id}>
                                        <tr
                                            onClick={() => toggleExpand(ticket.id)}
                                            className="hover:bg-gray-50/50 dark:hover:bg-brand-darkBg transition-colors group cursor-pointer"
                                        >
                                            <td className="px-6 py-5 text-[10px] font-bold text-gray-400 transition-colors uppercase">
                                                <div className="flex items-center space-x-2">
                                                    {expandedTicket === ticket.id ? <ChevronDown size={14} className="text-brand-orange" /> : <ChevronRight size={14} className="group-hover:text-brand-orange transition-colors" />}
                                                    <span>TICKET-{ticket.id.toString().substring(0, 5)}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-xs font-bold text-gray-500 dark:text-gray-400">
                                                {ticket.category}
                                            </td>
                                            <td className="px-6 py-5 text-sm font-semibold text-gray-700 dark:text-gray-300 group-hover:text-brand-orange transition-colors">
                                                {ticket.subject}
                                            </td>
                                            <td className="px-6 py-5 text-sm font-semibold text-gray-700 dark:text-gray-300">
                                                {ticket.user?.first_name} {ticket.user?.last_name}
                                                <span className="text-[10px] text-gray-400 block font-normal">{ticket.user?.email}</span>
                                            </td>
                                            <td className="px-6 py-5 text-center">
                                                <Badge>{ticket.status}</Badge>
                                            </td>
                                            <td className="px-6 py-5 text-sm font-bold text-brand-orange text-right space-x-3 uppercase tracking-tight transition-all">
                                                {ticket.status !== 'resolved' && ticket.status !== 'closed' && (
                                                    <button onClick={(e) => { e.stopPropagation(); handleUpdateStatus(ticket.id, 'resolved'); }} className="hover:underline">
                                                        Resolve
                                                    </button>
                                                )}
                                                {ticket.status !== 'closed' && (
                                                    <button onClick={(e) => { e.stopPropagation(); handleUpdateStatus(ticket.id, 'closed'); }} className="text-gray-400 hover:text-gray-600">
                                                        Close
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                        {expandedTicket === ticket.id && (
                                            <tr className="bg-gray-50/30 dark:bg-brand-darkBg/30 animate-in slide-in-from-top-2 duration-300">
                                                <td colSpan="6" className="px-8 py-8">
                                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                                                        <div className="space-y-6">
                                                            <div>
                                                                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center space-x-2">
                                                                    <ShieldAlert size={14} className="text-brand-orange" />
                                                                    <span>Ticket Details</span>
                                                                </h4>
                                                                <div className="bg-white dark:bg-brand-darkCard p-6 rounded-2xl border border-gray-100 dark:border-brand-darkBorder space-y-4">
                                                                    <div className="space-y-2">
                                                                        <span className="text-xs font-bold text-gray-400 uppercase">Description</span>
                                                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-wrap">
                                                                            {ticket.description}
                                                                        </p>
                                                                    </div>
                                                                    {ticket.attachment_url && (
                                                                        <div className="pt-4 border-t border-gray-50">
                                                                            <span className="text-xs font-bold text-gray-400 uppercase block mb-2">Attachment</span>
                                                                            <a href={ticket.attachment_url} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-brand-orange hover:underline">
                                                                                View Attachment
                                                                            </a>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center space-x-2">
                                                                    <Clock size={14} className="text-brand-orange" />
                                                                    <span>Ticket Meta</span>
                                                                </h4>
                                                                <div className="bg-white dark:bg-brand-darkCard p-6 rounded-2xl border border-gray-100 dark:border-brand-darkBorder space-y-4">
                                                                    <div className="flex justify-between border-b border-gray-50 pb-4">
                                                                        <span className="text-xs font-bold text-gray-400 uppercase">Created At</span>
                                                                        <span className="text-xs font-black text-gray-800 dark:text-brand-darkText uppercase">
                                                                            {new Date(ticket.created_at).toLocaleString()}
                                                                        </span>
                                                                    </div>
                                                                    <div className="flex justify-between border-b border-gray-50 pb-4">
                                                                        <span className="text-xs font-bold text-gray-400 uppercase">Family Space ID</span>
                                                                        <span className="text-xs font-black text-gray-800 dark:text-brand-darkText uppercase truncate max-w-[200px]">
                                                                            {ticket.family_space_id}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="space-y-4">
                                                            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Conversation</h4>
                                                            <div className="bg-white dark:bg-brand-darkCard p-4 rounded-2xl border border-gray-100 dark:border-brand-darkBorder max-h-64 overflow-y-auto space-y-3">
                                                                {(ticketDetails[ticket.id]?.messages || []).length === 0 ? (
                                                                    <p className="text-xs text-gray-400 p-2">No messages yet.</p>
                                                                ) : (
                                                                    (ticketDetails[ticket.id]?.messages || []).map((m) => (
                                                                        <div key={m.id} className={`rounded-xl p-3 text-xs ${m.is_internal ? 'bg-amber-50 text-amber-800' : 'bg-gray-50 dark:bg-brand-darkBg text-gray-600 dark:text-gray-300'}`}>
                                                                            <div className="flex justify-between mb-1 gap-2">
                                                                                <span className="font-bold">
                                                                                    {m.sender?.first_name || 'User'} {m.sender?.last_name || ''}
                                                                                    {m.is_internal ? ' (internal)' : ''}
                                                                                </span>
                                                                                <span className="text-[10px] text-gray-400">{m.created_at ? new Date(m.created_at).toLocaleString() : ''}</span>
                                                                            </div>
                                                                            <p className="whitespace-pre-wrap">{m.message}</p>
                                                                        </div>
                                                                    ))
                                                                )}
                                                            </div>
                                                            <textarea
                                                                value={expandedTicket === ticket.id ? replyText : ''}
                                                                onChange={(e) => setReplyText(e.target.value)}
                                                                onClick={(e) => e.stopPropagation()}
                                                                rows={3}
                                                                placeholder="Reply to family admin (visible to them)…"
                                                                className="w-full bg-white dark:bg-brand-darkCard border border-gray-100 dark:border-brand-darkBorder rounded-xl py-3 px-4 text-sm outline-none focus:ring-2 focus:ring-brand-orange/10 resize-none"
                                                            />
                                                            <button
                                                                type="button"
                                                                disabled={isReplying || !replyText.trim()}
                                                                onClick={(e) => { e.stopPropagation(); handleReply(ticket.id); }}
                                                                className="w-full bg-brand-orange text-white py-3 rounded-xl font-bold uppercase text-[10px] tracking-widest disabled:opacity-50"
                                                            >
                                                                {isReplying ? 'Sending…' : 'Send Reply'}
                                                            </button>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default SupportTickets;
