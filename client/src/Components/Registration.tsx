
function Registration(){

    return(
        <div className="registration-container">
            <p id="naslov">Welcome to Taxi Tracker</p>
            <h2>Sign Up</h2>
            <form className="registration-form">
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

            </form>
        </div>
    );
}

export default Registration;