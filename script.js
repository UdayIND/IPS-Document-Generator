// Dashboard JavaScript Functionality

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeDashboard();
    setupEventListeners();
    loadDashboardData();
});

// Initialize dashboard components
function initializeDashboard() {
    // Add loading states to buttons
    const buttons = document.querySelectorAll('.btn-primary, .btn-secondary');
    buttons.forEach(button => {
        button.addEventListener('click', function() {
            if (!this.classList.contains('loading')) {
                this.classList.add('loading');
                setTimeout(() => this.classList.remove('loading'), 2000);
            }
        });
    });

    // Initialize task completion tracking
    initializeTaskTracking();
    
    // Initialize real-time updates
    initializeRealTimeUpdates();
}

// Setup event listeners
function setupEventListeners() {
    // Task completion
    const taskCheckboxes = document.querySelectorAll('.task-item input[type="checkbox"]');
    taskCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            handleTaskCompletion(this);
        });
    });

    // Client card interactions
    const clientCards = document.querySelectorAll('.client-card');
    clientCards.forEach(card => {
        card.addEventListener('click', function() {
            openClientDetails(this);
        });
    });

    // Notification interactions
    const notifications = document.querySelectorAll('.notification-item');
    notifications.forEach(notification => {
        notification.addEventListener('click', function() {
            markNotificationAsRead(this);
        });
    });
}

// Task completion handling
function handleTaskCompletion(checkbox) {
    const taskItem = checkbox.closest('.task-item');
    const taskLabel = taskItem.querySelector('label');
    
    if (checkbox.checked) {
        taskItem.style.opacity = '0.6';
        taskLabel.style.textDecoration = 'line-through';
        taskLabel.style.color = '#94a3b8';
        
        // Add completion animation
        taskItem.style.transform = 'scale(0.98)';
        setTimeout(() => {
            taskItem.style.transform = 'scale(1)';
        }, 150);
        
        // Update task count
        updateTaskCount();
    } else {
        taskItem.style.opacity = '1';
        taskLabel.style.textDecoration = 'none';
        taskLabel.style.color = '#374151';
    }
}

// Update task count in sidebar
function updateTaskCount() {
    const totalTasks = document.querySelectorAll('.task-item input[type="checkbox"]').length;
    const completedTasks = document.querySelectorAll('.task-item input[type="checkbox"]:checked').length;
    
    // You could add a task counter display here
    console.log(`Tasks completed: ${completedTasks}/${totalTasks}`);
}

// Initialize task tracking
function initializeTaskTracking() {
    // Load saved task states from localStorage
    const taskCheckboxes = document.querySelectorAll('.task-item input[type="checkbox"]');
    taskCheckboxes.forEach((checkbox, index) => {
        const savedState = localStorage.getItem(`task_${index}`);
        if (savedState === 'true') {
            checkbox.checked = true;
            handleTaskCompletion(checkbox);
        }
    });
}

// Client details modal
function openClientDetails(clientCard) {
    const clientName = clientCard.querySelector('.client-name').textContent;
    
    // Create a simple client details modal
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Client Details - ${clientName}</h3>
                <button class="close-btn" onclick="this.closest('.modal').remove()">&times;</button>
            </div>
            <div class="modal-body">
                <div class="client-info">
                    <p><strong>Status:</strong> Active Prospect</p>
                    <p><strong>Last Contact:</strong> 2 days ago</p>
                    <p><strong>Next Action:</strong> Schedule discovery meeting</p>
                    <p><strong>Potential AUM:</strong> $500K - $1M</p>
                </div>
                <div class="client-actions" style="margin-top: 1rem;">
                    <button class="btn-primary" onclick="scheduleMeeting('${clientName}')">
                        <i class="fas fa-calendar-plus"></i>
                        Schedule Meeting
                    </button>
                    <button class="btn-outline" onclick="generateIPS('${clientName}')">
                        <i class="fas fa-file-pdf"></i>
                        Generate IPS
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.style.display = 'block';
}

// Mark notification as read
function markNotificationAsRead(notification) {
    notification.style.opacity = '0.6';
    notification.style.transform = 'scale(0.98)';
    
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'scale(1)';
    }, 200);
}

// Initialize real-time updates
function initializeRealTimeUpdates() {
    // Simulate real-time data updates
    setInterval(updateKPIs, 30000); // Update every 30 seconds
    setInterval(updateNotifications, 60000); // Update every minute
}

// Update KPI values (simulated)
function updateKPIs() {
    const kpiValues = document.querySelectorAll('.kpi-value');
    kpiValues.forEach(kpi => {
        // Add subtle animation to show data is live
        kpi.style.transform = 'scale(1.02)';
        setTimeout(() => {
            kpi.style.transform = 'scale(1)';
        }, 200);
    });
}

// Update notifications
function updateNotifications() {
    // Simulate new notifications
    const notificationTemplates = [
        {
            icon: 'market',
            title: 'Market Update',
            text: 'S&P 500 showing strong performance today',
            time: 'Just now'
        },
        {
            icon: 'client',
            title: 'Client Activity',
            text: 'New client document uploaded',
            time: '2 minutes ago'
        }
    ];
    
    // Randomly add new notifications (for demo purposes)
    if (Math.random() > 0.7) {
        addNewNotification(notificationTemplates[Math.floor(Math.random() * notificationTemplates.length)]);
    }
}

