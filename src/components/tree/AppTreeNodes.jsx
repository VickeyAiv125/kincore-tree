import React, { useEffect, useState } from 'react';
import {
    Bell,
    Briefcase,
    Cake,
    Heart,
    MapPin,
    Menu,
    Plus,
    Search,
    UserRoundPlus,
    X,
} from 'lucide-react';

export const getLoggedInUserId = () => {
    try {
        const u = JSON.parse(localStorage.getItem('user') || '{}');
        if (u?.id) return String(u.id);
        const t = new URLSearchParams(window.location.search).get('token')
            || localStorage.getItem('token');
        if (!t) return null;
        const payload = JSON.parse(atob(t.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
        return String(payload.id || payload.sub || payload.user_id || '');
    } catch {
        return null;
    }
};

export const getPersonName = (p) =>
    p?.full_name || `${p?.first_name || ''} ${p?.last_name || ''}`.trim() || 'Unknown';

export const getFirstName = (p) => {
    if (p?.first_name) return p.first_name;
    return getPersonName(p).split(/\s+/)[0] || 'Unknown';
};

export const getAvatar = (p) => {
    const n = getPersonName(p);
    return p?.avatar_url
        || `https://ui-avatars.com/api/?name=${encodeURIComponent(n)}&background=E8B89A&color=5C3A2E&bold=true`;
};

export const isYou = (person, userId) => {
    if (!person || !userId) return false;
    return String(person.claimed_by || person.user_id || '') === String(userId);
};

export const normalizeGender = (person) => {
    const g = String(person?.gender || '').toLowerCase();
    if (['m', 'male', 'man', 'boy'].includes(g)) return 'male';
    if (['f', 'female', 'woman', 'girl'].includes(g)) return 'female';
    return null;
};

/** Returns { text, accent } for life/age caption under avatar. */
export const formatLifeMeta = (person) => {
    const dob = person?.birth_date || person?.date_of_birth;
    if (!dob) return null;
    const year = new Date(dob).getFullYear();
    if (Number.isNaN(year)) return null;
    const deceased = person?.is_alive === false || person?.status === 'deceased';
    const dod = person?.death_date || person?.date_of_death;
    const deathYear = dod ? new Date(dod).getFullYear() : null;
    if (deceased) {
        return {
            text: `${year} - ${deathYear && !Number.isNaN(deathYear) ? deathYear : '?'}`,
            accent: false,
        };
    }
    const age = new Date().getFullYear() - year;
    if (age >= 0 && age <= 35) {
        return { text: `${age} y/o`, accent: true };
    }
    return { text: `${year} - Present`, accent: false };
};

export const groupGenerationUnits = (gen, spouseOf) => {
    const seen = new Set();
    const units = [];
    (gen || []).forEach((person) => {
        if (seen.has(person.id)) return;
        const spouseIds = spouseOf?.[person.id] || [];
        const spouse = spouseIds
            .map((id) => gen.find((p) => p.id === id))
            .find(Boolean);
        if (spouse) {
            seen.add(person.id);
            seen.add(spouse.id);
            units.push({ type: 'couple', a: person, b: spouse });
        } else {
            seen.add(person.id);
            units.push({ type: 'person', person });
        }
    });
    return units;
};

const GenderBadge = ({ gender }) => {
    if (!gender) return null;
    const male = gender === 'male';
    return (
        <span
            className={`absolute bottom-0.5 right-0.5 w-[18px] h-[18px] rounded-full border-[2px] border-white dark:border-brand-darkCard flex items-center justify-center text-[9px] font-black shadow-sm ${
                male ? 'bg-[#5B9CFF] text-white' : 'bg-[#FF6BA8] text-white'
            }`}
            aria-hidden="true"
        >
            {male ? '♂' : '♀'}
        </span>
    );
};

export const AppAvatarNode = React.forwardRef(function AppAvatarNode(
    { person, isActive, isCurrentUser, onClick, muted = false },
    ref
) {
    const name = getFirstName(person);
    const life = formatLifeMeta(person);
    const gender = normalizeGender(person);

    return (
        <button
            type="button"
            ref={ref}
            onClick={onClick}
            className={`flex flex-col items-center relative bg-transparent border-0 p-0 cursor-pointer w-[76px] ${
                muted ? 'opacity-50 grayscale-[0.35]' : ''
            }`}
        >
            {isCurrentUser && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 px-2.5 py-[3px] rounded-full bg-[#F0C43A] text-white text-[9px] font-extrabold tracking-wide shadow-[0_2px_8px_rgba(240,196,58,0.45)] uppercase whitespace-nowrap">
                    YOU
                </span>
            )}
            {/* Circular portrait icon */}
            <span
                className={`relative w-[68px] h-[68px] shrink-0 rounded-full bg-[#F3EDE6] dark:bg-brand-darkBorder ${
                    isActive
                        ? 'ring-[3px] ring-[#FF6A2B] ring-offset-[3px] ring-offset-white dark:ring-offset-[#12141C]'
                        : 'shadow-[0_6px_16px_rgba(26,28,46,0.12)] ring-[3px] ring-white dark:ring-brand-darkBorder'
                }`}
            >
                <span className="absolute inset-0 rounded-full overflow-hidden">
                    <img
                        src={getAvatar(person)}
                        alt={name}
                        className="w-full h-full object-cover"
                        draggable={false}
                    />
                </span>
                <GenderBadge gender={gender} />
            </span>
            {/* Title below icon */}
            <span className="block w-[88px] -mx-[6px] text-[13px] font-bold text-[#1F1D2B] dark:text-brand-darkText leading-[1.2] truncate text-center mt-2">
                {name}
            </span>
            {life ? (
                <span
                    className={`block w-[88px] -mx-[6px] text-[11px] font-semibold leading-[1.25] truncate text-center mt-0.5 ${
                        life.accent ? 'text-[#FF6A2B]' : 'text-[#9A96A3] dark:text-brand-darkMuted'
                    }`}
                >
                    {life.text}
                </span>
            ) : (
                <span className="block h-[14px] mt-0.5" aria-hidden="true" />
            )}
        </button>
    );
});

export const AppCoupleUnit = ({
    a,
    b,
    selectedId,
    currentUserId,
    onSelect,
    carded = false,
    setNodeRef,
}) => {
    const isYouCouple = isYou(a, currentUserId) || isYou(b, currentUserId);
    const showCard = carded || isYouCouple;

    const inner = (
        <div className="flex items-start justify-center gap-0 px-1">
            <AppAvatarNode
                ref={(el) => setNodeRef?.(a.id, el)}
                person={a}
                isActive={selectedId === a.id}
                isCurrentUser={isYou(a, currentUserId)}
                onClick={() => onSelect?.(a)}
            />
            {/* Couple connector: line + heart (prototype) */}
            <div
                className="relative w-[48px] h-[68px] shrink-0 flex items-center justify-center pointer-events-none"
                aria-hidden="true"
            >
                <span className="absolute left-0 right-0 top-[33px] h-[2px] bg-[#FF8FB8] z-[1]" />
                <span
                    className={`relative z-10 w-7 h-7 rounded-full bg-[#FFE4EE] dark:bg-[#3A2430] text-[#FF4F8D] flex items-center justify-center border-[2.5px] shadow-[0_2px_6px_rgba(255,79,141,0.28)] ${
                        showCard ? 'border-white dark:border-brand-darkCard' : 'border-[#F4F2EF] dark:border-[#12141C]'
                    }`}
                >
                    <Heart size={12} fill="currentColor" strokeWidth={0} />
                </span>
            </div>
            <AppAvatarNode
                ref={(el) => setNodeRef?.(b.id, el)}
                person={b}
                isActive={selectedId === b.id}
                isCurrentUser={isYou(b, currentUserId)}
                onClick={() => onSelect?.(b)}
            />
        </div>
    );

    if (!showCard) return inner;

    // Square / rounded-rect card with orange → amber gradient border (prototype)
    return (
        <div
            className="relative rounded-[26px] p-[2.5px]"
            style={{
                background:
                    'linear-gradient(135deg, #FF6A2B 0%, #FF8A4C 42%, #F0C43A 100%)',
                boxShadow:
                    '0 14px 34px rgba(255, 106, 43, 0.22), 0 4px 14px rgba(26, 28, 46, 0.08)',
            }}
        >
            <div className="rounded-[23.5px] bg-white dark:bg-brand-darkCard px-3.5 pt-4 pb-3.5">
                {inner}
            </div>
        </div>
    );
};

export const AppAddChildNode = ({ onClick }) => (
    <button
        type="button"
        onClick={onClick}
        className="flex flex-col items-center gap-1 bg-transparent border-0 p-0 cursor-pointer"
    >
        <span className="w-[68px] h-[68px] rounded-full border-[2.5px] border-dashed border-[#E8C547] text-[#E8C547] flex items-center justify-center bg-[#FFF8E0]">
            <Plus size={24} strokeWidth={2.4} />
        </span>
        <span className="text-[13px] font-bold text-[#FF622E] mt-0.5">Add Child</span>
    </button>
);

export const AppTreeTabs = ({ value, onChange, onFilterClick }) => {
    const tabs = [
        { id: 'full', label: 'Full View' },
        { id: 'lineage', label: 'Direct Lineage' },
        { id: 'birthdays', label: 'Birthdays' },
    ];
    return (
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar px-1 pb-0.5">
            {tabs.map((tab) => {
                const active = value === tab.id;
                return (
                    <button
                        key={tab.id}
                        type="button"
                        onClick={() => onChange?.(tab.id)}
                        className={`shrink-0 px-[18px] py-[9px] rounded-full text-[13px] font-semibold transition-colors ${
                            active
                                ? 'bg-[#FF6A2B] text-white shadow-[0_6px_16px_rgba(255,106,43,0.35)]'
                                : 'bg-white dark:bg-brand-darkCard text-[#6F6A78] dark:text-brand-darkMuted border border-[#E6E1DB] dark:border-brand-darkBorder'
                        }`}
                    >
                        {tab.label}
                    </button>
                );
            })}
            <button
                type="button"
                onClick={onFilterClick}
                className="shrink-0 ml-auto w-9 h-9 rounded-full bg-white dark:bg-brand-darkCard border border-[#E6E1DB] dark:border-brand-darkBorder text-[#6F6A78] dark:text-brand-darkMuted flex items-center justify-center"
                aria-label="Filter"
            >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                    <path d="M4 6h16M7 12h10M10 18h4" />
                </svg>
            </button>
        </div>
    );
};

/** App tree header: menu · family title · search / notifications */
export const AppTreeHeader = ({
    familyName = 'Family Tree',
    generations = 0,
    members = 0,
    onSearchClick,
    onNotifyClick,
    hasNotifications = false,
    searchActive = false,
}) => (
    <header className="flex items-center gap-2 px-1">
        <button
            type="button"
            className="w-9 h-9 bg-transparent border-0 text-[#2A2734] dark:text-brand-darkText flex items-center justify-center shrink-0 p-0"
            aria-label="Menu"
            onClick={() => {
                try {
                    window.parent?.postMessage({ type: 'kincore-tree-menu' }, '*');
                } catch (_) { /* ignore */ }
            }}
        >
            <Menu size={22} strokeWidth={2.2} />
        </button>
        <div className="flex-1 min-w-0 text-center">
            <h1 className="text-[17px] font-extrabold text-[#1F1D2B] dark:text-brand-darkText truncate leading-tight">
                {familyName}
            </h1>
            <p className="text-[12px] font-medium text-[#9A96A3] dark:text-brand-darkMuted mt-0.5">
                {generations} Generations • {members} Members
            </p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
            <button
                type="button"
                className={`w-9 h-9 rounded-full border flex items-center justify-center transition-colors ${
                    searchActive
                        ? 'bg-[#FF6A2B] border-[#FF6A2B] text-white'
                        : 'bg-[#FFF1EA] border-[#FFD8C4] text-[#FF6A2B]'
                }`}
                aria-label="Search family members"
                onClick={onSearchClick}
            >
                <Search size={16} strokeWidth={2.4} />
            </button>
            <button
                type="button"
                className="relative w-9 h-9 rounded-full bg-[#FFF1EA] border border-[#FFD8C4] text-[#FF6A2B] flex items-center justify-center"
                aria-label="Notifications"
                onClick={() => {
                    if (onNotifyClick) {
                        onNotifyClick();
                        return;
                    }
                    try {
                        window.parent?.postMessage({ type: 'kincore-tree-notifications' }, '*');
                    } catch (_) { /* ignore */ }
                }}
            >
                <Bell size={16} strokeWidth={2.4} />
                {hasNotifications && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#FF3B30] border border-white" />
                )}
            </button>
        </div>
    </header>
);

/** Search panel under the app tree header */
export const AppTreeMemberSearch = ({
    open,
    query,
    onQueryChange,
    results = [],
    onSelect,
    onClose,
}) => {
    if (!open) return null;

    return (
        <div className="mt-1 rounded-[18px] bg-white dark:bg-brand-darkCard border border-[#EEEAE4] dark:border-brand-darkBorder shadow-[0_12px_28px_rgba(40,30,20,0.12)] overflow-hidden">
            <div className="flex items-center gap-2 px-3 py-2.5 border-b border-[#F0EBE5] dark:border-brand-darkBorder">
                <Search size={16} className="text-[#9A96A3] shrink-0" />
                <input
                    autoFocus
                    value={query}
                    onChange={(e) => onQueryChange?.(e.target.value)}
                    placeholder="Search family member..."
                    className="flex-1 min-w-0 bg-transparent border-0 outline-none text-[14px] font-semibold text-[#1F1D2B] dark:text-brand-darkText placeholder:text-[#B0ACB8]"
                />
                <button
                    type="button"
                    onClick={onClose}
                    className="w-8 h-8 rounded-full bg-[#F4F2EF] dark:bg-brand-darkBg text-[#6F6A78] dark:text-brand-darkMuted flex items-center justify-center border-0"
                    aria-label="Close search"
                >
                    <X size={15} />
                </button>
            </div>
            <div className="max-h-[280px] overflow-y-auto">
                {query.trim().length < 1 && results.length === 0 ? (
                    <p className="px-4 py-5 text-[12px] font-medium text-[#9A96A3] text-center">
                        Type a name to find someone in this tree
                    </p>
                ) : results.length === 0 ? (
                    <p className="px-4 py-5 text-[12px] font-medium text-[#9A96A3] text-center">
                        No members match “{query.trim()}”
                    </p>
                ) : (
                    results.map((person) => {
                        const name = getPersonName(person);
                        const life = formatLifeMeta(person);
                        return (
                            <button
                                key={person.id}
                                type="button"
                                onClick={() => onSelect?.(person)}
                                className="w-full text-left px-3 py-2.5 flex items-center gap-3 hover:bg-[#FFF6F1] dark:hover:bg-brand-darkBg border-0 bg-transparent border-b border-[#F7F3EE] dark:border-brand-darkBorder last:border-0"
                            >
                                <img
                                    src={getAvatar(person)}
                                    alt={name}
                                    className="w-11 h-11 rounded-full object-cover border-2 border-white shadow-sm"
                                />
                                <div className="flex-1 min-w-0">
                                    <p className="text-[14px] font-bold text-[#1F1D2B] dark:text-brand-darkText truncate">{name}</p>
                                    <p className="text-[11px] font-medium text-[#9A96A3] truncate">
                                        {[person.gender, life?.text].filter(Boolean).join(' • ') || 'Family member'}
                                    </p>
                                </div>
                                <span className="text-[11px] font-bold text-[#FF6A2B] shrink-0">View</span>
                            </button>
                        );
                    })
                )}
            </div>
        </div>
    );
};

const toDateInput = (value) => {
    const raw = String(value || '').trim();
    const match = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
    return match ? `${match[1]}-${match[2]}-${match[3]}` : '';
};

/** Bottom sheet: check profile before adding relatives */
export const AppMemberProfileSheet = ({
    member,
    onClose,
    onAddRelative,
    onSave,
}) => {
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [draft, setDraft] = useState({
        name: '',
        dob: '',
        gender: '',
        pob: '',
        occupation: '',
        notes: '',
    });

    useEffect(() => {
        if (!member) return;
        const pob = member.pob || member.place_of_birth || '';
        setDraft({
            name: member.name || getPersonName(member),
            dob: toDateInput(member.dob || member.birth_date || member.date_of_birth),
            gender: member.gender || '',
            pob: pob === 'Unknown' ? '' : pob,
            occupation: member.occupation && member.occupation !== 'Family Member'
                ? member.occupation
                : (member.role && member.role !== 'Family Member' ? member.role : ''),
            notes: member.notes || member.bio || member.bio_notes || '',
        });
        setEditing(false);
        setError('');
        setSaving(false);
    }, [member]);

    if (!member) return null;

    const name = member.name || getPersonName(member);
    const avatar = member.avatar || getAvatar(member);
    const dob = member.dob || member.birth_date || member.date_of_birth || '—';
    const pob = member.pob || member.place_of_birth || '—';
    const occupation = member.occupation || member.role || '—';
    const notes = member.notes || member.bio || member.bio_notes || '';

    const saveProfile = async () => {
        if (!onSave) return;
        setSaving(true);
        setError('');
        try {
            await onSave(draft);
            setEditing(false);
        } catch (err) {
            setError(err?.message || 'Could not save this profile');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[70] flex items-end justify-center">
            <button
                type="button"
                className="absolute inset-0 bg-black/35 border-0"
                aria-label="Close profile"
                onClick={onClose}
            />
            <div className="relative w-full max-w-lg mx-auto rounded-t-[24px] bg-white dark:bg-brand-darkCard shadow-2xl px-5 pt-3 pb-6 max-h-[78vh] overflow-y-auto">
                <div className="w-10 h-1 rounded-full bg-[#E6E1DB] dark:bg-brand-darkBorder mx-auto mb-4" />
                <div className="flex items-start justify-between gap-3 mb-4">
                    <div>
                        <p className="text-[11px] font-bold uppercase tracking-widest text-[#9A96A3]">Profile preview</p>
                        <h2 className="text-[20px] font-extrabold text-[#1F1D2B] dark:text-brand-darkText leading-tight mt-0.5">{name}</h2>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-9 h-9 rounded-full bg-[#F4F2EF] dark:bg-brand-darkBg border-0 text-[#6F6A78] dark:text-brand-darkMuted flex items-center justify-center shrink-0"
                        aria-label="Close"
                    >
                        <X size={16} />
                    </button>
                </div>

                <div className="flex items-center gap-3 mb-5">
                    <img
                        src={avatar}
                        alt={name}
                        className="w-[72px] h-[72px] rounded-full object-cover border-[3px] border-[#FF6A2B]/25"
                    />
                    <div className="min-w-0">
                        <p className="text-[13px] font-semibold text-[#6F6A78]">
                            {member.gender || 'Family member'}
                        </p>
                        <p className="text-[12px] font-medium text-[#9A96A3] mt-0.5 truncate">
                            {member.branch || 'Family tree'}
                        </p>
                    </div>
                </div>

                <div className="space-y-3 mb-5">
                    <div className="flex items-center gap-2.5 text-[13px] text-[#2A2734] dark:text-brand-darkText">
                        <Cake size={16} className="text-[#9A96A3] shrink-0" />
                        <span className="font-medium text-[#9A96A3] w-20 shrink-0">Born</span>
                        <span className="font-semibold">{dob || '—'}</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-[13px] text-[#2A2734] dark:text-brand-darkText">
                        <MapPin size={16} className="text-[#9A96A3] shrink-0" />
                        <span className="font-medium text-[#9A96A3] w-20 shrink-0">Location</span>
                        <span className="font-semibold truncate">{pob || '—'}</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-[13px] text-[#2A2734] dark:text-brand-darkText">
                        <Briefcase size={16} className="text-[#9A96A3] shrink-0" />
                        <span className="font-medium text-[#9A96A3] w-20 shrink-0">Work</span>
                        <span className="font-semibold truncate">{occupation || '—'}</span>
                    </div>
                </div>

                {editing ? (
                    <div className="space-y-3 mb-5">
                        {[
                            ['name', 'Full name', 'text'],
                            ['dob', 'Date of birth', 'date'],
                            ['pob', 'Place of birth', 'text'],
                            ['occupation', 'Work', 'text'],
                        ].map(([key, label, type]) => (
                            <label key={key} className="block">
                                <span className="text-[11px] font-bold uppercase tracking-widest text-[#9A96A3]">{label}</span>
                                <input
                                    type={type}
                                    value={draft[key]}
                                    onChange={(e) => setDraft((prev) => ({ ...prev, [key]: e.target.value }))}
                                    className="mt-1 w-full h-11 rounded-2xl bg-[#F7F4F0] dark:bg-brand-darkBg border border-[#EEEAE4] dark:border-brand-darkBorder px-3 text-[14px] font-semibold text-[#1F1D2B] dark:text-brand-darkText outline-none"
                                />
                            </label>
                        ))}
                        <label className="block">
                            <span className="text-[11px] font-bold uppercase tracking-widest text-[#9A96A3]">Gender</span>
                            <select
                                value={draft.gender}
                                onChange={(e) => setDraft((prev) => ({ ...prev, gender: e.target.value }))}
                                className="mt-1 w-full h-11 rounded-2xl bg-[#F7F4F0] dark:bg-brand-darkBg border border-[#EEEAE4] dark:border-brand-darkBorder px-3 text-[14px] font-semibold text-[#1F1D2B] dark:text-brand-darkText outline-none"
                            >
                                <option value="">Not set</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </label>
                        <label className="block">
                            <span className="text-[11px] font-bold uppercase tracking-widest text-[#9A96A3]">About</span>
                            <textarea
                                rows={3}
                                value={draft.notes}
                                onChange={(e) => setDraft((prev) => ({ ...prev, notes: e.target.value }))}
                                className="mt-1 w-full rounded-2xl bg-[#F7F4F0] dark:bg-brand-darkBg border border-[#EEEAE4] dark:border-brand-darkBorder px-3 py-2 text-[14px] font-semibold text-[#1F1D2B] dark:text-brand-darkText outline-none resize-none"
                            />
                        </label>
                        {error ? <p className="text-[12px] font-semibold text-red-500">{error}</p> : null}
                    </div>
                ) : notes ? (
                    <div className="mb-5 rounded-2xl bg-[#F7F4F0] dark:bg-brand-darkBg px-3.5 py-3">
                        <p className="text-[11px] font-bold uppercase tracking-widest text-[#9A96A3] mb-1">About</p>
                        <p className="text-[13px] font-medium text-[#2A2734] dark:text-brand-darkText leading-relaxed">{notes}</p>
                    </div>
                ) : null}

                {editing ? (
                    <button
                        type="button"
                        onClick={saveProfile}
                        disabled={saving || !draft.name.trim()}
                        className="w-full h-[52px] rounded-full bg-[#FF6A2B] text-white font-bold text-[15px] border-0 disabled:opacity-60"
                    >
                        {saving ? 'Saving...' : 'Save profile'}
                    </button>
                ) : (
                    <button
                        type="button"
                        onClick={() => setEditing(true)}
                        className="w-full h-[52px] rounded-full bg-[#FF6A2B] text-white font-bold text-[15px] border-0"
                    >
                        View profile
                    </button>
                )}
                {!editing && (
                <button
                    type="button"
                    onClick={() => onAddRelative?.(member)}
                    className="w-full mt-2 h-11 rounded-full bg-[#FFF1EA] dark:bg-brand-darkBg text-[#FF6A2B] font-bold text-[14px] border-0 flex items-center justify-center gap-2"
                >
                    <UserRoundPlus size={18} strokeWidth={2.3} />
                    Add relative to this person
                </button>
                )}
                <button
                    type="button"
                    onClick={onClose}
                    className="w-full mt-2 h-11 rounded-full bg-transparent border-0 text-[#6F6A78] font-semibold text-[14px]"
                >
                    Close
                </button>
            </div>
        </div>
    );
};
