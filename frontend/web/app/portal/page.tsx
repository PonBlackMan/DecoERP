"use client";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Loader2, AlertCircle, Lock, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { verifyPortalAccess, getPortalData, PortalData } from "@/lib/portal";

const PROJECT_STATUS_LABELS: Record<string, string> = {
  Contracted: "已簽約", InProgress: "施工中", Inspecting: "驗收中", Closed: "結案",
};
const ISSUE_STATUS_LABELS: Record<string, string> = {
  open: "待處理", in_progress: "處理中", resolved: "已解決", closed: "已結案",
};
const INSPECTION_STATUS_LABELS: Record<string, string> = {
  pending: "待驗收", passed: "驗收通過", failed: "未通過",
};
const CHANGE_ORDER_STATUS_LABELS: Record<string, string> = {
  Draft: "草稿", PendingSign: "待簽認", Signed: "已簽認", Executed: "已執行",
};
const INVOICE_STATUS_LABELS: Record<string, string> = {
  Pending: "未收款", PartiallyPaid: "部分收款", Paid: "已收款", Overdue: "已逾期",
};

const currency = (n: number) =>
  n.toLocaleString("zh-TW", { style: "currency", currency: "TWD", maximumFractionDigits: 0 });
const dateStr = (s?: string) => (s ? new Date(s).toLocaleDateString("zh-TW") : "—");

function storageKey(token: string) {
  return `portal_phone_${token}`;
}

export default function PortalPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <PortalContent />
    </Suspense>
  );
}

function PortalContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [checkingStorage, setCheckingStorage] = useState(true);
  const [verifiedPhone, setVerifiedPhone] = useState<string | null>(null);
  const [phone, setPhone] = useState("");
  const [verifyError, setVerifyError] = useState("");
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem(storageKey(token));
    if (stored) {
      setVerifiedPhone(stored);
    } else {
      setCheckingStorage(false);
    }
  }, [token]);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["portal-data", token, verifiedPhone],
    queryFn: () => getPortalData(token, verifiedPhone!),
    enabled: !!verifiedPhone,
    refetchInterval: 60_000,
    retry: false,
  });

  useEffect(() => {
    if (verifiedPhone && isError) {
      sessionStorage.removeItem(storageKey(token));
      setVerifiedPhone(null);
      setVerifyError(error instanceof Error ? error.message : "驗證已失效，請重新輸入");
      setCheckingStorage(false);
    }
  }, [isError, verifiedPhone, error, token]);

  const handleVerify = async () => {
    if (!/^\d{4}$/.test(phone)) {
      setVerifyError("請輸入 4 位數字");
      return;
    }
    setVerifying(true);
    setVerifyError("");
    try {
      await verifyPortalAccess(token, phone);
      sessionStorage.setItem(storageKey(token), phone);
      setVerifiedPhone(phone);
      setCheckingStorage(false);
    } catch (err) {
      setVerifyError(err instanceof Error ? err.message : "驗證失敗");
    } finally {
      setVerifying(false);
    }
  };

  if (checkingStorage || (verifiedPhone && isLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!verifiedPhone || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              <CardTitle>業主專屬入口</CardTitle>
            </div>
            <p className="text-sm text-muted-foreground">請輸入手機末 4 碼以驗證身分</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>手機末 4 碼</Label>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 4))}
                placeholder="0000"
                className="text-center text-lg tracking-widest"
                maxLength={4}
              />
            </div>
            {verifyError && (
              <p className="text-sm text-destructive flex items-center gap-1.5">
                {verifyError.includes("15 分鐘") ? <Lock className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                {verifyError}
              </p>
            )}
            <Button className="w-full" onClick={handleVerify} disabled={verifying || phone.length !== 4}>
              {verifying ? "驗證中..." : "確認"}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <PortalDashboard data={data} />;
}

