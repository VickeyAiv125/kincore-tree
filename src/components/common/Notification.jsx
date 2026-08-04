import React, { useEffect, useState } from 'react';

const Notification = ({ message, type = 'success', onClose, duration = 3000 }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (message) {
            setIsVisible(true);
            const timer = setTimeout(() => {
                setIsVisible(false);
                setTimeout(onClose, 300); // Wait for fade out animation
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [message, duration, onClose]);

    if (!message && !isVisible) return null;

    const styles = {
        container: {
            position: 'fixed',
            top: '20px',
            left: '50%',
            transform: `translateX(-50%) translateY(${isVisible ? '0' : '-100px'})`,
            zIndex: 9999,
            padding: '12px 24px',
            borderRadius: '12px',
            background: 'rgba(28, 28, 30, 0.95)',
            backdropFilter: 'blur(10px)',
            border: `1px solid ${type === 'success' ? '#FF5733' : '#FF3333'}`,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
            color: '#FFFFFF',
            fontSize: '14px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            opacity: isVisible ? 1 : 0,
        },
        icon: {
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            background: type === 'success' ? '#FF5733' : '#FF3333',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            color: '#000000'
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.icon}>
                {type === 'success' ? '✓' : '!'}
            </div>
            {message}
        </div>
    );
};

export default Notification;
