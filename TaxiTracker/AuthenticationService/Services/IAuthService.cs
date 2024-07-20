using Common.Models;

namespace AuthenticationService.Services
{
    public interface IAuthService
    {
        Task<bool> RegisterAsync(User user);
    }
}
