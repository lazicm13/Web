
import GoogleLogin, { GoogleLoginResponse, GoogleLoginResponseOffline } from 'react-google-login';

function Login()
{
    const responseGoogle = (response: GoogleLoginResponse | GoogleLoginResponseOffline) => {
        console.log(response);
    }; 

    return (
        <div className="login-container">
            <a id='home' href='/'>🏠</a>
            <p id="naslov">Welcome to Taxi Tracker</p>
            <h2>Sign in</h2>
            <br/>
            <form className="login-form">
                <input
                    className="input-login"
                    type="text"
                    name="email"
                    placeholder="Email"
                />
                <input
                    className="input-login"
                    type="password"
                    name="password"
                    placeholder="Password"
                />
            </form>
            <button id='loginBtn'>Sign in</button>
            <GoogleLogin
                clientId="your-client-id.apps.googleusercontent.com"
                buttonText="Prijava preko Google naloga"
                onSuccess={responseGoogle}
                onFailure={responseGoogle}
                cookiePolicy={'single_host_origin'}
                />
               <p>Don't have account? ⇒ <a href='/registration'>Sign in</a></p>
        </div>
    );
}

export default Login;