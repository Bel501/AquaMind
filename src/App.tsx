import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { ArrowRight, Check } from 'lucide-react';
import { Preloader } from './components/Preloader';
import { WaterCursor } from './components/WaterCursor';
import { Navbar } from './components/Navbar';
import { WaterCanvas3D, type SceneTargets } from './components/WaterCanvas3D';
import { MagneticButton } from './components/MagneticButton';
import { TiltFeatureCards } from './components/TiltFeatureCards';
import { DashboardDemo, type DashMode } from './components/DashboardDemo';
import { SectorCards } from './components/SectorCards';
import { TestimonialsSlider } from './components/TestimonialsSlider';
import { DemoForm } from './components/DemoForm';

gsap.registerPlugin(ScrollTrigger);

const HERO_HEADLINE = "L'eau, enfin sous contrôle.";

const HOW_STEPS = [
  {
    index: '01',
    kicker: 'Acquisition continue',
    title: 'Capteurs et météo hyperlocale',
    description:
      "Nos sondes LoRaWAN mesurent humidité racinaire, pression, débit et salinité en continu, enrichies par les prévisions satellites et d'évapotranspiration.",
    meta: 'Sondes IoT · Débitmètres · Météo J+10',
  },
  {
    index: '02',
    kicker: 'Intelligence temporelle',
    title: 'Modèles ML et séries temporelles',
    description:
      'Nos réseaux neuronaux temporels modélisent la signature hydrique de chaque parcelle ou bâtiment pour prédire les besoins et isoler la moindre anomalie.',
    meta: 'Séries temporelles · Détection d’écarts · Score de risque',
  },
  {
    index: '03',
    kicker: 'Exécution précise',
    title: 'Décisions automatisées',
    description:
      "AquaMind ajuste vos électrovannes à la minute près et déclenche une alerte géolocalisée avec coupure ciblée dès qu'une fuite apparaît.",
    meta: 'Pilotage vannes · Alertes < 4 min · API & SCADA',
  },
];

