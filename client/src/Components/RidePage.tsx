import React, { useEffect, useState } from 'react';
import './../Style/ride.css'; // Import the CSS file for styling

interface Ride {
  userId: string;
  startAddress: string;
  endAddress: string;
  price: number;
  distance: number;
  status: string; // Status is now a string
  waitingTime: number; // Time remaining in minutes
}

function RidePage() {
  const [ride, setRide] = useState<Ride | null>(null);
  const [status, setStatus] = useState<string>('Waiting for a driver...');
  const [countdown, setCountdown] = useState<number | null>(null);

  // Function to fetch the ride details
  const fetchRide = async () => {
    try {
      const response = await fetch('http://localhost:8149/api/ride/ride-details', {
        method: 'GET',
        credentials: 'include', // Include HttpOnly cookies with the request
      });

      if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(`Failed to fetch ride details: ${response.status} ${response.statusText} - ${errorMessage}`);
      }

      const rideData: Ride = await response.json();
      setRide(rideData); // Set the ride details
    } catch (error) {
      console.error('Error fetching ride details:', error);
    }
  };

  // Function to fetch the ride status
  const fetchRideStatus = async () => {
    try {
      const response = await fetch('http://localhost:8149/api/ride/ride-status', {
        method: 'GET',
        credentials: 'include', // Include HttpOnly cookies with the request
      });

      if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(`Failed to fetch ride status: ${response.status} ${response.statusText} - ${errorMessage}`);
      }

      const { status: rideStatus }: { status: string } = await response.json();
      setStatus(rideStatus === 'InProgress' ? 'Your ride is in progress!' : 'Waiting for a driver...');
      
      if (rideStatus === 'InProgress' && ride) {
        setCountdown(ride.waitingTime * 60); // Convert minutes to seconds
      } else {
        setCountdown(null); // Reset countdown if not in progress
      }

    } catch (error) {
      console.error('Error fetching ride status:', error);
    }
  };

  useEffect(() => {
    // Fetch ride details initially
    fetchRide();
    
    // Fetch ride status every 5 seconds
    const intervalId = setInterval(fetchRideStatus, 5000);

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    // Handle countdown timer
    let timer: number | null = null;
    if (countdown !== null && countdown > 0) {
      timer = window.setInterval(() => {
        setCountdown(prev => prev !== null ? Math.max(prev - 1, 0) : 0);
      }, 1000);
    }

    return () => {
      if (timer !== null) clearInterval(timer);
    };
  }, [countdown]);

  return (
    <div className="ride-container">
      <h2 className="title">Ride Status</h2>
      <p className="status-message">{status}</p>
      {ride && (
        <div className="ride-details">
          <p><strong>Start Address:</strong> {ride.startAddress}</p>
          <p><strong>End Address:</strong> {ride.endAddress}</p>
          {/* Safely check if price and distance are defined before calling .toFixed() */}
          <p><strong>Price:</strong> ${ride.price ? ride.price.toFixed(2) : 'N/A'}</p>
          <p><strong>Distance:</strong> {ride.distance ? ride.distance.toFixed(2) : 'N/A'} km</p>
          <p><strong>Expected waiting time:</strong> {ride.waitingTime} minutes</p>
        </div>
      )}
      {status === 'Your ride is in progress!' && countdown !== null && (
        <div className="countdown">
          <h3>Countdown:</h3>
          <p>{Math.floor(countdown / 60)}:{countdown % 60 < 10 ? `0${countdown % 60}` : countdown % 60}</p>
        </div>
      )}
      <div className="car-container">
  <div className="car"></div>
    </div>

    </div>
  );
}

export default RidePage;
