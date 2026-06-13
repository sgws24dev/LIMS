using ResearchLms.Shared.Abstractions;

namespace ResearchLms.Shared.Domain.Entities;

public enum AbacOperator
{
    Eq,
    Neq,
    In,
    Gt,
    Lt,
    Contains
}

public enum AbacEffect
{
    Allow,
    Deny
}

public sealed class AbacRule : BaseEntity
{
    private AbacRule() { }

    public AbacRule(
        string name,
        string? description,
        string attributeName,
        AbacOperator @operator,
        string attributeValue,
        string resourceType,
        AbacEffect effect,
        int priority,
        bool isEnabled)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(name);
        ArgumentException.ThrowIfNullOrWhiteSpace(attributeName);
        ArgumentException.ThrowIfNullOrWhiteSpace(attributeValue);
        ArgumentException.ThrowIfNullOrWhiteSpace(resourceType);

        Name = name;
        Description = description;
        AttributeName = attributeName;
        Operator = @operator;
        AttributeValue = attributeValue;
        ResourceType = resourceType;
        Effect = effect;
        Priority = priority;
        IsEnabled = isEnabled;
    }

    public string Name { get; private set; } = string.Empty;
    public string? Description { get; private set; }
    public string AttributeName { get; private set; } = string.Empty;
    public AbacOperator Operator { get; private set; }
    public string AttributeValue { get; private set; } = string.Empty;
    public string ResourceType { get; private set; } = string.Empty;
    public AbacEffect Effect { get; private set; }
    public int Priority { get; private set; }
    public bool IsEnabled { get; private set; }
}
