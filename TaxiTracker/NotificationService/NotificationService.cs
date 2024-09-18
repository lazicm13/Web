using System;
using System.Collections.Generic;
using System.Fabric;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.ServiceFabric.Services.Communication.Runtime;
using Microsoft.ServiceFabric.Services.Runtime;
using Microsoft.ServiceFabric.Services.Remoting.Runtime;
using Microsoft.ServiceFabric.Services.Remoting.V2.FabricTransport.Runtime;
using NotificationService.Interfaces;
using Microsoft.Extensions.Configuration;
using System.Net.Mail;
using System.Diagnostics;
using System.Net;
using System.ComponentModel.DataAnnotations;
using Common.Models;

namespace NotificationService
{
    /// <summary>
    /// An instance of this class is created for each service instance by the Service Fabric runtime.
    /// </summary>
    internal sealed class NotificationService : StatelessService, INotificationService
    {
        private string smtpServer;
        private int port;
        private string smtpUsername;
        private string smtpPassword;
        private string fromEmail;


        public NotificationService(StatelessServiceContext context)
            : base(context)
        {
            LoadConfiguration(context);
        }

        private void LoadConfiguration(StatelessServiceContext context)
        {
            var configPackage = context.CodePackageActivationContext.GetConfigurationPackageObject("Config");
            var emailSettings = configPackage.Settings.Sections["NotificationServiceSettings"];

            smtpServer = emailSettings.Parameters["SmtpServer"].Value;
            port = int.Parse(emailSettings.Parameters["Port"].Value);
            smtpUsername = emailSettings.Parameters["SmtpUsername"].Value;
            smtpPassword = emailSettings.Parameters["SmtpPassword"].Value;
            fromEmail = emailSettings.Parameters["FromEmail"].Value;
        }


        /// <summary>
        /// Optional override to create listeners (e.g., TCP, HTTP) for this service replica to handle client or user requests.
        /// </summary>
        /// <returns>A collection of listeners.</returns>
        protected override IEnumerable<ServiceInstanceListener> CreateServiceInstanceListeners()
        {
            return this.CreateServiceRemotingInstanceListeners();
        }

        /// <summary>
        /// This is the main entry point for your service instance.
        /// </summary>
        /// <param name="cancellationToken">Canceled when Service Fabric needs to shut down this service instance.</param>
        protected override async Task RunAsync(CancellationToken cancellationToken)
        {
            // TODO: Replace the following sample code with your own logic 
            //       or remove this RunAsync override if it's not needed in your service.

            long iterations = 0;

            while (true)
            {
                cancellationToken.ThrowIfCancellationRequested();

                ServiceEventSource.Current.ServiceMessage(this.Context, "Working-{0}", ++iterations);

                await Task.Delay(TimeSpan.FromSeconds(1), cancellationToken);
            }
        }

        public async Task<bool> SendNotificationAsync(EmailData emailData, bool accepted)
        {
            try
            {
                string subject = string.Empty;
                string htmlContent = string.Empty;
                string plainTextContent = string.Empty;

                if (accepted)
                {
                    subject = $"Your application is accepted, Welcome {emailData.EmailAddress}";

                    htmlContent = $@"
                    <html>
                    <body>
                        <h1>Account Verified</h1>
                        <p>Dear {emailData.FullName},</p>
                        <p>Your driver account has been verified successfully.</p>
                        <p>Best regards,<br/>Taxi Service Team</p>
                    </body>
                    </html>";

                    plainTextContent = $@"
                    Account Verified
                    Dear {emailData.FullName},
                    Your driver account has been verified successfully.
                    Best regards,
                    Taxi Service Team";
                }
                else
                {
                    subject = $"{emailData.EmailAddress}, Your application is rejected";

                    htmlContent = $@"
                    <html>
                    <body>
                        <h1>Account rejected</h1>
                        <p>Dear {emailData.FullName},</p>
                        <p>Your driver account has been rejected</p>
                        <p>Best regards,<br/>Taxi Service Team</p>
                    </body>
                    </html>";

                    plainTextContent = $@"
                    Account Rejected
                    Dear {emailData.FullName},
                    Your driver account has been rejected!
                    Best regards,
                    Taxi Service Team";
                }

                using (var client = new SmtpClient(smtpServer, port))
                {
                    client.EnableSsl = true;
                    client.Credentials = new NetworkCredential(smtpUsername, smtpPassword);

                    using (var message = new MailMessage(fromEmail, emailData.EmailAddress))
                    {
                        message.Subject = subject;
                        message.IsBodyHtml = true;
                        message.AlternateViews.Add(AlternateView.CreateAlternateViewFromString(plainTextContent, null, "text/plain"));
                        message.AlternateViews.Add(AlternateView.CreateAlternateViewFromString(htmlContent, null, "text/html"));

                        await client.SendMailAsync(message);
                        Trace.TraceInformation("Email sent successfully.");
                    }
                }

                return true;
            }
            catch (Exception ex)
            {
                Trace.TraceError($"Error while sending mail: {ex.Message + ex.StackTrace}");
                return false;
            }
        }
    }
}
