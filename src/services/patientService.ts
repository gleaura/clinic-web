import api from './api';
import type { PageResponse } from './userService';

export interface Patient {
  id: number;
  firstName: string;
  lastName: string;
  birthDate: string | null;
  gender: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  identityNumber: string | null;
  bloodType: string | null;
  allergies: string | null;
  chronicDiseases: string | null;
  note: string | null;
  status: string;
  createdBy: string;
  createdDate: string;
}

export interface PatientListParams {
  page: number;
  size: number;
  sort?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  status?: string;
}

export interface CreatePatientRequest {
  firstName: string;
  lastName: string;
  birthDate?: string | null;
  gender?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  identityNumber?: string | null;
  bloodType?: string | null;
  allergies?: string | null;
  chronicDiseases?: string | null;
  note?: string | null;
}

export interface UpdatePatientRequest {
  firstName: string;
  lastName: string;
  birthDate?: string | null;
  gender?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  identityNumber?: string | null;
  bloodType?: string | null;
  allergies?: string | null;
  chronicDiseases?: string | null;
  note?: string | null;
}

export async function getPatients(params: PatientListParams): Promise<PageResponse<Patient>> {
  const { data } = await api.get<PageResponse<Patient>>('/patients', { params });
  return data;
}

export async function getPatientById(id: number): Promise<Patient> {
  const { data } = await api.get<Patient>(`/patients/${id}`);
  return data;
}

export async function createPatient(payload: CreatePatientRequest): Promise<Patient> {
  const { data } = await api.post<Patient>('/patients', payload);
  return data;
}

export async function updatePatient(id: number, payload: UpdatePatientRequest): Promise<Patient> {
  const { data } = await api.put<Patient>(`/patients/${id}`, payload);
  return data;
}

export async function deletePatient(id: number): Promise<void> {
  await api.delete(`/patients/${id}`);
}
