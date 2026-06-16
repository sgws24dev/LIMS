using MediatR;
using ResearchLms.Facilities.Application.DTOs;
using ResearchLms.Shared.Domain;

namespace ResearchLms.Facilities.Application.Commands;

public record CreateMaintenanceRecordCommand(CreateMaintenanceRecordRequest Data) : IRequest<Result<Guid>>;
public record UpdateMaintenanceRecordCommand(Guid Id, UpdateMaintenanceRecordRequest Data) : IRequest<Result>;
public record CompleteMaintenanceRecordCommand(Guid Id, CompleteMaintenanceRecordRequest Data) : IRequest<Result>;
public record CreateWorkOrderCommand(Guid MaintenanceRecordId, CreateWorkOrderRequest Data) : IRequest<Result<Guid>>;
public record UpdateWorkOrderCommand(Guid Id, UpdateWorkOrderRequest Data) : IRequest<Result>;
public record ResolveWorkOrderCommand(Guid Id, ResolveWorkOrderRequest Data) : IRequest<Result>;
