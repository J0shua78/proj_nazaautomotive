// js/pages/member-form.js
import {
    fetchMemberDetails,
    addMember,
    updateMember,
    deleteMember
} from '../services/objectService.js';

export class MemberFormController {
    constructor() {
        this.elements = {
            formTitle: document.getElementById('form-title'),
            formActions: document.getElementById('form-actions'),
            errorContainer: document.getElementById('error-container'),
            loadingContainer: document.getElementById('loading-container'),
            formBody: document.getElementById('form-body'),
            memberId: document.getElementById('member-id'),
            memberName: document.getElementById('member-name'),
            memberStatus: document.getElementById('member-status'),
            joinDate: document.getElementById('join-date'),
            email: document.getElementById('email'),
            phone: document.getElementById('phone'),
            notes: document.getElementById('notes')
        };

        this.mode = 'add';
        this.memberId = null;
        this.originalData = {};

        this.parseUrlParams();
        this.bindEvents();
        this.initialize();
    }

    parseUrlParams() {
        const urlParams = new URLSearchParams(window.location.search);
        this.mode = urlParams.get('mode') || 'add';
        this.memberId = urlParams.get('id');
    }

    bindEvents() {
        // Events will be bound to dynamically created buttons
    }

    async initialize() {
        this.updateUIForMode();

        if (this.mode !== 'add' && this.memberId) {
            await this.loadMemberData();
        }

        this.createActionButtons();
    }

    updateUIForMode() {
        const modeTitles = {
            'view': 'View',
            'edit': 'Edit',
            'add': 'Add New'
        };

        this.elements.formTitle.textContent = `Member - ${modeTitles[this.mode]}`;

        if (this.mode === 'view') {
            this.disableAllInputs();
        } else if (this.mode === 'edit') {
            this.disableNonEditableFields();
        }
    }

    createActionButtons() {
        this.elements.formActions.innerHTML = '';

        if (this.mode === 'view') {
            const editBtn = this.createButton('Edit', 'fas fa-edit', 'btn-primary', () => this.switchToEditMode());
            const deleteBtn = this.createButton('Delete', 'fas fa-trash', 'btn-danger', () => this.confirmDelete());
            const closeBtn = this.createButton('Close', 'fas fa-times', 'btn-secondary', () => this.closeForm());

            this.elements.formActions.appendChild(editBtn);
            this.elements.formActions.appendChild(deleteBtn);
            this.elements.formActions.appendChild(closeBtn);
        }
        else if (this.mode === 'edit') {
            const saveBtn = this.createButton('Save', 'fas fa-save', 'btn-primary', () => this.saveMember());
            const cancelBtn = this.createButton('Cancel', 'fas fa-times', 'btn-secondary', () => this.cancelEdit());

            this.elements.formActions.appendChild(saveBtn);
            this.elements.formActions.appendChild(cancelBtn);
        }
        else if (this.mode === 'add') {
            const saveBtn = this.createButton('Save', 'fas fa-save', 'btn-primary', () => this.saveMember());
            const cancelBtn = this.createButton('Cancel', 'fas fa-times', 'btn-secondary', () => this.closeForm());

            this.elements.formActions.appendChild(saveBtn);
            this.elements.formActions.appendChild(cancelBtn);
        }

        // Hide the iframe close button after page loads
        window.parent.postMessage({ type: 'OBJECT_FORM_LOADED' }, '*');
    }

    createButton(text, icon, style, onClick) {
        const btn = document.createElement('button');
        btn.className = `btn btn-sm ${style}`;
        btn.innerHTML = `<i class="${icon}"></i> ${text}`;
        btn.addEventListener('click', onClick);
        return btn;
    }

    disableAllInputs() {
        const inputs = this.elements.formBody.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.disabled = true;
        });
    }

    enableAllInputs() {
        const inputs = this.elements.formBody.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.disabled = false;
        });
        this.disableNonEditableFields(); // Keep non-editable fields disabled
    }

    disableNonEditableFields() {
        this.elements.memberId.disabled = true;
        this.elements.joinDate.disabled = true;
    }

    async loadMemberData() {
        try {
            this.showLoading();
            const { data: member, success } = await fetchMemberDetails(this.memberId);

            if (success && member) {
                this.originalData = { ...member }; // Store original data for cancel
                this.populateForm(member);
            } else {
                throw new Error('Failed to load member data');
            }
        } catch (error) {
            this.showError(error.message);
        } finally {
            this.hideLoading();
        }
    }

    populateForm(member) {
        this.elements.memberId.value = member.memberId || '';
        this.elements.memberName.value = member.name || '';
        this.elements.memberStatus.value = member.status || 'active';
        this.elements.joinDate.value = member.joinDate ? new Date(member.joinDate).toLocaleDateString() : '';
        this.elements.email.value = member.email || '';
        this.elements.phone.value = member.phone || '';
        this.elements.notes.value = member.notes || '';
    }

    switchToEditMode() {
        this.mode = 'edit';
        this.updateUIForMode();
        this.enableAllInputs();
        this.createActionButtons();
    }

    cancelEdit() {
        if (this.memberId) {
            // Restore original data
            this.populateForm(this.originalData);
            this.mode = 'view';
            this.updateUIForMode();
            this.disableAllInputs();
            this.createActionButtons();
        } else {
            this.closeForm();
        }
    }

    async saveMember() {
        const memberData = {
            name: this.elements.memberName.value,
            status: this.elements.memberStatus.value,
            email: this.elements.email.value,
            phone: this.elements.phone.value,
            notes: this.elements.notes.value
        };

        if (!memberData.name) {
            this.showError('Name is required');
            return;
        }

        try {
            this.showLoading();
            let result;

            if (this.mode === 'add') {
                memberData.memberId = `SLM-${Math.floor(1000 + Math.random() * 9000)}`;
                memberData.joinDate = new Date().toISOString();
                result = await addMember(memberData);
            } else {
                memberData.id = this.memberId;
                result = await updateMember(this.memberId, memberData);
            }

            if (result.success) {
                this.notifyParent('OBJECT_FORM_SAVED');
                this.closeForm();
            } else {
                throw new Error(result.error || 'Failed to save member');
            }
        } catch (error) {
            this.showError(error.message);
        } finally {
            this.hideLoading();
        }
    }

    confirmDelete() {
        if (confirm('Are you sure you want to delete this member? This action cannot be undone.')) {
            this.deleteMember();
        }
    }

    async deleteMember() {
        try {
            this.showLoading();
            const result = await deleteMember(this.memberId);

            if (result.success) {
                this.notifyParent('OBJECT_FORM_SAVED');
                this.closeForm();
            } else {
                throw new Error(result.error || 'Failed to delete member');
            }
        } catch (error) {
            this.showError(error.message);
        } finally {
            this.hideLoading();
        }
    }

    closeForm() {
        this.notifyParent('OBJECT_FORM_CLOSE');
    }

    notifyParent(type) {
        window.parent.postMessage({ type }, '*');
    }

    showLoading() {
        this.elements.loadingContainer.style.display = 'block';
        this.elements.errorContainer.style.display = 'none';
    }

    hideLoading() {
        this.elements.loadingContainer.style.display = 'none';
    }

    showError(message) {
        this.elements.errorContainer.textContent = message || 'An unknown error occurred';
        this.elements.errorContainer.style.display = 'block';
    }
}

// Initialize controller
document.addEventListener('DOMContentLoaded', () => {
    new MemberFormController();
});