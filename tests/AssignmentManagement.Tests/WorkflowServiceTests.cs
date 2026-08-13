using AssignmentManagement.Application.Common.Exceptions;
using AssignmentManagement.Application.DTOs;
using AssignmentManagement.Application.Services;
using AssignmentManagement.Domain.Entities;
using AssignmentManagement.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace AssignmentManagement.Tests;

public class WorkflowServiceTests
{
    [Fact]
    public async Task DraftAssignmentIsNotVisibleToStudent()
    {
        await using var db = TestSupport.NewDb();
        var data = await TestSupport.SeedAsync(db);

        db.Assignments.Add(new Assignment
        {
            TeacherAssignmentId = data.mapping,
            Title = "Draft assignment",
            Description = "Not published yet",
            Deadline = DateTime.UtcNow.AddDays(1),
            MaxMarks = 10,
            Status = AssignmentStatus.Draft
        });
        await db.SaveChangesAsync();

        var currentUser = new FakeCurrentUser(data.student, UserRole.Student);
        var service = new AssignmentService(
            db,
            currentUser,
            TestSupport.Audit(db, currentUser));

        var assignments = await service.GetEligibleForStudentAsync(default);

        Assert.Empty(assignments);
    }

    [Fact]
    public async Task StudentCannotSeeOtherClassAssignment()
    {
        await using var db = TestSupport.NewDb();
        var data = await TestSupport.SeedAsync(db);

        var assignment = new Assignment
        {
            TeacherAssignmentId = data.otherMapping,
            Title = "Other class assignment",
            Description = "Restricted",
            Deadline = DateTime.UtcNow.AddDays(1),
            MaxMarks = 10,
            Status = AssignmentStatus.Published
        };
        db.Assignments.Add(assignment);
        await db.SaveChangesAsync();

        var currentUser = new FakeCurrentUser(data.student, UserRole.Student);
        var service = new AssignmentService(
            db,
            currentUser,
            TestSupport.Audit(db, currentUser));

        await Assert.ThrowsAsync<ForbiddenException>(() =>
            service.GetStudentDetailAsync(assignment.Id, default));
    }

    [Fact]
    public async Task TeacherCannotCreateAssignmentForUnassignedClassSubject()
    {
        await using var db = TestSupport.NewDb();
        var data = await TestSupport.SeedAsync(db);

        var currentUser = new FakeCurrentUser(data.teacher, UserRole.Teacher);
        var service = new AssignmentService(
            db,
            currentUser,
            TestSupport.Audit(db, currentUser));

        var request = new CreateAssignmentRequest(
            data.otherMapping,
            "Unauthorized mapping",
            "Teacher does not own this mapping",
            DateTime.UtcNow.AddDays(1),
            10);

        await Assert.ThrowsAsync<ForbiddenException>(() =>
            service.CreateAsync(request, default));
    }

    [Fact]
    public async Task InactiveTeacherMappingCannotCreateAssignment()
    {
        await using var db = TestSupport.NewDb();
        var data = await TestSupport.SeedAsync(db);

        var mapping = await db.TeacherAssignments.FindAsync(data.mapping);
        mapping!.IsActive = false;
        await db.SaveChangesAsync();

        var currentUser = new FakeCurrentUser(data.teacher, UserRole.Teacher);
        var service = new AssignmentService(
            db,
            currentUser,
            TestSupport.Audit(db, currentUser));

        var request = new CreateAssignmentRequest(
            data.mapping,
            "Inactive mapping",
            "Should be rejected",
            DateTime.UtcNow.AddDays(1),
            10);

        await Assert.ThrowsAsync<BusinessRuleException>(() =>
            service.CreateAsync(request, default));
    }

    [Fact]
    public async Task FirstSubmissionCreatesVersionOne()
    {
        await using var db = TestSupport.NewDb();
        var data = await TestSupport.SeedAsync(db);
        var assignment = await CreatePublishedAssignmentAsync(db, data.mapping, 10);

        var currentUser = new FakeCurrentUser(data.student, UserRole.Student);
        var service = new SubmissionService(
            db,
            currentUser,
            TestSupport.Audit(db, currentUser));

        var result = await service.SubmitAsync(
            assignment.Id,
            new SubmitSubmissionRequest("First answer"),
            default);

        Assert.Equal(1, result.CurrentVersion);
        Assert.Single(result.Versions);
    }

