import React, { createContext, useContext, useState } from 'react';

const BranchContext = createContext();

export const useBranch = () => {
    const context = useContext(BranchContext);
    if (!context) {
        throw new Error('useBranch must be used within a BranchProvider');
    }
    return context;
};

export const BranchProvider = ({ children }) => {
    const [branchData, setBranchData] = useState({
        // Screen 1: Branch Info
        name: '',
        description: '',
        region: '',
        rootAncestor: null, // { id, name }
        branchHead: null, // { id, name, linkedAccount: false }
        branchAdmin: null, // { id, name }

        // Metadata
        foundingYear: '',
        migrationOrigin: '',
        emblemUrl: '',
        visibility: 'family',

        // Policies
        invitePolicy: 'Admin approval required', // 'Open invite' or 'Admin approval required'

        // Default Permissions
        permissions: {
            addMembers: 'Branch Head',
            editHistory: 'Branch Head',
            uploadMedia: 'All Members',
        },
        requiresConfirmation: false
    });

    const updateBranchData = (newData) => {
        setBranchData(prev => ({ ...prev, ...newData }));
    };

    const resetBranchData = () => {
        setBranchData({
            name: '',
            description: '',
            region: '',
            rootAncestor: null,
            branchHead: null,
            branchAdmin: null,
            foundingYear: '',
            migrationOrigin: '',
            emblemUrl: '',
            visibility: 'family',
            invitePolicy: 'Admin approval required',
            permissions: {
                addMembers: 'Branch Head',
                editHistory: 'Branch Head',
                uploadMedia: 'All Members',
            },
            requiresConfirmation: false
        });
    };

    return (
        <BranchContext.Provider value={{ branchData, updateBranchData, resetBranchData }}>
            {children}
        </BranchContext.Provider>
    );
};
