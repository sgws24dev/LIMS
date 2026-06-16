using MediatR;
using ResearchLms.Facilities.Application.DTOs;
using ResearchLms.Shared.Domain;

namespace ResearchLms.Facilities.Application.Commands;

public record CreateAssetCommand(CreateAssetRequest Data) : IRequest<Result<Guid>>;

public record UpdateAssetCommand(Guid Id, UpdateAssetRequest Data) : IRequest<Result>;

public record DecommissionAssetCommand(Guid Id, string? Reason) : IRequest<Result>;
