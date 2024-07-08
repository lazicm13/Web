import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { CredentialResponse } from '@react-oauth/google';

function Login() {
    const responseGoogle = (response: CredentialResponse) => {
        console.log(response);
    };

    return (
        <GoogleOAuthProvider clientId="your-client-id.apps.googleusercontent.com">
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
                    onSuccess={responseGoogle}
                    onError={() => {
                        console.log('Login Failed');
                    }}
                    containerProps={{
                        className: 'google-login-button', // Stilizacija putem CSS klase
                    }}
                />
                <p>Don't have an account? ⇒ <a href='/registration'>Sign up</a></p>
            </div>
        </GoogleOAuthProvider>
    );
}

export default Login;
