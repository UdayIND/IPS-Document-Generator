// Dashboard JavaScript Functionality

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeDashboard();
    setupEventListeners();
    initializeAWS();
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
            title: 'ETF Performance Update',
            text: 'Our ETF performance vs market performance - [ETF Name] up [Percentage] vs [Market Index] up [Percentage]',
            time: 'Just now'
        },
        {
            icon: 'client',
            title: 'Client Activity',
            text: 'Shows client activity - Client Name [Number] logged into their portal',
            time: '2 minutes ago'
        },
        {
            icon: 'system',
            title: 'ETF Changes',
            text: 'Changes in our ETF - [ETF Name] rebalancing completed, new holdings added',
            time: '5 minutes ago'
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

// Initialize AWS services
function initializeAWS() {
    try {
        // Initialize AWS services
        const awsServices = initializeAWS();
        
        if (awsServices) {
            // Initialize managers
            window.kpiManager = new KPIManager(awsServices);
            window.taskManager = new TaskManager(awsServices);
            window.documentManager = new DocumentManager(awsServices);
            window.notificationManager = new NotificationManager(awsServices);
            
            console.log('✅ AWS services initialized successfully');
        } else {
            console.warn('⚠️ AWS services not available. Running in demo mode.');
        }
    } catch (error) {
        console.error('❌ Error initializing AWS services:', error);
        console.warn('⚠️ Running in demo mode without AWS integration.');
    }
}

// Load dashboard data
async function loadDashboardData() {
    console.log('Loading dashboard data...');
    
    try {
        // Load KPIs from AWS
        if (window.kpiManager) {
            const kpis = await window.kpiManager.fetchKPIs();
            if (kpis) {
                updateKPIDisplay(kpis);
            }
        }
        
        // Load tasks from AWS
        if (window.taskManager) {
            const tasks = await window.taskManager.fetchTasks();
            if (tasks && tasks.length > 0) {
                updateTaskDisplay(tasks);
            }
        }
        
        // Load notifications from AWS
        if (window.notificationManager) {
            const notifications = await window.notificationManager.fetchNotifications();
            if (notifications && notifications.length > 0) {
                updateNotificationDisplay(notifications);
            }
        }
        
        console.log('✅ Dashboard data loaded successfully');
    } catch (error) {
        console.error('❌ Error loading dashboard data:', error);
        console.log('📊 Using demo data instead');
    }
}

// Update KPI display with real data
function updateKPIDisplay(kpis) {
    // Update AUM
    const aumCard = document.querySelector('.kpi-card:nth-child(1) .kpi-value');
    if (aumCard && kpis.aum) {
        aumCard.textContent = `$${kpis.aum.toLocaleString()}M`;
    }
    
    // Update NNA
    const nnaCard = document.querySelector('.kpi-card:nth-child(2) .kpi-value');
    if (nnaCard && kpis.nna) {
        nnaCard.textContent = `$${kpis.nna.toLocaleString()}M`;
    }
    
    // Update client count
    const clientCard = document.querySelector('.kpi-card:nth-child(3) .kpi-value');
    if (clientCard && kpis.clientCount) {
        clientCard.textContent = kpis.clientCount.toString();
    }
    
    // Update portfolio return
    const returnCard = document.querySelector('.kpi-card:nth-child(4) .kpi-value');
    if (returnCard && kpis.portfolioReturn) {
        returnCard.textContent = `+${kpis.portfolioReturn}%`;
    }
}

// Update task display with real data
function updateTaskDisplay(tasks) {
    const taskList = document.querySelector('.task-list');
    if (!taskList) return;
    
    // Clear existing tasks
    taskList.innerHTML = '';
    
    // Add tasks from AWS
    tasks.forEach((task, index) => {
        const taskItem = document.createElement('div');
        taskItem.className = 'task-item';
        taskItem.innerHTML = `
            <input type="checkbox" id="task-${task.taskId}" ${task.completed ? 'checked' : ''}>
            <label for="task-${task.taskId}">${task.taskText}</label>
            <span class="task-time">${new Date(task.createdAt).toLocaleTimeString()}</span>
        `;
        
        // Add event listener
        const checkbox = taskItem.querySelector('input[type="checkbox"]');
        checkbox.addEventListener('change', function() {
            handleTaskCompletion(this);
            // Update in AWS
            if (window.taskManager) {
                window.taskManager.updateTaskStatus(task.taskId, this.checked);
            }
        });
        
        taskList.appendChild(taskItem);
    });
}

// Update notification display with real data
function updateNotificationDisplay(notifications) {
    const notificationList = document.querySelector('.notifications-list');
    if (!notificationList) return;
    
    // Clear existing notifications
    notificationList.innerHTML = '';
    
    // Add notifications from AWS
    notifications.forEach(notification => {
        const notificationItem = document.createElement('div');
        notificationItem.className = 'notification-item';
        
        // Determine icon based on type
        let iconClass = 'system';
        let iconSymbol = 'fas fa-cog';
        
        if (notification.type === 'market' || notification.type === 'etf') {
            iconClass = 'market';
            iconSymbol = 'fas fa-chart-line';
        } else if (notification.type === 'client') {
            iconClass = 'client';
            iconSymbol = 'fas fa-user';
        }
        
        notificationItem.innerHTML = `
            <div class="notification-icon ${iconClass}">
                <i class="${iconSymbol}"></i>
            </div>
            <div class="notification-content">
                <div class="notification-title">${notification.type.charAt(0).toUpperCase() + notification.type.slice(1)}</div>
                <div class="notification-text">${notification.message}</div>
                <div class="notification-time">${new Date(notification.createdAt).toLocaleString()}</div>
            </div>
        `;
        
        notificationList.appendChild(notificationItem);
    });
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
        console.log(`IPS document generated for Client Name ${selectedClient.replace('client', '')}`);
        
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

// Add new task functionality
async function addNewTask() {
    const taskText = prompt('Enter new task:');
    if (taskText && taskText.trim()) {
        try {
            // Add task to AWS if available
            if (window.taskManager) {
                const success = await window.taskManager.addTask(taskText.trim());
                if (success) {
                    // Reload tasks from AWS
                    const tasks = await window.taskManager.fetchTasks();
                    if (tasks && tasks.length > 0) {
                        updateTaskDisplay(tasks);
                    }
                }
            } else {
                // Fallback to local storage
                const taskList = document.querySelector('.task-list');
                const taskCount = taskList.children.length;
                const newTaskId = `task${taskCount + 1}`;
                
                const newTask = document.createElement('div');
                newTask.className = 'task-item';
                newTask.innerHTML = `
                    <input type="checkbox" id="${newTaskId}">
                    <label for="${newTaskId}">${taskText.trim()}</label>
                    <span class="task-time">${getCurrentTime()}</span>
                `;
                
                // Add event listener for the new checkbox
                const checkbox = newTask.querySelector('input[type="checkbox"]');
                checkbox.addEventListener('change', function() {
                    handleTaskCompletion(this);
                });
                
                taskList.appendChild(newTask);
            }
            
            // Show success message
            showTaskAddedNotification();
        } catch (error) {
            console.error('Error adding task:', error);
            alert('Failed to add task. Please try again.');
        }
    }
}

function getCurrentTime() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes < 10 ? '0' + minutes : minutes;
    return `${displayHours}:${displayMinutes} ${ampm}`;
}

function showTaskAddedNotification() {
    // Create a temporary notification
    const notification = document.createElement('div');
    notification.className = 'notification success';
    notification.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>Task added successfully!</span>
    `;
    
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // Hide notification after 2 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 2000);
}

// Export functions for global access
window.openIPSGenerator = openIPSGenerator;
window.closeIPSModal = closeIPSModal;
window.generateIPS = generateIPS;
window.openClientModal = openClientModal;
window.openMeetingModal = openMeetingModal;
window.generateReport = generateReport;
window.scheduleMeeting = scheduleMeeting;
window.addNewTask = addNewTask;
