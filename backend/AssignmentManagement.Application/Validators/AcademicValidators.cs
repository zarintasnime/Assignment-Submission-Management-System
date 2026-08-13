using AssignmentManagement.Application.DTOs;
using FluentValidation;

namespace AssignmentManagement.Application.Validators;

public sealed class CreateClassRoomRequestValidator : AbstractValidator<CreateClassRoomRequest>
{
    public CreateClassRoomRequestValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(120);
        RuleFor(x => x.Code).NotEmpty().MaximumLength(50);
        RuleFor(x => x.AcademicYear).MaximumLength(30);
        RuleFor(x => x.Section).MaximumLength(30);
    }
}

public sealed class UpdateClassRoomRequestValidator : AbstractValidator<UpdateClassRoomRequest>
{
    public UpdateClassRoomRequestValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(120);
        RuleFor(x => x.AcademicYear).MaximumLength(30);
        RuleFor(x => x.Section).MaximumLength(30);
    }
}

public sealed class CreateSubjectRequestValidator : AbstractValidator<CreateSubjectRequest>
{
    public CreateSubjectRequestValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(120);
        RuleFor(x => x.Code).NotEmpty().MaximumLength(50);
    }
}

public sealed class UpdateSubjectRequestValidator : AbstractValidator<UpdateSubjectRequest>
{
    public UpdateSubjectRequestValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(120);
    }
}

public sealed class CreateEnrollmentRequestValidator : AbstractValidator<CreateEnrollmentRequest>
{
    public CreateEnrollmentRequestValidator()
    {
        RuleFor(x => x.StudentId).NotEmpty();
        RuleFor(x => x.ClassRoomId).NotEmpty();
    }
}

public sealed class CreateTeacherAssignmentRequestValidator
    : AbstractValidator<CreateTeacherAssignmentRequest>
{
    public CreateTeacherAssignmentRequestValidator()
    {
        RuleFor(x => x.TeacherId).NotEmpty();
        RuleFor(x => x.ClassRoomId).NotEmpty();
        RuleFor(x => x.SubjectId).NotEmpty();
    }
}
