import { useEffect, useState } from 'react';
import { Settings2 } from 'lucide-react';
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

const LANGUAGES = ['EN', 'ES', 'PT', 'FR'] as const;

type ExperienceTheme = 'vibe' | 'midnight' | 'electric';

const readLocal = (key: string, fallback: string) => {
  try {
    return localStorage.getItem(key) ?? fallback;
  } catch (error) {
    console.warn('Unable to read localStorage key', key, error);
    return fallback;
  }
};

const writeLocal = (key: string, value: string) => {
  try {
    localStorage.setItem(key, value);
  } catch (error) {
    console.warn('Unable to persist localStorage key', key, error);
  }
};

export const SettingsDrawer = () => {
  const [open, setOpen] = useState(false);
  const [brightness, setBrightness] = useState(1);
  const [fontScale, setFontScale] = useState(1);
  const [language, setLanguage] = useState<(typeof LANGUAGES)[number]>('EN');
  const [experienceTheme, setExperienceTheme] = useState<ExperienceTheme>('vibe');

  useEffect(() => {
    if (!open) return;
    const storedLanguage =
      readLocal('feelynx.language', readLocal('ivibes.language', language)) as (typeof LANGUAGES)[number];
    const storedTheme =
      readLocal('feelynx.experienceTheme', readLocal('ivibes.experienceTheme', experienceTheme)) as ExperienceTheme;
    const storedBrightness = Number(readLocal('feelynx.brightness', readLocal('ivibes.brightness', '1')));
    const storedFontScale = Number(readLocal('feelynx.fontScale', readLocal('ivibes.fontScale', '1')));

    setLanguage(storedLanguage ?? 'EN');
    if (storedTheme === 'midnight' || storedTheme === 'electric') {
      setExperienceTheme(storedTheme);
    } else {
      setExperienceTheme('vibe');
    }
    setBrightness(Number.isFinite(storedBrightness) ? storedBrightness : 1);
    setFontScale(Number.isFinite(storedFontScale) ? storedFontScale : 1);
  }, [open]);

  useEffect(() => {
    document.documentElement.style.setProperty('--app-brightness', brightness.toFixed(2));
    writeLocal('feelynx.brightness', brightness.toString());
  }, [brightness]);

  useEffect(() => {
    document.documentElement.style.setProperty('--app-font-scale', fontScale.toFixed(2));
    writeLocal('feelynx.fontScale', fontScale.toString());
  }, [fontScale]);

  useEffect(() => {
    if (experienceTheme === 'vibe') {
      document.documentElement.removeAttribute('data-experience-theme');
    } else {
      document.documentElement.setAttribute('data-experience-theme', experienceTheme);
    }
    writeLocal('feelynx.experienceTheme', experienceTheme);
  }, [experienceTheme]);

  useEffect(() => {
    writeLocal('feelynx.language', language);
  }, [language]);

  return (
    <>
      <Button
        type="button"
        variant="secondary"
        className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/10 text-foreground transition hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-primary"
        aria-label="Open comfort settings"
        onClick={() => setOpen(true)}
      >
        <span aria-hidden className="text-lg">
          <Settings2 className="h-5 w-5" />
        </span>
      </Button>

      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent className="mx-auto w-full max-w-lg space-y-6 rounded-t-3xl bg-background/95 p-6 shadow-2xl">
          <DrawerHeader className="space-y-2 text-left">
            <DrawerTitle className="text-2xl font-semibold tracking-tight">Comfort controls</DrawerTitle>
            <DrawerDescription className="text-sm text-foreground/70">
              Tune the interface for readability and accessibility across any lighting.
            </DrawerDescription>
          </DrawerHeader>

          <section className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <p className="font-medium text-foreground">Brightness</p>
              <span className="text-xs text-foreground/60">{Math.round(brightness * 100)}%</span>
            </div>
            <Slider
              min={0.6}
              max={1.2}
              step={0.05}
              value={[brightness]}
              onValueChange={([value]) => setBrightness(Number(value.toFixed(2)))}
              aria-label="Adjust brightness"
            />
          </section>

          <section className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <p className="font-medium text-foreground">Font size</p>
              <span className="text-xs text-foreground/60">{Math.round(fontScale * 100)}%</span>
            </div>
            <Slider
              min={0.9}
              max={1.3}
              step={0.05}
              value={[fontScale]}
              onValueChange={([value]) => setFontScale(Number(value.toFixed(2)))}
              aria-label="Adjust font scale"
            />
          </section>

          <section className="space-y-3">
            <p className="text-sm font-medium text-foreground">Experience theme</p>
            <ToggleGroup type="single" value={experienceTheme} onValueChange={(value) => value && setExperienceTheme(value as ExperienceTheme)}>
              <ToggleGroupItem value="vibe" aria-label="Use vibe theme" className="flex-1">Vibe</ToggleGroupItem>
              <ToggleGroupItem value="midnight" aria-label="Use midnight theme" className="flex-1">
                Midnight
              </ToggleGroupItem>
              <ToggleGroupItem value="electric" aria-label="Use electric theme" className="flex-1">
                Electric
              </ToggleGroupItem>
            </ToggleGroup>
          </section>

          <section className="space-y-3">
            <p className="text-sm font-medium text-foreground">Language</p>
            <div className="grid grid-cols-2 gap-2">
              {LANGUAGES.map((lng) => (
                <Button
                  key={lng}
                  type="button"
                  variant={language === lng ? 'default' : 'secondary'}
                  onClick={() => setLanguage(lng)}
                  aria-pressed={language === lng}
                  className="justify-between"
                >
                  <span>{lng}</span>
                  {language === lng && <span className="text-xs text-primary-foreground/80">Selected</span>}
                </Button>
              ))}
            </div>
          </section>
        </DrawerContent>
      </Drawer>
    </>
  );
};
