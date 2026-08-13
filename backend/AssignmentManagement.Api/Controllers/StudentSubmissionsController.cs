using AssignmentManagement.Application.DTOs;
using AssignmentManagement.Application.Services;
using AssignmentManagement.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AssignmentManagement.Api.Controllers;

[ApiController]
[Route("api/student/submissions")]
[Authorize(Roles = nameof(UserRole.Student))]
public sealed class StudentSubmissionsController(ISubmissionService service) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<SubmissionResponse>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<SubmissionResponse>>> Get(CancellationToken ct)
    {
        return Ok(await service.GetMineAsync(ct));
    }

    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(SubmissionResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<SubmissionResponse>> Detail(Guid id, CancellationToken ct)
    {
        return Ok(await service.GetMineDetailAsync(id, ct));
    }

    [HttpPost("{id:guid}/resubmit")]
    [ProducesResponseType(typeof(SubmissionResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status422UnprocessableEntity)]
    public async Task<ActionResult<SubmissionResponse>> Resubmit(
        Guid id,
        SubmitSubmissionRequest request,
        CancellationToken ct)
    {
        return Ok(await service.ResubmitAsync(id, request, ct));
    }
}
