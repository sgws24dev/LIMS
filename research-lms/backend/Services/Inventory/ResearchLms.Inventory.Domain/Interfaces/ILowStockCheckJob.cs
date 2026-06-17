namespace ResearchLms.Inventory.Domain.Interfaces;

public interface ILowStockCheckJob
{
    Task ExecuteAsync();
}
