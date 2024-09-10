namespace AuthenticationService.Models
{
    public class LoginRequest
    {
        public string EmailAddress { get; set; }
        public string Password { get; set; }

        public LoginRequest(string emailAddress, string password)
        {
            EmailAddress = emailAddress;
            Password = password;
        }
    }
}
