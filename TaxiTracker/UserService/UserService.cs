using System;
using System.Collections.Generic;
using System.Fabric;
using System.IO;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.ServiceFabric.Services.Communication.AspNetCore;
using Microsoft.ServiceFabric.Services.Communication.Runtime;
using Microsoft.ServiceFabric.Services.Runtime;
using Microsoft.ServiceFabric.Data;
using System.Text;

namespace UserService
{
    /// <summary>
    /// The FabricRuntime creates an instance of this class for each service type instance.
    /// </summary>
    internal sealed class UserService : StatelessService
    {
        public UserService(StatelessServiceContext context)
            : base(context)
        { }

        /// <summary>
        /// Optional override to create listeners (like tcp, http) for this service instance.
        /// </summary>
        /// <returns>The collection of listeners.</returns>
        protected override IEnumerable<ServiceInstanceListener> CreateServiceInstanceListeners()
        {
            return new ServiceInstanceListener[]
            {
                new ServiceInstanceListener(serviceContext =>
                    new KestrelCommunicationListener(serviceContext, "ServiceEndpoint", (url, listener) =>
                    {
                        ServiceEventSource.Current.ServiceMessage(serviceContext, $"Starting Kestrel on {url}");

                        var builder = WebApplication.CreateBuilder();

                        // Load configuration from appsettings.json
                        builder.Configuration.SetBasePath(Directory.GetCurrentDirectory())
                                             .AddJsonFile("appsettings.json", optional: true, reloadOnChange: true)
                                             .AddEnvironmentVariables();

                        // Register StatelessServiceContext for dependency injection
                        builder.Services.AddSingleton<StatelessServiceContext>(serviceContext);

                        builder.Services.AddSingleton<UserDataRepository>();


                        // Add CORS services with specific origin
                        builder.Services.AddCors(options =>
                        {
                            options.AddPolicy("AllowSpecificOrigin",
                                policy =>
                                {
                                    policy.WithOrigins("http://localhost:5173") // Update the URL to your client URL
                                          .AllowAnyMethod()
                                          .AllowAnyHeader()
                                          .AllowCredentials();
                                });
                        });

                        // JWT Authentication configuration
                        var key = Encoding.ASCII.GetBytes(builder.Configuration["Jwt:Key"]);
                        builder.Services.AddAuthentication(options =>
                        {
                            options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                            options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
                        })
                        .AddJwtBearer(options =>
                        {
                            options.TokenValidationParameters = new TokenValidationParameters
                            {
                                ValidateIssuer = true,
                                ValidateAudience = true,
                                ValidateLifetime = true,
                                ValidateIssuerSigningKey = true,
                                ValidIssuer = builder.Configuration["Jwt:Issuer"],
                                ValidAudience = builder.Configuration["Jwt:Audience"],
                                IssuerSigningKey = new SymmetricSecurityKey(key)
                            };

                            // Enable JWT in HttpOnly cookies
                            options.Events = new JwtBearerEvents
                            {
                                OnMessageReceived = context =>
                                {
                                    var accessToken = context.Request.Cookies["access_token"];
                                    if (!string.IsNullOrEmpty(accessToken))
                                    {
                                        context.Token = accessToken;
                                    }
                                    return Task.CompletedTask;
                                }
                            };
                        });

                        builder.WebHost
                            .UseKestrel()
                            .UseContentRoot(Directory.GetCurrentDirectory())
                            .UseServiceFabricIntegration(listener, ServiceFabricIntegrationOptions.None)
                            .UseUrls(url);

                        // Add Controllers
                        builder.Services.AddControllers();

                        // Swagger setup
                        builder.Services.AddEndpointsApiExplorer();
                        builder.Services.AddSwaggerGen();

                        var app = builder.Build();

                        if (app.Environment.IsDevelopment())
                        {
                            app.UseSwagger();
                            app.UseSwaggerUI();
                        }

                        // Use CORS policy
                        app.UseCors("AllowSpecificOrigin");

                        // Enable authentication middleware
                        app.UseAuthentication();
                        app.UseAuthorization();

                        // Map controllers
                        app.MapControllers();

                        return app;
                    }))
            };
        }
    }
}
