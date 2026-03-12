import { useEffect, useRef } from 'react';
import { useElenaStore } from '@/lib/store/elena-store';

export function useElenaVisibility() {
  const tecnologiaRef = useRef<HTMLElement | null>(null);
  const tratamientosRef = useRef<HTMLElement | null>(null);
  
  const setVisible = useElenaStore((state) => state.setVisible);

  useEffect(() => {
    const handleScroll = () => {
      const tecnologiaSection = document.getElementById('tecnologia');
      const tratamientosSection = document.getElementById('tratamientos');
      
      if (!tecnologiaSection && !tratamientosSection) return;
      
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      
      // Get section positions
      const tecnologiaTop = tecnologiaSection?.offsetTop || 0;
      const tratamientosTop = tratamientosSection?.offsetTop || 0;
      
      // Show widget when user reaches tecnologia or tratamientos section
      const shouldShow = 
        scrollY + windowHeight * 0.5 >= tecnologiaTop ||
        scrollY + windowHeight * 0.5 >= tratamientosTop;
      
      setVisible(shouldShow);
    };

    // Initial check
    handleScroll();
    
    // Add scroll listener
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [setVisible]);
  
  return { tecnologiaRef, tratamientosRef };
}
