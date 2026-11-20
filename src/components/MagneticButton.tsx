import React, { useRef } from 'react';

interface MagneticButtonProps {
  href?: string;
  onClick?: (e: React.MouseEvent<HTMLElement>) => void;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'glass' | 'nav';
  className?: string;
  children: React.ReactNode;
  ariaLabel?: string;
  disabled?: boolean;
  enableRipple?: boolean;
}

export function MagneticButton({
  href,
  onClick,
  type = 'button',
  variant = 'primary',
  className = '',
  children,
  ariaLabel,
  disabled = false,
  enableRipple = true,
}: MagneticButtonProps) {
  const elRef = useRef<HTMLAnchorElement | HTMLButtonElement | null>(null);

  const isReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch =
    typeof window !== 'undefined' &&
    window.matchMedia('(hover: none), (pointer: coarse)').matches;

  const spawnRipple = (clientX: number, clientY: number) => {
    const el = elRef.current;
    if (!el || !enableRipple || isReducedMotion || disabled) return;
    const rect = el.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 0.65;
    const ripple = document.createElement('span');
    ripple.className = 'btn-ripple';
    ripple.style.width = `${size}px`;
    ripple.style.height = `${size}px`;
    ripple.style.left = `${clientX - rect.left}px`;
    ripple.style.top = `${clientY - rect.top}px`;
    el.appendChild(ripple);
    window.setTimeout(() => ripple.remove(), 860);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const el = elRef.current;
    if (!el || isReducedMotion || isTouch || disabled) return;
    const rect = el.getBoundingClientRect();
    const dx = (e.clientX - (rect.left + rect.width / 2)) * 0.24;
    const dy = (e.clientY - (rect.top + rect.height / 2)) * 0.24;
    el.style.transform = `translate3d(${dx}px, ${dy}px, 0)`;
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLElement>) => {
    spawnRipple(e.clientX, e.clientY);
  };

  const handleMouseLeave = () => {
    const el = elRef.current;
    if (!el) return;
    el.style.transform = 'translate3d(0, 0, 0)';
  };

  const handleClick = (e: React.MouseEvent<HTMLElement>) => {
    if (disabled) return;
    spawnRipple(e.clientX, e.clientY);
    onClick?.(e);
  };

  const baseClasses =
    'relative inline-flex items-center justify-center gap-2.5 overflow-hidden rounded-full font-display font-semibold whitespace-nowrap shrink-0 transition-[box-shadow,background-color,border-color,color] duration-200 cursor-pointer will-change-transform disabled:opacity-60 disabled:cursor-not-allowed';

  const variantClasses =
    variant === 'primary'
      ? 'px-7 py-3.5 text-[0.95rem] bg-gradient-to-br from-[#0891B2] to-[#0D9488] dark:from-[#22D3EE] dark:to-[#2DD4BF] text-white dark:text-[#05121F] shadow-[0_10px_28px_rgba(8,145,178,0.28)] dark:shadow-[0_10px_30px_rgba(34,211,238,0.28)] hover:shadow-[0_14px_40px_rgba(34,211,238,0.45)]'
      : variant === 'nav'
      ? 'px-4 py-2 text-xs sm:text-sm bg-cyan-600/12 dark:bg-[#22D3EE]/14 border border-cyan-600/35 dark:border-[#22D3EE]/38 text-cyan-800 dark:text-[#22D3EE] hover:bg-cyan-600 dark:hover:bg-[#22D3EE] hover:text-white dark:hover:text-[#05121F]'
      : 'px-7 py-3.5 text-[0.95rem] bg-white/85 dark:bg-[#091C30]/80 border border-cyan-700/25 dark:border-[#22D3EE]/30 text-slate-900 dark:text-slate-100 hover:border-cyan-600 dark:hover:border-[#22D3EE] hover:bg-cyan-50/90 dark:hover:bg-[#22D3EE]/12';

  const combined = `${baseClasses} ${variantClasses} ${className}`;

  if (href) {
    return (
      <a
        ref={elRef as React.RefObject<HTMLAnchorElement>}
        href={href}
        aria-label={ariaLabel}
        className={combined}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
      >
        <span className="relative z-10 inline-flex items-center gap-2.5 pointer-events-none">
          {children}
        </span>
      </a>
    );
  }

  return (
    <button
      ref={elRef as React.RefObject<HTMLButtonElement>}
      type={type}
      disabled={disabled}
      aria-label={ariaLabel}
      className={combined}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      <span className="relative z-10 inline-flex items-center gap-2.5 pointer-events-none">
        {children}
      </span>
    </button>
  );
}
