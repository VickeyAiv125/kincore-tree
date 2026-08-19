import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTreeWebviewContext } from '../../utils/treeWebviewNav';
import TreeNodeAddModal from '../../components/tree/TreeNodeAddModal';
import {
    Plus, Baby, Shield, Lock, UserCheck, MapPin, FileText,
    Skull, Calendar, RefreshCw, Undo2, Save, Info, UserPlus, Search, GitMerge, Heart, ChevronUp,
    CheckCircle2, AlertTriangle
} from 'lucide-react';

/* ─────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────── */
const API = import.meta.env.VITE_API_BASE_URL || `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}`;
const token = () => new URLSearchParams(window.location.search).get('token') || localStorage.getItem('token');

const getPersonName = (p) =>
    p?.full_name || `${p?.first_name || ''} ${p?.last_name || ''}`.trim() || 'Unknown';

const getAvatar = (p) => {
    const n = getPersonName(p);
    return p?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(n)}&background=random&color=fff&bold=true`;
};

const getStatus = (p) => ({
    isPrivate: p?.profile_visibility === 'private' || !!p?.hide_sensitive_details,
    isClaimed: !!p?.claimed_by,
    isMinor: !!p?.is_minor,
    // familyController stores status='deceased'; treeController uses is_alive=false
    isDeceased: p?.is_alive === false || p?.status === 'deceased',
});

const mapToMember = (p) => ({
    ...p,
    name: getPersonName(p),
    role: p?.occupation || 'Family Member',
    avatar: getAvatar(p),
    // familyController uses birth_date; treeController uses date_of_birth
    dob: p?.birth_date || p?.date_of_birth || 'Unknown',
    pob: p?.place_of_birth || 'Unknown',
    dna: p?.dna_ref || 'Locked',
    branch: p?.family_branches?.name || 'Primary',
    // familyController uses bio; treeController uses bio_notes
    notes: p?.bio || p?.bio_notes || '',
});

/* Build generational hierarchy from flat persons + relationships arrays */
const buildTree = (persons, relationships) => {
    const personMap = new Map(persons.map(p => [p.id, p]));
    const childrenOf = {};   // parentId → [childId]
    const parentsOf = {};    // childId  → [parentId]
    const spouseOf = {};     // personId → [spouseId]

    (relationships || []).forEach(rel => {
        const type = rel.relationship_type || rel.relation_type;
        if (type === 'parent') {
            if (!childrenOf[rel.person_id]) childrenOf[rel.person_id] = [];
            childrenOf[rel.person_id].push(rel.related_person_id);
            if (!parentsOf[rel.related_person_id]) parentsOf[rel.related_person_id] = [];
            parentsOf[rel.related_person_id].push(rel.person_id);
        } else if (type === 'spouse') {
            if (!spouseOf[rel.person_id]) spouseOf[rel.person_id] = [];
            spouseOf[rel.person_id].push(rel.related_person_id);
            if (!spouseOf[rel.related_person_id]) spouseOf[rel.related_person_id] = [];
            spouseOf[rel.related_person_id].push(rel.person_id);
        }
    });

    // Calculate depths
    const depths = new Map();

    // Initialize roots at depth 0
    persons.forEach(p => {
        if (!(parentsOf[p.id] || []).length) {
            depths.set(p.id, 0);
        }
    });

    // Iteratively resolve depths until no changes (handles multi-generation paths)
    // We run until both Parent and Spouse constraints are fully satisfied
    let changed = true;
    let iterations = 0;
    while (changed && iterations < 50) {
        changed = false;
        iterations++;

        persons.forEach(p => {
            // 1. Parent Constraint: Child must be below all parents
            const parents = parentsOf[p.id] || [];
            if (parents.length > 0) {
                const parentDepths = parents.map(pid => depths.get(pid)).filter(d => d !== undefined);
                if (parentDepths.length > 0) {
                    const minPossibleDepth = Math.max(...parentDepths) + 1;
                    const currentDepth = depths.get(p.id);
                    if (currentDepth === undefined || currentDepth < minPossibleDepth) {
                        depths.set(p.id, minPossibleDepth);
                        changed = true;
                    }
                }
            } else if (depths.get(p.id) === undefined) {
                // Initial root state (only for nodes with no parents)
                depths.set(p.id, 0);
                changed = true;
            }

            // 2. Spouse Constraint: Spouses should ideally be in the same row
            // We only force alignment if it doesn't create a circular logic issue
            const spouses = spouseOf[p.id] || [];
            spouses.forEach(sid => {
                const d1 = depths.get(p.id);
                const d2 = depths.get(sid);

                if (d1 !== undefined && d2 !== undefined && d1 !== d2) {
                    const maxD = Math.max(d1, d2);
                    if (d1 < maxD) { depths.set(p.id, maxD); changed = true; }
                    if (d2 < maxD) { depths.set(sid, maxD); changed = true; }
                } else if (d1 !== undefined && d2 === undefined) {
                    depths.set(sid, d1);
                    changed = true;
                } else if (d2 !== undefined && d1 === undefined) {
                    depths.set(p.id, d2);
                    changed = true;
                }
            });
        });
    }

    // Final safety: Ensure everyone has a depth
    persons.forEach(p => {
        if (depths.get(p.id) === undefined) depths.set(p.id, 0);
    });

    // Group into generations
    const maxDepth = Math.max(-1, ...Array.from(depths.values()));
    const generations = [];
    for (let i = 0; i <= maxDepth; i++) {
        const gen = persons.filter(p => depths.get(p.id) === i);
        if (gen.length > 0) generations.push(gen);
    }

    // Add any lingering orphans who somehow got no depth
    const orphans = persons.filter(p => depths.get(p.id) === undefined);
    if (orphans.length > 0) {
        if (generations.length === 0) generations.push(orphans);
        else generations[0] = [...generations[0], ...orphans];
    }

    return { generations, childrenOf, parentsOf, spouseOf, personMap };
};

/* Ordinal helper: 1 → "1ST", 2 → "2ND" etc. */
const ordinal = (n) => {
    const s = ['TH', 'ST', 'ND', 'RD'];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]) + ' GENERATION';
};

/* ─────────────────────────────────────────────
   SUB-COMPONENTS
───────────────────────────────────────────── */
const LegendItem = ({ icon: Icon, label, color }) => (
    <div className="flex items-center space-x-2 bg-white/50 dark:bg-brand-darkCard/50 px-3 py-1.5 rounded-full border border-gray-100 dark:border-brand-darkBorder transition-colors">
        <div className={`w-5 h-5 ${color} rounded-full flex items-center justify-center text-white shadow-sm`}>
            <Icon size={10} strokeWidth={3} />
        </div>
        <span className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-tight">{label}</span>
    </div>
);

const TreeNode = React.forwardRef(({ person, isActive, isChild, onAddClick, onClick, alwaysShowAdd }, ref) => {
    const [isHovered, setIsHovered] = useState(false);
    const name = getPersonName(person);
    const status = getStatus(person);
    const roleBadge = person.role || person.occupation || (person.is_synthesized ? 'Member' : null);

    return (
        <div
            ref={ref}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={onClick}
            className={`flex items-center p-4 rounded-2xl border transition-all duration-300 cursor-pointer w-64 relative group ${isActive
                ? 'border-brand-orange bg-white dark:bg-brand-orange/5 ring-4 ring-brand-orange/10 shadow-lg scale-105 z-10'
                : 'border-gray-100 dark:border-brand-darkBorder bg-white dark:bg-brand-darkCard shadow-sm hover:shadow-md hover:scale-105'}`}
        >
            {/* Child indicator — triangle at top-center for nodes that have parents */}
            {isChild && (
                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 z-20">
                    <div className="w-5 h-5 bg-brand-darkBg dark:bg-brand-darkCard border border-gray-200 dark:border-brand-darkBorder rounded-full flex items-center justify-center shadow-sm">
                        <ChevronUp size={10} className="text-gray-400 dark:text-gray-500" strokeWidth={3} />
                    </div>
                </div>
            )}

            {/* Status Badges */}
            <div className="absolute -top-2 -right-2 flex space-x-1 z-10 scale-90">
                {status.isPrivate && <div className="w-5 h-5 bg-gray-900 text-white rounded-full flex items-center justify-center shadow-lg"><Lock size={10} /></div>}
                {status.isClaimed && <div className="w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center shadow-lg"><UserCheck size={10} /></div>}
                {status.isMinor && <div className="w-5 h-5 bg-brand-orange text-white rounded-full flex items-center justify-center shadow-lg"><Baby size={10} /></div>}
                {status.isDeceased && <div className="w-5 h-5 bg-gray-400 text-white rounded-full flex items-center justify-center shadow-lg"><Skull size={10} /></div>}
            </div>

            {/* Add (+) — opens spouse / parent / member menu */}
            <div className={`absolute -bottom-3.5 left-1/2 -translate-x-1/2 transition-all duration-200 z-20 ${alwaysShowAdd || isHovered ? 'opacity-100 scale-100' : 'opacity-25 scale-90'}`}>
                <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onAddClick?.(person); }}
                    className={`${alwaysShowAdd ? 'w-9 h-9' : 'w-7 h-7'} bg-brand-orange text-white rounded-full flex items-center justify-center shadow-md hover:scale-110 active:scale-95 transition-transform`}
                    title="Add spouse, parent, child, or member"
                    aria-label="Add spouse, parent, child, or member"
                >
                    <Plus size={alwaysShowAdd ? 16 : 13} strokeWidth={3} />
                </button>
            </div>

            <div className="w-12 h-12 rounded-2xl overflow-hidden shrink-0 border-2 border-orange-100 dark:border-brand-orange/30 shadow-inner">
                <img src={getAvatar(person)} alt={name} className="w-full h-full object-cover" />
            </div>
            <div className="ml-4 text-left overflow-hidden">
                <h4 className="text-[10px] font-extrabold text-gray-900 dark:text-brand-darkText leading-tight truncate">{name}</h4>
                <div className="flex items-center space-x-1 mt-0.5 flex-wrap gap-y-0.5">
                    {roleBadge && (
                        <span className="text-[7px] font-black bg-orange-50 dark:bg-brand-orange/10 text-brand-orange px-1.5 py-0.5 rounded-md uppercase tracking-tighter">
                            {roleBadge}
                        </span>
                    )}
                    {person.family_branches?.name && (
                        <span className="text-[7px] font-black bg-gray-50 dark:bg-brand-darkBg text-gray-400 px-1.5 py-0.5 rounded-md uppercase tracking-tighter">
                            {person.family_branches.name}
                        </span>
                    )}
                </div>
                <div className="flex items-center space-x-1 mt-0.5">
                    <MapPin size={8} className="text-brand-orange/40" />
                    <p className="text-[8px] font-medium text-gray-400 dark:text-gray-500 truncate">{person.place_of_birth || person.current_location || 'Unknown'}</p>
                </div>
            </div>
        </div>
    );
});
TreeNode.displayName = 'TreeNode';

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────── */
const FamilyTree = () => {
    const navigate = useNavigate();

    // Custom Modal state & helper functions
    const [modal, setModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        type: 'info', // 'info' | 'confirm' | 'success' | 'error'
        onConfirm: null,
        confirmText: 'Continue',
        cancelText: 'Cancel'
    });

    const showAlert = (message, type = 'info', title = 'System Message') => {
        setModal({
            isOpen: true,
            title,
            message,
            type,
            confirmText: 'OK',
            onConfirm: () => setModal(prev => ({ ...prev, isOpen: false }))
        });
    };

    const showConfirm = (message, onConfirm, title = 'Are you sure?') => {
        setModal({
            isOpen: true,
            title,
            message,
            type: 'confirm',
            confirmText: 'Confirm',
            cancelText: 'Cancel',
            onConfirm: () => {
                setModal(prev => ({ ...prev, isOpen: false }));
                onConfirm();
            }
        });
    };

    // Data
    const [persons, setPersons] = useState([]);
    const [relationships, setRelationships] = useState([]);
    const [activeFamilySpaceId, setActiveFamilySpaceId] = useState('');
    const [addModal, setAddModal] = useState(null);
    const [treeStructure, setTreeStructure] = useState({ generations: [], childrenOf: {}, parentsOf: {}, spouseOf: {}, personMap: new Map() });
    const [selectedMember, setSelectedMember] = useState(null);
    const [loading, setLoading] = useState(true);

    // UI
    const [zoom, setZoom] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [isDirty, setIsDirty] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [mergeSearch, setMergeSearch] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const [selectedMergeTarget, setSelectedMergeTarget] = useState(null);
    const [mergePreview, setMergePreview] = useState(null);
    const [loadingPreview, setLoadingPreview] = useState(false);
    const [submittingMerge, setSubmittingMerge] = useState(false);

    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (mergeSearch.trim().length >= 2) {
                setSearching(true);
                try {
                    const currentFamilySpaceId = localStorage.getItem('currentFamilySpaceId') || '';
                    const res = await fetch(`${API}/merge/search-families?query=${encodeURIComponent(mergeSearch)}&excludeId=${currentFamilySpaceId}`, {
                        headers: { Authorization: `Bearer ${token()}` }
                    });
                    if (res.ok) {
                        const data = await res.json();
                        setSearchResults(data || []);
                    }
                } catch (err) {
                    console.error('Error searching families:', err);
                } finally {
                    setSearching(false);
                }
            } else {
                setSearchResults([]);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [mergeSearch]);

    const handleSelectTarget = async (target) => {
        setSelectedMergeTarget(target);
        setLoadingPreview(true);
        setMergePreview(null);
        try {
            const currentFamilySpaceId = localStorage.getItem('currentFamilySpaceId') || '';
            const res = await fetch(`${API}/merge/preview?sourceId=${currentFamilySpaceId}&targetId=${target.id}`, {
                headers: { Authorization: `Bearer ${token()}` }
            });
            if (res.ok) {
                const data = await res.json();
                setMergePreview(data);
            }
        } catch (err) {
            console.error('Error fetching merge preview:', err);
        } finally {
            setLoadingPreview(false);
        }
    };

    const handleInitiateMerge = async () => {
        if (!selectedMergeTarget) return;
        setSubmittingMerge(true);
        try {
            const currentFamilySpaceId = localStorage.getItem('currentFamilySpaceId') || '';
            const res = await fetch(`${API}/merge/request`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token()}`
                },
                body: JSON.stringify({
                    sourceId: currentFamilySpaceId,
                    targetId: selectedMergeTarget.id
                })
            });

            if (res.ok) {
                showAlert('Merge request initiated successfully! The request has been sent to the target family owner for review.', 'success', 'Success');
                setSelectedMergeTarget(null);
                setMergePreview(null);
                setMergeSearch('');
            } else {
                const errData = await res.json();
                showAlert(errData.error || 'Failed to initiate merge request', 'error', 'Error');
            }
        } catch (err) {
            console.error('Error initiating merge:', err);
            showAlert('Error initiating merge request', 'error', 'Error');
        } finally {
            setSubmittingMerge(false);
        }
    };

    const [svgLines, setSvgLines] = useState([]);

    // Refs
    const nodeRefs = useRef({});
    const wrapperRef = useRef(null);
    const zoomRef = useRef(zoom);
    useEffect(() => { zoomRef.current = zoom; }, [zoom]);

    const fetchTreeData = useCallback(async () => {
        setLoading(true);
        try {
            const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
            const urlParams = new URLSearchParams(window.location.search);
            const queryToken = urlParams.get('token');
            if (queryToken) localStorage.setItem('token', queryToken);

            const pathParts = window.location.pathname.split('/').filter(Boolean);
            const webviewIdx = pathParts.indexOf('webview');
            const webviewParamId = webviewIdx >= 0 ? pathParts[webviewIdx + 1] : null;
            const rawFamilyId = webviewParamId
                || urlParams.get('family_space_id')
                || urlParams.get('familyId')
                || localStorage.getItem('currentFamilySpaceId')
                || localStorage.getItem('selected_family_id')
                || storedUser?.family_id
                || storedUser?.family_space_id
                || '';
            const familyId = (!rawFamilyId || rawFamilyId === 'auto') ? '' : rawFamilyId;

            if (familyId) {
                setActiveFamilySpaceId(familyId);
                localStorage.setItem('currentFamilySpaceId', familyId);
                localStorage.setItem('selected_family_id', familyId);
            }

            const url = familyId
                ? `${API}/clantree/data?family_space_id=${familyId}`
                : `${API}/clantree/data`;

            const res = await fetch(url, {
                headers: { Authorization: `Bearer ${token()}` }
            });

            const ct = res.headers.get('content-type') || '';
            if (!res.ok || !ct.includes('application/json')) {
                console.warn('[FamilyTree] Non-JSON or error response.');
                return;
            }

            const data = await res.json();
            const p = data.persons || [];
            const r = data.relationships || [];
            setPersons(p);
            setRelationships(r);
            if (p.length > 0) {
                setSelectedMember((prev) => prev || mapToMember(p[0]));
            }
        } catch (err) {
            console.error('Failed to fetch tree:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTreeData();

        const handleStorageChange = () => fetchTreeData();
        window.addEventListener('familySpaceChanged', handleStorageChange);
        return () => window.removeEventListener('familySpaceChanged', handleStorageChange);
    }, []);

    /* ── Build hierarchy when data changes ── */
    useEffect(() => {
        if (persons.length > 0) {
            setTreeStructure(buildTree(persons, relationships));
        }
    }, [persons, relationships]);

    /* ── Compute SVG connector lines after render ── */
    const computeLines = useCallback(() => {
        if (!wrapperRef.current || treeStructure.generations.length === 0) return;
        const wrapper = wrapperRef.current;
        const wRect = wrapper.getBoundingClientRect();
        const z = zoomRef.current; // zoom scaling factor
        const lines = [];

        treeStructure.generations.forEach(gen => {
            gen.forEach(person => {
                const childIds = treeStructure.childrenOf[person.id] || [];
                if (!childIds.length) return;
                const parentEl = nodeRefs.current[person.id];
                if (!parentEl) return;

                const pRect = parentEl.getBoundingClientRect();
                // Divide by zoom to convert viewport coords => SVG local coords
                const parentCX = ((pRect.left + pRect.right) / 2 - wRect.left) / z;
                const parentBottom = (pRect.bottom - wRect.top) / z;

                const childCenters = childIds.map(cid => {
                    const el = nodeRefs.current[cid];
                    if (!el) return null;
                    const r = el.getBoundingClientRect();
                    return {
                        cx: ((r.left + r.right) / 2 - wRect.left) / z,
                        top: (r.top - wRect.top) / z
                    };
                }).filter(Boolean);

                if (!childCenters.length) return;

                // The midY is halfway between parent and its children row
                const midY = parentBottom + (childCenters[0].top - parentBottom) / 2;

                // Vertical line from parent to the bridge
                lines.push({ x1: parentCX, y1: parentBottom, x2: parentCX, y2: midY });

                // The bridge must span from the leftmost child/parent to the rightmost child/parent
                const allX = [parentCX, ...childCenters.map(c => c.cx)];
                const minX = Math.min(...allX);
                const maxX = Math.max(...allX);

                if (minX !== maxX) {
                    lines.push({ x1: minX, y1: midY, x2: maxX, y2: midY });
                }

                // Vertical lines from the bridge down to each child
                childCenters.forEach(c => {
                    lines.push({ x1: c.cx, y1: midY, x2: c.cx, y2: c.top });
                });
            });
        });
        setSvgLines(lines);
    }, [treeStructure]);

    useEffect(() => {
        const id = setTimeout(computeLines, 200);
        return () => clearTimeout(id);
    }, [computeLines, zoom, position]);


    /* ── Pan / Zoom ── */
    const handleZoom = (delta) => setZoom(prev => Math.min(Math.max(prev + delta, 0.3), 2.5));
    const resetView = () => { setZoom(1); setPosition({ x: 0, y: 0 }); };
    const handleMouseDown = (e) => { setIsDragging(true); setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y }); };
    const handleMouseMove = (e) => { if (!isDragging) return; setPosition({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y }); };
    const handleMouseUp = () => setIsDragging(false);
    // e.preventDefault() stops browser-level Ctrl+scroll zoom from scaling the whole page
    const handleWheel = (e) => { e.preventDefault(); handleZoom(e.deltaY > 0 ? -0.1 : 0.1); };

    /* ── Add spouse / parent / member (popup) ── */
    const openAddModal = (person, addType = null) => {
        if (!person?.id) return;
        setSelectedMember(mapToMember(person));
        setAddModal({
            person,
            step: addType ? 'form' : 'menu',
            addType: addType || null,
        });
    };

    const handleAddClick = (person) => openAddModal(person);

    const handleAddSuccess = (message) => {
        setAddModal(null);
        showAlert(message || 'Saved successfully.', 'success', 'Success');
        fetchTreeData();
    };

    /* ── Actions (sidebar / legacy) ── */
    const handleAction = (action, personOverride = null) => {
        const target = personOverride || selectedMember;
        if (!target?.id) return;

        const typeMap = {
            'Add Spouse': 'spouse',
            'Add Parent': 'parent',
            'Add Child': 'child',
            'Add Member': 'member',
        };
        if (typeMap[action]) {
            openAddModal(target, typeMap[action]);
        }
    };

    const handleNodeClick = (person) => setSelectedMember(mapToMember(person));

    const handleSave = async () => {
        if (!selectedMember?.id) return;
        try {
            const res = await fetch(`${API}/clantree/person/${selectedMember.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
                body: JSON.stringify({ full_name: selectedMember.name, place_of_birth: selectedMember.pob, bio_notes: selectedMember.notes })
            });
            if (res.ok) { setIsSaved(true); setIsDirty(false); setTimeout(() => setIsSaved(false), 2000); }
        } catch (err) { console.error('Save failed:', err); }
    };

    /* ── App view flag ── */
    const isAppView = new URLSearchParams(window.location.search).get('view') === 'app' || window.location.pathname.includes('/webview/');

    const totalMembers = persons.length;
    const totalGenerations = treeStructure.generations.length;

    /* ── Find relations for sidebar ── */
    const getRelations = (personId) => {
        const parents = (treeStructure.parentsOf?.[personId] || [])
            .map(id => treeStructure.personMap?.get(id)).filter(Boolean);
        const children = (treeStructure.childrenOf?.[personId] || [])
            .map(id => treeStructure.personMap?.get(id)).filter(Boolean);
        const spouses = (treeStructure.spouseOf?.[personId] || [])
            .map(id => treeStructure.personMap?.get(id)).filter(Boolean);
        return { parents, children, spouses };
    };

    const genIndex = selectedMember?.id
        ? treeStructure.generations.findIndex(gen => gen.some(p => p.id === selectedMember.id))
        : -1;

    /* ── Loading ── */
    if (loading) {
        return (
            <div className={`flex items-center justify-center ${isAppView ? 'h-screen w-screen m-0' : 'h-full'} bg-white dark:bg-brand-darkBg`}>
                <div className="flex flex-col items-center space-y-4">
                    <div className="w-12 h-12 border-4 border-brand-orange border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm font-black text-gray-500 uppercase tracking-widest">Constructing Lineage...</span>
                </div>
            </div>
        );
    }

    /* ── Render ── */
    return (
        <div className={`flex ${isAppView ? 'h-screen w-screen m-0' : 'h-full -m-8'} relative overflow-hidden bg-[#F9FAFB]/50 dark:bg-brand-darkBg transition-colors`}>

            {/* ── TREE AREA ── */}
            {/* Padding-right reserves space for the fixed right sidebar */}
            <div className={`flex-1 overflow-hidden relative bg-none shadow-none border-none ${!isAppView && selectedMember ? 'pr-[360px]' : ''} ${isAppView ? 'p-0 h-full w-full' : 'p-8'}`}>

                {/* Title — fixed so it never moves with zoom/pan */}
                {!isAppView && (
                    <div className="fixed top-4 left-44 z-30 text-left">
                        <h1 className="text-3xl font-black text-gray-900 dark:text-brand-darkText leading-none">Family Tree</h1>
                    </div>
                )}

                {/* Generation Pills — fixed to top center, unaffected by zoom or sidebar */}
                <div className="fixed top-4 left-1/2 -translate-x-1/2 z-30 flex items-center space-x-2">
                    <div className="bg-white/80 dark:bg-brand-darkCard/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-gray-100 dark:border-brand-darkBorder shadow-sm flex items-center space-x-4">
                        <button className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest hover:text-brand-orange transition-colors">Master Lineage</button>
                        <div className="w-px h-4 bg-gray-200 dark:bg-brand-darkBorder" />
                        <span className="text-[10px] font-black text-brand-orange uppercase tracking-widest">
                            Generation {totalGenerations} • {totalMembers} Members
                        </span>
                        <div className="w-px h-4 bg-gray-200 dark:bg-brand-darkBorder" />
                        <button onClick={resetView} className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest hover:text-brand-orange transition-colors">Center Tree</button>
                    </div>
                </div>

                {/* Zoom Controls — inset for sidebar on web; flush right in app WebView */}
                <div className={`fixed top-4 z-30 flex flex-col space-y-1 ${isAppView ? 'right-4' : 'right-[368px]'}`}>
                    <div className="bg-white/80 dark:bg-brand-darkCard/80 backdrop-blur-md p-1.5 rounded-2xl border border-gray-100 dark:border-brand-darkBorder shadow-xl flex flex-col space-y-0.5">
                        <button onClick={() => handleZoom(0.1)} className="p-2.5 hover:bg-gray-100 dark:hover:bg-brand-darkBg rounded-xl text-gray-400 hover:text-brand-orange transition-colors" title="Zoom In">
                            <Plus size={16} strokeWidth={3} />
                        </button>
                        <button onClick={() => handleZoom(-0.1)} className="p-2.5 hover:bg-gray-100 dark:hover:bg-brand-darkBg rounded-xl text-gray-400 hover:text-brand-orange transition-colors" title="Zoom Out">
                            <Plus size={16} strokeWidth={3} className="rotate-45" />
                        </button>
                        <div className="h-px bg-gray-100 dark:bg-brand-darkBorder mx-1.5" />
                        <button onClick={resetView} className="p-2.5 hover:bg-gray-100 dark:hover:bg-brand-darkBg rounded-xl text-gray-400 hover:text-brand-orange transition-colors" title="Reset View">
                            <RefreshCw size={16} strokeWidth={3} />
                        </button>
                    </div>
                </div>

                {/* Pan / Zoom Canvas */}
                <div
                    className={`w-full h-full flex items-center justify-center ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    onWheel={handleWheel}
                >
                    <div
                        ref={wrapperRef}
                        className="relative"
                        style={{
                            transform: `scale(${zoom}) translate(${position.x}px, ${position.y}px)`,
                            transformOrigin: 'center center',
                        }}
                    >
                        {/* SVG Connector Lines — overflow:visible so lines aren't clipped */}
                        {svgLines.length > 0 && (
                            <svg
                                className="absolute pointer-events-none"
                                style={{ left: 0, top: 0, width: '100%', height: '100%', zIndex: 1, overflow: 'visible' }}
                            >
                                {svgLines.map((line, i) => {
                                    const isVertical = line.x1 === line.x2;
                                    const isHorizontal = line.y1 === line.y2;
                                    return (
                                        <line
                                            key={i}
                                            x1={line.x1}
                                            y1={isVertical && line.y1 < line.y2 ? line.y1 + 4 : line.y1}
                                            x2={line.x2}
                                            y2={isVertical && line.y2 > line.y1 ? line.y2 - 4 : line.y2}
                                            stroke="rgba(251,146,60,0.6)"
                                            strokeWidth="2.5"
                                            strokeLinecap="round"
                                        />
                                    );
                                })}
                            </svg>
                        )}

                        {/* Tree Generations — each generation = ONE horizontal non-wrapping row */}
                        <div className="flex flex-col items-center space-y-40 pb-32 pt-20 relative z-10 min-w-max">
                            {treeStructure.generations.length > 0 ? (
                                treeStructure.generations.map((gen, genIdx) => (
                                    <div key={genIdx} className="flex items-center gap-16 flex-nowrap">
                                        {gen.map(person => {
                                            const personIsChild = (treeStructure.parentsOf[person.id] || []).length > 0;
                                            return (
                                                <TreeNode
                                                    key={person.id}
                                                    ref={el => { if (el) nodeRefs.current[person.id] = el; }}
                                                    person={person}
                                                    isActive={selectedMember?.id === person.id}
                                                    isChild={personIsChild}
                                                    alwaysShowAdd={isAppView}
                                                    onAddClick={handleAddClick}
                                                    onClick={() => handleNodeClick(person)}
                                                />
                                            );
                                        })}
                                    </div>
                                ))
                            ) : (
                                /* Empty state */
                                <div className="flex flex-col items-center space-y-6 py-24">
                                    <div className="w-20 h-20 rounded-3xl bg-orange-50 dark:bg-brand-orange/10 flex items-center justify-center">
                                        <Heart size={32} className="text-brand-orange" />
                                    </div>
                                    <div className="text-center">
                                        <h3 className="text-lg font-black text-gray-900 dark:text-brand-darkText">No Family Tree Yet</h3>
                                        <p className="text-sm text-gray-400 mt-2">Add the first member to begin your lineage</p>
                                    </div>
                                    <button
                                        onClick={() => navigate('/owner/add-member', { state: { title: 'Add Patriarch' } })}
                                        className="bg-brand-orange text-white px-6 py-3 rounded-2xl text-sm font-black uppercase tracking-widest flex items-center space-x-2 shadow-lg hover:scale-105 active:scale-95 transition-transform"
                                    >
                                        <Plus size={16} strokeWidth={3} />
                                        <span>Add First Member</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <TreeNodeAddModal
                open={!!addModal}
                person={addModal?.person}
                step={addModal?.step || 'menu'}
                addType={addModal?.addType}
                familySpaceId={activeFamilySpaceId || getTreeWebviewContext().spaceId || ''}
                onClose={() => setAddModal(null)}
                onSelectType={(type) => setAddModal((prev) => ({ ...prev, step: 'form', addType: type }))}
                onBack={() => setAddModal((prev) => ({ ...prev, step: 'menu', addType: null }))}
                onSuccess={handleAddSuccess}
            />

            {/* ── RIGHT SIDEBAR ── */}
            {/* Fixed to the viewport right edge — never moves regardless of tree state */}
            {!isAppView && selectedMember && (
                <div className="fixed top-0 right-0 h-screen w-[360px] bg-white dark:bg-brand-darkCard border-l border-gray-100 dark:border-brand-darkBorder flex flex-col shadow-2xl z-50 transition-colors text-left">
                    <div className="flex-1 overflow-y-auto px-8 py-10 no-scrollbar text-left">

                        {/* ── Member Header ── */}
                        <div className="flex flex-col items-center mb-12">
                            <div className="group relative">
                                <div className="w-28 h-28 rounded-[2.5rem] overflow-hidden mb-6 border-4 border-white dark:border-brand-darkBorder ring-8 ring-gray-50 dark:ring-brand-orange/10 shadow-lg transition-transform group-hover:rotate-6">
                                    <img src={selectedMember.avatar} alt={selectedMember.name} className="w-full h-full object-cover" />
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-brand-orange text-white rounded-xl flex items-center justify-center shadow-lg border-2 border-white dark:border-brand-darkCard">
                                    <Shield size={14} strokeWidth={3} />
                                </div>
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 dark:text-brand-darkText leading-tight tracking-tight">{selectedMember.name}</h3>
                            <p className="text-xs font-bold text-gray-400 dark:text-gray-500 mt-1 uppercase tracking-widest">{selectedMember.role}</p>
                        </div>

                        <div className="space-y-12">

                            {/* ── Personal Identity ── */}
                            <section>
                                <div className="flex items-center space-x-2 mb-8">
                                    <div className="w-8 h-8 rounded-xl bg-orange-50 dark:bg-brand-orange/10 flex items-center justify-center text-brand-orange">
                                        <Info size={16} strokeWidth={2.5} />
                                    </div>
                                    <h4 className="text-sm font-black text-gray-900 dark:text-brand-darkText uppercase tracking-widest">Personal Identity</h4>
                                </div>
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3 ml-1">Legal Name</label>
                                        <input
                                            type="text"
                                            value={selectedMember.name}
                                            onChange={(e) => { setSelectedMember(p => ({ ...p, name: e.target.value })); setIsDirty(true); setIsSaved(false); }}
                                            className="w-full bg-gray-50 dark:bg-brand-darkBg/50 border border-gray-100 dark:border-brand-darkBorder rounded-2xl py-3.5 px-6 text-sm font-bold text-gray-800 dark:text-brand-darkText outline-none focus:ring-4 focus:ring-brand-orange/5 transition-all"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3 ml-1">Date of Birth</label>
                                            <div className="relative">
                                                <input type="text" value={selectedMember.dob} readOnly className="w-full bg-gray-50 dark:bg-brand-darkBg/50 border border-gray-100 dark:border-brand-darkBorder rounded-2xl py-3.5 px-6 text-sm font-bold text-gray-800 dark:text-brand-darkText cursor-default" />
                                                <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3 ml-1">Place of Birth</label>
                                            <input
                                                type="text"
                                                value={selectedMember.pob}
                                                onChange={(e) => { setSelectedMember(p => ({ ...p, pob: e.target.value })); setIsDirty(true); setIsSaved(false); }}
                                                className="w-full bg-white dark:bg-brand-darkCard border border-gray-100 dark:border-brand-darkBorder rounded-2xl py-3.5 px-6 text-sm font-bold text-gray-800 dark:text-brand-darkText outline-none"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3 ml-1">ID Ref (DNA / SSN)</label>
                                        <div className="flex items-center space-x-2">
                                            <div className="flex-1 bg-gray-900 border border-gray-800 rounded-2xl py-3.5 px-6 text-[10px] font-mono text-emerald-400 uppercase tracking-widest overflow-hidden truncate">
                                                {selectedMember.dna}
                                            </div>
                                            <button className="w-12 h-12 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center border border-emerald-500/20 hover:bg-emerald-500 hover:text-white transition-all shadow-sm">
                                                <RefreshCw size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* ── Family Info ── */}
                            <section>
                                <div className="flex items-center space-x-2 mb-6">
                                    <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-500">
                                        <Heart size={16} strokeWidth={2.5} />
                                    </div>
                                    <h4 className="text-sm font-black text-gray-900 dark:text-brand-darkText uppercase tracking-widest">Family Info</h4>
                                </div>
                                <div className="space-y-3">
                                    <div className="p-4 bg-gray-50 dark:bg-brand-darkBg rounded-2xl flex justify-between items-center border border-gray-100 dark:border-brand-darkBorder">
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Current Branch</span>
                                        <span className="text-[10px] font-black text-brand-orange uppercase tracking-widest">{selectedMember.branch}</span>
                                    </div>
                                    <div className="p-4 bg-gray-50 dark:bg-brand-darkBg rounded-2xl flex justify-between items-center border border-gray-100 dark:border-brand-darkBorder">
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Direct Lineage</span>
                                        <span className="text-[10px] font-black text-brand-orange uppercase tracking-widest">
                                            {genIndex >= 0 ? ordinal(genIndex + 1) : 'Unknown'}
                                        </span>
                                    </div>
                                    {(() => {
                                        const { parents, children, spouses } = selectedMember.id
                                            ? getRelations(selectedMember.id)
                                            : { parents: [], children: [], spouses: [] };
                                        return (
                                            <>
                                                {parents.length > 0 && (
                                                    <div className="p-4 bg-gray-50 dark:bg-brand-darkBg rounded-2xl border border-gray-100 dark:border-brand-darkBorder">
                                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Parents</span>
                                                        {parents.map(p => <p key={p.id} className="text-[11px] font-bold text-gray-700 dark:text-gray-300">{getPersonName(p)}</p>)}
                                                    </div>
                                                )}
                                                {spouses.length > 0 && (
                                                    <div className="p-4 bg-gray-50 dark:bg-brand-darkBg rounded-2xl border border-gray-100 dark:border-brand-darkBorder">
                                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Spouse</span>
                                                        {spouses.map(p => <p key={p.id} className="text-[11px] font-bold text-gray-700 dark:text-gray-300">{getPersonName(p)}</p>)}
                                                    </div>
                                                )}
                                                {children.length > 0 && (
                                                    <div className="p-4 bg-gray-50 dark:bg-brand-darkBg rounded-2xl border border-gray-100 dark:border-brand-darkBorder">
                                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Children ({children.length})</span>
                                                        {children.map(p => <p key={p.id} className="text-[11px] font-bold text-gray-700 dark:text-gray-300">{getPersonName(p)}</p>)}
                                                    </div>
                                                )}
                                            </>
                                        );
                                    })()}
                                </div>
                            </section>

                            {/* ── Private Notes ── */}
                            <section>
                                <div className="flex items-center space-x-2 mb-8">
                                    <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                        <FileText size={16} strokeWidth={2.5} />
                                    </div>
                                    <h4 className="text-sm font-black text-gray-900 dark:text-brand-darkText uppercase tracking-widest">Private Notes</h4>
                                </div>
                                <textarea
                                    rows="3"
                                    value={selectedMember.notes}
                                    onChange={(e) => { setSelectedMember(p => ({ ...p, notes: e.target.value })); setIsDirty(true); setIsSaved(false); }}
                                    placeholder="Add lineage observations..."
                                    className="w-full bg-white dark:bg-brand-darkCard border border-gray-100 dark:border-brand-darkBorder rounded-2xl py-4 px-6 text-sm font-bold text-gray-800 dark:text-brand-darkText outline-none focus:ring-4 focus:ring-brand-orange/5 transition-all resize-none shadow-sm"
                                />
                            </section>

                            {/* ── Merge Families ── */}
                            <section className="border-t border-gray-100 dark:border-brand-darkBorder pt-8 mt-8">
                                <h4 className="text-sm font-black text-gray-900 dark:text-brand-darkText uppercase tracking-widest mb-2 flex items-center gap-2">
                                    <GitMerge size={16} className="text-brand-orange" />
                                    Merge Families
                                </h4>
                                <p className="text-xs text-gray-400 mb-4">Search public families to consolidate lineage data.</p>
                                <div className="relative mb-2">
                                    <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        value={mergeSearch}
                                        onChange={(e) => setMergeSearch(e.target.value)}
                                        placeholder="Search Surname / Space Code"
                                        className="w-full bg-gray-50 dark:bg-brand-darkBg border border-gray-100 dark:border-brand-darkBorder rounded-2xl py-3 pl-11 pr-6 text-xs font-bold text-gray-800 dark:text-brand-darkText outline-none focus:ring-4 focus:ring-brand-orange/5 transition-all"
                                    />
                                </div>

                                {/* Search Results dropdown */}
                                {searching && <div className="text-[10px] font-bold text-brand-orange animate-pulse py-1">Searching...</div>}
                                {searchResults.length > 0 && (
                                    <div className="bg-white dark:bg-brand-darkCard border border-gray-100 dark:border-brand-darkBorder rounded-2xl p-2 max-h-40 overflow-y-auto mb-4 shadow-sm space-y-1">
                                        {searchResults.map(space => (
                                            <button
                                                key={space.id}
                                                onClick={() => handleSelectTarget(space)}
                                                className="w-full text-left p-2 rounded-xl text-xs font-semibold hover:bg-orange-50 dark:hover:bg-brand-orange/10 flex items-center justify-between group transition-all"
                                            >
                                                <span className="text-gray-800 dark:text-brand-darkText font-black group-hover:text-brand-orange">{space.name}</span>
                                                <span className="text-[9px] text-gray-400 uppercase font-bold">{space.code}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {/* Selected Merge Target and Preview */}
                                {selectedMergeTarget && (
                                    <div className="bg-orange-50/50 dark:bg-brand-orange/5 border border-brand-orange/10 rounded-2xl p-4 mt-3">
                                        <div className="flex justify-between items-center mb-3">
                                            <span className="text-[10px] font-black text-brand-orange uppercase tracking-wider">Target: {selectedMergeTarget.name}</span>
                                            <button onClick={() => { setSelectedMergeTarget(null); setMergePreview(null); }} className="text-[9px] font-extrabold text-gray-400 hover:text-red-500 uppercase tracking-widest">Cancel</button>
                                        </div>

                                        {loadingPreview ? (
                                            <div className="text-[10px] font-bold text-gray-400 py-2">Loading Merge Preview...</div>
                                        ) : mergePreview ? (
                                            <div className="space-y-2 text-left">
                                                <div className="flex justify-between text-[11px]">
                                                     <span className="text-gray-500 font-semibold">Total Members to Import:</span>
                                                     <span className="font-extrabold text-gray-800 dark:text-brand-darkText">{mergePreview.target_members_count}</span>
                                                </div>
                                                <div className="flex justify-between text-[11px]">
                                                     <span className="text-gray-500 font-semibold">Branches to Import:</span>
                                                     <span className="font-extrabold text-gray-800 dark:text-brand-darkText">{mergePreview.branch_count}</span>
                                                </div>
                                                <div className="flex justify-between text-[11px]">
                                                     <span className="text-gray-500 font-semibold">Overlapping Duplicates:</span>
                                                     <span className={`font-extrabold ${mergePreview.duplicate_count > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                                                         {mergePreview.duplicate_count}
                                                     </span>
                                                </div>
                                                {mergePreview.duplicate_count > 0 && (
                                                     <p className="text-[9px] text-red-400 font-medium italic">
                                                         Duplicates detected. Council review and conflict resolution will be required.
                                                     </p>
                                                )}

                                                <button
                                                    onClick={() => showConfirm(`Are you sure you want to merge this family tree into ${selectedMergeTarget.name}? This action is irreversible.`, handleInitiateMerge, 'Initiate Merge?')}
                                                    disabled={submittingMerge}
                                                    className="w-full mt-2 bg-brand-orange text-white rounded-xl py-3 text-xs font-black uppercase tracking-widest flex items-center justify-center space-x-2 hover:bg-orange-600 transition-all shadow-md shadow-brand-orange/10 disabled:opacity-50"
                                                >
                                                    {submittingMerge ? 'Initiating...' : 'Send Merge Request'}
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="text-[10px] font-bold text-red-500 py-2">Failed to load preview details.</div>
                                        )}
                                    </div>
                                )}
                            </section>
                        </div>
                    </div>

                    {/* ── Footer Actions ── */}
                    <div className="p-8 bg-white dark:bg-brand-darkCard border-t border-gray-50 dark:border-brand-darkBorder flex flex-col space-y-4 transition-colors shadow-inner">
                        {/* Spouse / parent / member quick-add */}
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                onClick={() => handleAction('Add Spouse')}
                                className="bg-brand-orange text-white rounded-2xl py-3 text-[10px] font-black uppercase tracking-widest flex flex-col items-center justify-center gap-1 hover:bg-brand-orange/90 active:scale-95 transition-all shadow-lg"
                            >
                                <Heart size={14} strokeWidth={2.5} />
                                <span>Spouse</span>
                            </button>
                            <button
                                onClick={() => handleAction('Add Parent')}
                                className="bg-gray-900 text-white rounded-2xl py-3 text-[10px] font-black uppercase tracking-widest flex flex-col items-center justify-center gap-1 hover:bg-gray-800 active:scale-95 transition-all shadow-lg"
                            >
                                <UserPlus size={14} strokeWidth={2.5} />
                                <span>Parent</span>
                            </button>
                            <button
                                onClick={() => handleAction('Add Child')}
                                className="bg-blue-500 text-white rounded-2xl py-3 text-[10px] font-black uppercase tracking-widest flex flex-col items-center justify-center gap-1 hover:bg-blue-600 active:scale-95 transition-all shadow-lg"
                            >
                                <Baby size={14} strokeWidth={2.5} />
                                <span>Child</span>
                            </button>
                            <button
                                onClick={() => handleAction('Add Member')}
                                className="bg-pink-500 text-white rounded-2xl py-3 text-[10px] font-black uppercase tracking-widest flex flex-col items-center justify-center gap-1 hover:bg-pink-600 active:scale-95 transition-all shadow-lg"
                            >
                                <UserPlus size={14} strokeWidth={2.5} />
                                <span>Member</span>
                            </button>
                        </div>
                        {/* Save / Undo */}
                        <div className="flex items-center space-x-3">
                            <button
                                onClick={handleSave}
                                className={`flex-1 ${isSaved ? 'bg-emerald-500' : 'bg-gray-900'} text-white rounded-2xl py-5 text-xs font-black uppercase tracking-widest flex items-center justify-center space-x-3 transition-all transform active:scale-95 shadow-lg group`}
                            >
                                {isSaved ? (
                                    <><Plus className="w-4 h-4 rotate-45" strokeWidth={4} /><span>Profile Saved</span></>
                                ) : (
                                    <><Save size={18} strokeWidth={3} className="group-hover:scale-110 transition-transform" /><span>Save Profile</span></>
                                )}
                            </button>
                            <button
                                disabled={!isDirty}
                                onClick={() => { setIsDirty(false); setSelectedMember(mapToMember(treeStructure.personMap?.get(selectedMember.id) || selectedMember)); }}
                                className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all ${isDirty ? 'bg-orange-100 text-brand-orange hover:bg-orange-200 shadow-md' : 'bg-gray-50 text-gray-300 cursor-not-allowed'}`}
                            >
                                <Undo2 size={24} strokeWidth={2.5} />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Custom Premium Confirmation/Alert Modal */}
            {modal.isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-brand-darkCard rounded-[2.5rem] border border-gray-150 dark:border-brand-darkBorder p-8 max-w-md w-full shadow-2xl relative text-center transform scale-100 transition-all duration-300">
                        <div className={`w-16 h-16 rounded-3xl mx-auto flex items-center justify-center mb-6 shadow-sm ${
                            modal.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500' :
                            modal.type === 'error' ? 'bg-rose-50 dark:bg-rose-500/10 text-rose-500' :
                            modal.type === 'confirm' ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-500' :
                            'bg-blue-50 dark:bg-blue-500/10 text-blue-500'
                        }`}>
                            {modal.type === 'success' && <CheckCircle2 className="w-8 h-8" />}
                            {modal.type === 'error' && <Lock className="w-8 h-8" />}
                            {modal.type === 'confirm' && <AlertTriangle className="w-8 h-8" />}
                            {modal.type === 'info' && <Info className="w-8 h-8" />}
                        </div>
                        <h3 className="text-xl font-extrabold text-gray-900 dark:text-brand-darkText mb-3">
                            {modal.title}
                        </h3>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
                            {modal.message}
                        </p>
                        <div className="flex gap-4">
                            {modal.type === 'confirm' && (
                                <button
                                    onClick={() => setModal(prev => ({ ...prev, isOpen: false }))}
                                    className="flex-1 py-4 bg-gray-100 dark:bg-brand-darkBg text-gray-600 dark:text-brand-darkText rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-gray-250 dark:hover:bg-brand-darkBorder transition-all active:scale-95"
                                >
                                    {modal.cancelText}
                                </button>
                            )}
                            <button 
                                onClick={modal.onConfirm}
                                className="flex-1 py-4 bg-brand-orange text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-orange-600 transition-all active:scale-95 shadow-lg shadow-brand-orange/20"
                            >
                                {modal.confirmText}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FamilyTree;
