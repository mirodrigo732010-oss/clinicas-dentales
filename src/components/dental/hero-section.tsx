'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ChevronDown, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeroSectionProps {
  onBookAppointment?: () => void;
}

export function HeroSection({ onBookAppointment }: HeroSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  const videoUrl = 'https://assets.mixkit.co/videos/preview/mixkit-dentist-examining-a-patients-teeth-42636-large.mp4';

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Video Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70 z-10" />
        <motion.div style={{ y }} className="absolute inset-0">
          <video
            autoPlay
            muted
            loop
            playsInline
            onLoadedData={() => setIsVideoLoaded(true)}
            className="w-full h-full object-cover"
            poster="https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=1920&q=80"
          >
            <source src={videoUrl} type="video/mp4" />
          </video>
        </motion.div>
      </div>

      {/* Content */}
      <motion.div
        style={{ opacity }}
        className="relative z-20 container mx-auto px-4 text-center text-white"
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-4xl mx-auto"
        >
          <span className="inline-block px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium mb-6 border border-white/20">
            ✨ Clínica Dental Premium en Madrid
          </span>
          
          <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            Tu Sonrisa Perfecta
            <span className="block text-[#00a8e8]">Comienza Aquí</span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-200 mb-8 max-w-2xl mx-auto leading-relaxed">
            Tecnología de vanguardia, profesionales expertos y un ambiente diseñado 
            para que tu visita al dentista sea una experiencia relajante.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              size="lg"
              onClick={onBookAppointment}
              className="bg-[#0077B6] hover:bg-[#005a8c] text-white px-8 py-6 text-lg rounded-full shadow-lg shadow-[#0077B6]/30"
            >
              Agendar Cita Gratuita
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="bg-transparent border-white/50 text-white hover:bg-white/10 px-8 py-6 text-lg rounded-full"
            >
              <Play className="w-5 h-5 mr-2" />
              Ver Video
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-12 pt-12 border-t border-white/20 max-w-2xl mx-auto">
            <div>
              <div className="text-3xl md:text-4xl font-bold text-[#00a8e8]">2000+</div>
              <div className="text-sm text-gray-300">Pacientes Felices</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-[#00a8e8]">15+</div>
              <div className="text-sm text-gray-300">Años de Experiencia</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-[#00a8e8]">4.9</div>
              <div className="text-sm text-gray-300">Calificación ★★★★★</div>
            </div>
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex flex-col items-center text-white/70"
          >
            <span className="text-sm mb-2">Descubre más</span>
            <ChevronDown className="w-6 h-6" />
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}
