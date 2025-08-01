# Azure DevOps Task Manager

A fully functional, Azure DevOps-inspired task management system with drag-and-drop functionality, file uploads, and modern UI design. Built with vanilla HTML, CSS, and JavaScript.

![Azure DevOps Task Manager](https://img.shields.io/badge/Status-Ready%20to%20Use-brightgreen)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)

## 🚀 Features

### ✨ Core Functionality
- **Kanban Board**: Four-column layout (New Tasks, Ongoing, Paused, Finished)
- **Drag & Drop**: Seamlessly move tasks between columns
- **Task Creation**: Rich task creation form with all necessary fields
- **File Attachments**: Upload and attach any file type to tasks
- **Search & Filter**: Real-time search and author-based filtering
- **Local Storage**: Automatic data persistence in browser

### 🎨 User Interface
- **Azure DevOps Design**: Authentic Microsoft design language
- **Responsive Layout**: Works perfectly on desktop, tablet, and mobile
- **Modern Animations**: Smooth transitions and hover effects
- **Professional Styling**: Clean, enterprise-grade appearance
- **Accessibility**: Keyboard shortcuts and screen reader friendly

### 📋 Task Management
- **Rich Task Details**: Title, description, author, priority levels
- **Priority System**: Low, Medium, High, Critical priority levels
- **Task Details Modal**: Click any task to view full details
- **File Downloads**: Download attached files directly from tasks
- **Task Counts**: Real-time counters for each column

## 🛠️ Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- No server or installation required!

### Quick Start
1. **Download** or clone the repository
2. **Open** `index.html` in your web browser
3. **Start creating** tasks immediately!

```bash
# Clone the repository
git clone <repository-url>

# Navigate to the project
cd azure-devops-task-manager

# Open in browser (or just double-click index.html)
open index.html
```

## 📖 How to Use

### Creating Tasks
1. Click the **"New Task"** button in the header
2. Fill in the task details:
   - **Title** (required): Brief task description
   - **Description**: Detailed task information
   - **Author** (required): Task creator's name
   - **Priority**: Choose from Low, Medium, High, Critical
   - **Attachments**: Upload any files by clicking or dragging

### Managing Tasks
- **Move Tasks**: Drag and drop between columns
- **View Details**: Click any task card to see full information
- **Download Files**: Click attachments in the task details modal
- **Search**: Use the search box to find specific tasks
- **Filter**: Filter tasks by author using the dropdown

### Keyboard Shortcuts
- **Ctrl/Cmd + K**: Open new task modal
- **Escape**: Close any open modal

## 🏗️ Technical Architecture

### File Structure
```
azure-devops-task-manager/
├── index.html          # Main HTML structure
├── styles.css          # Complete styling and responsive design
├── script.js           # Task management logic and interactions
└── README.md           # This documentation
```

### Key Components

#### HTML Structure
- **Header**: Navigation and new task button
- **Sidebar**: Project info and quick actions
- **Main Content**: Kanban board with four columns
- **Modals**: Task creation and detail viewing

#### CSS Features
- **CSS Grid**: Responsive kanban board layout
- **Flexbox**: Component alignment and distribution
- **CSS Animations**: Smooth transitions and effects
- **Media Queries**: Mobile-first responsive design
- **CSS Variables**: Consistent color scheme

#### JavaScript Classes
- **TaskManager**: Main application controller
- **Event Handling**: Drag & drop, form submission, file upload
- **Local Storage**: Data persistence and retrieval
- **Utility Functions**: File handling, formatting, validation

## 🎯 Features in Detail

### Drag & Drop System
- **Visual Feedback**: Cards tilt and become semi-transparent when dragging
- **Drop Zones**: Columns highlight when dragging over them
- **Status Updates**: Tasks automatically update status when dropped
- **Smooth Animations**: CSS transitions for professional feel

### File Upload System
- **Multiple Files**: Upload multiple files at once
- **Drag & Drop**: Drag files directly onto the upload area
- **File Type Icons**: Automatic icon detection based on file type
- **Size Display**: Human-readable file size formatting
- **File Management**: Remove files before task creation

### Search & Filter
- **Real-time Search**: Instant results as you type
- **Multi-field Search**: Searches title, description, and author
- **Author Filter**: Dropdown populated with existing authors
- **Combined Filters**: Search and author filter work together

### Data Persistence
- **Local Storage**: All data saved automatically in browser
- **JSON Format**: Structured data storage
- **File Encoding**: Base64 encoding for file attachments
- **Data Recovery**: Automatic loading on page refresh

## 🎨 Design System

### Color Palette
- **Primary Blue**: `#0078d4` (Azure DevOps brand color)
- **Background**: `#f8f9fa` (Light gray)
- **Text Primary**: `#323130` (Dark gray)
- **Text Secondary**: `#605e5c` (Medium gray)
- **Borders**: `#e1dfdd` (Light gray)

### Typography
- **Font Family**: Segoe UI (Microsoft's design system)
- **Hierarchy**: Clear heading and body text distinction
- **Weights**: 400 (regular), 500 (medium), 600 (semibold)

### Priority Colors
- **Low**: Blue (`#0277bd`)
- **Medium**: Orange (`#f57c00`)
- **High**: Red (`#d32f2f`)
- **Critical**: Pink (`#c2185b`)

## 📱 Responsive Design

### Breakpoints
- **Desktop**: 1200px+ (4-column grid)
- **Tablet**: 768px-1199px (2-column grid)
- **Mobile**: <768px (1-column stack)

### Mobile Features
- **Collapsible Sidebar**: Hidden by default on mobile
- **Stacked Layout**: Columns stack vertically
- **Touch-friendly**: Larger touch targets
- **Optimized Forms**: Mobile-optimized input fields

## 🔧 Customization

### Adding New Statuses
1. Update the HTML to add new columns
2. Modify the CSS grid template
3. Add new status handling in JavaScript
4. Update the empty state messages

### Changing Colors
1. Update CSS custom properties
2. Modify priority color classes
3. Adjust hover and focus states

### Adding New File Types
1. Extend the `getFileIcon()` method
2. Add new Font Awesome icons
3. Update file type detection logic

## 🚀 Performance

### Optimizations
- **Vanilla JavaScript**: No framework overhead
- **Local Storage**: No server requests needed
- **Efficient DOM**: Minimal DOM manipulation
- **CSS Animations**: Hardware-accelerated transitions
- **Image Optimization**: SVG icons via Font Awesome CDN

### Browser Support
- **Chrome**: 60+ ✅
- **Firefox**: 55+ ✅
- **Safari**: 12+ ✅
- **Edge**: 79+ ✅

## 🤝 Contributing

This is a complete, standalone application ready for use. If you'd like to extend it:

1. Fork the repository
2. Create your feature branch
3. Test thoroughly across browsers
4. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🎉 Acknowledgments

- **Microsoft Azure DevOps** for design inspiration
- **Font Awesome** for beautiful icons
- **Modern CSS** techniques for responsive design
- **Vanilla JavaScript** for lightweight performance

---

**Ready to manage your tasks like a pro?** Open `index.html` and start organizing your workflow today! 🎯