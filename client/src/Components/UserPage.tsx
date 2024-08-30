import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './../Style/userpage.css';

interface UserData {
    fullName: string;
    username: string;
    emailAddress: string;
    birthDate: string;
    address: string;
}

interface EditMode {
    fullName: boolean;
    userName: boolean;
    email: boolean;
    birthDate: boolean;
    address: boolean;
}

function UserPage() {
    const [registrationStatus, setRegistrationStatus] = useState('');

    const [userData, setUserData] = useState<UserData>({
        fullName: '',
        username: '',
        emailAddress: '',
        birthDate: '',
        address: ''
    });

    const [editMode, setEditMode] = useState<EditMode>({
        fullName: false,
        userName: false,
        email: false,
        birthDate: false,
        address: false
    });

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await axios.get('http://localhost:8850/user/current', {
                    withCredentials: true
                });

                if (response.data) {
                    setUserData({
                        fullName: response.data.fullName,
                        username: response.data.username,
                        emailAddress: response.data.emailAddress,
                        birthDate: response.data.birthDate,
                        address: response.data.address
                    });
                }
            } catch (error) {
                console.error('Failed to fetch user data:', error);
            }
        };

        fetchUserData();
    }, []);

    const validateInputs = () => {
        const { fullName, address, username, birthDate, emailAddress} = userData;

        // Check if all required fields are filled
        if (!fullName || !address || !username || !emailAddress || !birthDate) {
            setRegistrationStatus('Please fill in all fields.');
            return false;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailAddress)) {
            setRegistrationStatus('Please enter a valid email address.');
            return false;
        }

        return true;
    };

    const handleEditClick = (field: keyof EditMode) => {
        setEditMode((prevEditMode) => ({
            ...prevEditMode,
            [field]: !prevEditMode[field]
        }));
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>, field: keyof UserData) => {
        setUserData({
            ...userData,
            [field]: e.target.value
        });
    };

    // Funkcija za čuvanje promena
    const handleSaveChanges = async () => {
        try {
            if (!validateInputs()) {
                return;
            }
            else{
                setRegistrationStatus('');
            }
            // Pozivamo API za čuvanje podataka korisnika
            const response = await axios.put('http://localhost:8850/user/update', userData, {
                withCredentials: true
            });

            if (response.status === 200) {
                alert('Changes saved successfully.');
                // Ako je potrebno, osveži podatke nakon čuvanja
            } else {
                alert('Failed to save changes.');
            }
        } catch (error) {
            console.error('Error saving changes:', error);
            alert('An error occurred while saving changes.');
        }
    };

    return (
        <div className="userpage-container">
            <a id='home' href='/'>🏠</a>
            <h2>User page</h2>
            <form className="userpage-form" onSubmit={(e) => e.preventDefault()}>
                <div className="input-group">
                    <input
                        className="input-userpage"
                        type="text"
                        name="fullName"
                        placeholder="Full name"
                        value={userData.fullName}
                        onChange={(e) => handleChange(e, 'fullName')}
                        readOnly={!editMode.fullName}
                    />
                    <span className="edit-icon" title='Edit full name' onClick={() => handleEditClick('fullName')}>✏️</span>
                </div>
                <div className="input-group">
                    <input
                        className="input-userpage"
                        type="text"
                        name="username"
                        placeholder="Username"
                        value={userData.username}
                        onChange={(e) => handleChange(e, 'username')}
                        readOnly={!editMode.userName}
                    />
                    <span className="edit-icon" title='Edit username' onClick={() => handleEditClick('userName')}>✏️</span>
                </div>
                <div className="input-group">
                    <input
                        className="input-userpage"
                        type="text"
                        name="emailAddress"
                        placeholder="E-mail"
                        value={userData.emailAddress}
                        onChange={(e) => handleChange(e, 'emailAddress')}
                        readOnly={!editMode.email}
                    />
                    <span className="edit-icon" title='Edit email' onClick={() => handleEditClick('email')}>✏️</span>
                </div>
                <div className="input-group">
                    <input
                        className="input-userpage"
                        type="date"
                        name="birthDate"
                        placeholder="Birth date"
                        value={userData.birthDate}
                        onChange={(e) => handleChange(e, 'birthDate')}
                        readOnly={!editMode.birthDate}
                    />
                    <span className="edit-icon" title='Edit birth date' onClick={() => handleEditClick('birthDate')}>✏️</span>
                </div>
                <div className="input-group">
                    <input
                        className="input-userpage"
                        type="text"
                        name="address"
                        placeholder="Address"
                        value={userData.address}
                        onChange={(e) => handleChange(e, 'address')}
                        readOnly={!editMode.address}
                    />
                    <span className="edit-icon" title="Edit address" onClick={() => handleEditClick('address')}>✏️</span>
                </div>
                <a href='/change-password'>Change password</a>
            </form>
            <div className="button-container">
                <button id="userpage-btn" onClick={handleSaveChanges}>Save changes</button>
            </div>
            <p className="errorMessage">{registrationStatus}</p>
        </div>
    );
}

export default UserPage;
