interface LoginResponse {
    token: string;
    user_id: string;
    email: string;
    full_name: string;
}

export const login = async (email: string, password: string): Promise<LoginResponse> => {
    try {
        const response = await fetch('https://api.cloud.storage.bakhrom.org/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
            throw new Error('Login failed');
        }

        const data = await response.json();

        // Save user data and token to localStorage
        localStorage.setItem('user', JSON.stringify({
            user_id: data.user_id,
            email: data.email,
            full_name: data.full_name,
            token: data.token,
        }));
        localStorage.setItem('token', data.token);

        return data;
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
};

export const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
};

export const getCurrentUser = () => {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
}; 