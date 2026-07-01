import { api } from "./api";

export interface DeveloperProject {
  id: string;
  name: string;
  developerName: string;
  address?: string;
  notes?: string;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  commissionRatePercent?: number;
  deliveryRequirements?: string;
  brandStandards?: string;
  isActive: boolean;
  unitCount: number;
}

export interface DeveloperProjectInput {
  name: string;
  developerName: string;
  address?: string;
  notes?: string;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  commissionRatePercent?: number;
  deliveryRequirements?: string;
  brandStandards?: string;
}

export async function getDeveloperProjects(activeOnly = false): Promise<DeveloperProject[]> {
  const { data } = await api.get<DeveloperProject[]>("/api/developer-projects", {
    params: { activeOnly },
  });
  return data;
}

export async function createDeveloperProject(payload: DeveloperProjectInput): Promise<{ id: string }> {
  const { data } = await api.post<{ id: string }>("/api/developer-projects", payload);
  return data;
}

export async function updateDeveloperProject(
  id: string,
  payload: DeveloperProjectInput & { isActive: boolean }
): Promise<void> {
  await api.put(`/api/developer-projects/${id}`, payload);
}

export async function deleteDeveloperProject(id: string): Promise<void> {
  await api.delete(`/api/developer-projects/${id}`);
}
