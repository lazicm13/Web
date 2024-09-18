import { useState, useEffect } from 'react';
import axios from 'axios';
import RidePage from './../RidePage'; // Import RidePage
import NewRide from './../NewRide'; // Import NewRide

function UserDashboard() {
    const [showNewRide, setShowNewRide] = useState(false);
    const [showRidePage, setShowRidePage] = useState(false);
    const [startAddress, setStartAddress] = useState('');
    const [endAddress, setEndAddress] = useState('');
    const [rideData, setRideData] = useState(null);
    const [currentRide, setCurrentRide] = useState(null); // State for current ride

    useEffect(() => {
        const fetchCurrentRide = async () => {
            try {
                const response = await axios.get('http://localhost:8149/api/ride/current', { withCredentials: true });
                if (response.status === 200 && response.data && response.data.ride) {
                    const data = response.data.ride;
                    setCurrentRide(data);
                    setShowRidePage(true); // Prikazuje RidePage samo ako postoji aktivna vožnja
                    console.log("Ok result!");
                } 
            } catch (error) {
                if (axios.isAxiosError(error)) {
                    if (error.response && error.response.status === 404) {
                        setShowNewRide(false); // Ako je vožnja not found, prikaži formu za kreiranje nove vožnje
                    } else {
                        console.error('Error fetching current ride:', error.response?.status, error.message);
                        setShowNewRide(true); // U slučaju druge greške, prikaži formu za kreiranje nove vožnje
                    }
                } else {
                    console.error('Unknown error:', error);
                    setShowNewRide(true);
                }
            }
        };
    
        fetchCurrentRide();
    }, []);
    
    
    
    
    

    const handleRequestClick = async () => {
        try {
            const response = await axios.post('http://localhost:8149/api/ride/create', {
                startAddress,
                endAddress,
            }, { withCredentials: true });

            if (response.status === 200) {
                console.log('Received ride data:', response.data);
                setRideData(response.data);
                setShowNewRide(true);
            }
        } catch (error) {
            console.error('Error sending data to server:', error);
        }
    };

    const handleWithdraw = () => {
        setShowNewRide(false);
        setRideData(null);
    };

    const handleConfirmClick = () => {
        setShowNewRide(false);
        setShowRidePage(true);
    };

    return (
        <div className="form-container">
            {showRidePage ? (
                <RidePage />
            ) : showNewRide ? (
                rideData ? (
                    <NewRide rideData={rideData} onWithdraw={handleWithdraw} onConfirm={handleConfirmClick} />
                ) : (
                    <p>Loading ride data...</p>
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
