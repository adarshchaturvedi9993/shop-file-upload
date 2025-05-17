# Shop File Upload System

A complete system for customers to upload files via QR code with an admin dashboard to manage uploads.

## Features
- Drag & drop file uploads
- File preview before uploading
- Progress tracking
- Secure admin dashboard
- Responsive design
- Cloudinary integration

## Setup

1. **Cloudinary Configuration**:
   - Create an account at [Cloudinary](https://cloudinary.com/)
   - Set up an upload preset with these settings:
     - Name: `my_form_uploads`
     - Mode: Unsigned
     - Folder: `form_attachments`
     - Unique filename: Enabled
     - Overwrite: Disabled

2. **Deployment**:
   - Upload all files to your GitHub repository
   - Enable GitHub Pages in repository settings

3. **QR Code**:
   - Generate a QR code pointing to your `index.html` page
   - Print and display in your shop

## Admin Access
- URL: `your-site.com/admin.html`
- Default password: `shop123` (change this in `app.js`)

## Security Note
For production use:
1. Change the default admin password
2. Implement server-side authentication
3. Set up Cloudinary security settings
4. Monitor your Cloudinary usage
