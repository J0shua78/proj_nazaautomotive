// js/pages/dashboard.js
import { 
    fetchRecentQrScans, 
    fetchDashboardStats, 
    fetchRecentMembers 
} from '../services/dataService.js';

export class DashboardController {
    constructor() {
        this.elements = {
            loadingScans: document.getElementById('loading-scans'),
            errorScans: document.getElementById('error-scans'),
            statsCards: {
                totalMembers: document.querySelector('.stat-card.primary .stat-value'),
                todayVisits: document.querySelector('.stat-card.success .stat-value'),
                pendingApprovals: document.querySelector('.stat-card.warning .stat-value')
            },
            recentScansTable: document.querySelector('#recentScansTable'),
            recentMembersTable: document.querySelector('#recentMembersTable'),
            mockToggle: document.getElementById('toggle-mock'),
            modal: document.getElementById('details-modal'),
            modalTitle: document.getElementById('modal-title'),
            modalBody: document.getElementById('modal-body'),
            modalFooter: document.getElementById('modal-footer'),
            closeModal: document.getElementById('close-modal')
        };

        this.currentData = {
            scans: [],
            members: []
        };

        this.bindEvents();
        this.initialize();
    }

    bindEvents() {
        // Mock data toggle
        if (this.elements.mockToggle) {
            this.elements.mockToggle.addEventListener('change', (e) => {
                localStorage.setItem('useMockData', e.target.checked);
                this.loadAllData();
            });
        }

        // Modal close button
        if (this.elements.closeModal) {
            this.elements.closeModal.addEventListener('click', () => this.closeModal());
        }

        // Close modal when clicking outside
        if (this.elements.modal) {
            this.elements.modal.addEventListener('click', (e) => {
                if (e.target === this.elements.modal) {
                    this.closeModal();
                }
            });
        }

        // Event delegation for action buttons
        document.addEventListener('click', (e) => {
            const viewBtn = e.target.closest('.action-btn.view');
            const editBtn = e.target.closest('.action-btn.edit');
            const deleteBtn = e.target.closest('.action-btn.delete');
            
            if (viewBtn) {
                const row = viewBtn.closest('tr');
                const id = row?.dataset.id;
                const table = viewBtn.closest('table');
                const type = table?.id === 'recentScansTable' ? 'scan' : 'member';
                if (id) this.showDetailsModal(id, type, 'view');
            }
            else if (editBtn) {
                const row = editBtn.closest('tr');
                const id = row?.dataset.id;
                const table = editBtn.closest('table');
                const type = table?.id === 'recentScansTable' ? 'scan' : 'member';
                if (id) this.showDetailsModal(id, type, 'edit');
            }
            else if (deleteBtn) {
                const row = deleteBtn.closest('tr');
                const id = row?.dataset.id;
                const table = deleteBtn.closest('table');
                const type = table?.id === 'recentScansTable' ? 'scan' : 'member';
                if (id) this.confirmDelete(id, type);
            }
        });
    }

    async initialize() {
        const useMock = localStorage.getItem('useMockData') === 'true';
        if (this.elements.mockToggle) {
            this.elements.mockToggle.checked = useMock;
        }
        await this.loadAllData();
    }

    async loadAllData() {
        await Promise.allSettled([
            this.loadDashboardStats(),
            this.loadRecentScans(),
            this.loadRecentMembers()
        ]);
    }

    async loadDashboardStats() {
        try {
            const { data: stats, success } = await fetchDashboardStats();
            if (success && stats) {
                this.updateStatsCards(stats);
            }
        } catch (error) {
            console.error('Error loading stats:', error);
        }
    }

    async loadRecentScans() {
        try {
            this.showLoading();
            const { data: scans, success } = await fetchRecentQrScans();
            
            if (success && scans) {
                this.currentData.scans = scans;
                this.renderScans(scans);
            } else {
                throw new Error('Failed to load scans');
            }
        } catch (error) {
            this.showError(error.message);
        } finally {
            this.hideLoading();
        }
    }

    async loadRecentMembers() {
        try {
            const { data: members, success } = await fetchRecentMembers();
            if (success && members) {
                this.currentData.members = members;
                this.renderMembers(members);
            }
        } catch (error) {
            console.error('Error loading members:', error);
        }
    }

    updateStatsCards(stats) {
        if (!stats || !this.elements.statsCards) return;

        const { totalMembers, todayVisits, pendingApprovals } = this.elements.statsCards;
        
        if (totalMembers && stats.totalMembers !== undefined) {
            totalMembers.textContent = stats.totalMembers.toLocaleString();
        }
        if (todayVisits && stats.todayVisits !== undefined) {
            todayVisits.textContent = stats.todayVisits.toLocaleString();
        }
        if (pendingApprovals && stats.pendingApprovals !== undefined) {
            pendingApprovals.textContent = stats.pendingApprovals.toLocaleString();
        }
    }

