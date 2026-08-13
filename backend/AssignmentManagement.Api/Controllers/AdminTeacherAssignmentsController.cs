using AssignmentManagement.Application.DTOs;
using AssignmentManagement.Application.Services;
using AssignmentManagement.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AssignmentManagement.Api.Controllers;

[ApiController]
[Route("api/admin/teacher-assignments")]
[Authorize(Roles = nameof(UserRole.Admin))]
public sealed class AdminTeacherAssignmentsController(
    ITeacherAssignmentService service) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<TeacherAssignmentResponse>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<TeacherAssignmentResponse>>> Get(
        CancellationToken ct)
    {
        return Ok(await service.GetAllAsync(ct));
    }

    [HttpPost]
    [ProducesResponseType(typeof(TeacherAssignmentResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status422UnprocessableEntity)]
    public async Task<ActionResult<TeacherAssignmentResponse>> Create(
        CreateTeacherAssignmentRequest request,
        CancellationToken ct)
    {
        var created = await service.CreateAsync(request, ct);
        return StatusCode(StatusCodes.Status201Created, created);
    }

    [HttpPost("{id:guid}/deactivate")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Deactivate(Guid id, CancellationToken ct)
    {
        await service.DeactivateAsync(id, ct);
        return NoContent();
    }
}
