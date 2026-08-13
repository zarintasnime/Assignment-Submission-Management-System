using AssignmentManagement.Application.Common.Exceptions;
using AssignmentManagement.Application.Common.Rules;

namespace AssignmentManagement.Tests;

public class BusinessRuleTests
{
    [Fact]
    public void StudentCannotSubmitAfterDeadline()
    {
        var deadline = DateTime.UtcNow.AddMinutes(-1);

        Assert.Throws<BusinessRuleException>(() =>
            BusinessRules.EnsureSubmissionWindow(DateTime.UtcNow, deadline, 0));
    }

    [Fact]
    public void LateWithinGraceIsAcceptedAndFlagged()
    {
        var deadline = DateTime.UtcNow.AddMinutes(-5);
        var now = DateTime.UtcNow;

        BusinessRules.EnsureSubmissionWindow(now, deadline, 10);

        Assert.True(BusinessRules.IsLate(now, deadline));
    }

    [Fact]
    public void SubmissionAfterGraceWindowIsRejected()
    {
        var deadline = DateTime.UtcNow.AddMinutes(-20);

        Assert.Throws<BusinessRuleException>(() =>
            BusinessRules.EnsureSubmissionWindow(DateTime.UtcNow, deadline, 10));
    }

    [Fact]
    public void MarksCannotExceedMaxMarks()
    {
        Assert.Throws<BusinessRuleException>(() =>
            BusinessRules.EnsureGrade(21, 20));
    }
}
