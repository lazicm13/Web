using Azure;
using Azure.Data.Tables;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.Models
{
    public class Ride : ITableEntity
    {
        public string PartitionKey { get; set; } = "Ride";
        public string? RowKey { get; set; }
        public DateTimeOffset? Timestamp { get; set; }
        public ETag ETag { get; set; }


        public Guid Id { get; set; }
        public string UserId { get; set; }
        public string? StartAddress {  get; set; }
        public string? EndAddress { get; set; }
        public double Price { get; set; }
        public double Distance {  get; set; }
        public string? WaitingTime {  get; set; }
        
        public Ride() 
        {
            Id = Guid.NewGuid();
            RowKey = Id.ToString();
        }

        public Ride(string userId, string startAdress, string endAddress, double price, double distance, string waitingTime)
        {
            Id = Guid.NewGuid(); 
            RowKey = Id.ToString();
            UserId = userId;
            StartAddress = startAdress;
            EndAddress = endAddress;
            Price = price;
            Distance = distance;
            WaitingTime = waitingTime;
        }
        

    }
}
