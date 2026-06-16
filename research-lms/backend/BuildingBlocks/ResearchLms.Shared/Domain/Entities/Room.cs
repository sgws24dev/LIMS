using ResearchLms.Shared.Abstractions;

namespace ResearchLms.Shared.Domain.Entities;

public class Room : BaseEntity
{
    public Guid FacilityId { get; private set; }
    public string Name { get; private set; } = string.Empty;
    public string? RoomNumber { get; private set; }
    public int Capacity { get; private set; }
    public string? RoomType { get; private set; }
    public double Utilization { get; private set; }

    private Room() { }

    public Room(Guid facilityId, string name, string? roomNumber, int capacity, string? roomType)
    {
        FacilityId = facilityId;
        Name = name;
        RoomNumber = roomNumber;
        Capacity = capacity;
        RoomType = roomType;
    }

    public void Update(string name, string? roomNumber, int capacity, string? roomType)
    {
        Name = name;
        RoomNumber = roomNumber;
        Capacity = capacity;
        RoomType = roomType;
    }

    public void SetUtilization(double utilization)
    {
        Utilization = utilization;
    }
}
