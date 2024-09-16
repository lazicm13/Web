using Common.Enums;
using Common.Models;
using Microsoft.ServiceFabric.Services.Remoting;
using System.Collections.Generic;
using System.Fabric.Query;
using System.Threading.Tasks;

namespace RideTrackingService.Interfaces
{
    public interface IRideTrackingService : IService
    {
        Task<IEnumerable<Ride>> GetActiveRidesAsync();
        Task AddOrUpdateRideAsync(Ride ride);
        public Task<IEnumerable<Ride>> GetRidesByStatusAsync(RideStatus status);
        public Task UpdateRideStatusAsync(string rideId, RideStatus newStatus);
        public Task<RideStatus?> GetRideStatusAsync(string rideId);
    }
}
