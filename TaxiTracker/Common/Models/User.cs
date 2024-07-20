using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace Common.Models
{
    
    public class User
    {
        public User(string username, string emailAddress, string password, string fullName, string address, DateTime birthDate, string imageSource)
        {
            Username = username;
            EmailAddress = emailAddress;
            Password = password;
            FullName = fullName;
            Address = address;
            BirthDate = birthDate;
            ImageSource = imageSource;
        }

        public User()
        {
            Username = "";
            EmailAddress = "";
            Password = "";
            FullName = "";
            Address = "";
            ImageSource = "";
        }

        public string Username { get; set; }
        public string EmailAddress {  get; set; }
        public string Password { get; set; }
        public string FullName {  get; set; }
        public string Address {  get; set; }
        public DateTime BirthDate { get; set; }
        public string ImageSource {  get; set; }

        public override bool Equals(object? obj)
        {
            return obj is User user &&
                   Username == user.Username &&
                   EmailAddress == user.EmailAddress &&
                   Password == user.Password &&
                   FullName == user.FullName &&
                   Address == user.Address &&
                   BirthDate == user.BirthDate;
        }

        public override int GetHashCode()
        {
            return HashCode.Combine(Username, EmailAddress, Password, FullName, Address, BirthDate);
        }
    }
}
