using Common.Enums;
using Common.Models;
using Common.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RideService.Models;
using RideService.Services;
using RideTrackingService.Interfaces;
using System.ComponentModel.Design.Serialization;
using System.Diagnostics;
using System.Fabric.Query;
using System.Runtime.CompilerServices;
using System.Security.Claims;

namespace RideService.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RideController : ControllerBase
    {
        private readonly RideGenerator rideGenerator = new RideGenerator();
        private readonly RideDataRepository rideRepo;
        private readonly TokenService tokenService;
        private readonly IRideTrackingService _rideTrackingService;
        //private readonly IConfiguration _configuration;
        public RideController(RideDataRepository _rideRepo, TokenService _tokenService, IRideTrackingService rideTrackingService)
        {
            tokenService = _tokenService;
            rideRepo = _rideRepo;
            _rideTrackingService = rideTrackingService;
        }


        [HttpPost("create")]
        [Authorize]
        public IActionResult CreateRide([FromBody] RideRequestDto rideRequest)
        {
            if (rideRequest == null || string.IsNullOrEmpty(rideRequest.StartAddress) || string.IsNullOrEmpty(rideRequest.EndAddress))
            {
                return BadRequest(new { message = "Start address and end address are required." });
            }

            var distance = rideGenerator.GenerateDistance();
            var price = rideGenerator.CalculatePrice(distance);
            string waitingTime = rideGenerator.GenerateWaitTime();

            var response = new RideDto
            {
                StartAddress = rideRequest.StartAddress,
                EndAddress = rideRequest.EndAddress,
                Distance = distance,
                Price = price,
                WaitingTime = waitingTime
            };

            return Ok(response);
        }


        [HttpPost("save")]
        [Authorize]
        public async Task<IActionResult> SaveRide([FromBody] RideDto rideDto)
        {
            try
            {
                var existingToken = Request.Cookies["jwt"];
                if (string.IsNullOrEmpty(existingToken))
                {
                    return Unauthorized(new { message = "User not logged in." });
                }

                var userId = tokenService.GetUsernameFromToken(existingToken);
                if(userId == null)
                {
                    return NotFound(new {message = "User not found!"});
                }

                var rideData = new Ride
                {
                    UserId = userId,
                    RowKey = userId,
                    StartAddress = rideDto.StartAddress,
                    EndAddress = rideDto.EndAddress,
                    Distance = rideDto.Distance,
                    Price = rideDto.Price,
                    WaitingTime = rideDto.WaitingTime
                };

                await _rideTrackingService.AddOrUpdateRideAsync(rideData);

                Debug.WriteLine(rideData);
                ServiceEventSource.Current.Message($"Ride data: {rideData}");

                await rideRepo.AddRideAsync(rideData);

                return Ok(new { message = "Ride confirmed successfully." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { ex.Message });
            }
        }


        [HttpGet("ride-details")]
        [Authorize]
        public async Task<IActionResult> GetRideInfo()
        {
            var existingToken = Request.Cookies["jwt"];
            if (string.IsNullOrEmpty(existingToken))
            {
                return Unauthorized(new { message = "User not logged in." });
            }

            var userId = tokenService.GetUsernameFromToken(existingToken);

            if (userId == null)
            {
                return Unauthorized(new { message = "Invalid user information in token." });
            }

            var ride = await _rideTrackingService.GetRideDetailsAsync(userId);

            if (ride == null)
            {
                return NotFound(new { message = "Ride not found." });
            }

            return Ok(new { ride});
        }


        [HttpGet("ride-status")]
        [Authorize]
        public async Task<IActionResult> GetRideStatus()
        {
            var existingToken = Request.Cookies["jwt"];
            if (string.IsNullOrEmpty(existingToken))
            {
                return Unauthorized(new { message = "User not logged in." });
            }

            var userId = tokenService.GetUsernameFromToken(existingToken);

            if (userId == null)
            {
                return Unauthorized(new { message = "Invalid user information in token." });
            }

            var status = await _rideTrackingService.GetRideStatusAsync(userId);

            if(status == null)
            {
                status = RideStatus.Completed;
            }

            var rideStatus = status.ToString(); 

            return Ok(new { status = rideStatus });
        }


        [HttpGet("current")]
        [Authorize]
        public async Task<IActionResult> GetCurrentRide()
        {
            try
            {
                var existingToken = Request.Cookies["jwt"];
                if (string.IsNullOrEmpty(existingToken))
                {
                    return Unauthorized(new { message = "User not logged in." });
                }

                var userId = tokenService.GetUsernameFromToken(existingToken);

                if (userId == null)
                {
                    return Unauthorized(new { message = "Invalid user information in token." });
                }

                var ride = await _rideTrackingService.GetRideDetailsAsync(userId);

                return Ok(new { ride });
            }
            catch (Exception ex)
            {
                return BadRequest(new {message = ex.Message + ex.StackTrace});
            }
        }


        [HttpPost("start-ride")]
        [Authorize]
        public async Task<IActionResult> StartRide()
        {
            var existingToken = Request.Cookies["jwt"];
            if (string.IsNullOrEmpty(existingToken))
            {
                return Unauthorized(new { message = "User not logged in." });
            }

            var userId = tokenService.GetUsernameFromToken(existingToken);

            if (userId == null)
            {
                return Unauthorized(new { message = "Invalid user information in token." });
            }

            var ride = await _rideTrackingService.GetRideDetailsAsync(userId);
            if(ride == null)
                {  return NotFound(); }

            await _rideTrackingService.StartRideToDestinationAsync(ride.UserId);

            return Ok();
        }


        [HttpPost("end-ride/{id}")]
        [Authorize]
        public async Task<IActionResult> EndRide(string id)
        {
            var existingToken = Request.Cookies["jwt"];
            if (string.IsNullOrEmpty(existingToken))
            {
                return Unauthorized(new { message = "User not logged in." });
            }

            var userId = tokenService.GetUsernameFromToken(existingToken);

            if (userId == null)
            {
                return Unauthorized(new { message = "Invalid user information in token." });
            }

            Ride ride = await rideRepo.RetrieveRideAsync(id);
            if (ride == null)
            {
                return NotFound();
            }
            else {
                await _rideTrackingService.RideCompletedAsync(ride.UserId);
                ride.Status = RideStatus.Completed;
                await rideRepo.UpdateRideAsync(ride);
            }

            
            return Ok();
        }


        [HttpGet("previous")]
        [Authorize]
        public async Task<IActionResult> GetPreviousRides()
        {
            var existingToken = Request.Cookies["jwt"];
            if (string.IsNullOrEmpty(existingToken))
            {
                return Unauthorized(new { message = "User not logged in." });
            }

            var userId = tokenService.GetUsernameFromToken(existingToken);

            if (userId == null)
            {
                return Unauthorized(new { message = "Invalid user information in token." });
            }

            var allRides = await rideRepo.RetrieveAllRidesAsync();

            if (allRides == null || !allRides.Any())
            {
                return NotFound(new { message = "No rides in RideTable!" });
            }

            var userRides = allRides.Where(ride => ride.UserId == userId && ride.Status == RideStatus.Completed).ToList();

            if (!userRides.Any())
            {
                return NotFound(new { message = "No rides found for the current user." });
            }

            return Ok(userRides);
        }


        [HttpGet("driver-previous")]
        [Authorize]
        public async Task<IActionResult> GetDriverPreviousRides()
        {
            var existingToken = Request.Cookies["jwt"];
            if (string.IsNullOrEmpty(existingToken))
            {
                return Unauthorized(new { message = "User not logged in." });
            }

            var userId = tokenService.GetUsernameFromToken(existingToken);

            if (userId == null)
            {
                return Unauthorized(new { message = "Invalid user information in token." });
            }

            var allRides = await rideRepo.RetrieveAllRidesAsync();

            if (allRides == null || !allRides.Any())
            {
                return NotFound(new { message = "No rides in RideTable!" });
            }

            var userRides = allRides.Where(ride => ride.DriverId     == userId && ride.Status == RideStatus.Completed).ToList();

            if (!userRides.Any())
            {
                return NotFound(new { message = "No rides found for the current user." });
            }

            return Ok(userRides);
        }

    }
}
