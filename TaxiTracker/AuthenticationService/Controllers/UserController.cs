using AuthenticationService;
using Common.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.Threading.Tasks;

[Route("user")]
[ApiController]
public class UserController : ControllerBase
{
    private readonly UserDataRepository _repo = new UserDataRepository();
    private readonly TokenService _tokenService;

    public UserController(TokenService tokenService)
    {
        _tokenService = tokenService; 
    }

    [HttpGet("current")]
    public async Task<IActionResult> GetCurrentUser()
    {
        // Dobijanje JWT tokena iz kolačića
        var existingToken = Request.Cookies["jwt"];
        if (string.IsNullOrEmpty(existingToken))
        {
            return Unauthorized(new { message = "User not logged in." });
        }

        // Validacija tokena da bi se dobio korisnički kontekst (principal)
        ClaimsPrincipal principal;
        try
        {
            principal = _tokenService.ValidateToken(existingToken);
        }
        catch (Exception ex)
        {
            // Ako validacija tokena ne uspe
            return Unauthorized(new { message = "Invalid token.", details = ex.Message });
        }

        // Dobijanje korisničkog ID-a iz tokena
        var userId = principal?.Identity?.Name ?? principal?.FindFirst(ClaimTypes.Name)?.Value;
        if (userId == null)
        {
            return Unauthorized(new { message = "Invalid user information in token." });
        }

        // Dohvatanje korisnika iz repozitorijuma na osnovu korisničkog ID-a
        var user = await _repo.RetrieveUserAsync(userId);
        if (user == null)
        {
            return NotFound(new { message = "User not found." });
        }

        // Vraćanje informacija o korisniku
        return Ok(new
        {
            fullName = user.FullName,
            userName = user.Username,
            email = user.EmailAddress,
            birthDate = user.BirthDate,
            address = user.Address
        });
    }

}
