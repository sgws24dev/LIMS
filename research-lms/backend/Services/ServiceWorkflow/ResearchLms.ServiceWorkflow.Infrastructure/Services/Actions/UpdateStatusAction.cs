using ResearchLms.ServiceWorkflow.Domain.Entities;
using ResearchLms.ServiceWorkflow.Domain.Enums;
using ResearchLms.ServiceWorkflow.Domain.Interfaces;
using ResearchLms.ServiceWorkflow.Domain.ValueObjects;
using ServiceRequestEntity = ResearchLms.ServiceWorkflow.Domain.Entities.ServiceRequest;

namespace ResearchLms.ServiceWorkflow.Infrastructure.Services.Actions;

public class UpdateStatusAction : IWorkflowAction
{
    private readonly IServiceRequestRepository _requestRepo;

    public UpdateStatusAction(IServiceRequestRepository requestRepo)
    {
        _requestRepo = requestRepo;
    }

    public string Name => "UpdateStatus";

    public async Task ExecuteAsync(
        WorkflowInstance instance,
        StateTransitionRecord transition,
        Dictionary<string, object> context,
        CancellationToken ct = default)
    {
        if (instance.EntityType != "ServiceRequest") return;

        var request = await _requestRepo.GetByIdAsync(instance.EntityId, ct);
        if (request is null) return;

        var newStatus = transition.ToState switch
        {
            "Submitted" => ServiceRequestStatus.Submitted,
            "Approved" => ServiceRequestStatus.Approved,
            "Rejected" => ServiceRequestStatus.Rejected,
            "InProgress" => ServiceRequestStatus.InProgress,
            "Completed" => ServiceRequestStatus.Completed,
            "Cancelled" => ServiceRequestStatus.Cancelled,
            "OnHold" => ServiceRequestStatus.OnHold,
            _ => (ServiceRequestStatus?)null
        };

        if (newStatus is null) return;

        try
        {
            if (newStatus == ServiceRequestStatus.Submitted)
                request.Submit(transition.TriggeredBy);
            else if (newStatus == ServiceRequestStatus.Approved)
                request.Approve(transition.TriggeredBy);
            else if (newStatus == ServiceRequestStatus.Rejected)
                request.Reject(transition.TriggeredBy, transition.Comment);
            else if (newStatus == ServiceRequestStatus.InProgress)
                request.SetInProgress(transition.TriggeredBy);
            else if (newStatus == ServiceRequestStatus.Completed)
                request.Complete(transition.TriggeredBy);
            else if (newStatus == ServiceRequestStatus.Cancelled)
                request.Cancel(transition.TriggeredBy, transition.Comment);
            else if (newStatus == ServiceRequestStatus.OnHold)
                request.Hold(transition.TriggeredBy, transition.Comment);

            await _requestRepo.UpdateAsync(request, ct);
        }
        catch
        {
            // Graceful no-op — invalid transitions are silently ignored
        }
    }
}
