'use client';

import { motion } from 'framer-motion';
import { Scan, Zap, Radiation, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useIntersectionObserver } from '@/hooks/use-intersection-observer';
import { useElenaStore, ContextSection } from '@/lib/store/elena-store';
import { useEffect } from 'react';

const technologies = [
  {
    icon: Scan,
    title: 'Escáner 3D',
    subtitle: 'Diagnóstico Preciso',
    description: 'Obtén un modelo digital 3D de tu boca en minutos. Sin molestias, sin esperas, con precisión milimétrica.',
    features: ['Resultados inmediatos', 'Sin radiación', 'Modelo 3D interactivo'],
    color: 'from-[#0077B6] to-[#00a8e8]',
  },
  {
    icon: Zap,
    title: 'Láser Dental',
    subtitle: 'Tratamientos Sin Dolor',
    description: 'Tecnología láser de última generación para tratamientos más rápidos, precisos y prácticamente indoloros.',
    features: ['Recuperación rápida', 'Sin puntos', 'Mínima inflamación'],
    color: 'from-[#00a8e8] to-[#48cae4]',
  },
  {
    icon: Radiation,
    title: 'Radiografía Digital',
    subtitle: '90% Menos Radiación',
    description: 'Radiografías digitales de alta resolución con una fracción de la radiación tradicional.',
    features: ['Resultados instantáneos', 'Alta definición', 'Eco-friendly'],
    color: 'from-[#005a8c] to-[#0077B6]',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
    },
  },
};

export function TechnologySection() {
  const { ref, isIntersecting } = useIntersectionObserver<HTMLElement>({
    threshold: 0.3,
  });
  
  const setCurrentSection = useElenaStore((state) => state.setCurrentSection);

  useEffect(() => {
    if (isIntersecting) {
      setCurrentSection('tecnologia' as ContextSection);
    }
  }, [isIntersecting, setCurrentSection]);

  return (
    <section
      ref={ref}
      id="tecnologia"
      className="py-20 md:py-32 bg-gradient-to-b from-white to-[#F5F5F5]"
    >
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="inline-block px-4 py-2 bg-[#0077B6]/10 text-[#0077B6] rounded-full text-sm font-medium mb-4">
            Tecnología de Vanguardia
          </span>
          <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Equipos de Última Generación
          </h2>
          <p className="text-gray-600 text-lg">
            Invertimos en la mejor tecnología para garantizar diagnósticos precisos 
            y tratamientos más cómodos para ti.
          </p>
        </motion.div>

        {/* Technology Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-3 gap-6 lg:gap-8"
        >
          {technologies.map((tech, index) => (
            <motion.div key={tech.title} variants={itemVariants}>
              <Card className="group h-full bg-white border-0 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden">
                <CardContent className="p-0">
                  {/* Icon header */}
                  <div className={`bg-gradient-to-br ${tech.color} p-8 text-white`}>
                    <tech.icon className="w-16 h-16 mb-4 group-hover:scale-110 transition-transform duration-300" />
                    <h3 className="font-heading text-2xl font-bold mb-1">{tech.title}</h3>
                    <p className="text-white/80 text-sm">{tech.subtitle}</p>
                  </div>
                  
                  {/* Content */}
                  <div className="p-6">
                    <p className="text-gray-600 mb-4">{tech.description}</p>
                    <ul className="space-y-2">
                      {tech.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-2 text-sm text-gray-700">
                          <div className="w-1.5 h-1.5 bg-[#0077B6] rounded-full" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <button className="mt-6 text-[#0077B6] font-medium flex items-center gap-2 group/btn hover:gap-3 transition-all">
                      Saber más <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
