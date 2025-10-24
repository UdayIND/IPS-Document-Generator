// AWS Cognito Authentication for Financial Advisor Dashboard
// This file handles user authentication using AWS Cognito

// Cognito Configuration
const COGNITO_CONFIG = {
    region: 'us-east-1',
    userPoolId: 'us-east-1_ywI4VrKqE',
    userPoolWebClientId: '684uk209no17b3j89bl6m4rod8',
    domain: 'https://ips-document-generator.vercel.app', // Your Vercel domain
    redirectSignIn: 'https://ips-document-generator.vercel.app',
    redirectSignOut: 'https://ips-document-generator.vercel.app',
    responseType: 'code',
    scope: ['openid', 'email', 'profile', 'phone']
};

// Initialize Cognito
let cognitoUser = null;
let userSession = null;

// Initialize AWS Cognito
function initializeCognito() {
    try {
        // Configure AWS Cognito
        AWS.config.region = COGNITO_CONFIG.region;
        
        // Initialize Cognito User Pool
        const userPool = new AWS.CognitoIdentityServiceProvider.CognitoUserPool({
            UserPoolId: COGNITO_CONFIG.userPoolId,
            ClientId: COGNITO_CONFIG.userPoolWebClientId
        });
        
        // Store user pool globally
        window.userPool = userPool;
        
        console.log('✅ AWS Cognito initialized successfully');
        return true;
    } catch (error) {
        console.error('❌ Error initializing Cognito:', error);
        return false;
    }
}

// Check if user is authenticated
function isAuthenticated() {
    return cognitoUser !== null && userSession !== null && userSession.isValid();
}

// Get current user
function getCurrentUser() {
    if (window.userPool) {
        return window.userPool.getCurrentUser();
    }
    return null;
}

// Sign in user
function signIn(username, password) {
    return new Promise((resolve, reject) => {
        if (!window.userPool) {
            reject(new Error('User pool not initialized'));
            return;
        }
        
        const authenticationData = {
            Username: username,
            Password: password
        };
        
        const authenticationDetails = new AWS.CognitoIdentityServiceProvider.AuthenticationDetails(authenticationData);
        
        const userData = {
            Username: username,
            Pool: window.userPool
        };
        
        cognitoUser = new AWS.CognitoIdentityServiceProvider.CognitoUser(userData);
        
        cognitoUser.authenticateUser(authenticationDetails, {
            onSuccess: (result) => {
                userSession = result;
                console.log('✅ User signed in successfully');
                updateUIForAuthenticatedUser();
                resolve(result);
            },
            onFailure: (err) => {
                console.error('❌ Sign in failed:', err);
                reject(err);
            },
            newPasswordRequired: (userAttributes, requiredAttributes) => {
                // Handle new password required
                console.log('New password required');
                reject(new Error('New password required'));
            }
        });
    });
}

// Sign out user
function signOut() {
    if (cognitoUser) {
        cognitoUser.signOut();
        cognitoUser = null;
        userSession = null;
        updateUIForUnauthenticatedUser();
        console.log('✅ User signed out successfully');
    }
}

// Get user attributes
function getUserAttributes() {
    return new Promise((resolve, reject) => {
        if (!cognitoUser) {
            reject(new Error('No authenticated user'));
            return;
        }
        
        cognitoUser.getUserAttributes((err, result) => {
            if (err) {
                reject(err);
            } else {
                const attributes = {};
                result.forEach(attribute => {
                    attributes[attribute.getName()] = attribute.getValue();
                });
                resolve(attributes);
            }
        });
    });
}

// Update UI for authenticated user
function updateUIForAuthenticatedUser() {
    // Hide login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.style.display = 'none';
    }
    
    // Show dashboard
    const dashboard = document.getElementById('dashboard');
    if (dashboard) {
        dashboard.style.display = 'block';
    }
    
    // Update user profile in navbar
    const userProfile = document.querySelector('.user-profile span');
    if (userProfile) {
        userProfile.textContent = 'Steve Seid (Authenticated)';
    }
    
    // Add logout button
    const navActions = document.querySelector('.nav-actions');
    if (navActions && !document.getElementById('logoutBtn')) {
        const logoutBtn = document.createElement('button');
        logoutBtn.id = 'logoutBtn';
        logoutBtn.className = 'btn-secondary';
        logoutBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i> Logout';
        logoutBtn.onclick = signOut;
        navActions.insertBefore(logoutBtn, navActions.firstChild);
    }
}

// Update UI for unauthenticated user
function updateUIForUnauthenticatedUser() {
    // Show login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.style.display = 'block';
    }
    
    // Hide dashboard
    const dashboard = document.getElementById('dashboard');
    if (dashboard) {
        dashboard.style.display = 'none';
    }
    
    // Remove logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.remove();
    }
}

