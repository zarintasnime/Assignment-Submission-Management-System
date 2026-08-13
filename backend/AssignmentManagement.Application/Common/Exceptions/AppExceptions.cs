namespace AssignmentManagement.Application.Common.Exceptions;

public sealed class NotFoundException(string message) : Exception(message);

public sealed class ForbiddenException(string message) : Exception(message);

public sealed class ConflictException(string message) : Exception(message);

public sealed class BusinessRuleException(string message) : Exception(message);

public sealed class UnauthorizedAppException(string message) : Exception(message);
