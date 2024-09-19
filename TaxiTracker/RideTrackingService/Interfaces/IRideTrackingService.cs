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
        Task StartRideToUserAsync(string rideId, TimeSpan arrivalTime, double distance);
        Task StartRideToDestinationAsync(string rideId);
        Task RideCompletedAsync(string rideId);
        Task<IEnumerable<Ride>> GetWaitingRidesAsync();
        Task AddOrUpdateRideAsync(Ride ride);
        Task<RideStatus?> GetRideStatusAsync(string rideId);
        Task<Ride?> GetRideDetailsAsync(string rideId);
        Task DeleteRideAsync(string rideId);
    }
}
