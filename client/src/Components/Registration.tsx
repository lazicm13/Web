
function Registration(){
    return(
        <div className="login-container">
            <p id="naslov">Welcome to Taxi Tracker</p>
            <h2>Sign Up</h2>
            <form className="login-form">
                <input
                    className="input-login"
                    type="text"
                    name="fullName"
                    placeholder="Full name"
                />
                <input
                    className="input-login"
                    type="text"
                    name="userName"
                    placeholder="Username"
                />
                <input
                    className="input-login"
                    type="text"
                    name="email"
                    placeholder="E-mail"
                />
                <input
                    className="input-login"
                    type="date"
                    name="birthDate"
                    placeholder="Birth date"
                />
                <input
                    className="input-login"
                    type="text"
                    name="address"
                    placeholder="Address"
                />
                <input
                    className="input-login"
                    type="password"
                    name="password"
                    placeholder="Password"
                />
                <input
                    className="input-login"
                    type="password"
                    name="confirmPassword"
                    placeholder="Password confirm"
                />
            </form>
            <div className="button-container">
                <button id="login-btn">Sign up</button>
                <p>Have account? ⇒ <a href='/login'>Sign in</a></p>
            </div>
        </div>
    );
}

export default Registration;