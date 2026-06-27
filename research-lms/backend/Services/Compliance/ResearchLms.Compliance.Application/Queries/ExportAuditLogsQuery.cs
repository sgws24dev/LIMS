using MediatR;

namespace ResearchLms.Compliance.Application.Queries;

public record ExportAuditLogsQuery(
    string? EntityType, Guid? EntityId, string? UserId,
    DateTime? DateFrom, DateTime? DateTo, string? Operation
) : IRequest<byte[]>;

public class ExportAuditLogsQueryHandler : IRequestHandler<ExportAuditLogsQuery, byte[]>
{
    private readonly Domain.Interfaces.IAuditLogRepository _repository;

    public ExportAuditLogsQueryHandler(Domain.Interfaces.IAuditLogRepository repository)
    {
        _repository = repository;
    }

    public async Task<byte[]> Handle(ExportAuditLogsQuery request, CancellationToken ct)
    {
        var entries = await _repository.GetAllAsync(
            request.EntityType, request.EntityId, request.UserId,
            request.DateFrom, request.DateTo, request.Operation,
            1, int.MaxValue, ct);

        using var writer = new StringWriter();
        writer.WriteLine("Timestamp,EntityType,EntityId,Operation,ChangedByUserId,ChangedByUserName,ChangeReason,PreviousHash,CurrentHash");

        foreach (var e in entries)
        {
            writer.WriteLine($"\"{e.Timestamp:O}\",\"{EscapeCsv(e.EntityType)}\",\"{e.EntityId}\",\"{EscapeCsv(e.Operation)}\",\"{EscapeCsv(e.ChangedByUserId)}\",\"{EscapeCsv(e.ChangedByUserName)}\",\"{EscapeCsv(e.ChangeReason)}\",\"{e.PreviousHash ?? ""}\",\"{e.CurrentHash}\"");
        }

        return System.Text.Encoding.UTF8.GetBytes(writer.ToString());
    }

    private static string EscapeCsv(string value) => value.Replace("\"", "\"\"");
}
