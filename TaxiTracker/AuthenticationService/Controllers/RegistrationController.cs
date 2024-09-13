using AuthenticationService.Models;
using AuthenticationService.Services;
using Common.Enums;
using Common.Models;
using Microsoft.AspNetCore.Mvc;

[Route("auth/[controller]")]
[ApiController]
public class RegistrationController : ControllerBase
{
    private readonly UserDataRepository _repo;
    private readonly BlobStorageService _blobStorageService;
    private readonly ILogger<RegistrationController> _logger;

    public RegistrationController(ILogger<RegistrationController> logger, BlobStorageService blobStorageService)
    {
        _logger = logger;
        _repo = new UserDataRepository(); 
        _blobStorageService = blobStorageService;
    }

    [HttpPost("register")]
    
    public async Task<IActionResult> Register([FromBody] RegisterRequest user)
    {
        try
        {
            if (!Enum.IsDefined(typeof(UserType), user.UserType))
            {
                return BadRequest("Invalid user type.");
            }

            string rowKey = user.EmailAddress;

            var userExists = await _repo.ExistsAsync(rowKey);
            if (userExists)
            {
                return Conflict(new { message = "User already exists." });
            }

            string imageUrl = null;
            if (!string.IsNullOrEmpty(user.Image))
            {
                string fileName = $"{Guid.NewGuid()}.png";
                imageUrl = await _blobStorageService.UploadImageAsync(user.Image, fileName);
            }

            var userData = new User
            {
                Username = user.Username,
                Password = HashPassword(user.Password),
                EmailAddress = user.EmailAddress,
                FullName = user.FullName,
                Address = user.Address,
                BirthDate = user.BirthDate,
                Image = imageUrl,
                RowKey = rowKey,
                UserType = user.UserType.Equals("Driver") ? UserType.Driver : UserType.User
            };

            await _repo.AddUserAsync(userData);

            return Ok(new { message = "Registration successful." });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred during registration.");
            return BadRequest(new { message = ex.Message });
        }
    }

    private string HashPassword(string password)
    {
        return password; // Implement password hashing
    }
}
