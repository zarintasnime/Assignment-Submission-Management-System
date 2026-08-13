namespace AssignmentManagement.Infrastructure.Security;

public sealed class JwtOptions
{
    public string Issuer { get; init; } = "AssignmentManagement.Api";
    public string Audience { get; init; } = "AssignmentManagement.Client";
    public string Key { get; init; } = string.Empty;
    public int ExpireMinutes { get; init; } = 120;
}
