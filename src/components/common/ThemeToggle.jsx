import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const ThemeToggle = ({ className = "" }) => {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className={`p-2 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-brand-darkBorder ${className}`}
            title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
        >
            {theme === 'light' ? (
                <Moon size={20} className="text-gray-500" />
            ) : (
                <Sun size={20} className="text-brand-orange" />
            )}
        </button>
    );
};

export default ThemeToggle;
