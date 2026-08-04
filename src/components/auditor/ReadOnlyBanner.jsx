import React from 'react';
import { ShieldAlert } from 'lucide-react';

const ReadOnlyBanner = () => {
    return (
        <div className="bg-blue-600/10 border-b border-blue-600/20 py-2.5 px-6 flex items-center justify-center space-x-3 backdrop-blur-md sticky top-0 z-[60]">
            <ShieldAlert size={16} className="text-blue-500" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">
                Read-only access – no modification permitted
            </span>
        </div>
    );
};

export default ReadOnlyBanner;
