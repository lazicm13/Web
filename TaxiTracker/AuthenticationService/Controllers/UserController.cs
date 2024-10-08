﻿using AuthenticationService;
using AuthenticationService.Models;
using AuthenticationService.Services;
using Common.Enums;
using Common.Models;
using Common.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using RideTrackingService.Interfaces;
using System;
using System.Security.Claims;
using System.Threading.Tasks;

[Route("user")]
[ApiController]
public class UserController : ControllerBase
{
    private readonly UserDataRepository _repo;
    private readonly TokenService _tokenService;
    private readonly BlobStorageService _blobStorageService;

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
        var existingToken = Request.Cookies["jwt"];
        if (string.IsNullOrEmpty(existingToken))
        {
            return Unauthorized(new { message = "User not logged in." });
        }

        var userId = _tokenService.GetUsernameFromToken(existingToken);
        if (userId == null)
        {
            return Unauthorized(new { message = "Invalid user information in token." });
        }

        var user = await _repo.RetrieveUserAsync(userId);
        if (user == null)
        {
            return NotFound(new { message = "User not found." });
        }

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

        var user = await _repo.RetrieveUserAsync(userId);
        if (user == null)
        {
            return NotFound(new { message = "User not found." });
        }
        if (user.UserState != UserState.Verified)
        {
            return BadRequest(new {message = "User is not verified and cannot update user data!"});
        }

        user.FullName = updateUserDto.FullName ?? user.FullName;
        user.Username = updateUserDto.Username ?? user.Username;
        user.EmailAddress = updateUserDto.EmailAddress ?? user.EmailAddress;
        user.BirthDate = updateUserDto.BirthDate ?? user.BirthDate;
        user.Address = updateUserDto.Address ?? user.Address;
        user.Image = updateUserDto.Image ?? user.Image;

        try
        {
            await _repo.UpdateUserAsync(user);

            return Ok(new { message = "User updated successfully." });
        }
        catch (Exception ex)
        {
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

        bool isOldPasswordCorrect = _repo.VerifyPassword(changePasswordDto.OldPassword, user.Password);
        if (!isOldPasswordCorrect)
        {
            return StatusCode(403, new { message = "Incorrect old password." });
        }

        user.Password = _repo.HashPassword(changePasswordDto.NewPassword);

        try
        {
            await _repo.UpdateUserAsync(user);
            return Ok(new { message = "Password changed successfully." });
        }
        catch (Exception ex)
        {
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

    [HttpGet("driver-status")]
    public async Task<IActionResult> GetDriverStatus()
    {
        var existingToken = Request.Cookies["jwt"];
        if (string.IsNullOrEmpty(existingToken))
        {
            return Unauthorized(new { message = "User not logged in." });
        }

        var userId = _tokenService.GetUsernameFromToken(existingToken);

        if (userId == null)
        {
            return Unauthorized(new { message = "Invalid user information in token." });
        }

        var user = await _repo.RetrieveUserAsync(userId);

        if (user == null)
        {
            return Unauthorized(new { message = "User with this id does not exist." });
        }
        var state = user.UserState;
        var userState = state.ToString();

        return Ok(new { status = userState });
    }
}
