using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.Models
{
    public enum TipKorisnika { Administrator, Korisnik, Vozac}
    public class User
    {
        private string username;
        private string email;
        private string password;
        private string fullName;
        private DateTime birthDate;
        private string address;
        
    }
}
