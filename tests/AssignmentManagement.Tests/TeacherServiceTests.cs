using AssignmentManagement.Application.Abstractions;
using AssignmentManagement.Application.Common.Exceptions;
using AssignmentManagement.Application.DTOs;
using AssignmentManagement.Application.Services;
using AssignmentManagement.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace AssignmentManagement.Tests;

public class TeacherServiceTests
{
    private class FakePasswordHasher : IPasswordHasher
    {
        public string Hash(string password) => $"hashed_{password}";
        public bool Verify(string password, string hash) => hash == $"hashed_{password}";
    }

    [Fact]
    public async Task CreateTeacher_ValidData_CreatesTeacherUserAndAuditLog()
    {
        await using var db = TestSupport.NewDb();
        var currentUser = new FakeCurrentUser(Guid.NewGuid(), UserRole.Admin);
        var service = new TeacherService(
            db,
            new FakePasswordHasher(),
            TestSupport.Audit(db, currentUser));

        var request = new CreateTeacherRequest("Dr. Smith", "smith@university.edu", "Secret123!");
        var result = await service.CreateTeacherAsync(request, default);

        Assert.NotNull(result);
        Assert.Equal("Dr. Smith", result.FullName);
        Assert.Equal("smith@university.edu", result.Email);
        Assert.Equal(UserRole.Teacher, result.Role);
        Assert.True(result.IsActive);

        var savedUser = await db.Users.SingleOrDefaultAsync(x => x.Id == result.Id);
        Assert.NotNull(savedUser);
        Assert.Equal("hashed_Secret123!", savedUser.PasswordHash);

        var auditLog = await db.AuditLogs.SingleOrDefaultAsync(x => x.EntityId == result.Id);
        Assert.NotNull(auditLog);
        Assert.Equal(AuditAction.UserCreated, auditLog.Action);
    }

    [Fact]
    public async Task CreateTeacher_DuplicateEmail_ThrowsConflictException()
    {
        await using var db = TestSupport.NewDb();
        var data = await TestSupport.SeedAsync(db);
        var existingUser = await db.Users.FindAsync(data.teacher);

        var currentUser = new FakeCurrentUser(Guid.NewGuid(), UserRole.Admin);
        var service = new TeacherService(
            db,
            new FakePasswordHasher(),
            TestSupport.Audit(db, currentUser));

        var request = new CreateTeacherRequest("Duplicate Smith", existingUser!.Email, "Password123!");

        await Assert.ThrowsAsync<ConflictException>(() =>
            service.CreateTeacherAsync(request, default));
    }

    [Fact]
    public async Task GetAllTeachers_ReturnsOnlyTeacherUsers()
    {
        await using var db = TestSupport.NewDb();
        await TestSupport.SeedAsync(db);

        var currentUser = new FakeCurrentUser(Guid.NewGuid(), UserRole.Admin);
        var service = new TeacherService(
            db,
            new FakePasswordHasher(),
            TestSupport.Audit(db, currentUser));

        var teachers = await service.GetAllTeachersAsync(default);

        Assert.NotEmpty(teachers);
        Assert.All(teachers, t => Assert.Equal(UserRole.Teacher, t.Role));
    }

    [Fact]
    public async Task UpdateTeacher_ValidData_UpdatesFullNameAndActiveState()
    {
        await using var db = TestSupport.NewDb();
        var data = await TestSupport.SeedAsync(db);

        var currentUser = new FakeCurrentUser(Guid.NewGuid(), UserRole.Admin);
        var service = new TeacherService(
            db,
            new FakePasswordHasher(),
            TestSupport.Audit(db, currentUser));

        var updateRequest = new UpdateTeacherRequest("Prof. Smith Updated", false);
        var updated = await service.UpdateTeacherAsync(data.teacher, updateRequest, default);

        Assert.Equal("Prof. Smith Updated", updated.FullName);
        Assert.False(updated.IsActive);

        var dbUser = await db.Users.FindAsync(data.teacher);
        Assert.Equal("Prof. Smith Updated", dbUser!.FullName);
        Assert.False(dbUser.IsActive);
    }

    [Fact]
    public async Task UpdateTeacher_NonExistent_ThrowsNotFoundException()
    {
        await using var db = TestSupport.NewDb();
        var currentUser = new FakeCurrentUser(Guid.NewGuid(), UserRole.Admin);
        var service = new TeacherService(
            db,
            new FakePasswordHasher(),
            TestSupport.Audit(db, currentUser));

        await Assert.ThrowsAsync<NotFoundException>(() =>
            service.UpdateTeacherAsync(Guid.NewGuid(), new UpdateTeacherRequest("Name", true), default));
    }
}
