import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Lock, ChevronLeft } from 'lucide-react';
import ThemeToggle from '../components/common/ThemeToggle';

const ResetPassword = () => {
    const navigate = useNavigate();
    const [params] = useSearchParams();
    const email = params.get('email') || '';
    const token = params.get('token') || '';
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [done, setDone] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!email || !token) {
            setError('This reset link is incomplete. Request a new one from Forgot Password.');
            return;
        }
        if (password.length < 8) {
            setError('Use at least 8 characters.');
            return;
        }
        if (password !== confirm) {
            setError('The two passwords do not match.');
            return;
        }

        setLoading(true);
        try {
            const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
            const response = await fetch(`${baseUrl}/auth/app/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp_code: token, new_password: password })
            });
            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
                setError(data.error || 'Could not reset the password.');
                return;
            }
            setDone(true);
        } catch {
            setError('Could not connect to the server.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F3F4F6] dark:bg-brand-darkBg flex items-center justify-center p-4">
            <div className="fixed top-4 right-4 z-50">
                <ThemeToggle className="bg-white dark:bg-brand-darkCard shadow-sm rounded-full p-3" />
            </div>
            <div className="w-full max-w-[480px]">
                <div className="text-center mb-8">
                    <h1 className="text-[#FF6D4D] text-4xl font-bold mb-2 tracking-tight">Kincore</h1>
                    <h2 className="text-black dark:text-brand-darkText text-2xl font-bold mb-1">Set a new password</h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">{email || 'Choose a password for your account'}</p>
                </div>
                <div className="bg-white dark:bg-brand-darkCard p-6 sm:p-10 rounded-[2.5rem] shadow-sm">
                    {!done ? (
                        <form className="space-y-6" onSubmit={handleSubmit}>
                            {error && (
                                <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-bold rounded-2xl border border-red-100 text-center">
                                    {error}
                                </div>
                            )}
                            <div className="space-y-2">
                                <label className="block text-black dark:text-brand-darkText font-bold text-sm ml-1">New password</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="block w-full pl-12 pr-4 py-4 bg-[#F3F4F6] dark:bg-brand-darkBg/50 border-none rounded-2xl text-gray-900 dark:text-brand-darkText font-medium"
                                        placeholder="At least 8 characters"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="block text-black dark:text-brand-darkText font-bold text-sm ml-1">Confirm password</label>
                                <input
                                    type="password"
                                    value={confirm}
                                    onChange={(e) => setConfirm(e.target.value)}
                                    className="block w-full px-4 py-4 bg-[#F3F4F6] dark:bg-brand-darkBg/50 border-none rounded-2xl text-gray-900 dark:text-brand-darkText font-medium"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 rounded-full text-sm font-bold text-white bg-[#FF6D4D] hover:bg-[#FF5D3D] disabled:opacity-50"
                            >
                                {loading ? 'Saving...' : 'Save password'}
                            </button>
                            <div className="text-center">
                                <Link to="/" className="inline-flex items-center text-sm font-bold text-[#FF6D4D] hover:underline">
                                    <ChevronLeft size={16} className="mr-1" />
                                    Back to Login
                                </Link>
                            </div>
                        </form>
                    ) : (
                        <div className="text-center space-y-6">
                            <h3 className="text-xl font-bold text-gray-800 dark:text-brand-darkText">Password saved</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">You can now sign in with {email}.</p>
                            <button
                                type="button"
                                onClick={() => navigate('/')}
                                className="w-full py-4 bg-[#FF6D4D] text-white rounded-full font-bold"
                            >
                                Go to login
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
