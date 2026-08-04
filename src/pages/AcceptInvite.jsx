import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ShieldCheck, Lock, ArrowRight, CheckCircle2 } from 'lucide-react';

const AcceptInvite = () => {
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState('idle'); // idle, success, error
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        // When the user lands here, Supabase auth.onAuthStateChange might have already parsed the hash
        // But we should verify they are actually logged in (have a session)
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                // Try reading hash directly just in case
                if (!window.location.hash.includes('access_token')) {
                    setErrorMsg('Invalid or expired invitation link.');
                    setStatus('error');
                }
            }
        };
        checkSession();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg('');

        if (password.length < 6) {
            setErrorMsg('Password must be at least 6 characters.');
            return;
        }
        if (password !== confirmPassword) {
            setErrorMsg('Passwords do not match.');
            return;
        }

        setLoading(true);
        try {
            // 1. Set the new password in Supabase
            const { error: updateError } = await supabase.auth.updateUser({
                password: password
            });

            if (updateError) throw updateError;

            // 2. Call our backend to finalize the claim / promote pending_role
            const baseUrl = import.meta.env.VITE_API_BASE_URL || `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}`;
            const { data: { session } } = await supabase.auth.getSession();
            
            const response = await fetch(`${baseUrl}/auth/complete-invite`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${session.access_token}`,
                    'Content-Type': 'application/json'
                }
            });

            let finalUser = null;
            if (!response.ok) {
                const err = await response.json();
                console.warn('Backend complete-invite warning:', err);
            }

            // Sign out and clear local storage so the user logs in explicitly on the login page
            await supabase.auth.signOut();
            localStorage.clear();

            setStatus('success');
            
            // Redirect to login page
            setTimeout(() => {
                navigate('/', { replace: true });
            }, 1500);

        } catch (err) {
            console.error('Error setting password:', err);
            setErrorMsg(err.message || 'An error occurred while setting your password.');
            setStatus('error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#FDF9F6] dark:bg-[#0A0A0A] flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white dark:bg-brand-darkCard rounded-[2.5rem] border border-gray-100 dark:border-brand-darkBorder p-8 sm:p-12 shadow-2xl text-center space-y-8 animate-fadeIn">
                
                <div className="mx-auto w-20 h-20 bg-brand-orange/10 dark:bg-brand-orange/5 text-brand-orange rounded-[2rem] flex items-center justify-center shadow-inner">
                    <ShieldCheck size={36} />
                </div>

                <div className="space-y-3">
                    <h1 className="text-3xl font-black text-gray-900 dark:text-brand-darkText tracking-tight">Activate Account</h1>
                    <p className="text-sm font-bold text-gray-500 dark:text-gray-400">
                        Welcome to Kincore! Secure your new account by creating a password.
                    </p>
                </div>

                {status === 'success' ? (
                    <div className="bg-green-50 dark:bg-green-500/10 border border-green-100 dark:border-green-500/20 p-6 rounded-3xl flex flex-col items-center space-y-4 animate-in zoom-in-95 duration-300">
                        <CheckCircle2 size={32} className="text-green-500" />
                        <div className="space-y-1">
                            <h3 className="text-sm font-black text-green-700 dark:text-green-400 uppercase tracking-widest">Account Activated</h3>
                            <p className="text-xs font-bold text-green-600/70 dark:text-green-500/70">Redirecting to login page...</p>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6 text-left">
                        <div className="space-y-1.5">
                            <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">New Password</label>
                            <div className="relative">
                                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-orange" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter secure password"
                                    className="w-full pl-12 pr-5 py-4 bg-gray-50 dark:bg-brand-darkBg border-none rounded-2xl text-sm font-bold text-gray-900 dark:text-brand-darkText focus:ring-2 focus:ring-brand-orange/20 transition-all"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">Confirm Password</label>
                            <div className="relative">
                                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Repeat password"
                                    className="w-full pl-12 pr-5 py-4 bg-gray-50 dark:bg-brand-darkBg border-none rounded-2xl text-sm font-bold text-gray-900 dark:text-brand-darkText focus:ring-2 focus:ring-brand-orange/20 transition-all"
                                    required
                                />
                            </div>
                        </div>

                        {errorMsg && (
                            <p className="text-[11px] font-bold text-red-500 uppercase tracking-wider text-center">{errorMsg}</p>
                        )}

                        <button
                            type="submit"
                            disabled={loading || status === 'error' && !password}
                            className="w-full py-4 rounded-[2rem] font-black text-white bg-brand-orange shadow-xl shadow-brand-orange/30 hover:bg-orange-600 active:scale-95 transition-all uppercase text-xs tracking-widest flex items-center justify-center group disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Securing...' : 'Set Password & Activate'} 
                            {!loading && <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default AcceptInvite;
