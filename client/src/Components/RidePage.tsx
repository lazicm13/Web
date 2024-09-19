import React, { useEffect, useState } from 'react';
import './../Style/ride.css';
import { useNavigate } from 'react-router-dom';

interface Ride {
  id: string;
  userId: string;
  startAddress: string;
  endAddress: string;
  price: number;
  distance: number;
  waitingTime: string;
  rideStartTime: string;
  rideEndTime: string;
  status: string;
}

function RidePage() {
  const [ride, setRide] = useState<Ride | null>(null);
  const [status, setStatus] = useState<string>('Waiting for a driver...');
  const [countdownToRideStart, setCountdownToRideStart] = useState<number | null>(null);
  const [countdownToRideEnd, setCountdownToRideEnd] = useState<number | null>(null);
  const [rideHasStarted, setRideHasStarted] = useState<boolean>(false); // New state to track if the ride has started
  const navigate = useNavigate();
  localStorage.setItem('enter', 'false');

  const fetchRide = async () => {
    try {
      const response = await fetch(`http://localhost:8149/api/ride/ride-details`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(`Failed to fetch ride details: ${response.status} ${response.statusText} - ${errorMessage}`);
      }

      const { ride: rideData } = await response.json(); 
      if (!rideData) {
        console.log('Ride is completed!');
      }
      
      setRide(rideData);
      updateTimers(rideData); // Initialize timers
    } catch (error) {
      console.error('Error fetching ride details:', error);
    }
  };
  
  const updateTimers = (rideData: Ride) => {
    const now = Date.now();

    const rideStartTime = new Date(rideData.rideStartTime).getTime();
    const rideEndTime = new Date(rideData.rideEndTime).getTime();

    if (rideStartTime > now) {
      setCountdownToRideStart(Math.max(Math.floor((rideStartTime - now) / 1000), 0));
    } else {
      setCountdownToRideStart(0); 
    }

    if (rideStartTime > now) {
      setCountdownToRideEnd(Math.max(Math.floor((rideEndTime - rideStartTime) / 1000), 0));
    } else if (rideEndTime > now) {
      setCountdownToRideEnd(Math.max(Math.floor((rideEndTime - now) / 1000), 0));
    } else {
      setCountdownToRideEnd(0); 
    }

    localStorage.setItem('enter', 'true');
  }

  const handleRideStart = async () => {
    try {
      const response = await fetch('http://localhost:8149/api/ride/start-ride', {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        console.log('Ride has started.');
        fetchRideStatus();
      } else {
        console.error('Failed to mark the ride as started.');
      }
    } catch (error) {
      console.error('Error starting the ride:', error);
    }
  };

  const handleRideEnd = async () => {
    try {
      const response = await fetch('http://localhost:8149/api/ride/end-ride', {
        method: 'POST',
        credentials: 'include',
      });
      if (response.ok) {
        setStatus('Ride is completed.');
        setCountdownToRideEnd(null);
        setTimeout(() => {
          navigate('/driver-rating');
        }, 5000);
      } else {
        console.error('Failed to end the ride.');
      }
    } catch (error) {
      console.error('Error ending the ride:', error);
    }
  };

  const fetchRideStatus = async () => {
    try {
      const response = await fetch('http://localhost:8149/api/ride/ride-status', {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(`Failed to fetch ride status: ${response.status} ${response.statusText} - ${errorMessage}`);
      }

      const { status: rideStatus }: { status: string } = await response.json();
      console.log('fetch');
      setStatus(rideStatus === 'InProgress' ? 'Ride is in progress!' : 
               rideStatus === 'Completed' ? 'Ride is completed!' : 
               rideStatus === 'WaitingForDriver' ? 'Waiting for driver to accept your ride!' : status);

      console.log(rideStatus);

      if (rideStatus === 'InProgress' && ride) {
        updateTimers(ride);
      }
    } catch (error) {
      console.error('Error fetching ride status:', error);
    }
  };

  useEffect(() => {
    fetchRide();
    fetchRideStatus();
  }, []);

  useEffect(() => {
    const intervalId = setInterval(fetchRideStatus, 5000);
    return () => clearInterval(intervalId);
  }, [ride]);

  useEffect(() => {
    const timerRide = setInterval(() => {
      if (countdownToRideStart !== null && countdownToRideStart > 0) {
        setCountdownToRideStart(prev => prev !== null ? Math.max(prev - 1, 0) : 0);
      } else if (countdownToRideStart === 0 && countdownToRideEnd !== null && countdownToRideEnd > 0) {
        // Mark the ride as started
        handleRideStart();
        setRideHasStarted(true); 
        setCountdownToRideEnd(prev => prev !== null ? Math.max(prev - 1, 0) : 0);
      } else if (countdownToRideEnd === 0 && rideHasStarted) { // Ensure ride has started before calling handleRideEnd
        handleRideEnd();
      }
    }, 1000);
  
    return () => clearInterval(timerRide);
  }, [countdownToRideStart, countdownToRideEnd, rideHasStarted]); // Include rideHasStarted in dependencies

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  return (
    <div className="ride-container">
      <h2 className="title">Ride Status</h2>
      <h1 className="status-message">{status}</h1>
      {ride && (
        <div className="ride-details">
          <p><strong>Start Address:</strong> {ride.startAddress}</p>
          <p><strong>End Address:</strong> {ride.endAddress}</p>
          <p><strong>Price:</strong> ${ride.price.toFixed(2)}</p>
          <p><strong>Distance:</strong> {ride.distance.toFixed(2)} km</p>
          <p><strong>Waiting Time:</strong> {ride.waitingTime} minutes</p>
          <p><strong>Estimated Ride Duration:</strong> {ride.distance.toFixed(0)} minutes</p>
        </div>
      )}
      <div className="countdown-timers">
      <div className="car-container">
                <div className="car"></div>
            </div>
        {countdownToRideStart !== null && countdownToRideStart > 0 && (
          <h2>Ride starts in: {formatTime(countdownToRideStart)}</h2>
        )}
        {countdownToRideEnd !== null && countdownToRideEnd > 0 && (
          <h2>Ride ends in: {formatTime(countdownToRideEnd)}</h2>
        )}
          
        </div>
    </div>
  );
}

export default RidePage;
