import { api } from "./api";
import { PagedResult } from "./cases";

export interface ProjectItem {
  id: string;
  code: string;
  name: string;
  ownerName: string;
  ownerPhone?: string;
  contractAmount: number;
  status: string;
  startDate?: string;
  endDate?: string;
  address?: string;
  createdAt: string;
}

export const PROJECT_STATUS_LABELS: Record<string, string> = {
  Contracted: "已簽約",
  InProgress: "施工中",
  Inspecting: "驗收中",
  Closed: "結案",
};

export const PROJECT_STATUS_COLORS: Record<string, string> = {
  Contracted: "secondary",
  InProgress: "default",
  Inspecting: "outline",
  Closed: "secondary",
};

export async function getProjects(params?: {
  status?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}) {
  const { data } = await api.get<PagedResult<ProjectItem>>("/api/projects", { params });
  return data;
}

export async function createProject(payload: {
  code: string;
  name: string;
  ownerName: string;
  ownerPhone?: string;
  contractAmount: number;
  address?: string;
  startDate?: string;
  endDate?: string;
}) {
  const { data } = await api.post<{ id: string }>("/api/projects", payload);
  return data;
}

export async function updateProjectStatus(id: string, status: string) {
  await api.patch(`/api/projects/${id}/status`, { status });
}
