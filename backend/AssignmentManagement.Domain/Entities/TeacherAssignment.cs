namespace AssignmentManagement.Domain.Entities;

public class TeacherAssignment
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid TeacherId { get; set; }
    public Guid ClassRoomId { get; set; }
    public Guid SubjectId { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime AssignedAt { get; set; } = DateTime.UtcNow;
    public DateTime? DeactivatedAt { get; set; }

    public User Teacher { get; set; } = null!;
    public ClassRoom ClassRoom { get; set; } = null!;
    public Subject Subject { get; set; } = null!;
    public ICollection<Assignment> Assignments { get; set; } = new List<Assignment>();
}
