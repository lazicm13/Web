﻿using AuthenticationService.Models;
using AuthenticationService.Services;
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


        [HttpGet("status")]
        public IActionResult CheckLoginStatus()
        {
            var existingToken = Request.Cookies["jwt"];
            if (!string.IsNullOrEmpty(existingToken))
            {
                // Validiraj token i dobavi principal (korisničke tvrdnje)
                var principal = _tokenService.ValidateToken(existingToken);
                if (principal != null)
                {
                    // Izvuci korisničko ime iz tvrdnji (claims) tokena
                    var username = principal.Identity?.Name ?? principal.FindFirst(ClaimTypes.Name)?.Value;

                    // Korisnik je ulogovan, vraćamo i ime
                    return Ok(new
                    {
                        isLoggedIn = true,
                        username = username // Prosleđivanje imena korisnika
                    });
                }
            }

            // Korisnik nije ulogovan
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
