import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, ChevronLeft } from 'lucide-react';
import ThemeToggle from '../components/common/ThemeToggle';

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
            const response = await fetch(`${baseUrl}/auth/web/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            const data = await response.json();

            if (response.ok) {
                setIsSubmitted(true);
            } else {
                setError(data.error || 'Failed to send reset link.');
            }
        } catch (err) {
            console.error('Forgot password error:', err);
            setError('Could not connect to the server. Please ensure the backend is running.');
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
                {/* Logo and Title */}
                <div className="text-center mb-8">
                    <h1 className="text-[#FF6D4D] text-4xl font-bold mb-2 tracking-tight">Kincore</h1>
                    <h2 className="text-black dark:text-brand-darkText text-2xl font-bold mb-1">Forgot Password</h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Enter your email to reset your account access</p>
                </div>

                {/* Card */}
                <div className="bg-white dark:bg-brand-darkCard p-6 sm:p-10 rounded-[2.5rem] shadow-sm">
                    {!isSubmitted ? (
                        <form className="space-y-6" onSubmit={handleSubmit}>
                            {error && (
                                <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-bold rounded-2xl border border-red-100 dark:border-red-800/30 text-center animate-in fade-in duration-200">
                                    {error}
                                </div>
                            )}

                            {/* Email Field */}
                            <div className="space-y-2">
                                <label className="block text-black dark:text-brand-darkText font-bold text-sm ml-1">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="block w-full pl-12 pr-4 py-4 bg-[#F3F4F6] dark:bg-brand-darkBg/50 border-none rounded-2xl focus:ring-2 focus:ring-[#FF6D4D]/20 placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-brand-darkText font-medium"
                                        placeholder="admin@gmail.com"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-4 px-4 border border-transparent rounded-full shadow-md text-sm font-bold text-white bg-[#FF6D4D] hover:bg-[#FF5D3D] transition-all transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Sending Link...' : 'Send Reset Link'}
                            </button>

                            <div className="text-center">
                                <Link
                                    to="/"
                                    className="inline-flex items-center text-sm font-bold text-[#FF6D4D] hover:underline"
                                >
                                    <ChevronLeft size={16} className="mr-1" />
                                    Back to Login
                                </Link>
                            </div>
                        </form>
                    ) : (
                        <div className="text-center space-y-6 animate-in fade-in zoom-in duration-300">
                            <div className="w-20 h-20 bg-[#EAFAEA] dark:bg-brand-orange/10 text-[#2E8B57] dark:text-brand-orange rounded-full flex items-center justify-center mx-auto">
                                <Mail size={40} />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-bold text-gray-800 dark:text-brand-darkText">Check your email</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                                    We've sent a password reset link to <br />
                                    <span className="font-bold text-gray-700 dark:text-brand-darkText">{email}</span>
                                </p>
                            </div>
                            <button
                                onClick={() => navigate('/')}
                                className="w-full py-4 bg-[#FF6D4D] text-white rounded-full font-bold shadow-md hover:bg-[#FF5D3D] transition-all"
                            >
                                Return to Login
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
