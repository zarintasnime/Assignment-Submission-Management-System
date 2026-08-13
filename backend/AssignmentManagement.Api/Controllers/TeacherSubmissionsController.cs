using AssignmentManagement.Application.DTOs;
using AssignmentManagement.Application.Services;
using AssignmentManagement.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AssignmentManagement.Api.Controllers;

[ApiController]
[Route("api/teacher/submissions")]
[Authorize(Roles = nameof(UserRole.Teacher))]
public sealed class TeacherSubmissionsController(IGradingService service) : ControllerBase
{
    [HttpPut("{id:guid}/grade")]
    [ProducesResponseType(typeof(SubmissionResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status422UnprocessableEntity)]
    public async Task<ActionResult<SubmissionResponse>> Grade(
        Guid id,
        GradeSubmissionRequest request,
        CancellationToken ct)
    {
        return Ok(await service.GradeAsync(id, request, ct));
    }

    [HttpPut("{id:guid}/return")]
    [ProducesResponseType(typeof(SubmissionResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<SubmissionResponse>> Return(
        Guid id,
        ReturnSubmissionRequest request,
        CancellationToken ct)
    {
        return Ok(await service.ReturnAsync(id, request, ct));
    }
}
