import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
      },
      borderRadius: {
        'xs': 'var(--radius-xs)',    // 2px
        'sm': 'var(--radius-sm)',    // 4px
        'md': 'var(--radius-md)',    // 6px
        'lg': 'var(--radius-lg)',    // 8px
        'xl': 'var(--radius-xl)',    // 12px
        '2xl': 'var(--radius-2xl)',  // 16px
        'full': 'var(--radius-full)', // 9999px
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
        "fade-in": {
          "0%": {
            opacity: "0",
            transform: "translateY(10px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
      },
      fontSize: {
        'xs': ['var(--text-xs)', { lineHeight: 'var(--text-xs-line)' }],
        'sm': ['var(--text-sm)', { lineHeight: 'var(--text-sm-line)' }],
        'base': ['var(--text-base)', { lineHeight: 'var(--text-base-line)' }],
        'lg': ['var(--text-lg)', { lineHeight: 'var(--text-lg-line)' }],
        'xl': ['var(--text-xl)', { lineHeight: 'var(--text-xl-line)' }],
        '2xl': ['var(--text-2xl)', { lineHeight: 'var(--text-2xl-line)' }],
        '3xl': ['var(--text-3xl)', { lineHeight: 'var(--text-3xl-line)' }],
        '4xl': ['var(--text-4xl)', { lineHeight: 'var(--text-4xl-line)' }],
        'h1': ['var(--heading-1)', { lineHeight: 'var(--heading-1-line)', fontWeight: 'var(--heading-1-weight)' }],
        'h2': ['var(--heading-2)', { lineHeight: 'var(--heading-2-line)', fontWeight: 'var(--heading-2-weight)' }],
        'h3': ['var(--heading-3)', { lineHeight: 'var(--heading-3-line)', fontWeight: 'var(--heading-3-weight)' }],
        'h4': ['var(--heading-4)', { lineHeight: 'var(--heading-4-line)', fontWeight: 'var(--heading-4-weight)' }],
      },
      spacing: {
        '1': 'var(--space-1)',     // 0.25rem / 4px
        '2': 'var(--space-2)',     // 0.5rem / 8px
        '3': 'var(--space-3)',     // 0.75rem / 12px
        '4': 'var(--space-4)',     // 1rem / 16px
        '5': 'var(--space-5)',     // 1.25rem / 20px
        '6': 'var(--space-6)',     // 1.5rem / 24px
        '8': 'var(--space-8)',     // 2rem / 32px
        '10': 'var(--space-10)',   // 2.5rem / 40px
        '12': 'var(--space-12)',   // 3rem / 48px
        '16': 'var(--space-16)',   // 4rem / 64px
        '20': 'var(--space-20)',   // 5rem / 80px
        '24': 'var(--space-24)',   // 6rem / 96px
      },

      boxShadow: {
        'xs': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        'sm': 'var(--shadow-sm)',
        'md': 'var(--shadow-md)',
        'lg': 'var(--shadow-lg)',
        'xl': 'var(--shadow-xl)',
        '2xl': 'var(--shadow-2xl)',
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.3s ease-out",
      },
      screens: {
        'xs': '475px',
      },
    },
  },
  plugins: [tailwindcssAnimate],
} satisfies Config;
