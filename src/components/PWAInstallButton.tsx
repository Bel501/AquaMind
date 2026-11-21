import { useState } from 'react';
import { Download, Share, Smartphone, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  variant?: 'hero' | 'drawer';
  onInstalledOrOpened?: () => void;
}

export function PWAInstallButton({
  variant = 'hero',
  onInstalledOrOpened,
}: PWAInstallButtonProps) {
  const { t } = useTranslation();
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  const buttonClass =
    variant === 'drawer'
      ? 'inline-flex items-center justify-center gap-2 rounded-full border border-cyan-600/35 dark:border-[#22D3EE]/35 bg-sky-50 dark:bg-[#081C30] px-5 py-2.5 text-sm font-semibold text-cyan-800 dark:text-[#22D3EE] hover:border-cyan-600 dark:hover:border-[#22D3EE] transition-colors cursor-pointer whitespace-nowrap shrink-0'
      : 'inline-flex items-center justify-center gap-2 rounded-full border border-cyan-600/35 dark:border-[#22D3EE]/35 bg-white/90 dark:bg-[#081C30]/85 px-5 py-3 text-sm font-semibold text-[#082F4E] dark:text-[#22D3EE] hover:border-cyan-600 dark:hover:border-[#22D3EE] shadow-sm transition-colors cursor-pointer whitespace-nowrap shrink-0';

  if (isInstallable) {
    return (
      <button
        type="button"
        onClick={async () => {
          await install();
          onInstalledOrOpened?.();
        }}
        className={buttonClass}
      >
        <Download size={16} aria-hidden="true" />
        <span>{t('pwa.installButton')}</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          type="button"
          onClick={() => {
            setShowIOSGuide(true);
            onInstalledOrOpened?.();
          }}
          className={buttonClass}
        >
          <Smartphone size={16} aria-hidden="true" />
          <span>{t('pwa.installIOSButton')}</span>
        </button>

        {showIOSGuide && (
          <div
            className="fixed inset-0 z-[1350] flex items-center justify-center bg-slate-950/65 p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="ios-install-title"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowIOSGuide(false);
              }
            }}
          >
            <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-[#071829] border border-slate-200 dark:border-[#22D3EE]/25 p-6 shadow-2xl">
              <div className="flex items-center justify-between gap-3 mb-3">
                <h3
                  id="ios-install-title"
                  className="font-display text-lg font-bold text-[#082F4E] dark:text-white"
                >
                  {t('pwa.iosTitle')}
                </h3>
                <button
                  type="button"
                  onClick={() => setShowIOSGuide(false)}
                  aria-label={t('pwa.close')}
                  className="w-8 h-8 rounded-full bg-slate-100 dark:bg-[#0C2640] flex items-center justify-center text-slate-600 dark:text-slate-300 cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <ol className="space-y-3 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                <li className="flex items-start gap-2.5">
                  <span className="font-mono-tabular font-semibold text-cyan-700 dark:text-[#22D3EE]">
                    1.
                  </span>
                  <span>
                    {t('pwa.iosStep1')}{' '}
                    <Share
                      size={14}
                      className="inline-block align-text-bottom text-cyan-700 dark:text-[#22D3EE]"
                      aria-hidden="true"
                    />
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="font-mono-tabular font-semibold text-cyan-700 dark:text-[#22D3EE]">
                    2.
                  </span>
                  <span>{t('pwa.iosStep2')}</span>
                </li>
              </ol>

              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full rounded-xl bg-cyan-600 dark:bg-[#22D3EE] py-2.5 text-sm font-semibold text-white dark:text-[#05121F] cursor-pointer hover:opacity-95 transition-opacity"
              >
                {t('pwa.close')}
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
}
