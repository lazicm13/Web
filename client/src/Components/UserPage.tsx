import './../Style/userpage.css'

function UserPage(){

    return(
        <div className="userpage-container">
    <h2>User page</h2>
    <form className="userpage-form">
        <div className="input-group">
            <input
                className="input-userpage"
                type="text"
                name="fullName"
                placeholder="Full name"
                readOnly
            />
            <span className="edit-icon" title='Edit full name'>✏️</span>
        </div>
        <div className="input-group">
            <input
                className="input-userpage"
                type="text"
                name="userName"
                placeholder="Username"
                readOnly
            />
            <span className="edit-icon" title='Edit username'>✏️</span>
        </div>
        <div className="input-group">
            <input
                className="input-userpage"
                type="text"
                name="email"
                placeholder="E-mail"
                readOnly
            />
            <span className="edit-icon" title='Edit email'>✏️</span>
        </div>
        <div className="input-group">
            <input
                className="input-userpage"
                type="date"
                name="birthDate"
                placeholder="Birth date"
                readOnly
            />
            <span className="edit-icon" title='Edit birth date'>✏️</span>
        </div>
        <div className="input-group">
            <input
                className="input-userpage"
                type="text"
                name="address"
                placeholder="Address"
                readOnly
            />
            <span className="edit-icon" title="Edit address">✏️</span>
        </div>
        <a>Change password</a>
    </form>
    <div className="button-container">
        <button id="userpage-btn">Save changes</button>
    </div>
</div>
    );
}

export default UserPage;