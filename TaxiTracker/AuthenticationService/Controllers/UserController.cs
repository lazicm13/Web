using AuthenticationService;
using AuthenticationService.Models;
using AuthenticationService.Services;
using Common.Models;
using Common.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.Threading.Tasks;

[Route("user")]
[ApiController]
public class UserController : ControllerBase
{
    private readonly UserDataRepository _repo;
    private readonly TokenService _tokenService;

    public UserController(TokenService tokenService, UserDataRepository userDataRepository)
    {
        _tokenService = tokenService; 
        _repo = userDataRepository;
    }

    [HttpGet("current")]
    [Authorize]
    public async Task<IActionResult> GetCurrentUser()
    {
        // Get JWT token from cookies
        var existingToken = Request.Cookies["jwt"];
        if (string.IsNullOrEmpty(existingToken))
        {
            return Unauthorized(new { message = "User not logged in." });
        }

        // Validate token to get user context (principal)
        ClaimsPrincipal principal;
        try
        {
            principal = _tokenService.ValidateToken(existingToken);
        }
        catch (Exception ex)
        {
            // If token validation fails
            return Unauthorized(new { message = "Invalid token.", details = ex.Message });
        }

        // Get user ID from token
        var userId = principal?.Identity?.Name ?? principal?.FindFirst(ClaimTypes.Name)?.Value;
        if (userId == null)
        {
            return Unauthorized(new { message = "Invalid user information in token." });
        }

        // Retrieve user from repository based on user ID
        var user = await _repo.RetrieveUserAsync(userId);
        if (user == null)
        {
            return NotFound(new { message = "User not found." });
        }

        // Return user information
        return Ok(new
        {
            fullName = user.FullName,
            username = user.Username,
            emailAddress = user.EmailAddress,
            birthDate = user.BirthDate,
            address = user.Address
        });
    }

    [HttpPut("update")]
    [Authorize]
    public async Task<IActionResult> UpdateUser([FromBody] UpdateUser updateUserDto) // izmeniti model tako da prima samo podatke koji su mu potrebni
    {
        var existingToken = Request.Cookies["jwt"];
        if (string.IsNullOrEmpty(existingToken))
        {
            return Unauthorized(new { message = "User not logged in." });
        }

        // Pretpostavljamo da imate servis koji može da dešifruje JWT token i vrati korisnika
        var userId = _tokenService.GetUsernameFromToken(existingToken);
        if (userId == null)
        {
            return Unauthorized(new { message = "Invalid token." });
        }

        // Dohvati korisnika iz baze
        var user = await _repo.RetrieveUserAsync(userId);
        if (user == null)
        {
            return NotFound(new { message = "User not found." });
        }

        // Ažuriraj korisničke podatke sa podacima iz DTO
        user.FullName = updateUserDto.FullName ?? user.FullName;
        user.Username = updateUserDto.Username ?? user.Username;
        user.EmailAddress = updateUserDto.EmailAddress ?? user.EmailAddress;
        user.BirthDate = updateUserDto.BirthDate ?? user.BirthDate;
        user.Address = updateUserDto.Address ?? user.Address;

        try
        {
            // Sačuvaj promene u bazi
            await _repo.UpdateUserAsync(user);

            // Vrati uspešan odgovor
            return Ok(new { message = "User updated successfully." });
        }
        catch (Exception ex)
        {
            // U slučaju greške vrati odgovarajuću poruku
            return StatusCode(500, new { message = "An error occurred while updating the user.", error = ex.Message });
        }
    }



}
