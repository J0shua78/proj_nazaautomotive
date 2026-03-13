// js/mockData/members.js
let mockMembers = [];

const statuses = ["active", "pending", "expired"];
const names = ["John", "Sarah", "Michael", "Emily", "David", "Jessica", "Robert", "Linda", "William", "Karen"];
const surnames = ["Smith", "Johnson", "Chen", "Wilson", "Kim", "Brown", "Davis", "Miller", "Taylor", "Anderson"];

// Generate 1000 members
for (let i = 1; i <= 1000; i++) {
    const firstName = names[Math.floor(Math.random() * names.length)];
    const lastName = surnames[Math.floor(Math.random() * surnames.length)];
    
    mockMembers.push({
        id: String(i),
        memberId: `SLM-${1000 + i}`,
        name: `${firstName} ${lastName}`,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@example.com`,
        phone: `+1 555-${String(100 + i).padStart(3, '0')}-${String(1000 + i).slice(-4)}`,
        joinDate: new Date(2022, 0, 1 + (i % 365)).toISOString(),
        status: statuses[i % statuses.length],
        notes: "Automated test user profile."
    });
}

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
        id: String(mockMembers.length + 1),
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
        mockMembers[index] = { ...mockMembers[index], ...memberData };
        return { success: true, data: {...mockMembers[index]} };
    }
    return { success: false, error: 'Member not found' };
}

export function deleteMember(id) {
    const initialLength = mockMembers.length;
    mockMembers = mockMembers.filter(m => m.id !== id);
    return { success: mockMembers.length < initialLength };
}