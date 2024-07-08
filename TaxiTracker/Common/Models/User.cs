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
        public string Username { get; set; }
        public string EmailAddress {  get; set; }
        public string Password { get; set; }
        public string Name {  get; set; }
        public string LastName {  get; set; }

    }
}
