"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { getReferralFees, markReferralFeePaid, ReferralFeeDto } from "@/lib/cases";

const currency = (n: number) =>
  n.toLocaleString("zh-TW", { style: "currency", currency: "TWD", maximumFractionDigits: 0 });

export default function ReferralFeesPage() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<"all" | "unpaid">("all");

  const { data, isLoading } = useQuery({
    queryKey: ["referral-fees", filter],
    queryFn: () => getReferralFees(filter === "unpaid"),
  });

  const markPaidMutation = useMutation({
    mutationFn: (caseId: string) => markReferralFeePaid(caseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["referral-fees"] });
      toast.success("已標記為已付款");
    },
    onError: () => toast.error("操作失敗"),
  });

  const totalUnpaid = data
    ?.filter((r) => !r.referralFeePaid && r.feeAmount != null)
    .reduce((s, r) => s + (r.feeAmount ?? 0), 0) ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">介紹費管理</h1>
          <p className="text-sm text-muted-foreground mt-1">依成交金額自動計算介紹費，追蹤付款狀態</p>
        </div>
        <Select value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部</SelectItem>
            <SelectItem value="unpaid">僅未付款</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            介紹費列表
            {data && (
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                共 {data.length} 筆 · 未付總額 {currency(totalUnpaid)}
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
          ) : !data?.length ? (
            <p className="text-center text-sm text-muted-foreground py-8">目前沒有介紹案件資料</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground">
                    <th className="text-left py-2 px-3">介紹人</th>
                    <th className="text-left py-2 px-3">客戶</th>
                    <th className="text-right py-2 px-3">介紹費率</th>
                    <th className="text-right py-2 px-3">成交金額</th>
                    <th className="text-right py-2 px-3">應付介紹費</th>
                    <th className="text-left py-2 px-3">狀態</th>
                    <th className="py-2 px-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((r: ReferralFeeDto) => (
                    <tr key={r.caseId} className="border-b last:border-0 hover:bg-muted/40">
                      <td className="py-2.5 px-3 font-medium">{r.referrerName}</td>
                      <td className="py-2.5 px-3 text-muted-foreground">{r.clientName}</td>
                      <td className="py-2.5 px-3 text-right">{r.referralFeePercent}%</td>
                      <td className="py-2.5 px-3 text-right">
                        {r.contractAmount != null ? currency(r.contractAmount) : (
                          <span className="text-muted-foreground">尚未成交</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right font-medium">
                        {r.feeAmount != null ? currency(r.feeAmount) : "—"}
                      </td>
                      <td className="py-2.5 px-3">
                        {r.feeAmount == null ? (
                          <Badge variant="outline" className="text-xs">未成交</Badge>
                        ) : r.referralFeePaid ? (
                          <Badge className="bg-green-100 text-green-800 border-0 text-xs">已付款</Badge>
                        ) : (
                          <Badge className="bg-yellow-100 text-yellow-800 border-0 text-xs">未付款</Badge>
                        )}
                      </td>
                      <td className="py-2.5 px-3">
                        {r.feeAmount != null && !r.referralFeePaid && (
                          <Button
                            size="sm" variant="outline"
                            onClick={() => markPaidMutation.mutate(r.caseId)}
                            disabled={markPaidMutation.isPending}
                          >
                            <Check className="mr-1 h-3 w-3" />標記已付
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
    </div>
  );
}
