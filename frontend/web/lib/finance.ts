import { api } from "./api";
import { PagedResult } from "./cases";

export interface AccountItem {
  id: string;
  code: string;
  name: string;
  type: string;
}

export interface VoucherItem {
  id: string;
  voucherNo: string;
  voucherDate: string;
  description: string;
  status: string;
  createdAt: string;
}

export interface CreateVoucherLineInput {
  accountId: string;
  debitAmount: number;
  creditAmount: number;
  description?: string;
}

export const VOUCHER_STATUS_LABELS: Record<string, string> = {
  Draft: "草稿",
  Approved: "已過帳",
  Voided: "已作廢",
};

export const VOUCHER_STATUS_COLORS: Record<string, string> = {
  Draft: "secondary",
  Approved: "default",
  Voided: "destructive",
};

export const ACCOUNT_TYPE_LABELS: Record<string, string> = {
  Asset: "資產",
  Liability: "負債",
  Equity: "權益",
  Revenue: "收入",
  Expense: "費用",
};

export async function getAccounts() {
  const { data } = await api.get<AccountItem[]>("/api/finance/accounts");
  return data;
}

export async function getVouchers(params?: { page?: number }) {
  const { data } = await api.get<PagedResult<VoucherItem>>("/api/finance/vouchers", { params });
  return data;
}

export async function createVoucher(payload: {
  voucherNo: string;
  voucherDate: string;
  description: string;
  lines: CreateVoucherLineInput[];
}) {
  const { data } = await api.post<{ id: string }>("/api/finance/vouchers", payload);
  return data;
}
