import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './../Style/userpage.css';

function UserPage() {
    const [userData, setUserData] = useState({
        fullName: '',
        userName: '',
        email: '',
        birthDate: '',
        address: ''
    });

    useEffect(() => {
        // Funkcija za dobijanje podataka o korisniku
        const fetchUserData = async () => {
            try {
                const response = await axios.get('http://localhost:8850/user/current', {
                    withCredentials: true 
                });

                if (response.data) {
                    setUserData({
                        fullName: response.data.fullName,
                        userName: response.data.userName,
                        email: response.data.email,
                        birthDate: response.data.birthDate,
                        address: response.data.address
                    });
                }
            } catch (error) {
                console.error('Failed to fetch user data:', error);
            }
        };

        fetchUserData();
    }, []); // Prazan niz zavisnosti znači da se useEffect izvršava samo jednom nakon inicijalnog renderovanja

    return (
        <div className="userpage-container">
            <a id='home' href='/'>🏠</a>
            <h2>User page</h2>
            <form className="userpage-form">
                <div className="input-group">
                    <input
                        className="input-userpage"
                        type="text"
                        name="fullName"
                        placeholder="Full name"
                        value={userData.fullName}
                        readOnly
                    />
                    <span className="edit-icon" title='Edit full name'>✏️</span>
                </div>
                <div className="input-group">
                    <input
                        className="input-userpage"
                        type="text"
                        name="userName"
                        placeholder="Username"
                        value={userData.userName}
                        readOnly
                    />
                    <span className="edit-icon" title='Edit username'>✏️</span>
                </div>
                <div className="input-group">
                    <input
                        className="input-userpage"
                        type="text"
                        name="email"
                        placeholder="E-mail"
                        value={userData.email}
                        readOnly
                    />
                    <span className="edit-icon" title='Edit email'>✏️</span>
                </div>
                <div className="input-group">
                    <input
                        className="input-userpage"
                        type="date"
                        name="birthDate"
                        placeholder="Birth date"
                        value={userData.birthDate}
                        readOnly
                    />
                    <span className="edit-icon" title='Edit birth date'>✏️</span>
                </div>
                <div className="input-group">
                    <input
                        className="input-userpage"
                        type="text"
                        name="address"
                        placeholder="Address"
                        value={userData.address}
                        readOnly
                    />
                    <span className="edit-icon" title="Edit address">✏️</span>
                </div>
                <a href='/change-password'>Change password</a>
            </form>
            <div className="button-container">
                <button id="userpage-btn">Save changes</button>
            </div>
        </div>
    );
}

export default UserPage;
