namespace ResearchLms.Shared.Exceptions;

public class DomainException : Exception
{
    public string Code { get; }

    public DomainException(string code, string message) : base(message)
    {
        Code = code;
    }
}

public class NotFoundException : DomainException
{
    public NotFoundException(string entityName, Guid id)
        : base("NOT_FOUND", $"{entityName} with id {id} was not found") { }
}

public class ValidationException : DomainException
{
    public ValidationException(string message)
        : base("VALIDATION_ERROR", message) { }
}

public class UnauthorizedException : DomainException
{
    public UnauthorizedException(string message = "You do not have permission to perform this action")
        : base("UNAUTHORIZED", message) { }
}
