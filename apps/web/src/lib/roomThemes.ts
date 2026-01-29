import type { AmbientType } from '@/lib/audio/AudioManager';

export interface RoomTheme {
  accentColor: string;
  bgGradient: string;
  borderGlow: string;
  particleColor: string;
  ambientSound: AmbientType;
}

// Map room types/names to visual themes
const roomThemes: Record<string, RoomTheme> = {
  // Password/Authentication themed rooms
  'password-auth': {
    accentColor: 'cyber-primary',
    bgGradient: 'from-cyber-bg via-cyber-surface to-cyber-bg',
    borderGlow: 'shadow-[0_0_20px_rgba(0,212,255,0.3)]',
    particleColor: 'cyber-primary',
    ambientSound: 'terminal-hum',
  },

  // Phishing/Email themed rooms
  'phishing': {
    accentColor: 'cyber-warning',
    bgGradient: 'from-cyber-bg via-amber-950/10 to-cyber-bg',
    borderGlow: 'shadow-[0_0_20px_rgba(255,170,0,0.3)]',
    particleColor: 'cyber-warning',
    ambientSound: 'email-office',
  },

  // Network security themed rooms
  'network-security': {
    accentColor: 'cyber-accent',
    bgGradient: 'from-cyber-bg via-emerald-950/10 to-cyber-bg',
    borderGlow: 'shadow-[0_0_20px_rgba(0,255,136,0.3)]',
    particleColor: 'cyber-accent',
    ambientSound: 'network-buzz',
  },

  // Incident response themed rooms
  'incident-response': {
    accentColor: 'cyber-danger',
    bgGradient: 'from-cyber-bg via-red-950/10 to-cyber-bg',
    borderGlow: 'shadow-[0_0_20px_rgba(255,51,85,0.3)]',
    particleColor: 'cyber-danger',
    ambientSound: 'alert-room',
  },

  // Data protection themed rooms
  'data-protection': {
    accentColor: 'cyber-primary',
    bgGradient: 'from-cyber-bg via-blue-950/10 to-cyber-bg',
    borderGlow: 'shadow-[0_0_20px_rgba(0,136,170,0.3)]',
    particleColor: 'cyber-primary-dim',
    ambientSound: 'data-center',
  },

  // Insider threat themed rooms
  'insider-threat': {
    accentColor: 'purple-400',
    bgGradient: 'from-cyber-bg via-purple-950/10 to-cyber-bg',
    borderGlow: 'shadow-[0_0_20px_rgba(168,85,247,0.3)]',
    particleColor: 'purple-400',
    ambientSound: 'quiet-tension',
  },

  // Default theme
  'default': {
    accentColor: 'cyber-primary',
    bgGradient: 'from-cyber-bg via-cyber-surface to-cyber-bg',
    borderGlow: 'shadow-[0_0_15px_rgba(0,212,255,0.2)]',
    particleColor: 'cyber-primary',
    ambientSound: 'cyber-loop',
  },
};

export function getRoomTheme(roomName: string): RoomTheme {
  const lowerName = roomName.toLowerCase();

  // Match by keywords in room name
  if (lowerName.includes('password') || lowerName.includes('auth')) {
    return roomThemes['password-auth'];
  }
  if (lowerName.includes('phishing') || lowerName.includes('email')) {
    return roomThemes['phishing'];
  }
  if (lowerName.includes('network') || lowerName.includes('firewall')) {
    return roomThemes['network-security'];
  }
  if (lowerName.includes('incident') || lowerName.includes('breach') || lowerName.includes('response')) {
    return roomThemes['incident-response'];
  }
  if (lowerName.includes('data') || lowerName.includes('privacy') || lowerName.includes('protect')) {
    return roomThemes['data-protection'];
  }
  if (lowerName.includes('insider') || lowerName.includes('threat')) {
    return roomThemes['insider-threat'];
  }

  return roomThemes['default'];
}

export function getRoomThemeByType(roomType: string): RoomTheme {
  return roomThemes[roomType] || roomThemes['default'];
}
