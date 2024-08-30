namespace AuthenticationService.Models
{
    public class UpdateUser
    {
        // Ime korisnika
        public string FullName { get; set; }

        // Korisničko ime
        public string Username { get; set; }

        // E-mail adresa
        public string EmailAddress { get; set; }

        // Datum rođenja
        public string BirthDate { get; set; }

        // Adresa
        public string Address { get; set; }
    }
}
