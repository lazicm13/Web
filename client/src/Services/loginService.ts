// src/services/authService.ts

interface LoginData {
    emailAddress: string;
    password: string;
}

interface LoginStatusResponse {
    isLoggedIn: boolean;
}

interface LoginResponse {
    redirectTo?: string;
    message?: string;
}

export const checkLoginStatus = async (): Promise<LoginStatusResponse> => {
    try {
        const response = await fetch('http://localhost:8850/auth/login/status', {
            method: 'GET',
            credentials: 'include', // Obezbeđuje slanje kolačića u zahtevima
        });

        if (response.ok) {
            return await response.json();
        } else {
            throw new Error('Failed to fetch login status');
        }
    } catch (error) {
        console.error('Failed to check login status:', error);
        throw error;
    }
};

export const login = async (loginData: LoginData): Promise<LoginResponse> => {
    try {
        const response = await fetch('http://localhost:8850/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(loginData),
            credentials: 'include',
        });

        if (response.ok) {
            return await response.json();
        } else {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Login failed');
        }
    } catch (error) {
        console.error('Request failed', error);
        throw error;
    }
};
