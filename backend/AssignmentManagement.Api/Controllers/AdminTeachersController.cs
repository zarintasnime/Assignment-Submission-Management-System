using AssignmentManagement.Application.DTOs;
using AssignmentManagement.Application.Services;
using AssignmentManagement.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AssignmentManagement.Api.Controllers;

[ApiController]
[Route("api/admin/teachers")]
[Authorize(Roles = nameof(UserRole.Admin))]
public sealed class AdminTeachersController(ITeacherService service) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<TeacherResponse>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<TeacherResponse>>> Get(CancellationToken ct)
    {
        return Ok(await service.GetAllTeachersAsync(ct));
    }

    [HttpPost]
    [ProducesResponseType(typeof(TeacherResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
    public async Task<ActionResult<TeacherResponse>> Create(
        CreateTeacherRequest request,
        CancellationToken ct)
    {
        var created = await service.CreateTeacherAsync(request, ct);
        return StatusCode(StatusCodes.Status201Created, created);
    }

    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(TeacherResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<TeacherResponse>> Update(
        Guid id,
        UpdateTeacherRequest request,
        CancellationToken ct)
    {
        return Ok(await service.UpdateTeacherAsync(id, request, ct));
    }
}