// Add new notification
function addNewNotification(notification) {
    const notificationsList = document.querySelector('.notifications-list');
    const notificationItem = document.createElement('div');
    notificationItem.className = 'notification-item';
    notificationItem.innerHTML = `
        <div class="notification-icon ${notification.icon}">
            <i class="fas fa-${notification.icon === 'market' ? 'chart-line' : 'user'}"></i>
        </div>
        <div class="notification-content">
            <div class="notification-title">${notification.title}</div>
            <div class="notification-text">${notification.text}</div>
            <div class="notification-time">${notification.time}</div>
        </div>
    `;
    
    // Add animation
    notificationItem.style.opacity = '0';
    notificationItem.style.transform = 'translateY(-20px)';
    
    notificationsList.insertBefore(notificationItem, notificationsList.firstChild);
    
    // Animate in
    setTimeout(() => {
        notificationItem.style.transition = 'all 0.3s ease';
        notificationItem.style.opacity = '1';
        notificationItem.style.transform = 'translateY(0)';
    }, 100);
}

// Load dashboard data
function loadDashboardData() {
    // Simulate loading dashboard data
    console.log('Loading dashboard data...');
    
    // You would typically make API calls here to load:
    // - KPI data
    // - Task lists
    // - Meeting schedules
    // - Client pipeline data
    // - Notifications
    
    // For demo purposes, we'll just log the data loading
    setTimeout(() => {
        console.log('Dashboard data loaded successfully');
    }, 1000);
}

// IPS Generator Functions
function openIPSGenerator() {
    const modal = document.getElementById('ipsModal');
    modal.style.display = 'block';
}

function closeIPSModal() {
    const modal = document.getElementById('ipsModal');
    modal.style.display = 'none';
}

function generateIPS() {
    const clientSelect = document.getElementById('clientSelect');
    const selectedClient = clientSelect.value;
    const spinner = document.getElementById('ipsSpinner');
    const generateBtn = document.querySelector('#ipsModal .btn-primary');
    
    if (!selectedClient) {
        alert('Please select a client first.');
        return;
    }
    
    // Show spinner and disable button
    spinner.style.display = 'inline-block';
    generateBtn.disabled = true;
    generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
    
    // Simulate IPS generation process
    setTimeout(() => {
        // Hide spinner and re-enable button
        spinner.style.display = 'none';
        generateBtn.disabled = false;
        generateBtn.innerHTML = 'Generate IPS PDF';
        
        // Close modal
        closeIPSModal();
        
        // Show success notification
        showSuccessNotification();
        
        // Simulate adding to client documents
        console.log(`IPS document generated for ${selectedClient}`);
        
    }, 3000); // 3 second simulation
}

function showSuccessNotification() {
    const notification = document.getElementById('successNotification');
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// Quick Action Functions
function openClientModal() {
    alert('New Client modal would open here. This would typically open a form to add a new client to the system.');
}

function openMeetingModal() {
    alert('Schedule Meeting modal would open here. This would typically open a calendar interface to schedule a new meeting.');
}

function generateReport() {
    alert('Report generation would start here. This would typically generate various reports like performance summaries, compliance reports, etc.');
}

function scheduleMeeting(clientName) {
    alert(`Scheduling meeting with ${clientName}. This would typically open a calendar interface.`);
}

// Close modal when clicking outside
window.addEventListener('click', function(event) {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
});

// Keyboard shortcuts
document.addEventListener('keydown', function(event) {
    // ESC key to close modals
    if (event.key === 'Escape') {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            if (modal.style.display === 'block') {
                modal.style.display = 'none';
            }
        });
    }
    
    // Ctrl/Cmd + N for new client
    if ((event.ctrlKey || event.metaKey) && event.key === 'n') {
        event.preventDefault();
        openClientModal();
    }
    
    // Ctrl/Cmd + M for new meeting
    if ((event.ctrlKey || event.metaKey) && event.key === 'm') {
        event.preventDefault();
        openMeetingModal();
    }
});

// Save task states to localStorage
function saveTaskStates() {
    const taskCheckboxes = document.querySelectorAll('.task-item input[type="checkbox"]');
    taskCheckboxes.forEach((checkbox, index) => {
        localStorage.setItem(`task_${index}`, checkbox.checked);
    });
}

// Save task states when checkboxes change
document.addEventListener('change', function(event) {
    if (event.target.type === 'checkbox' && event.target.closest('.task-item')) {
        saveTaskStates();
    }
});

// Export functions for global access
window.openIPSGenerator = openIPSGenerator;
window.closeIPSModal = closeIPSModal;
window.generateIPS = generateIPS;
window.openClientModal = openClientModal;
window.openMeetingModal = openMeetingModal;
window.generateReport = generateReport;
window.scheduleMeeting = scheduleMeeting;
