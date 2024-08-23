using Azure;
using Azure.Data.Tables;
using System;
using System.Text.Json.Serialization;

namespace Common.Models
{
    public class User : ITableEntity
    {
        public string PartitionKey { get; set; } = "User";
        public string? RowKey { get; set; }
        public DateTimeOffset? Timestamp { get; set; }
        public ETag ETag { get; set; }


        public string Username { get; set; }
        public string EmailAddress { get; set; }
        public string Password { get; set; }
        public string FullName { get; set; }
        public string Address { get; set; }
        public string BirthDate { get; set; }
        public string? Image { get; set; }


        public User(string username, string emailAddress, string password, string fullName, string address, string birthDate, string image)
        {
            RowKey = emailAddress;
            Username = username;
            EmailAddress = emailAddress;
            Password = password;
            FullName = fullName;
            Address = address;
            BirthDate = birthDate;
            Image = image;
        }

        public User() { }
    }
}
