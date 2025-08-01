// Task Management System
class TaskManager {
    constructor() {
        this.tasks = this.loadTasks();
        this.draggedTask = null;
        this.selectedFiles = [];
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.renderTasks();
        this.updateTaskCounts();
        this.populateAuthorFilter();
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
        document.getElementById('filterAuthor').addEventListener('change', (e) => this.filterTasks());

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
        const authorFilter = document.getElementById('filterAuthor').value;

        return this.tasks.filter(task => {
            const matchesSearch = !searchTerm || 
                task.title.toLowerCase().includes(searchTerm) ||
                task.description.toLowerCase().includes(searchTerm) ||
                task.author.toLowerCase().includes(searchTerm);

            const matchesAuthor = !authorFilter || task.author === authorFilter;

            return matchesSearch && matchesAuthor;
        });
    }

    filterTasks() {
        this.renderTasks();
        this.updateTaskCounts();
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

    // Task Details Modal
    showTaskDetails(task) {
        const modal = document.getElementById('taskDetailModal');
        const title = document.getElementById('taskDetailTitle');
        const content = document.getElementById('taskDetailContent');

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