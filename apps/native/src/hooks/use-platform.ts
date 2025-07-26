import { useState, useEffect } from 'react';
import { platform as getPlatform } from '@tauri-apps/plugin-os';

export type Platform = 'windows' | 'macos' | 'linux' | 'ios' | 'android';
export type PlatformCategory = 'desktop' | 'mobile';

interface UsePlatformReturn {
  platform: Platform | null;
  category: PlatformCategory | null;
  isLoading: boolean;
  isDesktop: boolean;
  isMobile: boolean;
  isWindows: boolean;
  isMacOS: boolean;
  isLinux: boolean;
  isIOS: boolean;
  isAndroid: boolean;
}

export function usePlatform(): UsePlatformReturn {
  const [platform, setPlatform] = useState<Platform | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function detectPlatform() {
      try {
        const tauriPlatform = await getPlatform();
        setPlatform(tauriPlatform as Platform);
      } catch (error) {
        console.error('Failed to detect platform:', error);
      } finally {
        setIsLoading(false);
      }
    }

    detectPlatform();
  }, []);

  // Kategorien
  const category: PlatformCategory | null = platform
    ? ['ios', 'android'].includes(platform) ? 'mobile' : 'desktop'
    : null;

  return {
    platform,
    category,
    isLoading,
    // Convenience Booleans
    isDesktop: category === 'desktop',
    isMobile: category === 'mobile',
    isWindows: platform === 'windows',
    isMacOS: platform === 'macos',
    isLinux: platform === 'linux',
    isIOS: platform === 'ios',
    isAndroid: platform === 'android',
  };
}

// Utility Funktionen für plattformspezifische Logik
export function getPlatformSpecific<T>(options: {
  desktop?: T;
  mobile?: T;
  windows?: T;
  macos?: T;
  linux?: T;
  ios?: T;
  android?: T;
  default: T;
}, platform: Platform | null): T {
  if (!platform) return options.default;

  // Zuerst spezifische Plattform prüfen
  if (platform in options && options[platform as keyof typeof options] !== undefined) {
    return options[platform as keyof typeof options] as T;
  }

  // Dann Kategorie prüfen
  const category = ['ios', 'android'].includes(platform) ? 'mobile' : 'desktop';
  
  if (category in options && options[category as keyof typeof options] !== undefined) {
    return options[category as keyof typeof options] as T;
  }

  return options.default;
}