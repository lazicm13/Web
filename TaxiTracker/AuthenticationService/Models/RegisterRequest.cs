using Common.Enums;

namespace AuthenticationService.Models
{
    public class RegisterRequest
    {
        public string Username { get; set; }
        public string EmailAddress { get; set; }
        public string Password { get; set; }
        public string FullName { get; set; }
        public string Address { get; set; }
        public string BirthDate { get; set; }
        public string Image { get; set; }
        public string UserType { get; set; }
    }
}
