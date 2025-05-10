// Check if user is authenticated
const isAuthenticated = () => {
    return localStorage.getItem('token') !== null;
};

// Get authentication token
const getToken = () => {
    return localStorage.getItem('token');
};

// Set authentication token
const setToken = (token) => {
    localStorage.setItem('token', token);
};

// Remove authentication token
const removeToken = () => {
    localStorage.removeItem('token');
};

// Add authentication header to fetch requests
const authHeader = () => {
    const token = getToken();
    return token ? { 'x-auth-token': token } : {};
};

// Check if user has specific role
const hasRole = (role) => {
    const user = JSON.parse(localStorage.getItem('user'));
    return user && user.role === role;
};

// Redirect to login if not authenticated
const requireAuth = () => {
    if (!isAuthenticated()) {
        window.location.href = '/login.html';
        return false;
    }
    return true;
};

// Redirect to appropriate dashboard based on role
const redirectToDashboard = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
        switch (user.role) {
            case 'doctor':
                window.location.href = '/doctor-dashboard.html';
                break;
            case 'patient':
                window.location.href = '/patient-dashboard.html';
                break;
            case 'admin':
                window.location.href = '/admin-dashboard.html';
                break;
            default:
                window.location.href = '/index.html';
        }
    }
};

// Export functions
export {
    isAuthenticated,
    getToken,
    setToken,
    removeToken,
    authHeader,
    hasRole,
    requireAuth,
    redirectToDashboard
}; 