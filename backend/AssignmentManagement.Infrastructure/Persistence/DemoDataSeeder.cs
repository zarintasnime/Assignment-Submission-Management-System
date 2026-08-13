using AssignmentManagement.Application.Abstractions;
using AssignmentManagement.Domain.Entities;
using AssignmentManagement.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace AssignmentManagement.Infrastructure.Persistence;

public static class DemoDataSeeder
{
    public static async Task SeedAsync(
        AppDbContext db,
        IPasswordHasher hasher,
        CancellationToken ct = default)
    {
        // Expand seeding if dataset is missing or minimal
        if (await db.Users.CountAsync(ct) >= 30)
        {
            return;
        }

        // Clean up partial demo seed if resetting
        if (await db.Users.AnyAsync(ct))
        {
            db.SubmissionVersions.RemoveRange(await db.SubmissionVersions.ToListAsync(ct));
            db.Submissions.RemoveRange(await db.Submissions.ToListAsync(ct));
            db.Assignments.RemoveRange(await db.Assignments.ToListAsync(ct));
            db.TeacherAssignments.RemoveRange(await db.TeacherAssignments.ToListAsync(ct));
            db.StudentEnrollments.RemoveRange(await db.StudentEnrollments.ToListAsync(ct));
            db.Subjects.RemoveRange(await db.Subjects.ToListAsync(ct));
            db.ClassRooms.RemoveRange(await db.ClassRooms.ToListAsync(ct));
            db.AuditLogs.RemoveRange(await db.AuditLogs.ToListAsync(ct));
            db.Users.RemoveRange(await db.Users.ToListAsync(ct));
            await db.SaveChangesAsync(ct);
        }

        var now = DateTime.UtcNow;

        // ------------ Primary Demo Keys -------------
        var adminId = Guid.Parse("11111111-1111-1111-1111-111111111111");
        var teacherId = Guid.Parse("22222222-2222-2222-2222-222222222222");
        var studentId = Guid.Parse("33333333-3333-3333-3333-333333333333");

        // ------------ 1. Users (Admins, Bangladeshi Teachers & Students) -------------
        var users = new List<User>
        {
            // Mandatory Demo Credentials
            new()
            {
                Id = adminId,
                FullName = "Dr. Tanvir Ahmed",
                Email = "admin@demo.com",
                PasswordHash = hasher.Hash("Admin@123"),
                Role = UserRole.Admin,
                IsActive = true
            },
            new()
            {
                Id = teacherId,
                FullName = "Prof. Rahat Chowdhury",
                Email = "teacher@demo.com",
                PasswordHash = hasher.Hash("Teacher@123"),
                Role = UserRole.Teacher,
                IsActive = true
            },
            new()
            {
                Id = studentId,
                FullName = "Shakib Al Hasan",
                Email = "student@demo.com",
                PasswordHash = hasher.Hash("Student@123"),
                Role = UserRole.Student,
                IsActive = true
            },

            // Additional Bangladeshi Faculty / Teachers
            new() { Id = Guid.NewGuid(), FullName = "Prof. Farhana Yasmin", Email = "farhana.yasmin@univ.ac.bd", PasswordHash = hasher.Hash("Teacher@123"), Role = UserRole.Teacher, IsActive = true },
            new() { Id = Guid.NewGuid(), FullName = "Dr. Ayman Sadiq", Email = "ayman.sadiq@univ.ac.bd", PasswordHash = hasher.Hash("Teacher@123"), Role = UserRole.Teacher, IsActive = true },
            new() { Id = Guid.NewGuid(), FullName = "Dr. Zarin Subah", Email = "zarin.subah@univ.ac.bd", PasswordHash = hasher.Hash("Teacher@123"), Role = UserRole.Teacher, IsActive = true },
            new() { Id = Guid.NewGuid(), FullName = "Prof. Mahfuzur Rahman", Email = "mahfuz.rahman@univ.ac.bd", PasswordHash = hasher.Hash("Teacher@123"), Role = UserRole.Teacher, IsActive = true },
            new() { Id = Guid.NewGuid(), FullName = "Dr. Tasnim Ara", Email = "tasnim.ara@univ.ac.bd", PasswordHash = hasher.Hash("Teacher@123"), Role = UserRole.Teacher, IsActive = true },
            new() { Id = Guid.NewGuid(), FullName = "Dr. Shahriar Hossain", Email = "shahriar.hossain@univ.ac.bd", PasswordHash = hasher.Hash("Teacher@123"), Role = UserRole.Teacher, IsActive = true },
            new() { Id = Guid.NewGuid(), FullName = "Prof. Nazmul Huda", Email = "nazmul.huda@univ.ac.bd", PasswordHash = hasher.Hash("Teacher@123"), Role = UserRole.Teacher, IsActive = true },

            // Additional Bangladeshi Students
            new() { Id = Guid.NewGuid(), FullName = "Anika Rahman", Email = "anika.rahman@student.edu.bd", PasswordHash = hasher.Hash("Student@123"), Role = UserRole.Student, IsActive = true },
            new() { Id = Guid.NewGuid(), FullName = "Farhan Tanvir", Email = "farhan.tanvir@student.edu.bd", PasswordHash = hasher.Hash("Student@123"), Role = UserRole.Student, IsActive = true },
            new() { Id = Guid.NewGuid(), FullName = "Sadia Islam", Email = "sadia.islam@student.edu.bd", PasswordHash = hasher.Hash("Student@123"), Role = UserRole.Student, IsActive = true },
            new() { Id = Guid.NewGuid(), FullName = "Mehzabien Chowdhury", Email = "mehzabien.c@student.edu.bd", PasswordHash = hasher.Hash("Student@123"), Role = UserRole.Student, IsActive = true },
            new() { Id = Guid.NewGuid(), FullName = "Abrar Fahad", Email = "abrar.fahad@student.edu.bd", PasswordHash = hasher.Hash("Student@123"), Role = UserRole.Student, IsActive = true },
            new() { Id = Guid.NewGuid(), FullName = "Tahsan Khan", Email = "tahsan.khan@student.edu.bd", PasswordHash = hasher.Hash("Student@123"), Role = UserRole.Student, IsActive = true },
            new() { Id = Guid.NewGuid(), FullName = "Mim Akter", Email = "mim.akter@student.edu.bd", PasswordHash = hasher.Hash("Student@123"), Role = UserRole.Student, IsActive = true },
            new() { Id = Guid.NewGuid(), FullName = "Redwan Ahmed", Email = "redwan.ahmed@student.edu.bd", PasswordHash = hasher.Hash("Student@123"), Role = UserRole.Student, IsActive = true },
            new() { Id = Guid.NewGuid(), FullName = "Sabrin Sultana", Email = "sabrin.sultana@student.edu.bd", PasswordHash = hasher.Hash("Student@123"), Role = UserRole.Student, IsActive = true },
            new() { Id = Guid.NewGuid(), FullName = "Siam Ahmed", Email = "siam.ahmed@student.edu.bd", PasswordHash = hasher.Hash("Student@123"), Role = UserRole.Student, IsActive = true },
            new() { Id = Guid.NewGuid(), FullName = "Lamia Khanom", Email = "lamia.k@student.edu.bd", PasswordHash = hasher.Hash("Student@123"), Role = UserRole.Student, IsActive = true },
            new() { Id = Guid.NewGuid(), FullName = "Fahim Shahriar", Email = "fahim.shahriar@student.edu.bd", PasswordHash = hasher.Hash("Student@123"), Role = UserRole.Student, IsActive = true },
            new() { Id = Guid.NewGuid(), FullName = "Raisa Tabassum", Email = "raisa.t@student.edu.bd", PasswordHash = hasher.Hash("Student@123"), Role = UserRole.Student, IsActive = true },
            new() { Id = Guid.NewGuid(), FullName = "Naimur Rahman", Email = "naimur.r@student.edu.bd", PasswordHash = hasher.Hash("Student@123"), Role = UserRole.Student, IsActive = true },
            new() { Id = Guid.NewGuid(), FullName = "Humaira Binte", Email = "humaira.b@student.edu.bd", PasswordHash = hasher.Hash("Student@123"), Role = UserRole.Student, IsActive = true },
            new() { Id = Guid.NewGuid(), FullName = "Afsar Uddin", Email = "afsar.uddin@student.edu.bd", PasswordHash = hasher.Hash("Student@123"), Role = UserRole.Student, IsActive = true },
            new() { Id = Guid.NewGuid(), FullName = "Tanjila Haque", Email = "tanjila.h@student.edu.bd", PasswordHash = hasher.Hash("Student@123"), Role = UserRole.Student, IsActive = true },
            new() { Id = Guid.NewGuid(), FullName = "Arif Hossain", Email = "arif.hossain@student.edu.bd", PasswordHash = hasher.Hash("Student@123"), Role = UserRole.Student, IsActive = true },
            new() { Id = Guid.NewGuid(), FullName = "Rumana Parveen", Email = "rumana.p@student.edu.bd", PasswordHash = hasher.Hash("Student@123"), Role = UserRole.Student, IsActive = true },
            new() { Id = Guid.NewGuid(), FullName = "Jubayer Ahmed", Email = "jubayer.a@student.edu.bd", PasswordHash = hasher.Hash("Student@123"), Role = UserRole.Student, IsActive = true },
            new() { Id = Guid.NewGuid(), FullName = "Tanzeem Al Islam", Email = "tanzeem.i@student.edu.bd", PasswordHash = hasher.Hash("Student@123"), Role = UserRole.Student, IsActive = true },
            new() { Id = Guid.NewGuid(), FullName = "Nusrat Jahan", Email = "nusrat.jahan@student.edu.bd", PasswordHash = hasher.Hash("Student@123"), Role = UserRole.Student, IsActive = true },
            new() { Id = Guid.NewGuid(), FullName = "Kazi Ashfaq", Email = "kazi.ashfaq@student.edu.bd", PasswordHash = hasher.Hash("Student@123"), Role = UserRole.Student, IsActive = true },
            new() { Id = Guid.NewGuid(), FullName = "Sumaiya Sultana", Email = "sumaiya.s@student.edu.bd", PasswordHash = hasher.Hash("Student@123"), Role = UserRole.Student, IsActive = true }
        };

        db.Users.AddRange(users);

        // ------------ 2. Classrooms -------------
        var classCSE56 = new ClassRoom { Id = Guid.NewGuid(), Name = "CSE 56 (Computer Science & Eng)", Code = "CSE-56", AcademicYear = "2026", Section = "A", IsActive = true };
        var classCSE57 = new ClassRoom { Id = Guid.NewGuid(), Name = "CSE 57 (Software Engineering)", Code = "CSE-57", AcademicYear = "2026", Section = "B", IsActive = true };
        var classSE14 = new ClassRoom { Id = Guid.NewGuid(), Name = "SWE 14 (Dept of Software Eng)", Code = "SWE-14", AcademicYear = "2026", Section = "A", IsActive = true };
        var classEEE42 = new ClassRoom { Id = Guid.NewGuid(), Name = "EEE 42 (Electrical & Electronic)", Code = "EEE-42", AcademicYear = "2026", Section = "A", IsActive = true };
        var classBBA28 = new ClassRoom { Id = Guid.NewGuid(), Name = "BBA 28 (School of Business)", Code = "BBA-28", AcademicYear = "2026", Section = "C", IsActive = true };

        db.ClassRooms.AddRange(classCSE56, classCSE57, classSE14, classEEE42, classBBA28);

        // ------------ 3. Subjects (Strictly Bound to Classrooms) -------------
        var subjSE = new Subject { Id = Guid.NewGuid(), Name = "Software Engineering Principles", Code = "CSE-4205", ClassRoomId = classCSE56.Id, IsActive = true };
        var subjDSA = new Subject { Id = Guid.NewGuid(), Name = "Data Structures & Algorithms", Code = "CSE-2101", ClassRoomId = classCSE56.Id, IsActive = true };
        var subjDBMS = new Subject { Id = Guid.NewGuid(), Name = "Database Management Systems", Code = "CSE-3103", ClassRoomId = classCSE56.Id, IsActive = true };
        
        var subjArch = new Subject { Id = Guid.NewGuid(), Name = "Software Architecture & Microservices", Code = "SWE-4109", ClassRoomId = classSE14.Id, IsActive = true };
        var subjWeb = new Subject { Id = Guid.NewGuid(), Name = "Web Engineering & Cloud Systems", Code = "SWE-4215", ClassRoomId = classSE14.Id, IsActive = true };
        
        var subjMicro = new Subject { Id = Guid.NewGuid(), Name = "Microprocessors & Embedded Systems", Code = "EEE-3207", ClassRoomId = classEEE42.Id, IsActive = true };
        var subjDLD = new Subject { Id = Guid.NewGuid(), Name = "Digital Logic Design", Code = "EEE-2105", ClassRoomId = classEEE42.Id, IsActive = true };
        
        var subjAI = new Subject { Id = Guid.NewGuid(), Name = "Artificial Intelligence & Machine Learning", Code = "CSE-4501", ClassRoomId = classCSE57.Id, IsActive = true };
        var subjOS = new Subject { Id = Guid.NewGuid(), Name = "Operating Systems & Systems Programming", Code = "CSE-3209", ClassRoomId = classCSE57.Id, IsActive = true };
        
        var subjAcct = new Subject { Id = Guid.NewGuid(), Name = "Financial Accounting & Business Analysis", Code = "BBA-1201", ClassRoomId = classBBA28.Id, IsActive = true };

        db.Subjects.AddRange(subjSE, subjDSA, subjDBMS, subjArch, subjWeb, subjMicro, subjDLD, subjAI, subjOS, subjAcct);

        // ------------ 4. Student Enrollments -------------
        var studentUsers = users.Where(u => u.Role == UserRole.Student).ToList();
        var enrollments = new List<StudentEnrollment>();

        // Ensure main demo student is enrolled in CSE-56
        enrollments.Add(new StudentEnrollment { Id = Guid.NewGuid(), StudentId = studentId, ClassRoomId = classCSE56.Id, IsActive = true, EnrolledAt = now.AddDays(-30) });

        for (int i = 0; i < studentUsers.Count; i++)
        {
            var student = studentUsers[i];
            if (student.Id == studentId) continue;

            // Distribute students across classrooms
            var targetRoom = (i % 5) switch
            {
                0 => classCSE56,
                1 => classCSE57,
                2 => classSE14,
                3 => classEEE42,
                _ => classBBA28
            };

            enrollments.Add(new StudentEnrollment
            {
                Id = Guid.NewGuid(),
                StudentId = student.Id,
                ClassRoomId = targetRoom.Id,
                IsActive = true,
                EnrolledAt = now.AddDays(-25 + (i % 10))
            });
        }

        db.StudentEnrollments.AddRange(enrollments);

        // ------------ 5. Teacher Mappings -------------
        var teacherUsers = users.Where(u => u.Role == UserRole.Teacher).ToList();
        var teacherMappings = new List<TeacherAssignment>();

        // Mandatory demo teacher mapped to CSE-56 Software Engineering & Database Systems
        var mapDemoSE = new TeacherAssignment { Id = Guid.NewGuid(), TeacherId = teacherId, ClassRoomId = classCSE56.Id, SubjectId = subjSE.Id, IsActive = true, AssignedAt = now.AddDays(-30) };
        var mapDemoDBMS = new TeacherAssignment { Id = Guid.NewGuid(), TeacherId = teacherId, ClassRoomId = classCSE56.Id, SubjectId = subjDBMS.Id, IsActive = true, AssignedAt = now.AddDays(-30) };
        
        teacherMappings.Add(mapDemoSE);
        teacherMappings.Add(mapDemoDBMS);

        // Map other teachers to respective class-subject pairs
        if (teacherUsers.Count > 1)
        {
            teacherMappings.Add(new TeacherAssignment { Id = Guid.NewGuid(), TeacherId = teacherUsers[1].Id, ClassRoomId = classCSE56.Id, SubjectId = subjDSA.Id, IsActive = true, AssignedAt = now.AddDays(-20) });
            teacherMappings.Add(new TeacherAssignment { Id = Guid.NewGuid(), TeacherId = teacherUsers[2].Id, ClassRoomId = classSE14.Id, SubjectId = subjArch.Id, IsActive = true, AssignedAt = now.AddDays(-20) });
            teacherMappings.Add(new TeacherAssignment { Id = Guid.NewGuid(), TeacherId = teacherUsers[3].Id, ClassRoomId = classEEE42.Id, SubjectId = subjMicro.Id, IsActive = true, AssignedAt = now.AddDays(-20) });
            teacherMappings.Add(new TeacherAssignment { Id = Guid.NewGuid(), TeacherId = teacherUsers[4].Id, ClassRoomId = classCSE57.Id, SubjectId = subjAI.Id, IsActive = true, AssignedAt = now.AddDays(-20) });
        }

        db.TeacherAssignments.AddRange(teacherMappings);

        // ------------ 6. Assignments -------------
        var assignments = new List<Assignment>
        {
            // Published Assignment 1 for Demo Teacher (Due in 5 days)
            new()
            {
                Id = Guid.NewGuid(),
                TeacherAssignmentId = mapDemoSE.Id,
                Title = "Lab Assignment 1: Software Architecture & Clean Code in C#",
                Description = "Implement a layered architecture using Clean Architecture principles in ASP.NET Core. Submit your GitHub repository URL and architectural explanation.",
                Deadline = now.AddDays(5),
                MaxMarks = 100,
                Status = AssignmentStatus.Published,
                AllowResubmission = true,
                GraceMinutes = 60,
                PublishedAt = now.AddDays(-2),
                CreatedAt = now.AddDays(-3)
            },
            // Published Assignment 2 for Demo Teacher (Due Soon - 18 hours)
            new()
            {
                Id = Guid.NewGuid(),
                TeacherAssignmentId = mapDemoSE.Id,
                Title = "Assignment 2: RESTful API Design & OpenAPI Documentation",
                Description = "Design a production-ready REST API schema with OpenAPI specification. Document all request payload validations and error response problem details.",
                Deadline = now.AddHours(18),
                MaxMarks = 50,
                Status = AssignmentStatus.Published,
                AllowResubmission = true,
                GraceMinutes = 30,
                PublishedAt = now.AddDays(-4),
                CreatedAt = now.AddDays(-5)
            },
            // Published Assignment 3 for DBMS (Passed Deadline - In Grace Period)
            new()
            {
                Id = Guid.NewGuid(),
                TeacherAssignmentId = mapDemoDBMS.Id,
                Title = "Database Lab: Relational Schema & Indexing in PostgreSQL",
                Description = "Analyze query execution plans using EXPLAIN ANALYZE. Add B-tree and GIN indexes for composite search queries.",
                Deadline = now.AddMinutes(-15),
                MaxMarks = 40,
                Status = AssignmentStatus.Published,
                AllowResubmission = true,
                GraceMinutes = 120,
                PublishedAt = now.AddDays(-6),
                CreatedAt = now.AddDays(-7)
            },
            // Draft Assignment for Demo Teacher
            new()
            {
                Id = Guid.NewGuid(),
                TeacherAssignmentId = mapDemoSE.Id,
                Title = "Draft Assignment 3: Microservices Communication & gRPC",
                Description = "This is a draft assignment. Teachers can edit or review instructions before releasing to students.",
                Deadline = now.AddDays(14),
                MaxMarks = 100,
                Status = AssignmentStatus.Draft,
                AllowResubmission = true,
                GraceMinutes = 45,
                CreatedAt = now.AddDays(-1)
            },
            // Closed Historical Assignment
            new()
            {
                Id = Guid.NewGuid(),
                TeacherAssignmentId = mapDemoSE.Id,
                Title = "Quiz 1: Object-Oriented Design Patterns",
                Description = "Short answer submission on Singleton, Factory, and Observer patterns.",
                Deadline = now.AddDays(-10),
                MaxMarks = 20,
                Status = AssignmentStatus.Closed,
                AllowResubmission = false,
                GraceMinutes = 0,
                PublishedAt = now.AddDays(-15),
                CreatedAt = now.AddDays(-16)
            }
        };

        db.Assignments.AddRange(assignments);

        // ------------ 7. Submissions & Versions -------------
        var publishedAssign1 = assignments[0];
        var publishedAssign2 = assignments[1];

        // Demo Student Submissions
        var sub1 = new Submission
        {
            Id = Guid.NewGuid(),
            AssignmentId = publishedAssign1.Id,
            StudentId = studentId,
            Status = SubmissionStatus.Graded,
            IsLate = false,
            CurrentVersion = 2,
            FirstSubmittedAt = now.AddDays(-2),
            LastSubmittedAt = now.AddDays(-1),
            Marks = 94.5m,
            Feedback = "Outstanding implementation! Excellent adherence to Clean Architecture, clear separation of concerns, and robust error middleware.",
            GradedAt = now.AddHours(-6),
            GradedByTeacherId = teacherId,
            UpdatedAt = now.AddHours(-6)
        };

        db.Submissions.Add(sub1);

        db.SubmissionVersions.AddRange(
            new SubmissionVersion
            {
                Id = Guid.NewGuid(),
                SubmissionId = sub1.Id,
                VersionNo = 1,
                AnswerText = "Initial submission: Implemented Application, Domain, and Api layers using ASP.NET Core 8.",
                SubmittedAt = now.AddDays(-2)
            },
            new SubmissionVersion
            {
                Id = Guid.NewGuid(),
                SubmissionId = sub1.Id,
                VersionNo = 2,
                AnswerText = "Version 2 (Final): Added GlobalExceptionMiddleware with RFC 7807 ProblemDetails format, complete FluentValidation rules, and Docker container support.",
                SubmittedAt = now.AddDays(-1)
            }
        );

        // Student 2 Submission (Awaiting Grade)
        var student2 = studentUsers.FirstOrDefault(s => s.Id != studentId);
        if (student2 != null)
        {
            var sub2 = new Submission
            {
                Id = Guid.NewGuid(),
                AssignmentId = publishedAssign2.Id,
                StudentId = student2.Id,
                Status = SubmissionStatus.Submitted,
                IsLate = false,
                CurrentVersion = 1,
                FirstSubmittedAt = now.AddHours(-3),
                LastSubmittedAt = now.AddHours(-3),
                Marks = null,
                Feedback = null,
                UpdatedAt = now.AddHours(-3)
            };

            db.Submissions.Add(sub2);
            db.SubmissionVersions.Add(new SubmissionVersion
            {
                Id = Guid.NewGuid(),
                SubmissionId = sub2.Id,
                VersionNo = 1,
                AnswerText = "Here is my submission for RESTful API Design. All endpoints use standard HTTP verbs (GET, POST, PUT, DELETE) and JSON response wrappers.",
                SubmittedAt = now.AddHours(-3)
            });
        }

        // Student 3 Submission (Returned for Revision)
        var student3 = studentUsers.Skip(1).FirstOrDefault(s => s.Id != studentId);
        if (student3 != null)
        {
            var sub3 = new Submission
            {
                Id = Guid.NewGuid(),
                AssignmentId = publishedAssign1.Id,
                StudentId = student3.Id,
                Status = SubmissionStatus.Returned,
                IsLate = false,
                CurrentVersion = 1,
                FirstSubmittedAt = now.AddDays(-1),
                LastSubmittedAt = now.AddDays(-1),
                Marks = null,
                Feedback = "Please revise your Domain entities. Ensure entity classes do not import infrastructure persistence packages directly.",
                GradedAt = now.AddHours(-12),
                GradedByTeacherId = teacherId,
                UpdatedAt = now.AddHours(-12)
            };

            db.Submissions.Add(sub3);
            db.SubmissionVersions.Add(new SubmissionVersion
            {
                Id = Guid.NewGuid(),
                SubmissionId = sub3.Id,
                VersionNo = 1,
                AnswerText = "First draft submitted for review.",
                SubmittedAt = now.AddDays(-1)
            });
        }

        // ------------ 8. Audit Logs -------------
        db.AuditLogs.AddRange(
            new AuditLog { Id = Guid.NewGuid(), ActorUserId = adminId, Action = AuditAction.ClassRoomCreated, EntityType = "ClassRoom", EntityId = classCSE56.Id, Metadata = $"{{\"Code\":\"CSE-56\",\"Name\":\"CSE 56\"}}", CreatedAt = now.AddDays(-30) },
            new AuditLog { Id = Guid.NewGuid(), ActorUserId = adminId, Action = AuditAction.SubjectCreated, EntityType = "Subject", EntityId = subjSE.Id, Metadata = $"{{\"Code\":\"CSE-4205\",\"Name\":\"Software Engineering Principles\"}}", CreatedAt = now.AddDays(-29) },
            new AuditLog { Id = Guid.NewGuid(), ActorUserId = adminId, Action = AuditAction.TeacherMapped, EntityType = "TeacherAssignment", EntityId = mapDemoSE.Id, Metadata = $"{{\"Teacher\":\"Prof. Rahat Chowdhury\",\"Subject\":\"Software Engineering\"}}", CreatedAt = now.AddDays(-28) },
            new AuditLog { Id = Guid.NewGuid(), ActorUserId = teacherId, Action = AuditAction.AssignmentCreated, EntityType = "Assignment", EntityId = publishedAssign1.Id, Metadata = $"{{\"Title\":\"Lab Assignment 1\"}}", CreatedAt = now.AddDays(-3) },
            new AuditLog { Id = Guid.NewGuid(), ActorUserId = teacherId, Action = AuditAction.AssignmentPublished, EntityType = "Assignment", EntityId = publishedAssign1.Id, Metadata = $"{{\"Title\":\"Lab Assignment 1\"}}", CreatedAt = now.AddDays(-2) },
            new AuditLog { Id = Guid.NewGuid(), ActorUserId = studentId, Action = AuditAction.SubmissionCreated, EntityType = "Submission", EntityId = sub1.Id, Metadata = $"{{\"Version\":1}}", CreatedAt = now.AddDays(-2) },
            new AuditLog { Id = Guid.NewGuid(), ActorUserId = studentId, Action = AuditAction.SubmissionResubmitted, EntityType = "Submission", EntityId = sub1.Id, Metadata = $"{{\"Version\":2}}", CreatedAt = now.AddDays(-1) },
            new AuditLog { Id = Guid.NewGuid(), ActorUserId = teacherId, Action = AuditAction.SubmissionGraded, EntityType = "Submission", EntityId = sub1.Id, Metadata = $"{{\"Marks\":94.5}}", CreatedAt = now.AddHours(-6) }
        );

        await db.SaveChangesAsync(ct);
    }
}
