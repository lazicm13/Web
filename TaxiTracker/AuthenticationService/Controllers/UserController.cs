using AuthenticationService;
using AuthenticationService.Models;
using AuthenticationService.Services;
using Common.Enums;
using Common.Models;
using Common.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Security.Claims;
using System.Threading.Tasks;

[Route("user")]
[ApiController]
public class UserController : ControllerBase
{
    private readonly UserDataRepository _repo;
    private readonly TokenService _tokenService;
    private readonly BlobStorageService _blobStorageService; // Inject BlobStorageService

    public UserController(TokenService tokenService, UserDataRepository userDataRepository, BlobStorageService blobStorageService)
    {
        _tokenService = tokenService;
        _repo = userDataRepository;
        _blobStorageService = blobStorageService;
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
            address = user.Address,
            image = user.Image
        });
    }

    [HttpPut("update")]
    [Authorize]
    public async Task<IActionResult> UpdateUser([FromBody] UpdateUser updateUserDto)
    {
        var existingToken = Request.Cookies["jwt"];
        if (string.IsNullOrEmpty(existingToken))
        {
            return Unauthorized(new { message = "User not logged in." });
        }

        var userId = _tokenService.GetUsernameFromToken(existingToken);
        if (userId == null)
        {
            return Unauthorized(new { message = "Invalid token." });
        }

        // Retrieve user from the database
        var user = await _repo.RetrieveUserAsync(userId);
        if (user == null)
        {
            return NotFound(new { message = "User not found." });
        }

        user.FullName = updateUserDto.FullName ?? user.FullName;
        user.Username = updateUserDto.Username ?? user.Username;
        user.EmailAddress = updateUserDto.EmailAddress ?? user.EmailAddress;
        user.BirthDate = updateUserDto.BirthDate ?? user.BirthDate;
        user.Address = updateUserDto.Address ?? user.Address;
        user.Image = updateUserDto.Image ?? user.Image;

        try
        {
            // Save changes to the database
            await _repo.UpdateUserAsync(user);

            // Return successful response
            return Ok(new { message = "User updated successfully." });
        }
        catch (Exception ex)
        {
            // In case of error, return an appropriate message
            return StatusCode(500, new { message = "An error occurred while updating the user.", error = ex.Message });
        }
    }

    [HttpPut("change-password")]
    [Authorize]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto changePasswordDto)
    {
        var existingToken = Request.Cookies["jwt"];
        if (string.IsNullOrEmpty(existingToken))
        {
            return Unauthorized(new { message = "User not logged in." });
        }

        var userId = _tokenService.GetUsernameFromToken(existingToken);

        var user = await _repo.RetrieveUserAsync(userId);
        if (user == null)
        {
            return NotFound(new { message = "User not found." });
        }

        if (user.Password != changePasswordDto.OldPassword)
            return StatusCode(403, new { message = "Incorrect old password." });

        user.Password = changePasswordDto.NewPassword;

        try
        {
            // Save the updated user information in the database
            await _repo.UpdateUserAsync(user);
            return Ok(new { message = "Password changed successfully." });
        }
        catch (Exception ex)
        {
            // Handle any errors that occur during the update process
            return StatusCode(500, new { message = "An error occurred while changing the password.", error = ex.Message });
        }
    }

    [HttpPost("upload-image")]
    [Authorize]
    public async Task<IActionResult> UploadImage(IFormFile image)
    {
        var existingToken = Request.Cookies["jwt"];
        if (string.IsNullOrEmpty(existingToken))
        {
            return Unauthorized(new { message = "User not logged in." });
        }
    
        var userId = _tokenService.GetUsernameFromToken(existingToken);
        if (userId == null)
        {
            return Unauthorized(new { message = "Invalid token." });
        }
    
        if (image == null || image.Length == 0)
        {
            return BadRequest(new { message = "Invalid image file." });
        }
    
        try
        {
            string base64Image;
            using (var memoryStream = new MemoryStream())
            {
                await image.CopyToAsync(memoryStream);
                base64Image = Convert.ToBase64String(memoryStream.ToArray());
            }

            string fileName = $"{Guid.NewGuid()}.png";
            string imageUrl = await _blobStorageService.UploadImageAsync(base64Image, fileName);
    
            
            var user = await _repo.RetrieveUserAsync(userId);
            if (user == null)
            {
                return NotFound(new { message = "User not found." });
            }
    
            user.Image = imageUrl;
            await _repo.UpdateUserAsync(user);
    
            return Ok(new { message = "Image uploaded successfully.", imageUrl = imageUrl });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while uploading the image.", error = ex.Message });
        }


    }

    [HttpGet("new-drivers")]
    public async Task<IActionResult> GetNewDrivers()
    {
        try
        {
            var drivers = await _repo.RetrieveUsersByStatusAsync(UserState.Created);
            return Ok(drivers);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while fetching new drivers.", error = ex.Message });
        }
    }


}
