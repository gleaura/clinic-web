import api from './api';
import type { PageResponse } from './userService';

export interface Appointment {
  id: number;
  patientId: number;
  patientFullName: string;
  appointmentDate: string;
  durationMinutes: number | null;
  staffId: number | null;
  staffFullName: string | null;
  type: string | null;
  note: string | null;
  status: string;
  createdBy: string;
  createdDate: string;
}

export interface AppointmentListParams {
  page: number;
  size: number;
  sort?: string;
  patientId?: number;
  staffId?: number;
  type?: string;
  status?: string;
}

export interface CreateAppointmentRequest {
  patientId: number;
  appointmentDate: string;
  durationMinutes?: number | null;
  staffId?: number | null;
  type?: string | null;
  note?: string | null;
}

export interface UpdateAppointmentRequest {
  appointmentDate: string;
  durationMinutes?: number | null;
  staffId?: number | null;
  type?: string | null;
  note?: string | null;
}

export async function getAppointments(params: AppointmentListParams): Promise<PageResponse<Appointment>> {
  const { data } = await api.get<PageResponse<Appointment>>('/appointments', { params });
  return data;
}

export async function getAppointmentById(id: number): Promise<Appointment> {
  const { data } = await api.get<Appointment>(`/appointments/${id}`);
  return data;
}

export async function getAppointmentsByPatientId(patientId: number, page = 0, size = 10): Promise<PageResponse<Appointment>> {
  const { data } = await api.get<PageResponse<Appointment>>(`/appointments/patient/${patientId}`, { params: { page, size } });
  return data;
}

export async function createAppointment(payload: CreateAppointmentRequest): Promise<Appointment> {
  const { data } = await api.post<Appointment>('/appointments', payload);
  return data;
}

export async function updateAppointment(id: number, payload: UpdateAppointmentRequest): Promise<Appointment> {
  const { data } = await api.put<Appointment>(`/appointments/${id}`, payload);
  return data;
}

export async function deleteAppointment(id: number): Promise<void> {
  await api.delete(`/appointments/${id}`);
}

export async function getDailyAppointments(date: string): Promise<Appointment[]> {
  const { data } = await api.get<Appointment[]>('/appointments/daily', { params: { date } });
  return data;
}
