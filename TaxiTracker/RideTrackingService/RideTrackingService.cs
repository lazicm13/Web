using Common.Enums;
using Common.Models;
using Microsoft.ServiceFabric.Data.Collections;
using Microsoft.ServiceFabric.Services.Communication.Runtime;
using Microsoft.ServiceFabric.Services.Runtime;
using Microsoft.ServiceFabric.Services.Remoting.Runtime; // IService interfejs
using Microsoft.ServiceFabric.Services.Remoting.V2.FabricTransport.Runtime; // Za FabricTransportServiceRemotingListener

using RideTrackingService.Interfaces;
using System.Collections.Generic;
using System.Fabric;
using System.Threading;
using System.Threading.Tasks;

namespace RideTrackingService
{
    internal sealed class RideTrackingService : StatefulService, IRideTrackingService
    {
        private IReliableDictionary<string, Ride> _rides;

        public RideTrackingService(StatefulServiceContext context)
            : base(context)
        {
        }

        protected override IEnumerable<ServiceReplicaListener> CreateServiceReplicaListeners()
        {
            return this.CreateServiceRemotingReplicaListeners();
        }

        protected override async Task RunAsync(CancellationToken cancellationToken)
        {
            _rides = await StateManager.GetOrAddAsync<IReliableDictionary<string, Ride>>("rides");


        }

        public async Task AddOrUpdateRideAsync(Ride ride)
        {
            using (var tx = StateManager.CreateTransaction())
            {
                await _rides.AddOrUpdateAsync(tx, ride.UserId, ride, (key, value) => ride);
                await tx.CommitAsync();
            }
        }

        public async Task StartRideToUserAsync(string rideId, TimeSpan arrivalTime, double distance)
        {
            using (var tx = StateManager.CreateTransaction())
            {
                var ride = await _rides.GetOrAddAsync(tx, rideId, key => new Ride { UserId = key, Status = RideStatus.WaitingForDriver });

                var now = DateTime.UtcNow;

                
                ride.DriverStartTime = now;
                ride.RideStartTime = DateTime.Now.Add(arrivalTime);
                ride.RideEndTime = ride.RideStartTime + TimeSpan.FromMinutes(1); // namerno postavljeno na minut umesto distance, radi testiranja
                ride.Status = RideStatus.Active;
                await _rides.SetAsync(tx, rideId, ride);
                await tx.CommitAsync();
            }
        }

        public async Task StartRideToDestinationAsync(string rideId)
        {
            using (var tx = StateManager.CreateTransaction())
            {
                var ride = await _rides.TryGetValueAsync(tx, rideId);

                if (ride.HasValue)
                {
                    ride.Value.Status = RideStatus.InProgress;
                    await _rides.SetAsync(tx, rideId, ride.Value);
                    await tx.CommitAsync();
                }
            }
        }



        public async Task RideCompletedAsync(string rideId)
        {
            using (var tx = StateManager.CreateTransaction())
            {
                var ride = await _rides.TryGetValueAsync(tx, rideId);

                if (ride.HasValue)
                {
                    ride.Value.Status = RideStatus.Completed;
                    await _rides.SetAsync(tx, rideId, ride.Value);
                    await tx.CommitAsync();

                    await DeleteRideAsync(rideId);
                }
            }
        }
        public async Task<IEnumerable<Ride>> GetWaitingRidesAsync()
        {
            var activeRides = new List<Ride>();

            using (var tx = StateManager.CreateTransaction())
            {
                var enumerable = await _rides.CreateEnumerableAsync(tx);
                var enumerator = enumerable.GetAsyncEnumerator();

                while (await enumerator.MoveNextAsync(CancellationToken.None))
                {
                    var ride = enumerator.Current.Value;
                    if (ride.Status == RideStatus.WaitingForDriver)
                    {
                        activeRides.Add(ride);
                    }
                }
            }

            return activeRides;
        }

        public async Task<RideStatus?> GetRideStatusAsync(string rideId)
        {
            using (var tx = StateManager.CreateTransaction())
            {
                // Attempt to get the ride from the dictionary
                var result = await _rides.TryGetValueAsync(tx, rideId);

                if (result.HasValue)
                {
                    // Return the ride's status
                    return result.Value.Status;
                }
                else
                {
                    // Return null if the ride does not exist
                    return null;
                }
            }
        }

        public async Task<Ride?> GetRideDetailsAsync(string rideId)
        {
            using (var tx = StateManager.CreateTransaction())
            {
                var ride = await _rides.TryGetValueAsync(tx, rideId);
                if (ride.HasValue)
                {
                    return ride.Value;
                }
                else
                {
                    return null;
                }
            }
        }
        public async Task DeleteRideAsync(string rideId)
        {
            using (var tx = StateManager.CreateTransaction())
            {
                var ride = await _rides.TryGetValueAsync(tx, rideId);

                if (ride.HasValue)
                {
                    await _rides.TryRemoveAsync(tx, rideId);
                    await tx.CommitAsync();
                }
            }
        }


    }
}
