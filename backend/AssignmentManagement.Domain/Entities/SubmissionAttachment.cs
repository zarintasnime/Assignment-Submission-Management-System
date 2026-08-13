namespace AssignmentManagement.Domain.Entities;

public class SubmissionAttachment
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid SubmissionVersionId { get; set; }
    public string OriginalFileName { get; set; } = string.Empty;
    public string StoredFileName { get; set; } = string.Empty;
    public string ContentType { get; set; } = string.Empty;
    public long FileSize { get; set; }
    public string FileUrl { get; set; } = string.Empty;
    public DateTime UploadedAt { get; set; } = DateTime.UtcNow;

    public SubmissionVersion SubmissionVersion { get; set; } = null!;
}
