// src/components/Login.tsx

import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { CredentialResponse } from '@react-oauth/google';
import React, { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { checkLoginStatus, login } from  '../Services/loginService';

interface LoginData {
    emailAddress: string;
    password: string;
}

function Login() {

    const navigate = useNavigate();
    const [loginData, setLoginData] = useState<LoginData>({
        emailAddress: '',
        password: ''
    });
    const [error, setError] = useState<string>('');

    useEffect(() => {
        const verifyLoginStatus = async () => {
            try {
                const { isLoggedIn } = await checkLoginStatus();
                if (isLoggedIn) {
                    navigate('/'); // Adjust URL
                }
            } catch {
                console.log("User is not logged in!");
            }
        };

        verifyLoginStatus();
    }, [navigate]);

    const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
        const { name, value } = e.target;
        setLoginData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleLogin = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();
        setError(''); // Clear previous errors
        try {
            const data = await login(loginData);
            alert('Login successful!');
            if (data.redirectTo) {
                navigate(data.redirectTo);
            } else {
                navigate('/');
            }
        } catch (error) {
            console.error('Error during login:', error);
            if (error instanceof Error) {
                setError(error.message);
            } else {
                setError('An unexpected error occurred.');
            }
        }
    };

    const responseGoogle = (response: CredentialResponse) => {
        console.log(response);
    };

    return (
        <GoogleOAuthProvider clientId="your-client-id.apps.googleusercontent.com">
            <div className="login-container">
                <a id='home' href='/'>🏠</a>
                <p id="naslov">Welcome to Taxi Tracker</p>
                <h2>Sign in</h2>
                <br />
                <form className="login-form" onSubmit={handleLogin}>
                    <input
                        className="input-login"
                        type="text"
                        name="emailAddress"
                        value={loginData.emailAddress}
                        onChange={handleChange}
                        placeholder="Email"
                    />
                    <input
                        className="input-login"
                        type="password"
                        name="password"
                        value={loginData.password}
                        onChange={handleChange}
                        placeholder="Password"
                    />
                    <button id='loginBtn' type='submit'>Sign in</button>
                </form>
                {error && <p className="error-message">{error}</p>}
                {/* <GoogleLogin 
                    onSuccess={responseGoogle}
                    onError={() => {
                        console.log('Login Failed');
                    }}
                    containerProps={{
                        className: 'google-login-button', // Stilizacija putem CSS klase
                    }}
                /> */}
                <p>Don't have an account? ⇒ <a href='/registration'>Sign up</a></p>
            </div>
        </GoogleOAuthProvider>
    );
}

export default Login;
