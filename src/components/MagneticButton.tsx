import React, { useRef } from 'react';

interface MagneticButtonProps {
  href?: string;
  onClick?: (e: React.MouseEvent<HTMLElement>) => void;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'glass' | 'nav';
  className?: string;
  children: React.ReactNode;
  ariaLabel?: string;
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
    if (!el || !enableRipple || isReducedMotion) return;
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
    if (!el || isReducedMotion || isTouch) return;
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
    spawnRipple(e.clientX, e.clientY);
    onClick?.(e);
  };

  const baseClasses =
    'relative inline-flex items-center justify-center gap-2.5 overflow-hidden rounded-full font-display font-semibold whitespace-nowrap shrink-0 transition-[box-shadow,background-color,border-color,color] duration-200 cursor-pointer will-change-transform';

  const variantClasses =
    variant === 'primary'
      ? 'px-7 py-4 text-[0.96rem] bg-gradient-to-br from-[#22D3EE] to-[#2DD4BF] text-[#05121F] shadow-[0_10px_30px_rgba(34,211,238,0.28)] hover:shadow-[0_14px_42px_rgba(34,211,238,0.48)]'
      : variant === 'nav'
      ? 'px-5 py-2.5 text-sm bg-[#22D3EE]/14 border border-[#22D3EE]/38 text-[#22D3EE] hover:bg-[#22D3EE] hover:text-[#05121F] hover:shadow-[0_0_24px_rgba(34,211,238,0.45)]'
      : 'px-7 py-4 text-[0.96rem] bg-[#091C30]/80 border border-[#22D3EE]/30 text-slate-100 hover:border-[#22D3EE] hover:bg-[#22D3EE]/12';

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
