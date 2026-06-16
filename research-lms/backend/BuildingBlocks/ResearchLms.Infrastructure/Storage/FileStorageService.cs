using Microsoft.Extensions.Configuration;

namespace ResearchLms.Infrastructure.Storage;

public interface IFileStorageService
{
    Task<string> UploadAsync(Stream fileStream, string fileName, string contentType);
    Task<string> GetUrlAsync(string fileKey);
    Task DeleteAsync(string fileKey);
}

public class FileStorageService : IFileStorageService
{
    private readonly string _basePath;
    private readonly string _baseUrl;

    public FileStorageService(IConfiguration configuration)
    {
        _basePath = configuration.GetValue<string>("FileStorage:LocalPath") ?? Path.Combine(Directory.GetCurrentDirectory(), "uploads");
        _baseUrl = configuration.GetValue<string>("FileStorage:BaseUrl") ?? "/uploads";
        Directory.CreateDirectory(_basePath);
    }

    public async Task<string> UploadAsync(Stream fileStream, string fileName, string contentType)
    {
        var fileKey = $"{Guid.NewGuid():N}_{fileName}";
        var fullPath = Path.Combine(_basePath, fileKey);

        await using var file = new FileStream(fullPath, FileMode.Create, FileAccess.Write);
        await fileStream.CopyToAsync(file);

        return fileKey;
    }

    public Task<string> GetUrlAsync(string fileKey)
    {
        var url = $"{_baseUrl}/{fileKey}";
        return Task.FromResult(url);
    }

    public Task DeleteAsync(string fileKey)
    {
        var fullPath = Path.Combine(_basePath, fileKey);
        if (File.Exists(fullPath))
            File.Delete(fullPath);
        return Task.CompletedTask;
    }
}
