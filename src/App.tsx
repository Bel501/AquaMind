import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { ArrowRight, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { SupportedLocale } from './i18n';
import { Preloader } from './components/Preloader';
import { WaterCursor } from './components/WaterCursor';
import { Navbar } from './components/Navbar';
import { WaterCanvas3D, type SceneTargets } from './components/WaterCanvas3D';
import { MagneticButton } from './components/MagneticButton';
import { TiltFeatureCards } from './components/TiltFeatureCards';
import { DashboardDemo, type DashMode } from './components/DashboardDemo';
import { SectorCards } from './components/SectorCards';
import { AquaMindAssistant } from './components/AquaMindAssistant';
import { TestimonialsSlider } from './components/TestimonialsSlider';
import { DemoForm } from './components/DemoForm';

gsap.registerPlugin(ScrollTrigger);

export default function App() {
  const { t, i18n } = useTranslation();

  const [preloaded, setPreloaded] = useState(false);
  const [threeEnabled, setThreeEnabled] = useState(false);
  const [navHidden, setNavHidden] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [locale, setLocale] = useState<SupportedLocale>('fr');
  const [dashMode, setDashMode] = useState<DashMode>('agri');
  const [leakSimulated, setLeakSimulated] = useState(false);
  const [howStepIndex, setHowStepIndex] = useState('01');

  const mainRef = useRef<HTMLElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const howTrackRef = useRef<HTMLDivElement>(null);
  const howFillRef = useRef<HTMLDivElement>(null);
  const lenisRef = useRef<Lenis | null>(null);
  const lastScrollYRef = useRef(0);

  const sceneTargetsRef = useRef<SceneTargets>({
    hero: 1,
    data: 0,
    prediction: 0,
    leaks: 0,
    optimal: 0,
    waves: 0,
    camX: 0,
    camY: 0.2,
    camZ: 7.2,
  });

  const heroTitle = t('hero.title');
  const heroWords = useMemo(() => heroTitle.split(' '), [heroTitle]);

  const howSteps = t('how.steps', { returnObjects: true }) as Array<{
    index: string;
    kicker: string;
    title: string;
    description: string;
    meta: string;
  }>;

  const resultsItems = t('results.items', { returnObjects: true }) as Array<{
    prefix: string;
    target: number;
    suffix: string;
    desc: string;
  }>;

  const contactPerks = t('contact.perks', { returnObjects: true }) as string[];

  // Sync theme class on <html>
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  // Sync language & RTL direction on <html>
  const handleChangeLocale = useCallback(
    (next: SupportedLocale) => {
      setLocale(next);
      void i18n.changeLanguage(next);
      document.documentElement.lang = next;
      document.documentElement.dir = next === 'ar' ? 'rtl' : 'ltr';
      ScrollTrigger.refresh();
    },
    [i18n]
  );

  const handleToggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  const handlePreloaderComplete = useCallback(() => {
    setPreloaded(true);
    if (typeof window.requestIdleCallback === 'function') {
      window.requestIdleCallback(() => setThreeEnabled(true), { timeout: 220 });
    } else {
      globalThis.setTimeout(() => setThreeEnabled(true), 50);
    }
  }, []);

  const scrollToTarget = useCallback((selector: string) => {
    const el = document.querySelector(selector);
    if (!el) return;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (lenisRef.current) {
      lenisRef.current.scrollTo(el as HTMLElement, { offset: -20 });
    } else {
      el.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth' });
    }
  }, []);

  const handleInspectSector = useCallback(
    (mode: DashMode) => {
      setDashMode(mode);
      scrollToTarget('#dashboard-demo');
    },
    [scrollToTarget]
  );

  // Smooth scrolling (Lenis) + scroll progress + navbar auto-hide
  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobile =
      window.matchMedia('(max-width: 767px)').matches ||
      (navigator.maxTouchPoints > 0 && window.innerWidth < 900);

    const updateScrollUI = (scrollY: number) => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = maxScroll > 0 ? Math.min(Math.max(scrollY / maxScroll, 0), 1) : 0;
      if (progressRef.current) {
        progressRef.current.style.transform = `scaleX(${ratio})`;
      }

      if (scrollY > 120 && scrollY > lastScrollYRef.current + 4) {
        setNavHidden(true);
      } else if (scrollY < lastScrollYRef.current - 4 || scrollY <= 120) {
        setNavHidden(false);
      }
      lastScrollYRef.current = scrollY;
    };

    if (!prefersReduced && !isMobile) {
      const lenis = new Lenis({
        lerp: 0.08,
        smoothWheel: true,
        wheelMultiplier: 0.95,
      });
      lenisRef.current = lenis;

      lenis.on('scroll', ({ scroll }: { scroll: number }) => {
        ScrollTrigger.update();
        updateScrollUI(scroll);
      });

      const onTick = (time: number) => {
        lenis.raf(time * 1000);
      };
      gsap.ticker.add(onTick);
      gsap.ticker.lagSmoothing(0);

      return () => {
        gsap.ticker.remove(onTick);
        lenis.destroy();
        lenisRef.current = null;
      };
    } else {
      const onNativeScroll = () => updateScrollUI(window.scrollY);
      window.addEventListener('scroll', onNativeScroll, { passive: true });
      return () => window.removeEventListener('scroll', onNativeScroll);
    }
  }, []);

  // Hero entrance animation after preloader
  useEffect(() => {
    if (!preloaded) return;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const chars = document.querySelectorAll('.hero-char');
    const fades = document.querySelectorAll('.hero-fade');

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      tl.fromTo(
        chars,
        { y: 40, opacity: 0, rotateX: -30 },
        { y: 0, opacity: 1, rotateX: 0, duration: 0.65, stagger: locale === 'ar' ? 0.08 : 0.022 }
      ).fromTo(
        fades,
        { y: 24, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.65, stagger: 0.1 },
        '-=0.34'
      );
    });

    return () => ctx.revert();
  }, [preloaded, locale]);

  // GSAP ScrollTrigger animations (Counters, Reveals, Horizontal Pin, 3D Scene Scrub)
  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const main = mainRef.current;
    if (!main) return;

    if (prefersReduced) {
      document.querySelectorAll<HTMLElement>('.counter').forEach((el) => {
        el.textContent = `${el.dataset.prefix || ''}${el.dataset.target || '0'}${el.dataset.suffix || ''}`;
      });
      return;
    }

    const ctx = gsap.context(() => {
      gsap.from('.reveal-line', {
        yPercent: 110,
        opacity: 0,
        duration: 0.85,
        stagger: 0.15,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '#problem',
          start: 'top 78%',
          once: true,
        },
      });

      gsap.utils.toArray<HTMLElement>('.stagger-group').forEach((group) => {
        const items = group.querySelectorAll('.stagger-item');
        gsap.from(items, {
          y: 34,
          opacity: 0,
          duration: 0.72,
          stagger: 0.11,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: group,
            start: 'top 82%',
            once: true,
          },
        });
      });

      gsap.utils.toArray<HTMLElement>('.counter').forEach((el) => {
        const target = parseFloat(el.dataset.target || '0');
        const prefix = el.dataset.prefix || '';
        const suffix = el.dataset.suffix || '';
        const obj = { val: 0 };

        gsap.to(obj, {
          val: target,
          duration: 1.5,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 86%',
            once: true,
          },
          onUpdate: () => {
            el.textContent = `${prefix}${Math.round(obj.val)}${suffix}`;
          },
        });
      });

      // Horizontal pinned 3-step showcase (Desktop LTR)
      const mm = gsap.matchMedia();
      mm.add('(min-width: 901px)', () => {
        const track = howTrackRef.current;
        const fill = howFillRef.current;
        if (!track || !track.parentElement) return;

        const dirMultiplier = document.documentElement.dir === 'rtl' ? 1 : -1;
        const getScrollDist = () =>
          Math.max(track.scrollWidth - track.parentElement!.offsetWidth, 380);

        gsap.to(track, {
          x: () => dirMultiplier * getScrollDist(),
          ease: 'none',
          scrollTrigger: {
            trigger: '#how-it-works',
            start: 'top top',
            end: () => `+=${getScrollDist() + 420}`,
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              if (fill) {
                fill.style.transform = `scaleX(${Math.max(0.05, self.progress)})`;
              }
              const step = self.progress < 0.34 ? '01' : self.progress < 0.72 ? '02' : '03';
              setHowStepIndex(step);
            },
          },
        });
      });

      // Persistent 3D Scene choreography scrubbed smoothly across the page
      const targets = sceneTargetsRef.current;
      const masterTl = gsap.timeline({
        scrollTrigger: {
          trigger: main,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 1.1,
        },
      });

      masterTl
        .to(targets, {
          hero: 0,
          data: 1,
          camX: -0.55,
          camZ: 6.8,
          duration: 1.5,
          ease: 'power1.inOut',
        })
        .to(targets, {
          data: 0,
          prediction: 1,
          camX: 0.4,
          camY: 0.7,
          camZ: 6.4,
          duration: 1.8,
          ease: 'power1.inOut',
        })
        .to(targets, {
          prediction: 0,
          leaks: 1,
          camX: -0.3,
          camY: 0.1,
          camZ: 6.3,
          duration: 1.8,
          ease: 'power1.inOut',
        })
        .to(targets, {
          leaks: 0,
          optimal: 1,
          camX: 0,
          camY: 0.2,
          camZ: 8.2,
          duration: 1.8,
          ease: 'power1.inOut',
        })
        .to(targets, {
          optimal: 0.68,
          waves: 1,
          camY: 0.38,
          camZ: 8.6,
          duration: 1.4,
          ease: 'power1.inOut',
        });
    }, main);

    return () => ctx.revert();
  }, [locale]);

  return (
    <div className="relative min-h-screen bg-[#f2f8fc] dark:bg-[#05121F] text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <a
        href="#main-content"
        className="skip-link bg-[#22D3EE] text-[#05121F] font-display font-semibold px-5 py-3 rounded-full"
      >
        {t('skipLink')}
      </a>

      <Preloader onComplete={handlePreloaderComplete} />

      {/* Scroll Progress Bar */}
      <div
        className="fixed top-0 left-0 w-full h-[3px] z-[1200] bg-slate-900/5 dark:bg-white/5 pointer-events-none"
        aria-hidden="true"
      >
        <div
          ref={progressRef}
          className="w-full h-full origin-left scale-x-0 bg-gradient-to-r from-[#22D3EE] via-[#2DD4BF] to-[#A3E635] shadow-[0_0_12px_rgba(34,211,238,0.65)]"
        />
      </div>

      <WaterCursor />

      <WaterCanvas3D
        enabled={threeEnabled}
        theme={theme}
        leakSimulated={leakSimulated}
        targetsRef={sceneTargetsRef}
      />
      <div className="ambient-vignette fixed inset-0 z-[1] pointer-events-none" aria-hidden="true" />
      <div className="film-grain fixed inset-0 z-[1] pointer-events-none opacity-[0.035]" aria-hidden="true" />

      <Navbar
        hidden={navHidden}
        theme={theme}
        locale={locale}
        onToggleTheme={handleToggleTheme}
        onChangeLocale={handleChangeLocale}
        onNavigate={scrollToTarget}
      />

      <main id="main-content" ref={mainRef} className="relative z-[2]">
        {/* 1. HERO */}
        <section
          id="hero"
          className="min-h-[100svh] w-[min(calc(100%-36px),1240px)] mx-auto flex flex-col justify-center pt-28 pb-16 relative"
        >
          <div className="max-w-[820px]">
            <p className="text-xs sm:text-sm font-semibold tracking-[0.14em] text-cyan-700 dark:text-[#22D3EE] mb-5">
              {t('hero.kicker')}
            </p>

            <h1
              aria-label={heroTitle}
              className="font-display text-[clamp(2.75rem,7vw,5.8rem)] font-bold leading-[1.04] tracking-tight mb-7"
            >
              {locale === 'ar'
                ? heroWords.map((word, wIdx) => (
                    <span
                      key={`${word}-${wIdx}`}
                      aria-hidden="true"
                      className="hero-char inline-block me-[0.26em] will-change-transform"
                    >
                      {word}
                    </span>
                  ))
                : heroWords.map((word, wIdx) => (
                    <span key={`${word}-${wIdx}`} className="inline-block whitespace-nowrap me-[0.26em]">
                      {word.split('').map((ch, cIdx) => (
                        <span
                          key={`${wIdx}-${cIdx}`}
                          aria-hidden="true"
                          className="hero-char inline-block will-change-transform"
                        >
                          {ch}
                        </span>
                      ))}
                    </span>
                  ))}
            </h1>

            <p className="hero-fade text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-[54ch] mb-10 leading-relaxed">
              {t('hero.subtitle')}
            </p>

            <div className="hero-fade flex flex-wrap items-center gap-4">
              <MagneticButton
                href="#contact"
                variant="primary"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToTarget('#contact');
                }}
              >
                {t('hero.ctaPrimary')}
                <ArrowRight size={18} aria-hidden="true" />
              </MagneticButton>

              <MagneticButton
                href="#how-it-works"
                variant="glass"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToTarget('#how-it-works');
                }}
              >
                {t('hero.ctaSecondary')}
              </MagneticButton>
            </div>
          </div>

          <a
            href="#problem"
            onClick={(e) => {
              e.preventDefault();
              scrollToTarget('#problem');
            }}
            aria-label={t('hero.explore')}
            className="absolute bottom-7 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2.5 text-slate-500 dark:text-slate-400 hover:text-cyan-700 dark:hover:text-[#22D3EE] transition-colors text-[0.72rem] tracking-[0.18em]"
          >
            <span>{t('hero.explore')}</span>
            <span
              className="w-6 h-10 rounded-full border border-cyan-600/45 dark:border-[#22D3EE]/45 bg-white/60 dark:bg-[#05121F]/50 flex justify-center pt-1.5"
              aria-hidden="true"
            >
              <span className="scroll-drop-anim w-1.5 h-2.5 rounded-full bg-cyan-600 dark:bg-[#22D3EE]" />
            </span>
          </a>
        </section>

        {/* 2. LE PROBLÈME */}
        <section id="problem" className="w-[min(calc(100%-36px),1240px)] mx-auto py-24 sm:py-36">
          <p className="text-xs sm:text-sm font-semibold tracking-[0.14em] text-cyan-700 dark:text-[#22D3EE] mb-5">
            {t('problem.kicker')}
          </p>

          <h2 className="font-display text-[clamp(1.75rem,3.6vw,3.1rem)] font-semibold leading-[1.2] max-w-[920px] mb-16">
            <span className="block overflow-hidden">
              <span className="reveal-line block">{t('problem.line1')}</span>
            </span>
            <span className="block overflow-hidden">
              <span className="reveal-line block">
                {t('problem.line2Prefix')}{' '}
                <span className="text-gradient-aqua">{t('problem.line2Highlight')}</span>
              </span>
            </span>
          </h2>

          <div className="stagger-group grid grid-cols-1 md:grid-cols-3 gap-6">
            <article className="stagger-item glass-panel rounded-3xl p-8 sm:p-9 flex flex-col gap-3">
              <div className="font-mono-tabular text-5xl sm:text-6xl font-bold text-cyan-700 dark:text-[#22D3EE] leading-none">
                <span className="counter" data-target="30" data-suffix=" %">
                  0 %
                </span>
              </div>
              <p className="text-slate-600 dark:text-slate-300 text-[0.98rem] leading-relaxed max-w-[28ch]">
                {t('problem.stat1')}
              </p>
            </article>

            <article className="stagger-item glass-panel rounded-3xl p-8 sm:p-9 flex flex-col gap-3">
              <div className="font-mono-tabular text-5xl sm:text-6xl font-bold text-orange-600 dark:text-[#F97316] leading-none">
                <span className="counter" data-target="42" data-suffix=" j">
                  0 j
                </span>
              </div>
              <p className="text-slate-600 dark:text-slate-300 text-[0.98rem] leading-relaxed max-w-[28ch]">
                {t('problem.stat2')}
              </p>
            </article>

            <article className="stagger-item glass-panel rounded-3xl p-8 sm:p-9 flex flex-col gap-3">
              <div className="font-mono-tabular text-5xl sm:text-6xl font-bold text-teal-700 dark:text-[#2DD4BF] leading-none">
                <span className="counter" data-target="28" data-prefix="+" data-suffix=" %">
                  +0 %
                </span>
              </div>
              <p className="text-slate-600 dark:text-slate-300 text-[0.98rem] leading-relaxed max-w-[28ch]">
                {t('problem.stat3')}
              </p>
            </article>
          </div>
        </section>

        {/* 3. COMMENT ÇA MARCHE (Pin Horizontal) */}
        <section id="how-it-works" className="relative overflow-hidden">
          <div className="w-[min(calc(100%-36px),1240px)] mx-auto min-h-screen flex flex-col justify-center py-20 lg:py-24">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
              <div>
                <p className="text-xs sm:text-sm font-semibold tracking-[0.14em] text-lime-700 dark:text-[#A3E635] mb-4">
                  {t('how.kicker')}
                </p>
                <h2 className="font-display text-[clamp(2.1rem,4.4vw,3.6rem)] font-bold leading-[1.08]">
                  {t('how.titlePrefix')}{' '}
                  <span className="text-gradient-agri">{t('how.titleHighlight')}</span>
                </h2>
              </div>

              <div
                className="hidden lg:flex items-center gap-3.5 text-sm text-slate-600 dark:text-slate-300"
                aria-hidden="true"
              >
                <span className="font-mono-tabular font-semibold">{howStepIndex} / 03</span>
                <div className="w-36 h-1 rounded-full bg-slate-300 dark:bg-white/10 overflow-hidden">
                  <div
                    ref={howFillRef}
                    className="w-full h-full origin-left scale-x-[0.05] bg-gradient-to-r from-[#22D3EE] to-[#A3E635]"
                  />
                </div>
              </div>
            </div>

            <div className="overflow-visible">
              <div
                ref={howTrackRef}
                className="flex flex-col lg:flex-row gap-7 will-change-transform"
              >
                {howSteps.map((step) => (
                  <article
                    key={step.index}
                    className="glass-panel rounded-3xl p-8 sm:p-10 lg:flex-[0_0_min(76vw,540px)] min-h-[300px] lg:min-h-[350px] flex flex-col justify-between"
                  >
                    <div>
                      <div className="font-mono-tabular text-xs font-semibold tracking-[0.14em] text-cyan-700 dark:text-[#22D3EE] mb-4">
                        {step.index}. {step.kicker}
                      </div>
                      <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4">
                        {step.title}
                      </h3>
                      <p className="text-slate-600 dark:text-slate-300 text-[1.02rem] leading-relaxed max-w-[42ch]">
                        {step.description}
                      </p>
                    </div>
                    <div className="pt-6 mt-6 border-t border-slate-200 dark:border-white/8 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                      {step.meta}
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 4. FONCTIONNALITÉS */}
        <section id="features" className="w-[min(calc(100%-36px),1240px)] mx-auto py-24 sm:py-36">
          <div className="max-w-[740px] mb-14">
            <p className="text-xs sm:text-sm font-semibold tracking-[0.14em] text-cyan-700 dark:text-[#22D3EE] mb-4">
              {t('features.kicker')}
            </p>
            <h2 className="font-display text-[clamp(2.1rem,4.4vw,3.6rem)] font-bold leading-[1.08] mb-4">
              {t('features.titlePrefix')}{' '}
              <span className="text-gradient-aqua">{t('features.titleHighlight')}</span>
            </h2>
            <p className="text-slate-600 dark:text-slate-300 text-lg max-w-[54ch]">
              {t('features.subtitle')}
            </p>
          </div>

          <TiltFeatureCards />
        </section>

        {/* 5. DÉMO DASHBOARD INTERACTIVE (RECHARTS + SIMULATION DE FUITE) */}
        <section
          id="dashboard-demo"
          className="w-[min(calc(100%-36px),1240px)] mx-auto py-24 sm:py-32"
        >
          <div className="max-w-[740px] mb-12">
            <p className="text-xs sm:text-sm font-semibold tracking-[0.14em] text-cyan-700 dark:text-[#22D3EE] mb-4">
              {t('dashboard.kicker')}
            </p>
            <h2 className="font-display text-[clamp(2.1rem,4.4vw,3.6rem)] font-bold leading-[1.08] mb-4">
              {t('dashboard.titlePrefix')}{' '}
              <span className="text-gradient-aqua">{t('dashboard.titleHighlight')}</span>
            </h2>
            <p className="text-slate-600 dark:text-slate-300 text-lg max-w-[56ch]">
              {t('dashboard.subtitle')}
            </p>
          </div>

          <DashboardDemo
            activeMode={dashMode}
            leakSimulated={leakSimulated}
            onModeChange={setDashMode}
            onToggleLeak={() => setLeakSimulated((prev) => !prev)}
          />
        </section>

        {/* 6. SECTEURS */}
        <section id="sectors" className="w-[min(calc(100%-36px),1240px)] mx-auto py-24 sm:py-32">
          <div className="max-w-[740px] mb-14">
            <p className="text-xs sm:text-sm font-semibold tracking-[0.14em] text-lime-700 dark:text-[#A3E635] mb-4">
              {t('sectors.kicker')}
            </p>
            <h2 className="font-display text-[clamp(2.1rem,4.4vw,3.6rem)] font-bold leading-[1.08]">
              {t('sectors.titlePrefix')}{' '}
              <span className="text-gradient-agri">{t('sectors.titleHighlight')}</span>
            </h2>
          </div>

          <SectorCards onInspectSector={handleInspectSector} />
        </section>

        {/* 7. RÉSULTATS */}
        <section id="results" className="w-[min(calc(100%-36px),1240px)] mx-auto py-16 sm:py-24">
          <div className="glass-panel rounded-3xl p-8 sm:p-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {resultsItems.map((res, idx) => (
              <div
                key={res.desc}
                className={`flex flex-col gap-2 ${
                  idx > 0 ? 'sm:border-s sm:border-slate-200 dark:sm:border-white/10 sm:ps-7' : ''
                }`}
              >
                <div
                  className={`font-mono-tabular text-4xl sm:text-[2.6rem] font-bold leading-none ${
                    idx === 0
                      ? 'text-gradient-aqua'
                      : idx === 3
                      ? 'text-lime-700 dark:text-[#A3E635]'
                      : 'text-slate-900 dark:text-slate-100'
                  }`}
                >
                  <span
                    className="counter"
                    data-target={res.target}
                    data-prefix={res.prefix}
                    data-suffix={res.suffix}
                  >
                    0
                  </span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {res.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* 8. ASSISTANT IA « DEMANDEZ À AQUAMIND » */}
        <section
          id="assistant"
          className="w-[min(calc(100%-36px),1240px)] mx-auto py-24 sm:py-32"
        >
          <div className="max-w-[740px] mb-12">
            <p className="text-xs sm:text-sm font-semibold tracking-[0.14em] text-cyan-700 dark:text-[#22D3EE] mb-4">
              {t('assistant.kicker')}
            </p>
            <h2 className="font-display text-[clamp(2.1rem,4.4vw,3.6rem)] font-bold leading-[1.08] mb-4">
              {t('assistant.titlePrefix')}{' '}
              <span className="text-gradient-aqua">{t('assistant.titleHighlight')}</span>
            </h2>
            <p className="text-slate-600 dark:text-slate-300 text-lg max-w-[54ch]">
              {t('assistant.subtitle')}
            </p>
          </div>

          <AquaMindAssistant locale={locale} />
        </section>

        {/* 9. TÉMOIGNAGES */}
        <section
          id="testimonials"
          className="w-[min(calc(100%-36px),1240px)] mx-auto py-24 sm:py-32"
        >
          <div className="max-w-[740px] mb-12">
            <p className="text-xs sm:text-sm font-semibold tracking-[0.14em] text-cyan-700 dark:text-[#22D3EE] mb-4">
              {t('testimonials.kicker')}
            </p>
            <h2 className="font-display text-[clamp(2.1rem,4.4vw,3.6rem)] font-bold leading-[1.08]">
              {t('testimonials.titlePrefix')}{' '}
              <span className="text-gradient-aqua">{t('testimonials.titleHighlight')}</span>
            </h2>
          </div>

          <TestimonialsSlider />
        </section>

        {/* 10. CONTACT / DEMANDE DE DÉMO (ZOD) */}
        <section
          id="contact"
          className="w-[min(calc(100%-36px),1240px)] mx-auto pt-16 pb-28 sm:pt-20 sm:pb-36"
        >
          <div className="glass-panel rounded-[28px] p-7 sm:p-12 lg:p-14 grid grid-cols-1 lg:grid-cols-[1fr_1.05fr] gap-10 lg:gap-12 items-center">
            <div>
              <p className="text-xs sm:text-sm font-semibold tracking-[0.14em] text-cyan-700 dark:text-[#22D3EE] mb-4">
                {t('contact.kicker')}
              </p>
              <h2 className="font-display text-[clamp(2rem,4vw,3.2rem)] font-bold leading-[1.08] mb-5">
                {t('contact.titlePrefix')}{' '}
                <span className="text-gradient-aqua">{t('contact.titleHighlight')}</span>
              </h2>
              <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg leading-relaxed max-w-[42ch] mb-7">
                {t('contact.subtitle')}
              </p>

              <ul className="space-y-3 text-sm text-slate-700 dark:text-slate-300">
                {contactPerks.map((perk) => (
                  <li key={perk} className="flex items-center gap-2.5">
                    <Check
                      size={17}
                      className="text-teal-600 dark:text-[#2DD4BF] shrink-0"
                      aria-hidden="true"
                    />
                    <span>{perk}</span>
                  </li>
                ))}
              </ul>
            </div>

            <DemoForm />
          </div>
        </section>
      </main>

      {/* 11. FOOTER MINIMAL */}
      <footer className="relative z-[2] border-t border-slate-200 dark:border-white/10 bg-white/85 dark:bg-[#05121F]/90 py-10">
        <div className="w-[min(calc(100%-36px),1240px)] mx-auto flex flex-wrap items-center justify-between gap-6">
          <div className="flex flex-wrap items-baseline gap-2.5">
            <span className="font-display font-bold text-lg text-slate-900 dark:text-slate-100">
              AquaMind
            </span>
            <span className="text-sm text-slate-500 dark:text-slate-400">
              {t('footer.slogan')}
            </span>
          </div>

          <nav
            aria-label="Liens de pied de page"
            className="flex flex-wrap gap-6 text-sm text-slate-600 dark:text-slate-400"
          >
            <a
              href="#problem"
              onClick={(e) => {
                e.preventDefault();
                scrollToTarget('#problem');
              }}
              className="hover:text-cyan-700 dark:hover:text-[#22D3EE] transition-colors"
            >
              {t('nav.problem')}
            </a>
            <a
              href="#how-it-works"
              onClick={(e) => {
                e.preventDefault();
                scrollToTarget('#how-it-works');
              }}
              className="hover:text-cyan-700 dark:hover:text-[#22D3EE] transition-colors"
            >
              {t('nav.how')}
            </a>
            <a
              href="#assistant"
              onClick={(e) => {
                e.preventDefault();
                scrollToTarget('#assistant');
              }}
              className="hover:text-cyan-700 dark:hover:text-[#22D3EE] transition-colors"
            >
              {t('nav.assistant')}
            </a>
            <a
              href="#contact"
              onClick={(e) => {
                e.preventDefault();
                scrollToTarget('#contact');
              }}
              className="hover:text-cyan-700 dark:hover:text-[#22D3EE] transition-colors"
            >
              {t('nav.cta')}
            </a>
          </nav>

          <div className="text-xs text-slate-500">{t('footer.rights')}</div>
        </div>
      </footer>
    </div>
  );
}
