namespace ResearchLms.Infrastructure.Storage;

public interface IFileStorageService
{
    Task<string> UploadAsync(Stream fileStream, string fileName, string contentType);
    Task<string> GetUrlAsync(string fileKey);
    Task DeleteAsync(string fileKey);
}

public class FileStorageService : IFileStorageService
{
    public Task<string> UploadAsync(Stream fileStream, string fileName, string contentType)
    {
        return Task.FromResult($"https://storage.researchlms.com/files/{Guid.NewGuid()}/{fileName}");
    }

    public Task<string> GetUrlAsync(string fileKey)
    {
        return Task.FromResult($"https://storage.researchlms.com/files/{fileKey}");
    }

    public Task DeleteAsync(string fileKey)
    {
        return Task.CompletedTask;
    }
}
