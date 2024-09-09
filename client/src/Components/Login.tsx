import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { CredentialResponse } from '@react-oauth/google';
import React, { useState, ChangeEvent, FormEvent } from 'react';
import { useNavigate } from "react-router-dom";
import { useEffect } from 'react';

interface LoginData {
    emailAddress: string;
    password: string;
}


function Login() {

    const navigate = useNavigate();

    useEffect(() => {
        const checkLoginStatus = async () => {
            try {
                const response = await fetch('http://localhost:8850/auth/login/status', {
                    method: 'GET',
                    credentials: 'include', // Obezbeđuje slanje kolačića u zahtevima
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.isLoggedIn) {
                        navigate('/'); // Prilagodi URL
                    }
                    else
                        console.log("User is not logged in!");
                }
            } catch (error) {
                console.error('Failed to check login status:', error);
            }
        };

        checkLoginStatus();
    }, [navigate]);


    const [loginData, setLoginData] = useState<LoginData>({
        emailAddress: '',
        password: ''
    });

    const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
        const { name, value } = e.target;
        setLoginData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleLogin = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:8850/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(loginData),
                credentials: 'include',
            });

            console.log(loginData);

            if (response.ok) {
                alert('Login successful!');
                const data = await response.json();

                if (data.redirectTo) {
                    // Preusmerava korisnika na početnu stranicu
                    navigate(data.redirectTo);
                    return; 
                }
                console.log(data.message);
                navigate('/');
            }
            
            else {
                alert('Login failed!');
                const errorData = await response.json();
                console.error('Error:', errorData.message);
            }
        } catch (error) {
            console.error('Request failed', error);
            alert('An error occurred, please try again later!');
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
                <br/>
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
