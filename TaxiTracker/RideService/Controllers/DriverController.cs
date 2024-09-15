using Common.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.ServiceFabric.Services.Client;
using Microsoft.ServiceFabric.Services.Remoting.Client;
using RideTrackingService.Interfaces;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace RideService.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DriverController : ControllerBase
    {
        private readonly IRideTrackingService _rideTrackingService;

        public DriverController(IRideTrackingService rideTrackingService)
        {
            _rideTrackingService = rideTrackingService;
        }


        [HttpGet("active-rides")]
        public async Task<ActionResult<IEnumerable<Ride>>> GetActiveRides()
        {
            try
            {
                var activeRides = await _rideTrackingService.GetActiveRidesAsync();

                if (activeRides == null || !activeRides.Any())
                {
                    return NotFound("No active rides found.");
                }

                return Ok(activeRides);
            }
            catch (Exception ex)
            {
                
                return StatusCode(500, "Internal server error. Please try again later." + ex.Message + ex.StackTrace);
            }
        }
    }
}
