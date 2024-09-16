import axios from "axios";
import { useNavigate } from "react-router-dom";

interface RideData {
    startAddress: string;
    endAddress: string;
    distance: number;
    price: number;
    waitingTime: string;
}

interface NewRideProps {
    rideData: RideData; 
    onWithdraw: () => void; // Add this prop
}

function NewRide({ rideData, onWithdraw }: NewRideProps) {
    const navigate = useNavigate();
    if (!rideData) {
        return <p>No ride data available</p>;
    }

    console.log('Ride data in NewRide:', rideData);

    const distance = typeof rideData.distance === 'number' ? rideData.distance : 0;
    const price = typeof rideData.price === 'number' ? rideData.price : 0;

    const handleConfirmClick = async () => {
        if (!rideData) {
            console.error("No ride data available to save.");
            return;
        }
    
        try {
            const response = await axios.post('http://localhost:8149/api/ride/save', {
                StartAddress: rideData.startAddress,
                EndAddress: rideData.endAddress,
                Distance: rideData.distance,
                Price: rideData.price,
                WaitingTime: rideData.waitingTime
            }, { withCredentials: true });
    
            if (response.status === 200) {
                console.log('Ride data saved successfully:', response.data);
                alert('Ride data saved successfully!');
                navigate('ride-page');
            } else {
                console.error('Failed to save ride data. Status:', response.status);
            }
            
        } catch (error) {
            console.error('Failed to save ride:', error);
        }
    };

    return (
        <div className="form-container">
            <h2>New Ride Details</h2>
            <div className="form-group">
                <label>{rideData.startAddress || 'N/A'} ⇒ {rideData.endAddress || 'N/A'}</label>
                <label></label>
            </div>
            <div className="form-group">
                <label>Distance: {distance.toFixed(2)} km</label>
            </div>
            <div className="form-group">
                <label>Expected Waiting Time: {rideData.waitingTime || 'N/A'} minutes</label>
            </div>
            <div className="form-group">
                <label>Price: {price.toFixed(2)} USD</label>
            </div>
            <div className="form-group">
                <button type="button" id="request-btn" onClick={onWithdraw}>
                    Withdraw
                </button>
                <button type="button" id="request-btn" onClick={handleConfirmClick}>
                    Confirm
                </button>
            </div>
        </div>
    );
}

export default NewRide;
    