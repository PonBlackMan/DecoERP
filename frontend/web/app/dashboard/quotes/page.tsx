"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Check, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import {
  getQuotes, createQuote, confirmQuote,
  STATUS_LABELS, STATUS_COLORS, QuoteSummaryDto, QuoteItemInput
} from "@/lib/quotes";

const CATEGORIES = ["木作", "油漆", "水電", "泥作", "鋁窗", "鐵件", "地坪", "廚房設備", "衛浴設備", "家具", "燈具", "其他"];
const SPACES = ["客廳", "主臥", "次臥", "廚房", "衛浴", "玄關", "書房", "陽台", "公共空間"];

const emptyItem = (): QuoteItemInput => ({
  spaceName: "", category: "", itemName: "", unit: "式", unitPrice: 0, qty: 1, sortOrder: 0,
});

export default function QuotesPage() {
  const queryClient = useQueryClient();
  const [openCreate, setOpenCreate] = useState(false);
  const [caseId, setCaseId] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<QuoteItemInput[]>([emptyItem()]);

  const { data, isLoading } = useQuery({
    queryKey: ["quotes"],
    queryFn: () => getQuotes(),
  });

  const createMutation = useMutation({
    mutationFn: () => createQuote({
      caseId,
      notes,
      items: items.map((it, i) => ({ ...it, sortOrder: i })),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quotes"] });
      toast.success("報價單建立成功");
      setOpenCreate(false);
      setCaseId(""); setNotes(""); setItems([emptyItem()]);
    },
    onError: () => toast.error("建立失敗"),
  });

  const confirmMutation = useMutation({
    mutationFn: (id: string) => confirmQuote(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quotes"] });
      toast.success("報價單已確認，案件狀態更新為已簽約");
    },
  });

  const total = items.reduce((s, it) => s + it.unitPrice * it.qty, 0);

  const updateItem = (i: number, field: keyof QuoteItemInput, value: string | number | null) =>
    setItems((prev) => prev.map((it, idx) => idx === i ? { ...it, [field]: value ?? "" } : it));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">報價管理</h1>
          <p className="text-sm text-muted-foreground mt-1">逐項報價，支援多版本，確認後轉合約金額</p>
        </div>
        <Button onClick={() => setOpenCreate(true)}>
          <Plus className="mr-2 h-4 w-4" />新增報價單
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            報價單列表
            {data && <span className="ml-2 text-sm font-normal text-muted-foreground">共 {data.totalCount} 筆</span>}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
          ) : !data?.items.length ? (
            <p className="text-center text-sm text-muted-foreground py-8">目前沒有報價單</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground">
                    <th className="text-left py-2 px-3">報價單號</th>
                    <th className="text-left py-2 px-3">客戶名稱</th>
                    <th className="text-left py-2 px-3">版本</th>
                    <th className="text-right py-2 px-3">金額</th>
                    <th className="text-left py-2 px-3">有效期限</th>
                    <th className="text-left py-2 px-3">狀態</th>
                    <th className="py-2 px-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((q: QuoteSummaryDto) => (
                    <tr key={q.id} className="border-b last:border-0 hover:bg-muted/40">
                      <td className="py-2.5 px-3 font-mono text-xs">{q.quoteNo}</td>
                      <td className="py-2.5 px-3 font-medium">{q.clientName}</td>
                      <td className="py-2.5 px-3 text-center">v{q.version}</td>
                      <td className="py-2.5 px-3 text-right font-medium">
                        {q.totalAmount.toLocaleString("zh-TW", { style: "currency", currency: "TWD", maximumFractionDigits: 0 })}
                      </td>
                      <td className="py-2.5 px-3 text-muted-foreground">
                        {q.validUntil ? new Date(q.validUntil).toLocaleDateString("zh-TW") : "—"}
                      </td>
                      <td className="py-2.5 px-3">
                        <Badge className={`${STATUS_COLORS[q.status]} border-0`}>
                          {STATUS_LABELS[q.status]}
                        </Badge>
                      </td>
                      <td className="py-2.5 px-3">
                        {q.status === "Draft" || q.status === "Sent" ? (
                          <Button
                            size="sm" variant="outline" className="h-7 text-xs"
                            onClick={() => confirmMutation.mutate(q.id)}
                            disabled={confirmMutation.isPending}
                          >
                            <Check className="mr-1 h-3 w-3" />確認
                          </Button>
                        ) : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={openCreate} onOpenChange={setOpenCreate}>
        <DialogContent className="max-w-2xl flex flex-col max-h-[90vh]">
          <DialogHeader className="flex-none">
            <DialogTitle>新增報價單</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto min-h-0 space-y-4 py-2 pr-1">
            <div className="space-y-2">
              <Label>案件 ID *</Label>
              <Input value={caseId} onChange={(e) => setCaseId(e.target.value)} placeholder="貼入案件 UUID" />
            </div>
            <div className="space-y-2">
              <Label>備註</Label>
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>報價明細</Label>
                <Button type="button" size="sm" variant="outline" onClick={() => setItems([...items, emptyItem()])}>
                  <Plus className="h-3 w-3 mr-1" />新增項目
                </Button>
              </div>
              {items.map((item, i) => (
                <div key={i} className="border rounded-md p-3 space-y-2">
                  {/* Row 1: Space / Category / Item Name */}
                  <div className="grid grid-cols-4 gap-2">
                    <Select value={item.spaceName} onValueChange={(v) => updateItem(i, "spaceName", v)}>
                      <SelectTrigger className="text-sm">
                        <SelectValue placeholder="空間" />
                      </SelectTrigger>
                      <SelectContent>
                        {SPACES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Select value={item.category} onValueChange={(v) => updateItem(i, "category", v)}>
                      <SelectTrigger className="text-sm">
                        <SelectValue placeholder="類別" />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Input
                      className="col-span-2 text-sm"
                      placeholder="工項名稱 *"
                      value={item.itemName}
                      onChange={(e) => updateItem(i, "itemName", e.target.value)}
                    />
                  </div>
                  {/* Row 2: Unit / Unit Price / Qty / Delete */}
                  <div className="grid grid-cols-4 gap-2">
                    <Input
                      className="text-sm"
                      placeholder="單位（式）"
                      value={item.unit}
                      onChange={(e) => updateItem(i, "unit", e.target.value)}
                    />
                    <Input
                      type="number"
                      className="text-sm"
                      placeholder="單價"
                      value={item.unitPrice || ""}
                      onChange={(e) => updateItem(i, "unitPrice", Number(e.target.value))}
                    />
                    <Input
                      type="number"
                      className="text-sm"
                      placeholder="數量"
                      value={item.qty || ""}
                      onChange={(e) => updateItem(i, "qty", Number(e.target.value))}
                    />
                    <div className="flex justify-end">
                      {items.length > 1 && (
                        <Button type="button" variant="ghost" size="sm" className="h-9 w-9 p-0"
                          onClick={() => setItems(items.filter((_, idx) => idx !== i))}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end text-sm font-medium">
              合計：{total.toLocaleString("zh-TW", { style: "currency", currency: "TWD", maximumFractionDigits: 0 })}
            </div>
          </div>
          <DialogFooter className="flex-none">
            <Button variant="outline" onClick={() => setOpenCreate(false)}>取消</Button>
            <Button
              onClick={() => createMutation.mutate()}
              disabled={!caseId || items.some(it => !it.itemName) || createMutation.isPending}
            >
              {createMutation.isPending ? "建立中..." : "建立報價單"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
