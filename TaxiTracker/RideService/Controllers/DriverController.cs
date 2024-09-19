using Common.Enums;
using Common.Models;
using Common.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.ServiceFabric.Services.Client;
using Microsoft.ServiceFabric.Services.Remoting.Client;
using RideService.Services;
using RideTrackingService.Interfaces;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace RideService.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DriverController : ControllerBase
    {
        private readonly IRideTrackingService _rideTrackingService;
        private readonly RideDataRepository _rideDataRepository;
        private readonly TokenService _tokenService;

        public DriverController(IRideTrackingService rideTrackingService, RideDataRepository rideDataRepository, TokenService tokenService)
        {
            _rideTrackingService = rideTrackingService;
            _rideDataRepository = rideDataRepository;
            _tokenService = tokenService;
        }


        [HttpGet("waiting-rides")]
        [Authorize]
        public async Task<ActionResult<IEnumerable<Ride>>> GetWaitingRides()
        {
            try
            {
                var activeRides = await _rideTrackingService.GetWaitingRidesAsync();

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

        [HttpPost("accept-ride/{rideId}")]
        [Authorize]
        public async Task<IActionResult> AcceptRide(string rideId)
        {
            Ride ride = await _rideDataRepository.RetrieveRideAsync(rideId);


            var existingToken = Request.Cookies["jwt"];
            if (string.IsNullOrEmpty(existingToken))
            {
                return Unauthorized(new { message = "User not logged in." });
            }

            ClaimsPrincipal principal;
            try
            {
                principal = _tokenService.ValidateToken(existingToken);
            }
            catch (Exception ex)
            {
                return Unauthorized(new { message = "Invalid token.", details = ex.Message });
            }

            var userId = principal?.Identity?.Name ?? principal?.FindFirst(ClaimTypes.Name)?.Value;

            if (userId == null)
            {
                return Unauthorized(new { message = "Invalid user information in token." });
            }


            ride.DriverId = userId;
            ride.Status = RideStatus.Active;

            await _rideDataRepository.UpdateRideAsync(ride);
            await _rideTrackingService.StartRideToUserAsync(rideId, TimeSpan.FromMinutes(Convert.ToDouble(ride.WaitingTime)), ride.Distance);

            return Ok(ride);
        }

        [HttpGet("all-rides")]
        [Authorize]
        public async Task<IActionResult> GetAllRides()
        {
            try
            {
                var rides = await _rideDataRepository.RetrieveAllRidesAsync();

                if (rides == null)
                {
                    return NotFound("Rides are not found!");
                }

                return Ok(rides);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }




    }
}
