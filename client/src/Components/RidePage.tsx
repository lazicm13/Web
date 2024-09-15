import './../Style/ride.css'

function RidePage(){
    return(
        <div className="ride-container">
            <h2>Waiting for a driver to accept your ride...</h2>
            <div className="loader-container">
                <div className="gear" id="gear1">
                    <img src="https://assets.codepen.io/6093409/gear.svg.png" alt="an illustration of a gear" />
                </div>
                <div className="gear" id="gear2">
                    <img src="https://assets.codepen.io/6093409/gear.svg.png" alt="an illustration of a gear" />
                </div>
            </div>
        </div>
    );
}

export default RidePage