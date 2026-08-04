import React, { createContext, useContext, useState } from 'react';

const EventContext = createContext();

export const useEvent = () => {
    const context = useContext(EventContext);
    if (!context) {
        throw new Error('useEvent must be used within an EventProvider');
    }
    return context;
};

export const EventProvider = ({ children }) => {
    const [eventData, setEventData] = useState({
        // Basic Info
        title: '',
        type: 'Meeting',
        description: '',
        startDate: '',
        endDate: '',
        locationType: 'physical',
        address: '',
        meetingLink: '',
        rsvpDeadline: '',
        capacity: '',
        visibility: 'Family visible',

        // Invite Scope
        audience: 'Entire family',
        inviteMethods: { notification: true, email: false },
        reminders: ['1d before'],
        guestsAllowed: '',

        // Ritual Protocols
        ritualTemplate: 'None',
        workflowSteps: [
            { id: 1, title: 'Welcome Address', description: 'Host introduces the purpose and guests.', time: '10:00', role: '主持' }
        ],
        dressCode: '',
        etiquetteNotes: '',
        recordingAllowed: true,
        offerings: [],

        // Secret Santa
        isSecretSanta: false,
        secretSantaData: {
            exchangeName: '',
            description: '',
            eventDate: '',
            giftDeadline: '',
            budgetMin: '',
            budgetMax: '',
            notes: '',
            anonymousMode: true,
            participants: []
        }
    });

    const updateEventData = (newData) => {
        setEventData(prev => ({ ...prev, ...newData }));
    };

    const resetEventData = () => {
        setEventData({
            title: '',
            type: 'Meeting',
            description: '',
            startDate: '',
            endDate: '',
            locationType: 'physical',
            address: '',
            meetingLink: '',
            rsvpDeadline: '',
            capacity: '',
            visibility: 'Family visible',
            audience: 'Entire family',
            inviteMethods: { notification: true, email: false },
            reminders: ['1d before'],
            guestsAllowed: '',
            ritualTemplate: 'None',
            workflowSteps: [
                { id: 1, title: 'Welcome Address', description: 'Host introduces the purpose and guests.', time: '10:00', role: '主持' }
            ],
            dressCode: '',
            etiquetteNotes: '',
            recordingAllowed: true,
            offerings: [],
            isSecretSanta: false,
            secretSantaData: {
                exchangeName: '',
                description: '',
                eventDate: '',
                giftDeadline: '',
                budgetMin: '',
                budgetMax: '',
                notes: '',
                anonymousMode: true,
                participants: []
            }
        });
    };

    return (
        <EventContext.Provider value={{ eventData, updateEventData, resetEventData }}>
            {children}
        </EventContext.Provider>
    );
};
