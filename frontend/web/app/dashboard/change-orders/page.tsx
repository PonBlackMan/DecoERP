"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Trash2, Link2, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  getChangeOrders, createChangeOrder, updateChangeOrderStatus, requestSignToken,
  CHANGE_ORDER_STATUS_LABELS, CHANGE_ORDER_STATUS_COLORS,
  CreateChangeOrderItemInput, ChangeOrderItem,
} from "@/lib/change-orders";
import { getProjects } from "@/lib/projects";

const STATUS_KEYS = ["Draft", "PendingSign", "Signed", "Executed"];

const defaultItem: CreateChangeOrderItemInput = {
  itemName: "",
  description: "",
  unitPrice: 0,
  qty: 1,
};

const defaultForm = {
  projectId: "",
  orderNo: "",
  reason: "",
};

export default function ChangeOrdersPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [items, setItems] = useState<CreateChangeOrderItemInput[]>([{ ...defaultItem }]);

  // Sign link dialog state
  const [signDialogCo, setSignDialogCo] = useState<ChangeOrderItem | null>(null);
  const [phoneLastFour, setPhoneLastFour] = useState("");
  const [generatedUrl, setGeneratedUrl] = useState("");
  const [copied, setCopied] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["change-orders"],
    queryFn: () => getChangeOrders(),
  });

  const { data: projectsData } = useQuery({
    queryKey: ["projects-list"],
    queryFn: () => getProjects({ pageSize: 100 }),
  });

  const createMutation = useMutation({
    mutationFn: () =>
      createChangeOrder({
        projectId: form.projectId,
        orderNo: form.orderNo,
        reason: form.reason,
        items: items.filter((i) => i.itemName.trim()),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["change-orders"] });
      toast.success("變更單建立成功");
      setOpen(false);
      setForm(defaultForm);
      setItems([{ ...defaultItem }]);
    },
    onError: () => toast.error("建立失敗，請再試一次"),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      updateChangeOrderStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["change-orders"] });
      toast.success("狀態已更新");
    },
    onError: () => toast.error("更新失敗"),
  });

  const signTokenMutation = useMutation({
    mutationFn: () => requestSignToken(signDialogCo!.id, phoneLastFour),
    onSuccess: (result) => {
      qc.invalidateQueries({ queryKey: ["change-orders"] });
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      setGeneratedUrl(`${origin}/sign?token=${result.token}`);
    },
    onError: () => toast.error("產生連結失敗"),
  });

  const handleCopy = async () => {
    await navigator.clipboard.writeText(generatedUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const openSignDialog = (co: ChangeOrderItem) => {
    setSignDialogCo(co);
    setPhoneLastFour("");
    setGeneratedUrl(co.signToken ? `${window.location.origin}/sign?token=${co.signToken}` : "");
    setCopied(false);
  };

  const closeSignDialog = () => {
    setSignDialogCo(null);
    setGeneratedUrl("");
    setPhoneLastFour("");
  };

  const totalAmount = items.reduce((sum, i) => sum + (Number(i.unitPrice) || 0) * (Number(i.qty) || 0), 0);
  const addItem = () => setItems([...items, { ...defaultItem }]);
  const removeItem = (idx: number) => {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== idx));
  };
  const updateItem = (idx: number, field: keyof CreateChangeOrderItemInput, value: string | number) => {
    setItems(items.map((item, i) => (i === idx ? { ...item, [field]: value } : item)));
  };

  const canSubmit = form.projectId && form.orderNo.trim() && form.reason.trim() && items.some((i) => i.itemName.trim());

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">變更單管理</h1>
          <p className="text-sm text-muted-foreground mt-1">施工中加減項記錄與屋主簽認</p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />新增變更單
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            變更單列表
            {data && (
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                共 {data.totalCount} 筆
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <p className="text-center text-sm text-muted-foreground py-8">載入中...</p>
          ) : !data?.items.length ? (
            <p className="text-center text-sm text-muted-foreground py-8">目前沒有變更單資料</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground">
                    <th className="text-left py-2 px-3">單號</th>
                    <th className="text-left py-2 px-3">工程</th>
                    <th className="text-left py-2 px-3">原因</th>
                    <th className="text-right py-2 px-3">金額</th>
                    <th className="text-left py-2 px-3">狀態</th>
                    <th className="text-left py-2 px-3">日期</th>
                    <th className="py-2 px-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((co) => (
                    <tr key={co.id} className="border-b last:border-0 hover:bg-muted/40">
                      <td className="py-2.5 px-3 font-mono text-xs">{co.orderNo}</td>
                      <td className="py-2.5 px-3">{co.projectName ?? co.projectId}</td>
                      <td className="py-2.5 px-3"><div className="max-w-45 truncate">{co.reason}</div></td>
                      <td className="py-2.5 px-3 text-right">
                        {Number(co.totalAmount).toLocaleString("zh-TW")} 元
                      </td>
                      <td className="py-2.5 px-3">
                        <Badge variant={CHANGE_ORDER_STATUS_COLORS[co.status] as "default" | "secondary" | "outline" | "destructive"}>
                          {CHANGE_ORDER_STATUS_LABELS[co.status] ?? co.status}
                        </Badge>
                      </td>
                      <td className="py-2.5 px-3 text-muted-foreground">
                        {new Date(co.createdAt).toLocaleDateString("zh-TW")}
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-1">
                          {/* Sign link button: show for Draft/PendingSign */}
                          {(co.status === "Draft" || co.status === "PendingSign") && (
                            <Button
                              size="sm"
                              variant={co.signToken ? "outline" : "secondary"}
                              className="h-7 text-xs gap-1"
                              onClick={() => openSignDialog(co)}
                            >
                              <Link2 className="h-3 w-3" />
                              {co.signToken ? "連結" : "發送簽認"}
                            </Button>
                          )}
                          <Select
                            value={co.status}
                            onValueChange={(v) => v && statusMutation.mutate({ id: co.id, status: v as string })}
                          >
                            <SelectTrigger className="h-7 text-xs w-24">
                              <SelectValue>{CHANGE_ORDER_STATUS_LABELS[co.status]}</SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              {STATUS_KEYS.map((s) => (
                                <SelectItem key={s} value={s}>
                                  {CHANGE_ORDER_STATUS_LABELS[s]}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sign Link Dialog */}
      <Dialog open={!!signDialogCo} onOpenChange={(v) => { if (!v) closeSignDialog(); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>發送客戶簽認連結</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground">
              系統將產生一個專屬連結，客戶透過連結確認變更內容並以手繪方式簽名。
            </p>
            <div className="space-y-2">
              <Label>客戶電話末四碼 *</Label>
              <Input
                value={phoneLastFour}
                onChange={(e) => setPhoneLastFour(e.target.value.replace(/\D/g, "").slice(0, 4))}
                placeholder="例：5678"
                maxLength={4}
                disabled={!!generatedUrl}
              />
              <p className="text-xs text-muted-foreground">客戶須輸入相符的末四碼才能完成簽認</p>
            </div>

            {generatedUrl && (
              <div className="space-y-2">
                <Label>簽認連結（有效期 7 天）</Label>
                <div className="flex gap-2">
                  <Input value={generatedUrl} readOnly className="text-xs font-mono" />
                  <Button
                    size="sm"
                    variant="outline"
                    className="shrink-0"
                    onClick={handleCopy}
                  >
                    {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  複製後透過 LINE 或訊息傳送給客戶
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeSignDialog}>關閉</Button>
            {!generatedUrl && (
              <Button
                onClick={() => signTokenMutation.mutate()}
                disabled={phoneLastFour.length !== 4 || signTokenMutation.isPending}
              >
                {signTokenMutation.isPending ? "產生中..." : "產生連結"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl flex flex-col max-h-[90vh]">
          <DialogHeader className="flex-none">
            <DialogTitle>新增變更單</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto min-h-0 space-y-4 py-2 pr-1">
            <div className="space-y-2">
              <Label>工程 *</Label>
              <Select value={form.projectId} onValueChange={(v) => v && setForm({ ...form, projectId: v as string })}>
                <SelectTrigger>
                  <SelectValue placeholder="選擇工程" />
                </SelectTrigger>
                <SelectContent>
                  {projectsData?.items.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.code} - {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>變更單號 *</Label>
              <Input
                value={form.orderNo}
                onChange={(e) => setForm({ ...form, orderNo: e.target.value })}
                placeholder="CO-2024-001"
              />
            </div>
            <div className="space-y-2">
              <Label>變更原因 *</Label>
              <Input
                value={form.reason}
                onChange={(e) => setForm({ ...form, reason: e.target.value })}
                placeholder="業主要求更換衛浴設備"
              />
            </div>

            {/* Items */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>變更項目</Label>
                <Button type="button" variant="outline" size="sm" onClick={addItem}>
                  <Plus className="h-3 w-3 mr-1" />新增項目
                </Button>
              </div>
              <div className="space-y-2">
                {items.map((item, idx) => (
                  <div key={idx} className="border rounded-md p-2 space-y-2">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">品項名稱 *</p>
                      <Input
                        value={item.itemName}
                        onChange={(e) => updateItem(idx, "itemName", e.target.value)}
                        placeholder="衛浴設備更換"
                        className="h-8 text-sm"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-2 items-end">
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">單價</p>
                        <Input
                          type="number"
                          value={item.unitPrice}
                          onChange={(e) => updateItem(idx, "unitPrice", Number(e.target.value))}
                          className="h-8 text-sm"
                        />
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">數量</p>
                        <Input
                          type="number"
                          value={item.qty}
                          onChange={(e) => updateItem(idx, "qty", Number(e.target.value))}
                          className="h-8 text-sm"
                          min={1}
                        />
                      </div>
                      <div className="flex justify-end">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(idx)}
                          disabled={items.length === 1}
                          className="h-8 w-8 p-0"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-end text-sm font-medium pt-1">
                合計：{totalAmount.toLocaleString("zh-TW")} 元
              </div>
            </div>
          </div>
          <DialogFooter className="flex-none">
            <Button variant="outline" onClick={() => setOpen(false)}>
              取消
            </Button>
            <Button
              onClick={() => createMutation.mutate()}
              disabled={!canSubmit || createMutation.isPending}
            >
              {createMutation.isPending ? "建立中..." : "建立變更單"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
