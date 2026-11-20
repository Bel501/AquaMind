import { useEffect, useRef, useState } from 'react';

export function WaterCursor() {
  const ringRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isCoarse = window.matchMedia('(hover: none), (pointer: coarse)').matches;
    if (prefersReduced || isCoarse) return;

    setEnabled(true);

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ringX = mouseX;
    let ringY = mouseY;
    let rafId = 0;

    const ring = ringRef.current;
    const dot = dotRef.current;

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (ring) ring.style.opacity = '1';
      if (dot) {
        dot.style.opacity = '1';
        dot.style.left = `${mouseX}px`;
        dot.style.top = `${mouseY}px`;
      }

      const target = e.target as HTMLElement | null;
      const isInteractive = Boolean(
        target?.closest('a, button, input, select, [data-interactive="true"]')
      );
      if (ring) {
        ring.style.width = isInteractive ? '58px' : '36px';
        ring.style.height = isInteractive ? '58px' : '36px';
        ring.style.borderColor = isInteractive
          ? 'rgba(45, 212, 191, 0.92)'
          : 'rgba(34, 211, 238, 0.72)';
        ring.style.background = isInteractive
          ? 'radial-gradient(circle, rgba(45, 212, 191, 0.22) 0%, rgba(34, 211, 238, 0.04) 70%)'
          : 'radial-gradient(circle, rgba(34, 211, 238, 0.14) 0%, transparent 70%)';
      }
      if (dot) {
        dot.style.transform = isInteractive
          ? 'translate(-50%, -50%) scale(0.55)'
          : 'translate(-50%, -50%) scale(1)';
      }
    };

    const onMouseLeave = () => {
      if (ring) ring.style.opacity = '0';
      if (dot) dot.style.opacity = '0';
    };

    const animate = () => {
      ringX += (mouseX - ringX) * 0.16;
      ringY += (mouseY - ringY) * 0.16;
      if (ring) {
        ring.style.left = `${ringX}px`;
        ring.style.top = `${ringY}px`;
      }
      rafId = requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    document.addEventListener('mouseleave', onMouseLeave);
    rafId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseleave', onMouseLeave);
    };
  }, []);

  if (!enabled) return null;

  return (
    <>
      <div
        ref={ringRef}
        aria-hidden="true"
        className="fixed top-0 left-0 z-[8500] w-9 h-9 rounded-full border-[1.5px] pointer-events-none opacity-0 -translate-x-1/2 -translate-y-1/2 transition-[width,height,border-color,background,opacity] duration-200 ease-out"
      />
      <div
        ref={dotRef}
        aria-hidden="true"
        className="fixed top-0 left-0 z-[8501] w-1.5 h-1.5 rounded-full bg-[#22D3EE] shadow-[0_0_10px_#22D3EE] pointer-events-none opacity-0 -translate-x-1/2 -translate-y-1/2 transition-[opacity,transform] duration-200 ease-out"
      />
    </>
  );
}
