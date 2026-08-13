using AssignmentManagement.Application.DTOs;
using AssignmentManagement.Application.Services;
using AssignmentManagement.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AssignmentManagement.Api.Controllers;

[ApiController]
[Route("api/student/assignments")]
[Authorize(Roles = nameof(UserRole.Student))]
public sealed class StudentAssignmentsController(
    IAssignmentService assignments,
    ISubmissionService submissions) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<AssignmentResponse>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<AssignmentResponse>>> Get(CancellationToken ct)
    {
        return Ok(await assignments.GetEligibleForStudentAsync(ct));
    }

    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(AssignmentResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<AssignmentResponse>> Detail(Guid id, CancellationToken ct)
    {
        return Ok(await assignments.GetStudentDetailAsync(id, ct));
    }

    [HttpPost("{id:guid}/submit")]
    [ProducesResponseType(typeof(SubmissionResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status422UnprocessableEntity)]
    public async Task<ActionResult<SubmissionResponse>> Submit(
        Guid id,
        SubmitSubmissionRequest request,
        CancellationToken ct)
    {
        var created = await submissions.SubmitAsync(id, request, ct);
        return StatusCode(StatusCodes.Status201Created, created);
    }
}
