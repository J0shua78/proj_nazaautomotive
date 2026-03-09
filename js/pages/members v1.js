// js/pages/members.js
import { 
    fetchMembers,
    fetchMemberDetails,
    addMember,
    updateMember,
    deleteMember 
} from '../services/memberService.js';

export class MembersController {
    constructor() {
        this.elements = {
            loading: document.getElementById('loading-members'),
            error: document.getElementById('error-members'),
            mockToggle: document.getElementById('toggle-mock'),
            addMemberBtn: document.getElementById('add-member'),
            searchInput: document.getElementById('search-members'),
            statusFilter: document.getElementById('filter-status'),
            sortSelect: document.getElementById('sort-by'),
            membersTable: document.getElementById('membersTable'),
            tableSummary: document.getElementById('table-summary'),
            pagination: document.getElementById('pagination'),
            prevPageBtn: document.getElementById('prev-page'),
            nextPageBtn: document.getElementById('next-page'),
            pageInfo: document.getElementById('page-info'),
            modal: document.getElementById('member-modal'),
            modalTitle: document.getElementById('modal-title'),
            modalBody: document.getElementById('modal-body'),
            modalFooter: document.getElementById('modal-footer'),
            closeModal: document.getElementById('close-modal')
        };

        this.state = {
            currentPage: 1,
            itemsPerPage: 10,
            totalItems: 0,
            allMembers: [],
            filteredMembers: [],
            displayedMembers: []
        };

        this.bindEvents();
        this.initialize();
    }

    bindEvents() {
        // Mock data toggle
        if (this.elements.mockToggle) {
            this.elements.mockToggle.addEventListener('change', (e) => {
                localStorage.setItem('useMockData', e.target.checked);
                this.loadMembers();
            });
        }

        // Add member button
        if (this.elements.addMemberBtn) {
            this.elements.addMemberBtn.addEventListener('click', () => {
                this.showMemberForm();
            });
        }

        // Search and filter events
        if (this.elements.searchInput) {
            this.elements.searchInput.addEventListener('input', () => {
                this.filterMembers();
            });
        }

        if (this.elements.statusFilter) {
            this.elements.statusFilter.addEventListener('change', () => {
                this.filterMembers();
            });
        }

        if (this.elements.sortSelect) {
            this.elements.sortSelect.addEventListener('change', () => {
                this.filterMembers();
            });
        }

        // Pagination
        if (this.elements.prevPageBtn) {
            this.elements.prevPageBtn.addEventListener('click', () => {
                this.prevPage();
            });
        }

        if (this.elements.nextPageBtn) {
            this.elements.nextPageBtn.addEventListener('click', () => {
                this.nextPage();
            });
        }

        // Modal close
        if (this.elements.closeModal) {
            this.elements.closeModal.addEventListener('click', () => {
                this.closeModal();
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
                if (id) this.viewMember(id);
            }
            else if (editBtn) {
                const row = editBtn.closest('tr');
                const id = row?.dataset.id;
                if (id) this.editMember(id);
            }
            else if (deleteBtn) {
                const row = deleteBtn.closest('tr');
                const id = row?.dataset.id;
                if (id) this.confirmDelete(id);
            }
        });
    }

    async initialize() {
        const useMock = localStorage.getItem('useMockData') === 'true';
        if (this.elements.mockToggle) {
            this.elements.mockToggle.checked = useMock;
        }
        await this.loadMembers();
    }

    async loadMembers() {
        try {
            this.showLoading();
            const { data: members, success } = await fetchMembers();
            
            if (success && members) {
                this.state.allMembers = members;
                this.state.totalItems = members.length;
                this.filterMembers();
            } else {
                throw new Error('Failed to load members');
            }
        } catch (error) {
            this.showError(error.message);
        } finally {
            this.hideLoading();
        }
    }

    filterMembers() {
        const searchTerm = this.elements.searchInput?.value.toLowerCase() || '';
        const statusFilter = this.elements.statusFilter?.value || '';
        const sortBy = this.elements.sortSelect?.value || 'name-asc';

        // Filter members
        this.state.filteredMembers = this.state.allMembers.filter(member => {
            const matchesSearch = 
                member.name.toLowerCase().includes(searchTerm) ||
                member.email.toLowerCase().includes(searchTerm) ||
                member.phone.toLowerCase().includes(searchTerm) ||
                member.memberId.toLowerCase().includes(searchTerm);
            
            const matchesStatus = statusFilter ? member.status === statusFilter : true;
            
            return matchesSearch && matchesStatus;
        });

        // Sort members
        this.state.filteredMembers.sort((a, b) => {
            switch (sortBy) {
                case 'name-asc':
                    return a.name.localeCompare(b.name);
                case 'name-desc':
                    return b.name.localeCompare(a.name);
                case 'date-asc':
                    return new Date(a.joinDate) - new Date(b.joinDate);
                case 'date-desc':
                    return new Date(b.joinDate) - new Date(a.joinDate);
                default:
                    return 0;
            }
        });

        this.state.totalItems = this.state.filteredMembers.length;
        this.state.currentPage = 1;
        this.updateDisplay();
    }

