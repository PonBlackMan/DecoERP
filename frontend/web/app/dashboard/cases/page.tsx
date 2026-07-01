"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getCases, createCase, updateCaseStage,
  STAGE_LABELS, STAGE_COLORS, SOURCE_LABELS, CaseStage, CaseSource, CaseDto
} from "@/lib/cases";

const STAGES: CaseStage[] = ["Negotiating", "Quoted", "DesignConfirming", "Contracted", "Abandoned"];
const SOURCES: CaseSource[] = ["Owner", "Developer", "Referral", "Online"];

type FormState = {
  clientName: string;
  clientPhone: string;
  source: CaseSource;
  referrerName: string;
  referralFeePercent: string;
};

const emptyForm = (): FormState => ({
  clientName: "", clientPhone: "", source: "Owner", referrerName: "", referralFeePercent: "",
});

export default function CasesPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState<CaseStage | "all">("all");
  const [openCreate, setOpenCreate] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm());

  const { data, isLoading } = useQuery({
    queryKey: ["cases", stageFilter, search],
    queryFn: () => getCases({ stage: stageFilter === "all" ? undefined : stageFilter, search }),
  });

  const createMutation = useMutation({
    mutationFn: () => createCase({
      clientName: form.clientName,
      clientPhone: form.clientPhone || undefined,
      source: form.source,
      referrerName: form.referrerName || undefined,
      referralFeePercent: form.referralFeePercent ? Number(form.referralFeePercent) : undefined,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cases"] });
      toast.success("案件建立成功");
      setOpenCreate(false);
      setForm(emptyForm());
    },
    onError: () => toast.error("建立失敗，請再試一次"),
  });

  const stageMutation = useMutation({
    mutationFn: ({ id, stage }: { id: string; stage: CaseStage }) => updateCaseStage(id, stage),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cases"] });
      toast.success("狀態已更新");
    },
  });

  const showReferrerFields = form.source === "Referral";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">案件管理</h1>
          <p className="text-sm text-muted-foreground mt-1">追蹤洽談中到簽約的業務漏斗</p>
        </div>
        <Button onClick={() => setOpenCreate(true)}>
          <Plus className="mr-2 h-4 w-4" />新增案件
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜尋客戶名稱..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={stageFilter} onValueChange={(v) => setStageFilter(v as typeof stageFilter)}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="所有階段" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">所有階段</SelectItem>
            {STAGES.map((s) => (
              <SelectItem key={s} value={s}>{STAGE_LABELS[s]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Cases Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            案件列表
            {data && <span className="ml-2 text-sm font-normal text-muted-foreground">共 {data.totalCount} 筆</span>}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
            </div>
          ) : !data?.items.length ? (
            <p className="text-center text-sm text-muted-foreground py-8">目前沒有案件，點選右上角新增</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground">
                    <th className="text-left py-2 px-3">客戶名稱</th>
                    <th className="text-left py-2 px-3">聯絡電話</th>
                    <th className="text-left py-2 px-3">來源</th>
                    <th className="text-left py-2 px-3">建案 / 戶別</th>
                    <th className="text-left py-2 px-3">階段</th>
                    <th className="text-left py-2 px-3">建立日期</th>
                    <th className="py-2 px-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((c: CaseDto) => (
                    <tr key={c.id} className="border-b last:border-0 hover:bg-muted/40">
                      <td className="py-2.5 px-3">
                        <p className="font-medium">{c.clientName}</p>
                        {c.referrerName && (
                          <p className="text-xs text-muted-foreground">介紹人：{c.referrerName}</p>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-muted-foreground">{c.clientPhone ?? "—"}</td>
                      <td className="py-2.5 px-3">
                        <span className="text-sm">{SOURCE_LABELS[c.source] ?? c.source}</span>
                      </td>
                      <td className="py-2.5 px-3 text-muted-foreground">
                        {c.developerProjectName ? `${c.developerProjectName} ${c.unitNo ?? ""}` : "—"}
                      </td>
                      <td className="py-2.5 px-3">
                        <Badge className={`${STAGE_COLORS[c.stage]} border-0`}>
                          {STAGE_LABELS[c.stage]}
                        </Badge>
                      </td>
                      <td className="py-2.5 px-3 text-muted-foreground">
                        {new Date(c.createdAt).toLocaleDateString("zh-TW")}
                      </td>
                      <td className="py-2.5 px-3">
                        <Select
                          value={c.stage}
                          onValueChange={(v) => stageMutation.mutate({ id: c.id, stage: v as CaseStage })}
                        >
                          <SelectTrigger className="h-7 text-xs w-28">
                            <SelectValue>{STAGE_LABELS[c.stage]}</SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {STAGES.map((s) => (
                              <SelectItem key={s} value={s}>{STAGE_LABELS[s]}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>新增案件</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>客戶姓名 *</Label>
              <Input
                value={form.clientName}
                onChange={(e) => setForm({ ...form, clientName: e.target.value })}
                placeholder="王小明"
              />
            </div>
            <div className="space-y-2">
              <Label>聯絡電話</Label>
              <Input
                value={form.clientPhone}
                onChange={(e) => setForm({ ...form, clientPhone: e.target.value })}
                placeholder="0912-345-678"
              />
            </div>
            <div className="space-y-2">
              <Label>案件來源</Label>
              <Select
                value={form.source}
                onValueChange={(v) => setForm({ ...form, source: v as CaseSource, referrerName: "", referralFeePercent: "" })}
              >
                <SelectTrigger>
                  <SelectValue>{SOURCE_LABELS[form.source]}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {SOURCES.map((s) => (
                    <SelectItem key={s} value={s}>{SOURCE_LABELS[s]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {showReferrerFields && (
              <>
                <div className="space-y-2">
                  <Label>介紹人姓名</Label>
                  <Input
                    value={form.referrerName}
                    onChange={(e) => setForm({ ...form, referrerName: e.target.value })}
                    placeholder="例：陳先生"
                  />
                </div>
                <div className="space-y-2">
                  <Label>介紹費率（%）</Label>
                  <Input
                    type="number"
                    value={form.referralFeePercent}
                    onChange={(e) => setForm({ ...form, referralFeePercent: e.target.value })}
                    placeholder="例：3"
                    min={0}
                    max={100}
                    step={0.5}
                  />
                  <p className="text-xs text-muted-foreground">以工程總金額的百分比計算</p>
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenCreate(false)}>取消</Button>
            <Button
              onClick={() => createMutation.mutate()}
              disabled={!form.clientName || createMutation.isPending}
            >
              {createMutation.isPending ? "建立中..." : "建立案件"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
