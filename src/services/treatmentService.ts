import api from './api';
import type { PageResponse } from './userService';

export interface Treatment {
  id: number;
  appointmentId: number;
  name: string;
  description: string | null;
  treatmentDate: string;
  cost: number | null;
  currency: string | null;
  note: string | null;
  status: string;
  createdBy: string;
  createdDate: string;
}

export interface TreatmentListParams {
  page: number;
  size: number;
  sort?: string;
  appointmentId?: number;
  status?: string;
}

export interface CreateTreatmentRequest {
  appointmentId: number;
  name: string;
  description?: string | null;
  treatmentDate: string;
  cost?: number | null;
  currency?: string | null;
  note?: string | null;
}

export interface UpdateTreatmentRequest {
  name: string;
  description?: string | null;
  treatmentDate: string;
  cost?: number | null;
  currency?: string | null;
  note?: string | null;
}

export async function getTreatments(params: TreatmentListParams): Promise<PageResponse<Treatment>> {
  const { data } = await api.get<PageResponse<Treatment>>('/treatments', { params });
  return data;
}

export async function getTreatmentById(id: number): Promise<Treatment> {
  const { data } = await api.get<Treatment>(`/treatments/${id}`);
  return data;
}

export async function getTreatmentsByAppointmentId(appointmentId: number, page = 0, size = 10): Promise<PageResponse<Treatment>> {
  const { data } = await api.get<PageResponse<Treatment>>(`/treatments/appointment/${appointmentId}`, { params: { page, size } });
  return data;
}

export async function createTreatment(payload: CreateTreatmentRequest): Promise<Treatment> {
  const { data } = await api.post<Treatment>('/treatments', payload);
  return data;
}

export async function updateTreatment(id: number, payload: UpdateTreatmentRequest): Promise<Treatment> {
  const { data } = await api.put<Treatment>(`/treatments/${id}`, payload);
  return data;
}

export async function deleteTreatment(id: number): Promise<void> {
  await api.delete(`/treatments/${id}`);
}
