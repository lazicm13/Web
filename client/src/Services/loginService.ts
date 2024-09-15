// src/services/loginService.ts

import axios from 'axios';

interface ErrorResponse {
    message: string;
}

export const checkLoginStatus = async (): Promise<{ isLoggedIn: boolean }> => {
    try {
        const response = await axios.get('http://localhost:8850/auth/login/status', { withCredentials: true });
        return { isLoggedIn: response.status === 200 }; // Ako je 200, korisnik je ulogovan
    } catch (error) {
        console.error('Failed to check login status:', error);
        return { isLoggedIn: false }; // U slučaju greške, korisnik nije prijavljen
    }
};


export const login = async (loginData: { emailAddress: string; password: string }): Promise<{ redirectTo?: string }> => {
    try {
        const response = await axios.post('http://localhost:8850/auth/login', loginData, { withCredentials: true });
        return response.data;
    } catch (error) {
        console.error('Login failed:', error);

        // Type guard for axios error
        if (axios.isAxiosError(error)) {
            const errorResponse: ErrorResponse = error.response?.data || { message: 'An error occurred during login.' };
            throw new Error(errorResponse.message);
        } else {
            throw new Error('An unexpected error occurred.');
        }
    }
};
