using AssignmentManagement.Application.DTOs;
using AssignmentManagement.Application.Services;
using AssignmentManagement.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AssignmentManagement.Api.Controllers;

[ApiController]
[Route("api/admin/students")]
[Authorize(Roles = nameof(UserRole.Admin))]
public sealed class AdminStudentsController(IStudentService service) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<StudentResponse>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<StudentResponse>>> Get(CancellationToken ct)
    {
        return Ok(await service.GetAllStudentsAsync(ct));
    }

    [HttpPost]
    [ProducesResponseType(typeof(StudentResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
    public async Task<ActionResult<StudentResponse>> Create(
        CreateStudentRequest request,
        CancellationToken ct)
    {
        var created = await service.CreateStudentAsync(request, ct);
        return StatusCode(StatusCodes.Status201Created, created);
    }

    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(StudentResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<StudentResponse>> Update(
        Guid id,
        UpdateStudentRequest request,
        CancellationToken ct)
    {
        return Ok(await service.UpdateStudentAsync(id, request, ct));
    }
}
