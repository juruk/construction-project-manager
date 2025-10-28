// Construction Project Management App
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
        this.setupTabs();
        this.updateDashboard();
        this.renderAll();
    }

    setupEventListeners() {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => this.switchTab(btn.dataset.tab));
        });

        document.getElementById('addProject').addEventListener('click', () => this.showProjectForm());
        document.getElementById('addArchitect').addEventListener('click', () => this.showArchitectForm());
        document.getElementById('addSupervisor').addEventListener('click', () => this.showSupervisorForm());
        document.getElementById('addContractor').addEventListener('click', () => this.showContractorForm());

        document.getElementById('exportData').addEventListener('click', () => this.exportData());
        document.getElementById('importBtn').addEventListener('click', () => document.getElementById('importData').click());
        document.getElementById('importData').addEventListener('change', (e) => this.importData(e));
        document.getElementById('syncGitHub').addEventListener('click', () => this.syncWithGitHub());

        document.getElementById('userRole').addEventListener('change', (e) => {
            this.data.userRole = e.target.value;
            this.saveData();
            this.renderAll();
        });

        document.querySelector('.close').addEventListener('click', () => this.closeModal());
        window.addEventListener('click', (e) => {
            if (e.target === document.getElementById('modal')) {
                this.closeModal();
            }
        });
    }

    setupTabs() {
        const urlParams = new URLSearchParams(window.location.search);
        const tab = urlParams.get('tab') || 'dashboard';
        this.switchTab(tab);
    }

    switchTab(tabName) {
        const url = new URL(window.location);
        url.searchParams.set('tab', tabName);
        window.history.pushState({}, '', url);

        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.toggle('active', content.id === tabName);
        });

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
            this.data = Object.assign({}, this.data, JSON.parse(saved));
        }
        document.getElementById('userRole').value = this.data.userRole || 'admin';
    }

    exportData() {
        const dataStr = JSON.stringify(this.data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'construction_project_data_' + new Date().toISOString().split('T')[0] + '.json';
        link.click();
        URL.revokeObjectURL(url);
    }

    importData(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedData = JSON.parse(e.target.result);
                this.data = Object.assign({}, this.data, importedData);
                this.saveData();
                this.renderAll();
                this.updateDashboard();
                this.addActivity('System', 'Data imported successfully');
                alert('Data imported successfully!');
            } catch (error) {
                alert('Error importing data: Invalid JSON file');
            }
        };
        reader.readAsText(file);
    }

    syncWithGitHub() {
        this.addActivity('System', 'GitHub synchronization initiated');
        setTimeout(() => {
            this.addActivity('System', 'GitHub synchronization completed');
            alert('GitHub sync completed! (Demo mode)');
        }, 2000);
    }

    updateDashboard() {
        const stats = this.calculateStats();
        document.getElementById('activeProjects').textContent = stats.activeProjects;
        document.getElementById('teamMembers').textContent = stats.teamMembers;
        document.getElementById('completedTasks').textContent = stats.completedTasks;
        document.getElementById('overdueItems').textContent = stats.overdueItems;

        this.renderProgressChart();
        this.renderActivityFeed();
    }

    calculateStats() {
        const activeProjects = this.data.projects.filter(p => p.status === 'active').length;
        const teamMembers = this.data.architects.length + this.data.supervisors.length + this.data.contractors.length;
        const completedTasks = this.data.projects.reduce((total, project) => {
            return total + (project.phases || []).filter(phase => phase.status === 'completed').length;
        }, 0);
        const overdueItems = this.data.projects.filter(p => {
            return p.dueDate && new Date(p.dueDate) < new Date() && p.status !== 'completed';
        }).length;

        return { activeProjects, teamMembers, completedTasks, overdueItems };
    }

    renderProgressChart() {
        const ctx = document.getElementById('progressChart');
        if (!ctx) return;

        const projects = this.data.projects.slice(0, 5);
        const labels = projects.map(p => p.name || 'Unnamed Project');
        const data = projects.map(p => p.progress || 0);

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Progress %',
                    data: data,
                    backgroundColor: 'rgba(0, 123, 255, 0.8)',
                    borderColor: 'rgba(0, 123, 255, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100
                    }
                }
            }
        });
    }

    renderActivityFeed() {
        const feed = document.getElementById('activityFeed');
        const recentActivities = this.data.activities.slice(-10).reverse();
        
        feed.innerHTML = recentActivities.map(activity => 
            '<div class="activity-item">' +
            '<div class="activity-time">' + new Date(activity.timestamp).toLocaleString() + '</div>' +
            '<div><strong>' + activity.user + ':</strong> ' + activity.action + '</div>' +
            '</div>'
        ).join('');
    }

    addActivity(user, action) {
        this.data.activities.push({
            id: this.generateId(),
            user: user,
            action: action,
            timestamp: new Date().toISOString()
        });
        this.saveData();
    }

    renderAll() {
        this.renderProjects();
        this.renderArchitects();
        this.renderSupervisors();
        this.renderContractors();
    }

    renderProjects() {
        const container = document.getElementById('projectsList');
        const isReadOnly = this.data.userRole === 'readonly';
        
        container.innerHTML = this.data.projects.map(project => {
            return '<div class="card" id="project-' + project.id + '">' +
                '<div class="card-header">' +
                '<h3 class="card-title">' + (project.name || 'Unnamed Project') + '</h3>' +
                (!isReadOnly ? 
                    '<div class="card-actions">' +
                    '<button class="btn btn-sm btn-info" onclick="app.editProject('' + project.id + '')">Edit</button>' +
                    '<button class="btn btn-sm btn-danger" onclick="app.deleteProject('' + project.id + '')">Delete</button>' +
                    '</div>' : '') +
                '</div>' +
                '<div class="status-badge status-' + (project.status || 'planning') + '">' + (project.status || 'planning').toUpperCase() + '</div>' +
                '<p><strong>Location:</strong> ' + (project.location || 'Not specified') + '</p>' +
                '<p><strong>Budget:</strong> $' + (project.budget || 0).toLocaleString() + '</p>' +
                '<p><strong>Due Date:</strong> ' + (project.dueDate ? new Date(project.dueDate).toLocaleDateString() : 'Not set') + '</p>' +
                '<div class="progress-bar">' +
                '<div class="progress-fill" style="width: ' + (project.progress || 0) + '%"></div>' +
                '</div>' +
                '<div class="text-center">' + (project.progress || 0) + '% Complete</div>' +
                '<div class="notes-section">' +
                '<strong>Notes:</strong>' +
                '<div>' + (project.notes || 'No notes') + '</div>' +
                (project.lastUpdated ? '<small class="note-timestamp">Last updated: ' + new Date(project.lastUpdated).toLocaleString() + '</small>' : '') +
                '</div>' +
                '</div>';
        }).join('');
    }

    renderArchitects() {
        const container = document.getElementById('architectsList');
        const isReadOnly = this.data.userRole === 'readonly';
        
        container.innerHTML = this.data.architects.map(architect => {
            return '<div class="card" id="architect-' + architect.id + '">' +
                '<div class="card-header">' +
                '<h3 class="card-title">' + (architect.name || 'Unnamed Architect') + '</h3>' +
                (!isReadOnly ? 
                    '<div class="card-actions">' +
                    '<button class="btn btn-sm btn-info" onclick="app.editArchitect('' + architect.id + '')">Edit</button>' +
                    '<button class="btn btn-sm btn-danger" onclick="app.deleteArchitect('' + architect.id + '')">Delete</button>' +
                    '</div>' : '') +
                '</div>' +
                '<div class="status-badge status-' + (architect.status || 'active') + '">' + (architect.status || 'active').toUpperCase() + '</div>' +
                '<p><strong>Specialization:</strong> ' + (architect.specialization || 'General Architecture') + '</p>' +
                '<p><strong>License:</strong> ' + (architect.license || 'Not specified') + '</p>' +
                '<p><strong>Email:</strong> ' + (architect.email || 'Not provided') + '</p>' +
                '<p><strong>Phone:</strong> ' + (architect.phone || 'Not provided') + '</p>' +
                '<p><strong>Experience:</strong> ' + (architect.experience || 0) + ' years</p>' +
                '<div class="notes-section">' +
                '<strong>Notes:</strong>' +
                '<div>' + (architect.notes || 'No notes') + '</div>' +
                (architect.lastUpdated ? '<small class="note-timestamp">Last updated: ' + new Date(architect.lastUpdated).toLocaleString() + '</small>' : '') +
                '</div>' +
                '</div>';
        }).join('');
    }

    renderSupervisors() {
        const container = document.getElementById('supervisorsList');
        const isReadOnly = this.data.userRole === 'readonly';
        
        container.innerHTML = this.data.supervisors.map(supervisor => {
            return '<div class="card" id="supervisor-' + supervisor.id + '">' +
                '<div class="card-header">' +
                '<h3 class="card-title">' + (supervisor.name || 'Unnamed Supervisor') + '</h3>' +
                (!isReadOnly ? 
                    '<div class="card-actions">' +
                    '<button class="btn btn-sm btn-info" onclick="app.editSupervisor('' + supervisor.id + '')">Edit</button>' +
                    '<button class="btn btn-sm btn-danger" onclick="app.deleteSupervisor('' + supervisor.id + '')">Delete</button>' +
                    '</div>' : '') +
                '</div>' +
                '<div class="status-badge status-' + (supervisor.status || 'active') + '">' + (supervisor.status || 'active').toUpperCase() + '</div>' +
                '<p><strong>Department:</strong> ' + (supervisor.department || 'General') + '</p>' +
                '<p><strong>Email:</strong> ' + (supervisor.email || 'Not provided') + '</p>' +
                '<p><strong>Phone:</strong> ' + (supervisor.phone || 'Not provided') + '</p>' +
                '<p><strong>Certifications:</strong> ' + (supervisor.certifications || 'None specified') + '</p>' +
                '<div class="notes-section">' +
                '<strong>Notes:</strong>' +
                '<div>' + (supervisor.notes || 'No notes') + '</div>' +
                (supervisor.lastUpdated ? '<small class="note-timestamp">Last updated: ' + new Date(supervisor.lastUpdated).toLocaleString() + '</small>' : '') +
                '</div>' +
                '</div>';
        }).join('');
    }

    renderContractors() {
        const container = document.getElementById('contractorsList');
        const isReadOnly = this.data.userRole === 'readonly';
        
        container.innerHTML = this.data.contractors.map(contractor => {
            return '<div class="card" id="contractor-' + contractor.id + '">' +
                '<div class="card-header">' +
                '<h3 class="card-title">' + (contractor.name || 'Unnamed Contractor') + '</h3>' +
                (!isReadOnly ? 
                    '<div class="card-actions">' +
                    '<button class="btn btn-sm btn-info" onclick="app.editContractor('' + contractor.id + '')">Edit</button>' +
                    '<button class="btn btn-sm btn-danger" onclick="app.deleteContractor('' + contractor.id + '')">Delete</button>' +
                    '</div>' : '') +
                '</div>' +
                '<div class="status-badge status-' + (contractor.status || 'active') + '">' + (contractor.status || 'active').toUpperCase() + '</div>' +
                '<p><strong>Trade:</strong> ' + (contractor.trade || 'General Construction') + '</p>' +
                '<p><strong>Company:</strong> ' + (contractor.company || 'Individual') + '</p>' +
                '<p><strong>Email:</strong> ' + (contractor.email || 'Not provided') + '</p>' +
                '<p><strong>Phone:</strong> ' + (contractor.phone || 'Not provided') + '</p>' +
                '<p><strong>Hourly Rate:</strong> $' + (contractor.hourlyRate || 0) + '/hr</p>' +
                '<div class="notes-section">' +
                '<strong>Notes:</strong>' +
                '<div>' + (contractor.notes || 'No notes') + '</div>' +
                (contractor.lastUpdated ? '<small class="note-timestamp">Last updated: ' + new Date(contractor.lastUpdated).toLocaleString() + '</small>' : '') +
                '</div>' +
                '</div>';
        }).join('');
    }

    showModal(title, content) {
        const modal = document.getElementById('modal');
        const modalBody = document.getElementById('modalBody');
        modalBody.innerHTML = '<h2>' + title + '</h2>' + content;
        modal.style.display = 'block';
    }

    closeModal() {
        document.getElementById('modal').style.display = 'none';
    }

    showProjectForm(projectId = null) {
        if (this.data.userRole === 'readonly') {
            alert('You do not have permission to edit projects.');
            return;
        }

        const project = projectId ? this.data.projects.find(p => p.id === projectId) : {};
        const isEdit = !!projectId;

        const form = '<form id="projectForm">' +
            '<div class="form-group">' +
            '<label for="projectName">Project Name *</label>' +
            '<input type="text" id="projectName" class="form-control" value="' + (project.name || '') + '" required>' +
            '</div>' +
            '<div class="form-group">' +
            '<label for="projectLocation">Location</label>' +
            '<input type="text" id="projectLocation" class="form-control" value="' + (project.location || '') + '">' +
            '</div>' +
            '<div class="form-group">' +
            '<label for="projectBudget">Budget ($)</label>' +
            '<input type="number" id="projectBudget" class="form-control" value="' + (project.budget || '') + '">' +
            '</div>' +
            '<div class="form-group">' +
            '<label for="projectDueDate">Due Date</label>' +
            '<input type="date" id="projectDueDate" class="form-control" value="' + (project.dueDate || '') + '">' +
            '</div>' +
            '<div class="form-group">' +
            '<label for="projectStatus">Status</label>' +
            '<select id="projectStatus" class="form-control">' +
            '<option value="planning"' + (project.status === 'planning' ? ' selected' : '') + '>Planning</option>' +
            '<option value="active"' + (project.status === 'active' ? ' selected' : '') + '>Active</option>' +
            '<option value="pending"' + (project.status === 'pending' ? ' selected' : '') + '>Pending</option>' +
            '<option value="completed"' + (project.status === 'completed' ? ' selected' : '') + '>Completed</option>' +
            '<option value="overdue"' + (project.status === 'overdue' ? ' selected' : '') + '>Overdue</option>' +
            '</select>' +
            '</div>' +
            '<div class="form-group">' +
            '<label for="projectProgress">Progress (%)</label>' +
            '<input type="number" id="projectProgress" class="form-control" min="0" max="100" value="' + (project.progress || 0) + '">' +
            '</div>' +
            '<div class="form-group">' +
            '<label for="projectNotes">Notes</label>' +
            '<textarea id="projectNotes" class="form-control">' + (project.notes || '') + '</textarea>' +
            '</div>' +
            '<div class="form-group">' +
            '<button type="submit" class="btn btn-primary">' + (isEdit ? 'Update' : 'Create') + ' Project</button>' +
            '<button type="button" class="btn btn-secondary" onclick="app.closeModal()">Cancel</button>' +
            '</div>' +
            '</form>';

        this.showModal(isEdit ? 'Edit Project' : 'Add New Project', form);

        document.getElementById('projectForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveProject(projectId);
        });
    }

    saveProject(projectId) {
        const formData = {
            id: projectId || this.generateId(),
            name: document.getElementById('projectName').value,
            location: document.getElementById('projectLocation').value,
            budget: parseFloat(document.getElementById('projectBudget').value) || 0,
            dueDate: document.getElementById('projectDueDate').value,
            status: document.getElementById('projectStatus').value,
            progress: parseInt(document.getElementById('projectProgress').value) || 0,
            notes: document.getElementById('projectNotes').value,
            lastUpdated: new Date().toISOString()
        };

        if (projectId) {
            const index = this.data.projects.findIndex(p => p.id === projectId);
            this.data.projects[index] = formData;
            this.addActivity('User', 'Updated project: ' + formData.name);
        } else {
            this.data.projects.push(formData);
            this.addActivity('User', 'Created new project: ' + formData.name);
        }

        this.saveData();
        this.renderProjects();
        this.updateDashboard();
        this.closeModal();
    }

    editProject(projectId) {
        this.showProjectForm(projectId);
    }

    deleteProject(projectId) {
        if (this.data.userRole === 'readonly') {
            alert('You do not have permission to delete projects.');
            return;
        }

        if (confirm('Are you sure you want to delete this project?')) {
            const project = this.data.projects.find(p => p.id === projectId);
            this.data.projects = this.data.projects.filter(p => p.id !== projectId);
            this.saveData();
            this.renderProjects();
            this.updateDashboard();
            this.addActivity('User', 'Deleted project: ' + (project ? project.name : 'Unknown'));
        }
    }

    showArchitectForm(architectId = null) {
        if (this.data.userRole === 'readonly') {
            alert('You do not have permission to edit architects.');
            return;
        }

        const architect = architectId ? this.data.architects.find(a => a.id === architectId) : {};
        const isEdit = !!architectId;

        const form = '<form id="architectForm">' +
            '<div class="form-group">' +
            '<label for="architectName">Name *</label>' +
            '<input type="text" id="architectName" class="form-control" value="' + (architect.name || '') + '" required>' +
            '</div>' +
            '<div class="form-group">' +
            '<label for="architectEmail">Email</label>' +
            '<input type="email" id="architectEmail" class="form-control" value="' + (architect.email || '') + '">' +
            '</div>' +
            '<div class="form-group">' +
            '<label for="architectPhone">Phone</label>' +
            '<input type="tel" id="architectPhone" class="form-control" value="' + (architect.phone || '') + '">' +
            '</div>' +
            '<div class="form-group">' +
            '<label for="architectSpecialization">Specialization</label>' +
            '<input type="text" id="architectSpecialization" class="form-control" value="' + (architect.specialization || '') + '">' +
            '</div>' +
            '<div class="form-group">' +
            '<label for="architectLicense">License Number</label>' +
            '<input type="text" id="architectLicense" class="form-control" value="' + (architect.license || '') + '">' +
            '</div>' +
            '<div class="form-group">' +
            '<label for="architectExperience">Experience (years)</label>' +
            '<input type="number" id="architectExperience" class="form-control" value="' + (architect.experience || '') + '">' +
            '</div>' +
            '<div class="form-group">' +
            '<label for="architectStatus">Status</label>' +
            '<select id="architectStatus" class="form-control">' +
            '<option value="active"' + (architect.status === 'active' ? ' selected' : '') + '>Active</option>' +
            '<option value="inactive"' + (architect.status === 'inactive' ? ' selected' : '') + '>Inactive</option>' +
            '<option value="on-leave"' + (architect.status === 'on-leave' ? ' selected' : '') + '>On Leave</option>' +
            '</select>' +
            '</div>' +
            '<div class="form-group">' +
            '<label for="architectNotes">Notes</label>' +
            '<textarea id="architectNotes" class="form-control">' + (architect.notes || '') + '</textarea>' +
            '</div>' +
            '<div class="form-group">' +
            '<button type="submit" class="btn btn-primary">' + (isEdit ? 'Update' : 'Create') + ' Architect</button>' +
            '<button type="button" class="btn btn-secondary" onclick="app.closeModal()">Cancel</button>' +
            '</div>' +
            '</form>';

        this.showModal(isEdit ? 'Edit Architect' : 'Add New Architect', form);

        document.getElementById('architectForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveArchitect(architectId);
        });
    }

    saveArchitect(architectId) {
        const formData = {
            id: architectId || this.generateId(),
            name: document.getElementById('architectName').value,
            email: document.getElementById('architectEmail').value,
            phone: document.getElementById('architectPhone').value,
            specialization: document.getElementById('architectSpecialization').value,
            license: document.getElementById('architectLicense').value,
            experience: parseInt(document.getElementById('architectExperience').value) || 0,
            status: document.getElementById('architectStatus').value,
            notes: document.getElementById('architectNotes').value,
            lastUpdated: new Date().toISOString()
        };

        if (architectId) {
            const index = this.data.architects.findIndex(a => a.id === architectId);
            this.data.architects[index] = formData;
            this.addActivity('User', 'Updated architect: ' + formData.name);
        } else {
            this.data.architects.push(formData);
            this.addActivity('User', 'Added new architect: ' + formData.name);
        }

        this.saveData();
        this.renderArchitects();
        this.updateDashboard();
        this.closeModal();
    }

    editArchitect(architectId) {
        this.showArchitectForm(architectId);
    }

    deleteArchitect(architectId) {
        if (this.data.userRole === 'readonly') {
            alert('You do not have permission to delete architects.');
            return;
        }

        if (confirm('Are you sure you want to delete this architect?')) {
            const architect = this.data.architects.find(a => a.id === architectId);
            this.data.architects = this.data.architects.filter(a => a.id !== architectId);
            this.saveData();
            this.renderArchitects();
            this.updateDashboard();
            this.addActivity('User', 'Deleted architect: ' + (architect ? architect.name : 'Unknown'));
        }
    }

    showSupervisorForm(supervisorId = null) {
        if (this.data.userRole === 'readonly') {
            alert('You do not have permission to edit supervisors.');
            return;
        }

        const supervisor = supervisorId ? this.data.supervisors.find(s => s.id === supervisorId) : {};
        const isEdit = !!supervisorId;

        const form = '<form id="supervisorForm">' +
            '<div class="form-group">' +
            '<label for="supervisorName">Name *</label>' +
            '<input type="text" id="supervisorName" class="form-control" value="' + (supervisor.name || '') + '" required>' +
            '</div>' +
            '<div class="form-group">' +
            '<label for="supervisorEmail">Email</label>' +
            '<input type="email" id="supervisorEmail" class="form-control" value="' + (supervisor.email || '') + '">' +
            '</div>' +
            '<div class="form-group">' +
            '<label for="supervisorPhone">Phone</label>' +
            '<input type="tel" id="supervisorPhone" class="form-control" value="' + (supervisor.phone || '') + '">' +
            '</div>' +
            '<div class="form-group">' +
            '<label for="supervisorDepartment">Department</label>' +
            '<input type="text" id="supervisorDepartment" class="form-control" value="' + (supervisor.department || '') + '">' +
            '</div>' +
            '<div class="form-group">' +
            '<label for="supervisorCertifications">Certifications</label>' +
            '<textarea id="supervisorCertifications" class="form-control">' + (supervisor.certifications || '') + '</textarea>' +
            '</div>' +
            '<div class="form-group">' +
            '<label for="supervisorStatus">Status</label>' +
            '<select id="supervisorStatus" class="form-control">' +
            '<option value="active"' + (supervisor.status === 'active' ? ' selected' : '') + '>Active</option>' +
            '<option value="inactive"' + (supervisor.status === 'inactive' ? ' selected' : '') + '>Inactive</option>' +
            '<option value="on-leave"' + (supervisor.status === 'on-leave' ? ' selected' : '') + '>On Leave</option>' +
            '</select>' +
            '</div>' +
            '<div class="form-group">' +
            '<label for="supervisorNotes">Notes</label>' +
            '<textarea id="supervisorNotes" class="form-control">' + (supervisor.notes || '') + '</textarea>' +
            '</div>' +
            '<div class="form-group">' +
            '<button type="submit" class="btn btn-primary">' + (isEdit ? 'Update' : 'Create') + ' Supervisor</button>' +
            '<button type="button" class="btn btn-secondary" onclick="app.closeModal()">Cancel</button>' +
            '</div>' +
            '</form>';

        this.showModal(isEdit ? 'Edit Supervisor' : 'Add New Supervisor', form);

        document.getElementById('supervisorForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveSupervisor(supervisorId);
        });
    }

    saveSupervisor(supervisorId) {
        const formData = {
            id: supervisorId || this.generateId(),
            name: document.getElementById('supervisorName').value,
            email: document.getElementById('supervisorEmail').value,
            phone: document.getElementById('supervisorPhone').value,
            department: document.getElementById('supervisorDepartment').value,
            certifications: document.getElementById('supervisorCertifications').value,
            status: document.getElementById('supervisorStatus').value,
            notes: document.getElementById('supervisorNotes').value,
            lastUpdated: new Date().toISOString()
        };

        if (supervisorId) {
            const index = this.data.supervisors.findIndex(s => s.id === supervisorId);
            this.data.supervisors[index] = formData;
            this.addActivity('User', 'Updated supervisor: ' + formData.name);
        } else {
            this.data.supervisors.push(formData);
            this.addActivity('User', 'Added new supervisor: ' + formData.name);
        }

        this.saveData();
        this.renderSupervisors();
        this.updateDashboard();
        this.closeModal();
    }

    editSupervisor(supervisorId) {
        this.showSupervisorForm(supervisorId);
    }

    deleteSupervisor(supervisorId) {
        if (this.data.userRole === 'readonly') {
            alert('You do not have permission to delete supervisors.');
            return;
        }

        if (confirm('Are you sure you want to delete this supervisor?')) {
            const supervisor = this.data.supervisors.find(s => s.id === supervisorId);
            this.data.supervisors = this.data.supervisors.filter(s => s.id !== supervisorId);
            this.saveData();
            this.renderSupervisors();
            this.updateDashboard();
            this.addActivity('User', 'Deleted supervisor: ' + (supervisor ? supervisor.name : 'Unknown'));
        }
    }

    showContractorForm(contractorId = null) {
        if (this.data.userRole === 'readonly') {
            alert('You do not have permission to edit contractors.');
            return;
        }

        const contractor = contractorId ? this.data.contractors.find(c => c.id === contractorId) : {};
        const isEdit = !!contractorId;

        const form = '<form id="contractorForm">' +
            '<div class="form-group">' +
            '<label for="contractorName">Name *</label>' +
            '<input type="text" id="contractorName" class="form-control" value="' + (contractor.name || '') + '" required>' +
            '</div>' +
            '<div class="form-group">' +
            '<label for="contractorCompany">Company</label>' +
            '<input type="text" id="contractorCompany" class="form-control" value="' + (contractor.company || '') + '">' +
            '</div>' +
            '<div class="form-group">' +
            '<label for="contractorEmail">Email</label>' +
            '<input type="email" id="contractorEmail" class="form-control" value="' + (contractor.email || '') + '">' +
            '</div>' +
            '<div class="form-group">' +
            '<label for="contractorPhone">Phone</label>' +
            '<input type="tel" id="contractorPhone" class="form-control" value="' + (contractor.phone || '') + '">' +
            '</div>' +
            '<div class="form-group">' +
            '<label for="contractorTrade">Trade/Specialty</label>' +
            '<input type="text" id="contractorTrade" class="form-control" value="' + (contractor.trade || '') + '">' +
            '</div>' +
            '<div class="form-group">' +
            '<label for="contractorHourlyRate">Hourly Rate ($)</label>' +
            '<input type="number" id="contractorHourlyRate" class="form-control" value="' + (contractor.hourlyRate || '') + '">' +
            '</div>' +
            '<div class="form-group">' +
            '<label for="contractorStatus">Status</label>' +
            '<select id="contractorStatus" class="form-control">' +
            '<option value="active"' + (contractor.status === 'active' ? ' selected' : '') + '>Active</option>' +
            '<option value="inactive"' + (contractor.status === 'inactive' ? ' selected' : '') + '>Inactive</option>' +
            '<option value="on-project"' + (contractor.status === 'on-project' ? ' selected' : '') + '>On Project</option>' +
            '</select>' +
            '</div>' +
            '<div class="form-group">' +
            '<label for="contractorNotes">Notes</label>' +
            '<textarea id="contractorNotes" class="form-control">' + (contractor.notes || '') + '</textarea>' +
            '</div>' +
            '<div class="form-group">' +
            '<button type="submit" class="btn btn-primary">' + (isEdit ? 'Update' : 'Create') + ' Contractor</button>' +
            '<button type="button" class="btn btn-secondary" onclick="app.closeModal()">Cancel</button>' +
            '</div>' +
            '</form>';

        this.showModal(isEdit ? 'Edit Contractor' : 'Add New Contractor', form);

        document.getElementById('contractorForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveContractor(contractorId);
        });
    }

    saveContractor(contractorId) {
        const formData = {
            id: contractorId || this.generateId(),
            name: document.getElementById('contractorName').value,
            company: document.getElementById('contractorCompany').value,
            email: document.getElementById('contractorEmail').value,
            phone: document.getElementById('contractorPhone').value,
            trade: document.getElementById('contractorTrade').value,
            hourlyRate: parseFloat(document.getElementById('contractorHourlyRate').value) || 0,
            status: document.getElementById('contractorStatus').value,
            notes: document.getElementById('contractorNotes').value,
            lastUpdated: new Date().toISOString()
        };

        if (contractorId) {
            const index = this.data.contractors.findIndex(c => c.id === contractorId);
            this.data.contractors[index] = formData;
            this.addActivity('User', 'Updated contractor: ' + formData.name);
        } else {
            this.data.contractors.push(formData);
            this.addActivity('User', 'Added new contractor: ' + formData.name);
        }

        this.saveData();
        this.renderContractors();
        this.updateDashboard();
        this.closeModal();
    }

    editContractor(contractorId) {
        this.showContractorForm(contractorId);
    }

    deleteContractor(contractorId) {
        if (this.data.userRole === 'readonly') {
            alert('You do not have permission to delete contractors.');
            return;
        }

        if (confirm('Are you sure you want to delete this contractor?')) {
            const contractor = this.data.contractors.find(c => c.id === contractorId);
            this.data.contractors = this.data.contractors.filter(c => c.id !== contractorId);
            this.saveData();
            this.renderContractors();
            this.updateDashboard();
            this.addActivity('User', 'Deleted contractor: ' + (contractor ? contractor.name : 'Unknown'));
        }
    }
}

