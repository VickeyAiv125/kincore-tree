import React from 'react';

const AssetCard = ({ image, year, location, title, description, persons = [], onTag }) => (
    <div className="bg-white dark:bg-brand-darkCard rounded-3xl border border-gray-100 dark:border-brand-darkBorder shadow-sm overflow-hidden flex flex-col group hover:shadow-xl dark:hover:shadow-brand-orange/5 transition-all cursor-pointer border-b-4 border-b-transparent hover:border-b-brand-orange">
        <div className="aspect-square overflow-hidden relative">
            <img src={image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={title || "Asset"} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                <p className="text-[10px] font-black text-white uppercase tracking-widest mb-1">{location}</p>
                <h4 className="text-xs font-bold text-white leading-tight mb-2 truncate">{title}</h4>
                <div className="flex gap-2">
                    <button className="bg-white/20 hover:bg-white/40 backdrop-blur-md text-white text-[8px] font-black px-2 py-1 rounded uppercase tracking-widest transition-colors flex items-center gap-1">
                        <svg className="w-2 h-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                        Link to Event
                    </button>
                </div>
            </div>
            {persons.length > 0 && (
                <div className="absolute top-3 left-3 flex -space-x-2">
                    {persons.slice(0, 3).map((p, i) => (
                        <div key={i} className="w-6 h-6 rounded-full border-2 border-white dark:border-brand-darkCard bg-orange-100 flex items-center justify-center text-[8px] font-black text-brand-orange overflow-hidden shadow-sm" title={p}>
                            <img src={`https://ui-avatars.com/api/?name=${p}&background=random`} alt={p} />
                        </div>
                    ))}
                    {persons.length > 3 && (
                        <div className="w-6 h-6 rounded-full border-2 border-white dark:border-brand-darkCard bg-gray-900 flex items-center justify-center text-[8px] font-black text-white">
                            +{persons.length - 3}
                        </div>
                    )}
                </div>
            )}
        </div>
        <div className="p-4 flex justify-between items-center">
            <div className="text-left flex-1 min-w-0 mr-2">
                <div className="flex items-center gap-2 mb-1">
                    <span className="text-[9px] font-black text-brand-orange uppercase tracking-widest leading-none shrink-0">{year}</span>
                    <p className="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase truncate">{location}</p>
                </div>
                <h4 className="text-[11px] font-bold text-gray-900 dark:text-brand-darkText truncate uppercase tracking-tighter">{title || "Untitled Record"}</h4>
            </div>
            <button
                onClick={(e) => { e.stopPropagation(); onTag(); }}
                className="w-8 h-8 rounded-xl bg-gray-50 dark:bg-brand-darkBg flex items-center justify-center text-gray-400 hover:text-brand-orange hover:bg-brand-active transition-colors shrink-0"
                title="Tag Persons"
            >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 7h.01M7 3h10a2 2 0 012 2v14a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2z" /></svg>
            </button>
        </div>
    </div>
);

const TaggingModal = ({ isOpen, onClose, assetName }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative bg-white dark:bg-brand-darkCard w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100 dark:border-brand-darkBorder p-8 sm:p-10 animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h3 className="text-lg font-black text-gray-900 dark:text-brand-darkText uppercase tracking-tighter">Person Tagging</h3>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Link family members to this entry</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <div className="space-y-6">
                    <div className="relative">
                        <input
                            type="text"
                            className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-brand-darkBg border border-transparent rounded-2xl focus:ring-2 focus:ring-brand-orange/20 text-gray-900 dark:text-brand-darkText font-bold text-xs transition-all"
                            placeholder="Search family members..."
                        />
                        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </div>

                    <div className="space-y-2 max-h-64 overflow-y-auto no-scrollbar">
                        {['Arthur Harrison', 'Jane Harrison', 'Oliver Harrison', 'Leo Harrison', 'Sophia Harrison'].map((name) => (
                            <label key={name} className="flex items-center gap-4 p-4 hover:bg-orange-50 dark:hover:bg-brand-orange/5 rounded-2xl cursor-pointer transition-colors group">
                                <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-brand-orange/20 overflow-hidden shrink-0">
                                    <img src={`https://ui-avatars.com/api/?name=${name}&background=random`} alt={name} />
                                </div>
                                <span className="flex-1 text-xs font-bold text-gray-700 dark:text-brand-darkText">{name}</span>
                                <input type="checkbox" className="w-5 h-5 accent-brand-orange rounded-md border-gray-300" />
                            </label>
                        ))}
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button onClick={onClose} className="flex-1 px-8 py-4 bg-gray-100 dark:bg-brand-darkBg text-gray-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-200 transition-colors">Cancel</button>
                        <button className="flex-[2] px-8 py-4 bg-brand-orange text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-brand-orange/20 hover:bg-orange-600 transition-all">Save Tags</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const MediaRepository = () => {
    const [taggingModal, setTaggingModal] = React.useState({ open: false, title: '' });
    const assets = [
        { image: "file:///C:/Users/uvdsg/.gemini/antigravity/brain/6332a07c-dddc-4f49-b611-f36a751f27be/family_portraits_grid_1770179154905.png", year: "1920", location: "Ellis Island, NY", title: "Arrival at Ellis Island", description: "First portrait of the Harrison family upon arriving in America.", persons: ['Arthur Harrison', 'Jane Harrison'] },
        { image: "file:///C:/Users/uvdsg/.gemini/antigravity/brain/6332a07c-dddc-4f49-b611-f36a751f27be/family_tree_detailed_1_1770179768087.png", year: "1954", location: "Chicago, IL", title: "Chicago Homestead", description: "The original storefront in Chicago where our family business started.", persons: ['Oliver Harrison'] },
        { image: "file:///C:/Users/uvdsg/.gemini/antigravity/brain/6332a07c-dddc-4f49-b611-f36a751f27be/family_tree_minimal_1_1770179753799.png", year: "1988", location: "London, UK", title: "London Reunion", description: "Global gathering of the 4th generation branches.", persons: ['Leo Harrison', 'Sophia Harrison'] },
        { image: "file:///C:/Users/uvdsg/.gemini/antigravity/brain/6332a07c-dddc-4f49-b611-f36a751f27be/family_portraits_grid_1770179154905.png", year: "2010", location: "Global Gathering", title: "Centennial Celebration", description: "100 years of Harrison family heritage celebration.", persons: ['Emma Reed', 'John Doe', 'Sarah Miller'] },
        { image: "file:///C:/Users/uvdsg/.gemini/antigravity/brain/6332a07c-dddc-4f49-b611-f36a751f27be/family_tree_detailed_1_1770179768087.png", year: "1940", location: "Heritage Manor", title: "The Heritage Manor", description: "Historical estate building archives.", persons: [] },
    ];

    return (
        <div className="flex flex-col">
            <header className="mb-10 text-left">
                <h2 className="text-gray-900 dark:text-brand-darkText text-sm font-bold opacity-30 dark:opacity-40 mb-2 uppercase tracking-widest">Kinecore</h2>
                <h1 className="text-4xl font-extrabold text-gray-900 dark:text-brand-darkText mb-8">Media Repository Assets Grid</h1>

                {/* Storage Usage */}
                <div className="mb-10">
                    <h3 className="text-sm font-extrabold text-gray-900 dark:text-brand-darkText mb-4">Storage Usage</h3>
                    <div className="flex justify-between items-end mb-2">
                        <p className="text-sm font-bold text-gray-800 dark:text-brand-darkText">120 GB of 200 GB used</p>
                        <p className="text-xs font-extrabold text-gray-900 dark:text-brand-darkText opacity-60">60%</p>
                    </div>
                    <div className="w-full h-3 bg-gray-100 dark:bg-brand-darkBg rounded-full overflow-hidden transition-colors">
                        <div className="h-full bg-brand-dark dark:bg-brand-orange rounded-full" style={{ width: '60%' }}></div>
                    </div>
                </div>

                <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-6 flex-1">
                        <div className="flex items-center">
                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mr-4 shrink-0">Visibility</h3>
                            <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar pb-2 sm:pb-0">
                                <button className="bg-orange-100 dark:bg-brand-orange/20 text-brand-orange px-6 py-2 rounded-xl text-xs font-bold shadow-sm whitespace-nowrap">Public</button>
                                <button className="bg-orange-50/50 dark:bg-brand-orange/5 text-brand-orange/60 px-6 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors">Family</button>
                                <button className="bg-orange-50/50 dark:bg-brand-orange/5 text-brand-orange/60 px-6 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors">Branch</button>
                            </div>
                        </div>

                        <div className="flex items-center relative flex-1 max-w-md">
                            <svg className="absolute left-4 w-4 h-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                            <input
                                type="text"
                                placeholder="Search by character, year, or location..."
                                className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-brand-darkBg border border-transparent rounded-2xl focus:ring-2 focus:ring-brand-orange/20 text-xs font-bold text-gray-900 dark:text-brand-darkText transition-all"
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-start gap-4">
                        <div className="flex items-center space-x-4 sm:mr-6 text-gray-400 dark:text-gray-500 overflow-x-auto no-scrollbar pb-2 sm:pb-0">
                            <div className="flex flex-col items-center">
                                <svg className="w-5 h-5 cursor-pointer hover:text-gray-600 dark:hover:text-gray-300 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
                                <span className="text-[7px] font-black uppercase mt-1 tracking-tighter">Filter</span>
                            </div>
                            <div className="w-px h-6 bg-gray-100 dark:bg-brand-darkBorder mx-2 hidden sm:block"></div>
                            <svg className="w-5 h-5 cursor-pointer hover:text-gray-600 dark:hover:text-gray-300 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2-2z" /></svg>
                            <svg className="w-5 h-5 cursor-pointer hover:text-gray-600 dark:hover:text-gray-300 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                            <svg className="w-5 h-5 cursor-pointer hover:text-gray-600 dark:hover:text-gray-300 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                        </div>
                        <button className="bg-brand-orange text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-brand-orange/20 hover:bg-orange-600 flex items-center space-x-2 text-sm shrink-0">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
                            <span>Upload</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Grid */}
            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {assets.map((asset, i) => (
                    <AssetCard
                        key={i}
                        {...asset}
                        onTag={() => setTaggingModal({ open: true, title: asset.location })}
                    />
                ))}
            </div>

            <TaggingModal
                isOpen={taggingModal.open}
                onClose={() => setTaggingModal({ open: false, title: '' })}
                assetName={taggingModal.title}
            />
        </div>
    );
};

export default MediaRepository;
