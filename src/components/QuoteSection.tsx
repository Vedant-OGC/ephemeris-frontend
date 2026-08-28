import React, { useEffect, useRef, useState } from 'react';
import { Quote } from 'lucide-react';

interface QuoteSectionProps {
  onOpenDashboard?: () => void;
}

export const QuoteSection: React.FC<QuoteSectionProps> = ({ onOpenDashboard }) => {
  const sectionRef = useRef<HTMLElement | null>(null);
  const cloud1Ref = useRef<HTMLDivElement | null>(null);
  const cloud2Ref = useRef<HTMLDivElement | null>(null);
  const textRef = useRef<HTMLDivElement | null>(null);

  // Lerp tracking
  const currentProgress = useRef(0);
  const targetProgress = useRef(0);
  const animFrameId = useRef<number>(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // Calculate progress from 0 to 1 as section scrolls through viewport
      const rawProgress = (windowHeight - rect.top) / (windowHeight + rect.height);
      targetProgress.current = Math.max(0, Math.min(1, rawProgress));
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    // Lerp loop using requestAnimationFrame
    const lerp = (start: number, end: number, factor: number) => start + (end - start) * factor;

    const animate = () => {
      currentProgress.current = lerp(currentProgress.current, targetProgress.current, 0.08);
      const p = currentProgress.current;

      // Apply GPU-accelerated translate3d transforms
      if (cloud1Ref.current) {
        const translateY = (p - 0.5) * -80;
        const translateX = (p - 0.5) * 40;
        const opacity = Math.min(1, Math.max(0.1, p * 1.5));
        cloud1Ref.current.style.transform = `translate3d(${translateX}px, ${translateY}px, 0)`;
        cloud1Ref.current.style.opacity = `${opacity}`;
      }

      if (cloud2Ref.current) {
        const translateY = (p - 0.5) * 100;
        const translateX = (p - 0.5) * -50;
        const opacity = Math.min(1, Math.max(0.1, p * 1.3));
        cloud2Ref.current.style.transform = `translate3d(${translateX}px, ${translateY}px, 0)`;
        cloud2Ref.current.style.opacity = `${opacity}`;
      }

      if (textRef.current) {
        const translateY = (1 - p) * 35;
        const opacity = Math.min(1, Math.max(0.2, (p - 0.1) * 1.8));
        textRef.current.style.transform = `translate3d(0, ${translateY}px, 0)`;
        textRef.current.style.opacity = `${opacity}`;
      }

      animFrameId.current = requestAnimationFrame(animate);
    };

    animFrameId.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(animFrameId.current);
    };
  }, []);

  return (
    <section
      id="contact"
      ref={sectionRef}
      className="relative w-full min-h-screen flex items-center justify-center overflow-hidden px-6 md:px-12 py-24 select-none"
      style={{
        background: 'linear-gradient(180deg, #010A17 0%, #0A4267 30%, #20658E 60%, #6BADC4 100%)',
      }}
    >
      {/* Background Animated Parallax Glows & Atmospheric Shapes */}
      <div
        ref={cloud1Ref}
        className="absolute top-10 left-10 w-[550px] h-[550px] rounded-full bg-cyan-400/10 blur-[130px] pointer-events-none will-change-transform opacity-0"
        style={{ transform: 'translate3d(-50px, 100px, 0)' }}
      />
      <div
        ref={cloud2Ref}
        className="absolute bottom-10 right-10 w-[650px] h-[650px] rounded-full bg-blue-300/15 blur-[150px] pointer-events-none will-change-transform opacity-0"
        style={{ transform: 'translate3d(50px, -100px, 0)' }}
      />

      {/* Subtle Grid Overlay for Continuity */}
      <div className="absolute inset-0 technical-grid opacity-25 pointer-events-none" />

      {/* Center Quote Content */}
      <div
        ref={textRef}
        className="relative z-20 max-w-4xl mx-auto text-center flex flex-col items-center will-change-transform"
      >
        {/* Subtle Decorative Quote Icon */}
        <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center mb-8 border border-white/20 shadow-lg">
          <Quote className="w-5 h-5 text-white/80" />
        </div>

        {/* Quote Text in Instrument Serif */}
        <blockquote className="font-instrument text-white text-xl sm:text-2xl md:text-4xl lg:text-[42px] leading-[1.45] md:leading-[1.5] tracking-tight font-normal text-glow">
          &ldquo;EPHEMERIS was made on the conviction that extreme data scarcity contains deterministic orbital truth. We isolate what is predictable across secular drift and harmonic resonance to deliver stable 24-hour satellite forecasts from only seven days of telemetry.&rdquo;
        </blockquote>

        {/* Attribution */}
        <cite className="not-italic mt-6 md:mt-8 text-white/80 text-sm md:text-base tracking-wide font-inter font-light">
          Team Greedy Minds &mdash; Hackathon Project
        </cite>

        {/* Action Button */}
        <div className="mt-10 md:mt-12 flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={() => {
              if (onOpenDashboard) {
                onOpenDashboard();
              } else {
                window.location.pathname = '/dashboard';
              }
            }}
            className="bg-white text-black px-8 py-3.5 rounded-full font-medium text-sm tracking-wide hover:bg-white/90 transition-all duration-300 button-glow active:scale-95 shadow-xl font-mono cursor-pointer"
          >
            Launch Mission Dashboard &rarr;
          </button>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="px-8 py-3.5 rounded-full font-medium text-sm tracking-wide text-white border border-white/30 hover:bg-white/10 transition-all duration-300 backdrop-blur-sm cursor-pointer"
          >
            Back to Top
          </button>
        </div>
      </div>

      {/* Bottom Footer Credits */}
      <div className="absolute bottom-6 inset-x-0 text-center text-xs font-mono text-white/50 pointer-events-none">
        Greedy Minds &bull; Hackathon Project &bull; 2026
      </div>
    </section>
  );
};