    renderScans(scans) {
        if (!this.elements.recentScansTable || !Array.isArray(scans)) return;

        const tbody = this.elements.recentScansTable.querySelector('tbody');
        if (!tbody) return;

        tbody.innerHTML = scans.map(scan => `
            <tr data-id="${scan.id || ''}">
                <td>${scan.memberId || 'N/A'}</td>
                <td>${scan.name || 'Unknown'}</td>
                <td>${scan.location || 'Unknown'}</td>
                <td>${scan.time ? new Date(scan.time).toLocaleString() : 'N/A'}</td>
                <td>${this.getStatusBadge(scan.status)}</td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn view">
                            <i class="fas fa-eye"></i> View
                        </button>
                        <button class="action-btn edit">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    renderMembers(members) {
        if (!this.elements.recentMembersTable || !Array.isArray(members)) return;

        const tbody = this.elements.recentMembersTable.querySelector('tbody');
        if (!tbody) return;

        tbody.innerHTML = members.map(member => `
            <tr data-id="${member.id || ''}">
                <td>${member.memberId || 'N/A'}</td>
                <td>${member.name || 'Unknown'}</td>
                <td>${member.joinDate || 'N/A'}</td>
                <td>${this.getStatusBadge(member.status)}</td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn view">
                            <i class="fas fa-eye"></i> View
                        </button>
                        <button class="action-btn edit">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="action-btn delete">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    showDetailsModal(id, type, mode) {
        if (!this.elements.modal) return;

        // Find the item in our current data
        const items = type === 'scan' ? this.currentData.scans : this.currentData.members;
        const item = items.find(item => item.id == id); // Use loose equality for string/number IDs

        if (!item) {
            console.error('Item not found:', {id, type});
            return;
        }

        // Prepare modal content based on mode
        const title = `${mode === 'view' ? 'View' : 'Edit'} ${type === 'scan' ? 'Scan' : 'Member'}`;
        
        let content = `
            <p><strong>ID:</strong> ${item.id}</p>
            <p><strong>Name:</strong> ${item.name || 'Unknown'}</p>
        `;

        if (type === 'scan') {
            content += `
                <p><strong>Location:</strong> ${item.location || 'Unknown'}</p>
                <p><strong>Time:</strong> ${item.time ? new Date(item.time).toLocaleString() : 'N/A'}</p>
                <p><strong>Status:</strong> ${this.getStatusBadge(item.status)}</p>
            `;
        } else {
            content += `
                <p><strong>Member ID:</strong> ${item.memberId || 'N/A'}</p>
                <p><strong>Join Date:</strong> ${item.joinDate || 'N/A'}</p>
                <p><strong>Status:</strong> ${this.getStatusBadge(item.status)}</p>
            `;
        }

        if (mode === 'edit') {
            content += `
                <div class="form-group" style="margin-top: 15px;">
                    <label for="edit-name"><strong>Edit Name:</strong></label>
                    <input type="text" id="edit-name" class="form-control" value="${item.name || ''}" style="width: 100%; padding: 8px; margin-top: 5px;">
                </div>
            `;
        }

        const buttons = mode === 'view' ? `
            <button class="action-btn edit" id="switch-to-edit">
                <i class="fas fa-edit"></i> Switch to Edit
            </button>
            <button class="action-btn view" id="close-modal-btn">
                <i class="fas fa-times"></i> Close
            </button>
        ` : `
            <button class="action-btn success" id="save-changes">
                <i class="fas fa-save"></i> Save Changes
            </button>
            <button class="action-btn danger" id="cancel-edit">
                <i class="fas fa-times"></i> Cancel
            </button>
        `;

        this.elements.modalTitle.textContent = title;
        this.elements.modalBody.innerHTML = content;
        this.elements.modalFooter.innerHTML = buttons;

        // Set up modal button events
        if (mode === 'view') {
            document.getElementById('switch-to-edit')?.addEventListener('click', () => {
                this.showDetailsModal(id, type, 'edit');
            });
            document.getElementById('close-modal-btn')?.addEventListener('click', () => {
                this.closeModal();
            });
        } else {
            document.getElementById('save-changes')?.addEventListener('click', () => {
                const newName = document.getElementById('edit-name')?.value;
                if (newName) {
                    // Update the item in our current data
                    item.name = newName;
                    // Re-render the table to show updated name
                    if (type === 'scan') {
                        this.renderScans(this.currentData.scans);
                    } else {
                        this.renderMembers(this.currentData.members);
                    }
                    alert(`Successfully updated ${type} ${id}`);
                }
                this.closeModal();
            });
            document.getElementById('cancel-edit')?.addEventListener('click', () => {
                this.closeModal();
            });
        }

        this.elements.modal.style.display = 'flex';
    }

    confirmDelete(id, type) {
        if (confirm(`Are you sure you want to delete this ${type} (ID: ${id})?`)) {
            // Remove from current data
            if (type === 'scan') {
                this.currentData.scans = this.currentData.scans.filter(scan => scan.id != id);
                this.renderScans(this.currentData.scans);
            } else {
                this.currentData.members = this.currentData.members.filter(member => member.id != id);
                this.renderMembers(this.currentData.members);
            }
            alert(`Successfully deleted ${type} ${id}`);
        }
    }

    closeModal() {
        if (this.elements.modal) {
            this.elements.modal.style.display = 'none';
        }
    }

    getStatusBadge(status) {
        const badges = {
            success: 'success',
            active: 'success',
            pending: 'warning',
            expired: 'danger',
            failed: 'danger'
        };
        const badgeClass = badges[status] || 'warning';
        const displayText = status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown';
        return `<span class="status-badge ${badgeClass}">${displayText}</span>`;
    }

    showLoading() {
        if (this.elements.loadingScans) {
            this.elements.loadingScans.style.display = 'block';
        }
        if (this.elements.errorScans) {
            this.elements.errorScans.style.display = 'none';
        }
    }

    hideLoading() {
        if (this.elements.loadingScans) {
            this.elements.loadingScans.style.display = 'none';
        }
    }

    showError(message) {
        if (this.elements.errorScans) {
            this.elements.errorScans.textContent = message || 'An unknown error occurred';
            this.elements.errorScans.style.display = 'block';
        }
    }
}