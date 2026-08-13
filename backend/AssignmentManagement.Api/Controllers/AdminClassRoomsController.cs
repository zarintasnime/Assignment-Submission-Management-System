using AssignmentManagement.Application.DTOs;
using AssignmentManagement.Application.Services;
using AssignmentManagement.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AssignmentManagement.Api.Controllers;

[ApiController]
[Route("api/admin/classrooms")]
[Authorize(Roles = nameof(UserRole.Admin))]
public sealed class AdminClassRoomsController(IClassRoomService service) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<ClassRoomResponse>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<ClassRoomResponse>>> Get(CancellationToken ct)
    {
        return Ok(await service.GetAllAsync(ct));
    }

    [HttpPost]
    [ProducesResponseType(typeof(ClassRoomResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
    public async Task<ActionResult<ClassRoomResponse>> Create(
        CreateClassRoomRequest request,
        CancellationToken ct)
    {
        var created = await service.CreateAsync(request, ct);
        return StatusCode(StatusCodes.Status201Created, created);
    }

    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(ClassRoomResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ClassRoomResponse>> Update(
        Guid id,
        UpdateClassRoomRequest request,
        CancellationToken ct)
    {
        return Ok(await service.UpdateAsync(id, request, ct));
    }
}