    [Fact]
    public async Task ResubmissionCreatesNextVersion()
    {
        await using var db = TestSupport.NewDb();
        var data = await TestSupport.SeedAsync(db);
        var assignment = await CreatePublishedAssignmentAsync(db, data.mapping, 10);

        var currentUser = new FakeCurrentUser(data.student, UserRole.Student);
        var service = new SubmissionService(
            db,
            currentUser,
            TestSupport.Audit(db, currentUser));

        var first = await service.SubmitAsync(
            assignment.Id,
            new SubmitSubmissionRequest("Version one"),
            default);

        // Submit and resubmit are separate HTTP requests in production. Clear tracked entities
        // so the next service call reloads persisted state instead of reusing request-local state.
        db.ChangeTracker.Clear();

        var resubmitService = new SubmissionService(
            db,
            currentUser,
            TestSupport.Audit(db, currentUser));

        var second = await resubmitService.ResubmitAsync(
            first.Id,
            new SubmitSubmissionRequest("Version two"),
            default);

        Assert.Equal(2, second.CurrentVersion);
        Assert.Equal(2, second.Versions.Count);
    }

    [Fact]
    public async Task ResubmissionAfterGradeClearsPreviousGrade()
    {
        await using var db = TestSupport.NewDb();
        var data = await TestSupport.SeedAsync(db);
        var assignment = await CreatePublishedAssignmentAsync(db, data.mapping, 20);

        var studentUser = new FakeCurrentUser(data.student, UserRole.Student);
        var submissionService = new SubmissionService(
            db,
            studentUser,
            TestSupport.Audit(db, studentUser));

        var submission = await submissionService.SubmitAsync(
            assignment.Id,
            new SubmitSubmissionRequest("Version one"),
            default);

        var teacherUser = new FakeCurrentUser(data.teacher, UserRole.Teacher);

        // Grading and resubmission are separate API requests, so clear request-local tracking
        // before simulating the next request.
        db.ChangeTracker.Clear();

        var freshGradingService = new GradingService(
            db,
            teacherUser,
            TestSupport.Audit(db, teacherUser));

        await freshGradingService.GradeAsync(
            submission.Id,
            new GradeSubmissionRequest(18, "Good work"),
            default);

        db.ChangeTracker.Clear();

        var resubmitService = new SubmissionService(
            db,
            studentUser,
            TestSupport.Audit(db, studentUser));

        var resubmitted = await resubmitService.ResubmitAsync(
            submission.Id,
            new SubmitSubmissionRequest("Version two"),
            default);

        Assert.Equal(SubmissionStatus.Submitted, resubmitted.Status);
        Assert.Null(resubmitted.Marks);
        Assert.Null(resubmitted.Feedback);
        Assert.Null(resubmitted.GradedAt);
    }

    [Fact]
    public async Task TeacherCannotGradeOtherTeachersSubmission()
    {
        await using var db = TestSupport.NewDb();
        var data = await TestSupport.SeedAsync(db);
        var assignment = await CreatePublishedAssignmentAsync(db, data.mapping, 20);

        var submission = new Submission
        {
            Assignment = assignment,
            StudentId = data.student,
            CurrentVersion = 1
        };
        submission.SubmissionVersions.Add(new SubmissionVersion
        {
            VersionNo = 1,
            AnswerText = "Answer"
        });
        db.Submissions.Add(submission);
        await db.SaveChangesAsync();

        var otherTeacher = new FakeCurrentUser(data.otherTeacher, UserRole.Teacher);
        var service = new GradingService(
            db,
            otherTeacher,
            TestSupport.Audit(db, otherTeacher));

        await Assert.ThrowsAsync<ForbiddenException>(() =>
            service.GradeAsync(
                submission.Id,
                new GradeSubmissionRequest(10, "Unauthorized grade"),
                default));
    }

    [Fact]
    public async Task CreateAssignmentConvertsLocalDeadlineOffsetToUtc()
    {
        await using var db = TestSupport.NewDb();
        var data = await TestSupport.SeedAsync(db);

        var currentUser = new FakeCurrentUser(data.teacher, UserRole.Teacher);
        var service = new AssignmentService(
            db,
            currentUser,
            TestSupport.Audit(db, currentUser));

        var futureLocalTime = DateTime.Now.AddDays(2);
        var request = new CreateAssignmentRequest(
            data.mapping,
            "TZ Test",
            "Description",
            futureLocalTime,
            100);

        var result = await service.CreateAsync(request, default);

        Assert.Equal(DateTimeKind.Utc, result.Deadline.Kind);
    }

