import axios from "axios";

interface RideData {
    startAddress: string;
    endAddress: string;
    distance: number;
    price: number;
    waitingTime: string;
}

interface NewRideProps {
    rideData: RideData; 
}

function NewRide({ rideData }: NewRideProps) {
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
                startAddress: rideData.startAddress,
                endAddress: rideData.endAddress,
                distance: rideData.distance,
                price: rideData.price,
                waitingTime: rideData.waitingTime
            }, { withCredentials: true });
    
            if (response.status === 200) {
                console.log('Ride data saved successfully:', response.data);
                // Optionally, provide feedback to the user
                alert('Ride data saved successfully!');
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
                <label>Start Address:</label>
                <p>{rideData.startAddress || 'N/A'}</p> 
            </div>
            <div className="form-group">
                <label>End Address:</label>
                <p>{rideData.endAddress || 'N/A'}</p>
            </div>
            <div className="form-group">
                <label>Distance:</label>
                <p>{distance.toFixed(2)} km</p>
            </div>
            <div className="form-group">
                <label>Expected Waiting Time:</label>
                <p>{rideData.waitingTime || 'N/A'} minutes</p>
            </div>
            <div className="form-group">
                <label>Price:</label>
                <p>{price.toFixed(2)} USD</p>
            </div>
            <div className="form-group">
                <button type="button" id="request-btn" onClick={handleConfirmClick}>
                    Confirm
                </button>
            </div>
        </div>
    );
}

export default NewRide;
