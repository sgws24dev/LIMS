using ResearchLms.Facilities.Application.DTOs;
using ResearchLms.Shared.Domain;

namespace ResearchLms.Facilities.Application.Interfaces;

public interface IFacilityService
{
    Task<Result<FacilityDto>> GetByIdAsync(Guid id, CancellationToken ct);
    Task<Result<(IReadOnlyList<FacilityDto> Items, int TotalCount)>> GetAllAsync(string? search, string? type, int page, int pageSize, CancellationToken ct);
    Task<Result<FacilityDto>> CreateAsync(CreateFacilityDto dto, CancellationToken ct);
    Task<Result<FacilityDto>> UpdateAsync(Guid id, UpdateFacilityDto dto, CancellationToken ct);
    Task<Result> DeleteAsync(Guid id, CancellationToken ct);
    Task<Result<IReadOnlyList<RoomDto>>> GetRoomsAsync(Guid facilityId, CancellationToken ct);
    Task<Result<RoomDto>> CreateRoomAsync(Guid facilityId, CreateRoomDto dto, CancellationToken ct);
    Task<Result<RoomDto>> UpdateRoomAsync(Guid id, UpdateRoomDto dto, CancellationToken ct);
    Task<Result> DeleteRoomAsync(Guid id, CancellationToken ct);
}
