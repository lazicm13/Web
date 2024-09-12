import { useState } from 'react';
import axios from 'axios';
import NewRide from './../NewRide'; // Assuming NewRide is in the same directory

function UserDashboard() {
    const [showNewRide, setShowNewRide] = useState(false);
    const [startAddress, setStartAddress] = useState('');
    const [endAddress, setEndAddress] = useState('');
    const [rideData, setRideData] = useState(null);

    const handleRequestClick = async () => {
        try {
            // Send the start and end addresses to the server
            const response = await axios.post('http://localhost:8149/api/ride/create', {
                startAddress,
                endAddress,
            }, { withCredentials: true });

            if (response.status === 200) {
                console.log('Received ride data:', response.data); // Log the response data
                // Set the ride data and show the NewRide form
                setRideData(response.data);
                setShowNewRide(true);
            }
        } catch (error) {
            console.error('Error sending data to server:', error);
        }
    };

    return (
        <div className="form-container">
            {showNewRide ? (
                rideData ? (
                    <NewRide rideData={rideData} />
                ) : (
                    <p>Loading ride data...</p> // Handle the case where rideData is null
                )
            ) : (
                <>
                    <h2>Create new ride</h2>
                    <form id="rideForm" onSubmit={(e) => e.preventDefault()}>
                        <div className="form-group">
                            <label>Start Address:</label>
                            <input
                                type="text"
                                id="startAddress"
                                name="startAddress"
                                value={startAddress}
                                onChange={(e) => setStartAddress(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>End Address:</label>
                            <input
                                type="text"
                                id="endAddress"
                                name="endAddress"
                                value={endAddress}
                                onChange={(e) => setEndAddress(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <button type="button" id="request-btn" onClick={handleRequestClick}>
                                Request
                            </button>
                        </div>
                    </form>
                </>
            )}
        </div>
    );
}

export default UserDashboard;
