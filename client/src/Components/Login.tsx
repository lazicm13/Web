import './../Style/registration.css';

function Login()
{
    return (
        <div className="login-container">
            <p id="naslov">Welcome to Taxi Tracker</p>
            <h2>Login</h2>
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
            <button id='loginBtn'>Login</button>
            <p>Don't have account? ⇒ <a href='/registration'>Sign up</a></p>
        </div>
    );
}

export default Login;