using AssignmentManagement.Domain.Enums;

namespace AssignmentManagement.Domain.Entities;

public class Submission
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid AssignmentId { get; set; }
    public Guid StudentId { get; set; }
    public SubmissionStatus Status { get; set; } = SubmissionStatus.Submitted;
    public bool IsLate { get; set; }
    public int CurrentVersion { get; set; } = 1;
    public DateTime FirstSubmittedAt { get; set; } = DateTime.UtcNow;
    public DateTime LastSubmittedAt { get; set; } = DateTime.UtcNow;
    public decimal? Marks { get; set; }
    public string? Feedback { get; set; }
    public DateTime? GradedAt { get; set; }
    public Guid? GradedByTeacherId { get; set; }
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public Assignment Assignment { get; set; } = null!;
    public User Student { get; set; } = null!;
    public User? GradedByTeacher { get; set; }
    public ICollection<SubmissionVersion> SubmissionVersions { get; set; } = new List<SubmissionVersion>();
}
