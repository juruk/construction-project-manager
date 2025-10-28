// Construction Management App
class ConstructionApp {
    constructor() {
        this.data = {
            projects: [],
            architects: [],
            supervisors: [],
            contractors: [],
            activities: [],
            userRole: 'admin'
        };
        
        this.init();
    }

    init() {
        this.loadData();
        this.setupEventListeners();
        this.loadSampleData();
        this.render();
    }

    setupEventListeners() {
        // Tab navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // Add buttons
        document.getElementById('addProjectBtn').addEventListener('click', () => this.showProjectForm());
        document.getElementById('addArchitectBtn').addEventListener('click', () => this.showArchitectForm());
        document.getElementById('addSupervisorBtn').addEventListener('click', () => this.showSupervisorForm());
        document.getElementById('addContractorBtn').addEventListener('click', () => this.showContractorForm());

        // Header controls
        document.getElementById('userRole').addEventListener('change', (e) => {
            this.data.userRole = e.target.value;
            this.saveData();
            this.render();
        });

        document.getElementById('exportBtn').addEventListener('click', () => this.exportData());
        document.getElementById('importBtn').addEventListener('click', () => {
            document.getElementById('importFile').click();
        });
        document.getElementById('importFile').addEventListener('change', (e) => this.importData(e));

        // Modal
        document.querySelector('.modal-close').addEventListener('click', () => this.closeModal());
        document.getElementById('modal').addEventListener('click', (e) => {
            if (e.target.id === 'modal') this.closeModal();
        });
    }

    switchTab(tabName) {
        // Update nav buttons
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(tabName).classList.add('active');

        // Update dashboard if needed
        if (tabName === 'dashboard') {
            this.updateDashboard();
        }
    }

