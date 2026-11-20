import { useEffect, useState } from 'react';
import gsap from 'gsap';
import { useTranslation } from 'react-i18next';

interface PreloaderProps {
  onComplete: () => void;
}

export function Preloader({ onComplete }: PreloaderProps) {
  const { t } = useTranslation();
  const [progress, setProgress] = useState(0);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      setProgress(100);
      setHidden(true);
      onComplete();
      return;
    }

    const state = { val: 0 };
    const tween = gsap.to(state, {
      val: 100,
      duration: 1.15,
      ease: 'power2.inOut',
      onUpdate: () => {
        setProgress(Math.round(state.val));
      },
      onComplete: () => {
        setHidden(true);
        onComplete();
      },
    });

    return () => {
      tween.kill();
    };
  }, [onComplete]);

  const liquidY = 120 - (progress / 100) * 124;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={t('preloaderLabel')}
      className={`fixed inset-0 z-[9000] flex flex-col items-center justify-center gap-5 bg-[#05121F] transition-all duration-700 ease-out ${
        hidden ? 'opacity-0 invisible pointer-events-none' : 'opacity-100 visible'
      }`}
    >
      <div
        className="w-24 h-30 relative"
        style={{ filter: 'drop-shadow(0 0 28px rgba(34, 211, 238, 0.32))' }}
        aria-hidden="true"
      >
        <svg viewBox="0 0 100 125" width="96" height="120">
          <defs>
            <clipPath id="aquamindDropClip">
              <path d="M50 6 C50 6 12 52 12 80 C12 102 29 119 50 119 C71 119 88 102 88 80 C88 52 50 6 50 6 Z" />
            </clipPath>
            <linearGradient id="aquamindWaterGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#22D3EE" />
              <stop offset="60%" stopColor="#2DD4BF" />
              <stop offset="100%" stopColor="#0EA5E9" />
            </linearGradient>
          </defs>
          <path
            d="M50 6 C50 6 12 52 12 80 C12 102 29 119 50 119 C71 119 88 102 88 80 C88 52 50 6 50 6 Z"
            fill="rgba(34, 211, 238, 0.06)"
            stroke="rgba(34, 211, 238, 0.45)"
            strokeWidth="2"
          />
          <g clipPath="url(#aquamindDropClip)">
            <g transform={`translate(0, ${liquidY.toFixed(1)})`}>
              <path
                className="preloader-wave"
                d="M0 10 Q 25 0, 50 10 T 100 10 T 150 10 T 200 10 L 200 140 L 0 140 Z"
                fill="url(#aquamindWaterGrad)"
              />
            </g>
          </g>
          <path
            d="M32 68 C28 80 31 94 38 101"
            fill="none"
            stroke="rgba(255,255,255,0.45)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>
      </div>
      <div className="font-mono-tabular text-2xl font-semibold tracking-wider text-[#22D3EE]">
        {progress} %
      </div>
      <div className="text-xs tracking-[0.18em] text-slate-400">{t('preloaderLabel')}</div>
    </div>
  );
}
