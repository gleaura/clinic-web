import api from './api';
import type { PageResponse } from './userService';

export interface Staff {
  id: number;
  firstName: string;
  lastName: string;
  title: string | null;
  specialization: string | null;
  phone: string | null;
  email: string | null;
  licenseNumber: string | null;
  hireDate: string | null;
  note: string | null;
  status: string;
  createdBy: string;
  createdDate: string;
}

export interface StaffListParams {
  page: number;
  size: number;
  sort?: string;
  status?: string;
}

export interface CreateStaffRequest {
  firstName: string;
  lastName: string;
  title?: string | null;
  specialization?: string | null;
  phone?: string | null;
  email?: string | null;
  licenseNumber?: string | null;
  hireDate?: string | null;
  note?: string | null;
}

export interface UpdateStaffRequest {
  firstName: string;
  lastName: string;
  title?: string | null;
  specialization?: string | null;
  phone?: string | null;
  email?: string | null;
  licenseNumber?: string | null;
  hireDate?: string | null;
  note?: string | null;
}

export async function getStaffList(params: StaffListParams): Promise<PageResponse<Staff>> {
  const { data } = await api.get<PageResponse<Staff>>('/staff', { params });
  return data;
}

export async function getStaffById(id: number): Promise<Staff> {
  const { data } = await api.get<Staff>(`/staff/${id}`);
  return data;
}

export async function createStaff(payload: CreateStaffRequest): Promise<Staff> {
  const { data } = await api.post<Staff>('/staff', payload);
  return data;
}

export async function updateStaff(id: number, payload: UpdateStaffRequest): Promise<Staff> {
  const { data } = await api.put<Staff>(`/staff/${id}`, payload);
  return data;
}

export async function deleteStaff(id: number): Promise<void> {
  await api.delete(`/staff/${id}`);
}
