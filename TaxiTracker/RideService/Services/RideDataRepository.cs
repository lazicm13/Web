using System.Diagnostics;
using Azure.Data.Tables;
using Azure;
using Common.Models;

namespace RideService.Services
{
    public class RideDataRepository
    {
        private readonly TableClient _tableClient;

        public RideDataRepository()
        {
            string storageConnectionString = "UseDevelopmentStorage=true;";
            var serviceClient = new TableServiceClient(storageConnectionString);
            _tableClient = serviceClient.GetTableClient("RideTable");
            _tableClient.CreateIfNotExists();
        }

        public async Task<bool> ExistsAsync(string rideNo)
        {
            var ride = await RetrieveRideAsync(rideNo);
            return ride != null;
        }

        public async Task<IEnumerable<Ride>> RetrieveAllRidesAsync()
        {
            var rides = new List<Ride>();
            await foreach (var ride in _tableClient.QueryAsync<Ride>(u => u.PartitionKey == "Ride"))
            {
                rides.Add(ride);
            }
            return rides;
        }

        public async Task<Ride> RetrieveRideAsync(string rideNo)
        {
            try
            {
                var response = await _tableClient.GetEntityAsync<Ride>("Ride", rideNo);
                return response.Value;
            }
            catch (RequestFailedException e) when (e.Status == 404)
            {
                return null;
            }
        }

        public async Task AddRideAsync(Ride newride)
        {
            try
            {
                await _tableClient.AddEntityAsync(newride);
            }
            catch (Exception e)
            {
                Debug.WriteLine(e.Message + e.StackTrace);
            }
        }

        public async Task UpdateRideAsync(Ride ride)
        {
            await _tableClient.UpdateEntityAsync(ride, ride.ETag, TableUpdateMode.Replace);
        }
    }
}
