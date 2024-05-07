import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface RegistrationData{
    username: string;
    email: string;
    password: string;
    fullName: string;
    birthDate: string;
    address: string;
    userType: string;
    imgSource: string;
}

function Registration(){
    const[registrationData, setRegistrationData] = useState<RegistrationData>({
        username: '',
        email: '',
        password: '',
        fullName: '',
        birthDate: '',
        address: '',
        userType: '',
        imgSource: '',
        });

        

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if(file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setRegistrationData({...registrationData, imgSource: reader.result as string});
            };
            reader.readAsDataURL(file);
        }
    }
    
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
        const { fullName, address, username , birthDate, imgSource,  email, password } = registrationData;

        if (!fullName || !address || !username || !imgSource || !email || !password) {
            setRegistrationStatus('Please fill in all fields.');
            return false;
        }

        return true;
    }

    const handleRegistration = async () =>{
        // if(!validateInputs()){
        //     return;
        // }
        
        try{
            const response = await fetch('http://localhost:8260/auth/registration', {
                method: 'POST',
                headers:{
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(registrationData),
            });

            const data = await response.json();

            if(response.ok)
            {
                console.log('Registration successful: ', data.message);
                navigate('/login');
            }    
        }catch(error)
        {
            console.error('Error during registration: ', error);
        }
    }

    return(
        <div className="login-container">
            <a id='home' href='/'>🏠</a>
            <p id="naslov">Welcome to Taxi Tracker</p>
            <h2>Sign Up</h2>
            <form className="login-form">
                <input
                    className="input-login"
                    type="text"
                    name="fullName"
                    placeholder="Full name"
                    value={registrationData.fullName}
                    onChange={handleInputChange}
                />
                <input
                    className="input-login"
                    type="text"
                    name="username"
                    placeholder="Username"
                    value={registrationData.username}
                    onChange={handleInputChange}
                />
                <input
                    className="input-login"
                    type="text"
                    name="email"
                    placeholder="E-mail"
                    value={registrationData.email}
                    onChange={handleInputChange}
                />
                <input
                    className="input-login"
                    type="date"
                    name="birthDate"
                    placeholder="Birth date"
                    value={registrationData.birthDate}
                    onChange={handleInputChange}
                />
                <input
                    className="input-login"
                    type="text"
                    name="address"
                    placeholder="Address"
                    value={registrationData.address}
                    onChange={handleInputChange}
                />
                <input
                    className="input-login"
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={registrationData.password}
                    onChange={handleInputChange}
                    />
                <input
                    className="input-login"
                    type="password"
                    name="confirmPassword"
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
                        onChange={handleImageChange}
                    />
                    {registrationData.imgSource && (
                        <div className="selected-image">
                            <img src={registrationData.imgSource} alt="Selected"/>
                        </div>
                    )}
                </div>
            </form>
            <button id="login-btn" onClick={handleRegistration}>Sign up</button>
            <p>Have account? ⇒ <a href='/login'>Sign in</a></p>
            <p> {registrationStatus}</p>
        </div>
    );
}

export default Registration;