using Azure;
using Azure.Data.Tables;
using Common.Enums;
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

        public string Id { get; set; }
        public string UserId { get; set; }
        public string? DriverId { get; set; }
        public string? StartAddress {  get; set; }
        public string? EndAddress { get; set; }
        public double Price { get; set; }
        public double Distance {  get; set; }
        public string? WaitingTime {  get; set; }
        public DateTime? DriverStartTime {  get; set; }
        public DateTime? RideStartTime { get; set; }
        public DateTime? RideEndTime { get; set; }
        public RideStatus Status { get; set; }
        
        public Ride() 
        {
            Id = Guid.NewGuid().ToString();
            RowKey = Id;
            Status = RideStatus.WaitingForDriver;
        }
        

    }
}
