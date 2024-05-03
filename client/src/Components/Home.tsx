import './../Style/homepage.css';
import { useNavigate } from 'react-router-dom';

function HomePage()
{
  const navigate = useNavigate();

  const handleSignIn = () => {
    navigate('/login');
  }

  const handleSignUp = () => {
    navigate('/registration');
  }

  const handleUserPage = () => {
    navigate('/user-page');
  }

    return(
      <div>
        <div className="button-container">
          <button onClick={handleSignIn}>Sign in</button>
          <button onClick={handleSignUp}>Sign up</button>
          <button onClick={handleUserPage}>User page</button>
        </div>
        <h1>Home page</h1>
      </div>  
    );
}

export default HomePage;