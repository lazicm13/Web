using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace AuthenticationService.Controllers
{
    [Route("auth/[controller]")]
    [ApiController]
    public class LoginController : ControllerBase
    {
        private readonly UserDataRepository repo = new UserDataRepository();


        [HttpPost]
        public async Task<IActionResult> Login([FromBody] LoginRequest loginRequest)
        {
            var user = await repo.RetrieveUserAsync(loginRequest.EmailAddress);
            
            if (user == null)
            {
                return Unauthorized(new { message = "Invalid email or password." });
            }
                

            if (!VerifyPassword(loginRequest.Password, user.Password))
            {
                return Unauthorized(new { message = "Invalid email or password." });
            }

            return Ok(new { message = "Login successful." });
        }


        private bool VerifyPassword(string providedPassword, string storedPasswordHash)
        {
            // Implement your password verification logic here
            return providedPassword == storedPasswordHash; // Placeholder
        }

        public class LoginRequest
        {
            public string EmailAddress { get; set; }
            public string Password { get; set; }

            public LoginRequest(string emailAddress, string password)
            {
                EmailAddress = emailAddress;
                Password = password;
            }
        }
    }
}
