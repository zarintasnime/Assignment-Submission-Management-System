using AssignmentManagement.Application.Abstractions;
using AssignmentManagement.Application.Services;
using AssignmentManagement.Domain.Entities;
using AssignmentManagement.Domain.Enums;
using AssignmentManagement.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace AssignmentManagement.Tests;

internal sealed class FakeCurrentUser(Guid id, UserRole role) : ICurrentUserService
{
    public bool IsAuthenticated => true;
    public Guid UserId => id;
    public string Email => "test@example.com";
    public UserRole Role => role;
}

internal static class TestSupport
{
    public static AppDbContext NewDb()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        return new AppDbContext(options);
    }

    public static async Task<(
        Guid teacher,
        Guid otherTeacher,
        Guid student,
        Guid otherStudent,
        Guid room,
        Guid otherRoom,
        Guid subject,
        Guid mapping,
        Guid otherMapping)> SeedAsync(AppDbContext db)
    {
        var teacher = Guid.NewGuid();
        var otherTeacher = Guid.NewGuid();
        var student = Guid.NewGuid();
        var otherStudent = Guid.NewGuid();
        var room = Guid.NewGuid();
        var otherRoom = Guid.NewGuid();
        var subject = Guid.NewGuid();
        var mapping = Guid.NewGuid();
        var otherMapping = Guid.NewGuid();

        db.Users.AddRange(
            new User
            {
                Id = teacher,
                FullName = "Teacher One",
                Email = $"{teacher}@example.com",
                PasswordHash = "x",
                Role = UserRole.Teacher
            },
            new User
            {
                Id = otherTeacher,
                FullName = "Teacher Two",
                Email = $"{otherTeacher}@example.com",
                PasswordHash = "x",
                Role = UserRole.Teacher
            },
            new User
            {
                Id = student,
                FullName = "Student One",
                Email = $"{student}@example.com",
                PasswordHash = "x",
                Role = UserRole.Student
            },
            new User
            {
                Id = otherStudent,
                FullName = "Student Two",
                Email = $"{otherStudent}@example.com",
                PasswordHash = "x",
                Role = UserRole.Student
            });

        db.ClassRooms.AddRange(
            new ClassRoom
            {
                Id = room,
                Name = "Class A",
                Code = $"A-{room}"
            },
            new ClassRoom
            {
                Id = otherRoom,
                Name = "Class B",
                Code = $"B-{otherRoom}"
            });

        db.Subjects.Add(new Subject
        {
            Id = subject,
            Name = "Software Engineering",
            Code = $"SE-{subject}"
        });

        db.StudentEnrollments.AddRange(
            new StudentEnrollment
            {
                StudentId = student,
                ClassRoomId = room
            },
            new StudentEnrollment
            {
                StudentId = otherStudent,
                ClassRoomId = otherRoom
            });

        db.TeacherAssignments.AddRange(
            new TeacherAssignment
            {
                Id = mapping,
                TeacherId = teacher,
                ClassRoomId = room,
                SubjectId = subject
            },
            new TeacherAssignment
            {
                Id = otherMapping,
                TeacherId = otherTeacher,
                ClassRoomId = otherRoom,
                SubjectId = subject
            });

        await db.SaveChangesAsync();

        return (
            teacher,
            otherTeacher,
            student,
            otherStudent,
            room,
            otherRoom,
            subject,
            mapping,
            otherMapping);
    }

    public static AuditLogService Audit(
        AppDbContext db,
        ICurrentUserService currentUser) =>
        new(db, currentUser);
}
