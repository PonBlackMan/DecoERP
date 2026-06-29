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
  getAccounts, getVouchers, createVoucher,
  VOUCHER_STATUS_LABELS, VOUCHER_STATUS_COLORS, ACCOUNT_TYPE_LABELS,
  CreateVoucherLineInput,
} from "@/lib/finance";

const defaultForm = {
  voucherNo: "",
  voucherDate: "",
  description: "",
};

const defaultLine: CreateVoucherLineInput = {
  accountId: "",
  debitAmount: 0,
  creditAmount: 0,
  description: "",
};

export default function FinancePage() {
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState<"vouchers" | "accounts">("vouchers");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [lines, setLines] = useState<CreateVoucherLineInput[]>([{ ...defaultLine }]);

  const { data: vouchersData, isLoading: vouchersLoading } = useQuery({
    queryKey: ["vouchers"],
    queryFn: () => getVouchers(),
  });

  const { data: accounts, isLoading: accountsLoading } = useQuery({
    queryKey: ["accounts"],
    queryFn: () => getAccounts(),
  });

  const createMutation = useMutation({
    mutationFn: () =>
      createVoucher({
        voucherNo: form.voucherNo,
        voucherDate: form.voucherDate,
        description: form.description,
        lines: lines.filter((l) => l.accountId),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["vouchers"] });
      toast.success("傳票建立成功");
      setOpen(false);
      setForm(defaultForm);
      setLines([{ ...defaultLine }]);
    },
    onError: () => toast.error("建立失敗，請再試一次"),
  });

  const addLine = () => setLines([...lines, { ...defaultLine }]);
  const removeLine = (idx: number) => {
    if (lines.length === 1) return;
    setLines(lines.filter((_, i) => i !== idx));
  };
  const updateLine = (idx: number, field: keyof CreateVoucherLineInput, value: string | number) => {
    setLines(lines.map((line, i) => (i === idx ? { ...line, [field]: value } : line)));
  };

  const canSubmit =
    form.voucherNo.trim() &&
    form.voucherDate &&
    form.description.trim() &&
    lines.some((l) => l.accountId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">財務管理</h1>
          <p className="text-sm text-muted-foreground mt-1">傳票與科目管理</p>
        </div>
        {activeTab === "vouchers" && (
          <Button onClick={() => setOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />新增傳票
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b">
        {(["vouchers", "accounts"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab === "vouchers" ? "傳票" : "科目"}
          </button>
        ))}
      </div>

      {/* Vouchers Tab */}
      {activeTab === "vouchers" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              傳票列表
              {vouchersData && (
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  共 {vouchersData.totalCount} 筆
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {vouchersLoading ? (
              <p className="text-center text-sm text-muted-foreground py-8">載入中...</p>
            ) : !vouchersData?.items.length ? (
              <p className="text-center text-sm text-muted-foreground py-8">目前沒有傳票資料</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-muted-foreground">
                      <th className="text-left py-2 px-3">傳票號</th>
                      <th className="text-left py-2 px-3">日期</th>
                      <th className="text-left py-2 px-3">說明</th>
                      <th className="text-left py-2 px-3">狀態</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vouchersData.items.map((v) => (
                      <tr key={v.id} className="border-b last:border-0 hover:bg-muted/40">
                        <td className="py-2.5 px-3 font-mono text-xs">{v.voucherNo}</td>
                        <td className="py-2.5 px-3 text-muted-foreground">
                          {new Date(v.voucherDate).toLocaleDateString("zh-TW")}
                        </td>
                        <td className="py-2.5 px-3">{v.description}</td>
                        <td className="py-2.5 px-3">
                          <Badge variant={VOUCHER_STATUS_COLORS[v.status] as "default" | "secondary" | "outline" | "destructive"}>
                            {VOUCHER_STATUS_LABELS[v.status] ?? v.status}
                          </Badge>
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

      {/* Accounts Tab */}
      {activeTab === "accounts" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">科目列表</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {accountsLoading ? (
              <p className="text-center text-sm text-muted-foreground py-8">載入中...</p>
            ) : !accounts?.length ? (
              <p className="text-center text-sm text-muted-foreground py-8">目前沒有科目資料</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-muted-foreground">
                      <th className="text-left py-2 px-3">科目代號</th>
                      <th className="text-left py-2 px-3">科目名稱</th>
                      <th className="text-left py-2 px-3">類型</th>
                    </tr>
                  </thead>
                  <tbody>
                    {accounts.map((a) => (
                      <tr key={a.id} className="border-b last:border-0 hover:bg-muted/40">
                        <td className="py-2.5 px-3 font-mono text-xs">{a.code}</td>
                        <td className="py-2.5 px-3 font-medium">{a.name}</td>
                        <td className="py-2.5 px-3 text-muted-foreground">
                          {ACCOUNT_TYPE_LABELS[a.type] ?? a.type}
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

      {/* Create Voucher Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl flex flex-col max-h-[90vh]">
          <DialogHeader className="flex-none">
            <DialogTitle>新增傳票</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto min-h-0 space-y-4 py-2 pr-1">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>傳票號 *</Label>
                <Input
                  value={form.voucherNo}
                  onChange={(e) => setForm({ ...form, voucherNo: e.target.value })}
                  placeholder="V-2024-001"
                />
              </div>
              <div className="space-y-2">
                <Label>日期 *</Label>
                <Input
                  type="date"
                  value={form.voucherDate}
                  onChange={(e) => setForm({ ...form, voucherDate: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>說明 *</Label>
              <Input
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="本月材料費用"
              />
            </div>

            {/* Voucher Lines */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>傳票明細</Label>
                <Button type="button" variant="outline" size="sm" onClick={addLine}>
                  <Plus className="h-3 w-3 mr-1" />新增明細
                </Button>
              </div>
              <div className="space-y-2">
                {lines.map((line, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-2 items-start border rounded-md p-2">
                    <div className="col-span-4 space-y-1">
                      <p className="text-xs text-muted-foreground">科目 *</p>
                      <Select
                        value={line.accountId}
                        onValueChange={(v) => v && updateLine(idx, "accountId", v as string)}
                      >
                        <SelectTrigger className="h-8 text-sm">
                          <SelectValue placeholder="選擇科目" />
                        </SelectTrigger>
                        <SelectContent>
                          {accounts?.map((a) => (
                            <SelectItem key={a.id} value={a.id}>
                              {a.code} {a.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-2 space-y-1">
                      <p className="text-xs text-muted-foreground">借方金額</p>
                      <Input
                        type="number"
                        value={line.debitAmount}
                        onChange={(e) => updateLine(idx, "debitAmount", Number(e.target.value))}
                        className="h-8 text-sm"
                        min={0}
                      />
                    </div>
                    <div className="col-span-2 space-y-1">
                      <p className="text-xs text-muted-foreground">貸方金額</p>
                      <Input
                        type="number"
                        value={line.creditAmount}
                        onChange={(e) => updateLine(idx, "creditAmount", Number(e.target.value))}
                        className="h-8 text-sm"
                        min={0}
                      />
                    </div>
                    <div className="col-span-3 space-y-1">
                      <p className="text-xs text-muted-foreground">說明</p>
                      <Input
                        value={line.description ?? ""}
                        onChange={(e) => updateLine(idx, "description", e.target.value)}
                        className="h-8 text-sm"
                        placeholder="備註"
                      />
                    </div>
                    <div className="col-span-1 flex justify-end self-end pb-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeLine(idx)}
                        disabled={lines.length === 1}
                        className="h-8 w-8 p-0"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter className="flex-none">
            <Button variant="outline" onClick={() => setOpen(false)}>取消</Button>
            <Button
              onClick={() => createMutation.mutate()}
              disabled={!canSubmit || createMutation.isPending}
            >
              {createMutation.isPending ? "建立中..." : "建立傳票"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
