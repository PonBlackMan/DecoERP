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
import { getEmployees, createEmployee, updateEmployeeStatus } from "@/lib/hr";

const STATUS_TABS = [
  { value: "all", label: "全部" },
  { value: "active", label: "在職" },
  { value: "inactive", label: "離職" },
];

const defaultForm = {
  fullName: "",
  idNumber: "",
  jobTitle: "",
  department: "",
  phone: "",
  email: "",
  hireDate: "",
  baseSalary: "",
  emergencyContact: "",
  emergencyPhone: "",
};

export default function HrPage() {
  const qc = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("all");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [confirmOffboardId, setConfirmOffboardId] = useState<string | null>(null);

  const isActiveParam =
    statusFilter === "active" ? true : statusFilter === "inactive" ? false : undefined;

  const { data, isLoading } = useQuery({
    queryKey: ["employees", statusFilter],
    queryFn: () => getEmployees({ isActive: isActiveParam }),
  });

  const createMutation = useMutation({
    mutationFn: () =>
      createEmployee({
        fullName: form.fullName,
        idNumber: form.idNumber || undefined,
        jobTitle: form.jobTitle,
        department: form.department,
        phone: form.phone || undefined,
        email: form.email || undefined,
        hireDate: form.hireDate,
        baseSalary: Number(form.baseSalary),
        emergencyContact: form.emergencyContact || undefined,
        emergencyPhone: form.emergencyPhone || undefined,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["employees"] });
      toast.success("員工建立成功");
      setOpen(false);
      setForm(defaultForm);
    },
    onError: () => toast.error("建立失敗，請再試一次"),
  });

  const offboardMutation = useMutation({
    mutationFn: (id: string) => updateEmployeeStatus(id, false),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["employees"] });
      toast.success("已更新為離職狀態");
      setConfirmOffboardId(null);
    },
    onError: () => toast.error("更新失敗"),
  });

  const canSubmit =
    form.fullName.trim() &&
    form.jobTitle.trim() &&
    form.department.trim() &&
    form.hireDate &&
    form.baseSalary &&
    !isNaN(Number(form.baseSalary));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">人員管理</h1>
          <p className="text-sm text-muted-foreground mt-1">員工基本資料與狀態管理</p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />新增員工
        </Button>
      </div>

      {/* Status Filter Tabs */}
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
            員工列表
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
            <p className="text-center text-sm text-muted-foreground py-8">目前沒有員工資料</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground">
                    <th className="text-left py-2 px-3">姓名</th>
                    <th className="text-left py-2 px-3">職稱</th>
                    <th className="text-left py-2 px-3">部門</th>
                    <th className="text-left py-2 px-3">電話</th>
                    <th className="text-right py-2 px-3">底薪</th>
                    <th className="text-left py-2 px-3">到職日</th>
                    <th className="text-left py-2 px-3">狀態</th>
                    <th className="py-2 px-3">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((emp) => (
                    <tr key={emp.id} className="border-b last:border-0 hover:bg-muted/40">
                      <td className="py-2.5 px-3 font-medium">{emp.fullName}</td>
                      <td className="py-2.5 px-3">{emp.jobTitle}</td>
                      <td className="py-2.5 px-3 text-muted-foreground">{emp.department}</td>
                      <td className="py-2.5 px-3 text-muted-foreground">{emp.phone ?? "—"}</td>
                      <td className="py-2.5 px-3 text-right">
                        {Number(emp.baseSalary).toLocaleString("zh-TW")} 元
                      </td>
                      <td className="py-2.5 px-3 text-muted-foreground">
                        {new Date(emp.hireDate).toLocaleDateString("zh-TW")}
                      </td>
                      <td className="py-2.5 px-3">
                        <Badge variant={emp.isActive ? "default" : "secondary"}>
                          {emp.isActive ? "在職" : "離職"}
                        </Badge>
                      </td>
                      <td className="py-2.5 px-3">
                        {emp.isActive && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => setConfirmOffboardId(emp.id)}
                          >
                            離職
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

      {/* Create Employee Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg flex flex-col max-h-[90vh]">
          <DialogHeader className="flex-none">
            <DialogTitle>新增員工</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto min-h-0 space-y-4 py-2 pr-1">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>姓名 *</Label>
                <Input
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  placeholder="王小明"
                />
              </div>
              <div className="space-y-2">
                <Label>身分證號</Label>
                <Input
                  value={form.idNumber}
                  onChange={(e) => setForm({ ...form, idNumber: e.target.value })}
                  placeholder="A123456789"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>職稱 *</Label>
                <Input
                  value={form.jobTitle}
                  onChange={(e) => setForm({ ...form, jobTitle: e.target.value })}
                  placeholder="工程師"
                />
              </div>
              <div className="space-y-2">
                <Label>部門 *</Label>
                <Input
                  value={form.department}
                  onChange={(e) => setForm({ ...form, department: e.target.value })}
                  placeholder="工程部"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>電話</Label>
                <Input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="0912-345-678"
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="employee@example.com"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>到職日 *</Label>
                <Input
                  type="date"
                  value={form.hireDate}
                  onChange={(e) => setForm({ ...form, hireDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>底薪 *</Label>
                <Input
                  type="number"
                  value={form.baseSalary}
                  onChange={(e) => setForm({ ...form, baseSalary: e.target.value })}
                  placeholder="35000"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>緊急聯絡人</Label>
                <Input
                  value={form.emergencyContact}
                  onChange={(e) => setForm({ ...form, emergencyContact: e.target.value })}
                  placeholder="王大明"
                />
              </div>
              <div className="space-y-2">
                <Label>緊急聯絡電話</Label>
                <Input
                  value={form.emergencyPhone}
                  onChange={(e) => setForm({ ...form, emergencyPhone: e.target.value })}
                  placeholder="0912-000-000"
                />
              </div>
            </div>
          </div>
          <DialogFooter className="flex-none">
            <Button variant="outline" onClick={() => setOpen(false)}>取消</Button>
            <Button
              onClick={() => createMutation.mutate()}
              disabled={!canSubmit || createMutation.isPending}
            >
              {createMutation.isPending ? "建立中..." : "建立員工"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Offboard Confirm Dialog */}
      <Dialog open={!!confirmOffboardId} onOpenChange={(v) => { if (!v) setConfirmOffboardId(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>確認離職</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground py-2">
            確定要將此員工狀態更新為「離職」？此操作無法復原。
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOffboardId(null)}>取消</Button>
            <Button
              variant="destructive"
              onClick={() => confirmOffboardId && offboardMutation.mutate(confirmOffboardId)}
              disabled={offboardMutation.isPending}
            >
              {offboardMutation.isPending ? "處理中..." : "確認離職"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
