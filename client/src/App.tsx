import './App.css';
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import Registration from './Components/Registration';
import HomePage from './Components/Home';
import Login from './Components/Login';
import ChangePassword from './Components/ChangePassword';
import UserPage from './Components/UserPage';
import './Style/registration.css';
import './Style/homepage.css';
import RidePage from './Components/RidePage';


function App() {

  return (
    <Router>
      <Routes>
        <Route path='/' element={<HomePage/>}/>
        <Route path='/registration' element={<Registration/>}/>
        <Route path='/login' element={<Login/>}/>
        <Route path='/user-page/' element={<UserPage/>}/>
        <Route path='/change-password' element={<ChangePassword/>}/>
      </Routes>
    </Router>
  )
}

export default App
