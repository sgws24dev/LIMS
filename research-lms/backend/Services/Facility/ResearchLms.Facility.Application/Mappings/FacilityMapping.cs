using ResearchLms.Facilities.Application.DTOs;
using ResearchLms.Shared.Domain.Entities;

namespace ResearchLms.Facilities.Application.Mappings;

public static class FacilityMapping
{
    public static FacilityDto ToDto(Facility facility) => new(
        facility.Id, facility.TenantId, facility.Name,
        facility.Type, facility.Location, facility.IsActive,
        facility.CreatedAt);

    public static RoomDto ToDto(Room room) => new(
        room.Id, room.FacilityId, room.Name,
        room.RoomNumber, room.Capacity, room.RoomType,
        room.Utilization, room.CreatedAt);

    public static void Apply(Facility entity, UpdateFacilityDto dto)
        => entity.Update(dto.Name, dto.Type, dto.Location, dto.IsActive);

    public static void Apply(Room entity, UpdateRoomDto dto)
        => entity.Update(dto.Name, dto.RoomNumber, dto.Capacity, dto.RoomType);
}
