import React, { useEffect, useRef, useState } from 'react';
import { getUserData, updateUser, uploadImage } from './../Services/userService';  // Import the service
import './../Style/userpage.css';
import './../Services/userService';


function UserPage() {
    const [registrationStatus, setRegistrationStatus] = useState('');
    const [userData, setUserData] = useState<UserData>({
        fullName: '',
        username: '',
        emailAddress: '',
        birthDate: '',
        address: '',
        image: ''
    });
    const [editMode, setEditMode] = useState<EditMode>({
        fullName: false,
        userName: false,
        email: false,
        birthDate: false,
        address: false,
        profileImage: false
    });
    const [newImageFile, setNewImageFile] = useState<File | null>(null);
    const fullNameRef = useRef<HTMLInputElement>(null);
    const usernameRef = useRef<HTMLInputElement>(null);
    const emailRef = useRef<HTMLInputElement>(null);
    const birthDateRef = useRef<HTMLInputElement>(null);
    const addressRef = useRef<HTMLInputElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const data = await getUserData();
                setUserData({
                    fullName: data.fullName,
                    username: data.username,
                    emailAddress: data.emailAddress,
                    birthDate: data.birthDate,
                    address: data.address,
                    image: data.image
                });
            } catch (error) {
                if (error instanceof Error) {
                    console.error('An error occurred:', error.message);
                } else {
                    console.error('An unknown error occurred.');
                }
            }
        };

        fetchUserData();
    }, []);

    const validateInputs = () => {
        const { fullName, address, username, birthDate, emailAddress } = userData;

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
                fileInputRef.current?.click();
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

    const handleImageSource = (image: string) => {
        // Proveravamo da li string sadrži prefiks 'data:image'
        if (image.startsWith('http') || image.startsWith('https')) {
            return image; // Ako je URL, vrati ga direktno
        } else {
            // Ako je base64 string, dodajemo prefiks 'data:image/jpeg;base64,' ako ga nema
            return `data:image/jpeg;base64,${image}`;
        }
    };

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setNewImageFile(file);

            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = (reader.result as string).split(',')[1];
                setUserData(prevData => ({
                    ...prevData,
                    image: base64String
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSaveChanges = async () => {
        try {
            if (!validateInputs()) {
                return;
            } else {
                setRegistrationStatus('');
            }

            const updatedUserData = { ...userData };

            if (newImageFile) {
                const imageUrl = await uploadImage(newImageFile);
                updatedUserData.image = imageUrl;
            }

            await updateUser(updatedUserData);
            alert('Changes saved successfully.');
        } catch (error) {
            if (error instanceof Error) {
                console.error('An error occurred:', error.message);
                alert('An error occurred while saving changes.');
            } else {
                console.error('An unknown error occurred.');
            }
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
                <div>
                    <a href='/change-password'><u>Change password</u></a>
                </div>
                <div className="profile-image-container">
                    {userData.image && (
                            <img className="selected-image" src={handleImageSource(userData.image)} alt="Selected" />
                    )}
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="input-userpage"
                        style={{ display: 'none' }}
                        onChange={handleImageChange}
                        accept="image/*"
                    />
                    <button className="image-change-btn" onClick={() => handleEditClick('profileImage')}>Change profile image</button>
                </div>
                <div className="button-group">
                    <button type="button" className="btn-save" onClick={handleSaveChanges}>Save Changes</button>
                    <span className="status-message">{registrationStatus}</span>
                </div>
            </form>
        </div>
    );
}

export default UserPage;
