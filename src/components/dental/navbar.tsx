'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Phone, MapPin, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface NavbarProps {
  onBookAppointment?: () => void;
}

const navLinks = [
  { href: '#hero', label: 'Inicio' },
  { href: '#tecnologia', label: 'Tecnología' },
  { href: '#tratamientos', label: 'Tratamientos' },
  { href: '#experiencia', label: 'Experiencia' },
  { href: '#testimonios', label: 'Testimonios' },
];

export function Navbar({ onBookAppointment }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {/* Top bar */}
      <div className="bg-[#0077B6] text-white py-2 text-sm hidden md:block">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              55 1748 9261
            </span>
            <span className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Jacarandas 54, Tlalnepantla, Edo. Méx.
            </span>
          </div>
          <span className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Lun-Vie: 9:00-20:00 | Sáb: 9:00-14:00
          </span>
        </div>
      </div>

      {/* Main navbar */}
      <motion.nav
        className={cn(
          'sticky top-0 z-50 transition-all duration-300',
          isScrolled
            ? 'bg-white/90 backdrop-blur-md shadow-lg'
            : 'bg-white'
        )}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <a href="#hero" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-[#0077B6] rounded-lg flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="white" className="w-6 h-6">
                  <path d="M12 2C9.5 2 7.5 4 7.5 6.5C7.5 7.5 7.8 8.4 8.3 9.2C6.5 10.5 5.5 12.6 5.5 15C5.5 18.6 8.4 22 12 22C15.6 22 18.5 18.6 18.5 15C18.5 12.6 17.5 10.5 15.7 9.2C16.2 8.4 16.5 7.5 16.5 6.5C16.5 4 14.5 2 12 2ZM12 4C13.4 4 14.5 5.1 14.5 6.5C14.5 7.9 13.4 9 12 9C10.6 9 9.5 7.9 9.5 6.5C9.5 5.1 10.6 4 12 4ZM12 20C9.5 20 7.5 17.5 7.5 15C7.5 12.5 9.5 10 12 10C14.5 10 16.5 12.5 16.5 15C16.5 17.5 14.5 20 12 20Z"/>
                </svg>
              </div>
              <div>
                <span className="font-heading font-bold text-xl text-[#0077B6]">Sonrisa Perfecta</span>
                <span className="hidden sm:block text-xs text-gray-500">Clínica Dental Premium</span>
              </div>
            </a>

            {/* Desktop navigation */}
            <div className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-gray-700 hover:text-[#0077B6] transition-colors font-medium"
                >
                  {link.label}
                </a>
              ))}
            </div>

            {/* CTA Button */}
            <div className="hidden lg:block">
              <Button 
                onClick={onBookAppointment}
                className="bg-[#0077B6] hover:bg-[#005a8c] text-white"
              >
                Agendar Cita
              </Button>
            </div>

            {/* Mobile menu button */}
            <button
              className="lg:hidden p-2 text-gray-700"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden bg-white border-t"
            >
              <div className="container mx-auto px-4 py-4">
                <div className="flex flex-col gap-4">
                  {navLinks.map((link) => (
                    <a
                      key={link.href}
                      href={link.href}
                      className="text-gray-700 hover:text-[#0077B6] transition-colors font-medium py-2"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {link.label}
                    </a>
                  ))}
                  <Button 
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onBookAppointment?.();
                    }}
                    className="bg-[#0077B6] hover:bg-[#005a8c] text-white w-full"
                  >
                    Agendar Cita
                  </Button>
                  <div className="text-sm text-gray-500 space-y-2 pt-4 border-t">
                    <p className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      55 1748 9261
                    </p>
                    <p className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Jacarandas 54, Tlalnepantla
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </>
  );
}
