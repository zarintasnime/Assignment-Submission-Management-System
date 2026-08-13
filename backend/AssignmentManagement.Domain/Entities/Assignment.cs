using AssignmentManagement.Domain.Enums;

namespace AssignmentManagement.Domain.Entities;

public class Assignment
{
    public Guid Id { get; set; } = Guid.NewGuid();

    // A single canonical mapping prevents duplicated Teacher/ClassRoom/Subject foreign keys.
    public Guid TeacherAssignmentId { get; set; }

    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime Deadline { get; set; }
    public decimal MaxMarks { get; set; }
    public AssignmentStatus Status { get; set; } = AssignmentStatus.Draft;
    public bool AllowResubmission { get; set; } = true;
    public int GraceMinutes { get; set; }
    public DateTime? PublishedAt { get; set; }
    public DateTime? ArchivedAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public TeacherAssignment TeacherAssignment { get; set; } = null!;
    public ICollection<Submission> Submissions { get; set; } = new List<Submission>();
}