    generateId() {
        return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    saveData() {
        localStorage.setItem('constructionAppData', JSON.stringify(this.data));
    }

    loadData() {
        const saved = localStorage.getItem('constructionAppData');
        if (saved) {
            this.data = { ...this.data, ...JSON.parse(saved) };
        }
        document.getElementById('userRole').value = this.data.userRole;
    }

    loadSampleData() {
        if (this.data.projects.length === 0) {
            this.data.projects = [
                {
                    id: 'project_1',
                    name: 'Downtown Office Complex',
                    location: '123 Main Street',
                    budget: 2500000,
                    dueDate: '2024-12-31',
                    status: 'active',
                    progress: 35,
                    notes: 'Major commercial development project.',
                    createdAt: new Date().toISOString()
                },
                {
                    id: 'project_2',
                    name: 'Residential Tower',
                    location: '456 Oak Avenue',
                    budget: 1800000,
                    dueDate: '2024-10-15',
                    status: 'planning',
                    progress: 15,
                    notes: 'High-rise residential building.',
                    createdAt: new Date().toISOString()
                }
            ];

            this.data.architects = [
                {
                    id: 'architect_1',
                    name: 'Sarah Johnson',
                    email: 'sarah@example.com',
                    phone: '(555) 123-4567',
                    specialization: 'Commercial Architecture',
                    license: 'CA-ARCH-001',
                    experience: 12,
                    status: 'active',
                    notes: 'Expert in sustainable design.'
                }
            ];

            this.data.supervisors = [
                {
                    id: 'supervisor_1',
                    name: 'Mike Thompson',
                    email: 'mike@example.com',
                    phone: '(555) 234-5678',
                    department: 'Construction Management',
                    certifications: 'OSHA 30, PMP',
                    status: 'active',
                    notes: 'Excellent safety record.'
                }
            ];

            this.data.contractors = [
                {
                    id: 'contractor_1',
                    name: 'David Martinez',
                    company: 'Elite Construction LLC',
                    email: 'david@example.com',
                    phone: '(555) 345-6789',
                    trade: 'General Contractor',
                    hourlyRate: 75,
                    status: 'active',
                    notes: '20 years experience.'
                }
            ];

            this.addActivity('System', 'Application initialized with sample data');
            this.saveData();
        }
    }

    render() {
        this.renderProjects();
        this.renderArchitects();
        this.renderSupervisors();
        this.renderContractors();
        this.updateDashboard();
    }

    updateDashboard() {
        const activeProjects = this.data.projects.filter(p => p.status === 'active').length;
        const teamMembers = this.data.architects.length + this.data.supervisors.length + this.data.contractors.length;
        const completedTasks = this.data.projects.filter(p => p.status === 'completed').length;
        const overdueItems = this.data.projects.filter(p => {
            return p.dueDate && new Date(p.dueDate) < new Date() && p.status !== 'completed';
        }).length;

        document.getElementById('activeProjectsCount').textContent = activeProjects;
        document.getElementById('teamMembersCount').textContent = teamMembers;
        document.getElementById('completedTasksCount').textContent = completedTasks;
        document.getElementById('overdueItemsCount').textContent = overdueItems;

        this.renderActivity();
    }

    renderActivity() {
        const activityList = document.getElementById('activityList');
        const recentActivities = this.data.activities.slice(-5).reverse();
        
        activityList.innerHTML = recentActivities.map(activity => `
            <div class="activity-item">
                <div class="activity-time">${new Date(activity.timestamp).toLocaleString()}</div>
                <div><strong>${activity.user}:</strong> ${activity.action}</div>
            </div>
        `).join('');
    }

    addActivity(user, action) {
        this.data.activities.push({
            id: this.generateId(),
            user,
            action,
            timestamp: new Date().toISOString()
        });
        this.saveData();
    }

    renderProjects() {
        const container = document.getElementById('projectsList');
        const isReadOnly = this.data.userRole === 'readonly';
        
        container.innerHTML = this.data.projects.map(project => `
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">${project.name}</h3>
                    ${!isReadOnly ? `
                        <div class="card-actions">
                            <button class="btn btn-sm btn-edit" onclick="app.editProject('${project.id}')">Edit</button>
                            <button class="btn btn-sm btn-delete" onclick="app.deleteProject('${project.id}')">Delete</button>
                        </div>
                    ` : ''}
                </div>
                <div class="status status-${project.status}">${project.status}</div>
                <div class="card-body">
                    <p><strong>Location:</strong> ${project.location || 'Not specified'}</p>
                    <p><strong>Budget:</strong> $${project.budget?.toLocaleString() || '0'}</p>
                    <p><strong>Due Date:</strong> ${project.dueDate ? new Date(project.dueDate).toLocaleDateString() : 'Not set'}</p>
                    <div class="progress">
                        <div class="progress-bar" style="width: ${project.progress || 0}%"></div>
                    </div>
                    <p><strong>Progress:</strong> ${project.progress || 0}%</p>
                    <p><strong>Notes:</strong> ${project.notes || 'No notes'}</p>
                </div>
            </div>
        `).join('');
    }

    renderArchitects() {
        const container = document.getElementById('architectsList');
        const isReadOnly = this.data.userRole === 'readonly';
        
        container.innerHTML = this.data.architects.map(architect => `
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">${architect.name}</h3>
                    ${!isReadOnly ? `
                        <div class="card-actions">
                            <button class="btn btn-sm btn-edit" onclick="app.editArchitect('${architect.id}')">Edit</button>
                            <button class="btn btn-sm btn-delete" onclick="app.deleteArchitect('${architect.id}')">Delete</button>
                        </div>
                    ` : ''}
                </div>
                <div class="status status-${architect.status || 'active'}">${architect.status || 'active'}</div>
                <div class="card-body">
                    <p><strong>Email:</strong> ${architect.email || 'Not provided'}</p>
                    <p><strong>Phone:</strong> ${architect.phone || 'Not provided'}</p>
                    <p><strong>Specialization:</strong> ${architect.specialization || 'General'}</p>
                    <p><strong>License:</strong> ${architect.license || 'Not specified'}</p>
                    <p><strong>Experience:</strong> ${architect.experience || 0} years</p>
                    <p><strong>Notes:</strong> ${architect.notes || 'No notes'}</p>
                </div>
            </div>
        `).join('');
    }

    renderSupervisors() {
        const container = document.getElementById('supervisorsList');
        const isReadOnly = this.data.userRole === 'readonly';
        
        container.innerHTML = this.data.supervisors.map(supervisor => `
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">${supervisor.name}</h3>
                    ${!isReadOnly ? `
                        <div class="card-actions">
                            <button class="btn btn-sm btn-edit" onclick="app.editSupervisor('${supervisor.id}')">Edit</button>
                            <button class="btn btn-sm btn-delete" onclick="app.deleteSupervisor('${supervisor.id}')">Delete</button>
                        </div>
                    ` : ''}
                </div>
                <div class="status status-${supervisor.status || 'active'}">${supervisor.status || 'active'}</div>
                <div class="card-body">
                    <p><strong>Email:</strong> ${supervisor.email || 'Not provided'}</p>
                    <p><strong>Phone:</strong> ${supervisor.phone || 'Not provided'}</p>
                    <p><strong>Department:</strong> ${supervisor.department || 'General'}</p>
                    <p><strong>Certifications:</strong> ${supervisor.certifications || 'None'}</p>
                    <p><strong>Notes:</strong> ${supervisor.notes || 'No notes'}</p>
                </div>
            </div>
        `).join('');
    }

    renderContractors() {
        const container = document.getElementById('contractorsList');
        const isReadOnly = this.data.userRole === 'readonly';
        
        container.innerHTML = this.data.contractors.map(contractor => `
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">${contractor.name}</h3>
                    ${!isReadOnly ? `
                        <div class="card-actions">
                            <button class="btn btn-sm btn-edit" onclick="app.editContractor('${contractor.id}')">Edit</button>
                            <button class="btn btn-sm btn-delete" onclick="app.deleteContractor('${contractor.id}')">Delete</button>
                        </div>
                    ` : ''}
                </div>
                <div class="status status-${contractor.status || 'active'}">${contractor.status || 'active'}</div>
                <div class="card-body">
                    <p><strong>Company:</strong> ${contractor.company || 'Individual'}</p>
                    <p><strong>Email:</strong> ${contractor.email || 'Not provided'}</p>
                    <p><strong>Phone:</strong> ${contractor.phone || 'Not provided'}</p>
                    <p><strong>Trade:</strong> ${contractor.trade || 'General'}</p>
                    <p><strong>Hourly Rate:</strong> $${contractor.hourlyRate || 0}/hr</p>
                    <p><strong>Notes:</strong> ${contractor.notes || 'No notes'}</p>
                </div>
            </div>
        `).join('');
    }

    showModal(title, content) {
        const modal = document.getElementById('modal');
        const modalBody = document.getElementById('modalBody');
        modalBody.innerHTML = `<h2>${title}</h2>${content}`;
        modal.style.display = 'block';
    }

    closeModal() {
        document.getElementById('modal').style.display = 'none';
    }

    exportData() {
        const dataStr = JSON.stringify(this.data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'construction_data_' + new Date().toISOString().split('T')[0] + '.json';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        this.addActivity('User', 'Exported data');
    }

    importData(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedData = JSON.parse(e.target.result);
                this.data = { ...this.data, ...importedData };
                this.saveData();
                this.render();
                this.addActivity('User', 'Imported data');
                alert('Data imported successfully!');
            } catch (error) {
                alert('Error importing data: Invalid JSON file');
            }
        };
        reader.readAsText(file);
    }

