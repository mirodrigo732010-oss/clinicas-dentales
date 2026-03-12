'use client';

import { useElenaVisibility } from '@/hooks/use-elena-visibility';
import { ElenaWidget } from '@/components/elena/elena-widget';

export function ElenaWrapper() {
  // Initialize visibility tracking
  useElenaVisibility();
  
  return <ElenaWidget />;
}
