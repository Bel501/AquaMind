import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { MagneticButton } from './MagneticButton';

interface NavbarProps {
  hidden: boolean;
  onNavigate: (targetId: string) => void;
}

const NAV_LINKS = [
  { href: '#problem', label: 'Enjeux' },
  { href: '#how-it-works', label: 'Fonctionnement' },
  { href: '#features', label: 'Capacités' },
  { href: '#dashboard-demo', label: 'Plateforme' },
  { href: '#sectors', label: 'Secteurs' },
];

export function Navbar({ hidden, onNavigate }: NavbarProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleLinkClick = (e: React.MouseEvent<HTMLElement>, href: string) => {
    e.preventDefault();
    setDrawerOpen(false);
    onNavigate(href);
  };

  return (
    <header>
      <nav
        aria-label="Navigation principale"
        className={`fixed top-3.5 left-1/2 -translate-x-1/2 z-[1100] w-[min(calc(100%-28px),1240px)] h-16 px-5 md:px-6 flex items-center justify-between gap-8 rounded-full bg-[#061524]/88 border border-[#22D3EE]/18 shadow-[0_16px_42px_rgba(0,0,0,0.42)] transition-transform duration-300 ease-out ${
          hidden ? '-translate-y-28' : 'translate-y-0'
        }`}
      >
        {/* Zone 1: Single-line Brand Wordmark */}
        <a
          href="#hero"
          onClick={(e) => handleLinkClick(e, '#hero')}
          className="inline-flex items-center gap-2.5 font-display font-bold text-lg tracking-tight text-slate-100 whitespace-nowrap shrink-0"
          aria-label="AquaMind Accueil"
        >
          <svg viewBox="0 0 32 32" width="24" height="24" aria-hidden="true">
            <defs>
              <linearGradient id="aquamindNavLogo" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#22D3EE" />
                <stop offset="100%" stopColor="#A3E635" />
              </linearGradient>
            </defs>
            <path
              d="M16 3 C16 3 6 14.5 6 21 C6 26.5 10.5 30 16 30 C21.5 30 26 26.5 26 21 C26 14.5 16 3 16 3 Z"
              fill="none"
              stroke="url(#aquamindNavLogo)"
              strokeWidth="2.2"
            />
            <circle cx="16" cy="21" r="3.4" fill="#22D3EE" />
          </svg>
          <span>AquaMind</span>
        </a>

        {/* Zone 2: Clean single-line text navigation links */}
        <ul className="hidden lg:flex items-center gap-7 list-none m-0 p-0">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                onClick={(e) => handleLinkClick(e, link.href)}
                className="text-sm font-medium text-slate-300 hover:text-white transition-colors duration-200 whitespace-nowrap shrink-0 py-1 border-b border-transparent hover:border-[#22D3EE]/70"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        {/* Zone 3: Primary CTA & Mobile Trigger */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden lg:block">
            <MagneticButton
              href="#contact"
              variant="nav"
              onClick={(e) => handleLinkClick(e, '#contact')}
            >
              Demander une démo
            </MagneticButton>
          </div>

          <button
            type="button"
            onClick={() => setDrawerOpen((prev) => !prev)}
            aria-label={drawerOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            aria-expanded={drawerOpen}
            className="lg:hidden w-11 h-11 rounded-full border border-[#22D3EE]/25 bg-[#081C30]/80 flex items-center justify-center text-slate-100 hover:border-[#22D3EE] transition-colors"
          >
            {drawerOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer */}
      <div
        aria-hidden={!drawerOpen}
        className={`fixed inset-0 z-[1050] bg-[#05121F]/96 flex flex-col items-center justify-center gap-7 transition-all duration-300 lg:hidden ${
          drawerOpen
            ? 'opacity-100 visible pointer-events-auto'
            : 'opacity-0 invisible pointer-events-none'
        }`}
      >
        {NAV_LINKS.map((link) => (
          <a
            key={link.href}
            href={link.href}
            onClick={(e) => handleLinkClick(e, link.href)}
            className="font-display text-2xl font-semibold text-slate-100 hover:text-[#22D3EE] transition-colors"
          >
            {link.label}
          </a>
        ))}
        <div className="pt-2">
          <MagneticButton
            href="#contact"
            variant="primary"
            onClick={(e) => handleLinkClick(e, '#contact')}
          >
            Demander une démo
          </MagneticButton>
        </div>
      </div>
    </header>
  );
}
