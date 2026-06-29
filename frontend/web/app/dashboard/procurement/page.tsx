"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  getVendors, createVendor, getPurchaseOrders, createPurchaseOrder,
  PO_STATUS_LABELS, PO_STATUS_COLORS, CreatePoItemInput,
} from "@/lib/procurement";

const VENDOR_CATEGORIES = ["建材", "家具", "燈具", "系統櫥", "其他"];

const defaultVendorForm = {
  name: "",
  taxId: "",
  category: "",
  contactName: "",
  phone: "",
  email: "",
  paymentTerms: "",
  address: "",
};

const defaultPoForm = {
  vendorId: "",
  poNumber: "",
  expectedDate: "",
  notes: "",
};

const defaultPoItem: CreatePoItemInput = { description: "", unitPrice: 0, qty: 1 };

export default function ProcurementPage() {
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState<"vendors" | "po">("vendors");

  // Vendor state
  const [vendorOpen, setVendorOpen] = useState(false);
  const [vendorForm, setVendorForm] = useState(defaultVendorForm);

  // PO state
  const [poOpen, setPoOpen] = useState(false);
  const [poForm, setPoForm] = useState(defaultPoForm);
  const [poItems, setPoItems] = useState<CreatePoItemInput[]>([{ ...defaultPoItem }]);

  const { data: vendorsData, isLoading: vendorsLoading } = useQuery({
    queryKey: ["vendors"],
    queryFn: () => getVendors(),
  });

  const { data: poData, isLoading: poLoading } = useQuery({
    queryKey: ["purchase-orders"],
    queryFn: () => getPurchaseOrders(),
  });

  const createVendorMutation = useMutation({
    mutationFn: () =>
      createVendor({
        name: vendorForm.name,
        taxId: vendorForm.taxId || undefined,
        category: vendorForm.category,
        contactName: vendorForm.contactName || undefined,
        phone: vendorForm.phone || undefined,
        email: vendorForm.email || undefined,
        paymentTerms: vendorForm.paymentTerms || undefined,
        address: vendorForm.address || undefined,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["vendors"] });
      toast.success("廠商建立成功");
      setVendorOpen(false);
      setVendorForm(defaultVendorForm);
    },
    onError: () => toast.error("建立失敗，請再試一次"),
  });

  const createPoMutation = useMutation({
    mutationFn: () =>
      createPurchaseOrder({
        vendorId: poForm.vendorId,
        poNumber: poForm.poNumber,
        expectedDate: poForm.expectedDate || undefined,
        notes: poForm.notes || undefined,
        items: poItems.filter((i) => i.description.trim()),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["purchase-orders"] });
      toast.success("採購單建立成功");
      setPoOpen(false);
      setPoForm(defaultPoForm);
      setPoItems([{ ...defaultPoItem }]);
    },
    onError: () => toast.error("建立失敗，請再試一次"),
  });

  const addPoItem = () => setPoItems([...poItems, { ...defaultPoItem }]);
  const removePoItem = (idx: number) => {
    if (poItems.length === 1) return;
    setPoItems(poItems.filter((_, i) => i !== idx));
  };
  const updatePoItem = (idx: number, field: keyof CreatePoItemInput, value: string | number) => {
    setPoItems(poItems.map((item, i) => (i === idx ? { ...item, [field]: value } : item)));
  };

  const poTotal = poItems.reduce((sum, i) => sum + (Number(i.unitPrice) || 0) * (Number(i.qty) || 0), 0);

  const canSubmitVendor = vendorForm.name.trim() && vendorForm.category;
  const canSubmitPo = poForm.vendorId && poForm.poNumber.trim() && poItems.some((i) => i.description.trim());

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">採購管理</h1>
          <p className="text-sm text-muted-foreground mt-1">廠商與採購單管理</p>
        </div>
        {activeTab === "vendors" ? (
          <Button onClick={() => setVendorOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />新增廠商
          </Button>
        ) : (
          <Button onClick={() => setPoOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />新增採購單
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b">
        {(["vendors", "po"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab === "vendors" ? "廠商管理" : "採購單"}
          </button>
        ))}
      </div>

      {/* Vendors Tab */}
      {activeTab === "vendors" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              廠商列表
              {vendorsData && (
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  共 {vendorsData.totalCount} 筆
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {vendorsLoading ? (
              <p className="text-center text-sm text-muted-foreground py-8">載入中...</p>
            ) : !vendorsData?.items.length ? (
              <p className="text-center text-sm text-muted-foreground py-8">目前沒有廠商資料</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-muted-foreground">
                      <th className="text-left py-2 px-3">廠商名稱</th>
                      <th className="text-left py-2 px-3">類別</th>
                      <th className="text-left py-2 px-3">聯絡人</th>
                      <th className="text-left py-2 px-3">電話</th>
                      <th className="text-left py-2 px-3">付款條件</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vendorsData.items.map((v) => (
                      <tr key={v.id} className="border-b last:border-0 hover:bg-muted/40">
                        <td className="py-2.5 px-3 font-medium">{v.name}</td>
                        <td className="py-2.5 px-3">{v.category}</td>
                        <td className="py-2.5 px-3 text-muted-foreground">{v.contactName ?? "—"}</td>
                        <td className="py-2.5 px-3 text-muted-foreground">{v.phone ?? "—"}</td>
                        <td className="py-2.5 px-3 text-muted-foreground">{v.paymentTerms ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* PO Tab */}
      {activeTab === "po" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              採購單列表
              {poData && (
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  共 {poData.totalCount} 筆
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {poLoading ? (
              <p className="text-center text-sm text-muted-foreground py-8">載入中...</p>
            ) : !poData?.items.length ? (
              <p className="text-center text-sm text-muted-foreground py-8">目前沒有採購單資料</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-muted-foreground">
                      <th className="text-left py-2 px-3">單號</th>
                      <th className="text-left py-2 px-3">廠商</th>
                      <th className="text-right py-2 px-3">金額</th>
                      <th className="text-left py-2 px-3">狀態</th>
                      <th className="text-left py-2 px-3">預計收貨日</th>
                    </tr>
                  </thead>
                  <tbody>
                    {poData.items.map((po) => (
                      <tr key={po.id} className="border-b last:border-0 hover:bg-muted/40">
                        <td className="py-2.5 px-3 font-mono text-xs">{po.poNumber}</td>
                        <td className="py-2.5 px-3">{po.vendorName}</td>
                        <td className="py-2.5 px-3 text-right">
                          {Number(po.totalAmount).toLocaleString("zh-TW")} 元
                        </td>
                        <td className="py-2.5 px-3">
                          <Badge variant={PO_STATUS_COLORS[po.status] as "default" | "secondary" | "outline" | "destructive"}>
                            {PO_STATUS_LABELS[po.status] ?? po.status}
                          </Badge>
                        </td>
                        <td className="py-2.5 px-3 text-muted-foreground">
                          {po.expectedDate ? new Date(po.expectedDate).toLocaleDateString("zh-TW") : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Vendor Create Dialog */}
      <Dialog open={vendorOpen} onOpenChange={setVendorOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>新增廠商</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>廠商名稱 *</Label>
                <Input
                  value={vendorForm.name}
                  onChange={(e) => setVendorForm({ ...vendorForm, name: e.target.value })}
                  placeholder="台灣建材有限公司"
                />
              </div>
              <div className="space-y-2">
                <Label>統一編號</Label>
                <Input
                  value={vendorForm.taxId}
                  onChange={(e) => setVendorForm({ ...vendorForm, taxId: e.target.value })}
                  placeholder="12345678"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>類別 *</Label>
              <Select
                value={vendorForm.category}
                onValueChange={(v) => v && setVendorForm({ ...vendorForm, category: v as string })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="選擇類別" />
                </SelectTrigger>
                <SelectContent>
                  {VENDOR_CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>聯絡人</Label>
                <Input
                  value={vendorForm.contactName}
                  onChange={(e) => setVendorForm({ ...vendorForm, contactName: e.target.value })}
                  placeholder="陳先生"
                />
              </div>
              <div className="space-y-2">
                <Label>電話</Label>
                <Input
                  value={vendorForm.phone}
                  onChange={(e) => setVendorForm({ ...vendorForm, phone: e.target.value })}
                  placeholder="02-1234-5678"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={vendorForm.email}
                  onChange={(e) => setVendorForm({ ...vendorForm, email: e.target.value })}
                  placeholder="vendor@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label>付款條件</Label>
                <Input
                  value={vendorForm.paymentTerms}
                  onChange={(e) => setVendorForm({ ...vendorForm, paymentTerms: e.target.value })}
                  placeholder="月結 30 天"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>地址</Label>
              <Input
                value={vendorForm.address}
                onChange={(e) => setVendorForm({ ...vendorForm, address: e.target.value })}
                placeholder="台北市中山區..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setVendorOpen(false)}>取消</Button>
            <Button
              onClick={() => createVendorMutation.mutate()}
              disabled={!canSubmitVendor || createVendorMutation.isPending}
            >
              {createVendorMutation.isPending ? "建立中..." : "建立廠商"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* PO Create Dialog */}
      <Dialog open={poOpen} onOpenChange={setPoOpen}>
        <DialogContent className="max-w-2xl flex flex-col max-h-[90vh]">
          <DialogHeader className="flex-none">
            <DialogTitle>新增採購單</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto min-h-0 space-y-4 py-2 pr-1">
            <div className="space-y-2">
              <Label>廠商 *</Label>
              <Select value={poForm.vendorId} onValueChange={(v) => v && setPoForm({ ...poForm, vendorId: v as string })}>
                <SelectTrigger>
                  <SelectValue placeholder="選擇廠商" />
                </SelectTrigger>
                <SelectContent>
                  {vendorsData?.items.map((v) => (
                    <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>採購單號 *</Label>
                <Input
                  value={poForm.poNumber}
                  onChange={(e) => setPoForm({ ...poForm, poNumber: e.target.value })}
                  placeholder="PO-2024-001"
                />
              </div>
              <div className="space-y-2">
                <Label>預計收貨日</Label>
                <Input
                  type="date"
                  value={poForm.expectedDate}
                  onChange={(e) => setPoForm({ ...poForm, expectedDate: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>備註</Label>
              <Input
                value={poForm.notes}
                onChange={(e) => setPoForm({ ...poForm, notes: e.target.value })}
                placeholder="備註說明..."
              />
            </div>

            {/* PO Items */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>採購項目</Label>
                <Button type="button" variant="outline" size="sm" onClick={addPoItem}>
                  <Plus className="h-3 w-3 mr-1" />新增項目
                </Button>
              </div>
              <div className="space-y-2">
                {poItems.map((item, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-2 items-start border rounded-md p-2">
                    <div className="col-span-5 space-y-1">
                      <p className="text-xs text-muted-foreground">品項說明 *</p>
                      <Input
                        value={item.description}
                        onChange={(e) => updatePoItem(idx, "description", e.target.value)}
                        placeholder="60x60 磁磚"
                        className="h-8 text-sm"
                      />
                    </div>
                    <div className="col-span-3 space-y-1">
                      <p className="text-xs text-muted-foreground">單價</p>
                      <Input
                        type="number"
                        value={item.unitPrice}
                        onChange={(e) => updatePoItem(idx, "unitPrice", Number(e.target.value))}
                        className="h-8 text-sm"
                      />
                    </div>
                    <div className="col-span-2 space-y-1">
                      <p className="text-xs text-muted-foreground">數量</p>
                      <Input
                        type="number"
                        value={item.qty}
                        onChange={(e) => updatePoItem(idx, "qty", Number(e.target.value))}
                        className="h-8 text-sm"
                        min={1}
                      />
                    </div>
                    <div className="col-span-2 flex justify-end self-end pb-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removePoItem(idx)}
                        disabled={poItems.length === 1}
                        className="h-8 w-8 p-0"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-end text-sm font-medium pt-1">
                合計：{poTotal.toLocaleString("zh-TW")} 元
              </div>
            </div>
          </div>
          <DialogFooter className="flex-none">
            <Button variant="outline" onClick={() => setPoOpen(false)}>取消</Button>
            <Button
              onClick={() => createPoMutation.mutate()}
              disabled={!canSubmitPo || createPoMutation.isPending}
            >
              {createPoMutation.isPending ? "建立中..." : "建立採購單"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
