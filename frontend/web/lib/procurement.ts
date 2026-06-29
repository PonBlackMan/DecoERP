import { api } from "./api";
import { PagedResult } from "./cases";

export interface VendorItem {
  id: string;
  name: string;
  category: string;
  contactName?: string;
  phone?: string;
  email?: string;
  paymentTerms?: string;
  createdAt: string;
}

export interface POItem {
  id: string;
  vendorId: string;
  vendorName: string;
  poNumber: string;
  status: string;
  totalAmount: number;
  expectedDate?: string;
  createdAt: string;
}

export interface CreatePoItemInput {
  description: string;
  unitPrice: number;
  qty: number;
}

export const PO_STATUS_LABELS: Record<string, string> = {
  Draft: "草稿",
  Sent: "已發出",
  PartiallyReceived: "部分收貨",
  FullyReceived: "已收貨",
  Cancelled: "已取消",
};

export const PO_STATUS_COLORS: Record<string, string> = {
  Draft: "secondary",
  Sent: "outline",
  PartiallyReceived: "outline",
  FullyReceived: "default",
  Cancelled: "destructive",
};

export async function getVendors(params?: { search?: string; page?: number }) {
  const { data } = await api.get<PagedResult<VendorItem>>("/api/procurement/vendors", { params });
  return data;
}

export async function createVendor(payload: {
  name: string;
  taxId?: string;
  category: string;
  contactName?: string;
  phone?: string;
  email?: string;
  paymentTerms?: string;
  address?: string;
}) {
  const { data } = await api.post<{ id: string }>("/api/procurement/vendors", payload);
  return data;
}

export async function getPurchaseOrders(params?: { vendorId?: string; page?: number }) {
  const { data } = await api.get<PagedResult<POItem>>("/api/procurement/purchase-orders", { params });
  return data;
}

export async function createPurchaseOrder(payload: {
  vendorId: string;
  poNumber: string;
  expectedDate?: string;
  notes?: string;
  items: CreatePoItemInput[];
}) {
  const { data } = await api.post<{ id: string }>("/api/procurement/purchase-orders", payload);
  return data;
}
