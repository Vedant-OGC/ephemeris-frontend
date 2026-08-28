import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Database, Zap, Layers, Sparkles, RefreshCw } from 'lucide-react';

export const SyntheticDataTransferCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [expansionLevel, setExpansionLevel] = useState(1); // 0 = 145 real only, 1 = 100x augmented field
  const [isAutoAnimating, setIsAutoAnimating] = useState(true);
  const animFrameRef = useRef<number>(0);
  const timeRef = useRef<number>(0);

  // Generate 145 real base points
  const realTrajectory = useMemo(() => {
    const pts = [];
    const count = 145;
    for (let i = 0; i < count; i++) {
      const t = i / (count - 1);
      const val =
        Math.sin(t * 5.5) * 45 +
        Math.cos(t * 12.2) * 20 +
        (Math.sin(i * 133) % 1) * 8;
      pts.push({ t, val });
    }
    return pts;
  }, []);

  // Pre-calculate synthetic trajectory variances (180 distinct faint generative trajectories)
  const syntheticLines = useMemo(() => {
    const lines = [];
    const numLines = 160;
    for (let l = 0; l < numLines; l++) {
      const seed = l * 17.381;
      const freq1 = 4.5 + ((l % 9) * 0.4);
      const freq2 = 10 + ((l % 7) * 0.8);
      const ampMod = 0.7 + (Math.sin(seed) * 0.6);
      const phase = (l / numLines) * Math.PI * 2;
      const drift = (Math.sin(seed * 3) - 0.5) * 70;
      const hue = l % 3 === 0 ? '#38BDF8' : l % 3 === 1 ? '#6FF2C0' : '#E2E8F0';

      lines.push({
        freq1,
        freq2,
        ampMod,
        phase,
        drift,
        hue,
        alpha: 0.05 + (Math.sin(seed * 5) * 0.04 + 0.04),
      });
    }
    return lines;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = canvas.parentElement?.clientWidth || 800);
    let height = (canvas.height = 420);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = 420;
    };
    window.addEventListener('resize', handleResize);

    const render = () => {
      timeRef.current += 0.015;

      ctx.clearRect(0, 0, width, height);

      const paddingLeft = 70;
      const paddingRight = 40;
      const paddingTop = 40;
      const paddingBottom = 40;
      const graphWidth = width - paddingLeft - paddingRight;
      const centerY = height / 2;

      // Draw subtle background grid
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.lineWidth = 1;
      for (let x = paddingLeft; x <= width - paddingRight; x += graphWidth / 8) {
        ctx.beginPath();
        ctx.moveTo(x, paddingTop);
        ctx.lineTo(x, height - paddingBottom);
        ctx.stroke();
      }

      // Draw Synthetic Expansion Trajectories (Field of 100x trajectories)
      if (expansionLevel > 0.01) {
        syntheticLines.forEach((syn, lIdx) => {
          ctx.beginPath();
          ctx.strokeStyle = syn.hue;
          ctx.globalAlpha = syn.alpha * expansionLevel * 1.5;
          ctx.lineWidth = 0.8;

          realTrajectory.forEach((pt, pIdx) => {
            const x = paddingLeft + pt.t * graphWidth;

            // Generate synthetic variance branching from real observation anchor
            const branchSpread = Math.sin(pt.t * Math.PI) * syn.drift * expansionLevel;
            const wave =
              Math.sin(pt.t * syn.freq1 + syn.phase + timeRef.current * 0.5) *
              22 *
              syn.ampMod *
              expansionLevel;
            const y = centerY - pt.val - branchSpread - wave;

            if (pIdx === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          });
          ctx.stroke();
        });
        ctx.globalAlpha = 1.0;
      }

      // Flowing generative particles across trajectories
      if (expansionLevel > 0.3) {
        for (let p = 0; p < 35; p++) {
          const t = ((timeRef.current * 0.3 + p * 0.03) % 1);
          const x = paddingLeft + t * graphWidth;
          const syn = syntheticLines[p % syntheticLines.length];
          const branchSpread = Math.sin(t * Math.PI) * syn.drift * expansionLevel;
          const wave =
            Math.sin(t * syn.freq1 + syn.phase + timeRef.current * 0.5) *
            22 *
            syn.ampMod *
            expansionLevel;
          const baseY =
            Math.sin(t * 5.5) * 45 + Math.cos(t * 12.2) * 20;
          const y = centerY - baseY - branchSpread - wave;

          ctx.fillStyle = '#6FF2C0';
          ctx.shadowColor = '#6FF2C0';
          ctx.shadowBlur = 8;
          ctx.beginPath();
          ctx.arc(x, y, 1.8, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }

      // Draw Main Ground-Truth Real Observation Path (145 Real Observations)
      ctx.beginPath();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2.8;
      ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
      ctx.shadowBlur = 12;

      realTrajectory.forEach((pt, idx) => {
        const x = paddingLeft + pt.t * graphWidth;
        const y = centerY - pt.val;
        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Draw Real 145 points
      realTrajectory.forEach((pt, idx) => {
        const x = paddingLeft + pt.t * graphWidth;
        const y = centerY - pt.val;

        ctx.fillStyle = idx % 2 === 0 ? '#6FF2C0' : '#FFFFFF';
        ctx.beginPath();
        ctx.arc(x, y, 2.2, 0, Math.PI * 2);
        ctx.fill();
      });

      // Axis & labels
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.font = '10px "IBM Plex Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText('INPUT: 145 REAL OBSERVATIONS [7 DAYS]', paddingLeft, paddingTop - 12);

      ctx.textAlign = 'right';
      ctx.fillStyle = '#6FF2C0';
      ctx.fillText('TIMeR-XL: 100× AUGMENTED TRAINING SPACE', width - paddingRight, paddingTop - 12);

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('resize', handleResize);
    };
  }, [expansionLevel, realTrajectory, syntheticLines]);

  return (
    <div className="w-full flex flex-col items-center">
      {/* Top Controls */}
      <div className="w-full flex flex-wrap items-center justify-between gap-4 mb-3 px-2">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-950/30 border border-cyan-500/30 text-cyan-300 text-xs font-mono">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span>TIMeR-XL SYNTHETIC DATA GENERATION</span>
          </div>
          <span className="text-[11px] font-mono text-emerald-400 font-semibold">
            {expansionLevel === 1 ? '100× AUGMENTED TRAINING SPACE' : `${Math.round(1 + expansionLevel * 99)}× EXPANSION`}
          </span>
        </div>

        {/* Expansion slider */}
        <div className="flex items-center gap-3 bg-black/40 px-3.5 py-1.5 rounded-full border border-white/10">
          <Layers className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-[11px] font-mono text-white/60">Synthetic Field:</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={expansionLevel}
            onChange={(e) => setExpansionLevel(parseFloat(e.target.value))}
            className="w-28 accent-emerald-400 cursor-pointer h-1.5 bg-white/20 rounded-lg"
          />
          <button
            onClick={() => setExpansionLevel(expansionLevel === 1 ? 0 : 1)}
            className="text-[11px] font-mono text-white/80 hover:text-white underline ml-1"
          >
            {expansionLevel > 0.5 ? 'Reset' : 'Expand 100x'}
          </button>
        </div>
      </div>

      {/* Main Canvas Container */}
      <div className="relative w-full rounded-2xl liquid-glass border border-white/10 overflow-hidden bg-[#030508]/95 shadow-2xl">
        <canvas ref={canvasRef} className="w-full h-[420px] block" />

        {/* Floating Metrics Badge */}
        <div className="absolute top-4 left-4 z-10 flex flex-col gap-1.5 p-3 rounded-lg bg-black/80 backdrop-blur-md border border-white/10 font-mono text-[11px]">
          <div className="flex items-center justify-between gap-6 text-white/70">
            <span>REAL TELEMETRY:</span>
            <span className="text-white font-bold">145 EPOCHS</span>
          </div>
          <div className="flex items-center justify-between gap-6 text-cyan-300">
            <span>GENERATED SAMPLES:</span>
            <span className="font-bold">{Math.round(145 + expansionLevel * 14355).toLocaleString()} VECTORS</span>
          </div>
          <div className="flex items-center justify-between gap-6 text-emerald-400 border-t border-white/10 pt-1">
            <span>TRANSFER FIDELITY:</span>
            <span className="font-bold">99.4% (FID: 0.012)</span>
          </div>
        </div>

        {/* Bottom Banner */}
        <div className="px-6 py-2.5 bg-black/60 border-t border-white/10 flex flex-wrap items-center justify-between text-[11px] font-mono text-white/60">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span className="text-white/80">Stochastic Generative Transfer across Scarcity</span>
          </div>
          <div className="text-white/40 hidden sm:block">
            NavIC Constellation [IRNSS-1A..1I] Error Augmentation
          </div>
        </div>
      </div>
    </div>
  );
};
