import type { Config } from 'tailwindcss';
import animate from 'tailwindcss-animate';

export default {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
    './stories/**/*.{ts,tsx,js,jsx}',
  ],
  prefix: '',
  theme: {
    screens: {
      sm: '480px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    },
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '1.5rem',
        lg: '2rem',
      },
      screens: {
        sm: '480px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1536px',
      },
    },
    extend: {
      // Base facelift tokens
      transitionTimingFunction: {
        soft: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      transitionDuration: {
        DEFAULT: '250ms',
      },
      spacing: {
        'section-sm': '2rem',
        'section-md': '4rem',
        'section-lg': '6rem',
      },
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        surface: {
          DEFAULT: 'rgba(255,255,255,0.05)',
          elevated: 'rgba(255,255,255,0.08)',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
          glow: 'hsl(var(--primary-glow))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        feelynx: {
          pink: 'var(--feelynx-pink)',
          cyan: 'var(--feelynx-cyan)',
          ink: 'var(--feelynx-ink)',
          outline: 'var(--feelynx-outline)',
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))',
        },
        live: {
          DEFAULT: 'hsl(var(--live-indicator))',
        },
      },
      backgroundImage: {
        'gradient-primary': 'var(--gradient-primary)',
        'gradient-card': 'var(--gradient-card)',
        'gradient-border': 'var(--gradient-border)',
        'gradient-glow': 'var(--gradient-glow)',
      },
      boxShadow: {
        premium: 'var(--shadow-premium)',
        glow: 'var(--shadow-glow)',
        'glow-strong': '0 0 45px rgba(159, 47, 255, 0.4)',
        // Facelift additions
        base: '0 2px 12px rgba(0,0,0,0.25)',
        elevated: '0 8px 24px rgba(147,51,234,0.20)',
      },
      backdropBlur: {
        // Facelift additions
        xs: '2px',
        sm: '4px',
        md: '8px',
        xl: '28px',
        '2xl': '40px',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        // Facelift additions
        card: '16px',
        button: '12px',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      keyframes: {
        'accordion-down': {
          from: {
            height: '0',
          },
          to: {
            height: 'var(--radix-accordion-content-height)',
          },
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)',
          },
          to: {
            height: '0',
          },
        },
        'glow-pulse': {
          '0%, 100%': {
            boxShadow: '0 0 0 0 hsl(var(--primary) / 0.6)',
          },
          '50%': {
            boxShadow: '0 0 35px 12px hsl(var(--primary) / 0.3)',
          },
        },
        'pulse-ring': {
          '0%': {
            boxShadow: '0 0 0 0 rgba(233, 51, 139, 0.6)',
          },
          '70%': {
            boxShadow: '0 0 0 18px rgba(233, 51, 139, 0)',
          },
          '100%': {
            boxShadow: '0 0 0 0 rgba(233, 51, 139, 0)',
          },
        },
        'feed-fade-in': {
          '0%': {
            opacity: '0',
            transform: 'translateY(28px) scale(0.98)',
          },
          '60%': {
            opacity: '1',
            transform: 'translateY(0) scale(1.02)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0) scale(1)',
          },
        },
        'reaction-float': {
          '0%': {
            transform: 'translateY(0px)',
            opacity: '1',
          },
          '100%': {
            transform: 'translateY(-120px)',
            opacity: '0',
          },
        },
        'swipe-bounce': {
          '0%, 100%': {
            transform: 'translateX(0)',
          },
          '50%': {
            transform: 'translateX(14px)',
          },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'glow-pulse': 'glow-pulse 2.6s ease-in-out infinite',
        'pulse-ring': 'pulse-ring 2.4s ease-out infinite',
        'feed-fade-in': 'feed-fade-in 0.55s ease-out both',
        'reaction-float': 'reaction-float 2.4s ease-in forwards',
        'swipe-bounce': 'swipe-bounce 1.4s ease-in-out infinite',
      },
    },
  },
  plugins: [animate],
} satisfies Config;
