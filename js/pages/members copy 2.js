// js/pages/members.js
import {
    fetchMembers,
    deleteMember
} from '../services/memberService.js';

export class MembersController {
    constructor() {
        this.elements = {
            loading: document.getElementById('loading-members'),
            error: document.getElementById('error-members'),
            addMemberBtn: document.getElementById('add-member'),
            searchInput: document.getElementById('search-members'),
            statusFilter: document.getElementById('filter-status'),
            itemsPerPage: document.getElementById('items-per-page'),
            membersTable: document.getElementById('membersTable'),
            tableSummary: document.getElementById('table-summary'),
            pagination: document.getElementById('pagination'),
            prevPageBtn: document.getElementById('prev-page'),
            nextPageBtn: document.getElementById('next-page'),
            pageInfo: document.getElementById('page-info'),
            iframeOverlay: document.getElementById('iframe-overlay'),
            iframeClose: document.getElementById('iframe-close'),
            memberFormIframe: document.getElementById('member-form-iframe')
        };

        this.state = {
            currentPage: 1,
            itemsPerPage: 10,
            totalItems: 0,
            allMembers: [],
            filteredMembers: [],
            displayedMembers: [],
            sortField: 'memberId',
            sortDirection: 'asc'
        };

        this.bindEvents();
        this.initialize();
    }

    bindEvents() {
        // Add member button
        if (this.elements.addMemberBtn) {
            this.elements.addMemberBtn.addEventListener('click', () => {
                this.openMemberForm();
            });
        }

        // Iframe close button
        if (this.elements.iframeClose) {
            this.elements.iframeClose.addEventListener('click', () => {
                this.closeMemberForm();
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

        if (this.elements.itemsPerPage) {
            this.elements.itemsPerPage.addEventListener('change', () => {
                this.state.itemsPerPage = parseInt(this.elements.itemsPerPage.value);
                this.state.currentPage = 1;
                this.updateDisplay();
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

        // Table sorting
        document.querySelectorAll('.sortable').forEach(header => {
            header.addEventListener('click', () => {
                const field = header.dataset.sort;
                if (this.state.sortField === field) {
                    this.state.sortDirection = this.state.sortDirection === 'asc' ? 'desc' : 'asc';
                } else {
                    this.state.sortField = field;
                    this.state.sortDirection = 'asc';
                }

                // Update sort indicators
                document.querySelectorAll('.sortable').forEach(h => {
                    h.classList.remove('sort-asc', 'sort-desc');
                });

                header.classList.add(`sort-${this.state.sortDirection}`);

                this.filterMembers();
            });
        });

        // Event delegation for action buttons
        document.addEventListener('click', (e) => {
            const viewBtn = e.target.closest('.action-btn.view');
            const editBtn = e.target.closest('.action-btn.edit');
            const deleteBtn = e.target.closest('.action-btn.delete');

            if (viewBtn) {
                const row = viewBtn.closest('tr');
                const id = row?.dataset.id;
                if (id) this.openMemberForm(id, 'view');
            }
            else if (editBtn) {
                const row = editBtn.closest('tr');
                const id = row?.dataset.id;
                if (id) this.openMemberForm(id, 'edit');
            }
            else if (deleteBtn) {
                const row = deleteBtn.closest('tr');
                const id = row?.dataset.id;
                if (id) this.confirmDelete(id);
            }
        });

        // Listen for messages from iframe
        // Add this to the message handler in members.js
        window.addEventListener('message', (e) => {
            if (e.data.type === 'MEMBER_FORM_CLOSE') {
                this.closeMemberForm();
            }
            if (e.data.type === 'MEMBER_FORM_SAVED') {
                this.closeMemberForm();
                this.loadMembers();
            }
            if (e.data.type === 'MEMBER_FORM_LOADED') {
                // Hide the iframe close button when form is loaded
                this.elements.iframeClose.style.display = 'none';
            }
        });
    }

    openMemberForm(id = null, mode = 'add') {
        let url = 'member-form.html';
        if (id) {
            url += `?id=${id}&mode=${mode}`;
        } else {
            url += '?mode=add';
        }

        this.elements.memberFormIframe.src = url;
        this.elements.iframeOverlay.style.display = 'block';
    }

    closeMemberForm() {
        this.elements.iframeOverlay.style.display = 'none';
        this.elements.memberFormIframe.src = '';
    }

    async initialize() {
        await this.loadMembers();
        // Set initial sort indicator
        const initialHeader = document.querySelector(`.sortable[data-sort="${this.state.sortField}"]`);
        if (initialHeader) {
            initialHeader.classList.add(`sort-${this.state.sortDirection}`);
        }
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

        // Filter members
        this.state.filteredMembers = this.state.allMembers.filter(member => {
            const matchesSearch =
                member.name.toLowerCase().includes(searchTerm) ||
                (member.email && member.email.toLowerCase().includes(searchTerm)) ||
                (member.phone && member.phone.toLowerCase().includes(searchTerm)) ||
                member.memberId.toLowerCase().includes(searchTerm);

            const matchesStatus = statusFilter ? member.status === statusFilter : true;

            return matchesSearch && matchesStatus;
        });

        // Sort members
        this.state.filteredMembers.sort((a, b) => {
            let valueA = a[this.state.sortField];
            let valueB = b[this.state.sortField];

            // Handle dates
            if (this.state.sortField === 'joinDate') {
                valueA = new Date(valueA);
                valueB = new Date(valueB);
            }

            // Handle case-insensitive string comparison
            if (typeof valueA === 'string') valueA = valueA.toLowerCase();
            if (typeof valueB === 'string') valueB = valueB.toLowerCase();

            if (valueA < valueB) return this.state.sortDirection === 'asc' ? -1 : 1;
            if (valueA > valueB) return this.state.sortDirection === 'asc' ? 1 : -1;
            return 0;
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

        tbody.innerHTML = this.state.displayedMembers.map((member, index) => {
            const rowNum = ((this.state.currentPage - 1) * this.state.itemsPerPage) + index + 1;
            return `
                <tr data-id="${member.id}">
                    <td>${rowNum}</td>
                    <td>${member.memberId}</td>
                    <td>${member.name}</td>
                    <td>${member.email || 'N/A'}</td>
                    <td>${member.joinDate ? new Date(member.joinDate).toLocaleDateString() : 'N/A'}</td>
                    <td>${this.getStatusBadge(member.status)}</td>
                    <td>
                        <button class="action-btn view" title="View"><i class="fas fa-eye"></i></button>
                        <button class="action-btn edit" title="Edit"><i class="fas fa-edit"></i></button>
                        <button class="action-btn delete" title="Delete"><i class="fas fa-trash-alt"></i></button>
                    </td>
                </tr>
            `;
        }).join('');
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

// Initialize controller
document.addEventListener('DOMContentLoaded', () => {
    new MembersController();
});