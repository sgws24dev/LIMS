namespace ResearchLms.Training.Domain.ValueObjects;

public record PrerequisiteResult(
    bool IsAllowed,
    List<PrerequisiteResult.UnmetPrerequisite> UnmetPrerequisites)
{
    public record UnmetPrerequisite(
        string CompetencyName,
        DateTime? ExpiresAt,
        string SuggestedAction);
}
