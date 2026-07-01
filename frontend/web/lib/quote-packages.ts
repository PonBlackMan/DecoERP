import { api } from "./api";

export interface QuotePackageItem {
  id: string;
  spaceName: string;
  category: string;
  itemName: string;
  unit: string;
  unitPrice: number;
  qty: number;
  sortOrder: number;
}

export interface QuotePackage {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  items: QuotePackageItem[];
}

export interface QuotePackageItemInput {
  spaceName: string;
  category: string;
  itemName: string;
  unit: string;
  unitPrice: number;
  qty: number;
  sortOrder: number;
}

export async function getQuotePackages(activeOnly = true): Promise<QuotePackage[]> {
  const { data } = await api.get<QuotePackage[]>("/api/quote-packages", {
    params: { activeOnly },
  });
  return data;
}

export async function createQuotePackage(payload: {
  name: string;
  description?: string;
  items: QuotePackageItemInput[];
}): Promise<{ id: string }> {
  const { data } = await api.post<{ id: string }>("/api/quote-packages", payload);
  return data;
}

export async function deleteQuotePackage(id: string): Promise<void> {
  await api.delete(`/api/quote-packages/${id}`);
}