    updateDisplay() {
        // Calculate pagination
        const startIdx = (this.state.currentPage - 1) * this.state.itemsPerPage;
        const endIdx = startIdx + this.state.itemsPerPage;
        this.state.displayedMembers = this.state.filteredMembers.slice(startIdx, endIdx);

        // Update table
        this.renderMembers();

        // Update pagination controls
        this.updatePagination();

        // Update summary
        if (this.elements.tableSummary) {
            const total = this.state.filteredMembers.length;
            const start = total > 0 ? startIdx + 1 : 0;
            const end = Math.min(endIdx, total);
            this.elements.tableSummary.textContent = `Showing ${start}-${end} of ${total} members`;
        }
    }

    renderMembers() {
        const tbody = this.elements.membersTable?.querySelector('tbody');
        if (!tbody) return;

        tbody.innerHTML = this.state.displayedMembers.map(member => `
            <tr data-id="${member.id}">
                <td>${member.memberId}</td>
                <td>${member.name}</td>
                <td>${member.email || 'N/A'}</td>
                <td>${member.phone || 'N/A'}</td>
                <td>${member.joinDate ? new Date(member.joinDate).toLocaleDateString() : 'N/A'}</td>
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

    updatePagination() {
        if (!this.elements.pagination) return;

        const totalPages = Math.ceil(this.state.totalItems / this.state.itemsPerPage);

        this.elements.prevPageBtn.disabled = this.state.currentPage <= 1;
        this.elements.nextPageBtn.disabled = this.state.currentPage >= totalPages;

        if (this.elements.pageInfo) {
            this.elements.pageInfo.textContent = `Page ${this.state.currentPage} of ${totalPages}`;
        }
    }

    prevPage() {
        if (this.state.currentPage > 1) {
            this.state.currentPage--;
            this.updateDisplay();
        }
    }

    nextPage() {
        const totalPages = Math.ceil(this.state.totalItems / this.state.itemsPerPage);
        if (this.state.currentPage < totalPages) {
            this.state.currentPage++;
            this.updateDisplay();
        }
    }

    async viewMember(id) {
        try {
            this.showLoading();
            const { data: member, success } = await fetchMemberDetails(id);
            
            if (success && member) {
                this.showMemberDetails(member);
            } else {
                throw new Error('Failed to load member details');
            }
        } catch (error) {
            this.showError(error.message);
        } finally {
            this.hideLoading();
        }
    }

    async editMember(id) {
        try {
            this.showLoading();
            const { data: member, success } = await fetchMemberDetails(id);
            
            if (success && member) {
                this.showMemberForm(member);
            } else {
                throw new Error('Failed to load member details');
            }
        } catch (error) {
            this.showError(error.message);
        } finally {
            this.hideLoading();
        }
    }

    showMemberDetails(member) {
        if (!this.elements.modal) return;

        this.elements.modalTitle.textContent = `Member: ${member.name}`;
        
        this.elements.modalBody.innerHTML = `
            <div class="member-details">
                <p><strong>Member ID:</strong> ${member.memberId}</p>
                <p><strong>Name:</strong> ${member.name}</p>
                <p><strong>Email:</strong> ${member.email || 'N/A'}</p>
                <p><strong>Phone:</strong> ${member.phone || 'N/A'}</p>
                <p><strong>Join Date:</strong> ${member.joinDate ? new Date(member.joinDate).toLocaleDateString() : 'N/A'}</p>
                <p><strong>Status:</strong> ${this.getStatusBadge(member.status)}</p>
                ${member.notes ? `<p><strong>Notes:</strong> ${member.notes}</p>` : ''}
            </div>
        `;

        this.elements.modalFooter.innerHTML = `
            <button class="action-btn edit" id="edit-member">
                <i class="fas fa-edit"></i> Edit
            </button>
            <button class="action-btn view" id="close-modal">
                <i class="fas fa-times"></i> Close
            </button>
        `;

        document.getElementById('edit-member')?.addEventListener('click', () => {
            this.editMember(member.id);
        });

        document.getElementById('close-modal')?.addEventListener('click', () => {
            this.closeModal();
        });

        this.elements.modal.style.display = 'flex';
    }

    showMemberForm(member = null) {
        if (!this.elements.modal) return;

        const isEdit = member !== null;
        
        this.elements.modalTitle.textContent = isEdit ? `Edit Member: ${member.name}` : 'Add New Member';
        
        this.elements.modalBody.innerHTML = `
            <div class="form-group">
                <label for="member-name">Full Name *</label>
                <input type="text" id="member-name" value="${isEdit ? member.name : ''}" required>
            </div>
            <div class="form-group">
                <label for="member-email">Email</label>
                <input type="email" id="member-email" value="${isEdit ? member.email || '' : ''}">
            </div>
            <div class="form-group">
                <label for="member-phone">Phone</label>
                <input type="tel" id="member-phone" value="${isEdit ? member.phone || '' : ''}">
            </div>
            <div class="form-group">
                <label for="member-status">Status *</label>
                <select id="member-status" required>
                    <option value="active" ${isEdit && member.status === 'active' ? 'selected' : ''}>Active</option>
                    <option value="pending" ${isEdit && member.status === 'pending' ? 'selected' : ''}>Pending</option>
                    <option value="expired" ${isEdit && member.status === 'expired' ? 'selected' : ''}>Expired</option>
                </select>
            </div>
            <div class="form-group">
                <label for="member-notes">Notes</label>
                <textarea id="member-notes" rows="3">${isEdit ? member.notes || '' : ''}</textarea>
            </div>
        `;

        this.elements.modalFooter.innerHTML = `
            <button class="action-btn ${isEdit ? 'edit' : 'success'}" id="save-member">
                <i class="fas fa-save"></i> ${isEdit ? 'Update' : 'Save'}
            </button>
            <button class="action-btn danger" id="cancel-form">
                <i class="fas fa-times"></i> Cancel
            </button>
        `;

        document.getElementById('save-member')?.addEventListener('click', async () => {
            const memberData = {
                name: document.getElementById('member-name').value,
                email: document.getElementById('member-email').value,
                phone: document.getElementById('member-phone').value,
                status: document.getElementById('member-status').value,
                notes: document.getElementById('member-notes').value
            };

            if (!memberData.name) {
                alert('Name is required');
                return;
            }

            try {
                this.showLoading();
                let result;
                
                if (isEdit) {
                    result = await updateMember(member.id, memberData);
                } else {
                    // Generate a mock member ID for new members
                    memberData.memberId = `SLM-${Math.floor(1000 + Math.random() * 9000)}`;
                    memberData.joinDate = new Date().toISOString();
                    result = await addMember(memberData);
                }

                if (result.success) {
                    this.closeModal();
                    await this.loadMembers();
                } else {
                    throw new Error(result.error || 'Failed to save member');
                }
            } catch (error) {
                this.showError(error.message);
            } finally {
                this.hideLoading();
            }
        });

        document.getElementById('cancel-form')?.addEventListener('click', () => {
            this.closeModal();
        });

        this.elements.modal.style.display = 'flex';
    }

    async confirmDelete(id) {
        const member = this.state.allMembers.find(m => m.id === id);
        if (!member) return;

        if (confirm(`Are you sure you want to delete member ${member.name} (ID: ${member.memberId})?`)) {
            try {
                this.showLoading();
                const { success } = await deleteMember(id);
                
                if (success) {
                    await this.loadMembers();
                } else {
                    throw new Error('Failed to delete member');
                }
            } catch (error) {
                this.showError(error.message);
            } finally {
                this.hideLoading();
            }
        }
    }

    closeModal() {
        if (this.elements.modal) {
            this.elements.modal.style.display = 'none';
        }
    }

    getStatusBadge(status) {
        const badges = {
            active: 'active',
            pending: 'pending',
            expired: 'expired'
        };
        const badgeClass = badges[status] || 'pending';
        const displayText = status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown';
        return `<span class="status-badge ${badgeClass}">${displayText}</span>`;
    }

    showLoading() {
        if (this.elements.loading) {
            this.elements.loading.style.display = 'block';
        }
        if (this.elements.error) {
            this.elements.error.style.display = 'none';
        }
    }

    hideLoading() {
        if (this.elements.loading) {
            this.elements.loading.style.display = 'none';
        }
    }

    showError(message) {
        if (this.elements.error) {
            this.elements.error.textContent = message || 'An unknown error occurred';
            this.elements.error.style.display = 'block';
        }
    }
}