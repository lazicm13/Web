// src/services/registrationService.ts

interface RegistrationData {
    Username: string;
    EmailAddress: string;
    Password: string;
    FullName: string;
    Address: string;
    BirthDate: string;
    Image: string;
    UserType: 'User' | 'Driver';
}

interface RegistrationResponse {
    message: string;
}

export const validateRegistrationData = (data: RegistrationData, confirmPassword: string): string | null => {
    const { FullName, Address, Username, EmailAddress, Password, Image } = data;

    if (!FullName || !Address || !Username || !EmailAddress || !Password || !confirmPassword || !Image) {
        return 'Please fill in all fields.';
    }

    if (Password !== confirmPassword) {
        return 'Passwords do not match.';
    }

    const passwordRegex = /^(?=.*\d).{8,}$/;
    if (!passwordRegex.test(Password)) {
        return 'Password must be at least 8 characters long and contain at least one number.';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(EmailAddress)) {
        return 'Please enter a valid email address.';
    }

    return null;
};

export const register = async (registrationData: RegistrationData): Promise<RegistrationResponse> => {
    try {
        const response = await fetch('http://localhost:8850/auth/registration/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(registrationData),
            credentials: 'include'
        });

        if (response.ok) {
            return await response.json();
        } else {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Registration failed');
        }
    } catch (error) {
        console.error('Request failed', error);
        throw error;
    }
};
