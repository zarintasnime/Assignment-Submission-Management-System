using AssignmentManagement.Application.Abstractions;
using AssignmentManagement.Application.DTOs;
using AssignmentManagement.Application.Services;
using AssignmentManagement.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AssignmentManagement.Api.Controllers;

[ApiController]
[Route("api/teacher/students")]
[Authorize(Roles = nameof(UserRole.Teacher))]
public sealed class TeacherStudentsController(IStudentService service) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<StudentResponse>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<StudentResponse>>> Get(CancellationToken ct)
    {
        return Ok(await service.GetTeacherStudentsAsync(ct));
    }
}
