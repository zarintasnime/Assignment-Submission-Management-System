using AssignmentManagement.Application.Abstractions;
using AssignmentManagement.Application.Common.Exceptions;
using AssignmentManagement.Application.DTOs;
using AssignmentManagement.Domain.Entities;
using AssignmentManagement.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace AssignmentManagement.Application.Services;

public sealed class SubjectService(
    IApplicationDbContext db,
    IAuditLogService audit) : ISubjectService
{
    public async Task<IReadOnlyList<SubjectResponse>> GetAllAsync(CancellationToken ct) =>
        await db.Subjects
            .AsNoTracking()
            .Include(x => x.ClassRoom)
            .OrderBy(x => x.Code)
            .Select(x => Map(x))
            .ToListAsync(ct);

    public async Task<SubjectResponse> CreateAsync(
        CreateSubjectRequest request,
        CancellationToken ct)
    {
        var code = request.Code.Trim().ToUpperInvariant();

        if (await db.Subjects.AnyAsync(x => x.Code == code, ct))
        {
            throw new ConflictException("Subject code already exists.");
        }

        ClassRoom? room = null;
        if (request.ClassRoomId.HasValue)
        {
            room = await db.ClassRooms.SingleOrDefaultAsync(x => x.Id == request.ClassRoomId.Value, ct)
                ?? throw new NotFoundException("ClassRoom not found.");

            if (!room.IsActive)
            {
                throw new BusinessRuleException("Cannot assign a Subject to an inactive ClassRoom.");
            }
        }

        var subject = new Subject
        {
            Name = request.Name.Trim(),
            Code = code,
            ClassRoomId = room?.Id,
            ClassRoom = room
        };

        db.Subjects.Add(subject);
        audit.Add(
            AuditAction.SubjectCreated,
            nameof(Subject),
            subject.Id,
            new { subject.Code, subject.ClassRoomId });

        await db.SaveChangesAsync(ct);
        return Map(subject);
    }

    public async Task<SubjectResponse> UpdateAsync(
        Guid id,
        UpdateSubjectRequest request,
        CancellationToken ct)
    {
        var subject = await db.Subjects
            .Include(x => x.ClassRoom)
            .SingleOrDefaultAsync(x => x.Id == id, ct)
            ?? throw new NotFoundException("Subject not found.");

        if (request.ClassRoomId.HasValue)
        {
            var room = await db.ClassRooms.SingleOrDefaultAsync(x => x.Id == request.ClassRoomId.Value, ct)
                ?? throw new NotFoundException("ClassRoom not found.");

            if (!room.IsActive)
            {
                throw new BusinessRuleException("Cannot assign a Subject to an inactive ClassRoom.");
            }

            subject.ClassRoomId = room.Id;
            subject.ClassRoom = room;
        }

        subject.Name = request.Name.Trim();
        subject.IsActive = request.IsActive;
        subject.UpdatedAt = DateTime.UtcNow;

        await db.SaveChangesAsync(ct);
        return Map(subject);
    }

    private static SubjectResponse Map(Subject subject) =>
        new(
            subject.Id,
            subject.Name,
            subject.Code,
            subject.IsActive,
            subject.ClassRoomId,
            subject.ClassRoom?.Name);
}
