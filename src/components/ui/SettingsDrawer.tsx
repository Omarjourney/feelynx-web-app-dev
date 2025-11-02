import { useState, useEffect } from 'react';
import { Settings, Languages, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const SettingsDrawer = () => {
  const [language, setLanguage] = useState('EN');
  const [experienceTheme, setExperienceTheme] = useState<'vibe' | 'midnight' | 'electric'>('vibe');
  const [brightness, setBrightness] = useState(1);
  const [fontScale, setFontScale] = useState(1);

  useEffect(() => {
    const storedLanguage =
      localStorage.getItem('feelynx.language') || localStorage.getItem('ivibes.language');
    const storedTheme =
      localStorage.getItem('feelynx.experienceTheme') ||
      localStorage.getItem('ivibes.experienceTheme');
    const storedBrightness =
      localStorage.getItem('feelynx.brightness') || localStorage.getItem('ivibes.brightness');
    const storedFontScale =
      localStorage.getItem('feelynx.fontScale') || localStorage.getItem('ivibes.fontScale');

    if (storedLanguage) setLanguage(storedLanguage);
    if (storedTheme === 'midnight' || storedTheme === 'electric') setExperienceTheme(storedTheme);
    if (storedBrightness) setBrightness(Number(storedBrightness));
    if (storedFontScale) setFontScale(Number(storedFontScale));
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty('--app-brightness', brightness.toFixed(2));
    localStorage.setItem('feelynx.brightness', brightness.toString());
  }, [brightness]);

  useEffect(() => {
    document.documentElement.style.setProperty('--app-font-scale', fontScale.toFixed(2));
    localStorage.setItem('feelynx.fontScale', fontScale.toString());
  }, [fontScale]);

  useEffect(() => {
    if (experienceTheme === 'vibe') {
      document.documentElement.removeAttribute('data-experience-theme');
    } else {
      document.documentElement.setAttribute('data-experience-theme', experienceTheme);
    }
    localStorage.setItem('feelynx.experienceTheme', experienceTheme);
  }, [experienceTheme]);

  useEffect(() => {
    localStorage.setItem('feelynx.language', language);
  }, [language]);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 text-white/80 hover:text-white"
          aria-label="Open settings"
          tabIndex={0}
        >
          <Settings className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent className="glass-card border-l border-white/10 bg-black/80 backdrop-blur-xl">
        <SheetHeader>
          <SheetTitle className="text-xl font-semibold text-white">Settings</SheetTitle>
          <SheetDescription className="text-sm text-white/70">
            Customize your Feelynx experience
          </SheetDescription>
        </SheetHeader>

        <div className="mt-8 space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs uppercase tracking-widest text-white/70">
              <span>Language</span>
              <Languages className="h-4 w-4" />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="secondary"
                  className="w-full justify-between glass-card border border-white/10"
                  tabIndex={0}
                >
                  <span className="flex items-center gap-2 text-sm font-semibold">
                    {language}
                    <span className="text-xs text-white/60">Localized</span>
                  </span>
                  <Menu className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-44 glass-card border border-white/10 bg-black/80 backdrop-blur-xl">
                <DropdownMenuLabel className="text-white/70">Select language</DropdownMenuLabel>
                <DropdownMenuRadioGroup
                  value={language}
                  onValueChange={(value) => setLanguage(value)}
                >
                  {['EN', 'ES', 'PT', 'FR'].map((lng) => (
                    <DropdownMenuRadioItem
                      key={lng}
                      value={lng}
                      className="text-white hover:bg-white/10"
                    >
                      {lng === 'EN' && 'English'}
                      {lng === 'ES' && 'Español'}
                      {lng === 'PT' && 'Português'}
                      {lng === 'FR' && 'Français'}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-white/70">
              <span>Brightness</span>
              <span>{Math.round(brightness * 100)}%</span>
            </div>
            <Slider
              value={[brightness]}
              min={0.6}
              max={1.2}
              step={0.05}
              onValueChange={([value]) => setBrightness(Number(value.toFixed(2)))}
              className="focus:ring-2 focus:ring-primary"
              aria-label="Adjust brightness"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-white/70">
              <span>Font size</span>
              <span>{Math.round(fontScale * 100)}%</span>
            </div>
            <Slider
              value={[fontScale]}
              min={0.9}
              max={1.3}
              step={0.05}
              onValueChange={([value]) => setFontScale(Number(value.toFixed(2)))}
              className="focus:ring-2 focus:ring-primary"
              aria-label="Adjust font size"
            />
          </div>

          <div className="space-y-2">
            <div className="text-xs uppercase tracking-widest text-white/70">Theme</div>
            <div className="flex gap-2">
              {[
                { id: 'vibe', label: 'Vibe' },
                { id: 'midnight', label: 'Midnight' },
                { id: 'electric', label: 'Electric' },
              ].map((theme) => (
                <Button
                  key={theme.id}
                  variant={experienceTheme === theme.id ? 'default' : 'secondary'}
                  size="sm"
                  className="flex-1"
                  onClick={() => setExperienceTheme(theme.id as typeof experienceTheme)}
                  tabIndex={0}
                >
                  {theme.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
