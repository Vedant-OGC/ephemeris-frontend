import React, { useState, useEffect } from 'react';
import { LayoutDashboard } from 'lucide-react';

interface NavbarProps {
  onNavigate?: (sectionId: string) => void;
  onOpenDashboard?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigate, onOpenDashboard }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'About', href: '#about' },
    { label: 'Signal', href: '#signal' },
    { label: 'Architecture', href: '#architecture' },
    { label: 'Forecast', href: '#contact' },
  ];

  const handleLinkClick = (href: string) => {
    setIsOpen(false);
    if (onNavigate) {
      onNavigate(href.replace('#', ''));
    } else {
      const el = document.querySelector(href);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleDashboardClick = () => {
    setIsOpen(false);
    if (onOpenDashboard) {
      onOpenDashboard();
    } else {
      window.location.pathname = '/dashboard';
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 px-6 md:px-12 py-5 flex items-center justify-between ${
        scrolled
          ? 'bg-[#0a0608]/85 backdrop-blur-md border-b border-white/10 shadow-2xl'
          : 'bg-transparent'
      }`}
    >
      {/* Left Brand */}
      <div className="flex items-center space-x-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
        <span className="font-dancing text-white text-2xl md:text-3xl font-semibold tracking-wide select-none drop-shadow-md">
          Ephemeris
        </span>
        <span className="hidden sm:inline-block text-[10px] font-mono tracking-widest text-emerald-400/80 uppercase px-2 py-0.5 rounded border border-emerald-500/30 bg-emerald-950/20">
          NAVIC TRANSFER ENGINE
        </span>
      </div>

      {/* Center Desktop Links */}
      <div className="hidden md:flex items-center gap-12">
        {navLinks.map((link) => (
          <a
            key={link.label}
            href={link.href}
            onClick={(e) => {
              e.preventDefault();
              handleLinkClick(link.href);
            }}
            className="text-white/80 hover:text-white text-sm tracking-wide transition-colors duration-200 font-inter relative group"
          >
            {link.label}
            <span className="absolute -bottom-1 left-0 w-0 h-[1.5px] bg-white/60 transition-all duration-300 group-hover:w-full" />
          </a>
        ))}
      </div>

      {/* Right Desktop CTA - Launch Dashboard Button */}
      <div className="hidden md:flex items-center gap-4">
        <button
          onClick={handleDashboardClick}
          className="bg-white text-black px-7 py-3 rounded-full font-mono font-semibold text-xs tracking-wider hover:bg-white/90 transition-all duration-300 button-glow active:scale-95 cursor-pointer flex items-center gap-2"
        >
          <LayoutDashboard className="w-3.5 h-3.5" />
          <span>Dashboard</span>
        </button>
      </div>

      {/* Mobile Hamburger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden relative w-10 h-10 flex flex-col justify-center items-center z-50 focus:outline-none"
        aria-label="Toggle navigation menu"
      >
        <div className="w-6 h-5 flex flex-col justify-between items-center relative">
          <span
            className={`w-6 h-[2px] bg-white rounded-full transition-transform duration-300`}
            style={{
              transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
              transform: isOpen ? 'translateY(9px) rotate(45deg)' : 'none',
            }}
          />
          <span
            className={`w-6 h-[2px] bg-white rounded-full transition-all duration-300`}
            style={{
              transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
              opacity: isOpen ? 0 : 1,
              transform: isOpen ? 'scale(0)' : 'scale(1)',
            }}
          />
          <span
            className={`w-6 h-[2px] bg-white rounded-full transition-transform duration-300`}
            style={{
              transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
              transform: isOpen ? 'translateY(-9px) rotate(-45deg)' : 'none',
            }}
          />
        </div>
      </button>

      {/* Backdrop overlay for mobile menu */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile Slide-in Menu */}
      <div
        className={`fixed top-0 right-0 bottom-0 w-[85%] max-w-[340px] bg-[#0a0608]/95 backdrop-blur-xl border-l border-white/10 z-40 md:hidden flex flex-col justify-between p-8 pt-24 shadow-2xl transition-transform duration-500`}
        style={{
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      >
        <div className="flex flex-col space-y-6">
          <div className="text-xs font-mono tracking-widest text-white/40 uppercase mb-2">
            Navigation / Telemetry
          </div>
          {navLinks.map((link, idx) => (
            <a
              key={link.label}
              href={link.href}
              onClick={(e) => {
                e.preventDefault();
                handleLinkClick(link.href);
              }}
              style={{
                transitionDelay: `${150 + idx * 75}ms`,
                opacity: isOpen ? 1 : 0,
                transform: isOpen ? 'translateX(0)' : 'translateX(20px)',
              }}
              className="text-xl font-instrument text-white/90 hover:text-white transition-all duration-300 py-1"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div
          style={{
            transitionDelay: '450ms',
            opacity: isOpen ? 1 : 0,
            transform: isOpen ? 'translateY(0)' : 'translateY(20px)',
          }}
          className="transition-all duration-300 pt-6 border-t border-white/10"
        >
          <button
            onClick={handleDashboardClick}
            className="w-full bg-white text-black px-6 py-3.5 rounded-full font-mono font-semibold text-xs tracking-wider hover:bg-white/90 transition-all duration-300 button-glow text-center flex items-center justify-center gap-2 cursor-pointer"
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Launch Dashboard</span>
          </button>
          <div className="mt-4 text-center text-xs font-mono text-white/40">
            EPHEMERIS &bull; NavIC Deep Engine
          </div>
        </div>
      </div>
    </nav>
  );
};
