using ResearchLms.Shared.Abstractions;

namespace ResearchLms.Content.Domain.Entities;

public enum WalkthroughProgressStatus
{
    InProgress,
    Completed,
    Skipped
}

public class UserWalkthroughProgress : BaseEntity
{
    public Guid UserId { get; private set; }
    public Guid WalkthroughId { get; private set; }
    public int? CurrentStepIndex { get; private set; }
    public WalkthroughProgressStatus Status { get; private set; }
    public DateTime? CompletedAt { get; private set; }

    protected UserWalkthroughProgress() { }

    public UserWalkthroughProgress(Guid userId, Guid walkthroughId)
    {
        UserId = userId;
        WalkthroughId = walkthroughId;
        CurrentStepIndex = 0;
        Status = WalkthroughProgressStatus.InProgress;
    }

    public void SaveProgress(int stepIndex)
    {
        CurrentStepIndex = stepIndex;
        Status = WalkthroughProgressStatus.InProgress;
    }

    public void MarkCompleted()
    {
        CurrentStepIndex = null;
        Status = WalkthroughProgressStatus.Completed;
        CompletedAt = DateTime.UtcNow;
    }

    public void MarkSkipped()
    {
        CurrentStepIndex = null;
        Status = WalkthroughProgressStatus.Skipped;
        CompletedAt = DateTime.UtcNow;
    }
}