"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Kanban, FileText, HardHat, FileDiff } from "lucide-react";

const stats = [
  { title: "進行中案件", value: "—", icon: Kanban, desc: "洽談中 + 設計確認中" },
  { title: "本月報價", value: "—", icon: FileText, desc: "待確認報價單" },
  { title: "施工中工程", value: "—", icon: HardHat, desc: "施工中 + 驗收中" },
  { title: "待簽認變更單", value: "—", icon: FileDiff, desc: "待屋主確認" },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">儀表板</h1>
        <p className="text-muted-foreground text-sm mt-1">歡迎使用 DecoERP 裝潢設計管理系統</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{stat.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">近期案件</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">連結後端後顯示最新案件資料</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">工程進度摘要</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">連結後端後顯示施工進度</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
