import React, { createContext, useContext, useState } from 'react';

const BusinessContext = createContext();

export const useBusiness = () => {
    const context = useContext(BusinessContext);
    if (!context) {
        throw new Error('useBusiness must be used within a BusinessProvider');
    }
    return context;
};

export const BusinessProvider = ({ children }) => {
    // 5.1 New Family Space State
    const [spaceData, setSpaceData] = useState({
        name: '',
        description: '',
        logo: null,
        category: '',
        region: '',
        contactEmail: '',
        contactPhone: '',
        admins: [],
        visibility: 'Private (internal only)',
        complianceConfirmed: false,
        status: 'Draft', // Draft, Active, Pending
        staff: [] // { id, role }
    });

    // 5.2 Billing State
    const [planData, setPlanData] = useState({
        name: '',
        price: '',
        currency: 'USD',
        cycle: 'monthly',
        trialDays: '',
        features: [],
        terms: ''
    });

    const [refundRequest, setRefundRequest] = useState({
        transactionId: null,
        reason: '',
        status: 'Idle' // Idle, Pending, Approved, Rejected
    });

    // 5.3 System Config State
    const [systemConfig, setSystemConfig] = useState({
        governanceDefaults: 'standard',
        permissions: {},
        featureToggles: {
            gifts: true,
            migration: true,
            publicPages: false
        },
        storageQuotas: {
            perSpace: 100, // GB
            perUser: 5 // GB
        },
        notificationChannels: {
            push: true,
            email: true
        },
        securityPolicies: {
            twoFactorOptional: true,
            sessionExpiry: 3600 // seconds
        },
        auditLogRetention: 90 // days
    });

    const updateSpaceData = (newData) => setSpaceData(prev => ({ ...prev, ...newData }));
    const updatePlanData = (newData) => setPlanData(prev => ({ ...prev, ...newData }));
    const updateRefundRequest = (newData) => setRefundRequest(prev => ({ ...prev, ...newData }));
    const updateSystemConfig = (newData) => setSystemConfig(prev => ({ ...prev, ...newData }));

    const resetSpaceData = () => setSpaceData({
        name: '',
        description: '',
        logo: null,
        category: '',
        region: '',
        contactEmail: '',
        contactPhone: '',
        admins: [],
        visibility: 'Private (internal only)',
        complianceConfirmed: false,
        status: 'Draft',
        staff: []
    });

    return (
        <BusinessContext.Provider value={{
            spaceData, updateSpaceData, resetSpaceData,
            planData, updatePlanData,
            refundRequest, updateRefundRequest,
            systemConfig, updateSystemConfig
        }}>
            {children}
        </BusinessContext.Provider>
    );
};
