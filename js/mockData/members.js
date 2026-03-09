// js/mockData/members.js
let mockMembers = [
    {
        id: "1",
        memberId: "SLM-1001",
        name: "John Smith",
        email: "john.smith@example.com",
        phone: "+1 555-123-4567",
        joinDate: "2023-01-15T10:30:00Z",
        status: "active",
        notes: "VIP member with premium access"
    },
    {
        id: "2",
        memberId: "SLM-1002",
        name: "Sarah Johnson",
        email: "sarah.j@example.com",
        phone: "+1 555-987-6543",
        joinDate: "2023-02-20T14:15:00Z",
        status: "active",
        notes: "Prefers window seats"
    },
    {
        id: "3",
        memberId: "SLM-1003",
        name: "Michael Chen",
        email: "michael.chen@example.com",
        phone: "+1 555-456-7890",
        joinDate: "2023-03-10T09:45:00Z",
        status: "pending",
        notes: "Waiting for payment confirmation"
    },
    {
        id: "4",
        memberId: "SLM-1004",
        name: "Emily Wilson",
        email: "emily.w@example.com",
        phone: "+1 555-789-0123",
        joinDate: "2022-12-05T16:20:00Z",
        status: "expired",
        notes: "Membership expired, potential renewal"
    },
    {
        id: "5",
        memberId: "SLM-1005",
        name: "David Kim",
        email: "david.kim@example.com",
        phone: "+1 555-234-5678",
        joinDate: "2023-04-01T11:10:00Z",
        status: "active",
        notes: "Frequent visitor, prefers quiet areas"
    },
    {
        id: "6",
        memberId: "SLM-1001",
        name: "John Smith",
        email: "john.smith@example.com",
        phone: "+1 555-123-4567",
        joinDate: "2023-01-15T10:30:00Z",
        status: "active",
        notes: "VIP member with premium access"
    },
    {
        id: "7",
        memberId: "SLM-1002",
        name: "Sarah Johnson",
        email: "sarah.j@example.com",
        phone: "+1 555-987-6543",
        joinDate: "2023-02-20T14:15:00Z",
        status: "active",
        notes: "Prefers window seats"
    },
    {
        id: "8",
        memberId: "SLM-1003",
        name: "Michael Chen",
        email: "michael.chen@example.com",
        phone: "+1 555-456-7890",
        joinDate: "2023-03-10T09:45:00Z",
        status: "pending",
        notes: "Waiting for payment confirmation"
    },
    {
        id: "9",
        memberId: "SLM-1004",
        name: "Emily Wilson",
        email: "emily.w@example.com",
        phone: "+1 555-789-0123",
        joinDate: "2022-12-05T16:20:00Z",
        status: "expired",
        notes: "Membership expired, potential renewal"
    },
    {
        id: "10",
        memberId: "SLM-1005",
        name: "David Kim",
        email: "david.kim@example.com",
        phone: "+1 555-234-5678",
        joinDate: "2023-04-01T11:10:00Z",
        status: "active",
        notes: "Frequent visitor, prefers quiet areas"
    }
];

export function getMembers() {
    return {
        success: true,
        data: [...mockMembers]
    };
}

export function getMemberDetails(id) {
    const member = mockMembers.find(m => m.id === id);
    return {
        success: !!member,
        data: member ? {...member} : null
    };
}

export function addMember(memberData) {
    const newMember = {
        id: String(Math.max(...mockMembers.map(m => parseInt(m.id))) + 1),
        ...memberData
    };
    mockMembers.push(newMember);
    return {
        success: true,
        data: {...newMember}
    };
}

export function updateMember(id, memberData) {
    const index = mockMembers.findIndex(m => m.id === id);
    if (index >= 0) {
        mockMembers[index] = {
            ...mockMembers[index],
            ...memberData
        };
        return {
            success: true,
            data: {...mockMembers[index]}
        };
    }
    return {
        success: false,
        error: 'Member not found'
    };
}

export function deleteMember(id) {
    const initialLength = mockMembers.length;
    mockMembers = mockMembers.filter(m => m.id !== id);
    return {
        success: mockMembers.length < initialLength
    };
}