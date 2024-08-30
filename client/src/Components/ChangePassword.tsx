import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './../Style/userpage.css';


function ChangePassword() {
    
    const HandlePasswordChange = () => {

    }

    return (
        <div className="userpage-container">
            <a id='home' href='/'>🏠</a>
            <h2>Change password</h2>
            <form className="userpage-form">
                <div className="input-group">
                    <input
                        className="input-userpage"
                        type="password"
                        name="oldPassword"
                        placeholder="Enter old password"
                    />
                </div>
                <hr></hr>
                <div className="input-group">
                    <input
                        className="input-userpage"
                        type="password"
                        name="newPassword"
                        placeholder="New password"
                    />
                </div>
                <div className="input-group">
                    <input
                        className="input-userpage"
                        type="password"
                        name="confirmPassword"
                        placeholder="Confirm new password"
                    />
                </div>
                <div className="button-container">
                <button id="userpage-btn" onClick={HandlePasswordChange}>Confirm password</button>
            </div>
            </form>
        </div>
    );
}

export default ChangePassword;
