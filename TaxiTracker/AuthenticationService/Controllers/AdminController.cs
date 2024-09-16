using AuthenticationService.Services;
using Common.Enums;
using Common.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace AuthenticationService.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AdminController : ControllerBase
    {
        private readonly UserDataRepository _repo;
        private readonly TokenService _tokenService;

        public AdminController(TokenService tokenService, UserDataRepository userDataRepository)
        {
            _tokenService = tokenService;
            _repo = userDataRepository;
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

                return Ok(new { message = "Driver rejected successfully." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while rejecting the driver.", error = ex.Message });
            }
        }



    }
}
