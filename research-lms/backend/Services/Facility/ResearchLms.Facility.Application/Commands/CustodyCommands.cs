using MediatR;
using ResearchLms.Facilities.Application.DTOs;
using ResearchLms.Shared.Domain;

namespace ResearchLms.Facilities.Application.Commands;

public record TransferAssetCustodyCommand(TransferAssetCustodyRequest Data) : IRequest<Result<Guid>>;
