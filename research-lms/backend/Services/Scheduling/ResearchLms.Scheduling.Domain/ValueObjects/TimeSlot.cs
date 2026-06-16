namespace ResearchLms.Scheduling.Domain.ValueObjects;

public record TimeSlot(DateTime Start, DateTime End)
{
    public bool Overlaps(TimeSlot other) =>
        Start < other.End && End > other.Start;

    public double DurationHours => (End - Start).TotalHours;

    public bool IsValid() => Start < End && DurationHours <= 24;
}
