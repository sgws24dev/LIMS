using ResearchLms.Scheduling.Domain.Entities;
using ResearchLms.Scheduling.Domain.Enums;

namespace ResearchLms.Scheduling.Domain.Interfaces;

public interface IWaitlistPromotionJob
{
    Task ExecuteAsync();
}

public interface INotificationService
{
    Task SendWaitlistPromotionAsync(WaitlistEntry entry);
}
