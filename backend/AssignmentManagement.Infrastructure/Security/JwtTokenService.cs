using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using AssignmentManagement.Application.Abstractions;
using AssignmentManagement.Domain.Entities;
using Microsoft.IdentityModel.Tokens;

namespace AssignmentManagement.Infrastructure.Security;

public sealed class JwtTokenService(JwtOptions options) : IJwtTokenService
{
    public TokenResult Create(User user)
    {
        var now = DateTime.UtcNow;
        var expires = now.AddMinutes(options.ExpireMinutes);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Name, user.FullName),
            new Claim(ClaimTypes.Role, user.Role.ToString())
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(options.Key));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            options.Issuer,
            options.Audience,
            claims,
            now,
            expires,
            credentials);

        return new TokenResult(
            new JwtSecurityTokenHandler().WriteToken(token),
            expires);
    }
}
