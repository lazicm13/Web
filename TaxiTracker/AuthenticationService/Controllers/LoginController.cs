using Common.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace AuthenticationService.Controllers
{
    [Route("auth/[controller]")]
    [ApiController]
    public class LoginController : ControllerBase
    {
        private readonly UserDataRepository _repo = new UserDataRepository();
        private readonly IConfiguration _configuration;
        private readonly TokenService _tokenService;

        public LoginController(IConfiguration configuration)
        {
            _configuration = configuration;
            _tokenService = new TokenService(configuration);
        }

        [HttpPost]
        public async Task<IActionResult> Login([FromBody] LoginRequest loginRequest)
        {
            // Provera postojanja validnog JWT tokena u kolačiću
            var existingToken = Request.Cookies["jwt"];
            if (!string.IsNullOrEmpty(existingToken))
            {
                var principal = _tokenService.ValidateToken(existingToken);
                if (principal != null)
                {
                    // Ako je token validan, korisnik je već ulogovan
                    return Redirect("/home"); // Zameni "/home" sa URL-om početne stranice
                }
            }

            // Nastavi sa loginom ako korisnik nije ulogovan
            var user = await _repo.RetrieveUserAsync(loginRequest.EmailAddress);

            if (user == null || !VerifyPassword(loginRequest.Password, user.Password))
            {
                return Unauthorized(new { message = "Invalid email or password." });
            }
            
            
            var token = _tokenService.GenerateJwtToken(loginRequest.EmailAddress, _configuration);

            // Store the token in an HttpOnly cookie
            var cookieOptions = new CookieOptions
            {
                HttpOnly = true,
                Secure = true, // Set this to true in production (when using HTTPS)
                SameSite = SameSiteMode.Strict, // Strictest cookie setting for CSRF protection
                Expires = DateTime.UtcNow.AddHours(1) // Same as token expiry
            };

            Response.Cookies.Append("jwt", token, cookieOptions);

            return Ok(new { message = "Login successful." });
        }

        private bool VerifyPassword(string providedPassword, string storedPasswordHash)
        {
            // Implement a secure password hashing mechanism like bcrypt or PBKDF2
            return providedPassword == storedPasswordHash; // Replace with proper hash verification
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
