import React from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { SignalSection } from './components/SignalSection';
import { QuoteSection } from './components/QuoteSection';

export default function App() {
  const handleNavigate = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-[#0a0608] min-h-screen text-white relative selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Fixed Navbar with responsive mobile menu & Dancing Script logo */}
      <Navbar onNavigate={handleNavigate} />

      {/* Section 1: Hero with Earth background video, Dancing Script & Instrument Serif typography */}
      <Hero onExplore={() => handleNavigate('signal')} />

      {/* Section 2: The Signal & Deep Learning Research Visualizations */}
      <SignalSection />

      {/* Section 3: The Quote Section with Lerp Parallax & Sky Atmospheric Gradient */}
      <QuoteSection />
    </div>
  );
}
