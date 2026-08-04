import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Plus, Minus, RotateCcw, Lock, Skull, Heart
} from 'lucide-react';

/* ─────────────────────────────────────────────
   HELPERS & STYLES
   (Matches FamilyTree.jsx precisely)
───────────────────────────────────────────── */
const API = import.meta.env.VITE_API_BASE_URL || `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}`;
const token = () => localStorage.getItem('token');

const getPersonName = (p) =>
    p?.full_name || `${p?.first_name || ''} ${p?.last_name || ''}`.trim() || 'Unknown Member';

const getAvatar = (p) => {
    const n = getPersonName(p);
    return p?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(n)}&background=random&color=fff&bold=true`;
};

const getRoleBadge = (person) => {
    if (person.is_leader || person.role?.toLowerCase() === 'leader') return { text: 'LEADER', color: 'bg-orange-500/10 text-orange-500 border border-orange-500/20' };
    if (person.is_direct || person.role?.toLowerCase() === 'direct') return { text: 'DIRECT', color: 'bg-blue-500/10 text-blue-500 border border-blue-500/20' };
    return { text: 'MEMBER', color: 'bg-gray-500/10 text-gray-500 border border-gray-500/20' };
};

/* ─────────────────────────────────────────────
   TREE LOGIC (1:1 from FamilyTree.jsx)
───────────────────────────────────────────── */
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

    const depths = new Map();
    persons.forEach(p => {
        if (!(parentsOf[p.id] || []).length) depths.set(p.id, 0);
    });

    let changed = true;
    let iterations = 0;
    while (changed && iterations < 50) {
        changed = false;
        iterations++;
        persons.forEach(p => {
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
                depths.set(p.id, 0);
                changed = true;
            }
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

    persons.forEach(p => {
        if (depths.get(p.id) === undefined) depths.set(p.id, 0);
    });

    // Group into generations
    const maxDepth = Math.max(-1, ...Array.from(depths.values()));
    const generations = [];
    for (let i = 0; i <= maxDepth; i++) {
        let gen = persons.filter(p => depths.get(p.id) === i);
        
        // Minimization: Sort children by their parents' average position to reduce crossing lines
        if (i > 0 && generations[i-1]) {
            const parentOrder = new Map(generations[i-1].map((p, idx) => [p.id, idx]));
            gen.sort((a, b) => {
                const parentsA = parentsOf[a.id] || [];
                const parentsB = parentsOf[b.id] || [];
                const avgA = parentsA.length ? parentsA.reduce((sum, id) => sum + (parentOrder.get(id) || 0), 0) / parentsA.length : 0;
                const avgB = parentsB.length ? parentsB.reduce((sum, id) => sum + (parentOrder.get(id) || 0), 0) / parentsB.length : 0;
                return avgA - avgB;
            });
        }
        
        if (gen.length > 0) generations.push(gen);
    }

    return { generations, childrenOf, parentsOf, spouseOf, personMap };
};

/* ─────────────────────────────────────────────
   SUB-COMPONENTS
───────────────────────────────────────────── */
const TreeNode = React.forwardRef(({ person, isActive, isChild, onClick }, ref) => {
    const name = getPersonName(person);
    const badge = getRoleBadge(person);
    const years = person.birth_year ? `${person.birth_year} – ${person.death_year || (person.is_alive === false ? '?' : 'Present')}` : '';

    return (
        <div
            ref={ref}
            onClick={onClick}
            className={`flex items-center p-3 rounded-xl transition-all duration-300 cursor-pointer w-[280px] shrink-0 relative group ${isActive
                ? 'border border-brand-orange bg-[#1C1C1E] shadow-2xl scale-105 z-10'
                : 'border border-white/5 bg-[#1C1C1E]/60 hover:bg-[#1C1C1E] hover:border-white/10 shadow-lg'}`}
        >
            {isChild && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-[1.5px] h-4 bg-brand-orange/40" />
            )}

            <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0 border border-white/10">
                <img src={getAvatar(person)} alt={name} className="w-full h-full object-cover" />
            </div>
            
            <div className="ml-3 flex-1 min-w-0">
                <div className="flex items-center justify-between">
                    <h4 className="text-[11px] font-bold text-white truncate pr-1">{name}</h4>
                    <div className="flex space-x-0.5 shrink-0">
                        {person.is_alive === false && <Skull size={8} className="text-gray-500" />}
                        {person.profile_visibility === 'private' && <Lock size={8} className="text-gray-500" />}
                    </div>
                </div>
                <p className="text-[8px] font-bold text-gray-500 mt-0.5 tracking-tighter">{years || 'LIFE RECORD PENDING'}</p>
                <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center space-x-1 text-[8px] text-gray-400 font-bold">
                        <Plus size={8} className="text-gray-600" />
                        <span>{(person.children_count || 0)} CHILDREN</span>
                    </div>
                    <span className={`text-[7px] font-black px-1.5 py-0.5 rounded-sm uppercase tracking-widest ${badge.color}`}>
                        {badge.text}
                    </span>
                </div>
            </div>
        </div>
    );
});
TreeNode.displayName = 'TreeNode';

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────── */
const BranchTree = ({ branchId, familySpaceId }) => {
    const navigate = useNavigate();
    const [persons, setPersons] = useState([]);
    const [relationships, setRelationships] = useState([]);
    const [treeStructure, setTreeStructure] = useState({ generations: [], childrenOf: {}, parentsOf: {}, spouseOf: {}, personMap: new Map() });
    const [selectedId, setSelectedId] = useState(null);
    const [loading, setLoading] = useState(true);
    
    // Canvas Viewport State
    const [zoom, setZoom] = useState(0.8);
    const [offset, setOffset] = useState({ x: 0, y: 60 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [svgLines, setSvgLines] = useState([]);

    const contentRef = useRef(null);
    const nodeRefs = useRef({});

    const fetchData = useCallback(async () => {
        if (!branchId) return;
        setLoading(true);
        try {
            const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
            const familyId = familySpaceId || storedUser?.family_id || storedUser?.family_space_id || '';
            
            console.log(`[BranchTree] Fetching latest dynamic data for Branch: ${branchId}`);

            const res = await fetch(`${API}/clantree/data?family_space_id=${familyId}&t=${Date.now()}`, {
                headers: { Authorization: `Bearer ${token()}` }
            });
            if (res.ok) {
                const data = await res.json();
                
                const branchMembers = (data.persons || []).filter(p => {
                    const potentialIds = [
                        p.branch_id,
                        p.branch_id?.id,
                        p.branchId,
                        p.branchId?.id,
                        p.family_branches?.id,
                        p.branch?.id
                    ].filter(Boolean).map(id => String(id).toLowerCase());

                    const target = String(branchId || '').toLowerCase();
                    const isMatch = target !== '' && potentialIds.includes(target);
                    const isSynthesizedAdmin = p.is_synthesized && String(p.id).toLowerCase() === String(storedUser.id).toLowerCase();

                    return isMatch || isSynthesizedAdmin;
                });
                
                const memberIds = new Set(branchMembers.map(m => m.id));
                const branchRels = (data.relationships || []).filter(rel => 
                    memberIds.has(rel.person_id) && memberIds.has(rel.related_person_id)
                );

                setPersons(branchMembers);
                setRelationships(branchRels);
                console.log(`[BranchTree] DYNAMIC UPDATE: Loaded ${branchMembers.length} members.`);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [branchId, familySpaceId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        if (persons.length > 0) setTreeStructure(buildTree(persons, relationships));
    }, [persons, relationships]);

    const computeLines = useCallback(() => {
        if (!contentRef.current || treeStructure.generations.length === 0) return;
        const wrapper = contentRef.current;
        const wRect = wrapper.getBoundingClientRect();
        const z = zoom;
        const lines = [];

        treeStructure.generations.forEach(gen => {
            gen.forEach(person => {
                const childIds = treeStructure.childrenOf[person.id] || [];
                if (!childIds.length) return;
                const parentEl = nodeRefs.current[person.id];
                if (!parentEl) return;

                const pRect = parentEl.getBoundingClientRect();
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

                // The midY is halfway between parent and its children row (1:1 Owner Panel Logic)
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
    }, [treeStructure, zoom]);

    useEffect(() => {
        const id = setTimeout(computeLines, 150);
        return () => clearTimeout(id);
    }, [computeLines, zoom, offset]);

    const handleZoom = (delta) => setZoom(prev => Math.min(Math.max(prev + delta, 0.3), 2));
    const resetView = () => { setZoom(0.8); setOffset({ x: 0, y: 60 }); };
    
    const onMouseDown = (e) => { 
        setIsDragging(true); 
        setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y }); 
    };
    const onMouseMove = (e) => { 
        if (!isDragging) return; 
        setOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y }); 
    };
    const onMouseUp = () => setIsDragging(false);

    if (loading) return (
        <div className="flex items-center justify-center w-full h-[700px] bg-brand-darkBg">
            <div className="w-10 h-10 border-4 border-brand-orange border-t-transparent rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="w-full h-full max-w-full overflow-hidden relative flex flex-col bg-brand-darkBg">
            {/* Dynamic Data Audit Overlay (Debugging) */}
            <div className="absolute top-24 left-6 z-50 pointer-events-none opacity-60 hover:opacity-100 transition-opacity">
                <div className="bg-black/90 border border-brand-orange/30 rounded-lg p-4 text-[10px] font-mono text-gray-300 shadow-2xl backdrop-blur-md">
                    <p className="text-orange-500 font-bold mb-2 uppercase tracking-widest border-b border-white/10 pb-1">Live Relations Audit</p>
                    {(relationships || []).length === 0 && <div className="text-gray-500 italic">No relations found in DB</div>}
                    {(relationships || []).map((r, i) => {
                        const p1 = persons.find(p => p.id === r.person_id);
                        const p2 = persons.find(p => p.id === r.related_person_id);
                        const from = p1 ? getPersonName(p1) : `ID:${r.person_id?.slice(0, 8)}...`;
                        const to = p2 ? getPersonName(p2) : `ID:${r.related_person_id?.slice(0, 8)}...`;
                        return (
                            <div key={i} className="mb-1 last:mb-0">
                                <span className="text-blue-400">{from}</span>
                                <span className="text-gray-500 mx-1">→</span>
                                <span className="text-green-400">{to}</span>
                                <span className="text-gray-600 ml-1">({r.relationship_type || r.relation_type})</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Pill Controls */}
            <div className="absolute top-6 right-6 z-50 pointer-events-auto">
                <div className="bg-[#1C1C1E] border border-white/10 rounded-full px-2 py-1.5 flex items-center shadow-2xl backdrop-blur-md">
                    <button onClick={() => handleZoom(0.1)} className="p-2 hover:bg-white/5 rounded-full text-gray-400 hover:text-white transition-all"><Plus size={16} strokeWidth={3} /></button>
                    <button onClick={() => handleZoom(-0.1)} className="p-2 hover:bg-white/5 rounded-full text-gray-400 hover:text-white transition-all"><Minus size={16} strokeWidth={3} /></button>
                    <div className="w-px h-4 bg-white/10 mx-1" />
                    <button onClick={fetchData} className="p-2 hover:bg-white/5 rounded-full text-gray-400 hover:text-white transition-all"><RotateCcw size={16} strokeWidth={3} /></button>
                </div>
            </div>

            {/* Viewport Area */}
            <div 
                className={`flex-1 relative overflow-hidden flex items-start justify-center ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                onMouseDown={onMouseDown}
                onMouseMove={onMouseMove}
                onMouseUp={onMouseUp}
                onMouseLeave={onMouseUp}
            >
                <div 
                    className="absolute transition-transform duration-75 ease-out flex flex-col items-center"
                    style={{
                        transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
                        transformOrigin: 'top center',
                        width: 'auto'
                    }}
                >
                    {/* SVG Connections */}
                    {svgLines.length > 0 && (
                        <svg className="absolute inset-0 pointer-events-none" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                            {svgLines.map((line, i) => {
                                const isVertical = line.x1 === line.x2;
                                return (
                                    <line 
                                        key={i} 
                                        x1={line.x1} 
                                        y1={isVertical && line.y1 < line.y2 ? line.y1 + 4 : line.y1}
                                        y2={isVertical && line.y2 > line.y1 ? line.y2 - 4 : line.y2}
                                        x2={line.x2} 
                                        stroke="rgba(251,146,60,0.6)" 
                                        strokeWidth="2.5"
                                        strokeLinecap="round"
                                    />
                                );
                            })}
                        </svg>
                    )}

                    {/* Nodes Area */}
                    <div ref={contentRef} className="flex flex-col items-center space-y-48 pb-96 pt-20 px-96 relative z-10 min-w-max">
                        {treeStructure.generations.length > 0 ? (
                            treeStructure.generations.map((gen, idx) => (
                                <div key={idx} className="flex items-center gap-20">
                                    {gen.map(person => (
                                        <TreeNode
                                            key={person.id}
                                            ref={el => { if (el) nodeRefs.current[person.id] = el; }}
                                            person={person}
                                            isActive={selectedId === person.id}
                                            isChild={(treeStructure.parentsOf[person.id] || []).length > 0}
                                            onClick={() => {
                                                setSelectedId(person.id);
                                                navigate(`/branch/members/view/${person.id}`);
                                            }}
                                        />
                                    ))}
                                </div>
                            ))
                        ) : (
                            <div className="py-40 text-center opacity-30 flex flex-col items-center w-[300px]">
                                <Heart size={48} className="mb-4 text-brand-orange" />
                                <p className="text-xs font-black uppercase tracking-widest">No lineage data found</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BranchTree;
