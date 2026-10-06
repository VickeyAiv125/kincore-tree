import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

const isTreeWebview = () => {
    const params = new URLSearchParams(window.location.search);
    return params.get('view') === 'app' || window.location.pathname.includes('/family-tree/webview');
};

const readInitialTheme = () => {
    const params = new URLSearchParams(window.location.search);
    const fromUrl = params.get('theme');
    if (fromUrl === 'dark' || fromUrl === 'light') return fromUrl;
    if (isTreeWebview()) {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return localStorage.getItem('theme') || 'light';
};

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(readInitialTheme);

    useEffect(() => {
        const root = window.document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        if (!isTreeWebview()) {
            localStorage.setItem('theme', theme);
        }
    }, [theme]);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const locked = params.get('theme');
        if (!isTreeWebview() || locked === 'dark' || locked === 'light') return undefined;

        const media = window.matchMedia('(prefers-color-scheme: dark)');
        const onChange = () => setTheme(media.matches ? 'dark' : 'light');
        media.addEventListener('change', onChange);
        return () => media.removeEventListener('change', onChange);
    }, []);

    useEffect(() => {
        const onMessage = (event) => {
            const next = event.data?.theme;
            if (event.data?.type === 'kincore-theme' && (next === 'dark' || next === 'light')) {
                setTheme(next);
            }
        };
        window.addEventListener('message', onMessage);
        return () => window.removeEventListener('message', onMessage);
    }, []);

    const toggleTheme = () => {
        setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