    [Fact]
    public async Task ResubmitAsyncWorksWithSingleNavigationAdd()
    {
        await using var db = TestSupport.NewDb();
        var data = await TestSupport.SeedAsync(db);
        var assignment = await CreatePublishedAssignmentAsync(db, data.mapping, 10);

        var currentUser = new FakeCurrentUser(data.student, UserRole.Student);
        var service = new SubmissionService(
            db,
            currentUser,
            TestSupport.Audit(db, currentUser));

        var first = await service.SubmitAsync(
            assignment.Id,
            new SubmitSubmissionRequest("First version"),
            default);

        db.ChangeTracker.Clear();

        var resubmitService = new SubmissionService(
            db,
            currentUser,
            TestSupport.Audit(db, currentUser));

        var second = await resubmitService.ResubmitAsync(
            first.Id,
            new SubmitSubmissionRequest("Second version"),
            default);

        Assert.Equal(2, second.CurrentVersion);
        Assert.Equal(2, second.Versions.Count);
    }

    [Fact]
    public async Task PublishedAssignmentCannotBeEdited()
    {
        await using var db = TestSupport.NewDb();
        var data = await TestSupport.SeedAsync(db);
        var assignment = await CreatePublishedAssignmentAsync(db, data.mapping, 10);

        var currentUser = new FakeCurrentUser(data.teacher, UserRole.Teacher);
        var service = new AssignmentService(
            db,
            currentUser,
            TestSupport.Audit(db, currentUser));

        var updateRequest = new UpdateAssignmentRequest(
            data.mapping,
            "Updated Title",
            "Updated Description",
            DateTime.UtcNow.AddDays(2),
            20,
            true,
            15);

        await Assert.ThrowsAsync<BusinessRuleException>(() =>
            service.UpdateAsync(assignment.Id, updateRequest, default));
    }

    [Fact]
    public async Task StudentCannotSubmitTwiceUseResubmitInstead()
    {
        await using var db = TestSupport.NewDb();
        var data = await TestSupport.SeedAsync(db);
        var assignment = await CreatePublishedAssignmentAsync(db, data.mapping, 10);

        var currentUser = new FakeCurrentUser(data.student, UserRole.Student);
        var service = new SubmissionService(
            db,
            currentUser,
            TestSupport.Audit(db, currentUser));

        await service.SubmitAsync(
            assignment.Id,
            new SubmitSubmissionRequest("First submission"),
            default);

        db.ChangeTracker.Clear();

        await Assert.ThrowsAsync<ConflictException>(() =>
            service.SubmitAsync(
                assignment.Id,
                new SubmitSubmissionRequest("Second submission attempt"),
                default));
    }

    [Fact]
    public async Task SubmissionBlockedAfterGracePeriod()
    {
        await using var db = TestSupport.NewDb();
        var data = await TestSupport.SeedAsync(db);

        var expiredAssignment = new Assignment
        {
            TeacherAssignmentId = data.mapping,
            Title = "Expired Assignment",
            Description = "Past deadline and grace",
            Deadline = DateTime.UtcNow.AddHours(-2),
            GraceMinutes = 15,
            MaxMarks = 10,
            Status = AssignmentStatus.Published
        };
        db.Assignments.Add(expiredAssignment);
        await db.SaveChangesAsync();

        var currentUser = new FakeCurrentUser(data.student, UserRole.Student);
        var service = new SubmissionService(
            db,
            currentUser,
            TestSupport.Audit(db, currentUser));

        await Assert.ThrowsAsync<BusinessRuleException>(() =>
            service.SubmitAsync(
                expiredAssignment.Id,
                new SubmitSubmissionRequest("Late submission"),
                default));
    }

