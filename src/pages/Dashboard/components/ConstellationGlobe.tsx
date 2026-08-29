import React, { useRef, useState, useEffect } from 'react';
import { Satellite } from '../types';
import { Play, Pause } from 'lucide-react';

interface ConstellationGlobeProps {
  satellites: Satellite[];
  selectedSatelliteId: string;
  onSelectSatellite: (id: string) => void;
  isSimulating: boolean;
}

export const ConstellationGlobe: React.FC<ConstellationGlobeProps> = ({
  satellites,
  selectedSatelliteId,
  onSelectSatellite,
  isSimulating,
}) => {
  const [filterType, setFilterType] = useState<string>('ALL');
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  const selectedSat = satellites.find((s) => s.id === selectedSatelliteId) || satellites[0];

  const filteredSatellites = satellites.filter((s) => {
    if (filterType === 'ALL') return true;
    return s.type === filterType;
  });

  const toggleVideoPlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsVideoPlaying(true);
      } else {
        videoRef.current.pause();
        setIsVideoPlaying(false);
      }
    }
  };

  // Satellite positions keyed by BACKEND ID (G01, G03, etc.)
  const satPositions: Record<string, { x: number; y: number; orbit: string }> = {
    'G01': { x: 28, y: 35, orbit: 'GEO 55E' },
    'G03': { x: 52, y: 40, orbit: 'GEO 83E' },
    'G05': { x: 74, y: 48, orbit: 'GSO 111.75E' },
    'G07': { x: 82, y: 62, orbit: 'GEO 129.5E' },
    'G08': { x: 20, y: 55, orbit: 'GEO 32.5E' },
    'G10': { x: 38, y: 22, orbit: 'MEO' },
    'G11': { x: 42, y: 68, orbit: 'MEO' },
    'G12': { x: 68, y: 25, orbit: 'GEO 55E' },
  };

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }, []);

  return (
    <div className="relative w-full h-[480px] md:h-[520px] bg-[#040306] border border-white/20 hover:border-white/30 rounded-2xl overflow-hidden shadow-2xl flex flex-col justify-between select-none group transition-all duration-300">
      {/* 1. Background Video Player */}
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none">
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover object-center opacity-90 scale-105 transition-transform duration-700"
        >
          <source src="/fisp-earth.webm" type="video/webm" />
          <source src="/earthvideo.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-t from-[#040306] via-[#040306]/30 to-[#040306]/70" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#040306]/60 via-transparent to-[#040306]/60" />
      </div>

      {/* 2. Top Header Overlay */}
      <div className="relative z-10 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pointer-events-none">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <h2 className="text-xs uppercase font-mono tracking-widest text-white font-bold">
              NAVIC CONSTELLATION TRACKER
            </h2>
          </div>
          <p className="text-xs text-white/60 font-inter mt-0.5">
            Real-Time Earth Video Tracking &bull; {satellites.length} Regional Transponders
          </p>
        </div>

        {/* Orbit Filter Chips */}
        <div className="pointer-events-auto flex items-center space-x-1.5 liquid-glass bg-black/70 p-1.5 rounded-xl border border-white/20 text-xs font-mono">
          {['ALL', 'GEO', 'IGSO', 'MEO'].map((mode) => (
            <button
              key={mode}
              onClick={() => setFilterType(mode)}
              className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                filterType === mode
                  ? 'bg-emerald-500/20 text-[#6FF2C0] border border-emerald-500/40 font-semibold'
                  : 'text-white/60 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Interactive Satellite Markers */}
      <div className="relative z-10 flex-1 w-full h-full pointer-events-none">
        {filteredSatellites.map((sat) => {
          const pos = satPositions[sat.id];
          if (!pos) return null;
          const isSelected = sat.id === selectedSatelliteId;

          return (
            <div
              key={sat.id}
              onClick={(e) => {
                e.stopPropagation();
                onSelectSatellite(sat.id);
              }}
              style={{
                left: `${pos.x}%`,
                top: `${pos.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
              className={`absolute pointer-events-auto cursor-pointer transition-all duration-200 flex items-center space-x-2 px-3 py-1.5 rounded-xl text-xs font-mono font-bold shadow-2xl border ${
                isSelected
                  ? 'bg-white text-black border-2 border-[#6FF2C0] scale-110 z-30 button-glow'
                  : 'bg-[#060408]/90 hover:bg-[#060408] text-white border-white/20 hover:border-[#6FF2C0] hover:scale-105 z-20'
              }`}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: sat.color }}
              />
              <div className="flex flex-col text-left leading-tight">
                <span style={{ color: isSelected ? '#000' : '#fff' }}>{sat.id}</span>
                <span className={`text-[9px] font-normal ${isSelected ? 'text-black/70' : 'text-white/50'}`}>
                  {pos.orbit}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 4. Bottom Controls & Telemetry Overlay */}
      <div className="relative z-10 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pointer-events-none">
        <div className="pointer-events-auto flex items-center space-x-2">
          <div className="liquid-glass bg-black/80 border border-white/20 rounded-xl p-1.5 flex items-center space-x-1.5 shadow-2xl">
            <button
              onClick={toggleVideoPlay}
              className="p-2 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
              title={isVideoPlaying ? 'Pause Earth Stream' : 'Play Earth Stream'}
            >
              {isVideoPlaying ? <Pause className="w-4 h-4 text-[#6FF2C0]" /> : <Play className="w-4 h-4 text-white" />}
            </button>
            <div className="h-4 w-px bg-white/10" />
            <div className="px-2 text-[11px] font-mono text-white/60">
              ISTRAC BENGALURU DOWNLINK
            </div>
          </div>
        </div>

        {selectedSat && (
          <div className="pointer-events-auto liquid-glass bg-black/85 border border-white/20 rounded-xl px-4 py-2 text-xs font-mono shadow-2xl flex items-center space-x-3">
            <div className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-white/50 text-[10px]">TARGET:</span>
              <span className="font-bold text-[#6FF2C0]">{selectedSat.id}</span>
            </div>
            <span className="text-white/20">|</span>
            <div className="text-white/70 text-[11px]">
              ALT: <span className="text-white font-bold">{selectedSat.altitudeKm.toLocaleString()} km</span>
            </div>
            <span className="text-white/20">|</span>
            <div className="text-[#38BDF8] text-[11px]">
              RESIDUAL: <span className="font-bold">{selectedSat.currentOrbitResidual} m</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
