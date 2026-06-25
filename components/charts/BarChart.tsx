"use client";

import { useEffect, useRef } from "react";

interface BarChartProps {
  labels: string[];
  values: number[];
  color?: string;
  height?: number;
  suffix?: string;
}

export default function BarChart({
  labels,
  values,
  color = "#c1e930",
  height = 220,
  suffix = "",
}: BarChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // HiDPI support
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = rect.height;
    const padding = { top: 20, right: 16, bottom: 40, left: 60 };
    const chartW = w - padding.left - padding.right;
    const chartH = h - padding.top - padding.bottom;

    // Clear
    ctx.clearRect(0, 0, w, h);

    if (values.length === 0) {
      ctx.fillStyle = "#5a5855";
      ctx.font = "13px system-ui";
      ctx.textAlign = "center";
      ctx.fillText("No data available", w / 2, h / 2);
      return;
    }

    const maxVal = Math.max(...values, 1);
    const barWidth = Math.min(chartW / values.length * 0.6, 40);
    const gap = chartW / values.length;

    // Grid lines
    const gridLines = 5;
    ctx.strokeStyle = "#2a2a30";
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    for (let i = 0; i <= gridLines; i++) {
      const y = padding.top + (chartH / gridLines) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(w - padding.right, y);
      ctx.stroke();

      // Y-axis labels
      const val = maxVal - (maxVal / gridLines) * i;
      ctx.fillStyle = "#5a5855";
      ctx.font = "10px system-ui";
      ctx.textAlign = "right";
      ctx.fillText(formatNumber(val) + suffix, padding.left - 8, y + 3);
    }
    ctx.setLineDash([]);

    // Bars with rounded top
    values.forEach((val, i) => {
      const barH = (val / maxVal) * chartH;
      const x = padding.left + gap * i + (gap - barWidth) / 2;
      const y = padding.top + chartH - barH;
      const radius = Math.min(barWidth / 2, 6);

      // Gradient bar
      const gradient = ctx.createLinearGradient(x, y, x, y + barH);
      gradient.addColorStop(0, color);
      gradient.addColorStop(1, hexToRgba(color, 0.3));

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.lineTo(x + barWidth - radius, y);
      ctx.arcTo(x + barWidth, y, x + barWidth, y + radius, radius);
      ctx.lineTo(x + barWidth, y + barH);
      ctx.lineTo(x, y + barH);
      ctx.lineTo(x, y + radius);
      ctx.arcTo(x, y, x + radius, y, radius);
      ctx.closePath();
      ctx.fill();

      // Glow effect
      ctx.shadowColor = hexToRgba(color, 0.2);
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.shadowBlur = 0;

      // X-axis labels
      ctx.fillStyle = "#9a9690";
      ctx.font = "10px system-ui";
      ctx.textAlign = "center";
      ctx.fillText(labels[i] || "", x + barWidth / 2, h - padding.bottom + 16);
    });
  }, [labels, values, color, height, suffix]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: "100%", height: `${height}px` }}
      className="block"
    />
  );
}

function formatNumber(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return Math.round(n).toString();
}

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
