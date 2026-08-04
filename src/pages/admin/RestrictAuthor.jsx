import React from 'react';
import { useNavigate } from 'react-router-dom';

const RestrictAuthor = () => {
    const navigate = useNavigate();

    return (
        <div className="max-w-4xl text-left">
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-brand-darkText mb-10">Restrict Author</h1>

            <div className="space-y-8">
                <div>
                    <label className="block text-sm font-bold text-gray-800 dark:text-brand-darkText mb-3">Restriction Duration</label>
                    <input
                        type="text"
                        className="w-full bg-white dark:bg-brand-darkCard border border-gray-200 dark:border-brand-darkBorder rounded-xl px-4 py-4 focus:ring-1 focus:ring-brand-orange focus:border-brand-orange outline-none transition-all text-gray-800 dark:text-brand-darkText"
                    />
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-800 dark:text-brand-darkText mb-3">Reason</label>
                    <input
                        type="text"
                        className="w-full bg-white dark:bg-brand-darkCard border border-gray-200 dark:border-brand-darkBorder rounded-xl px-4 py-4 focus:ring-1 focus:ring-brand-orange focus:border-brand-orange outline-none transition-all text-gray-800 dark:text-brand-darkText"
                    />
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-800 dark:text-brand-darkText mb-3">Notes</label>
                    <textarea
                        rows={6}
                        className="w-full bg-white dark:bg-brand-darkCard border border-gray-200 dark:border-brand-darkBorder rounded-2xl px-4 py-4 focus:ring-1 focus:ring-brand-orange focus:border-brand-orange outline-none transition-all resize-none text-gray-800 dark:text-brand-darkText"
                    ></textarea>
                </div>

                <div className="bg-white dark:bg-brand-darkCard border border-gray-100 dark:border-brand-darkBorder rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors">
                    <div className="max-w-xl">
                        <h4 className="text-sm font-bold text-gray-800 dark:text-brand-darkText mb-1">Warning</h4>
                        <p className="text-sm font-medium text-gray-400 dark:text-gray-500">
                            Restricting the author will remove their content and prevent them from posting for the selected duration.
                        </p>
                    </div>
                    <div className="relative inline-flex items-center cursor-pointer shrink-0">
                        <div className="w-12 h-6 bg-brand-orange/20 rounded-full"></div>
                        <div className="absolute right-1 top-1 w-4 h-4 bg-brand-orange rounded-full shadow-sm"></div>
                    </div>
                </div>

                <div className="flex flex-col-reverse sm:flex-row justify-end gap-4 pt-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="px-8 py-3 rounded-xl bg-gray-100 dark:bg-brand-darkBg text-gray-600 dark:text-gray-400 font-bold hover:bg-gray-200 dark:hover:bg-brand-darkBorder transition-colors"
                    >
                        Cancel
                    </button>
                    <button className="px-8 py-3 rounded-xl bg-brand-orange text-white font-bold hover:bg-orange-600 shadow-sm shadow-brand-orange/20 transition-colors">
                        Restrict Author
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RestrictAuthor;
