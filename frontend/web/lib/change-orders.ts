import { api, API_BASE } from "./api";
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
  signToken?: string;
  signTokenExpiresAt?: string;
}

export interface CreateChangeOrderItemInput {
  itemName: string;
  description?: string;
  unitPrice: number;
  qty: number;
}

export interface SigningInfo {
  entityType: "Quote" | "ChangeOrder";
  refNo: string;
  description: string;
  totalAmount: number;
  subjectName: string;
  expiresAt: string;
  alreadySigned: boolean;
  items: Array<{
    name: string;
    description?: string;
    unitPrice: number;
    qty: number;
    amount: number;
  }>;
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

export async function requestSignToken(
  id: string,
  clientPhoneLastFour: string,
  expiresInDays = 7
): Promise<{ token: string; expiresAt: string }> {
  const { data } = await api.post(`/api/changeorders/${id}/sign-token`, {
    clientPhoneLastFour,
    expiresInDays,
  });
  return data;
}

export async function getSigningInfo(token: string): Promise<SigningInfo> {
  const res = await fetch(`${API_BASE}/api/signing/${token}`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function submitSignature(
  token: string,
  phoneLastFour: string,
  signatureData: string
): Promise<void> {
  const res = await fetch(`${API_BASE}/api/signing/${token}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phoneLastFour, signatureData }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: "請求失敗" }));
    throw new Error(body.error ?? "請求失敗");
  }
}
