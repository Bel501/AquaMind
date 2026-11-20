import { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface Testimonial {
  quote: string;
  author: string;
  role: string;
  context: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "En plein été, AquaMind a réduit notre volume d'irrigation de 31 % tout en améliorant l'homogénéité de nos vignes. L'outil s'est rentabilisé dès la première vendange.",
    author: 'Marc Delacroix',
    role: "Directeur d'exploitation · Domaines du Levant",
    context: '420 ha de vignobles · Provence',
  },
  {
    quote:
      "Une fuite sous notre plage piscine passait inaperçue depuis des semaines. Les séries temporelles d'AquaMind l'ont signalée en trois minutes à 2h du matin.",
    author: 'Sonia Benali',
    role: 'Directrice Technique · Azur Thalasso & Resort',
    context: '140 chambres & centre thermal · Côte d’Azur',
  },
  {
    quote:
      "L'intégration sur nos compteurs existants a pris une demi-journée. Nos boucles de refroidissement sont désormais sous surveillance prédictive 24/7.",
    author: 'Thomas Vasseur',
    role: 'Responsable Énergie & Fluides · Groupe AgroNova',
    context: '3 lignes industrielles · Pays de la Loire',
  },
];

export function TestimonialsSlider() {
  const { t } = useTranslation();
  const [index, setIndex] = useState(0);
  const touchStartX = useRef(0);

  const prev = () => setIndex((i) => (i - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  const next = () => setIndex((i) => (i + 1) % TESTIMONIALS.length);

  return (
    <div>
      <div
        role="region"
        aria-roledescription="carousel"
        aria-label="Témoignages clients AquaMind"
        className="glass-panel rounded-3xl overflow-hidden"
        onTouchStart={(e) => {
          touchStartX.current = e.changedTouches[0].clientX;
        }}
        onTouchEnd={(e) => {
          const diff = touchStartX.current - e.changedTouches[0].clientX;
          if (Math.abs(diff) > 45) {
            if (diff > 0) next();
            else prev();
          }
        }}
      >
        <div
          className="flex transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform"
          style={{ transform: `translate3d(-${index * 100}%, 0, 0)` }}
        >
          {TESTIMONIALS.map((item) => (
            <article
              key={item.author}
              className="flex-[0_0_100%] p-7 sm:p-12 flex flex-col justify-between gap-7"
            >
              <blockquote className="font-display text-xl sm:text-2xl lg:text-[1.85rem] font-medium leading-snug text-slate-900 dark:text-slate-100 max-w-[44ch]">
                « {item.quote} »
              </blockquote>
              <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-200 dark:border-white/8">
                <div>
                  <div className="font-display font-semibold text-base text-slate-900 dark:text-slate-100">
                    {item.author}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">{item.role}</div>
                </div>
                <div className="text-xs sm:text-sm text-teal-700 dark:text-[#2DD4BF] font-medium">
                  {item.context}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between mt-6">
        <div className="flex items-center gap-2.5" role="tablist" aria-label="Choisir un témoignage">
          {TESTIMONIALS.map((item, i) => (
            <button
              key={item.author}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`${item.author}`}
              onClick={() => setIndex(i)}
              className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                i === index
                  ? 'w-12 bg-cyan-600 dark:bg-[#22D3EE]'
                  : 'w-7 bg-slate-300 dark:bg-white/18 hover:bg-slate-400 dark:hover:bg-white/35'
              }`}
            />
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={prev}
            aria-label={t('testimonials.prev')}
            className="w-11 h-11 rounded-full glass-panel flex items-center justify-center text-slate-700 dark:text-slate-200 hover:text-cyan-600 dark:hover:text-[#22D3EE] cursor-pointer"
          >
            <ChevronLeft size={20} aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={next}
            aria-label={t('testimonials.next')}
            className="w-11 h-11 rounded-full glass-panel flex items-center justify-center text-slate-700 dark:text-slate-200 hover:text-cyan-600 dark:hover:text-[#22D3EE] cursor-pointer"
          >
            <ChevronRight size={20} aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}
