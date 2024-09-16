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

        public async Task<IEnumerable<Ride>> GetActiveRidesAsync()
        {
            var activeRides = new List<Ride>();

            using (var tx = StateManager.CreateTransaction())
            {
                var enumerable = await _rides.CreateEnumerableAsync(tx);
                var enumerator = enumerable.GetAsyncEnumerator();

                while (await enumerator.MoveNextAsync(CancellationToken.None))
                {
                    var ride = enumerator.Current.Value;
                    if (ride.Status == RideStatus.Active)
                    {
                        activeRides.Add(ride);
                    }
                }
            }

            return activeRides;
        }

        public async Task AddOrUpdateRideAsync(Ride ride)
        {
            using (var tx = StateManager.CreateTransaction())
            {
                await _rides.AddOrUpdateAsync(tx, ride.UserId, ride, (key, value) => ride);
                await tx.CommitAsync();
            }
        }


        public async Task<IEnumerable<Ride>> GetRidesByStatusAsync(RideStatus status)
        {
            var rides = new List<Ride>();

            using (var tx = StateManager.CreateTransaction())
            {
                var enumerable = await _rides.CreateEnumerableAsync(tx);
                var enumerator = enumerable.GetAsyncEnumerator();

                while (await enumerator.MoveNextAsync(CancellationToken.None))
                {
                    var ride = enumerator.Current.Value;
                    if (ride.Status == status)
                    {
                        rides.Add(ride);
                    }
                }
            }

            return rides;
        }

        public async Task UpdateRideStatusAsync(string rideId, RideStatus newStatus)
        {
            using (var tx = StateManager.CreateTransaction())
            {
                var ride = await _rides.GetOrAddAsync(tx, rideId, key => new Ride { UserId = key });
                if (ride != null)
                {
                    ride.Status = newStatus;
                    await _rides.SetAsync(tx, rideId, ride);
                    await tx.CommitAsync();
                }
            }
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




    }
}
