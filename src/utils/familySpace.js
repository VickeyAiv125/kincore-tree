/**
 * Resolve the active family space for family-level panels (owner / admin / council / branch).
 * Prefer cached IDs, then user payload, then GET /families.
 */

const TOKEN_KEY = 'token';
const USER_KEY = 'user';

const readUser = () => {
    try {
        return JSON.parse(localStorage.getItem(USER_KEY) || '{}');
    } catch {
        return {};
    }
};

const isValidId = (id) => {
    if (!id || id === 'null' || id === 'undefined' || id === 'DEFAULT_FAMILY_ID') return false;
    return String(id).length > 8;
};

/** Persist so subsequent pages don't miss the id */
export const cacheFamilySpaceId = (id) => {
    if (!isValidId(id)) return;
    localStorage.setItem('selected_family_id', id);
    localStorage.setItem('currentFamilySpaceId', id);
    const user = readUser();
    if (!user.family_id) {
        user.family_id = id;
        localStorage.setItem(USER_KEY, JSON.stringify(user));
    }
};

/**
 * Synchronous best-effort lookup from localStorage / user object.
 */
export const getCachedFamilySpaceId = () => {
    const candidates = [
        localStorage.getItem('currentFamilySpaceId'),
        localStorage.getItem('selected_family_id'),
        readUser()?.family_id,
        readUser()?.family_space_id,
        readUser()?.spaces?.[0]?.id,
        readUser()?.families?.[0]?.id
    ];
    for (const c of candidates) {
        if (isValidId(c)) return c;
    }
    return '';
};

/**
 * Async resolve: cache first, then list memberships from API and cache preferred space.
 */
export const resolveFamilySpaceId = async () => {
    const cached = getCachedFamilySpaceId();
    if (cached) {
        cacheFamilySpaceId(cached);
        return cached;
    }

    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return '';

    const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
    try {
        const res = await fetch(`${API}/families`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) return '';
        const data = await res.json();
        // Expected shapes: [{ family_space_id, role, family_spaces }, ...] or [{ id, ... }]
        const rows = Array.isArray(data) ? data : (data.spaces || data.families || []);
        if (!rows.length) return '';

        const preferOwner = rows.find((r) => {
            const role = String(r.role || r.family_spaces?.role || '').toLowerCase();
            return role === 'owner';
        });
        const pick = preferOwner || rows[0];
        const id = pick.family_space_id || pick.family_spaces?.id || pick.id;
        if (isValidId(id)) {
            cacheFamilySpaceId(id);
            return id;
        }
    } catch (err) {
        console.error('[resolveFamilySpaceId]', err);
    }
    return '';
};
