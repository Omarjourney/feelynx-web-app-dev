export interface EnterpriseTheme {
  id: string;
  name: string;
  palette: {
    background: string;
    foreground: string;
    primary: string;
    secondary: string;
    accent: string;
    success: string;
    warning: string;
    danger: string;
  };
  typography: {
    headingFont: string;
    bodyFont: string;
  };
  surface: {
    level0: string;
    level1: string;
    level2: string;
  };
}

export const enterpriseThemes: EnterpriseTheme[] = [
  {
    id: 'feelynx-default',
    name: 'Feelynx Enterprise',
    palette: {
      background: '#07090d',
      foreground: '#eef2ff',
      primary: '#6366f1',
      secondary: '#14b8a6',
      accent: '#fbbf24',
      success: '#22c55e',
      warning: '#f59e0b',
      danger: '#ef4444',
    },
    typography: {
      headingFont: 'Space Grotesk, sans-serif',
      bodyFont: 'Inter, sans-serif',
    },
    surface: {
      level0: '#05070a',
      level1: '#101322',
      level2: '#171c2f',
    },
  },
  {
    id: 'solar-flares',
    name: 'Solar Flares',
    palette: {
      background: '#0f172a',
      foreground: '#f8fafc',
      primary: '#f97316',
      secondary: '#fb7185',
      accent: '#38bdf8',
      success: '#34d399',
      warning: '#fde047',
      danger: '#f43f5e',
    },
    typography: {
      headingFont: 'Sora, sans-serif',
      bodyFont: 'DM Sans, sans-serif',
    },
    surface: {
      level0: '#020617',
      level1: '#111827',
      level2: '#1f2937',
    },
  },
];

export function resolveTheme(themeId: string): EnterpriseTheme {
  return enterpriseThemes.find((theme) => theme.id === themeId) ?? enterpriseThemes[0];
}
