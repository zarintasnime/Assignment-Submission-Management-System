using AssignmentManagement.Application.DTOs;
using FluentValidation;

namespace AssignmentManagement.Application.Validators;

public sealed class CreateAssignmentRequestValidator : AbstractValidator<CreateAssignmentRequest>
{
    public CreateAssignmentRequestValidator()
    {
        RuleFor(x => x.TeacherAssignmentId).NotEmpty();
        RuleFor(x => x.Title).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Description).NotEmpty().MaximumLength(5000);
        RuleFor(x => x.Deadline)
            .NotEmpty()
            .Must(deadline => deadline > DateTime.UtcNow)
            .WithMessage("Deadline cannot be in the past.");
        RuleFor(x => x.MaxMarks).GreaterThan(0).LessThanOrEqualTo(99999);
        RuleFor(x => x.GraceMinutes).InclusiveBetween(0, 10080);
    }
}

public sealed class UpdateAssignmentRequestValidator : AbstractValidator<UpdateAssignmentRequest>
{
    public UpdateAssignmentRequestValidator()
    {
        RuleFor(x => x.TeacherAssignmentId).NotEmpty();
        RuleFor(x => x.Title).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Description).NotEmpty().MaximumLength(5000);
        RuleFor(x => x.Deadline)
            .NotEmpty()
            .Must(deadline => deadline > DateTime.UtcNow)
            .WithMessage("Deadline cannot be in the past.");
        RuleFor(x => x.MaxMarks).GreaterThan(0).LessThanOrEqualTo(99999);
        RuleFor(x => x.GraceMinutes).InclusiveBetween(0, 10080);
    }
}

public sealed class SubmitSubmissionRequestValidator : AbstractValidator<SubmitSubmissionRequest>
{
    public SubmitSubmissionRequestValidator()
    {
        RuleFor(x => x.AnswerText)
            .NotEmpty()
            .MaximumLength(20000);
    }
}

public sealed class GradeSubmissionRequestValidator : AbstractValidator<GradeSubmissionRequest>
{
    public GradeSubmissionRequestValidator()
    {
        RuleFor(x => x.Marks).GreaterThanOrEqualTo(0);
        RuleFor(x => x.Feedback).MaximumLength(4000);
    }
}

public sealed class ReturnSubmissionRequestValidator : AbstractValidator<ReturnSubmissionRequest>
{
    public ReturnSubmissionRequestValidator()
    {
        RuleFor(x => x.Feedback)
            .NotEmpty()
            .MaximumLength(4000);
    }
}
