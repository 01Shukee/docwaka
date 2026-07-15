// src/components/documents/SignaturePad.tsx

"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { IconPencil, IconRotate2, IconTypography } from "@tabler/icons-react";
import Modal, { ModalFooter } from "@/components/ui/Modal";
import Button from "@/components/ui/Button";

type Mode = "draw" | "type";

interface SignaturePadProps {
  open:       boolean;
  onClose:    () => void;
  onConfirm:  (dataUrl: string) => void;
  signerName: string;
  loading?:   boolean;
}

const CANVAS_WIDTH  = 520;
const CANVAS_HEIGHT = 180;

/**
 * FSD §4.5 — Signature capture:
 *   - Draw mode: freehand canvas drawing, touch + mouse supported
 *   - Type mode: renders signerName in a cursive-style font on a canvas
 *   - Exports base64 PNG data URL sent to POST /api/documents/[id]/sign
 *
 * DESIGN.md: white modal, tertiary border tabs, primary CTA pill.
 */
export default function SignaturePad({
  open,
  onClose,
  onConfirm,
  signerName,
  loading = false,
}: SignaturePadProps) {
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const [mode, setMode]       = useState<Mode>("draw");
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasContent, setHasContent] = useState(false);
  const [typedName, setTypedName]   = useState(signerName);
  const lastPos = useRef<{ x: number; y: number } | null>(null);

  // ── Canvas helpers ────────────────────────────────────────────────────────

  const getCtx = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.strokeStyle = "#141414";
    ctx.lineWidth   = 2;
    ctx.lineCap     = "round";
    ctx.lineJoin    = "round";
    return ctx;
  }, []);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx    = getCtx();
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasContent(false);
  }, [getCtx]);

  // ── Render typed signature ────────────────────────────────────────────────

  const renderTyped = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx    = getCtx();
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font      = `italic 48px Georgia, "Times New Roman", serif`;
    ctx.fillStyle = "#141414";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(typedName, canvas.width / 2, canvas.height / 2);
    setHasContent(typedName.trim().length > 0);
  }, [getCtx, typedName]);

  useEffect(() => {
    if (mode === "type") renderTyped();
  }, [mode, typedName, renderTyped]);

  useEffect(() => {
    if (open) {
      clearCanvas();
      setMode("draw");
      setTypedName(signerName);
    }
  }, [open, clearCanvas, signerName]);

  // ── Mouse events ──────────────────────────────────────────────────────────

  const getPos = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width  / rect.width;
    const scaleY = canvas.height / rect.height;

    if ("touches" in e) {
      const touch = e.touches[0];
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top)  * scaleY,
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top)  * scaleY,
    };
  };

  const startDraw = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    if (mode !== "draw") return;
    e.preventDefault();
    const pos = getPos(e);
    if (!pos) return;
    setIsDrawing(true);
    lastPos.current = pos;
  };

  const draw = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    if (!isDrawing || mode !== "draw") return;
    e.preventDefault();
    const ctx = getCtx();
    const pos = getPos(e);
    if (!ctx || !pos || !lastPos.current) return;

    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();

    lastPos.current = pos;
    setHasContent(true);
  };

  const stopDraw = () => {
    setIsDrawing(false);
    lastPos.current = null;
  };

  // ── Export ────────────────────────────────────────────────────────────────

  const handleConfirm = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png");
    onConfirm(dataUrl);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add Signature"
      size="xl"
    >
      {/* Mode tabs */}
      <div className="flex gap-1 p-1 bg-surface rounded-full mb-5 w-fit">
        {(["draw", "type"] as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => {
              setMode(m);
              clearCanvas();
            }}
            className={[
              "flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[13px] font-medium transition-colors duration-100",
              mode === m
                ? "bg-neutral border border-tertiary text-on-surface shadow-sm"
                : "text-secondary hover:text-on-surface",
            ].join(" ")}
          >
            {m === "draw" ? <IconPencil stroke={1.5} size={13} /> : <IconTypography stroke={1.5} size={13} />}
            {m === "draw" ? "Draw" : "Type"}
          </button>
        ))}
      </div>

      {/* Canvas area */}
      <div className="relative border border-tertiary rounded-md overflow-hidden bg-neutral">
        {/* Baseline guide */}
        <div
          className="absolute inset-x-0 pointer-events-none"
          style={{ top: "60%", borderTop: "1px dashed #E5E7EB" }}
        />

        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="w-full touch-none"
          style={{ cursor: mode === "draw" ? "crosshair" : "default" }}
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={stopDraw}
          onMouseLeave={stopDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={stopDraw}
        />

        {/* Empty hint */}
        {!hasContent && mode === "draw" && (
          <p className="absolute inset-0 flex items-center justify-center text-[13px] text-secondary pointer-events-none select-none">
            Draw your signature here
          </p>
        )}
      </div>

      {/* Type input — only in type mode */}
      {mode === "type" && (
        <div className="mt-3">
          <input
            type="text"
            value={typedName}
            onChange={(e) => setTypedName(e.target.value)}
            placeholder="Enter your full name"
            className="w-full h-[40px] px-4 bg-surface border border-tertiary rounded-full text-[16px] outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
          />
        </div>
      )}

      {/* Clear button */}
      <div className="mt-3 flex justify-end">
        <button
          onClick={() => {
            clearCanvas();
            if (mode === "type") setTypedName(signerName);
          }}
          className="inline-flex items-center gap-1.5 text-[13px] text-secondary hover:text-on-surface transition-colors"
        >
          <IconRotate2 stroke={1.5} size={13} />
          Clear
        </button>
      </div>

      <ModalFooter>
        <Button variant="secondary" size="md" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          variant="primary"
          size="md"
          onClick={handleConfirm}
          disabled={!hasContent}
          loading={loading}
        >
          Confirm Signature
        </Button>
      </ModalFooter>
    </Modal>
  );
}