import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { SignalSection } from './components/SignalSection';
import { QuoteSection } from './components/QuoteSection';
import { Dashboard } from './pages/Dashboard/Dashboard';

export default function App() {
  const isDashboardRoute = () => {
    return (
      window.location.pathname.startsWith('/dashboard') ||
      window.location.hash === '#dashboard'
    );
  };

  const [currentView, setCurrentView] = useState<'landing' | 'dashboard'>(() =>
    isDashboardRoute() ? 'dashboard' : 'landing'
  );

  // Sync browser navigation (Back/Forward buttons, hash & popstate)
  useEffect(() => {
    const handleLocationChange = () => {
      if (isDashboardRoute()) {
        setCurrentView('dashboard');
      } else {
        setCurrentView('landing');
      }
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  const handleNavigate = (sectionId: string) => {
    if (sectionId === 'dashboard') {
      handleOpenDashboard();
      return;
    }

    if (currentView === 'dashboard') {
      handleBackToLanding();
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      return;
    }

    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleOpenDashboard = () => {
    setCurrentView('dashboard');
    if (window.location.pathname !== '/dashboard') {
      window.history.pushState(null, '', '/dashboard');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToLanding = () => {
    setCurrentView('landing');
    if (window.location.pathname !== '/') {
      window.history.pushState(null, '', '/');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (currentView === 'dashboard') {
    return <Dashboard onBackToLanding={handleBackToLanding} />;
  }

  return (
    <div className="bg-[#0a0608] min-h-screen text-white relative selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Fixed Navbar with responsive mobile menu & Dancing Script logo */}
      <Navbar onNavigate={handleNavigate} onOpenDashboard={handleOpenDashboard} />

      {/* Section 1: Hero with Earth background video, Dancing Script & Instrument Serif typography */}
      <Hero
        onExplore={() => handleNavigate('signal')}
        onOpenDashboard={handleOpenDashboard}
      />

      {/* Section 2: The Signal & Deep Learning Research Visualizations */}
      <SignalSection />

      {/* Section 3: The Quote Section with Lerp Parallax & Sky Atmospheric Gradient */}
      <QuoteSection onOpenDashboard={handleOpenDashboard} />
    </div>
  );
}
