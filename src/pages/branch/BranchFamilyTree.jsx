import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GitMerge, Shield, Info, FileText, ChevronLeft } from 'lucide-react';
import BranchTree from './BranchTree';

const BranchFamilyTree = () => {
    const navigate = useNavigate();
    const [branchId, setBranchId] = useState(null);

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        setBranchId(storedUser?.branch_id || '6b8eb992-571f-4637-b031-a56007560cad');
    }, []);

    return (
        <div className="flex flex-col h-full bg-white dark:bg-brand-darkBg transition-colors">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-brand-darkBorder">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => navigate('/branch/dashboard')}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-brand-darkCard rounded-xl text-gray-400 transition-colors"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-black text-gray-900 dark:text-brand-darkText">Branch Lineage</h1>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Interactive Genealogy Tree</p>
                    </div>
                </div>
                
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-orange-50 dark:bg-brand-orange/10 px-4 py-2 rounded-xl">
                        <Shield size={14} className="text-brand-orange" />
                        <span className="text-[10px] font-black text-brand-orange uppercase tracking-widest">Branch Admin View</span>
                    </div>
                </div>
            </div>

            {/* Tree Area */}
            <div className="flex-1 p-6 overflow-hidden">
                <BranchTree branchId={branchId} />
            </div>

            {/* Footer / Legend */}
            <div className="p-6 border-t border-gray-100 dark:border-brand-darkBorder bg-gray-50/50 dark:bg-brand-darkCard/50">
                <div className="flex flex-wrap gap-6 justify-center">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Claimed Profile</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-brand-orange"></div>
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Minor</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-gray-900"></div>
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Private</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Deceased</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BranchFamilyTree;
