import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface RegistrationData {
    Username: string;
    EmailAddress: string;
    Password: string;
    FullName: string;
    Address: string;
    BirthDate: string;
    Image: string; // Removed the question mark to make it required
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

    const handleUserTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setRegistrationData(prevData => ({
            ...prevData,
            UserType: e.target.value as 'User' | 'Driver'
        }));
    };

    // Separate state variable for ConfirmPassword
    const [confirmPassword, setConfirmPassword] = useState('');

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
            [name]: value,
        }));
    };

    const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setConfirmPassword(e.target.value);
    };

    const navigate = useNavigate();
    const [registrationStatus, setRegistrationStatus] = useState('');

    const validateInputs = () => {
        const { FullName, Address, Username, EmailAddress, Password, Image } = registrationData;

        // Check if all required fields are filled
        if (!FullName || !Address || !Username || !EmailAddress || !Password || !confirmPassword || !Image) {
            setRegistrationStatus('Please fill in all fields.');
            return false;
        }

        // Check if passwords match
        if (Password !== confirmPassword) {
            setRegistrationStatus('Passwords do not match.');
            return false;
        }

        // Check if password has at least 8 characters and includes at least one number
        const passwordRegex = /^(?=.*\d).{8,}$/;
        if (!passwordRegex.test(Password)) {
            setRegistrationStatus('Password must be at least 8 characters long and contain at least one number.');
            return false;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(EmailAddress)) {
            setRegistrationStatus('Please enter a valid email address.');
            return false;
        }

        return true;
    };

    async function handleRegistration() {
        try {
            if (!validateInputs()) {
                return;
            }
            const response = await fetch('http://localhost:8850/auth/registration/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(registrationData),
                credentials: 'include' // Include credentials (cookies) in the request
            });
            
            console.log('Sending registration data:', registrationData);

            if (response.ok) {
                alert('Registration successful!');
                const data = await response.json();
                console.log(data.message);
                navigate('/login');
            } else {
                alert('Registration failed!');
                const errorData = await response.json();
                console.error('Error:', errorData.message);
            }
        } catch (error) {
            console.error('Request failed', error);
            alert('An error occurred, please try again later!');
        }
    }

    return (
        <div className="login-container">
            <a id='home' href='/'>🏠</a>
            <p id="naslov">Welcome to Taxi Tracker</p>
            <h2>Sign Up</h2>
            <form className="login-form" onSubmit={(e) => { e.preventDefault(); handleRegistration(); }}>
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
                    <select id="userType" name="userType" value={registrationData.UserType} onChange={handleUserTypeChange}>
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
