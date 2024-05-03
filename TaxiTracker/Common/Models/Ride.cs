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
        private User driver;
        private User user;
        private double price;
        private TimeSpan waitingTime; // Promeniti tip
        private TimeSpan drivingTime;

    }
}
