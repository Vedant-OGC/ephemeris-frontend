import React, { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX, Sparkles, ArrowDown } from 'lucide-react';

interface HeroProps {
  onExplore?: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onExplore }) => {
  const [isPlayingSound, setIsPlayingSound] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscillatorNodes = useRef<{ osc1: OscillatorNode; osc2: OscillatorNode; gain: GainNode } | null>(null);

  const toggleSound = () => {
    if (!isPlayingSound) {
      try {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        const ctx = new AudioCtx();
        audioCtxRef.current = ctx;

        // Ambient celestial drone
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();

        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(108, ctx.currentTime); // Deep resonant 108Hz

        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(216.5, ctx.currentTime); // Harmonic

        gain.gain.setValueAtTime(0.001, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.08, ctx.currentTime + 2);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);

        osc1.start();
        osc2.start();

        oscillatorNodes.current = { osc1, osc2, gain };
        setIsPlayingSound(true);
      } catch (e) {
        console.error('AudioContext error:', e);
      }
    } else {
      if (oscillatorNodes.current && audioCtxRef.current) {
        const { gain } = oscillatorNodes.current;
        gain.gain.exponentialRampToValueAtTime(0.0001, audioCtxRef.current.currentTime + 0.8);
        setTimeout(() => {
          audioCtxRef.current?.close();
          setIsPlayingSound(false);
        }, 800);
      } else {
        setIsPlayingSound(false);
      }
    }
  };

  useEffect(() => {
    return () => {
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close();
      }
    };
  }, []);

  const handleScrollDown = () => {
    if (onExplore) {
      onExplore();
    } else {
      const el = document.getElementById('signal');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="about" className="relative w-full h-screen overflow-hidden flex items-center justify-center select-none">
      {/* Background Video */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover scale-105 transition-transform duration-1000 ease-out"
        src="/earthvideo.mp4"
      >
        {/* Fallback image if video fails */}
        <img
          src="/maxresdefault.jpg"
          alt="Earth Orbital View"
          className="w-full h-full object-cover"
        />
      </video>

      {/* Dark Overlay as requested */}
      <div className="absolute inset-0 bg-black/20 backdrop-brightness-[0.88]" />

      {/* Subtle Atmospheric Gradient vignette */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0608]/40 via-transparent to-[#0a0608]/90 pointer-events-none" />

      {/* Center Content */}
      <div className="relative z-20 flex flex-col items-center justify-center px-4 max-w-5xl mx-auto -mt-[120px] text-center">
        {/* Subtle Pill Tag */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full liquid-glass mb-6 border border-white/10 animate-pulse-subtle">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-[11px] font-mono tracking-widest text-white/90 uppercase">
            EPHEMERIS • NavIC Deep Transfer Engine
          </span>
        </div>

        {/* Hero Heading */}
        <h1 className="font-instrument text-white text-[36px] md:text-7xl lg:text-[110px] leading-[0.9] tracking-tight text-center text-glow">
          Predictive Satellite Error Modeling
        </h1>

        {/* Hero Subtext */}
        <p className="text-white/70 text-sm md:text-base text-center mt-5 md:mt-7 max-w-xl font-inter font-light tracking-wide leading-relaxed">
          A deep transfer learning framework to forecast NavIC satellite ephemeris & clock errors under extreme data scarcity (7 days / 145 observations).
        </p>

        {/* Hero CTA Button */}
        <button
          onClick={handleScrollDown}
          className="bg-white text-black px-8 py-3.5 rounded-full font-medium text-sm tracking-wide hover:bg-white/90 transition-all duration-300 button-glow mt-6 md:mt-9 active:scale-95 cursor-pointer shadow-lg hover:shadow-white/20"
        >
          Explore Framework
        </button>
      </div>

      {/* Sound Indicator (Desktop only) */}
      <div
        onClick={toggleSound}
        className="hidden md:flex absolute bottom-8 left-8 z-30 items-center gap-3 cursor-pointer group bg-black/20 hover:bg-black/40 backdrop-blur-md px-3.5 py-2 rounded-full border border-white/10 transition-all duration-300"
        title={isPlayingSound ? 'Mute ambient sound' : 'Play ambient audio drone'}
      >
        <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center group-hover:border-white/50 transition-colors relative overflow-hidden">
          {isPlayingSound ? (
            <Volume2 className="w-4 h-4 text-emerald-400 animate-pulse" />
          ) : (
            <div className="w-3.5 h-[1.5px] bg-white/60 group-hover:bg-white transition-colors" />
          )}
        </div>
        <div className="text-left select-none">
          <div className="text-white/60 group-hover:text-white/90 text-xs font-inter leading-tight transition-colors">
            Experience
          </div>
          <div className="text-white/60 group-hover:text-white/90 text-xs font-inter leading-tight font-light transition-colors">
            {isPlayingSound ? 'with ambient audio' : 'with sound'}
          </div>
        </div>
      </div>

      {/* Telemetry Coordinate Overlay (Bottom Right) */}
      <div className="hidden lg:flex flex-col items-end absolute bottom-8 right-8 z-30 font-mono text-[11px] text-white/50 space-y-1 select-none pointer-events-none">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400/80" />
          <span className="text-white/80">ORBIT: GEO / GSO [NavIC-1A..1I]</span>
        </div>
        <div>OBSERVATION WINDOW: 7 DAYS (145 EPOCHS)</div>
        <div className="text-emerald-400/80">RESIDUAL NORM: μ=0.00 σ=0.04m</div>
      </div>

      {/* Scroll Down Indicator */}
      <div
        onClick={handleScrollDown}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-1 cursor-pointer opacity-70 hover:opacity-100 transition-opacity"
      >
        <span className="text-[10px] font-mono tracking-widest text-white/50 uppercase">Scroll to Telemetry</span>
        <ArrowDown className="w-4 h-4 text-white/70 animate-bounce" />
      </div>
    </section>
  );
};
