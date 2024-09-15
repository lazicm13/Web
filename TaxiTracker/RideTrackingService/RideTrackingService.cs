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
        private IReliableDictionary<Guid, Ride> _rides;

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
            _rides = await StateManager.GetOrAddAsync<IReliableDictionary<Guid, Ride>>("rides");
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
                await _rides.AddOrUpdateAsync(tx, ride.Id, ride, (key, value) => ride);
                await tx.CommitAsync();
            }
        }
    }
}
