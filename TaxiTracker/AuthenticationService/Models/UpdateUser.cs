namespace AuthenticationService.Models
{
    public class UpdateUser
    {
        public string FullName { get; set; }
        public string Username { get; set; }
        public string EmailAddress { get; set; }
        public string BirthDate { get; set; }
        public string Address { get; set; }
        public string Image {  get; set; }
    }
}
