using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.Extensions.Configuration;
using System.Security.Claims;
using Microsoft.IdentityModel.Tokens;
using Azure.Core;


namespace Common.Services
{
    public class TokenService
    {
        private readonly string _secretKey;
        private readonly string _issuer;
        private readonly string _audience;

        public TokenService(IConfiguration configuration)
        {
            _secretKey = configuration["Jwt:Key"]; // Fetch the key from configuration
            _issuer = configuration["Jwt:Issuer"];
            _audience = configuration["Jwt:Audience"];
        }

        public string GenerateJwtToken(string emailAddress, string role, IConfiguration _configuration)
        {
            var key = Encoding.ASCII.GetBytes(_configuration["Jwt:Key"]);
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim(ClaimTypes.Name, emailAddress),
                    new Claim(ClaimTypes.Role, role) 
                }),
                Expires = DateTime.UtcNow.AddHours(1),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature),
                Issuer = _configuration["Jwt:Issuer"],
                Audience = _configuration["Jwt:Audience"]
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }

        public ClaimsPrincipal ValidateToken(string token)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(_secretKey);

            try
            {
                var tokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(key),
                    ValidateIssuer = true,
                    ValidIssuer = _issuer,
                    ValidateAudience = true,
                    ValidAudience = _audience,
                    ValidateLifetime = true,
                    ClockSkew = TimeSpan.Zero // Optional: Use zero tolerance for token expiration
                };

                var principal = tokenHandler.ValidateToken(token, tokenValidationParameters, out SecurityToken validatedToken);

                // Additional validation to check if the token is a valid JWT token
                if (validatedToken is JwtSecurityToken jwtToken && jwtToken.Header.Alg.Equals(SecurityAlgorithms.HmacSha256, StringComparison.InvariantCultureIgnoreCase))
                {
                    return principal;
                }
            }
            catch
            {
                // Token validation failed
                return null;
            }

            return null;
        }

        public string GetUsernameFromToken(string token)
        {
            if (string.IsNullOrEmpty(token))
            {
                return null;
            }

            ClaimsPrincipal principal;
            try
            {
                principal = ValidateToken(token);
            }
            catch (Exception ex)
            {
                return null;
            }

            var userId = principal?.Identity?.Name ?? principal?.FindFirst(ClaimTypes.Name)?.Value;

            if (userId == null)
            {
                return null;
            }

            return userId;
        }

        public bool IsUserInRole(string token, string requiredRole)
        {
            var principal = ValidateToken(token);
            if (principal != null)
            {
                var roleClaim = principal.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Role)?.Value;
                return roleClaim == requiredRole;
            }
            return false;
        }
    }
}
