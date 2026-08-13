import { api } from '../api';
import type { EnrollmentResponse } from '../types';

export interface CreateEnrollmentInput {
  studentId: string;
  classRoomId: string;
}

export interface TeacherEnrollStudentInput {
  studentId: string;
  classRoomId: string;
}

export async function getEnrollments(): Promise<EnrollmentResponse[]> {
  return api<EnrollmentResponse[]>('/admin/enrollments');
}

export async function getTeacherEnrollments(): Promise<EnrollmentResponse[]> {
  return api<EnrollmentResponse[]>('/teacher/enrollments');
}

export async function createEnrollment(input: CreateEnrollmentInput): Promise<EnrollmentResponse> {
  return api<EnrollmentResponse>('/admin/enrollments', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function teacherEnrollStudent(input: TeacherEnrollStudentInput): Promise<EnrollmentResponse> {
  return api<EnrollmentResponse>('/teacher/enrollments', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function deactivateEnrollment(id: string): Promise<void> {
  return api<void>(`/admin/enrollments/${id}/deactivate`, {
    method: 'POST',
  });
}
