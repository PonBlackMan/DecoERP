"use client";
import { Suspense, useRef, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, AlertCircle, Loader2, Eraser } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getSigningInfo, submitSignature, SigningInfo } from "@/lib/change-orders";

type PageState = "loading" | "verify" | "sign" | "submitting" | "success" | "error" | "expired" | "already-signed";

const ENTITY_LABELS = {
  Quote: { title: "報價單客戶確認", badge: "報價單", subjectLabel: "客戶", descLabel: "說明" },
  ChangeOrder: { title: "變更單客戶簽認", badge: "變更單", subjectLabel: "工程", descLabel: "變更原因" },
} as const;

function getCanvasPos(e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  if ("touches" in e) {
    const t = e.touches[0];
    return { x: (t.clientX - rect.left) * scaleX, y: (t.clientY - rect.top) * scaleY };
  }
  return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
}

export default function SignPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <SignContent />
    </Suspense>
  );
}

function SignContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [pageState, setPageState] = useState<PageState>("verify");
  const [errorMsg, setErrorMsg] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const hasSignature = useRef(false);

  const {
    data: info,
    isLoading,
    isError,
  } = useQuery<SigningInfo>({
    queryKey: ["signing-info", token],
    queryFn: () => getSigningInfo(token),
    enabled: !!token,
    retry: false,
  });

  const invalidToken = !token;
  const resolvedError = invalidToken || isError
    ? (errorMsg || (invalidToken ? "無效的連結" : "連結不存在或已失效"))
    : "";
  const isExpired = !!info && new Date(info.expiresAt) < new Date();
  const isAlreadySigned = !!info?.alreadySigned;

  const startDraw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    isDrawing.current = true;
    hasSignature.current = true;
    const ctx = canvas.getContext("2d")!;
    const pos = getCanvasPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  }, []);

  const draw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!isDrawing.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const pos = getCanvasPos(e, canvas);
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#1a1a1a";
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  }, []);

  const stopDraw = useCallback(() => { isDrawing.current = false; }, []);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.getContext("2d")!.clearRect(0, 0, canvas.width, canvas.height);
    hasSignature.current = false;
  };

  const handleVerify = () => {
    if (phone.length !== 4 || !/^\d{4}$/.test(phone)) {
      setPhoneError("請輸入 4 位數字");
      return;
    }
    setPhoneError("");
    setPageState("sign");
  };

  const handleSubmit = async () => {
    if (!hasSignature.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    setPageState("submitting");
    try {
      await submitSignature(token, phone, canvas.toDataURL("image/png"));
      setPageState("success");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "簽認失敗";
      if (msg.includes("末四碼")) { setPageState("verify"); setPhoneError(msg); }
      else { setPageState("error"); setErrorMsg(msg); }
    }
  };

  const labels = info ? ENTITY_LABELS[info.entityType] : ENTITY_LABELS.ChangeOrder;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-start py-8 px-4">
      <div className="w-full max-w-lg">
        <div className="mb-6 text-center">
          <h1 className="text-xl font-bold tracking-tight">
            <span className="text-primary">Deco</span>ERP
          </h1>
          <p className="text-sm text-muted-foreground mt-1">{labels.title}</p>
        </div>

        {isLoading && (
          <div className="flex flex-col items-center gap-3 py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">載入中...</p>
          </div>
        )}

        {!isLoading && resolvedError && (
          <div className="rounded-xl border bg-card p-8 text-center space-y-3">
            <AlertCircle className="h-10 w-10 text-destructive mx-auto" />
            <h2 className="font-semibold text-lg">連結無效</h2>
            <p className="text-sm text-muted-foreground">{resolvedError}</p>
          </div>
        )}

        {!isLoading && !resolvedError && isExpired && (
          <div className="rounded-xl border bg-card p-8 text-center space-y-3">
            <AlertCircle className="h-10 w-10 text-amber-500 mx-auto" />
            <h2 className="font-semibold text-lg">連結已過期</h2>
            <p className="text-sm text-muted-foreground">此簽認連結已超過有效期限，請聯繫負責工程人員重新發送。</p>
          </div>
        )}

        {!isLoading && !resolvedError && !isExpired && isAlreadySigned && (
          <div className="rounded-xl border bg-card p-8 text-center space-y-3">
            <CheckCircle2 className="h-10 w-10 text-green-600 mx-auto" />
            <h2 className="font-semibold text-lg">已完成簽認</h2>
            <p className="text-sm text-muted-foreground">此{labels.badge}已完成客戶簽認，無需再次操作。</p>
          </div>
        )}

        {!isLoading && !resolvedError && !isExpired && !isAlreadySigned && pageState === "success" && (
          <div className="rounded-xl border bg-card p-8 text-center space-y-3">
            <CheckCircle2 className="h-10 w-10 text-green-600 mx-auto" />
            <h2 className="font-semibold text-lg">簽認完成</h2>
            <p className="text-sm text-muted-foreground">感謝您的確認！您的手寫簽名已記錄，工程人員將持續為您服務。</p>
          </div>
        )}

        {!isLoading && !resolvedError && !isExpired && !isAlreadySigned && pageState === "verify" && info && (
          <div className="space-y-4">
            <div className="rounded-xl border bg-card p-5 space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">{labels.badge}號</p>
                  <p className="font-mono font-semibold">{info.refNo}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">金額</p>
                  <p className="font-semibold text-lg">{Number(info.totalAmount).toLocaleString("zh-TW")} 元</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{labels.subjectLabel}</p>
                <p className="text-sm">{info.subjectName}</p>
              </div>
              {info.description && (
                <div>
                  <p className="text-xs text-muted-foreground">{labels.descLabel}</p>
                  <p className="text-sm">{info.description}</p>
                </div>
              )}
              {info.items.length > 0 && (
                <div className="border-t pt-3 space-y-1">
                  <p className="text-xs text-muted-foreground mb-2">明細</p>
                  {info.items.map((item, i) => (
                    <div key={i} className="flex justify-between text-sm gap-2">
                      <span className="flex-1 min-w-0 truncate">{item.name}</span>
                      <span className="text-muted-foreground shrink-0">
                        {item.qty} × {Number(item.unitPrice).toLocaleString("zh-TW")} = {Number(item.amount).toLocaleString("zh-TW")} 元
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-xl border bg-card p-5 space-y-4">
              <div>
                <h2 className="font-semibold">身份確認</h2>
                <p className="text-sm text-muted-foreground mt-1">請輸入您的聯絡電話末四碼以繼續</p>
              </div>
              <div className="space-y-2">
                <Label>電話末四碼</Label>
                <Input
                  type="tel"
                  inputMode="numeric"
                  maxLength={4}
                  value={phone}
                  onChange={(e) => { setPhone(e.target.value.replace(/\D/g, "").slice(0, 4)); setPhoneError(""); }}
                  placeholder="例：5678"
                  className="text-center text-lg tracking-widest font-mono"
                />
                {phoneError && <p className="text-sm text-destructive">{phoneError}</p>}
              </div>
              <Button className="w-full" onClick={handleVerify} disabled={phone.length !== 4}>
                確認身份，前往簽名
              </Button>
            </div>
          </div>
        )}

        {!isLoading && !resolvedError && !isExpired && !isAlreadySigned && (pageState === "sign" || pageState === "submitting") && info && (
          <div className="space-y-4">
            <div className="rounded-xl border bg-card p-4 flex justify-between items-center">
              <div>
                <p className="font-mono font-semibold text-sm">{info.refNo}</p>
                <p className="text-xs text-muted-foreground">{info.subjectName}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold">{Number(info.totalAmount).toLocaleString("zh-TW")} 元</p>
                <p className="text-xs text-muted-foreground">金額</p>
              </div>
            </div>

            <div className="rounded-xl border bg-card p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-semibold">手寫簽名</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">請在下方框內親筆簽名</p>
                </div>
                <Button variant="ghost" size="sm" onClick={clearCanvas} className="gap-1 text-xs">
                  <Eraser className="h-3.5 w-3.5" />重簽
                </Button>
              </div>
              <div className="relative rounded-lg border-2 border-dashed border-border bg-white overflow-hidden">
                <canvas
                  ref={canvasRef}
                  width={640}
                  height={240}
                  className="w-full touch-none cursor-crosshair"
                  style={{ height: "180px" }}
                  onMouseDown={startDraw}
                  onMouseMove={draw}
                  onMouseUp={stopDraw}
                  onMouseLeave={stopDraw}
                  onTouchStart={startDraw}
                  onTouchMove={draw}
                  onTouchEnd={stopDraw}
                />
                <p className="absolute inset-0 flex items-center justify-center text-muted-foreground/30 text-sm pointer-events-none select-none">
                  在此簽名
                </p>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                簽名即表示您確認上述{labels.badge}內容無誤並同意執行
              </p>
            </div>

            <Button
              className="w-full"
              size="lg"
              onClick={handleSubmit}
              disabled={pageState === "submitting"}
            >
              {pageState === "submitting"
                ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />送出簽認中...</>
                : "確認並送出簽名"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
