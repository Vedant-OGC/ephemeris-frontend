import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Compass, Activity, Eye, ShieldCheck, ShieldAlert } from 'lucide-react';

export const ForecastHorizonCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [activeChannel, setActiveChannel] = useState<'RADIAL' | 'ALONG' | 'CROSS' | 'CLOCK'>('RADIAL');
  const [showConfidenceBands, setShowConfidenceBands] = useState(true);
  const [hoveredX, setHoveredX] = useState<number | null>(null);
  const animFrameRef = useRef<number>(0);
  const pulseRef = useRef<number>(0);

  // Generate continuous timeline: 145 observed points + 21 forecast points (24h horizon)
  const data = useMemo(() => {
    const totalPoints = 170;
    const splitIndex = 145; // Real observed ends here
    const pts = [];

    for (let i = 0; i < totalPoints; i++) {
      const isObserved = i < splitIndex;
      const t = i / totalPoints;

      // Systematic drift + periodic curve
      const trend = Math.sin(t * 4.2) * 35 + (t * t) * 20 - 15;
      const periodic = Math.sin(t * Math.PI * 18) * 18 + Math.cos(t * Math.PI * 36) * 6;
      const noise = isObserved ? (Math.sin(i * 491) % 1) * 6 - 3 : 0;

      // Ground truth / forecast prediction
      const forecastDrift = isObserved ? 0 : Math.sin((i - splitIndex) * 0.15) * 4;
      const val = trend + periodic + noise + forecastDrift;

      // Confidence uncertainty expansion after boundary
      const uncertainty = isObserved ? 0 : Math.sqrt(i - splitIndex + 1) * 3.8;

      pts.push({
        index: i,
        t,
        isObserved,
        val,
        uncertainty,
      });
    }

    return { pts, splitIndex, totalPoints };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = canvas.parentElement?.clientWidth || 800);
    let height = (canvas.height = 380);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = 380;
    };
    window.addEventListener('resize', handleResize);

    const render = () => {
      pulseRef.current += 0.02;

      ctx.clearRect(0, 0, width, height);

      const paddingLeft = 60;
      const paddingRight = 40;
      const paddingTop = 50;
      const paddingBottom = 45;
      const graphWidth = width - paddingLeft - paddingRight;
      const graphHeight = height - paddingTop - paddingBottom;
      const centerY = height / 2;

      const splitX = paddingLeft + (data.splitIndex / data.totalPoints) * graphWidth;

      // Draw background shading for Observed vs Forecast
      // Observed Region background
      ctx.fillStyle = 'rgba(255, 255, 255, 0.015)';
      ctx.fillRect(paddingLeft, paddingTop, splitX - paddingLeft, graphHeight);

      // Forecast Region background (Hatched/Tinted)
      ctx.fillStyle = 'rgba(111, 242, 192, 0.035)';
      ctx.fillRect(splitX, paddingTop, width - paddingRight - splitX, graphHeight);

      // Technical Grid
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.lineWidth = 1;
      for (let x = paddingLeft; x <= width - paddingRight; x += graphWidth / 10) {
        ctx.beginPath();
        ctx.moveTo(x, paddingTop);
        ctx.lineTo(x, height - paddingBottom);
        ctx.stroke();
      }

      // Confidence Uncertainty Band (Forecast area only)
      if (showConfidenceBands) {
        // 2-Sigma band (95% CI)
        ctx.beginPath();
        ctx.fillStyle = 'rgba(111, 242, 192, 0.08)';
        for (let i = data.splitIndex; i < data.pts.length; i++) {
          const pt = data.pts[i];
          const x = paddingLeft + pt.t * graphWidth;
          const y = centerY - pt.val - pt.uncertainty * 2;
          if (i === data.splitIndex) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        for (let i = data.pts.length - 1; i >= data.splitIndex; i--) {
          const pt = data.pts[i];
          const x = paddingLeft + pt.t * graphWidth;
          const y = centerY - pt.val + pt.uncertainty * 2;
          ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();

        // 1-Sigma band (68% CI)
        ctx.beginPath();
        ctx.fillStyle = 'rgba(111, 242, 192, 0.14)';
        for (let i = data.splitIndex; i < data.pts.length; i++) {
          const pt = data.pts[i];
          const x = paddingLeft + pt.t * graphWidth;
          const y = centerY - pt.val - pt.uncertainty;
          if (i === data.splitIndex) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        for (let i = data.pts.length - 1; i >= data.splitIndex; i--) {
          const pt = data.pts[i];
          const x = paddingLeft + pt.t * graphWidth;
          const y = centerY - pt.val + pt.uncertainty;
          ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
      }

      // 1. Draw Observed Trajectory (Real Telemetry)
      ctx.beginPath();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2.4;
      ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';
      ctx.shadowBlur = 8;
      for (let i = 0; i <= data.splitIndex; i++) {
        const pt = data.pts[i];
        const x = paddingLeft + pt.t * graphWidth;
        const y = centerY - pt.val;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      // 2. Draw Predicted Trajectory (EPHEMERIS Forecast Continuation)
      ctx.beginPath();
      ctx.strokeStyle = '#6FF2C0'; // Validation Green
      ctx.lineWidth = 2.4;
      ctx.setLineDash([5, 3]);
      ctx.shadowColor = 'rgba(111, 242, 192, 0.7)';
      ctx.shadowBlur = 10;
      for (let i = data.splitIndex; i < data.pts.length; i++) {
        const pt = data.pts[i];
        const x = paddingLeft + pt.t * graphWidth;
        const y = centerY - pt.val;
        if (i === data.splitIndex) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.shadowBlur = 0;

      // Draw Observation Points
      for (let i = 0; i < data.pts.length; i += 2) {
        const pt = data.pts[i];
        const x = paddingLeft + pt.t * graphWidth;
        const y = centerY - pt.val;
        ctx.fillStyle = pt.isObserved ? '#FFFFFF' : '#6FF2C0';
        ctx.beginPath();
        ctx.arc(x, y, pt.isObserved ? 2 : 2.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // 3. Draw Vertical Boundary Line: OBSERVED | FORECAST
      ctx.beginPath();
      ctx.strokeStyle = '#6FF2C0';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([3, 3]);
      ctx.moveTo(splitX, paddingTop - 10);
      ctx.lineTo(splitX, height - paddingBottom + 10);
      ctx.stroke();
      ctx.setLineDash([]);

      // Boundary Pulse Node
      const splitPt = data.pts[data.splitIndex];
      const splitNodeY = centerY - splitPt.val;
      ctx.fillStyle = '#6FF2C0';
      ctx.beginPath();
      ctx.arc(splitX, splitNodeY, 4 + Math.sin(pulseRef.current * 3) * 1.5, 0, Math.PI * 2);
      ctx.fill();

      // Top Labels: OBSERVED vs FORECAST
      ctx.font = 'bold 11px "IBM Plex Mono", monospace';
      ctx.textAlign = 'right';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.fillText('OBSERVED (7 DAYS / 145 EPOCHS)', splitX - 15, paddingTop - 16);

      ctx.textAlign = 'left';
      ctx.fillStyle = '#6FF2C0';
      ctx.fillText('24 H FORECAST HORIZON', splitX + 15, paddingTop - 16);

      // Boundary Marker Text
      ctx.fillStyle = '#6FF2C0';
      ctx.textAlign = 'center';
      ctx.font = '10px "IBM Plex Mono", monospace';
      ctx.fillText('↑ EPHEMERIS INFERENCE HORIZON', splitX, height - paddingBottom + 24);

      // Interactive Hover line
      if (hoveredX !== null && hoveredX >= paddingLeft && hoveredX <= width - paddingRight) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 2]);
        ctx.beginPath();
        ctx.moveTo(hoveredX, paddingTop);
        ctx.lineTo(hoveredX, height - paddingBottom);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('resize', handleResize);
    };
  }, [data, showConfidenceBands, hoveredX]);

  return (
    <div className="w-full flex flex-col items-center">
      {/* Header Bar */}
      <div className="w-full flex flex-wrap items-center justify-between gap-4 mb-3 px-2">
        <div className="flex items-center gap-3">
          <div className="text-xs font-mono text-emerald-400 font-bold tracking-widest uppercase flex items-center gap-2">
            <Compass className="w-4 h-4 text-emerald-400" />
            <span>24 H FORECAST HORIZON</span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/40 border border-emerald-500/30 text-emerald-300">
            CONTINUOUS INFERENCE
          </span>
        </div>

        {/* Confidence Band Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowConfidenceBands(!showConfidenceBands)}
            className={`px-3 py-1 text-[11px] font-mono rounded-full border transition-all flex items-center gap-1.5 ${showConfidenceBands
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'bg-white/5 text-white/50 border-white/10'
              }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>±1σ/±2σ Uncertainty Bands</span>
          </button>
        </div>
      </div>

      {/* Canvas Box */}
      <div className="relative w-full rounded-2xl liquid-glass border border-white/10 overflow-hidden bg-[#030508]/95 shadow-2xl">
        <canvas
          ref={canvasRef}
          onMouseMove={(e) => {
            const rect = canvasRef.current?.getBoundingClientRect();
            if (rect) setHoveredX(e.clientX - rect.left);
          }}
          onMouseLeave={() => setHoveredX(null)}
          className="w-full h-[380px] block cursor-crosshair"
        />

        {/* Technical Split Banner at Top */}
        <div className="absolute top-3 left-4 right-4 flex items-center justify-between pointer-events-none text-[10px] font-mono">
          <div className="text-white/40">
            [██████████████████│░░░░░░░░░░░░░]
          </div>
          <div className="text-emerald-400/80">
            STABLE 24H PROPAGATION
          </div>
        </div>

        {/* Footer Statistics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 border-t border-white/10 bg-black/60 font-mono text-[11px]">
          <div>
            <div className="text-white/40 text-[10px]">RADIAL RMSE</div>
            <div className="text-emerald-400 font-bold mt-0.5">0.14 m</div>
          </div>
          <div>
            <div className="text-white/40 text-[10px]">ALONG-TRACK RMSE</div>
            <div className="text-emerald-400 font-bold mt-0.5">0.26 m</div>
          </div>
          <div>
            <div className="text-white/40 text-[10px]">CROSS-TRACK RMSE</div>
            <div className="text-emerald-400 font-bold mt-0.5">0.18 m</div>
          </div>
          <div>
            <div className="text-white/40 text-[10px]">CLOCK DRIFT ACCURACY</div>
            <div className="text-emerald-400 font-bold mt-0.5">0.08 ns</div>
          </div>
        </div>
      </div>
    </div>
  );
};