    // Project CRUD
    showProjectForm(projectId = null) {
        if (this.data.userRole === 'readonly') {
            alert('Read-only access. Cannot modify projects.');
            return;
        }

        const project = projectId ? this.data.projects.find(p => p.id === projectId) : {};
        const isEdit = !!projectId;

        const form = `
            <form id="projectForm">
                <div class="form-group">
                    <label>Project Name *</label>
                    <input type="text" name="name" class="form-control" value="${project.name || ''}" required>
                </div>
                <div class="form-group">
                    <label>Location</label>
                    <input type="text" name="location" class="form-control" value="${project.location || ''}">
                </div>
                <div class="form-group">
                    <label>Budget ($)</label>
                    <input type="number" name="budget" class="form-control" value="${project.budget || ''}">
                </div>
                <div class="form-group">
                    <label>Due Date</label>
                    <input type="date" name="dueDate" class="form-control" value="${project.dueDate || ''}">
                </div>
                <div class="form-group">
                    <label>Status</label>
                    <select name="status" class="form-control">
                        <option value="planning" ${project.status === 'planning' ? 'selected' : ''}>Planning</option>
                        <option value="active" ${project.status === 'active' ? 'selected' : ''}>Active</option>
                        <option value="pending" ${project.status === 'pending' ? 'selected' : ''}>Pending</option>
                        <option value="completed" ${project.status === 'completed' ? 'selected' : ''}>Completed</option>
                        <option value="overdue" ${project.status === 'overdue' ? 'selected' : ''}>Overdue</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Progress (%)</label>
                    <input type="number" name="progress" class="form-control" min="0" max="100" value="${project.progress || 0}">
                </div>
                <div class="form-group">
                    <label>Notes</label>
                    <textarea name="notes" class="form-control">${project.notes || ''}</textarea>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="app.closeModal()">Cancel</button>
                    <button type="submit" class="btn btn-primary">${isEdit ? 'Update' : 'Create'} Project</button>
                </div>
            </form>
        `;

        this.showModal(isEdit ? 'Edit Project' : 'Add Project', form);

        document.getElementById('projectForm').onsubmit = (e) => {
            e.preventDefault();
            this.saveProject(projectId, new FormData(e.target));
        };
    }

