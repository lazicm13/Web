import React, { useEffect, useState } from 'react';
import './../../Style/dashboard.css'; // Importuj CSS fajl za stilizovanje
import { useNavigate } from 'react-router-dom';

interface Driver {
    fullName: string;
    username: string;
    emailAddress: string;
    birthDate: string;
    address: string;
    image: string;
    rating?: number; // Dodato polje za rating
}

interface Ride {
    rideId: string;
    userId: string;
    startAddress: string;
    endAddress: string;
    distance: number;
    price: number;
    status: string;
}
const statusMap: { [key: number]: string } = {
  0: 'Active',
  1: 'In Progress',
  2: 'Completed'
};

interface VerifiedDriver {
  fullName: string;
  username: string;
  emailAddress: string;
  birthDate: string;
  address: string;
  image: string;
  rating: number; // Dodato polje za rating
  isBlocked: boolean; // Dodato polje za blokiranje statusa
}

function AdminDashboard() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [verifiedDrivers, setVerifiedDrivers] = useState<VerifiedDriver[]>([]);
  const [rides, setRides] = useState<Ride[]>([]);
  const navigate = useNavigate();

  const getStatusText = (status: number) => {
    return statusMap[status] || 'Unknown';
  };

  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        const response = await fetch('http://localhost:8850/api/admin/new-drivers', {
          credentials: 'include',
        });
        if (!response.ok) {
          const errorMessage = await response.text();
          throw new Error(`Failed to fetch new drivers: ${response.status} ${response.statusText} - ${errorMessage}`);
        }
        const data: Driver[] = await response.json();
        setDrivers(data);
      } catch (error) {
        console.error('Error fetching new drivers:', error);
      }
    };

    const fetchVerifiedDrivers = async () => {
      try {
        const response = await fetch('http://localhost:8850/api/admin/verified-drivers', {
          credentials: 'include',
        });
        if (!response.ok) {
          const errorMessage = await response.text();
          throw new Error(`Failed to fetch verified drivers: ${response.status} ${response.statusText} - ${errorMessage}`);
        }
        const data: VerifiedDriver[] = await response.json();
        setVerifiedDrivers(data);
      } catch (error) {
        console.error('Error fetching verified drivers:', error);
      }
    };

    const fetchRides = async () => {
      try {
        const response = await fetch('http://localhost:8149/api/driver/all-rides', {
          credentials: 'include',
        });
        if (!response.ok) {
          const errorMessage = await response.text();
          throw new Error(`Failed to fetch rides: ${response.status} ${response.statusText} - ${errorMessage}`);
        }
        const data: Ride[] = await response.json();
        setRides(data);
      } catch (error) {
        console.error('Error fetching rides:', error);
      }
    };

    fetchDrivers();
    fetchVerifiedDrivers();
    fetchRides();
  }, []);

  const handleAccept = async (emailAddress: string) => {
    try {
      const response = await fetch(`http://localhost:8850/api/admin/accept-driver/${emailAddress}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ emailAddress }),
      });

      if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(`Failed to accept driver: ${response.status} ${response.statusText} - ${errorMessage}`);
      }

      console.log(`Driver with email: ${emailAddress} accepted successfully`);
      alert(`Driver with email: ${emailAddress} accepted successfully`);
      setDrivers((prevDrivers) => prevDrivers.filter(driver => driver.emailAddress !== emailAddress));
      navigate('/');

    } catch (error) {
      console.error('Error accepting driver:', error);
    }
  };

  const handleReject = async (emailAddress: string) => {
    try {
      const response = await fetch(`http://localhost:8850/api/admin/reject-driver/${emailAddress}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ emailAddress }),
      });

      if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(`Failed to reject driver: ${response.status} ${response.statusText} - ${errorMessage}`);
      }

      console.log(`Driver with email: ${emailAddress} rejected successfully`);
      alert(`Driver with email: ${emailAddress} rejected successfully`);
      setDrivers((prevDrivers) => prevDrivers.filter(driver => driver.emailAddress !== emailAddress));

    } catch (error) {
      console.error('Error rejecting driver:', error);
    }
  };

  const handleBlockToggle = async (emailAddress: string, isBlocked: boolean) => {
    try {
        const action = isBlocked ? 'unblock' : 'block';
        const response = await fetch(`http://localhost:8850/api/admin/${action}-driver/${emailAddress}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ emailAddress }),
        });

        if (!response.ok) {
            const errorMessage = await response.text();
            throw new Error(`Failed to ${action} driver: ${response.status} ${response.statusText} - ${errorMessage}`);
        }

        console.log(`Driver with email: ${emailAddress} ${isBlocked ? 'unblocked' : 'blocked'} successfully`);
        alert(`Driver with email: ${emailAddress} ${isBlocked ? 'unblocked' : 'blocked'} successfully`);
        setVerifiedDrivers((prevDrivers) =>
            prevDrivers.map(driver =>
                driver.emailAddress === emailAddress ? { ...driver, isBlocked: !isBlocked } : driver
            )
        );
    } catch (error) {
        console.error('Error blocking/unblocking driver:', error);
    }
};

  const handleImageSource = (image: string) => {
    if (image.startsWith('http') || image.startsWith('https')) {
        return image;
    } else {
        return `data:image/jpeg;base64,${image}`;
    }
  };

  return (
    <div className="admin-dashboard">
      <h2 className="title">Users to verify</h2>
      {drivers.length > 0 ? (
        <ul className="driver-list">
          {drivers.map((driver) => (
            <li key={driver.emailAddress} className="driver-item">
              <div className="driver-details">
                <p><strong>Email Address:</strong> {driver.emailAddress}</p>
                <p><strong>Name:</strong> {driver.fullName}</p>
                <p><strong>Username:</strong> {driver.username}</p>
                <p><strong>Birth Date:</strong> {driver.birthDate}</p>
                <p><strong>Address:</strong> {driver.address}</p>
                <p><strong>Rating:</strong> {driver.rating !== undefined ? driver.rating.toFixed(1) : 'Not Rated'}</p> {/* Dodato za rating */}
                {driver.image && (
                    <img className="selected-image" src={handleImageSource(driver.image)} alt="Driver" />
                )}
              </div>
              <div className="button-container">
                <button className='accept-btn' onClick={() => handleAccept(driver.emailAddress)}>Accept</button>
                <button className='reject-btn' onClick={() => handleReject(driver.emailAddress)}>Reject</button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="no-drivers">No new drivers to verify.</p>
      )}

      <h2 className="title">Verified Drivers</h2>
      {verifiedDrivers.length > 0 ? (
        <ul className="driver-list">
          {verifiedDrivers.map((driver) => (
            <li key={driver.emailAddress} className="driver-item">
              <div className="driver-details">
                <p><strong>Email Address:</strong> {driver.emailAddress}</p>
                <p><strong>Name:</strong> {driver.fullName}</p>
                <p><strong>Username:</strong> {driver.username}</p>
                <p><strong>Birth Date:</strong> {driver.birthDate}</p>
                <p><strong>Address:</strong> {driver.address}</p>
                <p><strong>Rating:</strong> {driver.rating?.toFixed(1)}</p> {/* Dodato za rating */}
                {driver.image && (
                    <img className="selected-image" src={handleImageSource(driver.image)} alt="Driver" />
                )}
              </div>
              <div className="button-container">
                <button className={`block-toggle-btn ${driver.isBlocked ? 'unblock' : 'block'}`} onClick={() => handleBlockToggle(driver.emailAddress, driver.isBlocked)}>
                  {driver.isBlocked ? 'Unblock' : 'Block'}
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="no-drivers">No verified drivers.</p>
      )}

      <h2 className="title">Rides</h2>
      {rides.length > 0 ? (
        <ul className="ride-list">
          {rides.map((ride) => (
            <li key={ride.rideId} className="ride-item">
              <p><strong>Ride ID:</strong> {ride.rideId}</p>
              <p><strong>User ID:</strong> {ride.userId}</p>
              <p><strong>Start Address:</strong> {ride.startAddress}</p>
              <p><strong>End Address:</strong> {ride.endAddress}</p>
              <p><strong>Price:</strong> {ride.price}</p>
              <p><strong>Distance:</strong> {ride.distance}</p>
              <p><strong>Status:</strong> {getStatusText(parseInt(ride.status))}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="no-rides">No rides available.</p>
      )}
    </div>
  );
}

export default AdminDashboard;
