// js/mockData/dashboard.js
export function getDashboardStats() {
    return {
        success: true,
        data: {
            totalMembers: 1248,
            todayVisits: 327,
            pendingApprovals: 18
        }
    };
}

export function getRecentScans() {
    return {
        success: true,
        data: [
            {
                id: 1,
                memberId: "SLM-1001",
                name: "John Smith",
                location: "Main Lounge",
                time: new Date().toISOString(),
                status: "success"
            },
            {
                id: 2,
                memberId: "SLM-1042",
                name: "Sarah Johnson",
                location: "Rooftop Bar",
                time: new Date(Date.now() - 3600000).toISOString(),
                status: "success"
            },
            {
                id: 3,
                memberId: "SLM-1085",
                name: "Michael Chen",
                location: "VIP Lounge",
                time: new Date(Date.now() - 7200000).toISOString(),
                status: "pending"
            }
        ]
    };
}

export function getRecentMembers() {
    return {
        success: true,
        data: [
            {
                id: 1,
                memberId: "SLM-2001",
                name: "Alice Johnson",
                joinDate: "2023-07-01",
                status: "active"
            },
            {
                id: 2,
                memberId: "SLM-2002",
                name: "Bob Williams",
                joinDate: "2023-07-05",
                status: "active"
            },
            {
                id: 3,
                memberId: "SLM-2003",
                name: "Carol Davis",
                joinDate: "2023-07-10",
                status: "pending"
            }
        ]
    };
}