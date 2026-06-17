using ResearchLms.Shared.Abstractions;

namespace ResearchLms.Projects.Domain.Entities;

public class CostCenter : BaseEntity
{
    public string Code { get; private set; }
    public string Name { get; private set; }
    public string? Description { get; private set; }
    public decimal BudgetAmount { get; private set; }
    public decimal SpentAmount { get; private set; }
    public Guid? ManagerId { get; private set; }
    public string? ManagerName { get; private set; }
    public bool IsActive { get; private set; }
    public int FiscalYear { get; private set; }

    public decimal RemainingBudget => BudgetAmount - SpentAmount;

    public decimal UtilizationPercent =>
        BudgetAmount == 0 ? 0 : Math.Round((SpentAmount / BudgetAmount) * 100, 2);

    public bool IsOverBudget => SpentAmount > BudgetAmount && BudgetAmount > 0;

    private CostCenter() { Code = null!; Name = null!; }

    public CostCenter(
        string code,
        string name,
        string? description,
        decimal budgetAmount,
        Guid? managerId,
        string? managerName,
        int? fiscalYear)
    {
        Code = code;
        Name = name;
        Description = description;
        BudgetAmount = budgetAmount;
        SpentAmount = 0;
        ManagerId = managerId;
        ManagerName = managerName;
        IsActive = true;
        FiscalYear = fiscalYear ?? DateTime.UtcNow.Year;
    }

    public void Update(string name, string? description, decimal budgetAmount,
        Guid? managerId, string? managerName, bool isActive)
    {
        Name = name;
        Description = description;
        BudgetAmount = budgetAmount;
        ManagerId = managerId;
        ManagerName = managerName;
        IsActive = isActive;
    }

    public void AddSpent(decimal amount)
    {
        SpentAmount += amount;
    }
}
