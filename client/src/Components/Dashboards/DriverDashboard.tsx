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
        const response = await fetch('http://localhost:8149/api/driver/active-rides'); // Update the URL as needed
        if (!response.ok) {
          const errorMessage = await response.text(); // Dobijanje teksta greške iz odgovora
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

  return (
    <div className="driver-dashboard">
      <h2 className="title">Available Rides</h2>
      {rides.length > 0 ? (
        <ul className="ride-list">
          {rides.map((ride) => (
            <li key={ride.userId} className="ride-item">
              <div className="ride-details">
                <p><strong>User ID:</strong> {ride.userId}</p>
                <label>{ride.startAddress || 'N/A'} ⇒ {ride.endAddress || 'N/A'}</label>
                <p><strong>Price:</strong> ${ride.price.toFixed(2)}</p>
                <p><strong>Distance:</strong> {ride.distance.toFixed(2)} km</p>
              </div>
              <div className="button-container">
                <button className='accept-btn'>Accept ride</button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="no-rides">No active rides available.</p>
      )}
    </div>
  );
}

export default DriverDashboard;