export default function App() {
  const [preloaded, setPreloaded] = useState(false);
  const [threeEnabled, setThreeEnabled] = useState(false);
  const [navHidden, setNavHidden] = useState(false);
  const [dashMode, setDashMode] = useState<DashMode>('agri');
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

  // Split headline into words and letters for staggered reveal
  const heroWords = useMemo(() => HERO_HEADLINE.split(' '), []);

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

  // Smooth scrolling (Lenis) + scroll progress + navbar hide/show
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
        { y: 42, opacity: 0, rotateX: -32 },
        { y: 0, opacity: 1, rotateX: 0, duration: 0.7, stagger: 0.024 }
      ).fromTo(
        fades,
        { y: 24, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.65, stagger: 0.1 },
        '-=0.36'
      );
    });

    return () => ctx.revert();
  }, [preloaded]);

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
      // 1. Line-by-line reveal in Problem section
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

      // 2. Staggered reveal on grid groups
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

      // 3. Animated counters
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

      // 4. Horizontal pinned 3-step showcase (Desktop only)
      const mm = gsap.matchMedia();
      mm.add('(min-width: 901px)', () => {
        const track = howTrackRef.current;
        const fill = howFillRef.current;
        if (!track || !track.parentElement) return;

        const getScrollDist = () =>
          Math.max(track.scrollWidth - track.parentElement!.offsetWidth, 380);

        gsap.to(track, {
          x: () => -getScrollDist(),
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

      // 5. Persistent 3D Scene choreography scrubbed smoothly across the entire page
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
        // Hero -> Données IoT
        .to(targets, {
          hero: 0,
          data: 1,
          camX: -0.55,
          camZ: 6.8,
          duration: 1.5,
          ease: 'power1.inOut',
        })
        // Données IoT -> Prédiction Terrain + Courbes ML
        .to(targets, {
          data: 0,
          prediction: 1,
          camX: 0.4,
          camY: 0.7,
          camZ: 6.4,
          duration: 1.8,
          ease: 'power1.inOut',
        })
        // Prédiction -> Détection de fuites (Canalisations)
        .to(targets, {
          prediction: 0,
          leaks: 1,
          camX: -0.3,
          camY: 0.1,
          camZ: 6.3,
          duration: 1.8,
          ease: 'power1.inOut',
        })
        // Détection -> Sphère équilibrée (caméra recule)
        .to(targets, {
          leaks: 0,
          optimal: 1,
          camX: 0,
          camY: 0.2,
          camZ: 8.2,
          duration: 1.8,
          ease: 'power1.inOut',
        })
        // Sphère équilibrée + Vagues 3D en CTA final
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
  }, []);

  return (
    <div className="relative min-h-screen bg-[#05121F] text-slate-100">
      <a
        href="#main-content"
        className="skip-link bg-[#22D3EE] text-[#05121F] font-display font-semibold px-5 py-3 rounded-full"
      >
        Aller au contenu principal
      </a>

      {/* Écran de chargement goutte 0 -> 100 % */}
      <Preloader onComplete={handlePreloaderComplete} />

      {/* Barre de progression du scroll */}
      <div className="fixed top-0 left-0 w-full h-[3px] z-[1200] bg-white/5 pointer-events-none" aria-hidden="true">
        <div
          ref={progressRef}
          className="w-full h-full origin-left scale-x-0 bg-gradient-to-r from-[#22D3EE] via-[#2DD4BF] to-[#A3E635] shadow-[0_0_12px_rgba(34,211,238,0.65)]"
        />
      </div>

      {/* Curseur cercle d'eau (desktop pointer uniquement) */}
      <WaterCursor />

      {/* Scène 3D persistante en arrière-plan fixe (lazy) */}
      <WaterCanvas3D enabled={threeEnabled} targetsRef={sceneTargetsRef} />
      <div className="ambient-vignette fixed inset-0 z-[1] pointer-events-none" aria-hidden="true" />
      <div className="film-grain fixed inset-0 z-[1] pointer-events-none opacity-[0.04]" aria-hidden="true" />

      {/* Navbar flottante */}
      <Navbar hidden={navHidden} onNavigate={scrollToTarget} />

      <main id="main-content" ref={mainRef} className="relative z-[2]">
        {/* ====================================================================
            1. HERO — Goutte 3D translucide + particules
            ==================================================================== */}
        <section
          id="hero"
          className="min-h-[100svh] w-[min(calc(100%-36px),1240px)] mx-auto flex flex-col justify-center pt-28 pb-16 relative"
        >
          <div className="max-w-[820px]">
            <p className="text-xs sm:text-sm font-semibold tracking-[0.14em] text-[#22D3EE] mb-5">
              Intelligence hydrique · IoT &amp; séries temporelles
            </p>

            <h1
              aria-label={HERO_HEADLINE}
              className="font-display text-[clamp(2.85rem,7.2vw,6rem)] font-bold leading-[1.03] tracking-tight mb-7 drop-shadow-[0_12px_42px_rgba(5,18,31,0.85)]"
            >
              {heroWords.map((word, wIdx) => (
                <span key={`${word}-${wIdx}`} className="inline-block whitespace-nowrap mr-[0.26em]">
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

            <p className="hero-fade text-lg sm:text-xl text-slate-300 max-w-[54ch] mb-10 leading-relaxed">
              IA prédictive et capteurs IoT pour irriguer juste et traquer chaque fuite.
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
                Demander une démo
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
                Voir comment ça marche
              </MagneticButton>
            </div>
          </div>

          <a
            href="#problem"
            onClick={(e) => {
              e.preventDefault();
              scrollToTarget('#problem');
            }}
            aria-label="Défiler vers la section suivante"
            className="absolute bottom-7 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2.5 text-slate-400 hover:text-[#22D3EE] transition-colors text-[0.72rem] tracking-[0.18em]"
          >
            <span>EXPLORER</span>
            <span
              className="w-6 h-10 rounded-full border border-[#22D3EE]/45 bg-[#05121F]/50 flex justify-center pt-1.5"
              aria-hidden="true"
            >
              <span className="scroll-drop-anim w-1.5 h-2.5 rounded-full bg-[#22D3EE] shadow-[0_0_10px_#22D3EE]" />
            </span>
          </a>
        </section>

        {/* ====================================================================
            2. LE PROBLÈME — Réseau de capteurs IoT 3D
            ==================================================================== */}
        <section
          id="problem"
          className="w-[min(calc(100%-36px),1240px)] mx-auto py-24 sm:py-36"
        >
          <p className="text-xs sm:text-sm font-semibold tracking-[0.14em] text-[#22D3EE] mb-5">
            Le constat
          </p>

          <h2 className="font-display text-[clamp(1.75rem,3.6vw,3.1rem)] font-semibold leading-[1.2] max-w-[920px] mb-16">
            <span className="block overflow-hidden">
              <span className="reveal-line block">Chaque mètre cube gaspillé pèse</span>
            </span>
            <span className="block overflow-hidden">
              <span className="reveal-line block">
                sur vos rendements et{' '}
                <span className="text-gradient-aqua">vos marges opérationnelles.</span>
              </span>
            </span>
          </h2>

          <div className="stagger-group grid grid-cols-1 md:grid-cols-3 gap-6">
            <article className="stagger-item glass-panel rounded-3xl p-8 sm:p-9 flex flex-col gap-3">
              <div className="font-mono-tabular text-5xl sm:text-6xl font-bold text-[#22D3EE] leading-none">
                <span className="counter" data-target="30" data-suffix=" %">
                  0 %
                </span>
              </div>
              <p className="text-slate-300 text-[0.98rem] leading-relaxed max-w-[28ch]">
                d&apos;eau perdue en moyenne par sur-irrigation ou réseaux non monitorés.
              </p>
            </article>

            <article className="stagger-item glass-panel rounded-3xl p-8 sm:p-9 flex flex-col gap-3">
              <div className="font-mono-tabular text-5xl sm:text-6xl font-bold text-[#FB7185] leading-none">
                <span className="counter" data-target="42" data-suffix=" j">
                  0 j
                </span>
              </div>
              <p className="text-slate-300 text-[0.98rem] leading-relaxed max-w-[28ch]">
                délai moyen avant de repérer une fuite souterraine sans télémétrie IA.
              </p>
            </article>

            <article className="stagger-item glass-panel rounded-3xl p-8 sm:p-9 flex flex-col gap-3">
              <div className="font-mono-tabular text-5xl sm:text-6xl font-bold text-[#2DD4BF] leading-none">
                <span className="counter" data-target="28" data-prefix="+" data-suffix=" %">
                  +0 %
                </span>
              </div>
              <p className="text-slate-300 text-[0.98rem] leading-relaxed max-w-[28ch]">
                de surcoût énergétique et hydrique évitable sur une saison complète.
              </p>
            </article>
          </div>
        </section>

        {/* ====================================================================
            3. COMMENT ÇA MARCHE — 3 étapes horizontales épinglées au scroll
            Scène 3D : Terrain agricole low-poly + courbes ML
            ==================================================================== */}
        <section id="how-it-works" className="relative overflow-hidden">
          <div className="w-[min(calc(100%-36px),1240px)] mx-auto min-h-screen flex flex-col justify-center py-20 lg:py-24">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
              <div>
                <p className="text-xs sm:text-sm font-semibold tracking-[0.14em] text-[#A3E635] mb-4">
                  Architecture en 3 temps
                </p>
                <h2 className="font-display text-[clamp(2.1rem,4.4vw,3.6rem)] font-bold leading-[1.08]">
                  De la donnée brute à{' '}
                  <span className="text-gradient-agri">l&apos;action autonome.</span>
                </h2>
              </div>

              <div className="hidden lg:flex items-center gap-3.5 text-sm text-slate-300" aria-hidden="true">
                <span className="font-mono-tabular font-semibold">{howStepIndex} / 03</span>
                <div className="w-36 h-1 rounded-full bg-white/10 overflow-hidden">
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
                {HOW_STEPS.map((step) => (
                  <article
                    key={step.index}
                    className="glass-panel rounded-3xl p-8 sm:p-10 lg:flex-[0_0_min(76vw,540px)] min-h-[300px] lg:min-h-[350px] flex flex-col justify-between"
                  >
                    <div>
                      <div className="font-mono-tabular text-xs font-semibold tracking-[0.14em] text-[#22D3EE] mb-4">
                        {step.index}. {step.kicker}
                      </div>
                      <h3 className="text-2xl sm:text-3xl font-bold text-slate-100 mb-4">
                        {step.title}
                      </h3>
                      <p className="text-slate-300 text-[1.02rem] leading-relaxed max-w-[42ch]">
                        {step.description}
                      </p>
                    </div>
                    <div className="pt-6 mt-6 border-t border-white/8 text-xs sm:text-sm text-slate-400">
                      {step.meta}
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ====================================================================
            4. FONCTIONNALITÉS — Cartes en verre avec Tilt 3D
            Scène 3D : Réseau de canalisations + fuite pulsante
            ==================================================================== */}
        <section
          id="features"
          className="w-[min(calc(100%-36px),1240px)] mx-auto py-24 sm:py-36"
        >
          <div className="max-w-[740px] mb-14">
            <p className="text-xs sm:text-sm font-semibold tracking-[0.14em] text-[#22D3EE] mb-4">
              Capacités clés
            </p>
            <h2 className="font-display text-[clamp(2.1rem,4.4vw,3.6rem)] font-bold leading-[1.08] mb-4">
              Une précision chirurgicale sur{' '}
              <span className="text-gradient-aqua">chaque litre.</span>
            </h2>
            <p className="text-slate-300 text-lg max-w-[54ch]">
              Conçu pour les exploitations exigeantes, les infrastructures hôtelières et les réseaux industriels critiques.
            </p>
          </div>

          <TiltFeatureCards />
        </section>

        {/* ====================================================================
            5. DÉMO DASHBOARD — Maquette animée qui se construit au scroll
            ==================================================================== */}
        <section
          id="dashboard-demo"
          className="w-[min(calc(100%-36px),1240px)] mx-auto py-24 sm:py-32"
        >
          <div className="max-w-[740px] mb-12">
            <p className="text-xs sm:text-sm font-semibold tracking-[0.14em] text-[#22D3EE] mb-4">
              Aperçu interactif
            </p>
            <h2 className="font-display text-[clamp(2.1rem,4.4vw,3.6rem)] font-bold leading-[1.08] mb-4">
              Votre tour de contrôle{' '}
              <span className="text-gradient-aqua">en temps réel.</span>
            </h2>
            <p className="text-slate-300 text-lg max-w-[54ch]">
              Visualisez la consommation réelle, les prédictions du modèle et les alertes critiques sur un seul écran.
            </p>
          </div>

          <DashboardDemo activeMode={dashMode} onModeChange={setDashMode} />
        </section>

        {/* ====================================================================
            6. SECTEURS — Trois grandes cartes interactives + icône 3D
            Scène 3D : Retour à une sphère équilibrée
            ==================================================================== */}
        <section
          id="sectors"
          className="w-[min(calc(100%-36px),1240px)] mx-auto py-24 sm:py-32"
        >
          <div className="max-w-[740px] mb-14">
            <p className="text-xs sm:text-sm font-semibold tracking-[0.14em] text-[#A3E635] mb-4">
              Secteurs d&apos;application
            </p>
            <h2 className="font-display text-[clamp(2.1rem,4.4vw,3.6rem)] font-bold leading-[1.08]">
              Taillé pour vos{' '}
              <span className="text-gradient-agri">contraintes terrain.</span>
            </h2>
          </div>

          <SectorCards onInspectSector={handleInspectSector} />
        </section>

        {/* ====================================================================
            7. RÉSULTATS — Compteurs animés
            ==================================================================== */}
        <section
          id="results"
          className="w-[min(calc(100%-36px),1240px)] mx-auto py-16 sm:py-24"
        >
          <div className="glass-panel rounded-3xl p-8 sm:p-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="flex flex-col gap-2">
              <div className="font-mono-tabular text-4xl sm:text-[2.8rem] font-bold text-gradient-aqua leading-none">
                <span className="counter" data-target="30" data-prefix="Jusqu'à -" data-suffix=" %">
                  0 %
                </span>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
                de consommation d&apos;eau dès la première année d&apos;exploitation
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:border-l sm:border-white/10 sm:pl-7">
              <div className="font-mono-tabular text-4xl sm:text-[2.8rem] font-bold text-slate-100 leading-none">
                <span className="counter" data-target="4" data-prefix="< " data-suffix=" min">
                  0 min
                </span>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
                pour détecter et géolocaliser une fuite active sur le réseau
              </p>
            </div>

            <div className="flex flex-col gap-2 lg:border-l lg:border-white/10 lg:pl-7">
              <div className="font-mono-tabular text-4xl sm:text-[2.8rem] font-bold text-slate-100 leading-none">
                <span className="counter" data-target="96" data-suffix=" %">
                  0 %
                </span>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
                de précision prédictive des séries temporelles à horizon 7 jours
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:border-l sm:border-white/10 sm:pl-7">
              <div className="font-mono-tabular text-4xl sm:text-[2.8rem] font-bold text-[#A3E635] leading-none">
                <span className="counter" data-target="180" data-prefix="+">
                  +0
                </span>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
                sites agricoles, hôteliers et industriels connectés en continu
              </p>
            </div>
          </div>
        </section>

        {/* ====================================================================
            8. TÉMOIGNAGES — Slider fluide
            ==================================================================== */}
        <section
          id="testimonials"
          className="w-[min(calc(100%-36px),1240px)] mx-auto py-24 sm:py-32"
        >
          <div className="max-w-[740px] mb-12">
            <p className="text-xs sm:text-sm font-semibold tracking-[0.14em] text-[#22D3EE] mb-4">
              Retours terrain
            </p>
            <h2 className="font-display text-[clamp(2.1rem,4.4vw,3.6rem)] font-bold leading-[1.08]">
              Ils pilotent déjà{' '}
              <span className="text-gradient-aqua">chaque goutte.</span>
            </h2>
          </div>

          <TestimonialsSlider />
        </section>

        {/* ====================================================================
            9. CTA FINAL — Formulaire de démo sur fond de vagues 3D
            ==================================================================== */}
        <section
          id="contact"
          className="w-[min(calc(100%-36px),1240px)] mx-auto pt-16 pb-28 sm:pt-20 sm:pb-36"
        >
          <div className="glass-panel rounded-[28px] p-7 sm:p-12 lg:p-14 grid grid-cols-1 lg:grid-cols-[1fr_1.05fr] gap-10 lg:gap-12 items-center">
            <div>
              <p className="text-xs sm:text-sm font-semibold tracking-[0.14em] text-[#22D3EE] mb-4">
                Passer à l&apos;action
              </p>
              <h2 className="font-display text-[clamp(2rem,4vw,3.2rem)] font-bold leading-[1.08] mb-5">
                Prêt à reprendre{' '}
                <span className="text-gradient-aqua">le contrôle ?</span>
              </h2>
              <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-[42ch] mb-7">
                Planifiez une démonstration personnalisée avec nos ingénieurs hydrauliques et data scientists sur vos propres données.
              </p>

              <ul className="space-y-3 text-sm text-slate-300">
                <li className="flex items-center gap-2.5">
                  <Check size={17} className="text-[#2DD4BF] shrink-0" aria-hidden="true" />
                  Audit rapide de potentiel d&apos;économie sous 48h
                </li>
                <li className="flex items-center gap-2.5">
                  <Check size={17} className="text-[#2DD4BF] shrink-0" aria-hidden="true" />
                  Compatible compteurs, automates et sondes existants
                </li>
                <li className="flex items-center gap-2.5">
                  <Check size={17} className="text-[#2DD4BF] shrink-0" aria-hidden="true" />
                  Déploiement pilote sans interruption d&apos;activité
                </li>
              </ul>
            </div>

            <DemoForm />
          </div>
        </section>
      </main>

      {/* ======================================================================
          10. FOOTER MINIMAL
          ====================================================================== */}
      <footer className="relative z-[2] border-t border-white/10 bg-[#05121F]/90 py-10">
        <div className="w-[min(calc(100%-36px),1240px)] mx-auto flex flex-wrap items-center justify-between gap-6">
          <div className="flex flex-wrap items-baseline gap-2.5">
            <span className="font-display font-bold text-lg text-slate-100">AquaMind</span>
            <span className="text-sm text-slate-400">— L&apos;eau, enfin sous contrôle.</span>
          </div>

          <nav aria-label="Liens de pied de page" className="flex flex-wrap gap-6 text-sm text-slate-400">
            <a href="#problem" onClick={(e) => { e.preventDefault(); scrollToTarget('#problem'); }} className="hover:text-[#22D3EE] transition-colors">
              Enjeux
            </a>
            <a href="#how-it-works" onClick={(e) => { e.preventDefault(); scrollToTarget('#how-it-works'); }} className="hover:text-[#22D3EE] transition-colors">
              Technologie
            </a>
            <a href="#sectors" onClick={(e) => { e.preventDefault(); scrollToTarget('#sectors'); }} className="hover:text-[#22D3EE] transition-colors">
              Secteurs
            </a>
            <a href="#contact" onClick={(e) => { e.preventDefault(); scrollToTarget('#contact'); }} className="hover:text-[#22D3EE] transition-colors">
              Contact
            </a>
          </nav>

          <div className="text-xs text-slate-500">© 2026 AquaMind. Tous droits réservés.</div>
        </div>
      </footer>
    </div>
  );
}
