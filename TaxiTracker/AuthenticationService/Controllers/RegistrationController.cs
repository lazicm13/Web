using Azure.Storage.Blobs.Models;
using Azure.Storage.Blobs;
using Common.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Diagnostics;

namespace AuthenticationService.Controllers
{
    [Route("auth/[controller]")]
    [ApiController]
    public class RegistrationController : ControllerBase
    {
        private readonly UserDataRepository repo = new UserDataRepository();
        private readonly string connectionString = "DataConnectionString";

        private readonly ILogger<RegistrationController> _logger;

        public RegistrationController(ILogger<RegistrationController> logger)
        {
            _logger = logger;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] User user)
        {
            try
                {
                string rowKey = user.EmailAddress;

                var userExists = await repo.ExistsAsync(rowKey);
                if (userExists)
                {
                    return Conflict(new { message = "User already exists." });
                }

                var userData = new User
                {
                    Username = user.Username,
                    Password = HashPassword(user.Password),
                    EmailAddress = user.EmailAddress,
                    FullName = user.FullName,
                    Address = user.Address,
                    BirthDate = user.BirthDate,
                    Image = user.Image,
                    RowKey = rowKey
                };

                await repo.AddUserAsync(userData);

                return Ok(new { message = "Registration successful." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        private string HashPassword(string password)
        {
            // Implementirajte stvarnu hash funkciju 
            return password; // Placeholder
        }

        
    }
}
