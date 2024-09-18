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
        Task DriverArrivedAsync(string rideId, double distance, TimeSpan arrivalTime);
        Task StartRideToDestinationAsync(string rideId, TimeSpan rideDuration);
        Task RideCompletedAsync(string rideId);
        Task<IEnumerable<Ride>> GetWaitingRidesAsync();
        Task AddOrUpdateRideAsync(Ride ride);
        Task<RideStatus?> GetRideStatusAsync(string rideId);
        Task<Ride?> GetRideDetailsAsync(string rideId);
    }
}
