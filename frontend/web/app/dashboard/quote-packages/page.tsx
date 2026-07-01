"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Trash2, Package, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getQuotePackages, createQuotePackage, deleteQuotePackage,
  QuotePackage, QuotePackageItemInput,
} from "@/lib/quote-packages";

const CATEGORIES = ["木作", "油漆", "水電", "泥作", "鋁窗", "鐵件", "地坪", "廚房設備", "衛浴設備", "家具", "燈具", "其他"];
const SPACES = ["客廳", "主臥", "次臥", "廚房", "衛浴", "玄關", "書房", "陽台", "公共空間"];

const emptyItem = (): QuotePackageItemInput => ({
  spaceName: "", category: "", itemName: "", unit: "式", unitPrice: 0, qty: 1, sortOrder: 0,
});

function PackageCard({ pkg, onDelete }: { pkg: QuotePackage; onDelete: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const total = pkg.items.reduce((s, i) => s + i.unitPrice * i.qty, 0);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <CardTitle className="text-base">{pkg.name}</CardTitle>
              <Badge variant="secondary" className="text-xs">{pkg.items.length} 項</Badge>
            </div>
            {pkg.description && (
              <p className="text-sm text-muted-foreground mt-1 truncate">{pkg.description}</p>
            )}
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <span className="text-sm font-medium">
              {total.toLocaleString("zh-TW", { style: "currency", currency: "TWD", maximumFractionDigits: 0 })}
            </span>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setExpanded(!expanded)}>
              {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive hover:text-destructive"
              onClick={onDelete}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      {expanded && pkg.items.length > 0 && (
        <CardContent className="pt-0">
          <div className="border rounded-md overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left px-3 py-2 text-muted-foreground font-medium">工項</th>
                  <th className="text-right px-3 py-2 text-muted-foreground font-medium">單價</th>
                  <th className="text-right px-3 py-2 text-muted-foreground font-medium">數量</th>
                  <th className="text-right px-3 py-2 text-muted-foreground font-medium">小計</th>
                </tr>
              </thead>
              <tbody>
                {pkg.items.map((item) => (
                  <tr key={item.id} className="border-t">
                    <td className="px-3 py-2">
                      <span className="text-muted-foreground">{item.spaceName && `[${item.spaceName}] `}</span>
                      {item.category && <span className="text-muted-foreground">{item.category} · </span>}
                      {item.itemName}
                    </td>
                    <td className="px-3 py-2 text-right">{item.unitPrice.toLocaleString("zh-TW")}</td>
                    <td className="px-3 py-2 text-right">{item.qty} {item.unit}</td>
                    <td className="px-3 py-2 text-right font-medium">
                      {(item.unitPrice * item.qty).toLocaleString("zh-TW")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

export default function QuotePackagesPage() {
  const queryClient = useQueryClient();
  const [openCreate, setOpenCreate] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<QuotePackage | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [items, setItems] = useState<QuotePackageItemInput[]>([emptyItem()]);

  const { data, isLoading } = useQuery({
    queryKey: ["quote-packages"],
    queryFn: () => getQuotePackages(false),
  });

  const createMutation = useMutation({
    mutationFn: () => createQuotePackage({
      name,
      description: description || undefined,
      items: items.map((it, i) => ({ ...it, sortOrder: i })),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quote-packages"] });
      toast.success("報價範本建立成功");
      setOpenCreate(false);
      setName(""); setDescription(""); setItems([emptyItem()]);
    },
    onError: () => toast.error("建立失敗"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteQuotePackage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quote-packages"] });
      toast.success("範本已刪除");
      setDeleteTarget(null);
    },
  });

  const updateItem = (i: number, field: keyof QuotePackageItemInput, value: string | number | null) =>
    setItems((prev) => prev.map((it, idx) => idx === i ? { ...it, [field]: value ?? "" } : it));

  const total = items.reduce((s, it) => s + it.unitPrice * it.qty, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">報價範本</h1>
          <p className="text-sm text-muted-foreground mt-1">預先定義常見的報價組合，快速套用到新報價單</p>
        </div>
        <Button onClick={() => setOpenCreate(true)}>
          <Plus className="mr-2 h-4 w-4" />新增範本
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}</div>
      ) : !data?.length ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Package className="h-12 w-12 text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground">尚無報價範本</p>
          <p className="text-sm text-muted-foreground mt-1">新增範本後，可在建立報價單時快速套用</p>
          <Button variant="outline" className="mt-4" onClick={() => setOpenCreate(true)}>
            <Plus className="mr-2 h-4 w-4" />建立第一個範本
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {data.map((pkg) => (
            <PackageCard
              key={pkg.id}
              pkg={pkg}
              onDelete={() => setDeleteTarget(pkg)}
            />
          ))}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={openCreate} onOpenChange={setOpenCreate}>
        <DialogContent className="max-w-2xl flex flex-col max-h-[90vh]">
          <DialogHeader className="flex-none">
            <DialogTitle>新增報價範本</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto min-h-0 space-y-4 py-2 pr-1">
            <div className="space-y-2">
              <Label>範本名稱 *</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="例：全室翻新標準包、廚衛改造包"
              />
            </div>
            <div className="space-y-2">
              <Label>說明</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="適用情境或包含項目說明"
                rows={2}
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>報價項目</Label>
                <Button type="button" size="sm" variant="outline" onClick={() => setItems([...items, emptyItem()])}>
                  <Plus className="h-3 w-3 mr-1" />新增項目
                </Button>
              </div>
              {items.map((item, i) => (
                <div key={i} className="border rounded-md p-3 space-y-2">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
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
                      onChange={(e) => updateItem(i, "unitPrice", Number(e.target.value) || 0)}
                    />
                    <Input
                      type="number"
                      className="text-sm"
                      placeholder="數量"
                      value={item.qty || ""}
                      onChange={(e) => updateItem(i, "qty", Number(e.target.value) || 0)}
                    />
                    <div className="flex justify-end">
                      {items.length > 1 && (
                        <Button
                          type="button" variant="ghost" size="sm" className="h-9 w-9 p-0"
                          onClick={() => setItems(items.filter((_, idx) => idx !== i))}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end text-sm font-medium">
              預估合計：{total.toLocaleString("zh-TW", { style: "currency", currency: "TWD", maximumFractionDigits: 0 })}
            </div>
          </div>
          <DialogFooter className="flex-none">
            <Button variant="outline" onClick={() => setOpenCreate(false)}>取消</Button>
            <Button
              onClick={() => createMutation.mutate()}
              disabled={!name || items.some((it) => !it.itemName) || createMutation.isPending}
            >
              {createMutation.isPending ? "建立中..." : "建立範本"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(v: boolean) => !v && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>刪除範本</AlertDialogTitle>
            <AlertDialogDescription>
              確定要刪除「{deleteTarget?.name}」？此操作無法復原，但不影響已建立的報價單。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
            >
              確認刪除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