    saveProject(projectId, formData) {
        const data = Object.fromEntries(formData);
        
        if (projectId) {
            const index = this.data.projects.findIndex(p => p.id === projectId);
            this.data.projects[index] = { 
                ...this.data.projects[index],
                ...data,
                budget: parseFloat(data.budget) || 0,
                progress: parseInt(data.progress) || 0
            };
            this.addActivity('User', `Updated project: ${data.name}`);
        } else {
            this.data.projects.push({
                id: this.generateId(),
                ...data,
                budget: parseFloat(data.budget) || 0,
                progress: parseInt(data.progress) || 0,
                createdAt: new Date().toISOString()
            });
            this.addActivity('User', `Created project: ${data.name}`);
        }

        this.saveData();
        this.renderProjects();
        this.closeModal();
    }

    editProject(id) {
        this.showProjectForm(id);
    }

    deleteProject(id) {
        if (this.data.userRole === 'readonly') {
            alert('Read-only access. Cannot delete projects.');
            return;
        }

        const project = this.data.projects.find(p => p.id === id);
        if (confirm(`Delete project "${project.name}"?`)) {
            this.data.projects = this.data.projects.filter(p => p.id !== id);
            this.addActivity('User', `Deleted project: ${project.name}`);
            this.saveData();
            this.renderProjects();
        }
    }

    // Architect CRUD
    showArchitectForm(architectId = null) {
        if (this.data.userRole === 'readonly') {
            alert('Read-only access. Cannot modify architects.');
            return;
        }

        const architect = architectId ? this.data.architects.find(a => a.id === architectId) : {};
        const isEdit = !!architectId;

        const form = `
            <form id="architectForm">
                <div class="form-group">
                    <label>Name *</label>
                    <input type="text" name="name" class="form-control" value="${architect.name || ''}" required>
                </div>
                <div class="form-group">
                    <label>Email</label>
                    <input type="email" name="email" class="form-control" value="${architect.email || ''}">
                </div>
                <div class="form-group">
                    <label>Phone</label>
                    <input type="tel" name="phone" class="form-control" value="${architect.phone || ''}">
                </div>
                <div class="form-group">
                    <label>Specialization</label>
                    <input type="text" name="specialization" class="form-control" value="${architect.specialization || ''}">
                </div>
                <div class="form-group">
                    <label>License Number</label>
                    <input type="text" name="license" class="form-control" value="${architect.license || ''}">
                </div>
                <div class="form-group">
                    <label>Experience (years)</label>
                    <input type="number" name="experience" class="form-control" value="${architect.experience || ''}">
                </div>
                <div class="form-group">
                    <label>Status</label>
                    <select name="status" class="form-control">
                        <option value="active" ${architect.status === 'active' ? 'selected' : ''}>Active</option>
                        <option value="inactive" ${architect.status === 'inactive' ? 'selected' : ''}>Inactive</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Notes</label>
                    <textarea name="notes" class="form-control">${architect.notes || ''}</textarea>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="app.closeModal()">Cancel</button>
                    <button type="submit" class="btn btn-primary">${isEdit ? 'Update' : 'Create'} Architect</button>
                </div>
            </form>
        `;

        this.showModal(isEdit ? 'Edit Architect' : 'Add Architect', form);

        document.getElementById('architectForm').onsubmit = (e) => {
            e.preventDefault();
            this.saveArchitect(architectId, new FormData(e.target));
        };
    }

