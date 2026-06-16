using ResearchLms.Scheduling.Domain.Interfaces;

namespace ResearchLms.Scheduling.Infrastructure.BackgroundJobs;

public class WaitlistPromotionJob : IWaitlistPromotionJob
{
    private readonly IWaitlistService _waitlistService;

    public WaitlistPromotionJob(IWaitlistService waitlistService)
    {
        _waitlistService = waitlistService;
    }

    public async Task ExecuteAsync()
    {
        await _waitlistService.ExpireStalePromotionsAsync(CancellationToken.None);
    }
}
