using ResearchLms.Facilities.Application.DTOs;
using ResearchLms.Facilities.Application.Interfaces;
using ResearchLms.Facilities.Application.Mappings;
using ResearchLms.Facilities.Domain.Interfaces;
using ResearchLms.Infrastructure.Persistence;
using ResearchLms.Shared.Abstractions;
using ResearchLms.Shared.Domain;
using ResearchLms.Shared.Domain.Entities;

namespace ResearchLms.Facilities.Infrastructure.Services;

public class FacilityService : IFacilityService
{
    private readonly IFacilityRepository _facilityRepo;
    private readonly IRoomRepository _roomRepo;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ITenantContext _tenantContext;

    public FacilityService(
        IFacilityRepository facilityRepo,
        IRoomRepository roomRepo,
        IUnitOfWork unitOfWork,
        ITenantContext tenantContext)
    {
        _facilityRepo = facilityRepo;
        _roomRepo = roomRepo;
        _unitOfWork = unitOfWork;
        _tenantContext = tenantContext;
    }

    public async Task<Result<FacilityDto>> GetByIdAsync(Guid id, CancellationToken ct)
    {
        var facility = await _facilityRepo.GetByIdAsync(id, ct);
        return facility is null
            ? Result.Failure<FacilityDto>("FACILITY_NOT_FOUND", "Facility not found.")
            : Result.Success(FacilityMapping.ToDto(facility));
    }

    public async Task<Result<(IReadOnlyList<FacilityDto> Items, int TotalCount)>> GetAllAsync(
        string? search, string? type, int page, int pageSize, CancellationToken ct)
    {
        var result = await _facilityRepo.GetAllAsync(search, type, page, pageSize, ct);
        return Result.Success((result.Items.Select(FacilityMapping.ToDto).ToList() as IReadOnlyList<FacilityDto>, result.TotalCount));
    }

    public async Task<Result<FacilityDto>> CreateAsync(CreateFacilityDto dto, CancellationToken ct)
    {
        var facility = new Facility(dto.Name, dto.Type, dto.Location);
        await _facilityRepo.AddAsync(facility, ct);
        await _unitOfWork.SaveChangesAsync(ct);
        return Result.Success(FacilityMapping.ToDto(facility));
    }

    public async Task<Result<FacilityDto>> UpdateAsync(Guid id, UpdateFacilityDto dto, CancellationToken ct)
    {
        var facility = await _facilityRepo.GetByIdAsync(id, ct);
        if (facility is null)
            return Result.Failure<FacilityDto>("FACILITY_NOT_FOUND", "Facility not found.");
        FacilityMapping.Apply(facility, dto);
        await _facilityRepo.UpdateAsync(facility, ct);
        await _unitOfWork.SaveChangesAsync(ct);
        return Result.Success(FacilityMapping.ToDto(facility));
    }

    public async Task<Result> DeleteAsync(Guid id, CancellationToken ct)
    {
        var facility = await _facilityRepo.GetByIdAsync(id, ct);
        if (facility is null)
            return Result.Failure("FACILITY_NOT_FOUND", "Facility not found.");
        await _facilityRepo.DeleteAsync(id, ct);
        await _unitOfWork.SaveChangesAsync(ct);
        return Result.Success();
    }

    public async Task<Result<IReadOnlyList<RoomDto>>> GetRoomsAsync(Guid facilityId, CancellationToken ct)
    {
        var rooms = await _roomRepo.GetByFacilityIdAsync(facilityId, ct);
        return Result.Success<IReadOnlyList<RoomDto>>(rooms.Select(FacilityMapping.ToDto).ToList().AsReadOnly());
    }

    public async Task<Result<RoomDto>> CreateRoomAsync(Guid facilityId, CreateRoomDto dto, CancellationToken ct)
    {
        var facility = await _facilityRepo.GetByIdAsync(facilityId, ct);
        if (facility is null)
            return Result.Failure<RoomDto>("FACILITY_NOT_FOUND", "Facility not found.");
        var room = new Room(facilityId, dto.Name, dto.RoomNumber, dto.Capacity, dto.RoomType);
        await _roomRepo.AddAsync(room, ct);
        await _unitOfWork.SaveChangesAsync(ct);
        return Result.Success(FacilityMapping.ToDto(room));
    }

    public async Task<Result<RoomDto>> UpdateRoomAsync(Guid id, UpdateRoomDto dto, CancellationToken ct)
    {
        var room = await _roomRepo.GetByIdAsync(id, ct);
        if (room is null)
            return Result.Failure<RoomDto>("ROOM_NOT_FOUND", "Room not found.");
        FacilityMapping.Apply(room, dto);
        await _roomRepo.UpdateAsync(room, ct);
        await _unitOfWork.SaveChangesAsync(ct);
        return Result.Success(FacilityMapping.ToDto(room));
    }

    public async Task<Result> DeleteRoomAsync(Guid id, CancellationToken ct)
    {
        var room = await _roomRepo.GetByIdAsync(id, ct);
        if (room is null)
            return Result.Failure("ROOM_NOT_FOUND", "Room not found.");
        await _roomRepo.DeleteAsync(id, ct);
        await _unitOfWork.SaveChangesAsync(ct);
        return Result.Success();
    }
}
