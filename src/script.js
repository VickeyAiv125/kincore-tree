const fs = require('fs');
const file = 'c:/web dev/2026/LIVE PROJECTS/Kincore Tree/Kincore Tree/src/pages/owner/AuditLogs.jsx';
let content = fs.readFileSync(file, 'utf8');

const target1 =                         details: {
                            target: details.target || log.target_type || 'N/A',
                            oldValue: details.oldValue || details.old_value || 'N/A',
                            newValue: details.newValue || details.new_value || 'N/A'
                        };
const replacement1 =                         details: details || {};

content = content.replace(target1, replacement1);

const target2 =                                                     <div>
                                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Affected Target</p>
                                                        <p className="text-sm font-black text-gray-900 dark:text-brand-darkText">{log.details.target}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Change Details</p>
                                                        <div className="flex items-center space-x-3">
                                                            <span className="text-sm font-bold text-gray-400 line-through">{log.details.oldValue}</span>
                                                            <span className="text-brand-orange font-black">?</span>
                                                            <span className="text-sm font-black text-gray-900 dark:text-brand-darkText">{log.details.newValue}</span>
                                                        </div>
                                                    </div>;
const replacement2 =                                                     <div className="col-span-1 sm:col-span-2">
                                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Forensic Details</p>
                                                        <div className="space-y-3">
                                                            {(() => {
                                                                const metadataEntries = Object.entries(log.details || {}).filter(([k]) => 
                                                                    !['session_id', 'sessionId', 'diff', 'reason', 'context'].includes(k)
                                                                );
                                                                const diffEntries = log.details?.diff ? Object.entries(log.details.diff) : [];

                                                                if (metadataEntries.length === 0 && diffEntries.length === 0) {
                                                                    return (
                                                                        <div className="p-4 bg-white dark:bg-brand-darkCard rounded-xl border border-dashed border-gray-200 text-center">
                                                                            <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">No detailed state delta</p>
                                                                        </div>
                                                                    );
                                                                }

                                                                return (
                                                                    <>
                                                                        {diffEntries.map(([field, values], i) => (
                                                                            <div key={'diff-' + i} className="p-3 bg-white dark:bg-brand-darkCard rounded-xl border border-gray-100 dark:border-brand-darkBorder shadow-sm">
                                                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 border-b border-gray-50 pb-2">{field}</p>
                                                                                <div className="flex items-center space-x-4">
                                                                                    <div>
                                                                                        <p className="text-[8px] font-black text-gray-300 uppercase mb-1">From</p>
                                                                                        <p className="text-xs font-bold text-gray-400 line-through truncate uppercase">{String(values.old)}</p>
                                                                                    </div>
                                                                                    <span className="text-brand-orange font-black">?</span>
                                                                                    <div>
                                                                                        <p className="text-[8px] font-black text-green-500 uppercase mb-1">To</p>
                                                                                        <p className="text-xs font-black text-gray-900 dark:text-brand-darkText uppercase">{String(values.new)}</p>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                        {metadataEntries.length > 0 && (
                                                                            <div className="p-3 bg-white dark:bg-brand-darkCard rounded-xl border border-gray-100 dark:border-brand-darkBorder shadow-sm font-mono text-[10px] space-y-2">
                                                                                {metadataEntries.map(([key, val], i) => (
                                                                                    <div key={i} className="flex space-x-2">
                                                                                        <span className="text-brand-orange font-black uppercase text-[9px] w-16">{key}:</span>
                                                                                        <span className="text-gray-600 dark:text-gray-400">{typeof val === 'object' ? JSON.stringify(val) : String(val)}</span>
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        )}
                                                                    </>
                                                                );
                                                            })()}
                                                        </div>
                                                    </div>;

content = content.replace(target2, replacement2);
fs.writeFileSync(file, content);
console.log('Replaced');
