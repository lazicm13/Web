import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface RegistrationData {
    Username: string;
    EmailAddress: string;
    Password: string;
    FullName: string;
    Address: string;
}

function Registration() {
    const [registrationData, setRegistrationData] = useState<RegistrationData>({
        Username: '',
        EmailAddress: '',
        Password: '',
        FullName: '',
        Address: '',    
    });

    // const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    //     const file = event.target.files?.[0];
    //     if (file) {
    //         const reader = new FileReader();
    //         reader.onloadend = () => {
    //             setRegistrationData({ ...registrationData, imgSource: reader.result as string });
    //         };
    //         reader.readAsDataURL(file);
    //     }
    // };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setRegistrationData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const navigate = useNavigate();
    const [registrationStatus, setRegistrationStatus] = useState('');

    const validateInputs = () => {
        const { FullName, Address, Username, EmailAddress, Password } = registrationData;

        if (!FullName || !Address || !Username  || !EmailAddress || !Password) {
            setRegistrationStatus('Please fill in all fields.');
            return false;
        }

        return true;
    };

    // const handleRegistration = async () => {
    //     if (!validateInputs()) {
    //         return;
    //     }

    
    //     const formData = new FormData();
    //     formData.append('username', registrationData.username);
    //     formData.append('emailAddress', registrationData.emailAddress);
    //     formData.append('password', registrationData.password);
    //     formData.append('fullName', registrationData.fullName);
    //     formData.append('address', registrationData.address);
    //     // if (registrationData.imgSource) {
    //     //     formData.append('imgSource', registrationData.imgSource);
    //     // }
    
    //     try {
    //         const response = await fetch('http://localhost:8850/auth/registration', {
    //             method: 'POST',
    //             body: formData,
    //             credentials: 'include',
    //         });
    
    //         console.log('Sending registration data:', registrationData);
    //         const data = await response.json();
    
    //         if (response.ok) {
    //             console.log('Registration successful: ', data.message);
    //             navigate('/login');
    //         } else {
    //             console.error('Registration failed: ', data.message);
    //             setRegistrationStatus(data.message || 'Registration failed.');
    //         }
    //     } catch (error) {
    //         console.error('Error during registration: ', error);
    //         setRegistrationStatus('An error occurred during registration.');
    //     }
    // };

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
            });
            
            console.log('Sending registration data:', registrationData);

            if (response.ok) {
                alert('Registration successfull!');
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
            alert('An error occured, please try again later!');
        }
    }

    return (
        <div className="login-container">
            <a id='home' href='/'>🏠</a>
            <p id="naslov">Welcome to Taxi Tracker</p>
            <h2>Sign Up</h2>
            <form className="login-form">
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
                />
                <div className="image">
                    <label htmlFor="file-input" className="file-input-btn">Choose Image</label>
                    <input
                        id="file-input"
                        className="input-login"
                        type="file"
                        accept="image/*"
                        name="imgSource"
                        // onChange={handleImageChange}
                    />
                    {/* {registrationData.imgSource && (
                        <div className="selected-image">
                            <img src={registrationData.imgSource} alt="Selected" />
                        </div>
                    )} */}
                </div>
            </form>
            <button id="login-btn" onClick={handleRegistration}>Sign up</button>
            <p>Have an account? ⇒ <a href='/login'>Sign in</a></p>
            <p className="errorMessage">{registrationStatus}</p>
        </div>
    );
}

export default Registration;
