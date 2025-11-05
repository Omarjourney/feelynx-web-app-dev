import { useEffect } from 'react';
import { useTheme } from 'next-themes';
import { applyMoodToDocument } from '../../ai/emotion/uiMoodAdapter';
import { useLiveBlueprintStore } from '@/stores/useLiveBlueprintStore';

/**
 * AutoThemeController applies a time-of-day theme when the user
 * has selected automatic mode. It also listens for storage changes
 * to respond to updates from other tabs.
 */
const AutoThemeController = () => {
  const { setTheme } = useTheme();
  const emotionState = useLiveBlueprintStore((state) => state.emotionState);

  useEffect(() => {
    let timer: number | undefined;

    const apply = () => {
      try {
        const mode =
          localStorage.getItem('feelynx:themeMode') || localStorage.getItem('ivibes:themeMode');
        if (mode !== 'auto') return;
        const hours = new Date().getHours();
        const preferred = hours >= 7 && hours < 19 ? 'light' : 'dark';
        setTheme(preferred);
        localStorage.setItem('theme', preferred);
      } catch {
        // ignore
      }
    };

    const schedule = () => {
      // Re-apply every 10 minutes to handle crossing boundaries
      timer = window.setInterval(apply, 10 * 60 * 1000) as unknown as number;
    };

    apply();
    schedule();

    const onStorage = (e: StorageEvent) => {
      if (e.key === 'feelynx:themeMode' || e.key === 'ivibes:themeMode' || e.key === 'theme') {
        apply();
      }
    };
    window.addEventListener('storage', onStorage);

    return () => {
      if (timer) window.clearInterval(timer);
      window.removeEventListener('storage', onStorage);
    };
  }, [setTheme]);

  useEffect(() => {
    applyMoodToDocument(emotionState);
  }, [emotionState]);

  return null;
};

export default AutoThemeController;
