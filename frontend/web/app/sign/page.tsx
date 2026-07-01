"use client";
import { Suspense, useEffect, useRef, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, AlertCircle, Loader2, Eraser } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getSigningInfo, submitSignature, ChangeOrderSigningInfo } from "@/lib/change-orders";

type PageState = "loading" | "verify" | "sign" | "submitting" | "success" | "error" | "expired" | "already-signed";

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

function SignContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [pageState, setPageState] = useState<PageState>("loading");
  const [orderInfo, setOrderInfo] = useState<ChangeOrderSigningInfo | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const hasSignature = useRef(false);

  useEffect(() => {
    if (!token) { setPageState("error"); setErrorMsg("無效的連結"); return; }

    getSigningInfo(token)
      .then((info) => {
        setOrderInfo(info);
        if (info.alreadySigned) { setPageState("already-signed"); return; }
        if (new Date(info.expiresAt) < new Date()) { setPageState("expired"); return; }
        setPageState("verify");
      })
      .catch(() => { setPageState("error"); setErrorMsg("連結不存在或已失效"); });
  }, [token]);

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

  const stopDraw = useCallback(() => {
    isDrawing.current = false;
  }, []);

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
    const signatureData = canvas.toDataURL("image/png");
    setPageState("submitting");
    try {
      await submitSignature(token, phone, signatureData);
      setPageState("success");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "簽認失敗";
      if (msg.includes("末四碼")) {
        setPageState("verify");
        setPhoneError(msg);
      } else {
        setPageState("error");
        setErrorMsg(msg);
      }
    }
  };

  // ── Layout shell ──────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-start py-8 px-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="mb-6 text-center">
          <h1 className="text-xl font-bold tracking-tight">
            <span className="text-primary">Deco</span>ERP
          </h1>
          <p className="text-sm text-muted-foreground mt-1">變更單客戶簽認</p>
        </div>

        {/* Loading */}
        {pageState === "loading" && (
          <div className="flex flex-col items-center gap-3 py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">載入中...</p>
          </div>
        )}

        {/* Error */}
        {(pageState === "error") && (
          <div className="rounded-xl border bg-card p-8 text-center space-y-3">
            <AlertCircle className="h-10 w-10 text-destructive mx-auto" />
            <h2 className="font-semibold text-lg">連結無效</h2>
            <p className="text-sm text-muted-foreground">{errorMsg}</p>
          </div>
        )}

        {/* Expired */}
        {pageState === "expired" && (
          <div className="rounded-xl border bg-card p-8 text-center space-y-3">
            <AlertCircle className="h-10 w-10 text-amber-500 mx-auto" />
            <h2 className="font-semibold text-lg">連結已過期</h2>
            <p className="text-sm text-muted-foreground">此簽認連結已超過有效期限，請聯繫負責工程人員重新發送。</p>
          </div>
        )}

        {/* Already signed */}
        {pageState === "already-signed" && (
          <div className="rounded-xl border bg-card p-8 text-center space-y-3">
            <CheckCircle2 className="h-10 w-10 text-green-600 mx-auto" />
            <h2 className="font-semibold text-lg">已完成簽認</h2>
            <p className="text-sm text-muted-foreground">此變更單已完成客戶簽認，無需再次操作。</p>
          </div>
        )}

        {/* Success */}
        {pageState === "success" && (
          <div className="rounded-xl border bg-card p-8 text-center space-y-3">
            <CheckCircle2 className="h-10 w-10 text-green-600 mx-auto" />
            <h2 className="font-semibold text-lg">簽認完成</h2>
            <p className="text-sm text-muted-foreground">感謝您的確認！您的手寫簽名已記錄，工程人員將持續為您服務。</p>
          </div>
        )}

        {/* Phone verify step */}
        {(pageState === "verify") && orderInfo && (
          <div className="space-y-4">
            {/* Order summary */}
            <div className="rounded-xl border bg-card p-5 space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">變更單號</p>
                  <p className="font-mono font-semibold">{orderInfo.orderNo}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">變更金額</p>
                  <p className="font-semibold text-lg">
                    {Number(orderInfo.totalAmount).toLocaleString("zh-TW")} 元
                  </p>
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">工程</p>
                <p className="text-sm">{orderInfo.projectName}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">變更原因</p>
                <p className="text-sm">{orderInfo.reason}</p>
              </div>
              {orderInfo.items.length > 0 && (
                <div className="border-t pt-3 space-y-1">
                  <p className="text-xs text-muted-foreground mb-2">變更明細</p>
                  {orderInfo.items.map((item, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span>{item.itemName}</span>
                      <span className="text-muted-foreground">
                        {item.qty} × {Number(item.unitPrice).toLocaleString("zh-TW")} = {Number(item.amount).toLocaleString("zh-TW")} 元
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Phone verification */}
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

        {/* Signature step */}
        {(pageState === "sign" || pageState === "submitting") && orderInfo && (
          <div className="space-y-4">
            {/* Order mini-summary */}
            <div className="rounded-xl border bg-card p-4 flex justify-between items-center">
              <div>
                <p className="font-mono font-semibold text-sm">{orderInfo.orderNo}</p>
                <p className="text-xs text-muted-foreground">{orderInfo.projectName}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold">{Number(orderInfo.totalAmount).toLocaleString("zh-TW")} 元</p>
                <p className="text-xs text-muted-foreground">變更金額</p>
              </div>
            </div>

            {/* Canvas */}
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
                簽名即表示您確認上述變更內容無誤並同意執行
              </p>
            </div>

            <Button
              className="w-full"
              size="lg"
              onClick={handleSubmit}
              disabled={pageState === "submitting"}
            >
              {pageState === "submitting" ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />送出簽認中...</>
              ) : "確認並送出簽名"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
