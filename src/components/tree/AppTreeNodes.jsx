import React from 'react';
import { Heart, Plus } from 'lucide-react';

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
        || `https://ui-avatars.com/api/?name=${encodeURIComponent(n)}&background=FF8A5B&color=fff&bold=true`;
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

export const formatLifeLabel = (person) => {
    const dob = person?.birth_date || person?.date_of_birth;
    if (!dob) return null;
    const year = new Date(dob).getFullYear();
    if (Number.isNaN(year)) return null;
    const deceased = person?.is_alive === false || person?.status === 'deceased';
    const dod = person?.death_date || person?.date_of_death;
    const deathYear = dod ? new Date(dod).getFullYear() : null;
    if (deceased) return `${year} - ${deathYear && !Number.isNaN(deathYear) ? deathYear : '?'}`;
    const age = new Date().getFullYear() - year;
    if (age >= 0 && age <= 35) return `${age} y/o`;
    return `${year} - Present`;
};

/** Group a generation into singles + couples (spouse pairs that share the row). */
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
            className={`absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center text-[9px] font-black shadow-sm ${
                male ? 'bg-[#4C8DFF] text-white' : 'bg-[#FF6B9D] text-white'
            }`}
            aria-hidden="true"
        >
            {male ? '♂' : '♀'}
        </span>
    );
};

/** Circular avatar node matching the mobile mockup. */
export const AppAvatarNode = React.forwardRef(function AppAvatarNode(
    { person, isActive, isCurrentUser, onClick, size = 'md' },
    ref
) {
    const name = getFirstName(person);
    const life = formatLifeLabel(person);
    const gender = normalizeGender(person);
    const dim = size === 'lg' ? 'w-[72px] h-[72px]' : 'w-16 h-16';

    return (
        <button
            type="button"
            ref={ref}
            onClick={onClick}
            className="flex flex-col items-center gap-1.5 relative bg-transparent border-0 p-0 cursor-pointer group"
        >
            {isCurrentUser && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 px-2 py-0.5 rounded-full bg-[#F5C542] text-white text-[9px] font-black tracking-wide shadow">
                    YOU
                </span>
            )}
            <span
                className={`relative ${dim} rounded-full overflow-hidden bg-orange-50 shadow-md transition-transform group-hover:scale-105 ${
                    isActive
                        ? 'ring-[3px] ring-[#FF622E] ring-offset-2'
                        : 'ring-2 ring-white'
                }`}
            >
                <img src={getAvatar(person)} alt={name} className="w-full h-full object-cover" />
                <GenderBadge gender={gender} />
            </span>
            <span className="text-[12px] font-bold text-[#1A1C2E] leading-tight max-w-[88px] truncate">
                {name}
            </span>
            {life && (
                <span className="text-[10px] font-medium text-[#8A8794] -mt-0.5 whitespace-nowrap">
                    {life}
                </span>
            )}
        </button>
    );
});

/** Spouse pair with heart connector, optionally wrapped in a soft card. */
export const AppCoupleUnit = ({
    a,
    b,
    selectedId,
    currentUserId,
    onSelect,
    carded = false,
    setNodeRef,
}) => {
    const inner = (
        <div className="flex items-end gap-3 relative px-1">
            <AppAvatarNode
                ref={(el) => setNodeRef?.(a.id, el)}
                person={a}
                isActive={selectedId === a.id}
                isCurrentUser={isYou(a, currentUserId)}
                onClick={() => onSelect?.(a)}
            />
            <span className="absolute left-1/2 top-7 -translate-x-1/2 z-10 w-6 h-6 rounded-full bg-[#FFE0EC] text-[#FF4D8D] flex items-center justify-center shadow-sm pointer-events-none">
                <Heart size={12} fill="currentColor" />
            </span>
            <AppAvatarNode
                ref={(el) => setNodeRef?.(b.id, el)}
                person={b}
                isActive={selectedId === b.id}
                isCurrentUser={isYou(b, currentUserId)}
                onClick={() => onSelect?.(b)}
            />
        </div>
    );

    if (!carded) return inner;

    return (
        <div className="bg-white rounded-3xl px-5 py-4 shadow-[0_10px_30px_rgba(26,28,46,0.08)] border border-[#F0EEEA]">
            {inner}
        </div>
    );
};

export const AppAddChildNode = ({ onClick }) => (
    <button
        type="button"
        onClick={onClick}
        className="flex flex-col items-center gap-1.5 bg-transparent border-0 p-0 cursor-pointer"
    >
        <span className="w-16 h-16 rounded-full border-2 border-dashed border-[#F5C542] text-[#F5C542] flex items-center justify-center bg-[#FFF9E8]">
            <Plus size={22} strokeWidth={2.5} />
        </span>
        <span className="text-[12px] font-bold text-[#B59B2F]">Add Child</span>
    </button>
);

export const AppTreeTabs = ({ value, onChange }) => {
    const tabs = [
        { id: 'full', label: 'Full View' },
        { id: 'lineage', label: 'Direct Lineage' },
        { id: 'birthdays', label: 'Birthdays' },
    ];
    return (
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar px-1">
            {tabs.map((tab) => {
                const active = value === tab.id;
                return (
                    <button
                        key={tab.id}
                        type="button"
                        onClick={() => onChange?.(tab.id)}
                        className={`shrink-0 px-4 py-2 rounded-full text-[12px] font-semibold transition-colors ${
                            active
                                ? 'bg-[#FF622E] text-white shadow-md shadow-orange-200'
                                : 'bg-white text-[#6B6575] border border-[#E8E4DF]'
                        }`}
                    >
                        {tab.label}
                    </button>
                );
            })}
        </div>
    );
};
