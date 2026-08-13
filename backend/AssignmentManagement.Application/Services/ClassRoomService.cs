using AssignmentManagement.Application.Abstractions;
using AssignmentManagement.Application.Common.Exceptions;
using AssignmentManagement.Application.DTOs;
using AssignmentManagement.Domain.Entities;
using AssignmentManagement.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace AssignmentManagement.Application.Services;

public sealed class ClassRoomService(
    IApplicationDbContext db,
    IAuditLogService audit) : IClassRoomService
{
    public async Task<IReadOnlyList<ClassRoomResponse>> GetAllAsync(CancellationToken ct) =>
        await db.ClassRooms
            .AsNoTracking()
            .OrderBy(x => x.Code)
            .Select(x => new ClassRoomResponse(
                x.Id,
                x.Name,
                x.Code,
                x.AcademicYear,
                x.Section,
                x.IsActive))
            .ToListAsync(ct);

    public async Task<ClassRoomResponse> CreateAsync(
        CreateClassRoomRequest request,
        CancellationToken ct)
    {
        var code = request.Code.Trim().ToUpperInvariant();

        if (await db.ClassRooms.AnyAsync(x => x.Code == code, ct))
        {
            throw new ConflictException("ClassRoom code already exists.");
        }

        var room = new ClassRoom
        {
            Name = request.Name.Trim(),
            Code = code,
            AcademicYear = request.AcademicYear?.Trim(),
            Section = request.Section?.Trim()
        };

        db.ClassRooms.Add(room);
        audit.Add(
            AuditAction.ClassRoomCreated,
            nameof(ClassRoom),
            room.Id,
            new { room.Code });

        await db.SaveChangesAsync(ct);
        return Map(room);
    }

    public async Task<ClassRoomResponse> UpdateAsync(
        Guid id,
        UpdateClassRoomRequest request,
        CancellationToken ct)
    {
        var room = await db.ClassRooms.SingleOrDefaultAsync(x => x.Id == id, ct)
            ?? throw new NotFoundException("ClassRoom not found.");

        room.Name = request.Name.Trim();
        room.AcademicYear = request.AcademicYear?.Trim();
        room.Section = request.Section?.Trim();
        room.IsActive = request.IsActive;
        room.UpdatedAt = DateTime.UtcNow;

        await db.SaveChangesAsync(ct);
        return Map(room);
    }

    private static ClassRoomResponse Map(ClassRoom room) =>
        new(room.Id, room.Name, room.Code, room.AcademicYear, room.Section, room.IsActive);
}
