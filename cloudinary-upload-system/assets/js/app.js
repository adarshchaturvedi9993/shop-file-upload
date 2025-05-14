// Cloudinary Configuration
const CLOUD_NAME = 'ddbcasizc';
const UPLOAD_PRESET = 'my_form_uploads';
const ASSET_FOLDER = 'form_attachments';

// Admin Configuration
const ADMIN_PASSWORD = "shop123"; // Change this in production
const ADMIN_SESSION_KEY = "shop_admin_auth";

// DOM Elements
const fileInput = document.getElementById('fileInput');
const uploadBtn = document.getElementById('uploadBtn');
const dropZone = document.getElementById('dropZone');
const progressContainer = document.getElementById('progressContainer');
const progressBar = document.getElementById('progressBar');
const progressText = document.getElementById('progressText');
const statusContainer = document.getElementById('statusContainer');
const loginContainer = document.getElementById('loginContainer');
const dashboard = document.getElementById('dashboard');
const adminPasswordInput = document.getElementById('adminPassword');
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const fileList = document.getElementById('fileList');
const refreshBtn = document.getElementById('refreshBtn');
const searchInput = document.getElementById('searchInput');

// Global Variables
let allFiles = [];
let currentPage = 1;
const itemsPerPage = 10;

// ======================
// INITIALIZATION
// ======================

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the appropriate page
    if (fileInput && uploadBtn) {
        initUploadPage();
    }
    if (adminPasswordInput && loginBtn) {
        initAdminPage();
    }
});

function initUploadPage() {
    // Set up drag and drop
    setupDragAndDrop();
    
    // Set up upload button
    if (uploadBtn) {
        uploadBtn.addEventListener('click', handleUpload);
    }
}

function initAdminPage() {
    // Check for existing session
    checkAdminSession();
    
    // Set up login/logout
    if (loginBtn) {
        loginBtn.addEventListener('click', handleLogin);
    }
    
    if (adminPasswordInput) {
        adminPasswordInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') handleLogin();
        });
    }
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    // Set up file list controls
    if (refreshBtn) {
        refreshBtn.addEventListener('click', function() {
            currentPage = 1;
            fetchUploads();
        });
    }
    
    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
    }
}

// ======================
// UPLOAD FUNCTIONALITY
// ======================

function setupDragAndDrop() {
    if (!dropZone) return;

    dropZone.addEventListener('dragover', function(e) {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });

    dropZone.addEventListener('dragleave', function() {
        dropZone.classList.remove('dragover');
    });

    dropZone.addEventListener('drop', function(e) {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        if (e.dataTransfer.files.length) {
            fileInput.files = e.dataTransfer.files;
        }
    });
}

async function handleUpload() {
    if (!fileInput.files || fileInput.files.length === 0) {
        showStatus('Please select files first', 'error');
        return;
    }

    // Reset UI
    if (progressContainer) progressContainer.style.display = 'block';
    if (progressBar) progressBar.style.width = '0%';
    if (progressText) progressText.textContent = '0%';
    if (statusContainer) statusContainer.innerHTML = '';
    if (uploadBtn) uploadBtn.disabled = true;

    const files = fileInput.files;
    let uploadedCount = 0;

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        try {
            showStatus(`Uploading: ${file.name}`, 'info');
            await uploadToCloudinary(file);
            uploadedCount++;
            
            // Update progress
            const progress = Math.round((uploadedCount / files.length) * 100);
            if (progressBar) progressBar.style.width = `${progress}%`;
            if (progressText) progressText.textContent = `${progress}%`;
            
            showStatus(`Uploaded: ${file.name}`, 'success');
        } catch (error) {
            showStatus(`Failed: ${file.name} - ${error.message}`, 'error');
        }
    }

    // Reset UI
    if (uploadBtn) uploadBtn.disabled = false;
    fileInput.value = '';
}

