import { api } from "./api";

export type CaseStage = "Negotiating" | "Quoted" | "DesignConfirming" | "Contracted" | "Abandoned";
export type CaseSource = "Developer" | "Owner";

export interface CaseDto {
  id: string;
  clientName: string;
  clientPhone?: string;
  stage: CaseStage;
  source: CaseSource;
  unitNo?: string;
  developerProjectName?: string;
  salesRepId?: string;
  createdAt: string;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export const STAGE_LABELS: Record<CaseStage, string> = {
  Negotiating: "洽談中",
  Quoted: "已報價",
  DesignConfirming: "設計確認中",
  Contracted: "已簽約",
  Abandoned: "已放棄",
};

export const STAGE_COLORS: Record<CaseStage, string> = {
  Negotiating: "bg-blue-100 text-blue-800",
  Quoted: "bg-yellow-100 text-yellow-800",
  DesignConfirming: "bg-purple-100 text-purple-800",
  Contracted: "bg-green-100 text-green-800",
  Abandoned: "bg-gray-100 text-gray-600",
};

export async function getCases(params?: { stage?: CaseStage; search?: string; page?: number; pageSize?: number }) {
  const { data } = await api.get<PagedResult<CaseDto>>("/api/cases", { params });
  return data;
}

export async function createCase(payload: {
  clientName: string;
  clientPhone?: string;
  clientEmail?: string;
  requirements?: string;
  source: CaseSource;
  unitId?: string;
}) {
  const { data } = await api.post<{ id: string }>("/api/cases", payload);
  return data;
}

export async function updateCaseStage(id: string, stage: CaseStage) {
  await api.patch(`/api/cases/${id}/stage`, { stage });
}

export async function convertCaseToProject(id: string, payload: {
  projectCode: string;
  startDate?: string;
  endDate?: string;
}) {
  const { data } = await api.post<{ projectId: string }>(`/api/cases/${id}/convert`, payload);
  return data;
}