    [Fact]
    public async Task SubmissionFailsIfTeacherMappingDeactivatedAfterPublish()
    {
        await using var db = TestSupport.NewDb();
        var data = await TestSupport.SeedAsync(db);
        var assignment = await CreatePublishedAssignmentAsync(db, data.mapping, 10);

        var mapping = await db.TeacherAssignments.FindAsync(data.mapping);
        mapping!.IsActive = false;
        await db.SaveChangesAsync();

        var currentUser = new FakeCurrentUser(data.student, UserRole.Student);
        var service = new SubmissionService(
            db,
            currentUser,
            TestSupport.Audit(db, currentUser));

        await Assert.ThrowsAsync<BusinessRuleException>(() =>
            service.SubmitAsync(
                assignment.Id,
                new SubmitSubmissionRequest("Submission to deactivated mapping"),
                default));
    }

    [Fact]
    public async Task CreateSubjectWithInactiveClassRoomFails()
    {
        await using var db = TestSupport.NewDb();
        var data = await TestSupport.SeedAsync(db);

        var inactiveRoom = new ClassRoom
        {
            Name = "Inactive Room",
            Code = "INACT-101",
            IsActive = false
        };
        db.ClassRooms.Add(inactiveRoom);
        await db.SaveChangesAsync();

        var service = new SubjectService(db, TestSupport.Audit(db, new FakeCurrentUser(Guid.NewGuid(), UserRole.Admin)));

        var request = new CreateSubjectRequest("Physics", "PHY-101", inactiveRoom.Id);

        await Assert.ThrowsAsync<BusinessRuleException>(() =>
            service.CreateAsync(request, default));
    }

    [Fact]
    public async Task CreateSubjectWithActiveClassRoomSucceeds()
    {
        await using var db = TestSupport.NewDb();
        var data = await TestSupport.SeedAsync(db);

        var room = await db.ClassRooms.FirstAsync();
        var service = new SubjectService(db, TestSupport.Audit(db, new FakeCurrentUser(Guid.NewGuid(), UserRole.Admin)));

        var request = new CreateSubjectRequest("Chemistry", "CHEM-101", room.Id);

        var result = await service.CreateAsync(request, default);

        Assert.Equal("Chemistry", result.Name);
        Assert.Equal(room.Id, result.ClassRoomId);
        Assert.Equal(room.Name, result.ClassRoomName);
    }

    [Fact]
    public async Task CreateSubjectWithoutClassRoomSucceeds()
    {
        await using var db = TestSupport.NewDb();
        var data = await TestSupport.SeedAsync(db);

        var service = new SubjectService(db, TestSupport.Audit(db, new FakeCurrentUser(Guid.NewGuid(), UserRole.Admin)));

        var request = new CreateSubjectRequest("Biology", "BIO-101", null);

        var result = await service.CreateAsync(request, default);

        Assert.Equal("Biology", result.Name);
        Assert.Null(result.ClassRoomId);
        Assert.Null(result.ClassRoomName);
    }

    [Fact]
    public async Task UpdateSubjectWithInactiveClassRoomFails()
    {
        await using var db = TestSupport.NewDb();
        var data = await TestSupport.SeedAsync(db);

        var inactiveRoom = new ClassRoom
        {
            Name = "Inactive Room 2",
            Code = "INACT-102",
            IsActive = false
        };
        db.ClassRooms.Add(inactiveRoom);

        var subject = new Subject { Name = "Math", Code = "MATH-101" };
        db.Subjects.Add(subject);
        await db.SaveChangesAsync();

        var service = new SubjectService(db, TestSupport.Audit(db, new FakeCurrentUser(Guid.NewGuid(), UserRole.Admin)));

        var request = new UpdateSubjectRequest("Math Extended", true, inactiveRoom.Id);

        await Assert.ThrowsAsync<BusinessRuleException>(() =>
            service.UpdateAsync(subject.Id, request, default));
    }

    private static async Task<Assignment> CreatePublishedAssignmentAsync(
        AssignmentManagement.Infrastructure.Persistence.AppDbContext db,
        Guid mappingId,
        decimal maxMarks)
    {
        var assignment = new Assignment
        {
            TeacherAssignmentId = mappingId,
            Title = "Assignment",
            Description = "Test assignment",
            Deadline = DateTime.UtcNow.AddDays(1),
            MaxMarks = maxMarks,
            Status = AssignmentStatus.Published,
            AllowResubmission = true
        };

        db.Assignments.Add(assignment);
        await db.SaveChangesAsync();
        return assignment;
    }
}
