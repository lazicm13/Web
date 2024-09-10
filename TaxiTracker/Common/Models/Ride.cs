using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.Models
{
    public class Ride
    {
        public Guid Id { get; set; }
        public string StartAddress {  get; set; }
        public string EndAddress { get; set; }
        public double Price { get; set; }
        public double Distance {  get; set; }
        public string WaitingTime {  get; set; }

        public Ride() { }

        
        

    }
}
