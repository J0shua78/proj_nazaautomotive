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
            recentScansTable: document.querySelector('#recentScansTable tbody'),
            recentMembersTable: document.querySelector('#recentMembersTable tbody'),
            mockToggle: document.getElementById('toggle-mock'),
            modal: document.getElementById('details-modal'),
            modalTitle: document.getElementById('modal-title'),
            modalBody: document.getElementById('modal-body'),
            modalFooter: document.getElementById('modal-footer'),
            closeModal: document.getElementById('close-modal')
        };

        this.bindEvents();
        this.initialize();
    }

    bindEvents() {
        if (this.elements.mockToggle) {
            this.elements.mockToggle.addEventListener('change', (e) => {
                localStorage.setItem('useMockData', e.target.checked);
                this.loadAllData();
            });
        }

        if (this.elements.closeModal) {
            this.elements.closeModal.addEventListener('click', () => {
                this.closeModal();
            });
        }

        // Close modal when clicking outside
        this.elements.modal?.addEventListener('click', (e) => {
            if (e.target === this.elements.modal) {
                this.closeModal();
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
                this.renderScans(scans);
                this.setupActionButtons('#recentScansTable', 'scan');
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
                this.renderMembers(members);
                this.setupActionButtons('#recentMembersTable', 'member');
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

        this.elements.recentScansTable.innerHTML = scans.map(scan => `
            <tr data-id="${scan.id || ''}">
                <td>${scan.memberId || 'N/A'}</td>
                <td>${scan.name || 'Unknown'}</td>
                <td>${scan.location || 'Unknown'}</td>
                <td>${scan.time ? new Date(scan.time).toLocaleString() : 'N/A'}</td>
                <td>${this.getStatusBadge(scan.status)}</td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn view" data-id="${scan.id || ''}">
                            <i class="fas fa-eye"></i> View
                        </button>
                        <button class="action-btn edit" data-id="${scan.id || ''}">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    renderMembers(members) {
        if (!this.elements.recentMembersTable || !Array.isArray(members)) return;

        this.elements.recentMembersTable.innerHTML = members.map(member => `
            <tr data-id="${member.id || ''}">
                <td>${member.memberId || 'N/A'}</td>
                <td>${member.name || 'Unknown'}</td>
                <td>${member.joinDate || 'N/A'}</td>
                <td>${this.getStatusBadge(member.status)}</td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn view" data-id="${member.id || ''}">
                            <i class="fas fa-eye"></i> View
                        </button>
                        <button class="action-btn edit" data-id="${member.id || ''}">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="action-btn delete" data-id="${member.id || ''}">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    setupActionButtons(tableSelector, type) {
        const table = document.querySelector(tableSelector);
        if (!table) return;

        table.addEventListener('click', (e) => {
            const viewBtn = e.target.closest('.action-btn.view');
            const editBtn = e.target.closest('.action-btn.edit');
            const deleteBtn = e.target.closest('.action-btn.delete');
            const row = e.target.closest('tr');
            const id = row?.dataset.id;

            if (viewBtn && id) {
                this.showDetailsModal(id, type, 'view');
            } else if (editBtn && id) {
                this.showDetailsModal(id, type, 'edit');
            } else if (deleteBtn && id) {
                this.confirmDelete(id, type);
            }
        });
    }

    showDetailsModal(id, type, mode) {
        if (!this.elements.modal) return;

        // In a real app, you would fetch the detailed data here
        // For simulation, we'll use mock data
        const title = `${mode === 'view' ? 'View' : 'Edit'} ${type === 'scan' ? 'Scan' : 'Member'}`;
        const content = `
            <p><strong>ID:</strong> ${id}</p>
            <p><strong>Type:</strong> ${type}</p>
            <p><strong>Mode:</strong> ${mode}</p>
            ${mode === 'edit' ? `
            <div class="form-group">
                <label for="edit-field">Edit Field:</label>
                <input type="text" id="edit-field" class="form-control" value="Sample Value">
            </div>
            ` : ''}
        `;

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
                alert(`Changes saved for ${type} ${id}`);
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
            alert(`Deleted ${type} ${id}`);
            // In a real app, you would call an API to delete here
            // Then refresh the data
            this.loadAllData();
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