let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new ConstructionApp();
    
    if (app.data.projects.length === 0) {
        app.data.projects = [
            {
                id: 'sample_project_1',
                name: 'Downtown Office Complex',
                location: '123 Main Street, Downtown',
                budget: 2500000,
                dueDate: '2024-12-31',
                status: 'active',
                progress: 35,
                notes: 'Major commercial development project with sustainable design features.',
                lastUpdated: new Date().toISOString()
            },
            {
                id: 'sample_project_2',
                name: 'Residential Tower',
                location: '456 Oak Avenue',
                budget: 1800000,
                dueDate: '2024-10-15',
                status: 'planning',
                progress: 15,
                notes: 'High-rise residential building with 50 units.',
                lastUpdated: new Date().toISOString()
            }
        ];

        app.data.architects = [
            {
                id: 'architect_1',
                name: 'Sarah Johnson',
                email: 'sarah.johnson@architecture.com',
                phone: '(555) 123-4567',
                specialization: 'Commercial Architecture',
                license: 'CA-ARCH-2019-001',
                experience: 12,
                status: 'active',
                notes: 'Specializes in sustainable commercial buildings.',
                lastUpdated: new Date().toISOString()
            }
        ];

        app.data.supervisors = [
            {
                id: 'supervisor_1',
                name: 'Mike Thompson',
                email: 'mike.thompson@construction.com',
                phone: '(555) 234-5678',
                department: 'Construction Management',
                certifications: 'OSHA 30, PMP Certified',
                status: 'active',
                notes: 'Experienced project supervisor with excellent safety record.',
                lastUpdated: new Date().toISOString()
            }
        ];

        app.data.contractors = [
            {
                id: 'contractor_1',
                name: 'David Martinez',
                company: 'Elite Construction LLC',
                email: 'david@eliteconstruction.com',
                phone: '(555) 345-6789',
                trade: 'General Contractor',
                hourlyRate: 75,
                status: 'active',
                notes: 'Reliable general contractor with 20 years experience.',
                lastUpdated: new Date().toISOString()
            }
        ];

        app.data.activities = [
            {
                id: 'activity_1',
                user: 'System',
                action: 'Application initialized with sample data',
                timestamp: new Date().toISOString()
            }
        ];

        app.saveData();
        app.renderAll();
        app.updateDashboard();
    }
});