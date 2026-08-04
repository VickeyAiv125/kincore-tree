import React from 'react';
import { useNavigate } from 'react-router-dom';

const Unauthorized = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-brand-darkBg px-4 transition-colors">
            <div className="text-center">
                <h1 className="text-6xl font-bold text-brand-orange mb-4">403</h1>
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-brand-darkText mb-2">Access Denied</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-8">You do not have permission to view this page.</p>
                <button
                    onClick={() => navigate('/')}
                    className="px-6 py-2 bg-brand-orange text-white rounded-full font-bold hover:bg-orange-600 shadow-lg shadow-brand-orange/20 transition-all active:scale-95"
                >
                    Back to Login
                </button>
            </div>
        </div>
    );
};

export default Unauthorized;