async function uploadToCloudinary(file) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);
    formData.append('folder', ASSET_FOLDER);

    const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/upload`, {
        method: 'POST',
        body: formData
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Upload failed');
    }

    return response.json();
}

function showStatus(message, type) {
    if (!statusContainer) return;

    const statusItem = document.createElement('div');
    statusItem.className = `status-item ${type}`;

    let iconClass;
    switch (type) {
        case 'success': iconClass = 'fas fa-check-circle'; break;
        case 'error': iconClass = 'fas fa-exclamation-circle'; break;
        default: iconClass = 'fas fa-info-circle';
    }

    statusItem.innerHTML = `<i class="${iconClass}"></i><span>${message}</span>`;
    statusContainer.appendChild(statusItem);
    statusItem.scrollIntoView({ behavior: 'smooth' });
}

// ======================
// ADMIN FUNCTIONALITY
// ======================

function checkAdminSession() {
    if (localStorage.getItem(ADMIN_SESSION_KEY)) {
        if (loginContainer) loginContainer.style.display = 'none';
        if (dashboard) dashboard.style.display = 'block';
        fetchUploads();
    }
}

function handleLogin() {
    const password = adminPasswordInput ? adminPasswordInput.value.trim() : '';
    
    if (password === ADMIN_PASSWORD) {
        localStorage.setItem(ADMIN_SESSION_KEY, "true");
        if (loginContainer) loginContainer.style.display = 'none';
        if (dashboard) dashboard.style.display = 'block';
        if (adminPasswordInput) adminPasswordInput.value = '';
        fetchUploads();
    } else {
        showLoginError("Incorrect password. Please try again.");
    }
}

function handleLogout() {
    localStorage.removeItem(ADMIN_SESSION_KEY);
    if (dashboard) dashboard.style.display = 'none';
    if (loginContainer) loginContainer.style.display = 'flex';
}

function showLoginError(message) {
    const errorContainer = document.getElementById('loginErrorContainer');
    if (!errorContainer) return;

    errorContainer.innerHTML = `
        <div class="login-error">
            <i class="fas fa-exclamation-circle"></i>
            <span>${message}</span>
        </div>
    `;
}

// ======================
// FILE MANAGEMENT
// ======================

async function fetchUploads() {
    try {
        if (fileList) fileList.innerHTML = '<div class="loading">Loading files...</div>';
        
        const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/resources/image?type=upload&prefix=${ASSET_FOLDER}&max_results=100`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        allFiles = data.resources || [];
        
        // Update stats
        updateFileStats();
        
        // Render file list
        renderFileList();
    } catch (error) {
        console.error('Fetch error:', error);
        if (fileList) {
            fileList.innerHTML = `
                <div class="error">
                    <p>Failed to load files</p>
                    <p>${error.message}</p>
                    <button onclick="fetchUploads()">Retry</button>
                </div>
            `;
        }
    }
}

function updateFileStats() {
    if (!allFiles.length) return;

    const totalSize = allFiles.reduce((sum, file) => sum + file.bytes, 0);
    
    if (document.getElementById('totalFiles')) {
        document.getElementById('totalFiles').textContent = allFiles.length;
    }
    
    if (document.getElementById('totalSize')) {
        document.getElementById('totalSize').textContent = formatFileSize(totalSize);
    }
}

function renderFileList() {
    if (!fileList) return;

    if (!allFiles || allFiles.length === 0) {
        fileList.innerHTML = '<div class="empty">No files found</div>';
        return;
    }

    // Filter files based on search
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
    const filteredFiles = searchTerm 
        ? allFiles.filter(file => file.public_id.toLowerCase().includes(searchTerm))
        : allFiles;

    // Pagination
    const totalPages = Math.ceil(filteredFiles.length / itemsPerPage);
    const startIdx = (currentPage - 1) * itemsPerPage;
    const paginatedFiles = filteredFiles.slice(startIdx, startIdx + itemsPerPage);

    // Update pagination controls
    if (prevBtn) prevBtn.disabled = currentPage <= 1;
    if (nextBtn) nextBtn.disabled = currentPage >= totalPages;
    if (pageInfo) pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;

    // Render files
    fileList.innerHTML = '';
    
    paginatedFiles.forEach(file => {
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';
        
        const fileName = file.public_id.split('/').pop();
        const fileDate = new Date(file.created_at).toLocaleString();
        const fileSize = formatFileSize(file.bytes);
        const fileUrl = file.secure_url;
        
        fileItem.innerHTML = `
            <div class="file-name">
                <i class="${getFileIcon(file.format)}"></i>
                <span>${fileName}</span>
            </div>
            <div class="file-date">${fileDate}</div>
            <div class="file-size">${fileSize}</div>
            <div class="file-actions">
                <a href="${fileUrl}" download class="download-btn" title="Download">
                    <i class="fas fa-download"></i>
                </a>
                <button class="delete-btn" title="Delete" data-id="${file.public_id}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        fileList.appendChild(fileItem);
    });

    // Add delete event listeners
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            const fileId = e.currentTarget.getAttribute('data-id');
            if (confirm(`Are you sure you want to delete ${fileId}?`)) {
                deleteFile(fileId);
            }
        });
    });
}

function handleSearch() {
    currentPage = 1;
    renderFileList();
}

async function deleteFile(publicId) {
    try {
        const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/resources/image/upload?public_id=${encodeURIComponent(publicId)}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error('Failed to delete file');
        }
        
        // Refresh the file list
        fetchUploads();
    } catch (error) {
        alert(`Error deleting file: ${error.message}`);
        console.error('Error deleting file:', error);
    }
}

// ======================
// HELPER FUNCTIONS
// ======================

function getFileIcon(format) {
    switch (format) {
        case 'jpg':
        case 'jpeg':
        case 'png':
        case 'gif':
        case 'webp':
            return 'fas fa-file-image';
        case 'pdf':
            return 'fas fa-file-pdf';
        case 'doc':
        case 'docx':
            return 'fas fa-file-word';
        default:
            return 'fas fa-file';
    }
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Make essential functions available globally
window.handleUpload = handleUpload;
window.fetchUploads = fetchUploads;