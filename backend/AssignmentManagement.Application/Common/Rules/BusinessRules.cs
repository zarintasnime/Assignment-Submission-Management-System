using AssignmentManagement.Application.Common.Exceptions;
using AssignmentManagement.Domain.Enums;

namespace AssignmentManagement.Application.Common.Rules;

public static class BusinessRules
{
    public static bool IsLate(DateTime nowUtc, DateTime deadlineUtc) =>
        nowUtc > deadlineUtc;

    public static void EnsureSubmissionWindow(
        DateTime nowUtc,
        DateTime deadlineUtc,
        int graceMinutes)
    {
        if (nowUtc > deadlineUtc.AddMinutes(graceMinutes))
        {
            throw new BusinessRuleException(
                "Submission deadline and grace window have passed.");
        }
    }

    public static void EnsureCanResubmit(
        bool allowResubmission,
        DateTime nowUtc,
        DateTime deadlineUtc,
        int graceMinutes)
    {
        if (!allowResubmission)
        {
            throw new BusinessRuleException(
                "Resubmission is not allowed for this assignment.");
        }

        EnsureSubmissionWindow(nowUtc, deadlineUtc, graceMinutes);
    }

    public static void EnsureGrade(decimal marks, decimal maxMarks)
    {
        if (marks < 0 || marks > maxMarks)
        {
            throw new BusinessRuleException(
                $"Marks must be between 0 and {maxMarks}.");
        }
    }

    public static void EnsureDraft(AssignmentStatus status)
    {
        if (status != AssignmentStatus.Draft)
        {
            throw new BusinessRuleException(
                "Only draft assignments can be edited.");
        }
    }
}
