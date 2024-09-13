// src/components/Registration.tsx

import React, { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { validateRegistrationData, register } from '../Services/registrationService';

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

function Registration() {
    const [registrationData, setRegistrationData] = useState<RegistrationData>({
        Username: '',
        EmailAddress: '',
        Password: '',
        FullName: '',
        Address: '',
        BirthDate: '',
        Image: '', // Initialize with an empty string
        UserType: 'User'
    });

    const [confirmPassword, setConfirmPassword] = useState('');
    const [registrationStatus, setRegistrationStatus] = useState('');
    const navigate = useNavigate();

    const handleUserTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setRegistrationData(prevData => ({
            ...prevData,
            UserType: e.target.value as 'User' | 'Driver'
        }));
    };

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = (reader.result as string).split(',')[1];
                console.log('Base64 String:', base64String); // Check the output here
                setRegistrationData(prevData => ({
                    ...prevData,
                    Image: base64String
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setRegistrationData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setConfirmPassword(e.target.value);
    };

    const handleRegistration = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        const validationError = validateRegistrationData(registrationData, confirmPassword);
        if (validationError) {
            setRegistrationStatus(validationError);
            return;
        }

        try {
            await register(registrationData);
            alert('Registration successful!');
            navigate('/login');
        } catch (error) {
            setRegistrationStatus('An error occurred, please try again later!');
        }
    };

    return (
        <div className="login-container">
            <a id='home' href='/'>🏠</a>
            <p id="naslov">Welcome to Taxi Tracker</p>
            <h2>Sign Up</h2>
            <form className="login-form" onSubmit={handleRegistration}>
                <input
                    className="input-login"
                    type="text"
                    name="FullName"
                    placeholder="Full name"
                    value={registrationData.FullName}
                    onChange={handleInputChange}
                />
                <input
                    className="input-login"
                    type="text"
                    name="Username"
                    placeholder="Username"
                    value={registrationData.Username}
                    onChange={handleInputChange}
                />
                <input
                    className="input-login"
                    type="text"
                    name="EmailAddress"
                    placeholder="E-mail"
                    value={registrationData.EmailAddress}
                    onChange={handleInputChange}
                />
                <input
                    className="input-login"
                    type="date"
                    name="BirthDate"
                    placeholder="Birth Date"
                    value={registrationData.BirthDate}
                    onChange={handleInputChange}
                />
                <input
                    className="input-login"
                    type="text"
                    name="Address"
                    placeholder="Address"
                    value={registrationData.Address}
                    onChange={handleInputChange}
                />
                <input
                    className="input-login"
                    type="password"
                    name="Password"
                    placeholder="Password"
                    value={registrationData.Password}
                    onChange={handleInputChange}
                />
                <input
                    className="input-login"
                    type="password"
                    name="ConfirmPassword"
                    placeholder="Password confirm"
                    value={confirmPassword}
                    onChange={handleConfirmPasswordChange}
                />
                <div className="form-group">
                    <label>Select User Type:</label>
                    <select id="userType" name="UserType" value={registrationData.UserType} onChange={handleUserTypeChange}>
                        <option value="User">Regular User</option>
                        <option value="Driver">Driver</option>
                    </select>
                </div>
                <div className="image">
                    <label htmlFor="file-input" className="file-input-btn">Choose Image</label>
                    <input
                        id="file-input"
                        className="input-login"
                        type="file"
                        accept="image/*"
                        name="Image"
                        onChange={handleImageChange}
                    />
                    {registrationData.Image && (
                        <div className="selected-image">
                            <img src={`data:image/jpeg;base64,${registrationData.Image}`} alt="Selected" />
                        </div>
                    )}
                </div>
                <button id="login-btn" type="submit">Sign up</button>
            </form>
            <p>Have an account? ⇒ <a href='/login'>Sign in</a></p>
            <p className="errorMessage">{registrationStatus}</p>
        </div>
    );
}

export default Registration;
