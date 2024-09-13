using Azure.Storage.Blobs;

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
}
