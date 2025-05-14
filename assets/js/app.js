// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const fileInput = document.getElementById('fileInput');
    const uploadBtn = document.getElementById('uploadBtn');
    const dropZone = document.getElementById('dropZone');
    const filePreview = document.getElementById('filePreview');
    const progressTracker = document.querySelector('.progress-tracker');
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');
    const statusContainer = document.getElementById('statusContainer');

    // Cloudinary Configuration
const CLOUD_NAME = 'ddbcasizc';
const UPLOAD_PRESET = 'my_form_uploads';
const ASSET_FOLDER = 'form_attachments';

    // Setup drag and drop
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

    // Handle dropped files
    dropZone.addEventListener('drop', handleDrop, false);

    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        handleFiles(files);
    }

    // Handle file selection
    fileInput.addEventListener('change', function() {
        handleFiles(this.files);
    });

    // Process files
    function handleFiles(files) {
        filePreview.innerHTML = '';
        [...files].forEach(previewFile);
    }

    // Create file preview
    function previewFile(file) {
        const fileItem = document.createElement('div');
        fileItem.className = 'file-preview-item';
        
        const icon = document.createElement('i');
        icon.className = getFileIcon(file.name.split('.').pop());
        
        const fileName = document.createElement('span');
        fileName.textContent = file.name;
        
        fileItem.appendChild(icon);
        fileItem.appendChild(fileName);
        filePreview.appendChild(fileItem);
    }

    // Get appropriate file icon
    function getFileIcon(extension) {
        const icons = {
            pdf: 'fas fa-file-pdf',
            jpg: 'fas fa-file-image',
            jpeg: 'fas fa-file-image',
            png: 'fas fa-file-image',
            doc: 'fas fa-file-word',
            docx: 'fas fa-file-word',
            default: 'fas fa-file'
        };
        return icons[extension.toLowerCase()] || icons.default;
    }

    // Handle upload
    uploadBtn.addEventListener('click', async function() {
        if (!fileInput.files.length) {
            showStatus('Please select files first', 'error');
            return;
        }

        progressTracker.style.display = 'block';
        uploadBtn.disabled = true;
        
        const files = fileInput.files;
        let uploadedCount = 0;
        
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            try {
                showStatus(`Uploading: ${file.name}`, 'info');
                
                // Simulate upload progress
                const interval = setInterval(() => {
                    if (progressBar.style.width === '100%') {
                        clearInterval(interval);
                        return;
                    }
                    const currentProgress = parseInt(progressBar.style.width) || 0;
                    const newProgress = Math.min(currentProgress + 5, 100);
                    progressBar.style.width = `${newProgress}%`;
                    progressText.textContent = `${newProgress}%`;
                }, 200);
                
                // Actual upload would go here
                // await uploadToCloudinary(file);
                
                // Simulate upload completion
                await new Promise(resolve => setTimeout(resolve, 1500));
                clearInterval(interval);
                progressBar.style.width = '100%';
                progressText.textContent = '100%';
                
                uploadedCount++;
                showStatus(`Uploaded: ${file.name}`, 'success');
            } catch (error) {
                showStatus(`Failed: ${file.name} - ${error.message}`, 'error');
            }
        }
        
        uploadBtn.disabled = false;
        fileInput.value = '';
    });

    // Show status message
    function showStatus(message, type) {
        const statusItem = document.createElement('div');
        statusItem.className = `status-item status-${type}`;
        
        const icon = document.createElement('i');
        icon.className = type === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle';
        
        const text = document.createElement('span');
        text.textContent = message;
        
        statusItem.appendChild(icon);
        statusItem.appendChild(text);
        statusContainer.appendChild(statusItem);
        
        // Auto-scroll to new messages
        statusItem.scrollIntoView({ behavior: 'smooth' });
        
        // Remove after 5 seconds (except for errors)
        if (type !== 'error') {
            setTimeout(() => {
                statusItem.style.opacity = '0';
                setTimeout(() => statusItem.remove(), 300);
            }, 5000);
        }
    }
});

// Note: Actual Cloudinary upload function would be implemented here
async function uploadToCloudinary(file) {
    // Implementation would go here
}
