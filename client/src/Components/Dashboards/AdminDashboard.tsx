import React, { useEffect, useState } from 'react';
import './../../Style/dashboard.css'; // Importuj CSS fajl za stilizovanje

interface Driver {
    fullName: string;
    username: string;
    emailAddress: string;
    birthDate: string;
    address: string;
    image: string;
}

function AdminDashboard() {
  const [drivers, setDrivers] = useState<Driver[]>([]);

  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        const response = await fetch('http://localhost:8850/user/new-drivers'); 
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

    fetchDrivers();
  }, []);

  const handleAccept = (emailAddress: string) => {
    console.log(`Accept driver with email: ${emailAddress}`);
    // Logika za prihvatanje vozača
  };

  const handleReject = (emailAddress: string) => {
    console.log(`Reject driver with email: ${emailAddress}`);
    // Logika za odbijanje vozača
  };

  const handleImageSource = (image: string) => {
    // Proveravamo da li string sadrži prefiks 'data:image'
    if (image.startsWith('http') || image.startsWith('https')) {
        return image; // Ako je URL, vrati ga direktno
    } else {
        // Ako je base64 string, dodajemo prefiks 'data:image/jpeg;base64,' ako ga nema
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
    </div>
  );
}

export default AdminDashboard;
