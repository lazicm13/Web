using Azure;
using Azure.Data.Tables;
using System;
using System.Text.Json.Serialization;

namespace Common.Models
{
    public class User : ITableEntity
    {
        public string PartitionKey { get; set; } = "User";  //radilo sa upitnikom
        public string? RowKey { get; set; }
        public DateTimeOffset? Timestamp { get; set; }
        public ETag ETag { get; set; }


        public string Username { get; set; }
        public string EmailAddress { get; set; }
        public string Password { get; set; }
        public string FullName { get; set; }
        public string Address { get; set; }


        public User(string username, string emailAddress, string password, string fullName, string address)
        {
            RowKey = emailAddress;
            Username = username;
            EmailAddress = emailAddress;
            Password = password;
            FullName = fullName;
            Address = address;
        }

        public User() { }
    }
}
