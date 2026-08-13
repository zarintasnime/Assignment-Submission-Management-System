namespace AssignmentManagement.Domain.Entities;

public class SubmissionVersion
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid SubmissionId { get; set; }
    public int VersionNo { get; set; }
    public string? AnswerText { get; set; }
    public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;

    public Submission Submission { get; set; } = null!;
    public ICollection<SubmissionAttachment> SubmissionAttachments { get; set; } = new List<SubmissionAttachment>();
}
