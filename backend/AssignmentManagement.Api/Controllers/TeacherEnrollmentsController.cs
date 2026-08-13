using AssignmentManagement.Application.Abstractions;
using AssignmentManagement.Application.DTOs;
using AssignmentManagement.Application.Services;
using AssignmentManagement.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AssignmentManagement.Api.Controllers;

[ApiController]
[Route("api/teacher/enrollments")]
[Authorize(Roles = nameof(UserRole.Teacher))]
public sealed class TeacherEnrollmentsController(
    IEnrollmentService service,
    ICurrentUserService currentUser) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<EnrollmentResponse>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<EnrollmentResponse>>> Get(CancellationToken ct)
    {
        return Ok(await service.GetForTeacherAsync(currentUser.UserId, ct));
    }

    [HttpPost]
    [ProducesResponseType(typeof(EnrollmentResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
    public async Task<ActionResult<EnrollmentResponse>> Create(
        EnrollStudentByTeacherRequest request,
        CancellationToken ct)
    {
        var created = await service.TeacherEnrollStudentAsync(request, currentUser.UserId, ct);
        return StatusCode(StatusCodes.Status201Created, created);
    }
}
