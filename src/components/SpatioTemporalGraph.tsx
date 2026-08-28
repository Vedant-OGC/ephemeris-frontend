import React, { useEffect, useRef, useState } from 'react';
import { Network, Sparkles, Sliders } from 'lucide-react';

interface NodeItem {
  id: string;
  name: string;
  sub: string;
  x: number;
  y: number;
  z: number;
  color: string;
  variance: string;
}

export const SpatioTemporalGraph: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [attentionSpeed, setAttentionSpeed] = useState(1);
  const rotationRef = useRef({ angleX: 0.3, angleY: 0.5 });
  const animFrameRef = useRef<number>(0);

  // Four Spatio-temporal error channels
  const nodes: NodeItem[] = [
    { id: 'X', name: 'ΔX RADIAL', sub: 'Orbit radial displacement', x: -110, y: -75, z: 40, color: '#6FF2C0', variance: '0.042 m²' },
    { id: 'Y', name: 'ΔY ALONG-TRACK', sub: 'Velocity direction drift', x: 110, y: -65, z: -30, color: '#38BDF8', variance: '0.089 m²' },
    { id: 'Z', name: 'ΔZ CROSS-TRACK', sub: 'Orbital plane inclination', x: -80, y: 80, z: -50, color: '#A78BFA', variance: '0.061 m²' },
    { id: 'CLOCK', name: 'Δt CLOCK BIAS', sub: 'Rubidium clock flicker', x: 90, y: 75, z: 60, color: '#F472B6', variance: '0.124 ns²' },
  ];

  // Dynamic attention weights between the 4 channels
  const edges = [
    { from: 'X', to: 'Y', baseWeight: 0.82, label: '0.82' },
    { from: 'X', to: 'Z', baseWeight: 0.71, label: '0.71' },
    { from: 'X', to: 'CLOCK', baseWeight: 0.43, label: '0.43' },
    { from: 'Y', to: 'Z', baseWeight: 0.64, label: '0.64' },
    { from: 'Y', to: 'CLOCK', baseWeight: 0.78, label: '0.78' },
    { from: 'Z', to: 'CLOCK', baseWeight: 0.52, label: '0.52' },
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = canvas.parentElement?.clientWidth || 450);
    let height = (canvas.height = 360);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = 360;
    };
    window.addEventListener('resize', handleResize);

    let tick = 0;

    const render = () => {
      tick += 0.015 * attentionSpeed;
      rotationRef.current.angleY += 0.004 * attentionSpeed;

      ctx.clearRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;

      // Project 3D nodes into 2D screen space with rotation
      const cosY = Math.cos(rotationRef.current.angleY);
      const sinY = Math.sin(rotationRef.current.angleY);
      const cosX = Math.cos(rotationRef.current.angleX);
      const sinX = Math.sin(rotationRef.current.angleX);

      const projected = nodes.map((node) => {
        // Rotate around Y
        const x1 = node.x * cosY - node.z * sinY;
        const z1 = node.x * sinY + node.z * cosY;
        // Rotate around X
        const y1 = node.y * cosX - z1 * sinX;
        const z2 = node.y * sinX + z1 * cosX;

        // Perspective projection
        const fov = 350;
        const scale = fov / (fov + z2);
        const px = centerX + x1 * scale;
        const py = centerY + y1 * scale;

        return {
          ...node,
          px,
          py,
          scale,
          z2,
        };
      });

      // Sort by depth for correct 3D overlapping
      projected.sort((a, b) => b.z2 - a.z2);

      // Draw Edges (Attention Weights)
      edges.forEach((edge, idx) => {
        const fromNode = projected.find((n) => n.id === edge.from);
        const toNode = projected.find((n) => n.id === edge.to);
        if (!fromNode || !toNode) return;

        // Dynamic brightening oscillation
        const dynamicWeight =
          edge.baseWeight + Math.sin(tick * 2 + idx * 1.3) * 0.15;
        const clampedWeight = Math.max(0.2, Math.min(1.0, dynamicWeight));

        const isHighlighted =
          !selectedNode ||
          selectedNode === edge.from ||
          selectedNode === edge.to;

        const opacity = isHighlighted ? clampedWeight * 0.9 : clampedWeight * 0.2;

        // Draw connecting line
        ctx.beginPath();
        ctx.strokeStyle = `rgba(111, 242, 192, ${opacity})`;
        ctx.lineWidth = (1 + clampedWeight * 2.5) * ((fromNode.scale + toNode.scale) / 2);
        ctx.moveTo(fromNode.px, fromNode.py);
        ctx.lineTo(toNode.px, toNode.py);
        ctx.stroke();

        // Traveling attention particle along edge
        const particleT = ((tick * 0.8 + idx * 0.35) % 1);
        const pX = fromNode.px + (toNode.px - fromNode.px) * particleT;
        const pY = fromNode.py + (toNode.py - fromNode.py) * particleT;

        ctx.fillStyle = '#6FF2C0';
        ctx.beginPath();
        ctx.arc(pX, pY, 2.5, 0, Math.PI * 2);
        ctx.fill();

        // Edge attention value badge at midpoint
        const midX = (fromNode.px + toNode.px) / 2;
        const midY = (fromNode.py + toNode.py) / 2;

        if (isHighlighted) {
          ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
          ctx.fillRect(midX - 14, midY - 8, 28, 16);
          ctx.strokeStyle = 'rgba(111, 242, 192, 0.3)';
          ctx.lineWidth = 0.8;
          ctx.strokeRect(midX - 14, midY - 8, 28, 16);

          ctx.fillStyle = '#6FF2C0';
          ctx.font = '9px "IBM Plex Mono", monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(clampedWeight.toFixed(2), midX, midY);
        }
      });

      // Draw Nodes
      projected.forEach((node) => {
        const radius = (selectedNode === node.id ? 14 : 10) * node.scale;

        // Node Outer Glow
        ctx.shadowColor = node.color;
        ctx.shadowBlur = 16;
        ctx.fillStyle = node.color;
        ctx.beginPath();
        ctx.arc(node.px, node.py, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Node Inner Core
        ctx.fillStyle = '#050608';
        ctx.beginPath();
        ctx.arc(node.px, node.py, radius * 0.6, 0, Math.PI * 2);
        ctx.fill();

        // Label
        ctx.fillStyle = '#FFFFFF';
        ctx.font = `bold ${Math.round(11 * node.scale)}px "IBM Plex Mono", monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText(node.id, node.px, node.py - radius - 4);
      });

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('resize', handleResize);
    };
  }, [selectedNode, attentionSpeed]);

  return (
    <div className="w-full flex flex-col items-center">
      {/* Header Info */}
      <div className="w-full flex items-center justify-between px-4 py-2 border-b border-white/10 bg-black/40">
        <div className="flex items-center gap-2">
          <Network className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-mono tracking-widest text-white uppercase">
            GRAPH ATTENTION (GAT)
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-white/50">Speed:</span>
          <button
            onClick={() => setAttentionSpeed(attentionSpeed === 1 ? 2 : 1)}
            className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/10 hover:bg-white/20 text-emerald-300"
          >
            {attentionSpeed}x
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div className="relative w-full h-[360px] bg-[#030406]/90 flex items-center justify-center">
        <canvas ref={canvasRef} className="w-full h-full block" />

        {/* Floating Attention Badge */}
        <div className="absolute top-3 left-4 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-left pointer-events-none">
          <div className="text-[10px] font-mono text-emerald-400">DYNAMIC WEIGHT MATRIX</div>
          <div className="text-[9px] font-mono text-white/50">Coupled Orbital Cross-Attention</div>
        </div>

        {/* Bottom Central Statement */}
        <div className="absolute bottom-3 inset-x-0 flex justify-center pointer-events-none">
          <div className="bg-black/80 backdrop-blur-md px-4 py-1.5 rounded-full border border-emerald-500/30 text-[11px] font-mono text-emerald-300 flex items-center gap-2 shadow-lg">
            <Sparkles className="w-3 h-3 text-emerald-400" />
            <span>The errors are not independent.</span>
          </div>
        </div>
      </div>

      {/* Node Switcher Footer */}
      <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 bg-black/50 border-t border-white/10 text-[10px] font-mono">
        {nodes.map((n) => (
          <button
            key={n.id}
            onClick={() => setSelectedNode(selectedNode === n.id ? null : n.id)}
            className={`p-2 rounded border text-left transition-all ${selectedNode === n.id
                ? 'bg-emerald-950/40 border-emerald-400/60 text-white'
                : 'bg-white/[0.02] border-white/5 text-white/60 hover:bg-white/[0.05]'
              }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold" style={{ color: n.color }}>{n.name}</span>
              <span className="text-[9px] text-white/40">{n.variance}</span>
            </div>
            <div className="text-[9px] text-white/40 truncate mt-0.5">{n.sub}</div>
          </button>
        ))}
      </div>
    </div>
  );
};
