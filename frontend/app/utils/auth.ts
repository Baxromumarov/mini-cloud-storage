// Token management utilities
export const AUTH_TOKEN_KEY = 'auth_token';

export const setAuthToken = (token: string) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem(AUTH_TOKEN_KEY, token);
    }
};

export const getAuthToken = () => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem(AUTH_TOKEN_KEY);
    }
    return null;
};

export const removeAuthToken = () => {
    if (typeof window !== 'undefined') {
        localStorage.removeItem(AUTH_TOKEN_KEY);
    }
};

export const isAuthenticated = () => {
    return !!getAuthToken();
};

// Helper function to add auth header to API requests
export const getAuthHeader = () => {
    const token = getAuthToken();
    return token ? { 'Authorization': `Bearer ${token}` } : {};
};