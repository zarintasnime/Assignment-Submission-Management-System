import { api } from '../api';
import type { TeacherResponse } from '../types';

export interface CreateTeacherInput {
  fullName: string;
  email: string;
  password: string;
}

export interface UpdateTeacherInput {
  fullName: string;
  isActive: boolean;
  email?: string;
  role?: string;
}

export async function getTeachers(): Promise<TeacherResponse[]> {
  return api<TeacherResponse[]>('/admin/teachers');
}

export async function createTeacher(input: CreateTeacherInput): Promise<TeacherResponse> {
  return api<TeacherResponse>('/admin/teachers', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function updateTeacher(id: string, input: UpdateTeacherInput): Promise<TeacherResponse> {
  return api<TeacherResponse>(`/admin/teachers/${id}`, {
    method: 'PUT',
    body: JSON.stringify(input),
  });
}
