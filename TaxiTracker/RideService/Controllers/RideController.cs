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
        //private readonly TokenService _tokenService;

        public RideController(RideDataRepository _rideRepo, TokenService _tokenService, IRideTrackingService rideTrackingService)
        {
            tokenService = _tokenService;
            rideRepo = _rideRepo;
            _rideTrackingService = rideTrackingService;
        }


        // POST api/ride/create 
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

                ClaimsPrincipal principal;
                try
                {
                    principal = tokenService.ValidateToken(existingToken);
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

            ClaimsPrincipal principal;
            try
            {
                principal = tokenService.ValidateToken(existingToken);
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

            var ride = await rideRepo.RetrieveRideAsync(userId);

            if (ride == null)
            {
                return NotFound(new { message = "Ride not found." });
            }

            var status = await _rideTrackingService.GetRideStatusAsync(ride.UserId);

            ride.Status = status ?? RideStatus.Active;

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

            ClaimsPrincipal principal;
            try
            {
                principal = tokenService.ValidateToken(existingToken);
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

            var ride = await rideRepo.RetrieveRideAsync(userId);

            if (ride == null)
            {
                return NotFound(new { message = "Ride not found." });
            }

            var status = await _rideTrackingService.GetRideStatusAsync(ride.UserId);

            var rideStatus = status.ToString();

            ride.Status = status ?? RideStatus.Active;

            return Ok(new { status = rideStatus });
        }



    }
}
