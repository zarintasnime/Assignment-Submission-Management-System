using AssignmentManagement.Application.DTOs;
using AssignmentManagement.Application.Services;
using AssignmentManagement.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AssignmentManagement.Api.Controllers;

[ApiController]
[Route("api/admin/oversight")]
[Authorize(Roles = nameof(UserRole.Admin))]
public sealed class AdminOversightController(
    IAssignmentService assignments,
    ISubmissionService submissions) : ControllerBase
{
    [HttpGet("assignments")]
    [ProducesResponseType(typeof(IReadOnlyList<AssignmentResponse>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<AssignmentResponse>>> Assignments(
        CancellationToken ct)
    {
        return Ok(await assignments.GetAllForAdminAsync(ct));
    }

    [HttpGet("submissions")]
    [ProducesResponseType(typeof(IReadOnlyList<SubmissionResponse>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<SubmissionResponse>>> Submissions(
        CancellationToken ct)
    {
        return Ok(await submissions.GetAllForAdminAsync(ct));
    }
}
