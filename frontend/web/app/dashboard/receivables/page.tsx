"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Banknote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getInvoiceReceivables, createInvoiceReceivable, recordInvoiceReceivablePayment,
  InvoiceReceivable, INVOICE_STATUS_LABELS, INVOICE_STATUS_COLORS,
} from "@/lib/invoice-receivables";
import { getProjects } from "@/lib/projects";

const currency = (n: number) =>
  n.toLocaleString("zh-TW", { style: "currency", currency: "TWD", maximumFractionDigits: 0 });

const emptyCreateForm = () => ({
  projectId: "", invoiceNo: "", amount: "", invoiceDate: new Date().toISOString().slice(0, 10), dueDate: "", notes: "",
});

export default function ReceivablesPage() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<"all" | "overdue">("all");
  const [openCreate, setOpenCreate] = useState(false);
  const [createForm, setCreateForm] = useState(emptyCreateForm());
  const [paymentTarget, setPaymentTarget] = useState<InvoiceReceivable | null>(null);
  const [paymentAmount, setPaymentAmount] = useState("");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["invoice-receivables", filter],
    queryFn: () => getInvoiceReceivables({ overdueOnly: filter === "overdue" }),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const { data: projectsData } = useQuery({
    queryKey: ["projects", "all-for-select"],
    queryFn: () => getProjects({ pageSize: 100 }),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const createMutation = useMutation({
    mutationFn: () => createInvoiceReceivable({
      projectId: createForm.projectId,
      invoiceNo: createForm.invoiceNo,
      amount: Number(createForm.amount),
      invoiceDate: createForm.invoiceDate,
      dueDate: createForm.dueDate || undefined,
      notes: createForm.notes || undefined,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoice-receivables"] });
      toast.success("應收帳款建立成功");
      setOpenCreate(false);
      setCreateForm(emptyCreateForm());
    },
    onError: () => toast.error("建立失敗"),
  });

  const paymentMutation = useMutation({
    mutationFn: () => recordInvoiceReceivablePayment(paymentTarget!.id, Number(paymentAmount)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoice-receivables"] });
      toast.success("已記錄收款");
      setPaymentTarget(null);
      setPaymentAmount("");
    },
    onError: () => toast.error("記錄失敗"),
  });

  const overdueCount = data?.filter((i) => i.status === "Overdue").length ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">應收帳款</h1>
          <p className="text-sm text-muted-foreground mt-1">
            追蹤各工程專案的分期收款，逾期項目系統會自動標示
            {overdueCount > 0 && <span className="text-destructive font-medium"> · 目前有 {overdueCount} 筆逾期</span>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部</SelectItem>
              <SelectItem value="overdue">僅逾期</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => setOpenCreate(true)}>
            <Plus className="mr-2 h-4 w-4" />新增發票
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            應收帳款列表
            {data && <span className="ml-2 text-sm font-normal text-muted-foreground">共 {data.length} 筆</span>}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
          ) : isError ? (
            <p className="text-center text-sm text-destructive py-8">應收帳款資料載入失敗，請稍後再試</p>
          ) : !data?.length ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Banknote className="h-12 w-12 text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground">目前沒有應收帳款資料</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground">
                    <th className="text-left py-2 px-3">專案</th>
                    <th className="text-left py-2 px-3">發票號碼</th>
                    <th className="text-right py-2 px-3">金額</th>
                    <th className="text-right py-2 px-3">已收</th>
                    <th className="text-left py-2 px-3">到期日</th>
                    <th className="text-left py-2 px-3">狀態</th>
                    <th className="py-2 px-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((inv) => (
                    <tr
                      key={inv.id}
                      className={`border-b last:border-0 hover:bg-muted/40 ${inv.status === "Overdue" ? "bg-red-50/50" : ""}`}
                    >
                      <td className="py-2.5 px-3 font-medium">{inv.projectName}</td>
                      <td className="py-2.5 px-3 text-muted-foreground">{inv.invoiceNo}</td>
                      <td className="py-2.5 px-3 text-right">{currency(inv.amount)}</td>
                      <td className="py-2.5 px-3 text-right text-muted-foreground">{currency(inv.paidAmount)}</td>
                      <td className="py-2.5 px-3 text-muted-foreground">
                        {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString("zh-TW") : "—"}
                      </td>
                      <td className="py-2.5 px-3">
                        <Badge className={`${INVOICE_STATUS_COLORS[inv.status]} border-0 text-xs`}>
                          {INVOICE_STATUS_LABELS[inv.status]}
                        </Badge>
                      </td>
                      <td className="py-2.5 px-3">
                        {inv.status !== "Paid" && (
                          <Button
                            size="sm" variant="outline"
                            onClick={() => { setPaymentTarget(inv); setPaymentAmount(""); }}
                          >
                            記錄收款
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={openCreate} onOpenChange={setOpenCreate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>新增應收帳款</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>工程專案 *</Label>
              <Select value={createForm.projectId} onValueChange={(v) => setCreateForm({ ...createForm, projectId: v ?? "" })}>
                <SelectTrigger>
                  <SelectValue placeholder="選擇專案" />
                </SelectTrigger>
                <SelectContent>
                  {projectsData?.items.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.code} - {p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>發票號碼 *</Label>
              <Input
                value={createForm.invoiceNo}
                onChange={(e) => setCreateForm({ ...createForm, invoiceNo: e.target.value })}
                placeholder="例：INV-2026-001"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>金額 *</Label>
                <Input
                  type="number"
                  value={createForm.amount}
                  onChange={(e) => setCreateForm({ ...createForm, amount: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>開票日期 *</Label>
                <Input
                  type="date"
                  value={createForm.invoiceDate}
                  onChange={(e) => setCreateForm({ ...createForm, invoiceDate: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>到期日</Label>
              <Input
                type="date"
                value={createForm.dueDate}
                onChange={(e) => setCreateForm({ ...createForm, dueDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>備註</Label>
              <Textarea
                value={createForm.notes}
                onChange={(e) => setCreateForm({ ...createForm, notes: e.target.value })}
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenCreate(false)}>取消</Button>
            <Button
              onClick={() => createMutation.mutate()}
              disabled={!createForm.projectId || !createForm.invoiceNo || !createForm.amount || createMutation.isPending}
            >
              {createMutation.isPending ? "建立中..." : "建立"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!paymentTarget} onOpenChange={(v) => !v && setPaymentTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>記錄收款</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground">
              {paymentTarget?.invoiceNo}：應收 {paymentTarget && currency(paymentTarget.amount)}，已收 {paymentTarget && currency(paymentTarget.paidAmount)}
            </p>
            <div className="space-y-2">
              <Label>本次收款金額 *</Label>
              <Input type="number" value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPaymentTarget(null)}>取消</Button>
            <Button
              onClick={() => paymentMutation.mutate()}
              disabled={!paymentAmount || Number(paymentAmount) <= 0 || paymentMutation.isPending}
            >
              {paymentMutation.isPending ? "記錄中..." : "確認"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
