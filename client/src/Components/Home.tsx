import React from 'react';
import { Link } from 'react-router-dom';

function HomePage() {
    return (
        <div className="home-container">
            <header className="home-header">
                <h1>Welcome to Taxi Tracker</h1>
                <nav>
                    <Link to="/login" className="nav-link">Login</Link>
                    <Link to="/register" className="nav-link">Register</Link>
                </nav>
            </header>
            
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
