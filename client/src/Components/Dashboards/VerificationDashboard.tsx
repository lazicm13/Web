import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../Style/ride.css';
import axios from 'axios';

function VerificationPage() {
    const [status, setStatus] = useState('loading'); // Initial status
    const navigate = useNavigate(); // Hook to navigate

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const response = await fetch('http://localhost:8850/user/driver-status', {
                    method: 'GET',
                    credentials: 'include', 
                }); 
                const data = await response.json();
                setStatus(data.status); 
                if(data.status === 'Rejected')
                    handleLogout();
            } catch (error) {
                console.error('Error fetching status:', error);
            }
        };

        fetchStatus(); // Initial fetch

        const intervalId = setInterval(fetchStatus, 5000); // Fetch status every 5 seconds

        return () => clearInterval(intervalId); // Cleanup on component unmount
    }, []);

    const handleLogout = async () => {
        try {
            await axios.post('http://localhost:8850/auth/login/logout', {}, { withCredentials: true });
            alert('Your application is rejected!');
            navigate('/login');
        } catch (error) {
            console.error('Logout failed', error);
        }
    };

    // Effect to redirect after the status is "Verified"
    useEffect(() => {
        if (status === 'Verified') {
            alert('Congratulations! You are verified!');
            const timer = setTimeout(() => {
                navigate('/');
            }, 3000); 

            return () => clearTimeout(timer); // Cleanup the timer if component unmounts
        }
    }, [status, navigate]);

    const renderStatusMessage = () => {
        switch (status) {
            case 'Created':
                return <div><h2>Your application is being processed.</h2></div>;
            case 'Verified':
                return <div><h2>Congratulations! Your application has been accepted.</h2></div>;
            case 'Rejected':
                return <div><h2>Your application has been rejected.</h2></div>;
            default:
                return <div><h2>Loading...</h2></div>;
        }
    };

    return (
        <div>
            <div className="car-container">
                <div className="car"></div>
            </div>
            <div className="status-message">
                {renderStatusMessage()}
            </div>
        </div>
    );
}

export default VerificationPage;