    saveArchitect(architectId, formData) {
        const data = Object.fromEntries(formData);
        
        if (architectId) {
            const index = this.data.architects.findIndex(a => a.id === architectId);
            this.data.architects[index] = { 
                ...this.data.architects[index],
                ...data,
                experience: parseInt(data.experience) || 0
            };
            this.addActivity('User', `Updated architect: ${data.name}`);
        } else {
            this.data.architects.push({
                id: this.generateId(),
                ...data,
                experience: parseInt(data.experience) || 0
            });
            this.addActivity('User', `Added architect: ${data.name}`);
        }

        this.saveData();
        this.renderArchitects();
        this.closeModal();
    }

    editArchitect(id) {
        this.showArchitectForm(id);
    }

    deleteArchitect(id) {
        if (this.data.userRole === 'readonly') {
            alert('Read-only access. Cannot delete architects.');
            return;
        }

        const architect = this.data.architects.find(a => a.id === id);
        if (confirm(`Delete architect "${architect.name}"?`)) {
            this.data.architects = this.data.architects.filter(a => a.id !== id);
            this.addActivity('User', `Deleted architect: ${architect.name}`);
            this.saveData();
            this.renderArchitects();
        }
    }

    // Supervisor CRUD
    showSupervisorForm(supervisorId = null) {
        if (this.data.userRole === 'readonly') {
            alert('Read-only access. Cannot modify supervisors.');
            return;
        }

        const supervisor = supervisorId ? this.data.supervisors.find(s => s.id === supervisorId) : {};
        const isEdit = !!supervisorId;

        const form = `
            <form id="supervisorForm">
                <div class="form-group">
                    <label>Name *</label>
                    <input type="text" name="name" class="form-control" value="${supervisor.name || ''}" required>
                </div>
                <div class="form-group">
                    <label>Email</label>
                    <input type="email" name="email" class="form-control" value="${supervisor.email || ''}">
                </div>
                <div class="form-group">
                    <label>Phone</label>
                    <input type="tel" name="phone" class="form-control" value="${supervisor.phone || ''}">
                </div>
                <div class="form-group">
                    <label>Department</label>
                    <input type="text" name="department" class="form-control" value="${supervisor.department || ''}">
                </div>
                <div class="form-group">
                    <label>Certifications</label>
                    <textarea name="certifications" class="form-control">${supervisor.certifications || ''}</textarea>
                </div>
                <div class="form-group">
                    <label>Status</label>
                    <select name="status" class="form-control">
                        <option value="active" ${supervisor.status === 'active' ? 'selected' : ''}>Active</option>
                        <option value="inactive" ${supervisor.status === 'inactive' ? 'selected' : ''}>Inactive</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Notes</label>
                    <textarea name="notes" class="form-control">${supervisor.notes || ''}</textarea>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="app.closeModal()">Cancel</button>
                    <button type="submit" class="btn btn-primary">${isEdit ? 'Update' : 'Create'} Supervisor</button>
                </div>
            </form>
        `;

        this.showModal(isEdit ? 'Edit Supervisor' : 'Add Supervisor', form);

        document.getElementById('supervisorForm').onsubmit = (e) => {
            e.preventDefault();
            this.saveSupervisor(supervisorId, new FormData(e.target));
        };
    }

    saveSupervisor(supervisorId, formData) {
        const data = Object.fromEntries(formData);
        
        if (supervisorId) {
            const index = this.data.supervisors.findIndex(s => s.id === supervisorId);
            this.data.supervisors[index] = { ...this.data.supervisors[index], ...data };
            this.addActivity('User', `Updated supervisor: ${data.name}`);
        } else {
            this.data.supervisors.push({ id: this.generateId(), ...data });
            this.addActivity('User', `Added supervisor: ${data.name}`);
        }

        this.saveData();
        this.renderSupervisors();
        this.closeModal();
    }

