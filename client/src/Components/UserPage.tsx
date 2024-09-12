import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import './../Style/userpage.css';

interface UserData {
    fullName: string;
    username: string;
    emailAddress: string;
    birthDate: string;
    address: string;
    image: string;  // New field for profile image URL
}

interface EditMode {
    fullName: boolean;
    userName: boolean;
    email: boolean;
    birthDate: boolean;
    address: boolean;
    profileImage: boolean;  // New field for profile image edit mode
}

function UserPage() {
    const [registrationStatus, setRegistrationStatus] = useState('');

    const [userData, setUserData] = useState<UserData>({
        fullName: '',
        username: '',
        emailAddress: '',
        birthDate: '',
        address: '',
        image: '' // Initialize profile image URL
    });

    const [editMode, setEditMode] = useState<EditMode>({
        fullName: false,
        userName: false,
        email: false,
        birthDate: false,
        address: false,
        profileImage: false // Initialize profile image edit mode
    });

    const fullNameRef = useRef<HTMLInputElement>(null);
    const usernameRef = useRef<HTMLInputElement>(null);
    const emailRef = useRef<HTMLInputElement>(null);
    const birthDateRef = useRef<HTMLInputElement>(null);
    const addressRef = useRef<HTMLInputElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null); // Ref for image upload input

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
                        address: response.data.address,
                        image: response.data.image // Fetch profile image URL
                    });
                }
            } catch (error) {
                console.error('Failed to fetch user data:', error);
            }
        };

        fetchUserData();
    }, []);

    const validateInputs = () => {
        const { fullName, address, username, birthDate, emailAddress } = userData;

        // Check if all required fields are filled
        if (!fullName || !address || !username || !emailAddress || !birthDate) {
            setRegistrationStatus('Please fill in all fields.');
            return false;
        }
        
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

        // Focus on the corresponding input field when edit mode is activated
        switch (field) {
            case 'fullName':
                fullNameRef.current?.focus();
                break;
            case 'userName':
                usernameRef.current?.focus();
                break;
            case 'email':
                emailRef.current?.focus();
                break;
            case 'birthDate':
                birthDateRef.current?.focus();
                break;
            case 'address':
                addressRef.current?.focus();
                break;
            case 'profileImage':
                fileInputRef.current?.click(); // Trigger file input click when editing profile image
                break;
            default:
                break;
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>, field: keyof UserData) => {
        setUserData({
            ...userData,
            [field]: e.target.value
        });
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('image', file);

        try {
            // Upload the image to the server
            const response = await axios.post('http://localhost:8850/user/upload-image', formData, {
                withCredentials: true,
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (response.data.imageUrl) {
                // Update the profile image URL in the state
                setUserData((prevData) => ({
                    ...prevData,
                    image: response.data.imageUrl
                }));
                alert('Profile image updated successfully.');
            }
        } catch (error) {
            console.error('Error uploading image:', error);
            alert('Failed to upload image.');
        }
    };

    const handleSaveChanges = async () => {
        try {
            if (!validateInputs()) {
                return;
            } else {
                setRegistrationStatus('');
            }
            // Save user data through the API
            const response = await axios.put('http://localhost:8850/user/update', userData, {
                withCredentials: true
            });

            if (response.status === 200) {
                alert('Changes saved successfully.');
                // Refresh data if needed after saving
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
                        ref={fullNameRef}
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
                        ref={usernameRef}
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
                        ref={emailRef}
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
                        ref={birthDateRef}
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
                        ref={addressRef}
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
                {/* Display profile image */}
                <div className="profile-image-container">
                    <img
                        src={userData.image} 
                        alt="Profile"
                        className="profile-image"
                    />
                    <button type="button" onClick={() => handleEditClick('profileImage')}>
                        Change Profile Image
                    </button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        style={{ display: 'none' }}
                        accept="image/*"
                        onChange={handleImageUpload}
                    />
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
