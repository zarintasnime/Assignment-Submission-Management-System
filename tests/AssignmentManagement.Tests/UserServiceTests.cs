using AssignmentManagement.Application.Abstractions;
using AssignmentManagement.Application.Common.Exceptions;
using AssignmentManagement.Application.DTOs;
using AssignmentManagement.Application.Services;
using AssignmentManagement.Domain.Entities;
using AssignmentManagement.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace AssignmentManagement.Tests;

public class UserServiceTests
{
    private class FakePasswordHasher : IPasswordHasher
    {
        public string Hash(string password) => $"hashed_{password}";
        public bool Verify(string password, string hash) => hash == $"hashed_{password}";
    }

    [Fact]
    public async Task CreateUser_ValidData_CreatesUserWithAssignedRole()
    {
        await using var db = TestSupport.NewDb();
        var currentUser = new FakeCurrentUser(Guid.NewGuid(), UserRole.Admin);
        var service = new UserService(db, new FakePasswordHasher(), TestSupport.Audit(db, currentUser));

        var request = new CreateUserRequest("Jane Faculty", "jfaculty@university.edu", "Password123!", UserRole.Teacher);
        var result = await service.CreateAsync(request, default);

        Assert.NotNull(result);
        Assert.Equal("Jane Faculty", result.FullName);
        Assert.Equal("jfaculty@university.edu", result.Email);
        Assert.Equal(UserRole.Teacher, result.Role);
        Assert.True(result.IsActive);
    }

    [Fact]
    public async Task UpdateUser_ChangeRoleFromStudentToTeacher_Succeeds()
    {
        await using var db = TestSupport.NewDb();
        var studentUser = new User
        {
            FullName = "Bob Student",
            Email = "bob@student.edu",
            PasswordHash = "hash",
            Role = UserRole.Student,
            IsActive = true
        };
        db.Users.Add(studentUser);
        await db.SaveChangesAsync();

        var currentUser = new FakeCurrentUser(Guid.NewGuid(), UserRole.Admin);
        var service = new UserService(db, new FakePasswordHasher(), TestSupport.Audit(db, currentUser));

        var updateRequest = new UpdateUserRequest("Bob Instructor", true, UserRole.Teacher);
        var updated = await service.UpdateAsync(studentUser.Id, updateRequest, default);

        Assert.Equal("Bob Instructor", updated.FullName);
        Assert.Equal(UserRole.Teacher, updated.Role);

        var dbUser = await db.Users.FindAsync(studentUser.Id);
        Assert.Equal(UserRole.Teacher, dbUser!.Role);
    }

    [Fact]
    public async Task UpdateUser_DemoteSoleActiveAdmin_ThrowsBusinessRuleException()
    {
        await using var db = TestSupport.NewDb();
        var soleAdmin = new User
        {
            FullName = "Primary Admin",
            Email = "admin@system.com",
            PasswordHash = "hash",
            Role = UserRole.Admin,
            IsActive = true
        };
        db.Users.Add(soleAdmin);
        await db.SaveChangesAsync();

        var currentUser = new FakeCurrentUser(soleAdmin.Id, UserRole.Admin);
        var service = new UserService(db, new FakePasswordHasher(), TestSupport.Audit(db, currentUser));

        var updateRequest = new UpdateUserRequest("Primary Admin", true, UserRole.Student);

        var ex = await Assert.ThrowsAsync<BusinessRuleException>(() =>
            service.UpdateAsync(soleAdmin.Id, updateRequest, default));

        Assert.Contains("sole active administrator", ex.Message, StringComparison.OrdinalIgnoreCase);
    }
}
