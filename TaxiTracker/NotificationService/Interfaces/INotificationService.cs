using Common.Models;
using Microsoft.ServiceFabric.Services.Remoting;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace NotificationService.Interfaces
{
    public interface INotificationService : IService
    {
        Task<bool> SendNotificationAsync(EmailData emailData, bool accepted);
    }
}
