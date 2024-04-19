import './App.css';
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import Registration from './Components/Registration';
import HomePage from './Components/Home';
import Login from './Components/Login';
import UserPage from './Components/UserPage';
import './Style/registration.css';

function App() {

  return (
    <Router>
      <Routes>
        <Route path='/' element={<HomePage/>}/>
        <Route path='/registration' element={<Registration/>}/>
        <Route path='/login' element={<Login/>}/>
        <Route path='/user-page' element={<UserPage/>}/>
      </Routes>
    </Router>
  )
}

export default App
