import { api } from "./api";
import { PagedResult } from "./cases";

export interface ChangeOrderItem {
  id: string;
  projectId: string;
  projectName?: string;
  orderNo: string;
  reason: string;
  status: string;
  totalAmount: number;
  createdAt: string;
}

export interface CreateChangeOrderItemInput {
  itemName: string;
  description?: string;
  unitPrice: number;
  qty: number;
}

export const CHANGE_ORDER_STATUS_LABELS: Record<string, string> = {
  Draft: "草稿",
  PendingSign: "待簽認",
  Signed: "已簽認",
  Executed: "已執行",
};

export const CHANGE_ORDER_STATUS_COLORS: Record<string, string> = {
  Draft: "secondary",
  PendingSign: "outline",
  Signed: "default",
  Executed: "secondary",
};

export async function getChangeOrders(params?: { projectId?: string; page?: number }) {
  const { data } = await api.get<PagedResult<ChangeOrderItem>>("/api/changeorders", { params });
  return data;
}

export async function createChangeOrder(payload: {
  projectId: string;
  orderNo: string;
  reason: string;
  items: CreateChangeOrderItemInput[];
}) {
  const { data } = await api.post<{ id: string }>("/api/changeorders", payload);
  return data;
}

export async function updateChangeOrderStatus(id: string, status: string) {
  await api.patch(`/api/changeorders/${id}/status`, { status });
}
