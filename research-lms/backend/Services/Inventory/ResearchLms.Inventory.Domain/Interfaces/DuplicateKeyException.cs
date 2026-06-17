namespace ResearchLms.Inventory.Domain.Interfaces;

public class DuplicateKeyException : Exception
{
    public DuplicateKeyException(string message) : base(message) { }
    public DuplicateKeyException(string message, Exception inner) : base(message, inner) { }
}
