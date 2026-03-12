'use client';

import { cn } from '@/lib/utils';

interface SoundWaveProps {
  isActive?: boolean;
  className?: string;
  color?: string;
}

export function SoundWave({ isActive = false, className, color = '#0077B6' }: SoundWaveProps) {
  return (
    <div className={cn('flex items-center justify-center gap-1 h-6', className)}>
      {[1, 2, 3, 4, 5].map((bar) => (
        <div
          key={bar}
          className={cn(
            'w-1 rounded-full transition-all duration-150',
            isActive ? 'sound-wave-bar' : ''
          )}
          style={{
            backgroundColor: color,
            height: isActive ? undefined : '8px',
            animationDelay: `${bar * 0.1}s`,
          }}
        />
      ))}
    </div>
  );
}
