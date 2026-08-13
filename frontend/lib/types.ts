export type UserRole = 'Admin' | 'Teacher' | 'Student';
export type AssignmentStatus = 'Draft' | 'Published' | 'Closed' | 'Archived';
export type SubmissionStatus = 'Submitted' | 'Graded' | 'Returned';

export interface CurrentUser {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
}

export interface LoginResponse {
  token: string;
  expiresAtUtc: string;
  user: CurrentUser;
}

export interface UserResponse {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
}

export interface TeacherResponse {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
}

export interface StudentResponse {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
}

export interface ClassRoomResponse {
  id: string;
  name: string;
  code: string;
  academicYear: string | null;
  section: string | null;
  isActive: boolean;
}

export interface SubjectResponse {
  id: string;
  name: string;
  code: string;
  isActive: boolean;
  classRoomId?: string | null;
  classRoomName?: string | null;
}

export interface EnrollmentResponse {
  id: string;
  studentId: string;
  studentName: string;
  classRoomId: string;
  classRoomName: string;
  isActive: boolean;
  enrolledAt: string;
}

export interface TeacherAssignmentResponse {
  id: string;
  teacherId: string;
  teacherName: string;
  classRoomId: string;
  classRoomName: string;
  subjectId: string;
  subjectName: string;
  isActive: boolean;
  assignedAt: string;
}

export interface AssignmentResponse {
  id: string;
  teacherAssignmentId: string;
  title: string;
  description: string;
  deadline: string;
  maxMarks: number;
  status: AssignmentStatus;
  allowResubmission: boolean;
  graceMinutes: number;
  publishedAt: string | null;
  classRoom: string;
  subject: string;
  teacher: string;
}

export interface SubmissionVersionResponse {
  versionNo: number;
  answerText: string | null;
  submittedAt: string;
}

export interface SubmissionResponse {
  id: string;
  assignmentId: string;
  assignmentTitle: string;
  studentId: string;
  studentName: string;
  status: SubmissionStatus;
  isLate: boolean;
  currentVersion: number;
  firstSubmittedAt: string;
  lastSubmittedAt: string;
  marks: number | null;
  maxMarks: number;
  feedback: string | null;
  gradedAt: string | null;
  versions: SubmissionVersionResponse[];
}

export interface DashboardResponse {
  role: string;
  users: number;
  classes: number;
  subjects: number;
  assignments: number;
  publishedAssignments: number;
  submissions: number;
  ungradedSubmissions: number;
}

export interface AuditLogResponse {
  id: string;
  actorUserId: string | null;
  actorName: string | null;
  action: string;
  entityType: string;
  entityId: string;
  metadata: string | null;
  createdAt: string;
}
