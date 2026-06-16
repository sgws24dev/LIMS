using ResearchLms.Scheduling.Domain.Enums;

namespace ResearchLms.Scheduling.Domain;

public static class BookingStateMachine
{
    private static readonly Dictionary<BookingStatus, HashSet<BookingStatus>> _allowed = new()
    {
        [BookingStatus.Pending] = new() { BookingStatus.Confirmed, BookingStatus.Cancelled },
        [BookingStatus.Confirmed] = new() { BookingStatus.InProgress, BookingStatus.Cancelled, BookingStatus.NoShow },
        [BookingStatus.InProgress] = new() { BookingStatus.Completed, BookingStatus.Cancelled },
        [BookingStatus.Completed] = new(),
        [BookingStatus.Cancelled] = new(),
        [BookingStatus.NoShow] = new()
    };

    public static bool CanTransition(BookingStatus from, BookingStatus to) =>
        _allowed.TryGetValue(from, out var allowed) && allowed.Contains(to);

    public static void ValidateTransition(BookingStatus from, BookingStatus to)
    {
        if (!CanTransition(from, to))
            throw new InvalidOperationException(
                $"Cannot transition booking from {from} to {to}.");
    }
}
