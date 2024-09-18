import React, { useEffect, useState } from 'react';
import './../Style/ride.css'; // Import the CSS file for styling

interface Ride {
  userId: string;
  startAddress: string;
  endAddress: string;
  price: number;
  distance: number;
  waitingTime: string;
  driverStartTime: string;
  rideStartTime: string;
  rideEndTime: string;
  status: string; 
}

function RidePage() {
  const [ride, setRide] = useState<Ride | null>(null);
  const [status, setStatus] = useState<string>('Waiting for a driver...');
  const [countdownToDriverStart, setCountdownToDriverStart] = useState<number | null>(null);
  const [countdownToRideEnd, setCountdownToRideEnd] = useState<number | null>(null);

  // Fetch the ride details (run once on mount)
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
  
      const { ride: rideData } = await response.json(); 
      if (!rideData) {
        throw new Error('Ride data is missing from the response');
      }
      console.log(rideData);
      setRide(rideData);
      updateTimers(rideData); // Inicijalizujte tajmere
    } catch (error) {
      console.error('Error fetching ride details:', error);
    }
  };

  // Update countdown timers based on the ride data
  const updateTimers = (rideData: Ride) => {
    const now = Date.now();
    
    const driverStartTime = new Date(rideData.driverStartTime).getTime();
    const rideStartTime = new Date(rideData.rideStartTime).getTime();
    const rideEndTime = new Date(rideData.rideEndTime).getTime();

    // Tajmer za dolazak vozača
    if (driverStartTime > now) {
      setCountdownToDriverStart(Math.max(Math.floor((driverStartTime - now) / 1000), 0));
    }

    // Ako je vožnja počela, postavimo tajmer za kraj vožnje
    if (rideStartTime > now) {
      setCountdownToRideEnd(Math.max(Math.floor((rideStartTime - now) / 1000), 0));
    }
  };

  // Function to fetch the ride status (for interval)
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
      
      if (rideStatus === 'Active') {
        setStatus('Driver is on your way');
      } else if (rideStatus === 'InProgress') {
        setStatus('Ride is in progress!');
      } else if (rideStatus === 'Completed') {
        setStatus('Ride is completed!');
      } else if (rideStatus === 'WaitingForDriver') {
        setStatus('Waiting for driver to accept your ride!');
      }

      if (rideStatus === 'InProgress' && ride) {
        updateTimers(ride); // Update timers if the ride is in progress
      } else {
        setCountdownToDriverStart(null); // Reset countdown if not in progress
        setCountdownToRideEnd(null); // Reset countdown if not in progress
      }

    } catch (error) {
      console.error('Error fetching ride status:', error);
    }
  };

  // Fetch ride details once when the component mounts
  useEffect(() => {
    fetchRide();
    fetchRideStatus();
  }, []);

  // Set up the interval to fetch ride status every 5 seconds
  useEffect(() => {
    const intervalId = setInterval(fetchRideStatus, 5000); // Fetch status every 5 seconds
    return () => clearInterval(intervalId); // Clean up on unmount
  }, [ride]);

  // Tajmer za dolazak vozača
  useEffect(() => {
    const timerArrival = setInterval(() => {
      if (countdownToDriverStart !== null && countdownToDriverStart > 0) {
        setCountdownToDriverStart(prev => prev !== null ? Math.max(prev - 1, 0) : 0);
      } else if (countdownToDriverStart === 0 && countdownToRideEnd === null && ride) {
        // Kada vozač stigne, započinjemo odbrojavanje za vožnju
        const rideStartTime = new Date(ride.rideStartTime).getTime();
        const rideEndTime = new Date(ride.rideEndTime).getTime();
        const now = Date.now();
        setCountdownToRideEnd(Math.max(Math.floor((rideEndTime - now) / 1000), 0));
      }
    }, 1000);

    return () => clearInterval(timerArrival);
  }, [countdownToDriverStart, countdownToRideEnd, ride]);

  return (
    <div className="ride-container">
      <h2 className="title">Ride Status</h2>
      <h1 className="status-message">{status}</h1>
      {ride && (
        <div className="ride-details">
          <p><strong>Start Address:</strong> {ride.startAddress}</p>
          <p><strong>End Address:</strong> {ride.endAddress}</p>
          <p><strong>Price:</strong> ${ride.price ? ride.price.toFixed(2) : 'N/A'}</p>
          <p><strong>Distance:</strong> {ride.distance ? ride.distance.toFixed(2) : 'N/A'} km</p>
        </div>
      )}
      {countdownToDriverStart !== null && countdownToDriverStart > 0 && (
        <div className="countdown">
          <h3>Countdown to Driver Arrival:</h3>
          <p>{Math.floor(countdownToDriverStart / 60)}:{countdownToDriverStart % 60 < 10 ? `0${countdownToDriverStart % 60}` : countdownToDriverStart % 60}</p>
        </div>
      )}
      {countdownToRideEnd !== null && countdownToRideEnd > 0 && (
        <div className="countdown">
          <h3>Countdown to Ride End:</h3>
          <p>{Math.floor(countdownToRideEnd / 60)}:{countdownToRideEnd % 60 < 10 ? `0${countdownToRideEnd % 60}` : countdownToRideEnd % 60}</p>
        </div>
      )}
    </div>
  );
}

export default RidePage;
