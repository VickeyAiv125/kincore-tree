import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Eye, EyeOff, X, User } from 'lucide-react';
import ThemeToggle from '../components/common/ThemeToggle';

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const routeForRole = (roleRaw, navigate) => {
    const role = (roleRaw || '').toLowerCase();
    if (role === 'owner') navigate('/owner/dashboard');
    else if (role === 'branch-admin' || role === 'branch admin' || role === 'branch_admin' || role === 'branch') navigate('/branch/dashboard');
    else if (role === 'council' || role === 'editor' || role === 'council-admin' || role === 'council admin') navigate('/council/dashboard');
    else if (role === 'family-admin' || role === 'family admin' || role === 'family_admin' || role === 'family' || role === 'admin' || role === 'co-admin') navigate('/dashboard');
    else if (role === 'business') navigate('/business/dashboard');
    else if (role === 'devops') navigate('/devops/dashboard');
    else if (role === 'auditor') navigate('/auditor/dashboard');
    else navigate('/dashboard');
};

const persistSession = (data) => {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    const familyId =
        data.user.family_id
        || data.user.family_space_id
        || data.user.spaces?.[0]?.id
        || null;
    if (familyId) {
        localStorage.setItem('selected_family_id', familyId);
        localStorage.setItem('currentFamilySpaceId', familyId);
        if (!data.user.family_id) {
            localStorage.setItem('user', JSON.stringify({ ...data.user, family_id: familyId }));
        }
    }
    if (data.kcc?.access_token) {
        localStorage.setItem('kcc_access_token', data.kcc.access_token);
        if (data.kcc.refresh_token) localStorage.setItem('kcc_refresh_token', data.kcc.refresh_token);
        if (data.kcc.wallet_id != null) localStorage.setItem('kcc_wallet_id', String(data.kcc.wallet_id));
    }
};

