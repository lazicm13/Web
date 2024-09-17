using Azure.Storage.Blobs;
using System;
using System.IO;
using System.Threading.Tasks;

public class BlobStorageService
{
    private readonly BlobServiceClient _blobServiceClient;
    private readonly string _connectionString = "UseDevelopmentStorage=true;";

    public BlobStorageService()
    {
        _blobServiceClient = new BlobServiceClient(_connectionString);
    }

    public async Task<string> UploadImageAsync(string base64Image, string fileName)
    {
        var containerClient = _blobServiceClient.GetBlobContainerClient("images");
        await containerClient.CreateIfNotExistsAsync();
        var blobClient = containerClient.GetBlobClient(fileName);

        // Convert base64 string to byte array
        byte[] imageBytes = Convert.FromBase64String(base64Image);

        using (var stream = new MemoryStream(imageBytes))
        {
            await blobClient.UploadAsync(stream, overwrite: true);
        }

        return blobClient.Uri.AbsoluteUri; // Return URL to the uploaded image
    }

    public async Task DeleteImageAsync(string fileName)
    {
        var containerClient = _blobServiceClient.GetBlobContainerClient("images");
        var blobClient = containerClient.GetBlobClient(fileName);

        // Check if the blob exists before attempting to delete
        if (await blobClient.ExistsAsync())
        {
            await blobClient.DeleteAsync();
            Console.WriteLine($"Blob with name {fileName} deleted successfully.");
        }
        else
        {
            Console.WriteLine($"Blob with name {fileName} does not exist.");
        }
    }
}
