import React, { useEffect, useRef, useState, useMemo } from 'react';
import { CheckCircle, BarChart3, RefreshCw, Sparkles, TrendingUp } from 'lucide-react';

export const NormalityDistributionCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [morphProgress, setMorphProgress] = useState(1); // 0 = fully scattered, 1 = Gaussian bell curve
  const [isAutoAnimating, setIsAutoAnimating] = useState(false);
  const animFrameRef = useRef<number>(0);

  // Generate 350 residual points with both scattered random positions and target Gaussian positions
  const points = useMemo(() => {
    const pts = [];
    const count = 380;

    for (let i = 0; i < count; i++) {
      // Box-Muller transform for true standard normal Gaussian distribution
      const u1 = Math.random() || 0.0001;
      const u2 = Math.random() || 0.0001;
      const z = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);

      // Target Gaussian X & Y
      const targetNormX = z * 0.28; // standard deviation scaled
      // Gaussian Probability Density Function height
      const targetDensity = (1 / Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * z * z);
      // Add slight jitter for natural point dispersion within the bell curve
      const targetNormY = (targetDensity * (0.85 + Math.random() * 0.25));

      // Initial chaotic scatter position
      const scatterX = (Math.random() - 0.5) * 1.6;
      const scatterY = Math.random() * 0.65;

      pts.push({
        scatterX,
        scatterY,
        targetNormX,
        targetNormY,
        z,
        color: Math.abs(z) < 1 ? '#6FF2C0' : Math.abs(z) < 2 ? '#38BDF8' : '#F472B6',
      });
    }
    return pts;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = canvas.parentElement?.clientWidth || 800);
    let height = (canvas.height = 360);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = 360;
    };
    window.addEventListener('resize', handleResize);

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const paddingLeft = 50;
      const paddingRight = 50;
      const paddingTop = 40;
      const paddingBottom = 50;
      const graphWidth = width - paddingLeft - paddingRight;
      const graphHeight = height - paddingTop - paddingBottom;
      const centerX = width / 2;
      const baselineY = height - paddingBottom;

      // Draw subtle grid
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.lineWidth = 1;
      for (let x = paddingLeft; x <= width - paddingRight; x += graphWidth / 8) {
        ctx.beginPath();
        ctx.moveTo(x, paddingTop);
        ctx.lineTo(x, baselineY);
        ctx.stroke();
      }

      // X Axis
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(paddingLeft - 10, baselineY);
      ctx.lineTo(width - paddingRight + 10, baselineY);
      ctx.stroke();

      // Zero mean centerline
      ctx.strokeStyle = 'rgba(111, 242, 192, 0.25)';
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(centerX, paddingTop);
      ctx.lineTo(centerX, baselineY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Axis standard deviation tick marks (-3σ, -2σ, -1σ, 0, +1σ, +2σ, +3σ)
      const sigmas = [-3, -2, -1, 0, 1, 2, 3];
      sigmas.forEach((sig) => {
        const tx = centerX + (sig / 3.2) * (graphWidth * 0.42);
        ctx.fillStyle = sig === 0 ? '#6FF2C0' : 'rgba(255, 255, 255, 0.4)';
        ctx.font = '10px "IBM Plex Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(sig === 0 ? 'μ = 0.00' : `${sig > 0 ? '+' : ''}${sig}σ`, tx, baselineY + 18);

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.beginPath();
        ctx.moveTo(tx, baselineY - 4);
        ctx.lineTo(tx, baselineY + 4);
        ctx.stroke();
      });

      // Draw Theoretical Gaussian PDF Curve Overlay
      if (morphProgress > 0.2) {
        const alpha = Math.min(1, (morphProgress - 0.2) * 1.25);
        ctx.beginPath();
        ctx.strokeStyle = `rgba(111, 242, 192, ${0.85 * alpha})`;
        ctx.lineWidth = 2.2;
        ctx.shadowColor = 'rgba(111, 242, 192, 0.5)';
        ctx.shadowBlur = 10;

        for (let px = paddingLeft; px <= width - paddingRight; px += 2) {
          const normX = ((px - centerX) / (graphWidth * 0.42)) * 3.2;
          const pdf = (1 / Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * normX * normX);
          const py = baselineY - (pdf / 0.4) * (graphHeight * 0.85) * morphProgress;

          if (px === paddingLeft) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      // Draw Interpolated Residual Points
      points.forEach((pt) => {
        // Interpolate between scatter and Gaussian
        const curNormX = pt.scatterX * (1 - morphProgress) + pt.targetNormX * morphProgress;
        const curNormY = pt.scatterY * (1 - morphProgress) + pt.targetNormY * morphProgress;

        const x = centerX + (curNormX / 0.85) * (graphWidth * 0.42);
        const y = baselineY - (curNormY / 0.4) * (graphHeight * 0.85);

        ctx.fillStyle = pt.color;
        ctx.beginPath();
        ctx.arc(x, y, 2.2, 0, Math.PI * 2);
        ctx.fill();
      });

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('resize', handleResize);
    };
  }, [points, morphProgress]);

  return (
    <div className="w-full flex flex-col items-center">
      {/* Header Bar */}
      <div className="w-full flex flex-wrap items-center justify-between gap-4 mb-3 px-2">
        <div className="flex items-center gap-3">
          <div className="text-xs font-mono text-white font-bold tracking-widest uppercase flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-[#6FF2C0]" />
            <span>RESIDUAL DISTRIBUTION</span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/50 border border-emerald-500/40 text-[#6FF2C0] font-semibold">
            VALIDATION NORM
          </span>
        </div>

        {/* Morph Control Slider */}
        <div className="flex items-center gap-3 bg-black/40 px-3.5 py-1.5 rounded-full border border-white/10">
          <span className="text-[11px] font-mono text-white/60">Morph Distribution:</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={morphProgress}
            onChange={(e) => setMorphProgress(parseFloat(e.target.value))}
            className="w-28 accent-[#6FF2C0] cursor-pointer h-1.5 bg-white/20 rounded-lg"
          />
          <button
            onClick={() => setMorphProgress(morphProgress > 0.5 ? 0 : 1)}
            className="text-[11px] font-mono text-white/80 hover:text-white underline ml-1"
          >
            {morphProgress > 0.5 ? 'Scatter' : 'Fit Gaussian'}
          </button>
        </div>
      </div>

      {/* Canvas Box */}
      <div className="relative w-full rounded-2xl liquid-glass border border-white/10 overflow-hidden bg-[#030508]/95 shadow-2xl">
        <canvas ref={canvasRef} className="w-full h-[360px] block" />

        {/* Floating Statistical Rigor Badge */}
        <div className="absolute top-4 left-4 z-10 flex flex-col gap-1.5 p-3 rounded-lg bg-black/80 backdrop-blur-md border border-white/10 font-mono text-[11px]">
          <div className="flex items-center justify-between gap-6 text-white/70">
            <span>RESIDUAL MEAN:</span>
            <span className="text-white font-bold">μ ≈ 0.00</span>
          </div>
          <div className="flex items-center justify-between gap-6 text-white/70">
            <span>RESIDUAL STD:</span>
            <span className="text-white font-bold">σ = 0.042 m</span>
          </div>
          <div className="flex items-center justify-between gap-6 text-[#6FF2C0] border-t border-white/10 pt-1 font-semibold">
            <span>SHAPIRO–WILK:</span>
            <span className="bg-emerald-950/80 px-1.5 py-0.5 rounded border border-[#6FF2C0]/40 text-[#6FF2C0]">
              p &gt; 0.05
            </span>
          </div>
        </div>

        {/* Climax Statement Footer */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-950/40 via-black/80 to-emerald-950/40 border-t border-white/10 text-center">
          <div className="flex items-center justify-center gap-2 text-white font-instrument text-lg sm:text-2xl text-glow">
            <CheckCircle className="w-5 h-5 text-[#6FF2C0] inline-block shrink-0" />
            <span>&ldquo;The predictable error has been removed.&rdquo;</span>
          </div>
          <p className="text-[11px] font-mono text-white/50 mt-1 max-w-xl mx-auto">
            Residuals pass the Shapiro–Wilk normality test with zero remaining autocorrelations, confirming theoretical optimality.
          </p>
        </div>
      </div>
    </div>
  );
};
