// Cloudinary Configuration
const CLOUD_NAME = 'ddbcasizc';
const UPLOAD_PRESET = 'my_form_uploads';
const ASSET_FOLDER = 'form_attachments';

// Admin Configuration
const ADMIN_PASSWORD = "shop123"; // Change this in production
const ADMIN_SESSION_KEY = "shop_admin_auth";

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize upload page if elements exist
    if (document.getElementById('fileInput')) {
        initUploadPage();
    }
    
    // Initialize admin page if elements exist
    if (document.getElementById('adminPassword')) {
        initAdminPage();
    }
});

// ======================
// UPLOAD PAGE FUNCTIONALITY
// ======================

function initUploadPage() {
    const fileInput = document.getElementById('fileInput');
    const uploadBtn = document.getElementById('uploadBtn');
    const dropZone = document.getElementById('dropZone');
    const filePreview = document.getElementById('filePreview');
    const fileError = document.getElementById('fileError');
    
    // Initially disable upload button
    uploadBtn.disabled = true;

    // File selection handler
    fileInput.addEventListener('change', function() {
        handleFileSelection(this.files);
    });

    // Drag and drop functionality
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, unhighlight, false);
    });

    function highlight() {
        dropZone.classList.add('highlight');
    }

    function unhighlight() {
        dropZone.classList.remove('highlight');
    }

    dropZone.addEventListener('drop', function(e) {
        const dt = e.dataTransfer;
        handleFileSelection(dt.files);
    });

    // Upload button handler
    uploadBtn.addEventListener('click', handleUpload);

    function handleFileSelection(files) {
        filePreview.innerHTML = '';
        fileError.textContent = '';
        
        if (!files || files.length === 0) {
            fileError.textContent = 'Please select files first';
            uploadBtn.disabled = true;
            return;
        }
        
        // Check file types and sizes
        const validFiles = Array.from(files).filter(file => {
            const validTypes = ['image/jpeg', 'image/png', 'application/pdf'];
            const maxSize = 10 * 1024 * 1024; // 10MB
            
            if (!validTypes.includes(file.type)) {
                showStatus(`Skipped: ${file.name} (Invalid file type)`, 'warning');
                return false;
            }
            
            if (file.size > maxSize) {
                showStatus(`Skipped: ${file.name} (File too large)`, 'warning');
                return false;
            }
            
            return true;
        });
        
        if (validFiles.length === 0) {
            fileError.textContent = 'No valid files selected';
            uploadBtn.disabled = true;
            return;
        }
        
        // Create file preview
        validFiles.forEach(file => {
            const item = document.createElement('div');
            item.className = 'file-preview-item';
            item.innerHTML = `
                <i class="${getFileIcon(file.name)}"></i>
                <span>${file.name}</span>
                <small>${formatFileSize(file.size)}</small>
            `;
            filePreview.appendChild(item);
        });
        
        uploadBtn.disabled = false;
    }

    async function handleUpload() {
        const files = fileInput.files;
        const progressBar = document.getElementById('progressBar');
        const progressText = document.getElementById('progressText');
        const statusContainer = document.getElementById('statusContainer');
        
        if (!files || files.length === 0) {
            showStatus('Please select files first', 'error');
            return;
        }
        
        // Disable UI during upload
        fileInput.disabled = true;
        uploadBtn.disabled = true;
        uploadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading...';
        
        document.getElementById('progressContainer').style.display = 'block';
        progressBar.style.width = '0%';
        progressText.textContent = '0%';
        
        try {
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                
                try {
                    showStatus(`Uploading: ${file.name}`, 'info');
                    
                    // Simulate upload progress
                    for (let p = 0; p <= 100; p += 10) {
                        progressBar.style.width = `${p}%`;
                        progressText.textContent = `${p}%`;
                        await new Promise(resolve => setTimeout(resolve, 100));
                    }
                    
                    // Actual Cloudinary upload would go here
                    // const result = await uploadToCloudinary(file);
                    
                    showStatus(`Uploaded: ${file.name}`, 'success');
                } catch (error) {
                    showStatus(`Failed: ${file.name} - ${error.message}`, 'error');
                }
            }
            
            showStatus('All files uploaded successfully!', 'success');
            uploadBtn.innerHTML = '<i class="fas fa-check"></i> Upload Complete';
        } finally {
            setTimeout(() => {
                uploadBtn.innerHTML = '<i class="fas fa-upload"></i> Upload Files';
                uploadBtn.disabled = false;
                fileInput.disabled = false;
            }, 2000);
        }
    }
}

// ======================
// ADMIN PANEL FUNCTIONALITY
// ======================