// Create login form
function createLoginForm() {
    const loginHTML = `
        <div id="loginForm" class="login-container" style="display: none;">
            <div class="login-card">
                <div class="login-header">
                    <h2><i class="fas fa-chart-line"></i> Financial Advisor Dashboard</h2>
                    <p>Sign in to access your dashboard</p>
                </div>
                <form id="loginFormElement" class="login-form">
                    <div class="form-group">
                        <label for="username">Username or Email</label>
                        <input type="text" id="username" name="username" required>
                    </div>
                    <div class="form-group">
                        <label for="password">Password</label>
                        <input type="password" id="password" name="password" required>
                    </div>
                    <button type="submit" class="btn-primary login-btn">
                        <i class="fas fa-sign-in-alt"></i> Sign In
                    </button>
                </form>
                <div class="login-footer">
                    <p>Secure access to your financial advisor dashboard</p>
                </div>
            </div>
        </div>
    `;
    
    // Insert login form before dashboard
    const dashboard = document.getElementById('dashboard');
    if (dashboard) {
        dashboard.insertAdjacentHTML('beforebegin', loginHTML);
    }
}

// Add login form styles
function addLoginStyles() {
    const styles = `
        <style>
        .login-container {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
        }
        
        .login-card {
            background: white;
            padding: 2rem;
            border-radius: 1rem;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
            width: 100%;
            max-width: 400px;
            text-align: center;
        }
        
        .login-header h2 {
            color: #1e40af;
            margin-bottom: 0.5rem;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
        }
        
        .login-header p {
            color: #64748b;
            margin-bottom: 2rem;
        }
        
        .form-group {
            margin-bottom: 1.5rem;
            text-align: left;
        }
        
        .form-group label {
            display: block;
            margin-bottom: 0.5rem;
            font-weight: 500;
            color: #374151;
        }
        
        .form-group input {
            width: 100%;
            padding: 0.75rem;
            border: 1px solid #d1d5db;
            border-radius: 0.5rem;
            font-size: 1rem;
            transition: border-color 0.2s ease;
        }
        
        .form-group input:focus {
            outline: none;
            border-color: #1e40af;
            box-shadow: 0 0 0 3px rgba(30, 64, 175, 0.1);
        }
        
        .login-btn {
            width: 100%;
            padding: 0.75rem;
            font-size: 1rem;
            margin-bottom: 1rem;
        }
        
        .login-footer p {
            color: #94a3b8;
            font-size: 0.9rem;
        }
        
        .error-message {
            background: #fef2f2;
            color: #dc2626;
            padding: 0.75rem;
            border-radius: 0.5rem;
            margin-bottom: 1rem;
            border: 1px solid #fecaca;
        }
        </style>
    `;
    
    document.head.insertAdjacentHTML('beforeend', styles);
}

// Initialize authentication
function initializeAuth() {
    // Add login styles
    addLoginStyles();
    
    // Create login form
    createLoginForm();
    
    // Initialize Cognito
    if (initializeCognito()) {
        // Check if user is already authenticated
        const currentUser = getCurrentUser();
        if (currentUser) {
            currentUser.getSession((err, session) => {
                if (err) {
                    console.log('No valid session found');
                    updateUIForUnauthenticatedUser();
                } else {
                    userSession = session;
                    cognitoUser = currentUser;
                    updateUIForAuthenticatedUser();
                }
            });
        } else {
            updateUIForUnauthenticatedUser();
        }
        
        // Add login form event listener
        const loginForm = document.getElementById('loginFormElement');
        if (loginForm) {
            loginForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const username = document.getElementById('username').value;
                const password = document.getElementById('password').value;
                
                try {
                    await signIn(username, password);
                } catch (error) {
                    // Show error message
                    const errorDiv = document.createElement('div');
                    errorDiv.className = 'error-message';
                    errorDiv.textContent = error.message || 'Login failed. Please try again.';
                    
                    const form = document.getElementById('loginFormElement');
                    form.insertBefore(errorDiv, form.firstChild);
                    
                    // Remove error message after 5 seconds
                    setTimeout(() => {
                        if (errorDiv.parentNode) {
                            errorDiv.parentNode.removeChild(errorDiv);
                        }
                    }, 5000);
                }
            });
        }
    }
}

// Export functions for global access
window.initializeAuth = initializeAuth;
window.signIn = signIn;
window.signOut = signOut;
window.isAuthenticated = isAuthenticated;
window.getUserAttributes = getUserAttributes;
