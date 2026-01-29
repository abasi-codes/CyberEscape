import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        cyber: {
          bg: '#0a0e1a',
          surface: '#111827',
          card: '#1a2236',
          border: '#2a3550',
          primary: '#00d4ff',
          'primary-dim': '#0088aa',
          accent: '#00ff88',
          'accent-dim': '#00aa5c',
          warning: '#ffaa00',
          danger: '#ff3355',
          text: '#e2e8f0',
          muted: '#8892a8',
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'scan-line': 'scan-line 3s linear infinite',
        'float': 'float 3s ease-in-out infinite',
        'particle-drift': 'particle-drift 20s linear infinite',
        'glitch-r': 'glitch-r 0.3s ease-in-out',
        'glitch-b': 'glitch-b 0.3s ease-in-out',
        'shake': 'shake 0.5s ease-in-out',
        'pulse-urgent': 'pulse-urgent 1s ease-in-out infinite',
        'score-pop': 'score-pop 0.6s ease-out',
        'streak-fire': 'streak-fire 0.5s ease-out infinite',
        'confetti-fall': 'confetti-fall 3s ease-out forwards',
        'vignette-pulse': 'vignette-pulse 2s ease-in-out infinite',
        'warning-flash': 'warning-flash 0.5s ease-in-out',
        'typewriter': 'typewriter 2s steps(40) forwards',
        'blink-caret': 'blink-caret 0.75s step-end infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 5px rgba(0, 212, 255, 0.3)' },
          '50%': { boxShadow: '0 0 20px rgba(0, 212, 255, 0.6)' },
        },
        'scan-line': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'particle-drift': {
          '0%': { transform: 'translateY(100vh) translateX(0)', opacity: '0' },
          '10%': { opacity: '0.4' },
          '90%': { opacity: '0.4' },
          '100%': { transform: 'translateY(-100vh) translateX(50px)', opacity: '0' },
        },
        'glitch-r': {
          '0%, 100%': { transform: 'translateX(0)', opacity: '0' },
          '20%, 80%': { transform: 'translateX(2px)', opacity: '0.3' },
          '50%': { transform: 'translateX(-2px)', opacity: '0.5' },
        },
        'glitch-b': {
          '0%, 100%': { transform: 'translateX(0)', opacity: '0' },
          '20%, 80%': { transform: 'translateX(-2px)', opacity: '0.3' },
          '50%': { transform: 'translateX(2px)', opacity: '0.5' },
        },
        'shake': {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-4px)' },
          '20%, 40%, 60%, 80%': { transform: 'translateX(4px)' },
        },
        'pulse-urgent': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.7', transform: 'scale(1.05)' },
        },
        'score-pop': {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.3)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'streak-fire': {
          '0%, 100%': { transform: 'scale(1) rotate(-2deg)' },
          '50%': { transform: 'scale(1.1) rotate(2deg)' },
        },
        'confetti-fall': {
          '0%': { transform: 'translateY(-100%) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'translateY(100vh) rotate(720deg)', opacity: '0' },
        },
        'vignette-pulse': {
          '0%, 100%': { opacity: '0.7' },
          '50%': { opacity: '1' },
        },
        'warning-flash': {
          '0%, 100%': { opacity: '0' },
          '50%': { opacity: '0.3' },
        },
        'typewriter': {
          'from': { width: '0' },
          'to': { width: '100%' },
        },
        'blink-caret': {
          'from, to': { borderColor: 'transparent' },
          '50%': { borderColor: 'currentColor' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
