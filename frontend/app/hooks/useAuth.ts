import { useEffect, useState } from 'react';
import { isAuthenticated, removeAuthToken, setAuthToken } from '../utils/auth';

export const useAuth = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        setIsLoggedIn(isAuthenticated());
    }, []);

    const login = async (email: string, passcode: string, full_name: string) => {
        try {
            const response = await fetch('/api/auth', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, passcode, full_name }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Login failed');
            }

            if (data.token) {
                // Store both token and user_id
                setAuthToken(data.token);
                localStorage.setItem('user_id', data.user_id);
                setIsLoggedIn(true);
                return { success: true };
            } else {
                throw new Error('No token received');
            }
        } catch (error) {
            console.error('Login error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Login failed'
            };
        }
    };

    const logout = () => {
        removeAuthToken();
        localStorage.removeItem('user_id');
        setIsLoggedIn(false);
    };

    return {
        isLoggedIn,
        login,
        logout,
    };
}; 