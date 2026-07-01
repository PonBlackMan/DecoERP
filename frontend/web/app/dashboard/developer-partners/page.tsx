"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Trash2, Pencil, Building2 } from "lucide-react";
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
import { Skeleton } from "@/components/ui/skeleton";
import {
  getDeveloperProjects, createDeveloperProject, updateDeveloperProject, deleteDeveloperProject,
  DeveloperProject, DeveloperProjectInput,
} from "@/lib/developer-projects";

const emptyForm = (): DeveloperProjectInput => ({
  name: "", developerName: "", address: "", notes: "",
  contactName: "", contactPhone: "", contactEmail: "",
  commissionRatePercent: undefined, deliveryRequirements: "", brandStandards: "",
});

export default function DeveloperPartnersPage() {
  const queryClient = useQueryClient();
  const [openForm, setOpenForm] = useState(false);
  const [editTarget, setEditTarget] = useState<DeveloperProject | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DeveloperProject | null>(null);
  const [form, setForm] = useState<DeveloperProjectInput>(emptyForm());

  const { data, isLoading } = useQuery({
    queryKey: ["developer-projects"],
    queryFn: () => getDeveloperProjects(false),
  });

  const createMutation = useMutation({
    mutationFn: () => createDeveloperProject(form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["developer-projects"] });
      toast.success("合作夥伴建立成功");
      closeForm();
    },
    onError: () => toast.error("建立失敗"),
  });

  const updateMutation = useMutation({
    mutationFn: () =>
      updateDeveloperProject(editTarget!.id, { ...form, isActive: editTarget!.isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["developer-projects"] });
      toast.success("合作夥伴已更新");
      closeForm();
    },
    onError: () => toast.error("更新失敗"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteDeveloperProject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["developer-projects"] });
      toast.success("合作夥伴已刪除");
      setDeleteTarget(null);
    },
  });

  const openCreate = () => {
    setEditTarget(null);
    setForm(emptyForm());
    setOpenForm(true);
  };

  const openEdit = (dp: DeveloperProject) => {
    setEditTarget(dp);
    setForm({
      name: dp.name,
      developerName: dp.developerName,
      address: dp.address ?? "",
      notes: dp.notes ?? "",
      contactName: dp.contactName ?? "",
      contactPhone: dp.contactPhone ?? "",
      contactEmail: dp.contactEmail ?? "",
      commissionRatePercent: dp.commissionRatePercent,
      deliveryRequirements: dp.deliveryRequirements ?? "",
      brandStandards: dp.brandStandards ?? "",
    });
    setOpenForm(true);
  };

  const closeForm = () => {
    setOpenForm(false);
    setEditTarget(null);
    setForm(emptyForm());
  };

  const update = (field: keyof DeveloperProjectInput, value: string | number | undefined) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">建案合作夥伴</h1>
          <p className="text-sm text-muted-foreground mt-1">管理建設公司合作條件：佣金比例、交期要求、品牌規範</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />新增合作夥伴
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}</div>
      ) : !data?.length ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Building2 className="h-12 w-12 text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground">尚無合作夥伴資料</p>
          <Button variant="outline" className="mt-4" onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" />新增第一筆
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {data.map((dp) => (
            <Card key={dp.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <CardTitle className="text-base">{dp.name}</CardTitle>
                      <Badge variant={dp.isActive ? "secondary" : "outline"} className="text-xs">
                        {dp.isActive ? "合作中" : "已停用"}
                      </Badge>
                      <Badge variant="outline" className="text-xs">{dp.unitCount} 戶</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{dp.developerName}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => openEdit(dp)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      onClick={() => setDeleteTarget(dp)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0 space-y-1 text-sm">
                {(dp.contactName || dp.contactPhone || dp.contactEmail) && (
                  <p className="text-muted-foreground">
                    聯絡人：{dp.contactName || "-"} {dp.contactPhone && `· ${dp.contactPhone}`} {dp.contactEmail && `· ${dp.contactEmail}`}
                  </p>
                )}
                {dp.commissionRatePercent != null && (
                  <p className="text-muted-foreground">佣金比例：{dp.commissionRatePercent}%</p>
                )}
                {dp.deliveryRequirements && (
                  <p className="text-muted-foreground">交期要求：{dp.deliveryRequirements}</p>
                )}
                {dp.brandStandards && (
                  <p className="text-muted-foreground">品牌規範：{dp.brandStandards}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={openForm} onOpenChange={(v) => !v && closeForm()}>
        <DialogContent className="max-w-2xl flex flex-col max-h-[90vh]">
          <DialogHeader className="flex-none">
            <DialogTitle>{editTarget ? "編輯合作夥伴" : "新增合作夥伴"}</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto min-h-0 space-y-4 py-2 pr-1">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>建案名稱 *</Label>
                <Input value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="例：翠堤大院" />
              </div>
              <div className="space-y-2">
                <Label>建設公司 *</Label>
                <Input value={form.developerName} onChange={(e) => update("developerName", e.target.value)} placeholder="例：大安建設" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>地址</Label>
              <Input value={form.address} onChange={(e) => update("address", e.target.value)} />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label>聯絡人</Label>
                <Input value={form.contactName} onChange={(e) => update("contactName", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>聯絡電話</Label>
                <Input value={form.contactPhone} onChange={(e) => update("contactPhone", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>聯絡信箱</Label>
                <Input value={form.contactEmail} onChange={(e) => update("contactEmail", e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>佣金比例（%）</Label>
              <Input
                type="number"
                value={form.commissionRatePercent ?? ""}
                onChange={(e) => update("commissionRatePercent", e.target.value === "" ? undefined : Number(e.target.value))}
                placeholder="例：3"
              />
            </div>
            <div className="space-y-2">
              <Label>交期要求</Label>
              <Textarea value={form.deliveryRequirements} onChange={(e) => update("deliveryRequirements", e.target.value)} rows={2} />
            </div>
            <div className="space-y-2">
              <Label>品牌規範</Label>
              <Textarea value={form.brandStandards} onChange={(e) => update("brandStandards", e.target.value)} rows={2} />
            </div>
            <div className="space-y-2">
              <Label>備註</Label>
              <Textarea value={form.notes} onChange={(e) => update("notes", e.target.value)} rows={2} />
            </div>
          </div>
          <DialogFooter className="flex-none">
            <Button variant="outline" onClick={closeForm}>取消</Button>
            <Button
              onClick={() => (editTarget ? updateMutation.mutate() : createMutation.mutate())}
              disabled={!form.name || !form.developerName || createMutation.isPending || updateMutation.isPending}
            >
              {createMutation.isPending || updateMutation.isPending ? "儲存中..." : "儲存"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(v: boolean) => !v && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>刪除合作夥伴</AlertDialogTitle>
            <AlertDialogDescription>
              確定要刪除「{deleteTarget?.name}」？此操作無法復原。
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
