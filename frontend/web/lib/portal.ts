import { API_BASE } from "./api";

export interface PortalProject {
  code: string;
  name: string;
  status: string;
  ownerName: string;
  address?: string;
  startDate?: string;
  endDate?: string;
  overallProgressPct: number;
}

export interface PortalTask {
  name: string;
  plannedStart?: string;
  plannedEnd?: string;
  actualEnd?: string;
  progressPct: number;
}

export interface PortalSiteReport {
  reportDate: string;
  weather?: string;
  workersCount: number;
  notes: string;
}

export interface PortalIssue {
  title: string;
  description?: string;
  status: string;
  dueDate?: string;
  resolution?: string;
}

export interface PortalInspection {
  inspectionDate: string;
  status: string;
  signedBy?: string;
  signedAt?: string;
  notes?: string;
}

export interface PortalChangeOrderItem {
  itemName: string;
  description?: string;
  amount: number;
}

export interface PortalChangeOrder {
  orderNo: string;
  reason: string;
  status: string;
  totalAmount: number;
  canSign: boolean;
  signToken?: string;
  items: PortalChangeOrderItem[];
}

export interface PortalInvoice {
  invoiceNo: string;
  amount: number;
  paidAmount: number;
  invoiceDate: string;
  dueDate?: string;
  status: string;
}

export interface PortalData {
  project: PortalProject;
  tasks: PortalTask[];
  siteReports: PortalSiteReport[];
  issues: PortalIssue[];
  inspections: PortalInspection[];
  changeOrders: PortalChangeOrder[];
  invoices: PortalInvoice[];
}

async function portalFetch<T>(path: string, phoneLastFour: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phoneLastFour }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: "請求失敗" }));
    throw new Error(body.error ?? "請求失敗");
  }
  return res.json();
}

export async function verifyPortalAccess(token: string, phoneLastFour: string): Promise<void> {
  await portalFetch(`/api/portal/${token}/verify`, phoneLastFour);
}

export async function getPortalData(token: string, phoneLastFour: string): Promise<PortalData> {
  return portalFetch<PortalData>(`/api/portal/${token}/data`, phoneLastFour);
}
