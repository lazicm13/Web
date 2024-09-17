﻿using Azure.Data.Tables;
using Azure;
using Common.Models;
using System.Diagnostics;
using Common.Enums;

namespace AuthenticationService.Services
{
    public class UserDataRepository
    {
        private readonly TableClient _tableClient;

        public UserDataRepository()
        {
            string storageConnectionString = "UseDevelopmentStorage=true;";
            var serviceClient = new TableServiceClient(storageConnectionString);
            _tableClient = serviceClient.GetTableClient("UserTable");
            _tableClient.CreateIfNotExists();
        }

        public async Task<bool> ExistsAsync(string userNo)
        {
            var user = await RetrieveUserAsync(userNo);
            return user != null;
        }

        public async Task<IEnumerable<User>> RetrieveAllUsersAsync()
        {
            var users = new List<User>();
            await foreach (var user in _tableClient.QueryAsync<User>(u => u.PartitionKey == "User"))
            {
                users.Add(user);
            }
            return users;
        }

        public async Task<User> RetrieveUserAsync(string userNo)
        {
            try
            {
                var response = await _tableClient.GetEntityAsync<User>("User", userNo);
                return response.Value;
            }
            catch (RequestFailedException e) when (e.Status == 404)
            {
                return null;
            }
        }

        public async Task AddUserAsync(User newUser)
        {
            try
            {
                await _tableClient.AddEntityAsync(newUser);
            }
            catch (Exception e)
            {
                Debug.WriteLine(e.Message + e.StackTrace);
            }
        }

        public async Task UpdateUserAsync(User user)
        {
            await _tableClient.UpdateEntityAsync(user, user.ETag, TableUpdateMode.Replace);
        }

        public async Task<IEnumerable<User>> RetrieveUsersByStatusAsync(UserState status)
        {
            var users = new List<User>();

            // Retrieve all users and filter in-memory by UserState
            await foreach (var user in _tableClient.QueryAsync<User>(u => u.PartitionKey == "User"))
            {
                if (user.UserState != null && user.UserState == status)
                {
                    users.Add(user);
                }
            }

            return users;
        }

        public string HashPassword(string password)
        {
            return BCrypt.Net.BCrypt.HashPassword(password);
        }

        public bool VerifyPassword(string password, string hashedPassword)
        {
            return BCrypt.Net.BCrypt.Verify(password, hashedPassword);
        }
    }
}
