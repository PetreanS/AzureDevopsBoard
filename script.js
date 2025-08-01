// Task Management System
class TaskManager {
    constructor() {
        this.tasks = this.loadTasks();
        this.draggedTask = null;
        this.selectedFiles = [];
        this.editingTask = null;
        this.editSelectedFiles = [];
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.renderTasks();
        this.updateTaskCounts();
        this.populateAuthorFilter();
        this.populateMonthFilter();
    }

    setupEventListeners() {
        // Modal events
        document.getElementById('taskForm').addEventListener('submit', (e) => this.handleTaskSubmit(e));
        
        // File upload events
        const fileInput = document.getElementById('taskFiles');
        const fileUploadArea = document.querySelector('.file-upload-area');
        
        fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        fileUploadArea.addEventListener('dragover', (e) => this.handleDragOver(e));
        fileUploadArea.addEventListener('dragleave', (e) => this.handleDragLeave(e));
        fileUploadArea.addEventListener('drop', (e) => this.handleFileDrop(e));

        // Search and filter events
        document.getElementById('searchInput').addEventListener('input', (e) => this.filterTasks());
        document.getElementById('filterMonth').addEventListener('change', (e) => this.filterTasks());
        document.getElementById('filterAuthor').addEventListener('change', (e) => this.filterTasks());

        // Archive events
        document.getElementById('archiveSearchInput').addEventListener('input', (e) => this.filterArchive());
        document.getElementById('archiveMonthFilter').addEventListener('change', (e) => this.filterArchive());
        document.getElementById('archiveAuthorFilter').addEventListener('change', (e) => this.filterArchive());

        // Edit task events
        document.getElementById('editTaskForm').addEventListener('submit', (e) => this.handleEditTaskSubmit(e));
        
        // Edit file upload events
        const editFileInput = document.getElementById('editTaskFiles');
        const editFileUploadArea = document.querySelector('#editTaskModal .file-upload-area');
        
        editFileInput.addEventListener('change', (e) => this.handleEditFileSelect(e));
        editFileUploadArea.addEventListener('dragover', (e) => this.handleEditDragOver(e));
        editFileUploadArea.addEventListener('dragleave', (e) => this.handleEditDragLeave(e));
        editFileUploadArea.addEventListener('drop', (e) => this.handleEditFileDrop(e));

        // User tasks events
        document.getElementById('userSelect').addEventListener('change', (e) => this.handleUserSelect(e));

        // Drag and drop for task lists
        this.setupDragAndDrop();

        // Click outside modal to close
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeModal(e.target);
            }
        });
    }

    setupDragAndDrop() {
        const taskLists = document.querySelectorAll('.task-list');
        
        taskLists.forEach(list => {
            list.addEventListener('dragover', (e) => this.handleTaskDragOver(e));
            list.addEventListener('drop', (e) => this.handleTaskDrop(e));
            list.addEventListener('dragleave', (e) => this.handleTaskDragLeave(e));
        });
    }

    // Task CRUD Operations
    createTask(taskData) {
        const task = {
            id: this.generateId(),
            title: taskData.title,
            description: taskData.description,
            author: taskData.author,
            priority: taskData.priority,
            status: 'new',
            createdAt: new Date().toISOString(),
            files: this.selectedFiles.map(file => ({
                name: file.name,
                size: file.size,
                type: file.type,
                data: file.data
            }))
        };

        this.tasks.push(task);
        this.saveTasks();
        this.renderTasks();
        this.updateTaskCounts();
        this.populateAuthorFilter();
        this.resetForm();
        this.closeTaskModal();
        
        return task;
    }

    updateTaskStatus(taskId, newStatus) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            task.status = newStatus;
            this.saveTasks();
            this.renderTasks();
            this.updateTaskCounts();
        }
    }

    deleteTask(taskId) {
        this.tasks = this.tasks.filter(t => t.id !== taskId);
        this.saveTasks();
        this.renderTasks();
        this.updateTaskCounts();
        this.populateAuthorFilter();
    }

    handleDeleteTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            const confirmed = confirm(`Are you sure you want to delete the task "${task.title}"?`);
            if (confirmed) {
                this.deleteTask(taskId);
            }
        }
    }

    // Rendering Methods
    renderTasks() {
        const taskLists = {
            new: document.getElementById('newTasks'),
            ongoing: document.getElementById('ongoingTasks'),
            paused: document.getElementById('pausedTasks'),
            finished: document.getElementById('finishedTasks')
        };

        // Clear all lists
        Object.values(taskLists).forEach(list => {
            list.innerHTML = '';
        });

        // Filter tasks based on search and author filter
        const filteredTasks = this.getFilteredTasks();

        // Group tasks by status
        const tasksByStatus = {
            new: filteredTasks.filter(t => t.status === 'new'),
            ongoing: filteredTasks.filter(t => t.status === 'ongoing'),
            paused: filteredTasks.filter(t => t.status === 'paused'),
            finished: filteredTasks.filter(t => t.status === 'finished')
        };

        // Render tasks in each column
        Object.entries(tasksByStatus).forEach(([status, tasks]) => {
            if (tasks.length === 0) {
                taskLists[status].innerHTML = this.getEmptyStateHTML(status);
            } else {
                tasks.forEach(task => {
                    taskLists[status].appendChild(this.createTaskCard(task));
                });
            }
        });
    }

    createTaskCard(task) {
        const card = document.createElement('div');
        card.className = 'task-card';
        card.draggable = true;
        card.dataset.taskId = task.id;

        card.addEventListener('dragstart', (e) => this.handleTaskDragStart(e, task));
        card.addEventListener('dragend', (e) => this.handleTaskDragEnd(e));
        card.addEventListener('click', (e) => this.showTaskDetails(task));

        const formattedDate = new Date(task.createdAt).toLocaleDateString();
        const fileCount = task.files ? task.files.length : 0;

        card.innerHTML = `
            <button class="task-delete-btn" title="Delete task">
                <i class="fas fa-times"></i>
            </button>
            <div class="task-header">
                <h3 class="task-title">${this.escapeHtml(task.title)}</h3>
                <span class="task-priority priority-${task.priority}">${task.priority}</span>
            </div>
            ${task.description ? `<p class="task-description">${this.escapeHtml(task.description)}</p>` : ''}
            <div class="task-meta">
                <div class="task-author">
                    <i class="fas fa-user"></i>
                    <span>${this.escapeHtml(task.author)}</span>
                </div>
                <div class="task-date">${formattedDate}</div>
            </div>
            ${fileCount > 0 ? `
                <div class="task-attachments">
                    <i class="fas fa-paperclip"></i>
                    <span>${fileCount} attachment${fileCount > 1 ? 's' : ''}</span>
                </div>
            ` : ''}
        `;

        // Add delete button event listener
        const deleteBtn = card.querySelector('.task-delete-btn');
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent opening task details
            this.handleDeleteTask(task.id);
        });

        return card;
    }

    getEmptyStateHTML(status) {
        const messages = {
            new: { icon: 'fas fa-inbox', title: 'No new tasks', text: 'Create a new task to get started' },
            ongoing: { icon: 'fas fa-play', title: 'No ongoing tasks', text: 'Drag tasks here to start working on them' },
            paused: { icon: 'fas fa-pause', title: 'No paused tasks', text: 'Tasks on hold will appear here' },
            finished: { icon: 'fas fa-check', title: 'No finished tasks', text: 'Completed tasks will appear here' }
        };

        const message = messages[status];
        return `
            <div class="empty-state">
                <i class="${message.icon}"></i>
                <h3>${message.title}</h3>
                <p>${message.text}</p>
            </div>
        `;
    }

    // Drag and Drop Handlers
    handleTaskDragStart(e, task) {
        this.draggedTask = task;
        e.target.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
    }

    handleTaskDragEnd(e) {
        e.target.classList.remove('dragging');
        this.draggedTask = null;
    }

    handleTaskDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        e.currentTarget.classList.add('drag-over');
    }

    handleTaskDragLeave(e) {
        e.currentTarget.classList.remove('drag-over');
    }

    handleTaskDrop(e) {
        e.preventDefault();
        e.currentTarget.classList.remove('drag-over');

        if (this.draggedTask) {
            const newStatus = e.currentTarget.closest('.kanban-column').dataset.status;
            if (newStatus !== this.draggedTask.status) {
                this.updateTaskStatus(this.draggedTask.id, newStatus);
            }
        }
    }

    // File Upload Handlers
    handleFileSelect(e) {
        const files = Array.from(e.target.files);
        this.addFiles(files);
    }

    handleDragOver(e) {
        e.preventDefault();
        e.currentTarget.classList.add('dragover');
    }

    handleDragLeave(e) {
        e.currentTarget.classList.remove('dragover');
    }

    handleFileDrop(e) {
        e.preventDefault();
        e.currentTarget.classList.remove('dragover');
        
        const files = Array.from(e.dataTransfer.files);
        this.addFiles(files);
    }

    addFiles(files) {
        files.forEach(file => {
            if (!this.selectedFiles.some(f => f.name === file.name && f.size === file.size)) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    this.selectedFiles.push({
                        name: file.name,
                        size: file.size,
                        type: file.type,
                        data: e.target.result
                    });
                    this.renderFileList();
                };
                reader.readAsDataURL(file);
            }
        });
    }

    removeFile(index) {
        this.selectedFiles.splice(index, 1);
        this.renderFileList();
    }

    renderFileList() {
        const fileList = document.getElementById('fileList');
        fileList.innerHTML = '';

        this.selectedFiles.forEach((file, index) => {
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item';
            fileItem.innerHTML = `
                <div class="file-info">
                    <i class="${this.getFileIcon(file.type)}"></i>
                    <div>
                        <div class="file-name">${this.escapeHtml(file.name)}</div>
                        <div class="file-size">${this.formatFileSize(file.size)}</div>
                    </div>
                </div>
                <button type="button" class="file-remove" onclick="taskManager.removeFile(${index})">
                    <i class="fas fa-times"></i>
                </button>
            `;
            fileList.appendChild(fileItem);
        });
    }

    // Filter and Search
    getFilteredTasks() {
        const searchTerm = document.getElementById('searchInput').value.toLowerCase();
        const monthFilter = document.getElementById('filterMonth').value;
        const authorFilter = document.getElementById('filterAuthor').value;

        return this.tasks.filter(task => {
            const matchesSearch = !searchTerm || 
                task.title.toLowerCase().includes(searchTerm) ||
                task.description.toLowerCase().includes(searchTerm) ||
                task.author.toLowerCase().includes(searchTerm);

            const matchesMonth = !monthFilter || this.getMonthYear(task.createdAt) === monthFilter;
            const matchesAuthor = !authorFilter || task.author === authorFilter;

            return matchesSearch && matchesMonth && matchesAuthor;
        });
    }

    filterTasks() {
        this.renderTasks();
        this.updateTaskCounts();
    }

    filterArchive() {
        this.renderArchive();
    }

    populateAuthorFilter() {
        const authorFilter = document.getElementById('filterAuthor');
        const currentValue = authorFilter.value;
        
        const authors = [...new Set(this.tasks.map(task => task.author))].sort();
        
        authorFilter.innerHTML = '<option value="">All Authors</option>';
        authors.forEach(author => {
            const option = document.createElement('option');
            option.value = author;
            option.textContent = author;
            if (author === currentValue) option.selected = true;
            authorFilter.appendChild(option);
        });
    }

    populateMonthFilter() {
        const monthFilter = document.getElementById('filterMonth');
        const currentValue = monthFilter.value;
        
        const months = [...new Set(this.tasks.map(task => this.getMonthYear(task.createdAt)))].sort();
        
        monthFilter.innerHTML = '<option value="">All Months</option>';
        months.forEach(month => {
            const option = document.createElement('option');
            option.value = month;
            option.textContent = month;
            if (month === currentValue) option.selected = true;
            monthFilter.appendChild(option);
        });
    }

    getMonthYear(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
    }

    getMonthYearKey(dateString) {
        const date = new Date(dateString);
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    }

    // Task Details Modal
    showTaskDetails(task) {
        const modal = document.getElementById('taskDetailModal');
        const title = document.getElementById('taskDetailTitle');
        const content = document.getElementById('taskDetailContent');

        // Set the task being edited
        this.editingTask = task;
        title.textContent = task.title;

        const formattedDate = new Date(task.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        content.innerHTML = `
            <div class="task-detail-content">
                <div class="task-detail-section">
                    <h3>Description</h3>
                    <p>${task.description || 'No description provided'}</p>
                </div>
                
                <div class="task-detail-section">
                    <h3>Details</h3>
                    <p><strong>Author:</strong> ${this.escapeHtml(task.author)}</p>
                    <p><strong>Priority:</strong> <span class="task-priority priority-${task.priority}">${task.priority}</span></p>
                    <p><strong>Status:</strong> ${this.capitalizeFirst(task.status)}</p>
                    <p><strong>Created:</strong> ${formattedDate}</p>
                </div>

                ${task.files && task.files.length > 0 ? `
                    <div class="task-detail-section">
                        <h3>Attachments (${task.files.length})</h3>
                        <div class="attachment-list">
                            ${task.files.map(file => `
                                <div class="attachment-item">
                                    <i class="${this.getFileIcon(file.type)}"></i>
                                    <div class="attachment-info">
                                        <div class="attachment-name">${this.escapeHtml(file.name)}</div>
                                        <div class="attachment-size">${this.formatFileSize(file.size)}</div>
                                    </div>
                                    <div class="attachment-actions">
                                        ${this.isImageFile(file.type) ? `
                                            <button class="btn-secondary" onclick="taskManager.viewImage('${file.data}', '${file.name}')" title="View Image">
                                                <i class="fas fa-eye"></i>
                                            </button>
                                        ` : ''}
                                        <button class="btn-secondary" onclick="taskManager.downloadFile('${file.data}', '${file.name}')" title="Download">
                                            <i class="fas fa-download"></i>
                                        </button>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
            </div>
        `;

        modal.classList.add('show');
    }

    downloadFile(dataUrl, filename) {
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    viewImage(dataUrl, filename) {
        // Create a modal for image viewing
        const imageModal = document.createElement('div');
        imageModal.className = 'modal show';
        imageModal.innerHTML = `
            <div class="modal-content" style="max-width: 90vw; max-height: 90vh;">
                <div class="modal-header">
                    <h2>${this.escapeHtml(filename)}</h2>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body" style="text-align: center; padding: 20px;">
                    <img src="${dataUrl}" alt="${this.escapeHtml(filename)}" style="max-width: 100%; max-height: 70vh; object-fit: contain;">
                    <div style="margin-top: 20px;">
                        <button class="btn-primary" onclick="taskManager.downloadFile('${dataUrl}', '${filename}')">
                            <i class="fas fa-download"></i> Download Image
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(imageModal);
        
        // Close modal when clicking outside
        imageModal.addEventListener('click', (e) => {
            if (e.target === imageModal) {
                imageModal.remove();
            }
        });
    }

    isImageFile(mimeType) {
        return mimeType && mimeType.startsWith('image/');
    }

    // Archive Methods
    openArchiveModal() {
        this.populateArchiveFilters();
        this.renderArchive();
        document.getElementById('archiveModal').classList.add('show');
    }

    closeArchiveModal() {
        this.closeModal(document.getElementById('archiveModal'));
    }

    populateArchiveFilters() {
        // Populate month filter for archive
        const archiveMonthFilter = document.getElementById('archiveMonthFilter');
        const archiveAuthorFilter = document.getElementById('archiveAuthorFilter');
        
        const allTasks = [...this.tasks, ...this.getArchivedTasks()];
        const months = [...new Set(allTasks.map(task => this.getMonthYear(task.createdAt)))].sort();
        const authors = [...new Set(allTasks.map(task => task.author))].sort();
        
        archiveMonthFilter.innerHTML = '<option value="">All Months</option>';
        months.forEach(month => {
            const option = document.createElement('option');
            option.value = month;
            option.textContent = month;
            archiveMonthFilter.appendChild(option);
        });
        
        archiveAuthorFilter.innerHTML = '<option value="">All Authors</option>';
        authors.forEach(author => {
            const option = document.createElement('option');
            option.value = author;
            option.textContent = author;
            archiveAuthorFilter.appendChild(option);
        });
    }

    renderArchive() {
        const archiveContent = document.getElementById('archiveContent');
        const searchTerm = document.getElementById('archiveSearchInput').value.toLowerCase();
        const monthFilter = document.getElementById('archiveMonthFilter').value;
        const authorFilter = document.getElementById('archiveAuthorFilter').value;
        
        const allTasks = [...this.tasks, ...this.getArchivedTasks()];
        
        // Filter tasks
        const filteredTasks = allTasks.filter(task => {
            const matchesSearch = !searchTerm || 
                task.title.toLowerCase().includes(searchTerm) ||
                task.description.toLowerCase().includes(searchTerm) ||
                task.author.toLowerCase().includes(searchTerm);
            
            const matchesMonth = !monthFilter || this.getMonthYear(task.createdAt) === monthFilter;
            const matchesAuthor = !authorFilter || task.author === authorFilter;
            
            return matchesSearch && matchesMonth && matchesAuthor;
        });
        
        if (filteredTasks.length === 0) {
            archiveContent.innerHTML = `
                <div class="archive-empty-state">
                    <i class="fas fa-archive"></i>
                    <h3>No archived tasks found</h3>
                    <p>No tasks match your current filters</p>
                </div>
            `;
            return;
        }
        
        // Group tasks by month
        const tasksByMonth = {};
        filteredTasks.forEach(task => {
            const monthKey = this.getMonthYearKey(task.createdAt);
            if (!tasksByMonth[monthKey]) {
                tasksByMonth[monthKey] = [];
            }
            tasksByMonth[monthKey].push(task);
        });
        
        // Sort months (newest first)
        const sortedMonths = Object.keys(tasksByMonth).sort().reverse();
        
        let archiveHTML = '';
        sortedMonths.forEach(monthKey => {
            const tasks = tasksByMonth[monthKey];
            const monthName = this.getMonthYear(tasks[0].createdAt);
            
            archiveHTML += `
                <div class="archive-month-section">
                    <div class="archive-month-header">
                        <h3>${monthName}</h3>
                        <span class="archive-month-count">${tasks.length} task${tasks.length > 1 ? 's' : ''}</span>
                    </div>
                    <div class="archive-tasks-list">
                        ${tasks.map(task => this.createArchiveTaskHTML(task)).join('')}
                    </div>
                </div>
            `;
        });
        
        archiveContent.innerHTML = archiveHTML;
    }

    createArchiveTaskHTML(task) {
        const formattedDate = new Date(task.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        const fileCount = task.files ? task.files.length : 0;
        
        return `
            <div class="archive-task-item">
                <div class="archive-task-header">
                    <h4 class="archive-task-title">${this.escapeHtml(task.title)}</h4>
                    <span class="archive-task-priority priority-${task.priority}">${task.priority}</span>
                </div>
                ${task.description ? `<div class="archive-task-description">${this.escapeHtml(task.description)}</div>` : ''}
                <div class="archive-task-meta">
                    <div class="archive-task-author">
                        <i class="fas fa-user"></i>
                        <span>${this.escapeHtml(task.author)}</span>
                    </div>
                    <div class="archive-task-date">${formattedDate}</div>
                </div>
                ${fileCount > 0 ? `
                    <div class="task-attachments">
                        <i class="fas fa-paperclip"></i>
                        <span>${fileCount} attachment${fileCount > 1 ? 's' : ''}</span>
                    </div>
                ` : ''}
            </div>
        `;
    }

    getArchivedTasks() {
        const archived = localStorage.getItem('azureDevOpsArchivedTasks');
        return archived ? JSON.parse(archived) : [];
    }

    saveArchivedTasks(archivedTasks) {
        localStorage.setItem('azureDevOpsArchivedTasks', JSON.stringify(archivedTasks));
    }

    archiveOldTasks() {
        const currentDate = new Date();
        const threeMonthsAgo = new Date(currentDate.getFullYear(), currentDate.getMonth() - 3, 1);
        
        const tasksToArchive = this.tasks.filter(task => {
            const taskDate = new Date(task.createdAt);
            return taskDate < threeMonthsAgo;
        });
        
        if (tasksToArchive.length > 0) {
            const archivedTasks = this.getArchivedTasks();
            archivedTasks.push(...tasksToArchive);
            this.saveArchivedTasks(archivedTasks);
            
            // Remove archived tasks from current tasks
            this.tasks = this.tasks.filter(task => !tasksToArchive.includes(task));
            this.saveTasks();
            this.renderTasks();
            this.updateTaskCounts();
            this.populateAuthorFilter();
            this.populateMonthFilter();
        }
    }

    // Task Editing Methods
    openEditModal() {
        if (!this.editingTask) return;
        
        const modal = document.getElementById('editTaskModal');
        const form = document.getElementById('editTaskForm');
        
        // Populate form with current task data
        document.getElementById('editTaskTitle').value = this.editingTask.title;
        document.getElementById('editTaskDescription').value = this.editingTask.description || '';
        document.getElementById('editTaskAuthor').value = this.editingTask.author;
        document.getElementById('editTaskPriority').value = this.editingTask.priority;
        
        // Reset edit files
        this.editSelectedFiles = [];
        this.renderEditFileList();
        
        // Show current attachments
        this.renderCurrentAttachments();
        
        modal.classList.add('show');
    }

    closeEditTaskModal() {
        document.getElementById('editTaskModal').classList.remove('show');
        this.editingTask = null;
        this.editSelectedFiles = [];
        this.resetEditForm();
    }

    resetEditForm() {
        document.getElementById('editTaskForm').reset();
        this.editSelectedFiles = [];
        this.renderEditFileList();
        document.getElementById('currentAttachments').innerHTML = '';
    }

    renderCurrentAttachments() {
        const container = document.getElementById('currentAttachments');
        
        if (!this.editingTask.files || this.editingTask.files.length === 0) {
            container.innerHTML = '<p style="color: #b0b0b0; font-style: italic;">No attachments</p>';
            return;
        }

        container.innerHTML = this.editingTask.files.map((file, index) => `
            <div class="current-attachment-item">
                <div class="current-attachment-info">
                    <i class="${this.getFileIcon(file.type)}"></i>
                    <div class="current-attachment-details">
                        <div class="current-attachment-name">${this.escapeHtml(file.name)}</div>
                        <div class="current-attachment-size">${this.formatFileSize(file.size)}</div>
                    </div>
                </div>
                <div class="current-attachment-actions">
                    ${this.isImageFile(file.type) ? `
                        <button class="btn-secondary" onclick="taskManager.viewImage('${file.data}', '${file.name}')" title="View Image">
                            <i class="fas fa-eye"></i>
                        </button>
                    ` : ''}
                    <button class="btn-secondary" onclick="taskManager.downloadFile('${file.data}', '${file.name}')" title="Download">
                        <i class="fas fa-download"></i>
                    </button>
                    <button class="remove-attachment-btn" onclick="taskManager.removeCurrentAttachment(${index})" title="Remove">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    removeCurrentAttachment(index) {
        if (this.editingTask && this.editingTask.files) {
            this.editingTask.files.splice(index, 1);
            this.renderCurrentAttachments();
        }
    }

    handleEditFileSelect(e) {
        const files = Array.from(e.target.files);
        this.addEditFiles(files);
    }

    handleEditDragOver(e) {
        e.preventDefault();
        e.currentTarget.classList.add('dragover');
    }

    handleEditDragLeave(e) {
        e.currentTarget.classList.remove('dragover');
    }

    handleEditFileDrop(e) {
        e.preventDefault();
        e.currentTarget.classList.remove('dragover');
        const files = Array.from(e.dataTransfer.files);
        this.addEditFiles(files);
    }

    addEditFiles(files) {
        files.forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
                this.editSelectedFiles.push({
                    name: file.name,
                    size: file.size,
                    type: file.type,
                    data: e.target.result
                });
                this.renderEditFileList();
            };
            reader.readAsDataURL(file);
        });
    }

    removeEditFile(index) {
        this.editSelectedFiles.splice(index, 1);
        this.renderEditFileList();
    }

    renderEditFileList() {
        const fileList = document.getElementById('editFileList');
        
        if (this.editSelectedFiles.length === 0) {
            fileList.innerHTML = '';
            return;
        }

        fileList.innerHTML = this.editSelectedFiles.map((file, index) => `
            <div class="file-item">
                <div class="file-info">
                    <i class="${this.getFileIcon(file.type)}"></i>
                    <div class="file-details">
                        <div class="file-name">${this.escapeHtml(file.name)}</div>
                        <div class="file-size">${this.formatFileSize(file.size)}</div>
                    </div>
                </div>
                <button class="file-remove" onclick="taskManager.removeEditFile(${index})">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `).join('');
    }

    handleEditTaskSubmit(e) {
        e.preventDefault();
        
        if (!this.editingTask) return;

        const formData = new FormData(e.target);
        
        // Update task with new data
        this.editingTask.title = formData.get('title');
        this.editingTask.description = formData.get('description');
        this.editingTask.author = formData.get('author');
        this.editingTask.priority = formData.get('priority');
        
        // Add new files to existing files
        if (this.editSelectedFiles.length > 0) {
            if (!this.editingTask.files) {
                this.editingTask.files = [];
            }
            this.editingTask.files.push(...this.editSelectedFiles);
        }
        
        // Save and update
        this.saveTasks();
        this.renderTasks();
        this.updateTaskCounts();
        this.populateAuthorFilter();
        
        // Close modal and reset
        this.closeEditTaskModal();
        this.closeTaskDetailModal();
        
        // Show success message
        this.showNotification('Task updated successfully!', 'success');
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 4px;
            color: white;
            font-weight: 500;
            z-index: 3000;
            animation: slideInRight 0.3s ease;
            background-color: ${type === 'success' ? '#4caf50' : '#2196f3'};
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    // User Tasks Methods
    openUserTasksModal() {
        document.getElementById('userTasksModal').classList.add('show');
        this.populateUserSelect();
    }

    closeUserTasksModal() {
        this.closeModal(document.getElementById('userTasksModal'));
        document.getElementById('userSelect').value = '';
        document.getElementById('userTasksContent').innerHTML = '';
    }

    populateUserSelect() {
        const userSelect = document.getElementById('userSelect');
        const users = [...new Set(this.tasks.map(task => task.author))].sort();
        
        // Clear existing options except the first one
        userSelect.innerHTML = '<option value="">Choose a user...</option>';
        
        users.forEach(user => {
            const option = document.createElement('option');
            option.value = user;
            option.textContent = user;
            userSelect.appendChild(option);
        });
    }

    handleUserSelect(e) {
        const selectedUser = e.target.value;
        if (selectedUser) {
            this.renderUserTasks(selectedUser);
        } else {
            document.getElementById('userTasksContent').innerHTML = '';
        }
    }

    renderUserTasks(user) {
        const userTasks = this.tasks.filter(task => task.author === user);
        const content = document.getElementById('userTasksContent');
        
        if (userTasks.length === 0) {
            content.innerHTML = `
                <div class="user-tasks-empty">
                    <i class="fas fa-user-slash"></i>
                    <h3>No tasks found</h3>
                    <p>No tasks have been created by ${user} yet.</p>
                </div>
            `;
            return;
        }

        // Group tasks by month
        const tasksByMonth = {};
        userTasks.forEach(task => {
            const monthKey = this.getMonthYearKey(task.createdAt);
            if (!tasksByMonth[monthKey]) {
                tasksByMonth[monthKey] = [];
            }
            tasksByMonth[monthKey].push(task);
        });

        // Sort months in descending order (most recent first)
        const sortedMonths = Object.keys(tasksByMonth).sort((a, b) => new Date(b) - new Date(a));

        let html = '';
        sortedMonths.forEach(monthKey => {
            const tasks = tasksByMonth[monthKey];
            const monthName = this.getMonthYear(monthKey);
            
            html += `
                <div class="user-month-section">
                    <div class="user-month-header">
                        <h3>${monthName}</h3>
                        <span class="user-month-count">${tasks.length} task${tasks.length !== 1 ? 's' : ''}</span>
                    </div>
                    <ul class="user-tasks-list">
                        ${tasks.map(task => this.createUserTaskHTML(task)).join('')}
                    </ul>
                </div>
            `;
        });

        content.innerHTML = html;
    }

    createUserTaskHTML(task) {
        const priorityClass = `priority-${task.priority}`;
        const statusIcon = this.getStatusIcon(task.status);
        const statusText = this.capitalizeFirst(task.status);
        const attachmentsCount = task.files ? task.files.length : 0;
        
        return `
            <li class="user-task-item">
                <div class="user-task-header">
                    <h4 class="user-task-title">${this.escapeHtml(task.title)}</h4>
                    <span class="user-task-priority ${priorityClass}">${task.priority}</span>
                </div>
                ${task.description ? `<div class="user-task-description">${this.escapeHtml(task.description)}</div>` : ''}
                <div class="user-task-meta">
                    <div class="user-task-status">
                        <i class="${statusIcon}"></i>
                        <span>${statusText}</span>
                    </div>
                    <div class="user-task-date">${new Date(task.createdAt).toLocaleDateString()}</div>
                </div>
                ${attachmentsCount > 0 ? `
                    <div class="user-task-attachments">
                        <i class="fas fa-paperclip"></i>
                        <span>${attachmentsCount} attachment${attachmentsCount !== 1 ? 's' : ''}</span>
                    </div>
                ` : ''}
            </li>
        `;
    }

    getStatusIcon(status) {
        const icons = {
            'new': 'fas fa-inbox',
            'ongoing': 'fas fa-play',
            'paused': 'fas fa-pause',
            'finished': 'fas fa-check'
        };
        return icons[status] || 'fas fa-circle';
    }

    // Modal Management
    openTaskModal() {
        document.getElementById('taskModal').classList.add('show');
        document.getElementById('taskTitle').focus();
    }

    closeTaskModal() {
        this.closeModal(document.getElementById('taskModal'));
        this.resetForm();
    }

    closeTaskDetailModal() {
        this.closeModal(document.getElementById('taskDetailModal'));
    }

    closeModal(modal) {
        modal.classList.remove('show');
    }

    // Form Handling
    handleTaskSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const taskData = {
            title: formData.get('title').trim(),
            description: formData.get('description').trim(),
            author: formData.get('author').trim(),
            priority: formData.get('priority')
        };

        if (taskData.title && taskData.author) {
            this.createTask(taskData);
        }
    }

    resetForm() {
        document.getElementById('taskForm').reset();
        this.selectedFiles = [];
        this.renderFileList();
    }

    // Utility Methods
    updateTaskCounts() {
        const filteredTasks = this.getFilteredTasks();
        const counts = {
            new: filteredTasks.filter(t => t.status === 'new').length,
            ongoing: filteredTasks.filter(t => t.status === 'ongoing').length,
            paused: filteredTasks.filter(t => t.status === 'paused').length,
            finished: filteredTasks.filter(t => t.status === 'finished').length
        };

        document.getElementById('newCount').textContent = counts.new;
        document.getElementById('ongoingCount').textContent = counts.ongoing;
        document.getElementById('pausedCount').textContent = counts.paused;
        document.getElementById('finishedCount').textContent = counts.finished;
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    getFileIcon(mimeType) {
        if (!mimeType) return 'fas fa-file';
        
        if (mimeType.startsWith('image/')) return 'fas fa-file-image';
        if (mimeType.startsWith('video/')) return 'fas fa-file-video';
        if (mimeType.startsWith('audio/')) return 'fas fa-file-audio';
        if (mimeType.includes('pdf')) return 'fas fa-file-pdf';
        if (mimeType.includes('word') || mimeType.includes('document')) return 'fas fa-file-word';
        if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return 'fas fa-file-excel';
        if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return 'fas fa-file-powerpoint';
        if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('7z')) return 'fas fa-file-archive';
        if (mimeType.includes('text/')) return 'fas fa-file-alt';
        
        return 'fas fa-file';
    }

    // Local Storage Methods
    saveTasks() {
        localStorage.setItem('azureDevOpsTasks', JSON.stringify(this.tasks));
    }

    loadTasks() {
        const saved = localStorage.getItem('azureDevOpsTasks');
        return saved ? JSON.parse(saved) : [];
    }
}

// Global Functions (for onclick handlers)
function openTaskModal() {
    taskManager.openTaskModal();
}

function closeTaskModal() {
    taskManager.closeTaskModal();
}

function closeTaskDetailModal() {
    taskManager.closeTaskDetailModal();
}

function openArchiveModal() {
    taskManager.openArchiveModal();
}

function closeArchiveModal() {
    taskManager.closeArchiveModal();
}

function closeEditTaskModal() {
    taskManager.closeEditTaskModal();
}

function openUserTasksModal() {
    taskManager.openUserTasksModal();
}

function closeUserTasksModal() {
    taskManager.closeUserTasksModal();
}

// Initialize the application
let taskManager;

document.addEventListener('DOMContentLoaded', () => {
    taskManager = new TaskManager();
    
    // Add some sample data if no tasks exist
    if (taskManager.tasks.length === 0) {
        const sampleTasks = [
            {
                id: 'sample1',
                title: 'Welcome to Azure DevOps Task Manager',
                description: 'This is a sample task to demonstrate the functionality. You can drag and drop tasks between columns, add files, and manage your workflow.',
                author: 'System',
                priority: 'medium',
                status: 'new',
                createdAt: new Date().toISOString(),
                files: []
            },
            {
                id: 'sample2',
                title: 'Review project requirements',
                description: 'Go through the project requirements document and identify key deliverables.',
                author: 'Project Manager',
                priority: 'high',
                status: 'ongoing',
                createdAt: new Date(Date.now() - 86400000).toISOString(),
                files: []
            }
        ];
        
        taskManager.tasks = sampleTasks;
        taskManager.saveTasks();
        taskManager.renderTasks();
        taskManager.updateTaskCounts();
        taskManager.populateAuthorFilter();
        taskManager.populateMonthFilter();
    }
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + K to open task modal
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        openTaskModal();
    }
    
    // Escape to close modals
    if (e.key === 'Escape') {
        const openModal = document.querySelector('.modal.show');
        if (openModal) {
            taskManager.closeModal(openModal);
            if (openModal.id === 'taskModal') {
                taskManager.resetForm();
            }
        }
    }
});