    editSupervisor(id) {
        this.showSupervisorForm(id);
    }

    deleteSupervisor(id) {
        if (this.data.userRole === 'readonly') {
            alert('Read-only access. Cannot delete supervisors.');
            return;
        }

        const supervisor = this.data.supervisors.find(s => s.id === id);
        if (confirm(`Delete supervisor "${supervisor.name}"?`)) {
            this.data.supervisors = this.data.supervisors.filter(s => s.id !== id);
            this.addActivity('User', `Deleted supervisor: ${supervisor.name}`);
            this.saveData();
            this.renderSupervisors();
        }
    }

    // Contractor CRUD
    showContractorForm(contractorId = null) {
        if (this.data.userRole === 'readonly') {
            alert('Read-only access. Cannot modify contractors.');
            return;
        }

        const contractor = contractorId ? this.data.contractors.find(c => c.id === contractorId) : {};
        const isEdit = !!contractorId;

        const form = `
            <form id="contractorForm">
                <div class="form-group">
                    <label>Name *</label>
                    <input type="text" name="name" class="form-control" value="${contractor.name || ''}" required>
                </div>
                <div class="form-group">
                    <label>Company</label>
                    <input type="text" name="company" class="form-control" value="${contractor.company || ''}">
                </div>
                <div class="form-group">
                    <label>Email</label>
                    <input type="email" name="email" class="form-control" value="${contractor.email || ''}">
                </div>
                <div class="form-group">
                    <label>Phone</label>
                    <input type="tel" name="phone" class="form-control" value="${contractor.phone || ''}">
                </div>
                <div class="form-group">
                    <label>Trade/Specialty</label>
                    <input type="text" name="trade" class="form-control" value="${contractor.trade || ''}">
                </div>
                <div class="form-group">
                    <label>Hourly Rate ($)</label>
                    <input type="number" name="hourlyRate" class="form-control" value="${contractor.hourlyRate || ''}">
                </div>
                <div class="form-group">
                    <label>Status</label>
                    <select name="status" class="form-control">
                        <option value="active" ${contractor.status === 'active' ? 'selected' : ''}>Active</option>
                        <option value="inactive" ${contractor.status === 'inactive' ? 'selected' : ''}>Inactive</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Notes</label>
                    <textarea name="notes" class="form-control">${contractor.notes || ''}</textarea>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="app.closeModal()">Cancel</button>
                    <button type="submit" class="btn btn-primary">${isEdit ? 'Update' : 'Create'} Contractor</button>
                </div>
            </form>
        `;

        this.showModal(isEdit ? 'Edit Contractor' : 'Add Contractor', form);

        document.getElementById('contractorForm').onsubmit = (e) => {
            e.preventDefault();
            this.saveContractor(contractorId, new FormData(e.target));
        };
    }

    saveContractor(contractorId, formData) {
        const data = Object.fromEntries(formData);
        
        if (contractorId) {
            const index = this.data.contractors.findIndex(c => c.id === contractorId);
            this.data.contractors[index] = { 
                ...this.data.contractors[index],
                ...data,
                hourlyRate: parseFloat(data.hourlyRate) || 0
            };
            this.addActivity('User', `Updated contractor: ${data.name}`);
        } else {
            this.data.contractors.push({
                id: this.generateId(),
                ...data,
                hourlyRate: parseFloat(data.hourlyRate) || 0
            });
            this.addActivity('User', `Added contractor: ${data.name}`);
        }

        this.saveData();
        this.renderContractors();
        this.closeModal();
    }

    editContractor(id) {
        this.showContractorForm(id);
    }

    deleteContractor(id) {
        if (this.data.userRole === 'readonly') {
            alert('Read-only access. Cannot delete contractors.');
            return;
        }

        const contractor = this.data.contractors.find(c => c.id === id);
        if (confirm(`Delete contractor "${contractor.name}"?`)) {
            this.data.contractors = this.data.contractors.filter(c => c.id !== id);
            this.addActivity('User', `Deleted contractor: ${contractor.name}`);
            this.saveData();
            this.renderContractors();
        }
    }
}

// Initialize app when DOM is loaded
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new ConstructionApp();
});