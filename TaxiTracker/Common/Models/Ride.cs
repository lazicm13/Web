using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.Models
{
    public class Ride
    {
        private string startingAddress;
        private string endingAddress;
        private string driver;
        private string user;
        private double price;
        private TimeSpan waitingTime; 
        private TimeSpan drivingTime;

        public Ride() { }
        public Ride(string startingAddress, string endingAddress, string driver, string user, double price, TimeSpan waitingTime, TimeSpan drivingTime)
        {
            this.startingAddress = startingAddress;
            this.endingAddress = endingAddress;
            this.driver = driver;
            this.user = user;
            this.price = price;
            this.waitingTime = waitingTime;
            this.drivingTime = drivingTime;
        }

        public string StartingAddress { get => startingAddress; set => startingAddress = value; }
        public string EndingAddress { get => endingAddress; set => endingAddress = value; }
        public string Driver { get => driver; set => driver = value; }
        public string User { get => user; set => user = value; }
        public double Price { get => price; set => price = value; }
        public TimeSpan WaitingTime { get => waitingTime; set => waitingTime = value; }
        public TimeSpan DrivingTime { get => drivingTime; set => drivingTime = value; }

        public override bool Equals(object obj)
        {
            return obj is Ride ride &&
                   startingAddress == ride.startingAddress &&
                   endingAddress == ride.endingAddress &&
                   driver == ride.driver &&
                   user == ride.user &&
                   price == ride.price &&
                   waitingTime.Equals(ride.waitingTime) &&
                   drivingTime.Equals(ride.drivingTime);
        }

        public override int GetHashCode()
        {
            return HashCode.Combine(startingAddress, endingAddress, driver, user, price, waitingTime, drivingTime);
        }
    }
}