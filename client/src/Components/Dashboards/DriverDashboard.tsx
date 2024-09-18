import React, { useEffect, useState } from 'react';
import './../../Style/dashboard.css'; // Import CSS file for styling
import VerificationPage from './VerificationDashboard';

interface Ride {
  userId: string;
  startAddress: string;
  endAddress: string;
  price: number;
  distance: number;
}

function DriverDashboard() {
  const [rides, setRides] = useState<Ride[]>([]);
  const [status, setStatus] = useState<string | null>(null); // State for user status
  const [loading, setLoading] = useState<boolean>(true); // State to track loading status
  const [currentRide, setCurrentRide] = useState<Ride | null>(null); // State for the current ride

  // Fetch the user's status and rides
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch('http://localhost:8850/user/driver-status', {
          method: 'GET',
          credentials: 'include',
        });
        
        if (!response.ok) {
          const errorMessage = await response.text();
          throw new Error(`Failed to fetch status: ${response.status} ${response.statusText} - ${errorMessage}`);
        }
        
        const data = await response.json();
        setStatus(data.status);
        
        if (data.status === 'Rejected') {
          // Handle logout or redirect if the user is rejected
          window.location.href = '/login'; // Redirect to login page
        }
      } catch (error) {
        console.error('Error fetching status:', error);
      } finally {
        setLoading(false); // Set loading to false after fetching status
      }
    };

    fetchStatus(); // Initial fetch
    const intervalId = setInterval(fetchStatus, 5000); // Poll status every 5 seconds

    return () => clearInterval(intervalId); // Cleanup interval on component unmount
  }, []);

  useEffect(() => {
    const fetchRides = async () => {
      try {
        const response = await fetch('http://localhost:8149/api/driver/waiting-rides', {
          method: 'GET',
          credentials: 'include',
        });
        
        if (!response.ok) {
          const errorMessage = await response.text();
          throw new Error(`Failed to fetch active rides: ${response.status} ${response.statusText} - ${errorMessage}`);
        }
        
        const data: Ride[] = await response.json();
        setRides(data);
      } catch (error) {
        console.error('Error fetching rides:', error);
      }
    };

    fetchRides(); // Initial fetch for rides
  }, []);

  const acceptRide = async (ride: Ride) => {
    try {
      const response = await fetch(`http://localhost:8149/api/driver/accept-ride/${ride.userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(`Failed to accept ride: ${response.status} ${response.statusText} - ${errorMessage}`);
      }
      
      // Set current ride and remove it from the list
      setCurrentRide(ride);
      setRides((prevRides) => prevRides.filter((r) => r.userId !== ride.userId));
    } catch (error) {
      console.error('Error accepting ride:', error);
    }
  };

  if (loading) {
    return <div>Loading...</div>; // Show loading indicator while status is being fetched
  }

  if (status === 'Created') {
    return <VerificationPage/>;
  }

  return (
    <div className="driver-dashboard">
      <h2 className="title">Available Rides</h2>
      {currentRide ? (
        <div className="ride-details">
          <h3>Current Ride Details</h3>
          <p><strong>User ID:</strong> {currentRide.userId}</p>
          <p><strong>From:</strong> {currentRide.startAddress || 'N/A'}</p>
          <p><strong>To:</strong> {currentRide.endAddress || 'N/A'}</p>
          <p><strong>Price:</strong> ${currentRide.price.toFixed(2)}</p>
          <p><strong>Distance:</strong> {currentRide.distance.toFixed(2)} km</p>
          {/* Optionally, add additional details and functionality here */}
        </div>
      ) : (
        <div>
          {rides.length > 0 ? (
            <div className="ride-list">
              {rides.map((ride) => (
                <div key={ride.userId} className="ride-card">
                  <div className="ride-info">
                    <p><strong>User ID:</strong> {ride.userId}</p>
                    <p><strong>From:</strong> {ride.startAddress || 'N/A'}</p>
                    <p><strong>To:</strong> {ride.endAddress || 'N/A'}</p>
                    <p><strong>Price:</strong> ${ride.price.toFixed(2)}</p>
                    <p><strong>Distance:</strong> {ride.distance.toFixed(2)} km</p>
                  </div>
                  <div className="ride-actions">
                    <button 
                      className='accept-btn' 
                      onClick={() => acceptRide(ride)}
                    >
                      Accept ride
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-rides">No active rides available.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default DriverDashboard;
