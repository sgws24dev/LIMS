namespace ResearchLms.Compliance.Domain.Interfaces;

public interface IChangeReasonProvider
{
    string? CurrentChangeReason { get; }
    void SetChangeReason(string reason);
}
