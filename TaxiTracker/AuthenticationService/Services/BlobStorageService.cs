using Azure.Storage.Blobs;
using System;
using System.IO;
using System.Threading.Tasks;

public class BlobStorageService
{
    private readonly BlobServiceClient _blobServiceClient;
    private readonly string _containerName = "user-images";

    public BlobStorageService()
    {
        string connectionString = "UseDevelopmentStorage=true;";
        _blobServiceClient = new BlobServiceClient(connectionString);
    }

    public async Task<string> UploadImageAsync(string base64Image, string fileName)
    {
        var containerClient = _blobServiceClient.GetBlobContainerClient(_containerName);
        await containerClient.CreateIfNotExistsAsync();

        var blobClient = containerClient.GetBlobClient(fileName);

        using (var stream = new MemoryStream(Convert.FromBase64String(base64Image)))
        {
            await blobClient.UploadAsync(stream, overwrite: true);
        }

        return blobClient.Uri.ToString();
    }
}