function initAdminPage() {
    const loginContainer = document.getElementById('loginContainer');
    const dashboard = document.getElementById('dashboard');
    const adminPassword = document.getElementById('adminPassword');
    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const loginError = document.getElementById('loginError');
    const refreshBtn = document.getElementById('refreshBtn');
    const searchInput = document.getElementById('searchInput');
    const fileList = document.getElementById('fileList');
    
    // Check for existing session
    if (localStorage.getItem(ADMIN_SESSION_KEY)) {
        loginContainer.style.display = 'none';
        dashboard.style.display = 'block';
        fetchUploads();
    } else {
        loginContainer.style.display = 'flex';
        dashboard.style.display = 'none';
    }
    
    // Login handler
    loginBtn.addEventListener('click', function() {
        const password = adminPassword.value.trim();
        
        if (password === ADMIN_PASSWORD) {
            localStorage.setItem(ADMIN_SESSION_KEY, "true");
            loginContainer.style.display = 'none';
            dashboard.style.display = 'block';
            adminPassword.value = '';
            loginError.textContent = '';
            fetchUploads();
        } else {
            loginError.textContent = 'Incorrect password';
            adminPassword.classList.add('shake');
            setTimeout(() => adminPassword.classList.remove('shake'), 500);
        }
    });
    
    // Logout handler
    logoutBtn.addEventListener('click', function() {
        localStorage.removeItem(ADMIN_SESSION_KEY);
        loginContainer.style.display = 'flex';
        dashboard.style.display = 'none';
        fileList.innerHTML = '';
    });
    
    // Refresh handler
    refreshBtn.addEventListener('click', fetchUploads);
    
    // Search handler
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        const items = fileList.querySelectorAll('.file-item');
        
        items.forEach(item => {
            const fileName = item.querySelector('.file-name').textContent.toLowerCase();
            item.style.display = fileName.includes(searchTerm) ? 'flex' : 'none';
        });
    });
    
    // Enter key to login
    adminPassword.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            loginBtn.click();
        }
    });
}

async function fetchUploads() {
    const fileList = document.getElementById('fileList');
    
    try {
        fileList.innerHTML = '<div class="loading">Loading files...</div>';
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // In a real implementation, you would call Cloudinary API here:
        // const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/resources/image?type=upload&prefix=${ASSET_FOLDER}&max_results=100`);
        // const data = await response.json();
        // const files = data.resources;
        
        // Mock data for demonstration
        const files = [
            {
                public_id: 'form_attachments/document1',
                format: 'pdf',
                created_at: new Date().toISOString(),
                bytes: 1024 * 1024,
                secure_url: '#'
            },
            {
                public_id: 'form_attachments/image1',
                format: 'jpg',
                created_at: new Date(Date.now() - 86400000).toISOString(),
                bytes: 2.5 * 1024 * 1024,
                secure_url: '#'
            }
        ];
        
        if (files.length === 0) {
            fileList.innerHTML = '<div class="empty">No files found</div>';
            return;
        }
        
        fileList.innerHTML = '';
        files.forEach(file => {
            const item = document.createElement('div');
            item.className = 'file-item';
            item.innerHTML = `
                <div class="file-name">
                    <i class="${getFileIcon(file.format)}"></i>
                    <span>${file.public_id.split('/').pop()}</span>
                </div>
                <div class="file-date">${new Date(file.created_at).toLocaleString()}</div>
                <div class="file-size">${formatFileSize(file.bytes)}</div>
                <div class="file-actions">
                    <a href="${file.secure_url}" download class="download-btn">
                        <i class="fas fa-download"></i>
                    </a>
                    <button class="delete-btn" data-id="${file.public_id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            fileList.appendChild(item);
        });
        
        // Add delete handlers
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const fileId = this.getAttribute('data-id');
                if (confirm(`Delete ${fileId}?`)) {
                    deleteFile(fileId);
                }
            });
        });
        
    } catch (error) {
        fileList.innerHTML = `
            <div class="error">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Failed to load files</p>
                <button onclick="fetchUploads()">Retry</button>
            </div>
        `;
        console.error('Error fetching files:', error);
    }
}

// Helper functions
function getFileIcon(filename) {
    const extension = typeof filename === 'string' 
        ? filename.split('.').pop().toLowerCase()
        : filename;
    
    const icons = {
        jpg: 'fas fa-file-image',
        jpeg: 'fas fa-file-image',
        png: 'fas fa-file-image',
        gif: 'fas fa-file-image',
        pdf: 'fas fa-file-pdf',
        doc: 'fas fa-file-word',
        docx: 'fas fa-file-word',
        default: 'fas fa-file'
    };
    
    return icons[extension] || icons.default;
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function showStatus(message, type) {
    const statusContainer = document.getElementById('statusContainer');
    const statusItem = document.createElement('div');
    statusItem.className = `status-item ${type}`;
    
    const icon = type === 'success' 
        ? 'fas fa-check-circle' 
        : type === 'error' 
            ? 'fas fa-exclamation-circle' 
            : 'fas fa-info-circle';
    
    statusItem.innerHTML = `<i class="${icon}"></i> ${message}`;
    statusContainer.appendChild(statusItem);
    
    // Auto-remove after 5 seconds (except errors)
    if (type !== 'error') {
        setTimeout(() => {
            statusItem.style.opacity = '0';
            setTimeout(() => statusItem.remove(), 300);
        }, 5000);
    }
}

// Make functions available globally
window.fetchUploads = fetchUploads;
