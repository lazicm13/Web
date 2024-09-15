import { Link } from 'react-router-dom';
import UserDashboard from './Dashboards/UserDashboard';
import DriverDashboard from './Dashboards/DriverDashboard';
import AdminDashboard from './Dashboards/AdminDashboard';
import { useState, useEffect } from 'react';
import axios from 'axios';

function HomePage() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userRole, setUserRole] = useState(''); // State to track user role

    useEffect(() => {
        const checkAuthStatus = async () => {
            try {
                const response = await axios.get('http://localhost:8850/auth/login/status', { withCredentials: true });
                if (response.status === 200 && response.data.isLoggedIn) {
                    setIsAuthenticated(true);
                    setUserRole(response.data.role); // Set user role from response
                }
            } catch (error) {
                setIsAuthenticated(false);
                setUserRole(''); // Reset role if unauthenticated
            }
        };

        checkAuthStatus();
    }, []);

    const handleLogout = async () => {
        try {
            await axios.post('http://localhost:8850/auth/login/logout', {}, { withCredentials: true });
            setIsAuthenticated(false);
            setUserRole('');
            alert('You are successfully logged out!');
        } catch (error) {
            console.error('Logout failed', error);
        }
    };

    const renderDashboard = () => {
        switch (userRole) {
            case 'Admin':
                return <AdminDashboard />;
            case 'Driver':
                return <DriverDashboard />;
            case 'User':
                return <UserDashboard />;
            default:
                return <p>Please log in to see your dashboard.</p>;
        }
    };

    return (
        <div className="home-container">
            <header className="home-header">
                <h1>Welcome to Taxi Tracker</h1>
                <nav>
                    {isAuthenticated ? (
                        <a onClick={handleLogout} className="nav-link">Logout</a>
                    ) : (
                        <>
                            <Link to="/login" className="nav-link">Login</Link>
                            <Link to="/registration" className="nav-link">Register</Link>
                        </>
                    )}
                    <Link to="/user-page" className="nav-link">User page</Link>
                </nav>
            </header>

            {/* Display the appropriate dashboard based on user role */}
            {isAuthenticated ? renderDashboard() : <p>Please log in to access the dashboard.</p>}

            <section className="home-info">
                <h2>About Our Service</h2>
                <p>
                    Taxi Tracker is your reliable partner for safe and efficient rides. Whether you're a user looking for a ride, a driver ready to offer your services, or an administrator managing the system, our platform has everything you need.
                </p>
            </section>

            <footer className="home-footer">
                <p>&copy; 2024 Taxi Tracker. All rights reserved.</p>
            </footer>
        </div>
    );
}

export default HomePage;