function PortalDashboard({ data }: { data: PortalData }) {
  const { project, tasks, siteReports, issues, inspections, changeOrders, invoices } = data;

  return (
    <div className="min-h-screen bg-muted/30 p-4 sm:p-6">
      <div className="max-w-3xl mx-auto space-y-4">
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-3">
              <div>
                <CardTitle className="text-xl">{project.name}</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">{project.code} · {project.address}</p>
              </div>
              <Badge variant="secondary">{PROJECT_STATUS_LABELS[project.status] ?? project.status}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-muted-foreground">整體進度</span>
              <span className="font-medium">{project.overallProgressPct}%</span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div className="h-full bg-primary rounded-full" style={{ width: `${project.overallProgressPct}%` }} />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {dateStr(project.startDate)} ～ {dateStr(project.endDate)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">工程進度</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {tasks.length === 0 ? (
              <p className="text-sm text-muted-foreground">尚無工項資料</p>
            ) : tasks.map((t, i) => (
              <div key={i}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{t.name}</span>
                  <span className="text-muted-foreground">{t.progressPct}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-primary/70 rounded-full" style={{ width: `${t.progressPct}%` }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">現場紀錄</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {siteReports.length === 0 ? (
              <p className="text-sm text-muted-foreground">尚無現場紀錄</p>
            ) : siteReports.map((s, i) => (
              <div key={i} className="border-b last:border-0 pb-3 last:pb-0 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                  <span>{dateStr(s.reportDate)}</span>
                  {s.weather && <span>· {s.weather}</span>}
                  <span>· {s.workersCount} 人施工</span>
                </div>
                <p>{s.notes}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">問題追蹤</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {issues.length === 0 ? (
              <p className="text-sm text-muted-foreground">目前沒有待處理問題</p>
            ) : issues.map((iss, i) => (
              <div key={i} className="border-b last:border-0 pb-3 last:pb-0 text-sm space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{iss.title}</span>
                  <Badge variant="outline" className="text-xs">{ISSUE_STATUS_LABELS[iss.status] ?? iss.status}</Badge>
                </div>
                {iss.description && <p className="text-muted-foreground">{iss.description}</p>}
                {iss.resolution && <p className="text-muted-foreground">處理結果：{iss.resolution}</p>}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">驗收記錄</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {inspections.length === 0 ? (
              <p className="text-sm text-muted-foreground">尚無驗收記錄</p>
            ) : inspections.map((insp, i) => (
              <div key={i} className="flex items-center justify-between text-sm border-b last:border-0 pb-2 last:pb-0">
                <span>{dateStr(insp.inspectionDate)}</span>
                <Badge variant="outline" className="text-xs">{INSPECTION_STATUS_LABELS[insp.status] ?? insp.status}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">變更單</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {changeOrders.length === 0 ? (
              <p className="text-sm text-muted-foreground">尚無變更單</p>
            ) : changeOrders.map((co, i) => (
              <div key={i} className="border-b last:border-0 pb-3 last:pb-0 text-sm space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{co.orderNo}</span>
                  <Badge variant="outline" className="text-xs">{CHANGE_ORDER_STATUS_LABELS[co.status] ?? co.status}</Badge>
                </div>
                <p className="text-muted-foreground">{co.reason}</p>
                <p className="font-medium">{currency(co.totalAmount)}</p>
                {co.canSign && co.signToken && (
                  <a href={`/sign?token=${co.signToken}`} className="inline-block">
                    <Button size="sm" variant="outline" className="mt-1">前往簽署</Button>
                  </a>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">應收帳款</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {invoices.length === 0 ? (
              <p className="text-sm text-muted-foreground">尚無帳款資料</p>
            ) : (
              <>
                {invoices.map((inv, i) => (
                  <div key={i} className="flex items-center justify-between text-sm border-b last:border-0 pb-2 last:pb-0">
                    <div>
                      <p>{inv.invoiceNo}</p>
                      <p className="text-xs text-muted-foreground">到期日 {dateStr(inv.dueDate)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{currency(inv.amount)}</p>
                      <Badge variant="outline" className="text-xs">{INVOICE_STATUS_LABELS[inv.status] ?? inv.status}</Badge>
                    </div>
                  </div>
                ))}
                <p className="text-xs text-muted-foreground pt-1">發票下載功能將於交屋報告功能一併提供</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
