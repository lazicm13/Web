using AuthenticationService.Models;
using AuthenticationService.Services;
using Common.Enums;
using Common.Services;
using Microsoft.AspNetCore.Authorization;
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

            // Nastavi sa loginom ako korisnik nije ulogovan
            var user = await _repo.RetrieveUserAsync(loginRequest.EmailAddress);

            if (user == null || !VerifyPassword(loginRequest.Password, user.Password))
            {
                return Unauthorized(new { message = "Invalid email or password." });
            }
            
            if(user.UserState == UserState.Rejected)
            {
                return Unauthorized(new { message = "You cannot login! Your profile is rejected by Administrator!" });
            }

            var token = _tokenService.GenerateJwtToken(loginRequest.EmailAddress, user.UserType.ToString(), _configuration);

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


        [HttpGet("status")]
        public IActionResult CheckLoginStatus()
        {
            var existingToken = Request.Cookies["jwt"];
            if (!string.IsNullOrEmpty(existingToken))
            {
                var principal = _tokenService.ValidateToken(existingToken);
                if (principal != null)
                {
                    var username = principal.Identity?.Name ?? principal.FindFirst(ClaimTypes.Name)?.Value;
                    var role = principal.FindFirst(ClaimTypes.Role)?.Value;

                    return Ok(new
                    {
                        isLoggedIn = true,
                        username = username,
                        role = role // Dodaj i rolu u odgovor
                    });
                }
            }

            return Ok(new { isLoggedIn = false });
        }

        [HttpGet("check")]
        [Authorize]
        public IActionResult CheckAuthentication()
        {
            return Ok(new { message = "User is authenticated." });
        }

        [HttpPost("logout")]
        [Authorize]
        public IActionResult Logout()
        {
            Response.Cookies.Delete("jwt");
            return Ok(new { message = "Logged out successfully." });
        }



    }
}
