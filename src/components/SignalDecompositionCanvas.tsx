import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Layers, Activity, Play, Pause, RefreshCw, ZoomIn } from 'lucide-react';

interface SignalDecompositionCanvasProps {
  scrollProgress?: number;
}

export const SignalDecompositionCanvas: React.FC<SignalDecompositionCanvasProps> = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [splitRatio, setSplitRatio] = useState(0.85); // 0 = unified chaotic signal, 1 = fully decomposed
  const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number; time: string; total: number; trend: number; periodic: number; residual: number } | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<'ALL' | 'RADIAL' | 'ALONG' | 'CROSS' | 'CLOCK'>('ALL');
  const animFrameRef = useRef<number>(0);
  const timeOffsetRef = useRef<number>(0);

  // Generate 145 discrete observation points (7 days, ~1.16 hour resolution)
  const observations = useMemo(() => {
    const pts = [];
    const count = 145;
    for (let i = 0; i < count; i++) {
      const t = i / (count - 1); // 0 to 1
      // Systematic polynomial/orbital secular drift
      const trend = Math.sin(t * 1.5 - 0.2) * 1.8 + Math.pow(t, 2) * 2.2 - 1.2;
      // Periodic harmonic resonance (diurnal + semi-diurnal orbit cycle)
      const periodic = Math.sin(t * Math.PI * 14) * 1.35 + Math.cos(t * Math.PI * 28) * 0.45;
      // High frequency noise / clock flicker
      const pseudoNoise = (Math.sin(i * 997) * 43758.5453) % 1;
      const residual = pseudoNoise * 0.7 - 0.35;
      const total = trend + periodic + residual;

      const day = Math.floor((i / count) * 7) + 1;
      const hour = Math.floor(((i / count) * 7 * 24) % 24);
      const minute = Math.floor((((i / count) * 7 * 24 * 60) % 60));
      const timeStr = `Day 0${day} ${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')} UTC`;

      pts.push({
        index: i,
        t,
        trend,
        periodic,
        residual,
        total,
        timeStr,
      });
    }
    return pts;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = canvas.parentElement?.clientWidth || 900);
    let height = (canvas.height = 480);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = Math.max(420, Math.min(520, window.innerHeight * 0.55));
    };

    window.addEventListener('resize', handleResize);

    const render = () => {
      if (isPlaying) {
        timeOffsetRef.current += 0.003;
      }

      ctx.clearRect(0, 0, width, height);

      // Background grid
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.lineWidth = 1;
      const gridSpacingX = width / 14;
      const gridSpacingY = height / 8;

      for (let x = 0; x <= width; x += gridSpacingX) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y <= height; y += gridSpacingY) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      const paddingX = 60;
      const paddingY = 40;
      const graphWidth = width - paddingX * 2;
      const graphHeight = height - paddingY * 2;

      // Draw subtle Axes
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 1.2;

      // X Axis (Time)
      ctx.beginPath();
      ctx.moveTo(paddingX - 10, height - paddingY);
      ctx.lineTo(width - paddingX + 10, height - paddingY);
      ctx.stroke();

      // Y Axis (Error)
      ctx.beginPath();
      ctx.moveTo(paddingX, paddingY - 10);
      ctx.lineTo(paddingX, height - paddingY + 10);
      ctx.stroke();

      // Axis Labels in IBM Plex Mono style
      ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.font = '11px "IBM Plex Mono", monospace';
      ctx.textAlign = 'right';
      ctx.fillText('ERROR (m) ↑', paddingX + 15, paddingY - 18);
      ctx.textAlign = 'left';
      ctx.fillText('TIME (7 DAYS / 145 EPOCHS) →', width - paddingX - 180, height - paddingY + 28);

      // Day tick marks
      for (let d = 1; d <= 7; d++) {
        const tx = paddingX + ((d - 1) / 6) * graphWidth;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillText(`DAY 0${d}`, tx - 16, height - paddingY + 16);
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.moveTo(tx, height - paddingY - 4);
        ctx.lineTo(tx, height - paddingY + 4);
        ctx.stroke();
      }

      // Dynamic Layer positions based on splitRatio
      // splitRatio = 0: All rendered in one combined center track
      // splitRatio = 1: 3 vertically stacked independent tracks
      const centerY = height / 2;
      const track1CenterY = centerY - (graphHeight * 0.31) * splitRatio; // Systematic Trend
      const track2CenterY = centerY;                                     // Periodic Component
      const track3CenterY = centerY + (graphHeight * 0.31) * splitRatio; // Residual Noise

      const scaleY = (graphHeight * 0.22);

      // Track reference guide lines when separated
      if (splitRatio > 0.15) {
        const alpha = Math.min(1, (splitRatio - 0.15) * 1.5);
        ctx.strokeStyle = `rgba(255, 255, 255, ${0.08 * alpha})`;
        ctx.setLineDash([4, 4]);

        [track1CenterY, track2CenterY, track3CenterY].forEach((ty) => {
          ctx.beginPath();
          ctx.moveTo(paddingX, ty);
          ctx.lineTo(width - paddingX, ty);
          ctx.stroke();
        });
        ctx.setLineDash([]);

        // Layer labels
        ctx.fillStyle = `rgba(111, 242, 192, ${0.9 * alpha})`;
        ctx.font = '10px "IBM Plex Mono", monospace';
        ctx.textAlign = 'left';
        ctx.fillText('LAYER 01: SYSTEMATIC TREND (SECULAR DRIFT)', paddingX + 10, track1CenterY - 24);

        ctx.fillStyle = `rgba(56, 189, 248, ${0.9 * alpha})`;
        ctx.fillText('LAYER 02: PERIODIC COMPONENT (ORBITAL HARMONIC)', paddingX + 10, track2CenterY - 24);

        ctx.fillStyle = `rgba(244, 114, 182, ${0.9 * alpha})`;
        ctx.fillText('LAYER 03: RESIDUAL (HIGH-FREQ FLICKER NOISE)', paddingX + 10, track3CenterY - 24);
      }

      // Compute Point coordinates
      const coords = observations.map((pt, i) => {
        const x = paddingX + pt.t * graphWidth;
        const waveOffset = Math.sin(timeOffsetRef.current + pt.t * 6) * 0.08;

        // When splitRatio is 0, all lines sum to total
        const yTrend = (track1CenterY - (pt.trend + waveOffset) * (scaleY * 0.5));
        const yPeriodic = (track2CenterY - (pt.periodic + waveOffset * 1.5) * (scaleY * 0.45));
        const yResidual = (track3CenterY - (pt.residual) * (scaleY * 0.6));

        const yUnified = centerY - (pt.total + waveOffset) * (scaleY * 0.4);

        return {
          x,
          yUnified,
          yTrend: yUnified * (1 - splitRatio) + yTrend * splitRatio,
          yPeriodic: yUnified * (1 - splitRatio) + yPeriodic * splitRatio,
          yResidual: yUnified * (1 - splitRatio) + yResidual * splitRatio,
          pt,
          index: i,
        };
      });

      // 1. Draw Layer 01: SYSTEMATIC TREND
      ctx.beginPath();
      ctx.strokeStyle = '#6FF2C0'; // Validation Emerald
      ctx.lineWidth = 2.2;
      ctx.shadowColor = 'rgba(111, 242, 192, 0.4)';
      ctx.shadowBlur = 10;
      coords.forEach((c, idx) => {
        if (idx === 0) ctx.moveTo(c.x, c.yTrend);
        else ctx.lineTo(c.x, c.yTrend);
      });
      ctx.stroke();
      ctx.shadowBlur = 0;

      // 2. Draw Layer 02: PERIODIC COMPONENT
      ctx.beginPath();
      ctx.strokeStyle = '#38BDF8'; // Cyan
      ctx.lineWidth = 1.8;
      ctx.shadowColor = 'rgba(56, 189, 248, 0.4)';
      ctx.shadowBlur = 8;
      coords.forEach((c, idx) => {
        if (idx === 0) ctx.moveTo(c.x, c.yPeriodic);
        else ctx.lineTo(c.x, c.yPeriodic);
      });
      ctx.stroke();
      ctx.shadowBlur = 0;

      // 3. Draw Layer 03: RESIDUAL
      ctx.beginPath();
      ctx.strokeStyle = '#F472B6'; // Pink
      ctx.lineWidth = 1.3;
      coords.forEach((c, idx) => {
        if (idx === 0) ctx.moveTo(c.x, c.yResidual);
        else ctx.lineTo(c.x, c.yResidual);
      });
      ctx.stroke();

      // 4. Draw Discrete 145 Telemetry Observation Points
      coords.forEach((c, idx) => {
        // Draw real observation markers
        ctx.fillStyle = idx % 2 === 0 ? '#FFFFFF' : '#6FF2C0';
        ctx.beginPath();
        const activeY = splitRatio > 0.5 ? c.yTrend : c.yUnified;
        ctx.arc(c.x, activeY, 2, 0, Math.PI * 2);
        ctx.fill();

        // Highlighting key 7-day milestone checkpoints
        if (idx % 24 === 0) {
          ctx.strokeStyle = 'rgba(111, 242, 192, 0.8)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(c.x, activeY, 5, 0, Math.PI * 2);
          ctx.stroke();
        }
      });

      // Interactive Scanline / Playhead
      const scanX = paddingX + (((timeOffsetRef.current * 0.4) % 1) * graphWidth);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 2]);
      ctx.beginPath();
      ctx.moveTo(scanX, paddingY);
      ctx.lineTo(scanX, height - paddingY);
      ctx.stroke();
      ctx.setLineDash([]);

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('resize', handleResize);
    };
  }, [isPlaying, splitRatio, observations]);

  // Handle canvas mouse move for interactive telemetry inspection
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const paddingX = 60;
    const graphWidth = canvas.width - paddingX * 2;

    const normalizedX = (mouseX - paddingX) / graphWidth;
    if (normalizedX >= 0 && normalizedX <= 1) {
      const idx = Math.min(observations.length - 1, Math.max(0, Math.round(normalizedX * (observations.length - 1))));
      const pt = observations[idx];
      setHoveredPoint({
        x: mouseX,
        y: e.clientY - rect.top,
        time: pt.timeStr,
        total: Number(pt.total.toFixed(3)),
        trend: Number(pt.trend.toFixed(3)),
        periodic: Number(pt.periodic.toFixed(3)),
        residual: Number(pt.residual.toFixed(3)),
      });
    } else {
      setHoveredPoint(null);
    }
  };

  const handleMouseLeave = () => {
    setHoveredPoint(null);
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* Control Bar */}
      <div className="w-full flex flex-wrap items-center justify-between gap-4 mb-4 px-2 sm:px-4">
        {/* Signal Channel selector */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-white/50 uppercase flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-emerald-400" /> Channel:
          </span>
          {(['ALL', 'RADIAL', 'ALONG', 'CROSS', 'CLOCK'] as const).map((ch) => (
            <button
              key={ch}
              onClick={() => setSelectedChannel(ch)}
              className={`px-2.5 py-1 text-[11px] font-mono rounded transition-all ${selectedChannel === ch
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                  : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border border-transparent'
                }`}
            >
              {ch}
            </button>
          ))}
        </div>

        {/* Signal Decomposition Slider & Controls */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-full border border-white/10 backdrop-blur-sm">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-[11px] font-mono text-white/70">Decompose Signal:</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={splitRatio}
              onChange={(e) => setSplitRatio(parseFloat(e.target.value))}
              className="w-24 sm:w-32 accent-emerald-400 cursor-pointer h-1.5 bg-white/20 rounded-lg"
            />
            <span className="text-[11px] font-mono text-emerald-400 w-8 text-right">
              {Math.round(splitRatio * 100)}%
            </span>
          </div>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            title={isPlaying ? 'Pause telemetry stream' : 'Resume telemetry stream'}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={() => {
              setSplitRatio(splitRatio > 0.5 ? 0 : 1);
            }}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-white/80 text-[11px] font-mono border border-white/10 transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            {splitRatio > 0.5 ? 'Collapse' : 'Split 3-Layers'}
          </button>
        </div>
      </div>

      {/* Canvas Container with Liquid Glass Border */}
      <div className="relative w-full rounded-2xl liquid-glass border border-white/10 overflow-hidden bg-[#040609]/90 shadow-2xl">
        {/* Technical Corner Badges */}
        <div className="absolute top-3 left-4 z-10 flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-mono tracking-wider text-emerald-400/90 uppercase">
              145 DISCRETE REAL OBSERVATIONS
            </span>
          </div>
          <span className="hidden md:inline-block text-[10px] font-mono text-white/30">|</span>
          <span className="hidden md:inline-block text-[10px] font-mono text-white/50">
            SAMPLING: Δt = 70 MIN (1.16H)
          </span>
        </div>

        <div className="absolute top-3 right-4 z-10 hidden sm:flex items-center gap-2 text-[10px] font-mono text-white/40">
          <ZoomIn className="w-3 h-3 text-cyan-400" />
          <span>INTERACTIVE SCATTER TELEMETRY</span>
        </div>

        {/* The Main Canvas */}
        <canvas
          ref={canvasRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="w-full cursor-crosshair block"
        />

        {/* Hover Tooltip Overlay */}
        {hoveredPoint && (
          <div
            className="absolute z-20 pointer-events-none bg-black/90 border border-emerald-500/40 backdrop-blur-md rounded-lg p-3 shadow-2xl font-mono text-xs text-white"
            style={{
              left: Math.min(hoveredPoint.x + 16, (canvasRef.current?.width || 800) - 200),
              top: Math.max(20, Math.min(hoveredPoint.y - 40, (canvasRef.current?.height || 400) - 130)),
            }}
          >
            <div className="text-[10px] text-emerald-400 font-semibold border-b border-white/10 pb-1 mb-1.5 flex justify-between gap-4">
              <span>{hoveredPoint.time}</span>
              <span>EPOCH #{Math.round((hoveredPoint.x / (canvasRef.current?.width || 800)) * 145)}</span>
            </div>
            <div className="space-y-0.5 text-[11px]">
              <div className="flex justify-between gap-4 text-white/80">
                <span>Total Error (Chaotic):</span>
                <span className="text-white font-medium">{hoveredPoint.total > 0 ? `+${hoveredPoint.total}` : hoveredPoint.total} m</span>
              </div>
              <div className="flex justify-between gap-4 text-emerald-300">
                <span>Layer 1 (Trend):</span>
                <span>{hoveredPoint.trend > 0 ? `+${hoveredPoint.trend}` : hoveredPoint.trend} m</span>
              </div>
              <div className="flex justify-between gap-4 text-cyan-300">
                <span>Layer 2 (Periodic):</span>
                <span>{hoveredPoint.periodic > 0 ? `+${hoveredPoint.periodic}` : hoveredPoint.periodic} m</span>
              </div>
              <div className="flex justify-between gap-4 text-pink-300">
                <span>Layer 3 (Residual):</span>
                <span>{hoveredPoint.residual > 0 ? `+${hoveredPoint.residual}` : hoveredPoint.residual} m</span>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Legend */}
        <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-3 border-t border-white/10 bg-black/40 text-[11px] font-mono">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="w-3 h-1 bg-[#6FF2C0] rounded-full shadow-[0_0_8px_#6FF2C0]" />
              <span className="text-white/80">L1: Systematic Trend</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-1 bg-[#38BDF8] rounded-full shadow-[0_0_8px_#38BDF8]" />
              <span className="text-white/80">L2: Periodic Harmonic</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-1 bg-[#F472B6] rounded-full shadow-[0_0_8px_#F472B6]" />
              <span className="text-white/80">L3: Residual Noise</span>
            </div>
          </div>

          <div className="text-white/50 italic text-[11px]">
            &ldquo;EPHEMERIS does not simply predict the error. It isolates what is predictable.&rdquo;
          </div>
        </div>
      </div>
    </div>
  );
};
