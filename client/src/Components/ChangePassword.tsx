import React, { useState } from 'react';
import axios from 'axios';
import './../Style/userpage.css';
import { useNavigate } from "react-router-dom";


function ChangePassword() {
    const navigate = useNavigate();

    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [statusMessage, setStatusMessage] = useState('');

    const Validate = () =>{

        const passwordRegex = /^(?=.*\d).{8,}$/;
        if (!passwordRegex.test(newPassword)) {
            setStatusMessage('Password must be at least 8 characters long and contain at least one number.');
            return false;
        }
        return true;
    }
    const handlePasswordChange = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        
        // Validation checks
        if (!oldPassword || !newPassword || !confirmPassword) {
            setStatusMessage('Please fill in all fields.');
            return;
        }
    
        if (newPassword !== confirmPassword) {
            setStatusMessage('New passwords do not match.');
            return;
        }
    
        if (newPassword.length < 8) {
            setStatusMessage('New password must be at least 8 characters long.');
            return;
        }
    
        if (!Validate()) {
            return;
        }
    
        try {
            // API call to change password
            const response = await axios.put(
                'http://localhost:8850/user/change-password',
                {
                    oldPassword,
                    newPassword,
                },
                {
                    withCredentials: true,
                }
            );
    
            if (response.status === 200) {
                setStatusMessage('Password changed successfully.');
                setOldPassword('');
                setNewPassword('');
                setConfirmPassword('');
                alert('Password changed successfully.');
                navigate('/user-page');
            } else {
                setStatusMessage('Failed to change password');
            }
        } catch (error: any) {
            // Check if the error contains a response and display the error message from the server
            if (error.response && error.response.data && error.response.data.message) {
                setStatusMessage(error.response.data.message); // Display the error message from the server
            } else {
                setStatusMessage('An error occurred while changing the password.');
            }
        }
    };
    

    return (
        <div className="userpage-container">
            <a id='home' href='/'>🏠</a>
            <h2>Change password</h2>
            <form className="userpage-form" onSubmit={(e) => e.preventDefault()}>
                <div className="input-group">
                    <input
                        className="input-userpage"
                        type="password"
                        name="oldPassword"
                        placeholder="Enter old password"
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                    />
                </div>
                <hr />
                <div className="input-group">
                    <input
                        className="input-userpage"
                        type="password"
                        name="newPassword"
                        placeholder="New password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                    />
                </div>
                <div className="input-group">
                    <input
                        className="input-userpage"
                        type="password"
                        name="confirmPassword"
                        placeholder="Confirm new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                </div>
                <div className="button-container">
                    <button id="userpage-btn" onClick={handlePasswordChange}>Confirm password</button>
                </div>
                <p className="status-message">{statusMessage}</p>
            </form>
        </div>
    );
}

export default ChangePassword;
