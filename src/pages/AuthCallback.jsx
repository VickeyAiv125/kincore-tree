import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const routeForRole = (roleRaw) => {
    const role = (roleRaw || '').toLowerCase();
    if (role === 'owner') return '/owner/dashboard';
    if (role === 'branch-admin' || role === 'branch admin' || role === 'branch_admin' || role === 'branch') return '/branch/dashboard';
    if (role === 'council' || role === 'editor' || role === 'council-admin' || role === 'council admin') return '/council/dashboard';
    if (role === 'family-admin' || role === 'family admin' || role === 'family_admin' || role === 'family' || role === 'admin' || role === 'co-admin') return '/dashboard';
    if (role === 'business') return '/business/dashboard';
    if (role === 'devops') return '/devops/dashboard';
    if (role === 'auditor') return '/auditor/dashboard';
    return '/dashboard';
};

const cacheFamily = (user) => {
    const familyId =
        user.family_id
        || user.family_space_id
        || user.spaces?.[0]?.id
        || null;
    if (familyId) {
        localStorage.setItem('selected_family_id', familyId);
        localStorage.setItem('currentFamilySpaceId', familyId);
        if (!user.family_id) {
            localStorage.setItem('user', JSON.stringify({ ...user, family_id: familyId }));
        }
    }
};

/**
 * Completes Google SSO after backend redirects with ?token=
 */
const AuthCallback = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [message, setMessage] = useState('Completing Google sign-in…');

    useEffect(() => {
        const run = async () => {
            const error = searchParams.get('error');
            if (error) {
                setMessage(error);
                setTimeout(() => navigate('/', { replace: true }), 3500);
                return;
            }

            const token = searchParams.get('token');
            const provider = searchParams.get('provider') || 'google';
            if (!token) {
                setMessage('Missing auth token from Google sign-in.');
                setTimeout(() => navigate('/', { replace: true }), 2500);
                return;
            }

            try {
                const theme = localStorage.getItem('theme');
                localStorage.clear();
                if (theme) localStorage.setItem('theme', theme);

                const response = await fetch(`${API}/auth/oauth-login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        access_token: token,
                        provider,
                        client_type: 'web',
                        allow_signup: true
                    })
                });
                const data = await response.json();
                if (!response.ok) {
                    throw new Error(data.error || 'Google sign-in failed');
                }

                localStorage.setItem('token', data.token || token);
                localStorage.setItem('user', JSON.stringify(data.user));
                cacheFamily(data.user);
                setMessage('Signed in successfully. Redirecting…');
                navigate(routeForRole(data.user?.role), { replace: true });
            } catch (err) {
                console.error('[AuthCallback]', err);
                setMessage(err.message || 'Google sign-in failed');
                setTimeout(() => navigate('/', { replace: true }), 3500);
            }
        };

        run();
    }, [searchParams, navigate]);

    return (
        <div className="min-h-screen bg-[#F3F4F6] dark:bg-brand-darkBg flex items-center justify-center p-6">
            <div className="bg-white dark:bg-brand-darkCard rounded-[2rem] px-10 py-12 shadow-sm max-w-md w-full text-center">
                <h1 className="text-[#FF6D4D] text-3xl font-bold mb-4">Kincore</h1>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 leading-relaxed">{message}</p>
            </div>
        </div>
    );
};

export default AuthCallback;
