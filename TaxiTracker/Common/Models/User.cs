using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.Models
{
    public enum TipKorisnika { Administrator, Korisnik, Vozac }
    public class User
    {
        private string username;
        private string email;
        private string password;
        private string fullName;
        private DateTime birthDate;
        private string address;
        private TipKorisnika tipKorisnika;
        private string imgSource;

        public string Username { get => username; set => username = value; }
        public string Email { get => email; set => email = value; }
        public string Password { get => password; set => password = value; }
        public string FullName { get => fullName; set => fullName = value; }
        public DateTime BirthDate { get => birthDate; set => birthDate = value; }
        public string Address { get => address; set => address = value; }
        public TipKorisnika TipKorisnika { get => tipKorisnika; set => tipKorisnika = value; }
        public string ImgSource { get => imgSource; set => imgSource = value; }

        public override bool Equals(object obj)
        {
            return obj is User user &&
                   username == user.username &&
                   email == user.email &&
                   password == user.password &&
                   fullName == user.fullName &&
                   birthDate == user.birthDate &&
                   address == user.address &&
                   tipKorisnika == user.tipKorisnika &&
                   imgSource == user.imgSource;
        }

        public override int GetHashCode()
        {
            return HashCode.Combine(username, email, password, fullName, birthDate, address, tipKorisnika, imgSource);
        }

        public User()
        {

        }

        public User(string username, string email, string password, string fullName, DateTime birthDate, string address, TipKorisnika tipKorisnika, string imgSource)
        {
            this.username = username;
            this.email = email;
            this.password = password;
            this.fullName = fullName;
            this.birthDate = birthDate;
            this.address = address;
            this.tipKorisnika = tipKorisnika;   
            this.imgSource = imgSource;
        }
    }
}