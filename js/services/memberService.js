// js/services/memberService.js
import config from '../config.js';
import { 
    getMembers as mockGetMembers,
    getMemberDetails as mockGetMemberDetails,
    addMember as mockAddMember,
    updateMember as mockUpdateMember,
    deleteMember as mockDeleteMember
} from '../mockData/members.js';

/*const config = {
    apiBaseUrl: 'https://api.skylounge.example.com/v1',
    useMockData: localStorage.getItem('useMockData') === 'true' || false
};*/

export async function fetchMembers() {
    if (config.useMockData) {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve(mockGetMembers());
            }, 300);
        });
    }

    try {
        const response = await fetch(`${config.apiBaseUrl}/members`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        return { 
            success: false, 
            error: 'Network error',
            fallbackData: mockGetMembers().data
        };
    }
}

export async function fetchMemberDetails(id) {
    if (config.useMockData) {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve(mockGetMemberDetails(id));
            }, 300);
        });
    }

    try {
        const response = await fetch(`${config.apiBaseUrl}/members/${id}`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        return {
            success: false,
            error: 'Failed to fetch member details',
            fallbackData: mockGetMemberDetails(id).data
        };
    }
}

export async function addMember(memberData) {
    if (config.useMockData) {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve(mockAddMember(memberData));
            }, 300);
        });
    }

    try {
        const response = await fetch(`${config.apiBaseUrl}/members`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(memberData)
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        return {
            success: false,
            error: 'Failed to add member'
        };
    }
}

export async function updateMember(id, memberData) {
    if (config.useMockData) {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve(mockUpdateMember(id, memberData));
            }, 300);
        });
    }

    try {
        const response = await fetch(`${config.apiBaseUrl}/members/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(memberData)
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        return {
            success: false,
            error: 'Failed to update member'
        };
    }
}

export async function deleteMember(id) {
    if (config.useMockData) {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve(mockDeleteMember(id));
            }, 300);
        });
    }

    try {
        const response = await fetch(`${config.apiBaseUrl}/members/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        return {
            success: false,
            error: 'Failed to delete member'
        };
    }
}