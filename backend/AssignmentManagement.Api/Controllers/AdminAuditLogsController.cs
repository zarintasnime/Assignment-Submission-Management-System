using AssignmentManagement.Application.DTOs;
using AssignmentManagement.Application.Services;
using AssignmentManagement.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AssignmentManagement.Api.Controllers;

[ApiController]
[Route("api/admin/audit-logs")]
[Authorize(Roles = nameof(UserRole.Admin))]
public sealed class AdminAuditLogsController(IAuditQueryService service) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<AuditLogResponse>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<AuditLogResponse>>> Get(
        [FromQuery] int take = 50,
        CancellationToken ct = default)
    {
        return Ok(await service.GetLatestAsync(take, ct));
    }
}
