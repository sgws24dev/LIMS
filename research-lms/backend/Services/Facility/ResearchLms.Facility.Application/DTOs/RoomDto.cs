namespace ResearchLms.Facilities.Application.DTOs;

public record RoomDto(
    Guid Id,
    Guid FacilityId,
    string Name,
    string? RoomNumber,
    int Capacity,
    string? RoomType,
    double Utilization,
    DateTime CreatedAt);

public record CreateRoomDto(
    string Name,
    string? RoomNumber,
    int Capacity,
    string? RoomType);

public record UpdateRoomDto(
    string Name,
    string? RoomNumber,
    int Capacity,
    string? RoomType);
