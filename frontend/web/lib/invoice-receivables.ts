import { api } from "./api";

export type InvoiceStatus = "Pending" | "PartiallyPaid" | "Paid" | "Overdue";

export interface InvoiceReceivable {
  id: string;
  projectId: string;
  projectName: string;
  invoiceNo: string;
  amount: number;
  paidAmount: number;
  invoiceDate: string;
  dueDate?: string;
  status: InvoiceStatus;
  notes?: string;
}

export const INVOICE_STATUS_LABELS: Record<InvoiceStatus, string> = {
  Pending: "未收款",
  PartiallyPaid: "部分收款",
  Paid: "已收款",
  Overdue: "已逾期",
};

export const INVOICE_STATUS_COLORS: Record<InvoiceStatus, string> = {
  Pending: "bg-blue-100 text-blue-800",
  PartiallyPaid: "bg-yellow-100 text-yellow-800",
  Paid: "bg-green-100 text-green-800",
  Overdue: "bg-red-100 text-red-800",
};

export async function getInvoiceReceivables(params?: { projectId?: string; overdueOnly?: boolean }) {
  const { data } = await api.get<InvoiceReceivable[]>("/api/invoice-receivables", { params });
  return data;
}

export async function createInvoiceReceivable(payload: {
  projectId: string;
  invoiceNo: string;
  amount: number;
  invoiceDate: string;
  dueDate?: string;
  notes?: string;
}) {
  const { data } = await api.post<{ id: string }>("/api/invoice-receivables", payload);
  return data;
}

export async function recordInvoiceReceivablePayment(id: string, amount: number) {
  await api.post(`/api/invoice-receivables/${id}/payments`, { amount });
}
