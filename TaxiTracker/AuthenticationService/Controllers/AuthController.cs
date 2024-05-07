using Common.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Microsoft.WindowsAzure.Storage;
using System;
using System.Threading.Tasks;


namespace AuthenticationService.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly ILogger<AuthController> _logger;

        public AuthController(ILogger<AuthController> logger)
        {
            _logger = logger;
        }

        [HttpPost("registration")]
        public async Task<IActionResult> Registration([FromBody] User userData)
        {
            if(!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                Console.WriteLine(userData.Username);
                return Ok(new { message = "Registration successful" });

            }catch(Exception ex)
            {
                return StatusCode(500, new { error = "An error occureed during registration"  + ex.Message});
            }
        }
    }
}
