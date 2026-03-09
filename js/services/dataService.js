// js/services/dataService.js
import config from '../config.js';
import { 
    getDashboardStats as mockGetDashboardStats,
    getRecentScans as mockGetRecentScans,
    getRecentMembers as mockGetRecentMembers 
} from '../mockData/dashboard.js';

/*const config = {
    apiBaseUrl: 'https://api.skylounge.example.com/v1',
    useMockData: localStorage.getItem('useMockData') === 'true' || false
};*/

export async function fetchDashboardStats() {
    if (config.useMockData) {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve(mockGetDashboardStats());
            }, 300);
        });
    }

    try {
        const response = await fetch(`${config.apiBaseUrl}/dashboard/stats`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        return { 
            success: false, 
            error: 'Network error',
            fallbackData: mockGetDashboardStats().data
        };
    }
}

export async function fetchRecentQrScans() {
    if (config.useMockData) {
        return new Promise(resolve => {
            setTimeout(() => resolve(mockGetRecentScans()), 300);
        });
    }

    try {
        const response = await fetch(`${config.apiBaseUrl}/qr-scans/recent`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        return {
            success: false,
            error: 'Failed to fetch scans',
            fallbackData: mockGetRecentScans().data
        };
    }
}

export async function fetchRecentMembers() {
    if (config.useMockData) {
        return new Promise(resolve => {
            setTimeout(() => resolve(mockGetRecentMembers()), 300);
        });
    }

    try {
        const response = await fetch(`${config.apiBaseUrl}/members/recent`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        return {
            success: false,
            error: 'Failed to fetch members',
            fallbackData: mockGetRecentMembers().data
        };
    }
}