const Login = () => {
    const navigate = useNavigate();
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [loginLoading, setLoginLoading] = useState(false);
    const [loginError, setLoginError] = useState('');
    const [googleLoading, setGoogleLoading] = useState(false);
    const [facebookLoading, setFacebookLoading] = useState(false);

    const [kccOpen, setKccOpen] = useState(false);
    const [kccId, setKccId] = useState('');
    const [kccPassword, setKccPassword] = useState('');
    const [kccShowPass, setKccShowPass] = useState(false);
    const [kccLoading, setKccLoading] = useState(false);
    const [kccError, setKccError] = useState('');

    const socialBusy = googleLoading || facebookLoading || kccLoading;

    const handleGoogleSignIn = () => {
        setLoginError('');
        setGoogleLoading(true);
        window.location.href = `${API}/auth/google?mode=login&client_type=web`;
    };

    const handleFacebookSignIn = () => {
        setLoginError('');
        setFacebookLoading(true);
        window.location.href = `${API}/auth/facebook?mode=login&client_type=web`;
    };

    const handleKccLogin = async (e) => {
        e.preventDefault();
        setKccError('');
        setKccLoading(true);
        try {
            const currentTheme = localStorage.getItem('theme');
            localStorage.clear();
            if (currentTheme) localStorage.setItem('theme', currentTheme);

            const res = await fetch(`${API}/auth/kcc/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ identifier: kccId, password: kccPassword })
            });
            const raw = await res.text();
            let data = {};
            try {
                data = raw ? JSON.parse(raw) : {};
            } catch {
                throw new Error(
                    res.status === 404
                        ? 'KCC login API not found on this server. Deploy the latest backend, or use local API (VITE_API_BASE_URL=http://localhost:5000/api).'
                        : `Server returned a non-JSON response (${res.status}). Check API URL: ${API}`
                );
            }
            if (!res.ok) throw new Error(data.error || 'KCC ID login failed');

            persistSession(data);
            setKccOpen(false);
            routeForRole(data.user?.role, navigate);
        } catch (err) {
            console.error('KCC login error:', err);
            setKccError(err.message || 'KCC ID login failed');
        } finally {
            setKccLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoginError('');

        const trimmed = identifier.trim();
        if (!trimmed.includes('@') && /^kcc/i.test(trimmed)) {
            setKccId(trimmed);
            setKccOpen(true);
            setLoginError('Use the KCC button below to sign in with your KCC ID.');
            return;
        }

        const currentTheme = localStorage.getItem('theme');
        localStorage.clear();
        if (currentTheme) localStorage.setItem('theme', currentTheme);

        setLoginLoading(true);
        try {
            const response = await fetch(`${API}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ identifier: trimmed, password })
            });

            const raw = await response.text();
            let data = {};
            try {
                data = raw ? JSON.parse(raw) : {};
            } catch {
                throw new Error(`Server returned an unexpected response (${response.status}).`);
            }

            if (response.ok) {
                persistSession(data);
                routeForRole(data.user?.role, navigate);
            } else {
                setLoginError(data.error || 'Login failed. Check your email or username and password.');
            }
        } catch (err) {
            console.error('Login error:', err);
            setLoginError(err.message || 'Could not connect to the server. Please try again.');
        } finally {
            setLoginLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F3F4F6] dark:bg-brand-darkBg flex items-center justify-center p-4">
            <div className="fixed top-4 right-4 z-50">
                <ThemeToggle className="bg-white dark:bg-brand-darkCard shadow-sm rounded-full p-3" />
            </div>
            <div className="w-full max-w-[480px]">
                <div className="text-center mb-8">
                    <h1 className="text-brand-orange text-4xl font-bold mb-2 tracking-tight">Kincore</h1>
                    <h2 className="text-black dark:text-brand-darkText text-2xl font-bold mb-1 uppercase tracking-tight">Admin Portal</h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Secure access for enterprise management</p>
                </div>

                <div className="bg-white dark:bg-brand-darkCard p-6 sm:p-10 rounded-[2.5rem] shadow-sm">
                    <div className="space-y-3">
                        <button
                            type="button"
                            onClick={handleGoogleSignIn}
                            disabled={socialBusy}
                            className="w-full flex items-center justify-center gap-3 py-4 px-4 rounded-full border border-gray-200 dark:border-brand-darkBorder bg-white dark:bg-brand-darkBg text-sm font-bold text-gray-800 dark:text-brand-darkText hover:bg-gray-50 dark:hover:bg-brand-darkBorder/40 transition-all active:scale-[0.99] disabled:opacity-60"
                        >
                            <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
                                <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34.2 6.1 29.4 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.5-.4-3.5z"/>
                                <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34.2 6.1 29.4 4 24 4 16.3 4 9.6 8.3 6.3 14.7z"/>
                                <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.3 26.7 36 24 36c-5.3 0-9.7-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"/>
                                <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-1.1 3.1-3.5 5.5-6.5 6.7l.1.1 6.2 5.2C36.8 41.3 44 36 44 24c0-1.3-.1-2.5-.4-3.5z"/>
                            </svg>
                            <span>{googleLoading ? 'Redirecting to Google…' : 'Continue with Google'}</span>
                        </button>

                        <button
                            type="button"
                            onClick={handleFacebookSignIn}
                            disabled={socialBusy}
                            className="w-full flex items-center justify-center gap-3 py-4 px-4 rounded-full border border-[#1877F2]/20 bg-[#1877F2] text-sm font-bold text-white hover:bg-[#166FE5] transition-all active:scale-[0.99] disabled:opacity-60"
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
                                <path d="M24 12.073C24 5.404 18.627 0 12 0S0 5.404 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953h-1.513c-1.49 0-1.953.926-1.953 1.874v2.25h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
                            </svg>
                            <span>{facebookLoading ? 'Redirecting to Facebook…' : 'Continue with Facebook'}</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => { setKccError(''); setKccOpen(true); }}
                            disabled={socialBusy}
                            className="w-full flex items-center justify-center py-4 px-4 rounded-full border border-gray-900/10 bg-gray-900 text-sm font-bold text-white hover:bg-black transition-all active:scale-[0.99] disabled:opacity-60"
                        >
                            <span>Continue with KCC</span>
                        </button>
                    </div>

                    <div className="flex items-center gap-4 my-8">
                        <div className="h-px flex-1 bg-gray-100 dark:bg-brand-darkBorder" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">or email / username</span>
                        <div className="h-px flex-1 bg-gray-100 dark:bg-brand-darkBorder" />
                    </div>

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {loginError && (
                            <p className="rounded-2xl bg-red-50 dark:bg-red-950/30 px-4 py-3 text-sm font-semibold text-red-600 dark:text-red-400">
                                {loginError}
                            </p>
                        )}
                        <div className="space-y-2">
                            <label className="block text-black dark:text-brand-darkText font-bold text-sm ml-1">
                                Email or username
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    value={identifier}
                                    onChange={(e) => setIdentifier(e.target.value)}
                                    autoComplete="username"
                                    className="block w-full pl-12 pr-4 py-4 bg-[#F3F4F6]/50 dark:bg-brand-darkBg/50 border-none rounded-2xl focus:ring-2 focus:ring-brand-orange/20 placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-brand-darkText font-medium"
                                    placeholder="you@example.com or wallet handle"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-black dark:text-brand-darkText font-bold text-sm ml-1">
                                Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full pl-12 pr-12 py-4 bg-[#F3F4F6]/50 dark:bg-brand-darkBg/50 border-none rounded-2xl focus:ring-2 focus:ring-brand-orange/20 placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-brand-darkText font-medium"
                                    placeholder="Enter your password"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between py-1">
                            <div className="flex items-center">
                                <div className="relative flex items-center">
                                    <input
                                        id="remember-me"
                                        type="checkbox"
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                        className="h-5 w-5 bg-[#F3F4F6] dark:bg-brand-darkBg border-none rounded focus:ring-0 text-brand-orange cursor-pointer"
                                    />
                                </div>
                                <label htmlFor="remember-me" className="ml-3 block text-sm font-bold text-gray-800 dark:text-brand-darkText cursor-pointer">
                                    Remember me?
                                </label>
                            </div>
                            <div>
                                <Link
                                    to="/forgot-password"
                                    className="text-sm font-bold text-brand-orange hover:underline"
                                >
                                    Forgot Password
                                </Link>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loginLoading || socialBusy}
                            className="w-full flex justify-center py-4 px-4 border border-transparent rounded-full shadow-md text-sm font-bold text-white bg-brand-orange hover:opacity-95 transition-all transform hover:scale-[1.01] active:scale-[0.99] mt-4 disabled:opacity-60"
                        >
                            {loginLoading ? 'Signing in…' : 'Sign In'}
                        </button>
                    </form>

                    <p className="mt-6 text-center text-xs text-gray-400 font-medium">
                        New here? Google, Facebook, or KCC Sign-In creates your account automatically.
                    </p>
                </div>
            </div>

            {kccOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-brand-darkCard rounded-[2rem] border border-gray-100 dark:border-brand-darkBorder p-8 max-w-md w-full shadow-2xl relative">
                        <button
                            type="button"
                            onClick={() => setKccOpen(false)}
                            className="absolute top-4 right-4 p-2 rounded-full text-gray-400 hover:bg-gray-100 dark:hover:bg-brand-darkBg"
                            aria-label="Close"
                        >
                            <X size={18} />
                        </button>
                        <div className="mb-6 text-left">
                            <p className="text-[10px] font-black uppercase tracking-widest text-brand-orange mb-2">KCC ID</p>
                            <h3 className="text-xl font-extrabold text-gray-900 dark:text-brand-darkText">Continue with KCC</h3>
                            <p className="text-xs text-gray-500 mt-2 font-medium">
                                Use your ecosystem KCC ID (client: kincore). Kincore admin emails such as auditor@admin.com are not KCC accounts — use Email / username on the main login form.
                            </p>
                        </div>
                        <form className="space-y-4" onSubmit={handleKccLogin}>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 dark:text-brand-darkText mb-1.5 ml-1">Email or username</label>
                                <input
                                    type="text"
                                    value={kccId}
                                    onChange={(e) => setKccId(e.target.value)}
                                    required
                                    autoFocus
                                    className="w-full px-4 py-3.5 rounded-2xl bg-gray-50 dark:bg-brand-darkBg border-none text-sm font-medium outline-none focus:ring-2 focus:ring-brand-orange/20"
                                    placeholder="you@example.com"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 dark:text-brand-darkText mb-1.5 ml-1">Password</label>
                                <div className="relative">
                                    <input
                                        type={kccShowPass ? 'text' : 'password'}
                                        value={kccPassword}
                                        onChange={(e) => setKccPassword(e.target.value)}
                                        required
                                        className="w-full px-4 py-3.5 pr-12 rounded-2xl bg-gray-50 dark:bg-brand-darkBg border-none text-sm font-medium outline-none focus:ring-2 focus:ring-brand-orange/20"
                                        placeholder="KCC or Kincore password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setKccShowPass(!kccShowPass)}
                                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400"
                                    >
                                        {kccShowPass ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>
                            {kccError && (
                                <p className="text-xs font-bold text-red-500">{kccError}</p>
                            )}
                            <button
                                type="submit"
                                disabled={kccLoading}
                                className="w-full py-4 rounded-full bg-brand-orange text-white text-sm font-bold hover:opacity-95 disabled:opacity-60"
                            >
                                {kccLoading ? 'Signing in…' : 'Sign in with KCC'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Login;
