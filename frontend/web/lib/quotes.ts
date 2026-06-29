import { api } from "./api";
import type { PagedResult } from "./cases";

export type QuoteStatus = "Draft" | "Sent" | "Confirmed" | "Cancelled";

export interface QuoteSummaryDto {
  id: string;
  quoteNo: string;
  version: number;
  status: QuoteStatus;
  totalAmount: number;
  validUntil?: string;
  caseId: string;
  clientName: string;
  createdAt: string;
}

export interface QuoteItemInput {
  spaceName: string;
  category: string;
  itemName: string;
  unit: string;
  unitPrice: number;
  qty: number;
  remark?: string;
  sortOrder: number;
}

export const STATUS_LABELS: Record<QuoteStatus, string> = {
  Draft: "草稿",
  Sent: "已送出",
  Confirmed: "已確認",
  Cancelled: "已作廢",
};

export const STATUS_COLORS: Record<QuoteStatus, string> = {
  Draft: "bg-gray-100 text-gray-700",
  Sent: "bg-blue-100 text-blue-800",
  Confirmed: "bg-green-100 text-green-800",
  Cancelled: "bg-red-100 text-red-700",
};

export async function getQuotes(params?: { caseId?: string; page?: number }) {
  const { data } = await api.get<PagedResult<QuoteSummaryDto>>("/api/quotes", { params });
  return data;
}

export async function createQuote(payload: {
  caseId: string;
  validUntil?: string;
  notes?: string;
  items: QuoteItemInput[];
}) {
  const { data } = await api.post<{ id: string }>("/api/quotes", payload);
  return data;
}

export async function confirmQuote(id: string) {
  await api.post(`/api/quotes/${id}/confirm`);
}
