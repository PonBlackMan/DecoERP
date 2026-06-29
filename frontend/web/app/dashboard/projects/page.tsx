"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  getProjects, createProject, updateProjectStatus,
  PROJECT_STATUS_LABELS, PROJECT_STATUS_COLORS,
} from "@/lib/projects";

const STATUS_TABS = [
  { value: "all", label: "全部" },
  { value: "Contracted", label: "已簽約" },
  { value: "InProgress", label: "施工中" },
  { value: "Inspecting", label: "驗收中" },
  { value: "Closed", label: "結案" },
];

const STATUS_KEYS = ["Contracted", "InProgress", "Inspecting", "Closed"];

const defaultForm = {
  code: "",
  name: "",
  ownerName: "",
  ownerPhone: "",
  contractAmount: "",
  address: "",
  startDate: "",
  endDate: "",
};

export default function ProjectsPage() {
  const qc = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("all");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(defaultForm);

  const { data, isLoading } = useQuery({
    queryKey: ["projects", statusFilter],
    queryFn: () => getProjects({ status: statusFilter === "all" ? undefined : statusFilter }),
  });

  const createMutation = useMutation({
    mutationFn: () =>
      createProject({
        code: form.code,
        name: form.name,
        ownerName: form.ownerName,
        ownerPhone: form.ownerPhone || undefined,
        contractAmount: Number(form.contractAmount),
        address: form.address || undefined,
        startDate: form.startDate || undefined,
        endDate: form.endDate || undefined,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["projects"] });
      toast.success("工程建立成功");
      setOpen(false);
      setForm(defaultForm);
    },
    onError: () => toast.error("建立失敗，請再試一次"),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      updateProjectStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["projects"] });
      toast.success("狀態已更新");
    },
    onError: () => toast.error("更新失敗"),
  });

  const canSubmit =
    form.code.trim() &&
    form.name.trim() &&
    form.ownerName.trim() &&
    form.contractAmount &&
    !isNaN(Number(form.contractAmount));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">工程專案</h1>
          <p className="text-sm text-muted-foreground mt-1">管理施工中工程、進度與驗收</p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />新增工程
        </Button>
      </div>

      {/* Status Tab Filter */}
      <div className="flex gap-1 border-b">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setStatusFilter(tab.value)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              statusFilter === tab.value
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            工程列表
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
            <p className="text-center text-sm text-muted-foreground py-8">目前沒有工程資料</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground">
                    <th className="text-left py-2 px-3">工程編號</th>
                    <th className="text-left py-2 px-3">工程名稱</th>
                    <th className="text-left py-2 px-3">業主</th>
                    <th className="text-right py-2 px-3">合約金額</th>
                    <th className="text-left py-2 px-3">狀態</th>
                    <th className="text-left py-2 px-3">開始日</th>
                    <th className="text-left py-2 px-3">結束日</th>
                    <th className="py-2 px-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((p) => (
                    <tr key={p.id} className="border-b last:border-0 hover:bg-muted/40">
                      <td className="py-2.5 px-3 font-mono text-xs">{p.code}</td>
                      <td className="py-2.5 px-3 font-medium">{p.name}</td>
                      <td className="py-2.5 px-3">
                        <div>{p.ownerName}</div>
                        {p.ownerPhone && (
                          <div className="text-xs text-muted-foreground">{p.ownerPhone}</div>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        {Number(p.contractAmount).toLocaleString("zh-TW")} 元
                      </td>
                      <td className="py-2.5 px-3">
                        <Badge variant={PROJECT_STATUS_COLORS[p.status] as "default" | "secondary" | "outline" | "destructive"}>
                          {PROJECT_STATUS_LABELS[p.status] ?? p.status}
                        </Badge>
                      </td>
                      <td className="py-2.5 px-3 text-muted-foreground">
                        {p.startDate ? new Date(p.startDate).toLocaleDateString("zh-TW") : "—"}
                      </td>
                      <td className="py-2.5 px-3 text-muted-foreground">
                        {p.endDate ? new Date(p.endDate).toLocaleDateString("zh-TW") : "—"}
                      </td>
                      <td className="py-2.5 px-3">
                        <Select
                          value={p.status}
                          onValueChange={(v) => v && statusMutation.mutate({ id: p.id, status: v as string })}
                        >
                          <SelectTrigger className="h-7 text-xs w-28">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {STATUS_KEYS.map((s) => (
                              <SelectItem key={s} value={s}>
                                {PROJECT_STATUS_LABELS[s]}
                              </SelectItem>
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
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>新增工程</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>工程編號 *</Label>
                <Input
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                  placeholder="P2024-001"
                />
              </div>
              <div className="space-y-2">
                <Label>合約金額 *</Label>
                <Input
                  type="number"
                  value={form.contractAmount}
                  onChange={(e) => setForm({ ...form, contractAmount: e.target.value })}
                  placeholder="1000000"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>工程名稱 *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="台北市信義區室內裝修工程"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>業主姓名 *</Label>
                <Input
                  value={form.ownerName}
                  onChange={(e) => setForm({ ...form, ownerName: e.target.value })}
                  placeholder="王小明"
                />
              </div>
              <div className="space-y-2">
                <Label>業主電話</Label>
                <Input
                  value={form.ownerPhone}
                  onChange={(e) => setForm({ ...form, ownerPhone: e.target.value })}
                  placeholder="0912-345-678"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>施工地址</Label>
              <Input
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="台北市信義區..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>開始日期</Label>
                <Input
                  type="date"
                  value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>結束日期</Label>
                <Input
                  type="date"
                  value={form.endDate}
                  onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              取消
            </Button>
            <Button
              onClick={() => createMutation.mutate()}
              disabled={!canSubmit || createMutation.isPending}
            >
              {createMutation.isPending ? "建立中..." : "建立工程"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
