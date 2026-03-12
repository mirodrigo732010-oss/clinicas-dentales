'use client';

import { motion } from 'framer-motion';
import { Heart, Shield, Music, Sparkles } from 'lucide-react';
import { useIntersectionObserver } from '@/hooks/use-intersection-observer';
import { useElenaStore, ContextSection } from '@/lib/store/elena-store';
import { useEffect } from 'react';

const benefits = [
  {
    icon: Heart,
    title: 'Atención Empática',
    description: 'Entendemos el miedo al dentista. Nuestro equipo está especialmente entrenado para hacer sentir cómodos a los pacientes ansiosos.',
  },
  {
    icon: Shield,
    title: 'Máxima Seguridad',
    description: 'Protocolos estrictos de esterilización y los más altos estándares de higiene en cada procedimiento.',
  },
  {
    icon: Music,
    title: 'Ambiente Relajante',
    description: 'Música personalizada, aromaterapia y un ambiente diseñado como un spa para tu máxima comodidad.',
  },
  {
    icon: Sparkles,
    title: 'Resultados Naturales',
    description: 'Trabajamos para que tu sonrisa luzca natural y armoniosa, nunca artificial.',
  },
];

export function ExperienceSection() {
  const { ref, isIntersecting } = useIntersectionObserver<HTMLElement>({
    threshold: 0.3,
  });
  
  const setCurrentSection = useElenaStore((state) => state.setCurrentSection);

  useEffect(() => {
    if (isIntersecting) {
      setCurrentSection('experiencia' as ContextSection);
    }
  }, [isIntersecting, setCurrentSection]);

  return (
    <section
      ref={ref}
      id="experiencia"
      className="py-20 md:py-32 bg-gradient-to-br from-[#F5F5F5] to-white overflow-hidden"
    >
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Image Side */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="relative">
              {/* Main image */}
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1629909615184-74f495363b67?w=800&q=80"
                  alt="Experiencia dental relajada"
                  className="w-full h-[500px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0077B6]/30 to-transparent" />
              </div>
              
              {/* Floating card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="absolute -bottom-6 -right-6 bg-white rounded-xl shadow-xl p-6 max-w-[250px]"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Heart className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">98%</div>
                    <div className="text-xs text-gray-500">Sin ansiedad</div>
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  De nuestros pacientes reportan una experiencia sin estrés
                </p>
              </motion.div>
              
              {/* Decorative element */}
              <div className="absolute -top-6 -left-6 w-24 h-24 bg-[#0077B6]/10 rounded-full -z-10" />
              <div className="absolute -bottom-12 left-12 w-40 h-40 bg-[#00a8e8]/10 rounded-full -z-10" />
            </div>
          </motion.div>

          {/* Content Side */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-block px-4 py-2 bg-[#0077B6]/10 text-[#0077B6] rounded-full text-sm font-medium mb-4">
              Nuestra Experiencia
            </span>
            
            <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Olvídate del Miedo
              <span className="block text-[#0077B6]">al Dentista</span>
            </h2>
            
            <p className="text-gray-600 text-lg mb-8 leading-relaxed">
              Sabemos que visitar al dentista puede generar ansiedad. Por eso hemos creado 
              un ambiente diseñado para tu bienestar, donde cada detalle está pensado para 
              que te sientas relajado y cuidado.
            </p>

            {/* Benefits Grid */}
            <div className="grid sm:grid-cols-2 gap-6">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className="flex gap-4"
                >
                  <div className="flex-shrink-0 w-12 h-12 bg-[#0077B6]/10 rounded-lg flex items-center justify-center">
                    <benefit.icon className="w-6 h-6 text-[#0077B6]" />
                  </div>
                  <div>
                    <h3 className="font-heading font-semibold text-gray-900 mb-1">
                      {benefit.title}
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {benefit.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
