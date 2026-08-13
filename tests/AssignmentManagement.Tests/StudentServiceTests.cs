using AssignmentManagement.Application.Abstractions;
using AssignmentManagement.Application.Common.Exceptions;
using AssignmentManagement.Application.DTOs;
using AssignmentManagement.Application.Services;
using AssignmentManagement.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace AssignmentManagement.Tests;

public class StudentServiceTests
{
    private class FakePasswordHasher : IPasswordHasher
    {
        public string Hash(string password) => $"hashed_{password}";
        public bool Verify(string password, string hash) => hash == $"hashed_{password}";
    }

    [Fact]
    public async Task CreateStudent_ValidData_CreatesStudentUserAndAuditLog()
    {
        await using var db = TestSupport.NewDb();
        var currentUser = new FakeCurrentUser(Guid.NewGuid(), UserRole.Admin);
        var service = new StudentService(
            db,
            new FakePasswordHasher(),
            TestSupport.Audit(db, currentUser),
            currentUser);

        var request = new CreateStudentRequest("John Doe", "john@student.edu", "StudentPass123!");
        var result = await service.CreateStudentAsync(request, default);

        Assert.NotNull(result);
        Assert.Equal("John Doe", result.FullName);
        Assert.Equal("john@student.edu", result.Email);
        Assert.Equal(UserRole.Student, result.Role);
        Assert.True(result.IsActive);

        var savedUser = await db.Users.SingleOrDefaultAsync(x => x.Id == result.Id);
        Assert.NotNull(savedUser);
        Assert.Equal("hashed_StudentPass123!", savedUser.PasswordHash);
    }

    [Fact]
    public async Task CreateStudent_DuplicateEmail_ThrowsConflictException()
    {
        await using var db = TestSupport.NewDb();
        var data = await TestSupport.SeedAsync(db);
        var existingStudent = await db.Users.FindAsync(data.student);

        var currentUser = new FakeCurrentUser(Guid.NewGuid(), UserRole.Admin);
        var service = new StudentService(
            db,
            new FakePasswordHasher(),
            TestSupport.Audit(db, currentUser),
            currentUser);

        var request = new CreateStudentRequest("Duplicate John", existingStudent!.Email, "Password123!");

        await Assert.ThrowsAsync<ConflictException>(() =>
            service.CreateStudentAsync(request, default));
    }

    [Fact]
    public async Task GetAllStudents_ReturnsOnlyStudentUsers()
    {
        await using var db = TestSupport.NewDb();
        await TestSupport.SeedAsync(db);

        var currentUser = new FakeCurrentUser(Guid.NewGuid(), UserRole.Admin);
        var service = new StudentService(
            db,
            new FakePasswordHasher(),
            TestSupport.Audit(db, currentUser),
            currentUser);

        var students = await service.GetAllStudentsAsync(default);

        Assert.NotEmpty(students);
        Assert.All(students, s => Assert.Equal(UserRole.Student, s.Role));
    }

    [Fact]
    public async Task UpdateStudent_ValidData_UpdatesStudentInfo()
    {
        await using var db = TestSupport.NewDb();
        var data = await TestSupport.SeedAsync(db);

        var currentUser = new FakeCurrentUser(Guid.NewGuid(), UserRole.Admin);
        var service = new StudentService(
            db,
            new FakePasswordHasher(),
            TestSupport.Audit(db, currentUser),
            currentUser);

        var updateRequest = new UpdateStudentRequest("John Doe Updated", false);
        var updated = await service.UpdateStudentAsync(data.student, updateRequest, default);

        Assert.Equal("John Doe Updated", updated.FullName);
        Assert.False(updated.IsActive);
    }

    [Fact]
    public async Task TeacherEnrollStudent_AssignedClassRoom_EnrollsSuccessfully()
    {
        await using var db = TestSupport.NewDb();
        var data = await TestSupport.SeedAsync(db);

        // Current user is 'teacher' who is assigned to 'room'
        var currentUser = new FakeCurrentUser(data.teacher, UserRole.Teacher);
        var enrollmentService = new EnrollmentService(db, TestSupport.Audit(db, currentUser));

        // Create a new student unassigned to 'room'
        var newStudent = new Domain.Entities.User
        {
            FullName = "New Student",
            Email = "newstudent@example.com",
            Role = UserRole.Student,
            PasswordHash = "x",
            IsActive = true
        };
        db.Users.Add(newStudent);
        await db.SaveChangesAsync();

        var result = await enrollmentService.TeacherEnrollStudentAsync(
            new EnrollStudentByTeacherRequest(newStudent.Id, data.room),
            currentUser.UserId,
            default);

        Assert.NotNull(result);
        Assert.Equal(newStudent.Id, result.StudentId);
        Assert.Equal(data.room, result.ClassRoomId);
        Assert.True(result.IsActive);
    }

    [Fact]
    public async Task TeacherEnrollStudent_UnassignedClassRoom_ThrowsForbiddenException()
    {
        await using var db = TestSupport.NewDb();
        var data = await TestSupport.SeedAsync(db);

        // Teacher one tries to enroll a student into 'otherRoom' which is assigned to 'otherTeacher'
        var currentUser = new FakeCurrentUser(data.teacher, UserRole.Teacher);
        var enrollmentService = new EnrollmentService(db, TestSupport.Audit(db, currentUser));

        var request = new EnrollStudentByTeacherRequest(data.student, data.otherRoom);

        await Assert.ThrowsAsync<ForbiddenException>(() =>
            enrollmentService.TeacherEnrollStudentAsync(request, currentUser.UserId, default));
    }
}
