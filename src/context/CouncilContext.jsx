import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const CouncilContext = createContext();

export const useCouncil = () => {
    const context = useContext(CouncilContext);
    if (!context) {
        throw new Error('useCouncil must be used within a CouncilProvider');
    }
    return context;
};

export const CouncilProvider = ({ children }) => {
    const [assignedFamilies, setAssignedFamilies] = useState([]);
    const [selectedFamilyId, setSelectedFamilyId] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchAssignedFamilies = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            const baseUrl = import.meta.env.VITE_API_BASE_URL || `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}`;
            const res = await fetch(`${baseUrl}/admin/council/assigned-families`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!res.ok) {
                throw new Error(`Failed to fetch assigned families: ${res.statusText}`);
            }
            const data = await res.json();
            // The data might be list of assignments, each containing a family_spaces property or directly the families
            const familiesList = data.map(item => {
                if (item.family_spaces) {
                    return {
                        id: item.family_space_id,
                        name: item.family_spaces.name,
                        description: item.family_spaces.description,
                        code: item.family_spaces.code,
                        assigned_at: item.created_at || item.assigned_at
                    };
                }
                return item; // JSON fallback DB returns parsed items directly
            });

            setAssignedFamilies(familiesList);
            
            // Set default selected family if not already set or if invalid
            if (familiesList.length > 0) {
                setSelectedFamilyId(prev => {
                    const exists = familiesList.find(f => f.id === prev);
                    const newId = exists ? prev : familiesList[0].id;
                    if (localStorage.getItem('currentFamilySpaceId') !== newId) {
                        localStorage.setItem('currentFamilySpaceId', newId);
                        window.dispatchEvent(new Event('familySpaceChanged'));
                    }
                    return newId;
                });
            } else {
                setSelectedFamilyId('');
                localStorage.removeItem('currentFamilySpaceId');
                window.dispatchEvent(new Event('familySpaceChanged'));
            }
        } catch (err) {
            console.error(err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const role = (user.role || '').toLowerCase();
        if (['council', 'editor', 'council-admin', 'council admin'].includes(role)) {
            fetchAssignedFamilies();
        }
    }, [fetchAssignedFamilies]);

    const selectedFamily = assignedFamilies.find(f => f.id === selectedFamilyId) || null;

    const handleSetSelectedFamilyId = (id) => {
        setSelectedFamilyId(id);
        if (id) {
            localStorage.setItem('currentFamilySpaceId', id);
        } else {
            localStorage.removeItem('currentFamilySpaceId');
        }
        window.dispatchEvent(new Event('familySpaceChanged'));
    };

    return (
        <CouncilContext.Provider value={{
            assignedFamilies,
            selectedFamilyId,
            selectedFamily,
            setSelectedFamilyId: handleSetSelectedFamilyId,
            loading,
            error,
            reloadFamilies: fetchAssignedFamilies
        }}>
            {children}
        </CouncilContext.Provider>
    );
};
