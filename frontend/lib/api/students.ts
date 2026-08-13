import { api } from '../api';
import type { StudentResponse } from '../types';

export interface CreateStudentInput {
  fullName: string;
  email: string;
  password: string;
}

export interface UpdateStudentInput {
  fullName: string;
  isActive: boolean;
  email?: string;
  role?: string;
}

export async function getStudents(): Promise<StudentResponse[]> {
  return api<StudentResponse[]>('/admin/students');
}

export async function getTeacherStudents(): Promise<StudentResponse[]> {
  return api<StudentResponse[]>('/teacher/students');
}

export async function createStudent(input: CreateStudentInput): Promise<StudentResponse> {
  return api<StudentResponse>('/admin/students', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function updateStudent(id: string, input: UpdateStudentInput): Promise<StudentResponse> {
  return api<StudentResponse>(`/admin/students/${id}`, {
    method: 'PUT',
    body: JSON.stringify(input),
  });
}
