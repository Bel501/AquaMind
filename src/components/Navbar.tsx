import { useState } from 'react';
import { Menu, Moon, Sun, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { SupportedLocale } from '../i18n';
import { AquaMindLogo } from './AquaMindLogo';
import { MagneticButton } from './MagneticButton';

interface NavbarProps {
  hidden: boolean;
  theme: 'dark' | 'light';
  locale: SupportedLocale;
  onToggleTheme: () => void;
  onChangeLocale: (next: SupportedLocale) => void;
  onNavigate: (targetId: string) => void;
}

const LOCALES: Array<{ code: SupportedLocale; label: string }> = [
  { code: 'fr', label: 'FR' },
  { code: 'en', label: 'EN' },
  { code: 'ar', label: 'ع' },
];

export function Navbar({
  hidden,
  theme,
  locale,
  onToggleTheme,
  onChangeLocale,
  onNavigate,
}: NavbarProps) {
  const { t } = useTranslation();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const navLinks = [
    { href: '#problem', label: t('nav.problem') },
    { href: '#architecture', label: t('nav.how') },
    { href: '#dashboard-demo', label: t('nav.dashboard') },
    { href: '#assistant', label: t('nav.assistant') },
    { href: '#sectors', label: t('nav.sectors') },
  ];

  const handleLinkClick = (e: React.MouseEvent<HTMLElement>, href: string) => {
    e.preventDefault();
    setDrawerOpen(false);
    onNavigate(href);
  };

  return (
    <header>
      <nav
        aria-label="Navigation principale"
        className={`fixed top-3.5 left-1/2 -translate-x-1/2 z-[1100] w-[min(calc(100%-24px),1260px)] h-16 px-4 sm:px-6 flex items-center justify-between gap-4 lg:gap-8 rounded-full bg-white/92 dark:bg-[#061524]/90 border border-sky-700/18 dark:border-[#22D3EE]/18 shadow-[0_14px_38px_rgba(8,47,78,0.1)] dark:shadow-[0_16px_42px_rgba(0,0,0,0.45)] transition-transform duration-300 ease-out ${
          hidden ? '-translate-y-28' : 'translate-y-0'
        }`}
      >
        {/* Zone 1: Brand Wordmark */}
        <a
          href="#hero"
          onClick={(e) => handleLinkClick(e, '#hero')}
          className="inline-flex items-center gap-2.5 font-display font-bold text-lg tracking-tight text-[#082F4E] dark:text-slate-100 whitespace-nowrap shrink-0"
          aria-label="AquaMind"
        >
          <AquaMindLogo size={26} />
          <span>
            <span className="text-[#082F4E] dark:text-white">Aqua</span>
            <span className="text-[#0284C7] dark:text-[#22D3EE]">Mind</span>
          </span>
        </a>

        {/* Zone 2: 5 concise single-line links */}
        <ul className="hidden xl:flex items-center gap-6 list-none m-0 p-0">
          {navLinks.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                onClick={(e) => handleLinkClick(e, link.href)}
                className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-cyan-700 dark:hover:text-white transition-colors duration-200 whitespace-nowrap shrink-0 py-1 border-b border-transparent hover:border-cyan-600 dark:hover:border-[#22D3EE]/70"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        {/* Zone 3: Language selector, Theme toggle & Primary CTA */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          <div
            role="group"
            aria-label="Langue"
            className="hidden sm:flex items-center rounded-full p-0.5 bg-slate-100 dark:bg-[#05121F]/80 border border-slate-200 dark:border-white/10"
          >
            {LOCALES.map((loc) => (
              <button
                key={loc.code}
                type="button"
                onClick={() => onChangeLocale(loc.code)}
                aria-pressed={locale === loc.code}
                className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                  locale === loc.code
                    ? 'bg-cyan-600 dark:bg-[#22D3EE] text-white dark:text-[#05121F]'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                {loc.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={theme === 'dark' ? t('nav.themeLight') : t('nav.themeDark')}
            className="w-9 h-9 rounded-full border border-slate-200 dark:border-white/12 bg-slate-100 dark:bg-[#081C30]/80 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:border-cyan-600 dark:hover:border-[#22D3EE] transition-colors cursor-pointer shrink-0"
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          <div className="hidden lg:block">
            <MagneticButton
              href="#contact"
              variant="nav"
              onClick={(e) => handleLinkClick(e, '#contact')}
            >
              {t('nav.cta')}
            </MagneticButton>
          </div>

          <button
            type="button"
            onClick={() => setDrawerOpen((prev) => !prev)}
            aria-label={drawerOpen ? t('nav.closeMenu') : t('nav.openMenu')}
            aria-expanded={drawerOpen}
            className="xl:hidden w-10 h-10 rounded-full border border-slate-200 dark:border-[#22D3EE]/25 bg-slate-100 dark:bg-[#081C30]/80 flex items-center justify-center text-slate-800 dark:text-slate-100 hover:border-cyan-600 dark:hover:border-[#22D3EE] transition-colors shrink-0"
          >
            {drawerOpen ? <X size={19} /> : <Menu size={19} />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer */}
      <div
        aria-hidden={!drawerOpen}
        className={`fixed inset-0 z-[1050] bg-slate-50/96 dark:bg-[#05121F]/96 flex flex-col items-center justify-center gap-6 transition-all duration-300 xl:hidden ${
          drawerOpen
            ? 'opacity-100 visible pointer-events-auto'
            : 'opacity-0 invisible pointer-events-none'
        }`}
      >
        {navLinks.map((link) => (
          <a
            key={link.href}
            href={link.href}
            onClick={(e) => handleLinkClick(e, link.href)}
            className="font-display text-2xl font-semibold text-slate-900 dark:text-slate-100 hover:text-cyan-600 dark:hover:text-[#22D3EE] transition-colors"
          >
            {link.label}
          </a>
        ))}

        <div className="flex items-center gap-2 pt-2">
          {LOCALES.map((loc) => (
            <button
              key={loc.code}
              type="button"
              onClick={() => onChangeLocale(loc.code)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border cursor-pointer ${
                locale === loc.code
                  ? 'bg-cyan-600 dark:bg-[#22D3EE] text-white dark:text-[#05121F] border-transparent'
                  : 'border-slate-300 dark:border-white/15 text-slate-700 dark:text-slate-300'
              }`}
            >
              {loc.label}
            </button>
          ))}
        </div>

        <div className="pt-2">
          <MagneticButton
            href="#contact"
            variant="primary"
            onClick={(e) => handleLinkClick(e, '#contact')}
          >
            {t('nav.cta')}
          </MagneticButton>
        </div>
      </div>
    </header>
  );
}
