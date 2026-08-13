import React from 'react';

interface WorkflowStepperProps {
  currentStep?: number;
  steps?: Array<{ stepNo: number; title: string; hint: string }>;
}

const defaultSteps = [
  { stepNo: 1, title: 'Create Users', hint: 'Teachers & Students' },
  { stepNo: 2, title: 'Create Classroom', hint: 'Academic Group' },
  { stepNo: 3, title: 'Add Subject', hint: 'Belongs to Class' },
  { stepNo: 4, title: 'Enroll Student', hint: 'Class Membership' },
  { stepNo: 5, title: 'Map Teacher', hint: 'Class + Subject Context' },
];

export default function WorkflowStepper({
  currentStep = 1,
  steps = defaultSteps,
}: WorkflowStepperProps) {
  return (
    <div className="workflow-stepper-card">
      <div className="stepper-header">
        <span className="section-kicker">Academic Setup Guide</span>
        <p className="stepper-subtitle">Follow the real-world sequence to configure academic context without gaps.</p>
      </div>
      <div className="stepper-grid">
        {steps.map((s) => {
          const isActive = s.stepNo === currentStep;
          const isDone = s.stepNo < currentStep;
          return (
            <div
              key={s.stepNo}
              className={`stepper-item ${isActive ? 'active' : ''} ${isDone ? 'done' : ''}`}
            >
              <div className="stepper-num">
                {isDone ? '✓' : `0${s.stepNo}`}
              </div>
              <div className="stepper-text">
                <strong>{s.title}</strong>
                <small>{s.hint}</small>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
