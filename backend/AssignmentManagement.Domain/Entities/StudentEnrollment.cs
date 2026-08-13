namespace AssignmentManagement.Domain.Entities;

public class StudentEnrollment
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid StudentId { get; set; }
    public Guid ClassRoomId { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime EnrolledAt { get; set; } = DateTime.UtcNow;

    public User Student { get; set; } = null!;
    public ClassRoom ClassRoom { get; set; } = null!;
}
