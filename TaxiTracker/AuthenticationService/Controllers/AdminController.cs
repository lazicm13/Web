using AuthenticationService.Services;
using Common.Enums;
using Common.Models;
using Common.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using NotificationService.Interfaces;

namespace AuthenticationService.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AdminController : ControllerBase
    {
        private readonly UserDataRepository _repo;
        private readonly TokenService _tokenService;
        private readonly INotificationService _notificationService;
        public AdminController(TokenService tokenService, UserDataRepository userDataRepository, INotificationService notificationService)
        {
            _tokenService = tokenService;
            _repo = userDataRepository;
            _notificationService = notificationService;
        }


        [HttpGet("new-drivers")]
        public async Task<IActionResult> GetNewDrivers()
        {
            try
            {
                var drivers = await _repo.RetrieveUsersByStatusAsync(UserState.Created);
                return Ok(drivers);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while fetching new drivers.", error = ex.Message });
            }
        }


        [HttpPut("accept-driver/{emailAddress}")]
        public async Task<IActionResult> AcceptDriver(string emailAddress)
        {
            try
            {
                var driver = await _repo.RetrieveUserAsync(emailAddress);
                if (driver == null)
                {
                    return NotFound(new { message = "Driver not found." });
                }

                // Proveri da li je korisnik vozač koji je u statusu "Created"
                if (driver.UserState != UserState.Created)
                {
                    return BadRequest(new { message = "Driver is not in a state where they can be accepted." });
                }

                // Prihvatanje vozača - postavi status na "Approved"
                driver.UserState = UserState.Verified;
                await _repo.UpdateUserAsync(driver);

                EmailData emailData = new EmailData();
                emailData.FullName = driver.FullName;
                emailData.EmailAddress = emailAddress;

                bool notificationSent = await _notificationService.SendNotificationAsync(emailData, true);

                if (!notificationSent)
                {
                    return StatusCode(500, new { message = "Failed to send notification email." });
                }

                return Ok(new { message = "Driver accepted successfully." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while accepting the driver.", error = ex.Message });
            }
        }


        [HttpPut("reject-driver/{emailAddress}")]
        public async Task<IActionResult> RejectDriver(string emailAddress)
        {
            try
            {
                var driver = await _repo.RetrieveUserAsync(emailAddress);
                if (driver == null)
                {
                    return NotFound(new { message = "Driver not found." });
                }

                // Proveri da li je korisnik vozač koji je u statusu "Created"
                if (driver.UserState != UserState.Created)
                {
                    return BadRequest(new { message = "Driver is not in a state where they can be rejected." });
                }

                // Odbijanje vozača - postavi status na "Rejected"
                driver.UserState = UserState.Rejected;
                await _repo.UpdateUserAsync(driver);

                EmailData email = new EmailData();

                email.FullName = driver.FullName;
                email.EmailAddress = driver.EmailAddress;

                await _notificationService.SendNotificationAsync(email, false);

                return Ok(new { message = "Driver rejected successfully." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while rejecting the driver.", error = ex.Message });
            }
        }


        [HttpGet("verified-drivers")]
        public async Task<IActionResult> GetVerifiedDrivers()
        {
            try
            {
                var drivers = await _repo.RetrieveAllUsersAsync();

                if (drivers == null || !drivers.Any())
                {
                    return NotFound(new { message = "No verified drivers found." });
                }

                var verifiedDrivers = new List<User>();
                foreach (var driver in drivers)
                {
                    if(driver.UserState == UserState.Verified && driver.UserType == UserType.Driver)
                    {
                        verifiedDrivers.Add(driver);
                    }
                }

                return Ok(verifiedDrivers);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving verified drivers.", error = ex.Message });
            }
        }

        [HttpPut("block-driver/{emailAddress}")]
        public async Task<IActionResult> BlockDriver(string emailAddress)
        {
            try
            {
                var driver = await _repo.RetrieveUserAsync(emailAddress);
                if (driver == null)
                {
                    return NotFound(new { message = "Driver not found." });
                }

                driver.IsBlocked = true;
                await _repo.UpdateUserAsync(driver);

                return Ok(new { message = "Driver blocked successfully." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while blocking the driver.", error = ex.Message });
            }
        }


        [HttpPut("unblock-driver/{emailAddress}")]
        public async Task<IActionResult> UnblockDriver(string emailAddress)
        {
            try
            {
                var driver = await _repo.RetrieveUserAsync(emailAddress);
                if (driver == null)
                {
                    return NotFound(new { message = "Driver not found." });
                }

                driver.IsBlocked = false;
                await _repo.UpdateUserAsync(driver);

                return Ok(new { message = "Driver unblocked successfully." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while unblocking the driver.", error = ex.Message });
            }
        }
    }
}
