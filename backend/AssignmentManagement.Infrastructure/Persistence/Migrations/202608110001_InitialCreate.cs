using Microsoft.EntityFrameworkCore.Migrations;

namespace AssignmentManagement.Infrastructure.Persistence.Migrations;

public partial class InitialCreate : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.CreateTable(
            name: "ClassRooms",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "uuid", nullable: false),
                Name = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                Code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                AcademicYear = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: true),
                Section = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: true),
                IsActive = table.Column<bool>(type: "boolean", nullable: false),
                CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_ClassRooms", x => x.Id);
            });

        migrationBuilder.CreateTable(
            name: "Subjects",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "uuid", nullable: false),
                Name = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                Code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                ClassRoomId = table.Column<Guid>(type: "uuid", nullable: true),
                IsActive = table.Column<bool>(type: "boolean", nullable: false),
                CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_Subjects", x => x.Id);
                table.ForeignKey(
                    name: "FK_Subjects_ClassRooms_ClassRoomId",
                    column: x => x.ClassRoomId,
                    principalTable: "ClassRooms",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.SetNull);
            });

        migrationBuilder.CreateTable(
            name: "Users",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "uuid", nullable: false),
                FullName = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                Email = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                PasswordHash = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                Role = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                IsActive = table.Column<bool>(type: "boolean", nullable: false),
                CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_Users", x => x.Id);
                table.CheckConstraint("CK_Users_Role", "\"Role\" IN ('Admin', 'Teacher', 'Student')");
            });

        migrationBuilder.CreateTable(
            name: "AuditLogs",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "uuid", nullable: false),
                ActorUserId = table.Column<Guid>(type: "uuid", nullable: true),
                Action = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: false),
                EntityType = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                EntityId = table.Column<Guid>(type: "uuid", nullable: false),
                Metadata = table.Column<string>(type: "jsonb", nullable: true),
                CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_AuditLogs", x => x.Id);
                table.ForeignKey(
                    name: "FK_AuditLogs_Users_ActorUserId",
                    column: x => x.ActorUserId,
                    principalTable: "Users",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.SetNull);
            });

        migrationBuilder.CreateTable(
            name: "StudentEnrollments",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "uuid", nullable: false),
                StudentId = table.Column<Guid>(type: "uuid", nullable: false),
                ClassRoomId = table.Column<Guid>(type: "uuid", nullable: false),
                IsActive = table.Column<bool>(type: "boolean", nullable: false),
                EnrolledAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_StudentEnrollments", x => x.Id);
                table.ForeignKey(
                    name: "FK_StudentEnrollments_ClassRooms_ClassRoomId",
                    column: x => x.ClassRoomId,
                    principalTable: "ClassRooms",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Restrict);
                table.ForeignKey(
                    name: "FK_StudentEnrollments_Users_StudentId",
                    column: x => x.StudentId,
                    principalTable: "Users",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Restrict);
            });

        migrationBuilder.CreateTable(
            name: "TeacherAssignments",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "uuid", nullable: false),
                TeacherId = table.Column<Guid>(type: "uuid", nullable: false),
                ClassRoomId = table.Column<Guid>(type: "uuid", nullable: false),
                SubjectId = table.Column<Guid>(type: "uuid", nullable: false),
                IsActive = table.Column<bool>(type: "boolean", nullable: false),
                AssignedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                DeactivatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_TeacherAssignments", x => x.Id);
                table.ForeignKey(
                    name: "FK_TeacherAssignments_ClassRooms_ClassRoomId",
                    column: x => x.ClassRoomId,
                    principalTable: "ClassRooms",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Restrict);
                table.ForeignKey(
                    name: "FK_TeacherAssignments_Subjects_SubjectId",
                    column: x => x.SubjectId,
                    principalTable: "Subjects",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Restrict);
                table.ForeignKey(
                    name: "FK_TeacherAssignments_Users_TeacherId",
                    column: x => x.TeacherId,
                    principalTable: "Users",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Restrict);
            });

        migrationBuilder.CreateTable(
            name: "Assignments",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "uuid", nullable: false),
                TeacherAssignmentId = table.Column<Guid>(type: "uuid", nullable: false),
                Title = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                Description = table.Column<string>(type: "character varying(5000)", maxLength: 5000, nullable: false),
                Deadline = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                MaxMarks = table.Column<decimal>(type: "numeric(7,2)", nullable: false),
                Status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                AllowResubmission = table.Column<bool>(type: "boolean", nullable: false),
                GraceMinutes = table.Column<int>(type: "integer", nullable: false),
                PublishedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                ArchivedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_Assignments", x => x.Id);
                table.CheckConstraint("CK_Assignments_GraceMinutes", "\"GraceMinutes\" >= 0");
                table.CheckConstraint("CK_Assignments_MaxMarks", "\"MaxMarks\" > 0");
                table.CheckConstraint(
                    "CK_Assignments_Status",
                    "\"Status\" IN ('Draft', 'Published', 'Closed', 'Archived')");
                table.ForeignKey(
                    name: "FK_Assignments_TeacherAssignments_TeacherAssignmentId",
                    column: x => x.TeacherAssignmentId,
                    principalTable: "TeacherAssignments",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Restrict);
            });

        migrationBuilder.CreateTable(
            name: "Submissions",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "uuid", nullable: false),
                AssignmentId = table.Column<Guid>(type: "uuid", nullable: false),
                StudentId = table.Column<Guid>(type: "uuid", nullable: false),
                Status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                IsLate = table.Column<bool>(type: "boolean", nullable: false),
                CurrentVersion = table.Column<int>(type: "integer", nullable: false),
                FirstSubmittedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                LastSubmittedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                Marks = table.Column<decimal>(type: "numeric(7,2)", nullable: true),
                Feedback = table.Column<string>(type: "character varying(4000)", maxLength: 4000, nullable: true),
                GradedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                GradedByTeacherId = table.Column<Guid>(type: "uuid", nullable: true),
                UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_Submissions", x => x.Id);
                table.CheckConstraint("CK_Submissions_CurrentVersion", "\"CurrentVersion\" > 0");
                table.CheckConstraint("CK_Submissions_Marks", "\"Marks\" IS NULL OR \"Marks\" >= 0");
                table.CheckConstraint(
                    "CK_Submissions_Status",
                    "\"Status\" IN ('Submitted', 'Graded', 'Returned')");
                table.ForeignKey(
                    name: "FK_Submissions_Assignments_AssignmentId",
                    column: x => x.AssignmentId,
                    principalTable: "Assignments",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Restrict);
                table.ForeignKey(
                    name: "FK_Submissions_Users_GradedByTeacherId",
                    column: x => x.GradedByTeacherId,
                    principalTable: "Users",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.SetNull);
                table.ForeignKey(
                    name: "FK_Submissions_Users_StudentId",
                    column: x => x.StudentId,
                    principalTable: "Users",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Restrict);
            });

        migrationBuilder.CreateTable(
            name: "SubmissionVersions",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "uuid", nullable: false),
                SubmissionId = table.Column<Guid>(type: "uuid", nullable: false),
                VersionNo = table.Column<int>(type: "integer", nullable: false),
                AnswerText = table.Column<string>(type: "character varying(20000)", maxLength: 20000, nullable: true),
                SubmittedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_SubmissionVersions", x => x.Id);
                table.CheckConstraint("CK_SubmissionVersions_VersionNo", "\"VersionNo\" > 0");
                table.ForeignKey(
                    name: "FK_SubmissionVersions_Submissions_SubmissionId",
                    column: x => x.SubmissionId,
                    principalTable: "Submissions",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateTable(
            name: "SubmissionAttachments",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "uuid", nullable: false),
                SubmissionVersionId = table.Column<Guid>(type: "uuid", nullable: false),
                OriginalFileName = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                StoredFileName = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                ContentType = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                FileSize = table.Column<long>(type: "bigint", nullable: false),
                FileUrl = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                UploadedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_SubmissionAttachments", x => x.Id);
                table.CheckConstraint("CK_SubmissionAttachments_FileSize", "\"FileSize\" > 0");
                table.ForeignKey(
                    name: "FK_SubmissionAttachments_SubmissionVersions_SubmissionVersionId",
                    column: x => x.SubmissionVersionId,
                    principalTable: "SubmissionVersions",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateIndex(name: "IX_ClassRooms_Code", table: "ClassRooms", column: "Code", unique: true);
        migrationBuilder.CreateIndex(name: "IX_Subjects_Code", table: "Subjects", column: "Code", unique: true);
        migrationBuilder.CreateIndex(name: "IX_Subjects_ClassRoomId", table: "Subjects", column: "ClassRoomId");
        migrationBuilder.CreateIndex(name: "IX_Users_Email", table: "Users", column: "Email", unique: true);
        migrationBuilder.CreateIndex(name: "IX_Users_Role", table: "Users", column: "Role");
        migrationBuilder.CreateIndex(name: "IX_AuditLogs_ActorUserId", table: "AuditLogs", column: "ActorUserId");
        migrationBuilder.CreateIndex(
            name: "IX_AuditLogs_EntityType_EntityId",
            table: "AuditLogs",
            columns: new[] { "EntityType", "EntityId" });
        migrationBuilder.CreateIndex(
            name: "IX_StudentEnrollments_ClassRoomId",
            table: "StudentEnrollments",
            column: "ClassRoomId");
        migrationBuilder.CreateIndex(
            name: "IX_StudentEnrollments_StudentId_ClassRoomId",
            table: "StudentEnrollments",
            columns: new[] { "StudentId", "ClassRoomId" },
            unique: true);
        migrationBuilder.CreateIndex(
            name: "IX_TeacherAssignments_ClassRoomId",
            table: "TeacherAssignments",
            column: "ClassRoomId");
        migrationBuilder.CreateIndex(
            name: "IX_TeacherAssignments_SubjectId",
            table: "TeacherAssignments",
            column: "SubjectId");
        migrationBuilder.CreateIndex(
            name: "IX_TeacherAssignments_TeacherId_ClassRoomId_SubjectId",
            table: "TeacherAssignments",
            columns: new[] { "TeacherId", "ClassRoomId", "SubjectId" },
            unique: true);
        migrationBuilder.CreateIndex(
            name: "IX_Assignments_Status",
            table: "Assignments",
            column: "Status");
        migrationBuilder.CreateIndex(
            name: "IX_Assignments_TeacherAssignmentId",
            table: "Assignments",
            column: "TeacherAssignmentId");
        migrationBuilder.CreateIndex(
            name: "IX_Submissions_AssignmentId_StudentId",
            table: "Submissions",
            columns: new[] { "AssignmentId", "StudentId" },
            unique: true);
        migrationBuilder.CreateIndex(
            name: "IX_Submissions_GradedByTeacherId",
            table: "Submissions",
            column: "GradedByTeacherId");
        migrationBuilder.CreateIndex(
            name: "IX_Submissions_StudentId",
            table: "Submissions",
            column: "StudentId");
        migrationBuilder.CreateIndex(
            name: "IX_SubmissionVersions_SubmissionId_VersionNo",
            table: "SubmissionVersions",
            columns: new[] { "SubmissionId", "VersionNo" },
            unique: true);
        migrationBuilder.CreateIndex(
            name: "IX_SubmissionAttachments_SubmissionVersionId",
            table: "SubmissionAttachments",
            column: "SubmissionVersionId");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropTable(name: "AuditLogs");
        migrationBuilder.DropTable(name: "SubmissionAttachments");
        migrationBuilder.DropTable(name: "SubmissionVersions");
        migrationBuilder.DropTable(name: "Submissions");
        migrationBuilder.DropTable(name: "Assignments");
        migrationBuilder.DropTable(name: "StudentEnrollments");
        migrationBuilder.DropTable(name: "TeacherAssignments");
        migrationBuilder.DropTable(name: "Users");
        migrationBuilder.DropTable(name: "ClassRooms");
        migrationBuilder.DropTable(name: "Subjects");
    }
}
