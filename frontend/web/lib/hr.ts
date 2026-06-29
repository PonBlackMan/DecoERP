import { api } from "./api";
import { PagedResult } from "./cases";

export interface EmployeeItem {
  id: string;
  fullName: string;
  jobTitle: string;
  department: string;
  phone?: string;
  email?: string;
  isActive: boolean;
  baseSalary: number;
  hireDate: string;
  createdAt: string;
}

export async function getEmployees(params?: {
  isActive?: boolean;
  search?: string;
  page?: number;
}) {
  const { data } = await api.get<PagedResult<EmployeeItem>>("/api/hr/employees", { params });
  return data;
}

export async function createEmployee(payload: {
  fullName: string;
  idNumber?: string;
  jobTitle: string;
  department: string;
  phone?: string;
  email?: string;
  hireDate: string;
  baseSalary: number;
  emergencyContact?: string;
  emergencyPhone?: string;
}) {
  const { data } = await api.post<{ id: string }>("/api/hr/employees", payload);
  return data;
}

export async function updateEmployeeStatus(id: string, isActive: boolean) {
  await api.patch(`/api/hr/employees/${id}/status`, { isActive });
}
