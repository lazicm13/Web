import React, { useEffect, useState } from 'react';
import './../../Style/dashboard.css'; // Importuj CSS fajl za stilizovanje

interface Ride {
  userId: string;
  startAddress: string;
  endAddress: string;
  price: number;
  distance: number;
}

function DriverDashboard() {
  const [rides, setRides] = useState<Ride[]>([]);

  useEffect(() => {
    const fetchRides = async () => {
      try {
        const response = await fetch('http://localhost:8149/api/driver/active-rides', {
          method: 'GET',
          credentials: 'include', // Include HttpOnly cookies in the request
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
  
    fetchRides();
  }, []);
  

  const acceptRide = async (rideId: string) => {
    try {
      const response = await fetch(`http://localhost:8149/api/driver/accept-ride/${rideId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include HttpOnly cookies in the request
      });
  
      if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(`Failed to accept ride: ${response.status} ${response.statusText} - ${errorMessage}`);
      }
  
      // Optionally, you can update the state to reflect the change
      setRides((prevRides) => prevRides.filter((ride) => ride.userId !== rideId));
    } catch (error) {
      console.error('Error accepting ride:', error);
    }
  };
  

  return (
    <div className="driver-dashboard">
      <h2 className="title">Available Rides</h2>
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
                  onClick={() => acceptRide(ride.userId)}
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
  );
}

export default DriverDashboard;
