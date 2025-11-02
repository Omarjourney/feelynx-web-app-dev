import { useEffect, useId, useState } from 'react';

export const SettingsDrawer = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [fontScale, setFontScale] = useState(1);
  const [brightness, setBrightness] = useState(1);
  const dialogTitleId = useId();
  const drawerId = useId();

  useEffect(() => {
    document.documentElement.style.setProperty('--app-font-scale', fontScale.toString());
  }, [fontScale]);

  useEffect(() => {
    document.documentElement.style.setProperty('--app-brightness', brightness.toString());
  }, [brightness]);

  const closeDrawer = () => setIsOpen(false);

  return (
    <>
      <button
        type="button"
        className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/10 text-lg transition hover:bg-white/20"
        onClick={() => setIsOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-controls={drawerId}
        aria-label="Open settings drawer"
      >
        ⚙️
      </button>

      {isOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 px-4 pt-20"
          role="presentation"
          onClick={closeDrawer}
        >
          <div
            id={drawerId}
            role="dialog"
            aria-modal="true"
            aria-labelledby={dialogTitleId}
            className="glass-card w-full max-w-md rounded-t-3xl border border-white/10 bg-slate-900/90 p-6 text-foreground"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2 id={dialogTitleId} className="m-0 text-xl font-semibold">
                Studio preferences
              </h2>
              <button
                type="button"
                className="rounded-full border border-white/10 px-3 py-1 text-sm text-foreground/70 transition hover:bg-white/10"
                onClick={closeDrawer}
                aria-label="Close settings drawer"
              >
                Close
              </button>
            </div>

            <div className="mt-6 space-y-6">
              <label className="flex flex-col gap-2 text-sm">
                <span className="font-medium text-foreground">Font size</span>
                <input
                  type="range"
                  min={0.9}
                  max={1.2}
                  step={0.05}
                  value={fontScale}
                  onChange={(event) => setFontScale(Number(event.target.value))}
                  className="accent-primary"
                  aria-valuetext={`${Math.round(fontScale * 100)} percent`}
                />
                <span className="text-xs text-foreground/70">Adjust typography for long reading sessions.</span>
              </label>

              <label className="flex flex-col gap-2 text-sm">
                <span className="font-medium text-foreground">Brightness</span>
                <input
                  type="range"
                  min={0.8}
                  max={1.1}
                  step={0.05}
                  value={brightness}
                  onChange={(event) => setBrightness(Number(event.target.value))}
                  className="accent-secondary"
                  aria-valuetext={`${Math.round(brightness * 100)} percent`}
                />
                <span className="text-xs text-foreground/70">Tone down glare during night streams.</span>
              </label>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
};
