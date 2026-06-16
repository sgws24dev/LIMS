using MediatR;
using ResearchLms.Scheduling.Domain.Entities;
using ResearchLms.Scheduling.Domain.Exceptions;
using ResearchLms.Scheduling.Domain.Interfaces;
using ResearchLms.Scheduling.Domain.ValueObjects;

namespace ResearchLms.Scheduling.Application.Commands;

public class CreateBookingCommandHandler : IRequestHandler<CreateBookingCommand, Guid>
{
    private readonly IBookingRepository _bookingRepo;
    private readonly IBookingResourceRepository _resourceRepo;
    private readonly IConstraintEvaluationService _constraintService;
    private readonly IAvailabilityService _availabilityService;
    private readonly IPricingService _pricingService;

    public CreateBookingCommandHandler(
        IBookingRepository bookingRepo,
        IBookingResourceRepository resourceRepo,
        IConstraintEvaluationService constraintService,
        IAvailabilityService availabilityService,
        IPricingService pricingService)
    {
        _bookingRepo = bookingRepo;
        _resourceRepo = resourceRepo;
        _constraintService = constraintService;
        _availabilityService = availabilityService;
        _pricingService = pricingService;
    }

    public async Task<Guid> Handle(CreateBookingCommand request, CancellationToken ct)
    {
        var resource = await _resourceRepo.GetByResourceIdAsync(request.ResourceId, ct);
        if (resource is null || !resource.IsActive)
            throw new NotFoundException("Resource not found or is inactive.");

        var overlap = await _bookingRepo.HasOverlapAsync(
            request.ResourceId, request.StartTime, request.EndTime, null, ct);
        if (overlap)
            throw new BookingConflictException(
                "Resource is already booked for this time slot.");

        var userConflicts = await _bookingRepo.GetByUserAndRangeAsync(
            request.UserId, request.StartTime, request.EndTime, ct);
        if (userConflicts.Any(b =>
            b.Status != Domain.Enums.BookingStatus.Cancelled &&
            b.Status != Domain.Enums.BookingStatus.NoShow))
        {
            throw new BookingConflictException(
                "You already have a booking during this time slot.");
        }

        var slot = new TimeSlot(request.StartTime, request.EndTime);
        var eval = await _constraintService.EvaluateAsync(
            request.ResourceId, request.UserId, slot, ct);
        if (!eval.IsSatisfied)
            throw new ConstraintViolationException(eval.Violations);

        var booking = new Booking(
            request.ResourceId,
            request.ResourceType,
            request.UserId,
            request.UserName,
            request.Title,
            request.StartTime.ToUniversalTime(),
            request.EndTime.ToUniversalTime(),
            request.Purpose,
            request.Notes);

        var cost = _pricingService.Calculate(
            resource.HourlyRate, request.StartTime, request.EndTime);
        booking.SetCost(cost.TotalAmount);

        await _bookingRepo.AddAsync(booking, ct);

        var bookingDate = DateOnly.FromDateTime(booking.StartTime);
        await _availabilityService.InvalidateCacheAsync(booking.ResourceId, bookingDate);

        return booking.Id;
    }
}
